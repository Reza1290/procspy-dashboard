'use client'

import { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import * as mediasoupClient from 'mediasoup-client'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import VideoContainer from '../ui/VideoContainer'

const Page = () => {
    const pathname = usePathname()
    const router = useRouter()
    const roomCode = pathname.split('/').slice(-1)[0]
    const socketRef = useRef(null)
    const localVideoRef = useRef(null)

    const [videoElements, setVideoElements] = useState({})
    const [cameraElements, setCameraElements] = useState({})
    const [audioElements, setAudioElements] = useState({})
    const [micElements, setMicElements] = useState({})

    const [socketIds, setSocketIds] = useState([])


    const deviceRef = useRef(null)
    const [producerTransport, setProducerTransport] = useState(null)
    const [consumerTransports, setConsumerTransports] = useState([])
    const [rtpCapabilities, setRtpCapabilities] = useState(null)
    const [audioProducer, setAudioProducer] = useState(null)
    const [videoProducer, setVideoProducer] = useState(null)
    const consumingTransports = useRef([])
    const [producerIds, setProducerIds] = useState([])
    const [isReady, setIsReady] = useState(false)
    useEffect(() => {
        socketRef.current = io('https://192.168.2.7/mediasoup')
        socketRef.current.on('connection-success', ({ socketId }) => {
            console.log(`Connected: ${socketId}`)
            // getLocalStream()
            joinRoomConsumer()
            
        })
        socketRef.current.on('new-producer', ({ producerId }) => signalNewConsumerTransport(producerId))
        socketRef.current.on('producer-closed', handleProducerClosed)
        socketRef.current.on('server-log-message', ({ message }) => {
            console.log(message)

        })


        return () => socketRef.current.disconnect()
    }, [])

   

    const getLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: { width: { min: 640, max: 1920 }, height: { min: 400, max: 1080 } }
            })
            if (localVideoRef.current) localVideoRef.current.srcObject = stream
            joinRoom(stream)
        } catch (error) {
            console.error('Error getting local stream:', error)
        }
    }

    const joinRoomConsumer = () => {
        socketRef.current.emit('joinRoom', { roomCode, isAdmin: true, socketId: socketRef.current.id }, (data) => {
            setRtpCapabilities(data.rtpCapabilities)
            createDeviceConsumer(data.rtpCapabilities)
        })
    }

    const joinRoom = (stream) => {
        socketRef.current.emit('joinRoom', { roomCode }, (data) => {
            setRtpCapabilities(data.rtpCapabilities)
            createDevice(data.rtpCapabilities, stream)
        })
    }

    const createDeviceConsumer = async (rtpCapabilities) => {
        try {
            const newDevice = new mediasoupClient.Device()
            await newDevice.load({ routerRtpCapabilities: rtpCapabilities })
            deviceRef.current = newDevice
            // createSendTransportConsumer(newDevice)
            getProducers()
        } catch (error) {
            console.error('error device creation', error)
        }
    }

    const createSendTransportConsumer = (device) => {
        socketRef.current.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
            if (params.error) {
                console.error(params.error)
                return
            }
            const transport = device.createSendTransport(params)
            transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                try {
                    await socketRef.current.emit('transport-connect', { dtlsParameters })
                    callback()
                } catch (error) {
                    errback(error)
                }
            })
            transport.on('produce', async (parameters, callback, errback) => {
                try {
                    await socketRef.current.emit('transport-produce', {
                        kind: parameters.kind,
                        rtpParameters: parameters.rtpParameters,
                        appData: parameters.appData,
                    }, ({ id, producersExist }) => {
                        callback({ id })

                        if (producersExist) getProducers()
                        console.log('exists', producersExist)
                    })
                } catch (error) {
                    errback(error)
                }
            })
            setProducerTransport(transport)
        })
    }

    const createDevice = async (rtpCapabilities, stream) => {
        try {
            const newDevice = new mediasoupClient.Device()
            await newDevice.load({ routerRtpCapabilities: rtpCapabilities })
            deviceRef.current = newDevice
            createSendTransport(newDevice, stream)
        } catch (error) {
            console.error('Error creating device:', error)
        }
    }

    const createSendTransport = (device, stream) => {
        socketRef.current.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
            if (params.error) {
                console.error(params.error)
                return
            }
            const transport = device.createSendTransport(params)
            transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                try {
                    await socketRef.current.emit('transport-connect', { dtlsParameters })
                    callback()
                } catch (error) {
                    errback(error)
                }
            })
            transport.on('produce', async (parameters, callback, errback) => {
                try {
                    await socketRef.current.emit('transport-produce', {
                        kind: parameters.kind,
                        rtpParameters: parameters.rtpParameters,
                        appData: parameters.appData,
                    }, ({ id, producersExist }) => {
                        callback({ id })

                        if (producersExist) getProducers()
                    })
                } catch (error) {
                    errback(error)
                }
            })
            setProducerTransport(transport)
            connectSendTransport(transport, stream)
        })
    }



    const connectSendTransport = async (transport, stream) => {
        const audio = await transport.produce({ track: stream.getAudioTracks()[0] })
        const video = await transport.produce({ track: stream.getVideoTracks()[0] })
        setAudioProducer(audio)
        setVideoProducer(video)
    }

    const signalNewConsumerTransport = async (remoteProducerId) => {
        if (consumingTransports.current.includes(remoteProducerId)) return
        consumingTransports.current.push(remoteProducerId)
        socketRef.current.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
            if (params.error) {
                console.log(params.error)
                return
            }
            let consumerTransport
            try {
                consumerTransport = deviceRef.current.createRecvTransport(params)
            } catch (error) {
                console.log(error)
                return
            }
            consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
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

    const connectRecvTransport = async (consumerTransport, remoteProducerId, serverConsumerTransportId) => {
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


            setConsumerTransports((prev) => [...prev, { consumerTransport, serverConsumerTransportId: params.id, producerId: remoteProducerId, consumer, appData: params.appData }])

            const socketId = params.appData.socketId

            setSocketIds((prev) => {
                const consumerData = { 
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
                    return [...prev, { socketId, consumers: [consumerData] }]
                }
            })
        console.table(socketIds)
            

            
            
            // addMediaElement(params, consumer)
            // const mediaElement = document.createElement(params.kind === 'audio' ? 'audio' : 'video')
            // mediaElement.srcObject = new MediaStream([consumer.track])
            // mediaElement.autoplay = true
            // // mediaElement.playsInline = true

            // if (params.kind === 'audio') {
            //     if (params.appData.name === 'audio') {

            //         mediaElement.setAttribute('id', `audio-${remoteProducerId}`)
            //     } else {
            //         mediaElement.setAttribute('id', `audio-mic-${remoteProducerId}`)

            //     }
            // } else {
            //     if (params.appData.name === 'video') {

            //         mediaElement.setAttribute('id', `video-${remoteProducerId}`)
            //     } else {

            //         mediaElement.setAttribute('id', `video-cam-${remoteProducerId}`)
            //     }
            // }

            // if (remoteVideoContainerRef.current && (params.appData.name === 'audio' || params.appData.name === 'video')) {
            //     remoteVideoContainerRef.current[params.appData.socketId].appendChild(mediaElement)

            //     // remoteCameraContainerRef.current.appendChild(mediaElement)
            // } else if (remoteCameraContainerRef.current && (params.appData.name === 'mic' || params.appData.name === 'camera')) {
            //     remoteCameraContainerRef.current[params.appData.socketId].appendChild(mediaElement)
            //     console.log('naruh')
            // }

            // console.log(remoteCameraContainerRef)
            // setProducerIds(oldArray => [...oldArray, remoteProducerId])



            socketRef.current.emit('consumer-resume', { serverConsumerId: params.serverConsumerId })
        })
    }

    const getProducers = () => {
        socketRef.current.emit('getProducers', producerIds => {
            console.log(producerIds)
            producerIds.forEach(signalNewConsumerTransport)
        })
    }
    const handleProducerClosed = ({ remoteProducerId }) => {
        setConsumerTransports((prev) => prev.filter((t) => t.producerId !== remoteProducerId))

        setSocketIds((prev) => {
            return prev
                .map(entry => ({
                    ...entry,
                    consumers: entry.consumers.filter(consumer => consumer.producerId !== remoteProducerId)
                }))
                .filter(entry => entry.consumers.length > 0) 
        })
    }

    return (
        <div>
            <h1 className='font-medium'>Room {roomCode}</h1>
            <div className='my-4 grid sm:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4'>
                {socketIds.map((consumer, id) => (
                    <VideoContainer
                        key={id}
                        consumer={consumer}
                    />
                ))}

            </div>
        </div>
    )
}

export default Page
