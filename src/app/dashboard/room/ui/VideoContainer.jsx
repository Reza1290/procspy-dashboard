import { useEffect, useRef, useState } from "react"

const VideoContainer = ({ consumer }) => {
    const videoRef = useRef(null)
    const camRef = useRef(null)
    const audioRef = useRef(null)
    const micRef = useRef(null)

    const [audioMute, setAudioMute] = useState(true)
    const [micMute, setMicMute] = useState(true)

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



    return (
        <div className="relative flex flex-col justify-between bg-black/15 hover:bg-white/5 border border-white/10 rounded-xl p-3 cursor-zoom-in">
            <div className="flex justify-between gap-3 w-full">
                <div className="aspect-video bg-black rounded-lg border w-3/4 border-white/10 overflow-hidden relative">
                    <video autoPlay ref={videoRef} playsInline></video>
                    <div className='absolute mt-1 bottom-2 left-3 text-xs'>
                        <div className="">
                            <h1 className='font-medium bg-slate-600/50 px-2 py-0.5 rounded text-slate-100'>#id-{consumer.socketId}</h1>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col w-1/4">
                    <div className="group aspect-square bg-black rounded-lg border border-white/10 overflow-hidden cursor-ne-resize">
                        <video autoPlay ref={camRef} playsInline onDoubleClick={() => camRef.current.requestFullscreen()}></video>
                        <span className="group-hover:block hidden absolute text-[0.6rem] -top-8 z-100 bg-black/10 p-1 rounded-lg border border-white/10">Double Click to Fullscreen</span>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <div className="flex px-2">
                            <div className="flex space-x-1 items-end">
                                <div className="w-1 h-2 bg-green-300 rounded"></div>
                                <div className="w-1 h-3 bg-green-400 rounded"></div>
                                <div className="w-1 h-4 bg-red-500 rounded"></div>
                            </div>
                            <p className='text-xs ml-2'>120 ms</p>
                        </div>
                        <div className="flex justify-between p-1 gap-3">
                            <button onClick={toggleMic} className="bg-blue-500 w-full rounded">M</button>
                            <button onClick={toggleAudio} className="bg-blue-500 w-full rounded">A</button>
                        </div>
                    </div>
                    <audio ref={audioRef}></audio>
                    <audio ref={micRef}></audio>
                </div>
            </div>
        </div>
    )
}

export default VideoContainer
