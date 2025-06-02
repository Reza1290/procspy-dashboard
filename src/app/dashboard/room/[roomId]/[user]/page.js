'use client'
import ChatBox from "../../../ui/ChatBox";
import { useSideBarLog } from "../../../providers/SideBarLogProvider";
import { useEffect, useRef, useState } from "react";
import UserDetails from "../../../ui/UserDetails";
import { usePathname, useRouter } from "next/navigation";
import io from 'socket.io-client'
import * as mediasoupClient from 'mediasoup-client'


export default function Page() {
    const { data, setData } = useSideBarLog()

    const pathname = usePathname()

    const socketRef = useRef(null)
    const consumingTransports = useRef([])
    const deviceRef = useRef(null)
    const router = useRouter()

    const pathParts = pathname.split('/')
    const roomId = pathParts[pathParts.length - 2]
    const socketId = pathParts[pathParts.length - 1]
    const [socketIds, setSocketIds] = useState([])
    const [consumerTransports, setConsumerTransports] = useState([])
    const [rtpCapabilities, setRtpCapabilities] = useState(null)

    const videoRef = useRef(null)
    const camRef = useRef(null)
    const audioRef = useRef(null)
    const micRef = useRef(null)

    const [audioMute, setAudioMute] = useState(true)
    const [micMute, setMicMute] = useState(true)

    const handleToggleSidebarLog = () => {
        setData((prev) => {

            return {
                isActive: true,
                consumer: [...prev.consumer],
            }
        })
    }

    const dataRef = useRef(data)


    const [messages, setMessages] = useState([])
    
    useEffect(() => {
        if (!socketRef.current) {
        socketRef.current = io(`${ process.env.NEXT_PUBLIC_SOCKET_URL || 'https://192.168.2.5'}/mediasoup`)

        socketRef.current.on('connection-success', ({ socketId }) => {
            console.log(`Connected: ${socketId}`)
            joinRoomConsumer()
        })

        socketRef.current.on('producer-closed', handleProducerClosed)
        
        socketRef.current.on('SERVER_DASHBOARD_PRIVATE_MESSAGE', (message) => {
            setMessages((prev) => [...prev, {
                from: "user",
                text: message.body
            }]);
        })

        socketRef.current.on('SERVER_DASHBOARD_LOG_MESSAGE', (message) => {
            const currentData = dataRef.current

            console.log(message)
            console.log(currentData)

            if (currentData.isActive && currentData.token === message.token) {
                console.log('true')
                setData((prev) => ({
                    ...prev,
                    refreshKey: (prev.refreshKey || 0) + 1,
                }))
            }
        })}

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [])

    useEffect(() => {
        if (consumerTransports && consumerTransports.length > 0) {
            prepareConsume(consumerTransports)
        }

        console.log(consumerTransports)
    }, [consumerTransports]);

    const joinRoomConsumer = () => {
        const currentSocket = socketRef.current
        socketRef.current.emit('joinRoom', { roomId, isAdmin: true, socketId: currentSocket.id }, (data) => {
            setRtpCapabilities(data.rtpCapabilities)
            createDeviceConsumer(data.rtpCapabilities)
        })
    }

    const createDeviceConsumer = async (rtpCapabilities) => {
        try {
            const newDevice = new mediasoupClient.Device()
            await newDevice.load({ routerRtpCapabilities: rtpCapabilities })
            deviceRef.current = newDevice
            getSingleUserProducer()
        } catch (error) {
            console.error('error device creation', error)
        }
    }

    const consumeConsumerTransport = async (remoteProducerId) => {
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

            socketRef.current.emit('consumer-resume', { serverConsumerId: params.serverConsumerId })
        })
    }

    const getSingleUserProducer = () => {
        socketRef.current.emit('getSingleUserProducers', socketId, (producerIds) => {
            producerIds.forEach(consumeConsumerTransport);

        });


    }

    const handleProducerClosed = ({ remoteProducerId }) => {
        setConsumerTransports((prev) => prev.filter((t) => t.producerId !== remoteProducerId))

        router.push('/dashboard/room/' + roomId)
    }
    const prepareConsume = (consumers) => {
        console.log(consumers)
        consumers.forEach(element => {
            const name = element.appData?.name
            const track = element.consumer.track

            if (!track || !(track instanceof MediaStreamTrack)) {
                console.error(`Invalid MediaStreamTrack for ${name}:`, track)
                return
            }

            if (track.readyState === "ended") {
                console.warn(`Track for ${name} has ended`)
                return
            }

            console.log(`Assigning track for ${name}:`, track)

            const stream = new MediaStream([track])

            switch (name) {
                case 'video':
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream
                        // videoRef.current.muted = true  
                        // videoRef.current.play().then(() => {
                        //     videoRef.current.muted = false  
                        // }).catch(err => console.error("Autoplay blocked:", err))
                    }
                    break

                case 'audio':
                    if (audioRef.current) {
                        audioRef.current.srcObject = stream
                        audioRef.current.autoPlay = true
                        audioRef.current.muted = false
                        // audioRef.current.play().catch(err => console.error("Autoplay blocked:", err))
                    }
                    break

                case 'cam':
                    if (camRef.current) {
                        camRef.current.srcObject = stream
                        // camRef.current.muted = true
                        // camRef.current.play().then(() => {
                        //     camRef.current.muted = false
                        // }).catch(err => console.error("Autoplay blocked:", err))
                    }
                    break

                case 'mic':
                    if (micRef.current) {
                        micRef.current.srcObject = stream
                        micRef.current.autoPlay = true
                        micRef.current.muted = false
                        // micRef.current.play().catch(err => console.error("Autoplay blocked:", err))
                    }
                    break

                default:
                    console.warn(`Unknown media type: ${name}`)
            }
        })
    }

    const toggleAudio = () => {
        setAudioMute((prev) => {
            const newMuteState = !prev
            if (audioRef.current) {
                audioRef.current.muted = newMuteState
                if (!newMuteState) {
                    audioRef.current.play().catch(err => console.error("Autoplay blocked:", err))
                }
            }
            console.log('Audio toggled:', newMuteState ? 'Muted' : 'Unmuted')
            return newMuteState
        })
    }

    const toggleMic = () => {
        setMicMute((prev) => {
            const newMuteState = !prev
            if (micRef.current) {
                micRef.current.muted = newMuteState
                if (!newMuteState) {
                    micRef.current.play().catch(err => console.error("Autoplay blocked:", err))
                }
            }
            console.log('Mic toggled:', newMuteState ? 'Muted' : 'Unmuted')
            return newMuteState
        })
    }

    const handleSendMessage = (text) => {
        const newMessage = { from: "you", text };
        const currentData = dataRef.current
        setMessages((prev) => [...prev, newMessage]);
        console.log(currentData)
        socketRef.current.emit("DASHBOARD_SERVER_MESSAGE", {
            data :{
                token: currentData.token,
                roomId: roomId,
                body: text
            }
        })
    };

    return (
        <div className="grid grid-rows-3 grid-cols-4 w-full gap-6 max-h-screen overflow-hidden ">
            <div className="grid row-span-2 col-span-3 gap-6 m-8 ">
                <div className="col-span-3 border aspect-video rounded-lg border-white/10 bg-white/10 w-11/12">
                    <video autoPlay ref={videoRef} playsInline></video>
                </div>

            </div>
            <div className="mt-8 mr-8 row-span-2">
                <div className="ml-4 borde h-full rounded-lg ">
                    <ChatBox user={{
                        name: "test"
                    }} messages={messages} onSendMessage={handleSendMessage} />
                </div>
            </div>
            <div className=" row-start-3 col-start-1 col-span-4 flex m-8 mt-0 gap-8">
                <div className="aspect-square border border-white/10 bg-white/10 rounded-lg h-full flex ">
                    <video autoPlay ref={camRef} playsInline></video>
                </div>
                <div className="flex flex-col justify-between">
                    <div className="aspect-square bg-white/10 w-12 max-h-12 p-3 rounded-lg flex ">
                        <div className="w-full max-h-12 fill-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-full mx-auto w-full" viewBox="0 0 192 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z" /></svg>

                        </div>
                    </div>
                    <div className="aspect-square bg-white/10 w-12 max-h-12 p-3 rounded-lg flex ">
                        <div className="w-full max-h-12 fill-white">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" /></svg>
                        </div>
                    </div>
                    <div onClick={toggleMic} className="border border-white/10 bg-white/10 aspect-square rounded-lg cursor-pointer hover:border-transparent flex justify-center items-center p-2 max-w-16" >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className={`fill-white aspect-square ${!micMute ? 'hidden' : ''}`}>
                            {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
                            <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L472.1 344.7c15.2-26 23.9-56.3 23.9-88.7l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 21.2-5.1 41.1-14.2 58.7L416 300.8 416 96c0-53-43-96-96-96s-96 43-96 96l0 54.3L38.8 5.1zM344 430.4c20.4-2.8 39.7-9.1 57.3-18.2l-43.1-33.9C346.1 382 333.3 384 320 384c-70.7 0-128-57.3-128-128l0-8.7L144.7 210c-.5 1.9-.7 3.9-.7 6l0 40c0 89.1 66.2 162.7 152 174.4l0 33.6-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l72 0 72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-33.6z" /></svg>

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className={`fill-white aspect-square ${micMute ? 'hidden' : ''}`}>
                            {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
                            <path d="M192 0C139 0 96 43 96 96l0 160c0 53 43 96 96 96s96-43 96-96l0-160c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 89.1 66.2 162.7 152 174.4l0 33.6-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l72 0 72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-33.6c85.8-11.7 152-85.3 152-174.4l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 70.7-57.3 128-128 128s-128-57.3-128-128l0-40z" /></svg>
                    </div>
                    <div className="border border-white/10 bg-white/10 aspect-square rounded-lg flex justify-center hover:border-transparent items-center p-2 max-w-16" onClick={toggleAudio}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className={`fill-white aspect-square ${audioMute && 'hidden'}`}>
                            {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
                            <path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z" /></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className={`fill-white aspect-square ${!audioMute && 'hidden'}`}>
                            {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
                            <path d="M301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z" /></svg>

                    </div>

                </div>
                <audio ref={audioRef}></audio>
                <audio ref={micRef}></audio>
                <UserDetails></UserDetails>

            </div>

        </div>
    );
}