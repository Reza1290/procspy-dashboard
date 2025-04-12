'use client'
import ChatBox from "../../../ui/ChatBox";
import { useSideBarLog } from "../../../providers/SideBarLogProvider";
import { useEffect, useRef, useState } from "react";
import UserDetails from "../../../ui/UserDetails";
import { usePathname } from "next/navigation";
import io from 'socket.io-client'

export default function Page() {
    const { data, setData } = useSideBarLog()
    const handleToggleSidebarLog = () => {
        setData((prev) => {

            return {
                isActive: !prev.isActive,
                consumer: [],
            }
        })
    }

    useEffect(() => {
        handleToggleSidebarLog()
    }, [])


    const pathname = usePathname()
    const pathParts = pathname.split('/')
    const roomCode = pathParts[pathParts.length - 2]
    const producerId = pathParts[pathParts.length - 1]

    const socketRef = useRef(null)
    const deviceRef = useRef(null)

    const [videoConsumers, setVideoConsumers] = useState([])

    useEffect(() => {
        socketRef.current = io('https://192.168.2.7/mediasoup')

        socketRef.current.on('connection-success', () => {
            joinRoomConsumer()
        })

        socketRef.current.on('producer-closed', ({ remoteProducerId }) => {
            setVideoConsumers(prev => prev.filter(c => c.producerId !== remoteProducerId))
        })

        return () => {
            socketRef.current.disconnect()
        }
    }, [])

    const joinRoomConsumer = () => {
        socketRef.current.emit('joinRoom', { roomCode, isAdmin: true }, (data) => {
            createDeviceConsumer(data.rtpCapabilities)
        })
    }

    const createDeviceConsumer = async (rtpCapabilities) => {
        const device = new mediasoupClient.Device()
        await device.load({ routerRtpCapabilities: rtpCapabilities })
        deviceRef.current = device
        consumeProducer(producerId)
    }

    const consumeProducer = async (producerId) => {
        socketRef.current.emit('createWebRtcTransport', { consumer: true }, async ({ params }) => {
            if (params.error) {
                console.error(params.error)
                return
            }

            const consumerTransport = deviceRef.current.createRecvTransport(params)

            consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                try {
                    await socketRef.current.emit('transport-recv-connect', {
                        dtlsParameters,
                        serverConsumerTransportId: params.id,
                    })
                    callback()
                } catch (err) {
                    errback(err)
                }
            })

            socketRef.current.emit('consume', {
                rtpCapabilities: deviceRef.current.rtpCapabilities,
                remoteProducerId: producerId,
                serverConsumerTransportId: params.id,
            }, async ({ params: consumeParams }) => {
                if (consumeParams.error) {
                    console.error('Cannot consume:', consumeParams.error)
                    return
                }

                const consumer = await consumerTransport.consume({
                    id: consumeParams.id,
                    producerId: consumeParams.producerId,
                    kind: consumeParams.kind,
                    rtpParameters: consumeParams.rtpParameters,
                    appData: consumeParams.appData
                })

                setVideoConsumers([{
                    consumer,
                    kind: consumeParams.kind,
                    producerId: consumeParams.producerId,
                    socketId: consumeParams.appData.socketId,
                }])

                socketRef.current.emit('consumer-resume', {
                    serverConsumerId: consumeParams.serverConsumerId,
                })
            })
        })
    }

    return (
        <div className="grid grid-rows-3 grid-cols-4 w-full gap-6 max-h-screen overflow-hidden">
            <div className="grid row-span-2 col-span-3 gap-6 m-8">
                <div className="col-span-3 border aspect-video rounded-lg border-white/10 bg-white/10 w-11/12">
                </div>

            </div>
            <div className="mt-8 mr-8 row-span-2">
                <div className="mx-4 border border-white/10 p-4 h-full rounded-lg ">
                    <ChatBox></ChatBox>
                </div>
            </div>
            <div className=" row-start-3 col-start-1 col-span-4 flex m-8 mt-0 gap-8">
                <div className="aspect-square border border-white/10 bg-white/10 rounded-lg h-full"></div>
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
                    <div className="border border-white/10 bg-white/10 aspect-square rounded-lg cursor-pointer hover:border-transparent flex justify-center items-center p-2 max-w-16" >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className={`fill-white aspect-square ${'hidden'}`}>
                            {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
                            <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L472.1 344.7c15.2-26 23.9-56.3 23.9-88.7l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 21.2-5.1 41.1-14.2 58.7L416 300.8 416 96c0-53-43-96-96-96s-96 43-96 96l0 54.3L38.8 5.1zM344 430.4c20.4-2.8 39.7-9.1 57.3-18.2l-43.1-33.9C346.1 382 333.3 384 320 384c-70.7 0-128-57.3-128-128l0-8.7L144.7 210c-.5 1.9-.7 3.9-.7 6l0 40c0 89.1 66.2 162.7 152 174.4l0 33.6-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l72 0 72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-33.6z" /></svg>

                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className={`fill-white aspect-square`}>
                            {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
                            <path d="M192 0C139 0 96 43 96 96l0 160c0 53 43 96 96 96s96-43 96-96l0-160c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 89.1 66.2 162.7 152 174.4l0 33.6-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l72 0 72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-33.6c85.8-11.7 152-85.3 152-174.4l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 70.7-57.3 128-128 128s-128-57.3-128-128l0-40z" /></svg>
                    </div>
                    <div className="aspect-square bg-white/10 w-12 max-h-12 p-3 rounded-lg flex ">
                        <div className="w-full max-h-12 fill-white">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z" /></svg>
                        </div>
                    </div>

                </div>
                <UserDetails></UserDetails>

            </div>

        </div>
    );
}