'use client'

import { createContext, createRef, Ref, RefObject, useContext, useEffect, useRef, useState } from 'react'
import io, { Socket } from 'socket.io-client'
import * as mediasoupClient from 'mediasoup-client'
import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters'
import { AppData, Consumer, Transport } from 'mediasoup-client/lib/types'
import { EventEmitter } from 'events'


export interface WebRtcData {
    roomId: string | null
    singleConsumerSocketId: string | null
}

interface DefaultWebRtc {
    data: WebRtcData
    peers: Array<Peer>
    eventRef: RefObject<EventEmitter>
    setData: React.Dispatch<React.SetStateAction<WebRtcData>>
    setNotificationCount: React.Dispatch<React.SetStateAction<Array<NotificationCount>>>
    notificationCount: Array<NotificationCount>
    socketRef: RefObject<Socket>
}

interface SocketAuthData {
    roomId: string
    isAdmin: boolean
    socketId: string
}

const defaultWebRtc: DefaultWebRtc = {
    data: {
        roomId: null,
        singleConsumerSocketId: null,
    },
    peers: [],
    eventRef: createRef<EventEmitter>(),
    setData: () => { },
    setNotificationCount: () => { },
    notificationCount: [],
    socketRef: createRef<Socket>()
}

export interface Peer {
    socketId: string
    token: string
    consumers: Array<ConsumerData>
}

export interface ConsumerData {
    consumerTransport: Transport
    serverConsumerTransportId: string
    producerId: string
    consumer: Consumer
    appData: AppData
}

interface NotificationCount {
    count: number
    token: string
}

interface NotificationData {
    roomId: string
    token: string
}

const WebRtcContext = createContext(defaultWebRtc)

