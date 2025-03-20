import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useSideBarLog } from "../../providers/SideBarLogProvider"

const VideoContainer = ({ consumer }) => {
    const {data, setData } = useSideBarLog()
    const router = useRouter()

    const videoRef = useRef(null)
    const camRef = useRef(null)
    const audioRef = useRef(null)
    const micRef = useRef(null)

    const [audioMute, setAudioMute] = useState(true)
    const [micMute, setMicMute] = useState(true)
    const [sideBarLog, setSideBarLog] = useState(false)

    useEffect(() => {
        if (consumer && consumer.consumers) {
            prepareConsume(consumer)
        }
        console.log('run')
    }, [consumer])

    const prepareConsume = (consumer) => {
        consumer.consumers.forEach(element => {
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

    // Ensure user interaction enables autoplay
    // useEffect(() => {
    //     const enableAutoplay = () => {
    //         videoRef.current?.play()
    //         audioRef.current?.play()
    //         camRef.current?.play()
    //         micRef.current?.play()
    //     }
    //     document.addEventListener("click", enableAutoplay, { once: true })
    // }, [])
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

    const handleToggleSidebarLog = () => {
        setData((prev) => {
            
            return {
                isActive: !prev.isActive,
                consumer: [...consumer.consumers],
            }
        })
    }

    



    return (
        <div className="flex">
            <div className="relative z-10 flex flex-col justify-between bg-black border border-white/10 rounded-xl p-3">
                <div className="flex justify-between gap-3 w-full">
                    <div className="aspect-video bg-black rounded-lg border w-3/4 border-white/10 overflow-hidden relative">
                        <video autoPlay ref={videoRef} playsInline></video>
                        <div className='absolute mt-1 bottom-2 left-3 text-xs'>
                            <div className="">
                                <h1 className='font-medium bg-slate-600/50 px-2 py-0.5 rounded text-slate-100'>#id-{consumer.socketId}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col w-1/4 gap-4">
                        <div className="group aspect-square bg-black rounded-lg border border-white/10 overflow-hidden cursor-ne-resize">
                            <video autoPlay ref={camRef} playsInline onDoubleClick={() => camRef.current.requestFullscreen()}></video>
                            <span className="group-hover:block hidden absolute text-[0.6rem] -top-8 z-100 bg-black/10 p-1 rounded-lg border border-white/10">Double Click to Fullscreen</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex p-2 border border-white/10 rounded">
                                <div className="flex space-x-1 items-end">
                                    <div className="w-1 h-2 bg-green-300 rounded"></div>
                                    <div className="w-1 h-3 bg-green-400 rounded"></div>
                                    <div className="w-1 h-4 bg-red-500 rounded"></div>
                                </div>
                                <p className='text-xs ml-2'>120 ms</p>
                            </div>
                            <div className="flex p-2 border border-white/10 rounded">
                                {/* <div className=""> */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="aspect-square fill-red-400 max-w-4">
                                    {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
                                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" /></svg>
                                {/* </div> */}
                                <p className='text-xs ml-2 truncate'>2 New Flags</p>
                            </div>
                        </div>
                        <audio ref={audioRef}></audio>
                        <audio ref={micRef}></audio>
                    </div>
                </div>
            </div>
            <div className="-ml-3 bg-black/15 p-3 pl-6 w-72 bg-black/1 z-0 border gap-4 border-white/10 border-l-0 rounded-r-xl grid grid-rows-4">
                <p className="border border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16" onClick={toggleMic}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className={`fill-white aspect-square ${!micMute && 'hidden'}`}>
                        {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
                        <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L472.1 344.7c15.2-26 23.9-56.3 23.9-88.7l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 21.2-5.1 41.1-14.2 58.7L416 300.8 416 96c0-53-43-96-96-96s-96 43-96 96l0 54.3L38.8 5.1zM344 430.4c20.4-2.8 39.7-9.1 57.3-18.2l-43.1-33.9C346.1 382 333.3 384 320 384c-70.7 0-128-57.3-128-128l0-8.7L144.7 210c-.5 1.9-.7 3.9-.7 6l0 40c0 89.1 66.2 162.7 152 174.4l0 33.6-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l72 0 72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-33.6z" /></svg>

                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className={`fill-white aspect-square ${micMute && 'hidden'}`}>
                        {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
                        <path d="M192 0C139 0 96 43 96 96l0 160c0 53 43 96 96 96s96-43 96-96l0-160c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 89.1 66.2 162.7 152 174.4l0 33.6-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l72 0 72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-33.6c85.8-11.7 152-85.3 152-174.4l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 70.7-57.3 128-128 128s-128-57.3-128-128l0-40z" /></svg>
                </p>
                <p className="border border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16" onClick={toggleAudio}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className={`fill-white aspect-square ${audioMute && 'hidden'}`}>
                        {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
                        <path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z" /></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className={`fill-white aspect-square ${!audioMute && 'hidden'}`}>
                        {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
                        <path d="M301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM425 167l55 55 55-55c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-55 55 55 55c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-55-55-55 55c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l55-55-55-55c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z" /></svg>

                </p>
                <p className="border border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16" onClick={handleToggleSidebarLog}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={`fill-white aspect-square`}>
                        {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
                        <path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32L0 64 0 368 0 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30l0-247.7c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48l0-16z" /></svg>
                </p>
                <a href="/1" className="border border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16" onClick={() => router.push('/dashboard/room/2/1')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={`fill-white aspect-square`}>
                        {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
                        <path d="M344 0L488 0c13.3 0 24 10.7 24 24l0 144c0 9.7-5.8 18.5-14.8 22.2s-19.3 1.7-26.2-5.2l-39-39-87 87c-9.4 9.4-24.6 9.4-33.9 0l-32-32c-9.4-9.4-9.4-24.6 0-33.9l87-87L327 41c-6.9-6.9-8.9-17.2-5.2-26.2S334.3 0 344 0zM168 512L24 512c-13.3 0-24-10.7-24-24L0 344c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2l39 39 87-87c9.4-9.4 24.6-9.4 33.9 0l32 32c9.4 9.4 9.4 24.6 0 33.9l-87 87 39 39c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8z" /></svg>
                </a>
            </div>
        </div>
    )
}

export default VideoContainer