export const WebRtcProvider = ({ children }) => {
    const [data, setData] = useState<WebRtcData>({
        roomId: null,
        singleConsumerSocketId: null
    })

    const socketRef = useRef<Socket>(null)
    const deviceRef = useRef(null)
    const eventRef = useRef(new EventEmitter())

    const consumingTransportsRef = useRef([])
    const consumerTransportsRef = useRef([])

    const peersRef = useRef<Array<Peer>>([])

    const [peers, setPeers] = useState<Array<Peer>>([])
    const [notificationCount, setNotificationCount] = useState<Array<NotificationCount>>([])

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL + '/mediasoup', {
                auth: {
                    secretAdmin: "SECRETBANGET"
                }
            })

            socketRef.current.on('connection-success', ({ socketId }) => {
                joinRoomConsumer()
            })

            if (data.singleConsumerSocketId === null) {
                socketRef.current.on('new-producer', ({ producerId }) => signalNewConsumerTransport(producerId))
            }
            socketRef.current.on('producer-closed', handleProducerClosed)
            // socketRef.current.on('SERVER_DASHBOARD_PRIVATE_MESSAGE', (message :any) => {
            //     console.log(message)
            // })

            socketRef.current.on('SERVER_DASHBOARD_LOG_MESSAGE', (message: NotificationData) => {
                setNotificationCount(prev => {
                    const existingIndex = prev.findIndex(n => n.token === message.token);
                    if (existingIndex !== -1) {
                        const updated = [...prev];
                        updated[existingIndex] = {
                            token: message.token,
                            count: updated[existingIndex].count + 1
                        };
                        return updated;
                    } else {
                        return [...prev, { token: message.token, count: 1 }];
                    }
                })
            });

        }

        

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
                consumingTransportsRef.current = []
                setPeers([])
            }
        }
    }, [data.singleConsumerSocketId, data.roomId])

    const joinRoomConsumer = () => {
        const currentSocket = socketRef.current
        socketRef.current.emit('joinRoom', { roomId: data.roomId, isAdmin: true, socketId: currentSocket.id }, ({ rtpCapabilities }) => {
            createDeviceConsumer(rtpCapabilities)
        })
    }

    const createDeviceConsumer = async (rtpCapabilities: RtpCapabilities) => {
        try {
            const newDevice = new mediasoupClient.Device()
            await newDevice.load({ routerRtpCapabilities: rtpCapabilities })
            deviceRef.current = newDevice
            if (data.singleConsumerSocketId !== null) {
                getSingleUserProducer()
            } else {
                getProducers()
            }
        } catch (error) {
            console.error('error device creation', error)
        }
    }

    const signalNewConsumerTransport = async (remoteProducerId: string) => {
        console.log("Someone Joined", consumingTransportsRef.current)
        if (consumingTransportsRef.current.includes(remoteProducerId)) return

        consumingTransportsRef.current.push(remoteProducerId)
        socketRef.current.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
            if (params.error) {
                console.log(params.error)
                return
            }
            let consumerTransport: Transport
            try {
                consumerTransport = deviceRef.current.createRecvTransport(params)
            } catch (error) {
                console.log(error)
                return
            }
            consumerTransport.on('connect', async ({ dtlsParameters }, callback: any, errback: any) => {
                try {
                    await socketRef.current.emit('transport-recv-connect', { dtlsParameters, serverConsumerTransportId: params.id })
                    callback()
                } catch (error) {
                    errback(error)
                }
            })
            connectRecvTransport(consumerTransport, remoteProducerId, params.id)
        })
    }

    const connectRecvTransport = async (consumerTransport: Transport, remoteProducerId: string, serverConsumerTransportId: string) => {
        socketRef.current.emit('consume', {
            rtpCapabilities: deviceRef.current.rtpCapabilities,
            remoteProducerId,
            serverConsumerTransportId,
        }, async ({ params }) => {
            if (params.error) {
                console.log('Cannot Consume', params.error)
                return
            }
            console.log('test')
            const consumer = await consumerTransport.consume({
                id: params.id,
                producerId: params.producerId,
                kind: params.kind,
                rtpParameters: params.rtpParameters,
                appData: params.appData
            })

            const socketId = params.appData.socketId
            const token = params.appData.token



            // const existingPeerIndex = peersRef.current.findIndex(peer => peer.socketId === socketId);

            setPeers((prev) => {
                const consumerData: ConsumerData = {
                    consumerTransport,
                    serverConsumerTransportId: params.id,
                    producerId: remoteProducerId,
                    consumer,
                    appData: params.appData
                }

                const existingEntry = prev.find(entry => entry.socketId === socketId)

                if (existingEntry) {
                    return prev.map(entry =>
                        entry.socketId === socketId
                            ? { ...entry, consumers: [...entry.consumers, consumerData] }
                            : entry
                    )
                } else {
                    return [...prev, { token, socketId, consumers: [consumerData] }]
                }
            })


            // if (existingPeerIndex !== -1) {
            //     peersRef.current[existingPeerIndex].consumers.push(consumerData);
            // } else {
            //     peersRef.current.push({
            //         token,
            //         socketId,
            //         consumers: [consumerData]
            //     });
            // }




            socketRef.current.emit('consumer-resume', { serverConsumerId: params.serverConsumerId })
        })
    }

    const getProducers = () => {
        socketRef.current.emit('getProducers', (producerIds: Array<string>) => {
            console.log(producerIds)
            producerIds.forEach(signalNewConsumerTransport)
        })

        eventRef.current.emit('consumer-added')

    }

    const getSingleUserProducer = () => {
        socketRef.current.emit('getSingleUserProducers', data.singleConsumerSocketId, (producerIds: Array<string>) => {
            producerIds.forEach(signalNewConsumerTransport);
        });
    }

    const handleProducerClosed = ({ remoteProducerId }) => {

        // peersRef.current = peersRef.current.map(entry => ({
        //     ...entry,
        //     consumers: entry.consumers.filter((consumer) => consumer.producerId !== remoteProducerId)
        // })).filter(entry => entry.consumers.length > 0)
        eventRef.current.emit('consumer-removed', remoteProducerId)
        setPeers((prev) => {
            let changed = false;

            const next = prev
                .map(entry => {
                    const newConsumers = entry.consumers.filter(
                        consumer => consumer.producerId !== remoteProducerId
                    );

                    if (newConsumers.length !== entry.consumers.length) {
                        changed = true;
                        return { ...entry, consumers: newConsumers };
                    }

                    return entry;
                })
                .filter(entry => {

                    const keep = entry.consumers.length > 0;
                    if (!keep) changed = true;
                    return keep;
                });

            return changed ? next : prev;
        });

    }



    const value = { data, setData, eventRef, peers, notificationCount, setNotificationCount, socketRef }

    return (
        <WebRtcContext.Provider value={value} >
            {children}
        </WebRtcContext.Provider>
    )
}

export const useWebRtc = () => useContext(WebRtcContext)