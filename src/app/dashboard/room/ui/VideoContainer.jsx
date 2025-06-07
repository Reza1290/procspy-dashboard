import { useRouter } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"
import { useSideBarLog } from "../../providers/SideBarLogProvider"
import { useWebRtc } from "../../../../context/WebRtcProvider"
import { FlagIcon, FullscreenIcon, MicIcon, MicOffIcon, TriangleAlertIcon, Volume2Icon, VolumeOffIcon } from "lucide-react"
import AudioMeter from "../[roomId]/components/AudioMeter"
import { useLogBottomSheet } from "../../../../context/LogBottomSheetProvider"

const VideoContainer = ({ consumer }) => {
    const router = useRouter()
    const { data, notificationCount } = useWebRtc()
    const { setData } = useLogBottomSheet()
    const videoRef = useRef(null)
    const camRef = useRef(null)
    const audioRef = useRef(null)
    const micRef = useRef(null)

    const [audioMute, setAudioMute] = useState(true)
    const [micMute, setMicMute] = useState(true)
    const [micTrack, setMicTrack] = useState(null);

    useEffect(() => {
        if (consumer && consumer.consumers) {
            prepareConsume(consumer)
        }
        console.log(consumer)
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

            //console.log(`Assigning track for ${name}:`, track)

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
                        setMicTrack(track)
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

    const handleFocusMode = () => {

        router.push(`/dashboard/room/${data.roomId}/${consumer.socketId}`)
    }

    const handleToggleLogBottomSheet = () => {
        console.log("test", consumer.token)
        setData((prev) => ({
            active: !prev.active,
            token: consumer.token
        }))
    }




    return (
        <div className="flex max-h-[30vh]">
            <div className="relative z-10 flex flex-col justify-between bg-black border border-white/10 rounded-xl p-3">
                <div className="flex justify-between gap-3 w-full">
                    <div className="aspect-video flex items-center justify-center bg-slate-950 rounded-lg border w-3/4 border-white/10 overflow-hidden relative">
                        <video autoPlay ref={videoRef} playsInline></video>
                        <div className='absolute mt-1 bottom-2 left-3 text-xs'>
                            <div className="">
                                <h1 className='font-medium bg-slate-600/50 px-2 py-0.5 rounded text-slate-100'>#id-{consumer.token}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col w-1/4 gap-4">
                        <div className="group aspect-square flex items-center justify-center bg-slate-950 rounded-lg border border-white/10 overflow-hidden cursor-ne-resize">
                            <video autoPlay ref={camRef} playsInline onDoubleClick={() => camRef.current.requestFullscreen()}></video>
                            <span className="group-hover:block hidden absolute text-[0.6rem] -top-8 z-100 bg-black/10 p-1 rounded-lg border border-white/10">Double Click to Fullscreen</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <AudioMeter track={micTrack} />
                            <div className="flex items-center p-2 border border-white/10 rounded">
                                <TriangleAlertIcon className="text-red-500" />
                                <p className="text-xs ml-2 truncate">
                                    {
                                        notificationCount.find(n => n.token === consumer.token)?.count || 0
                                    } New Flags
                                </p>
                            </div>
                        </div>
                        <audio ref={audioRef}></audio>
                        <audio ref={micRef}></audio>
                    </div>
                </div>
            </div>
            <div className="-ml-3 bg-black/15 p-3 pl-6 w-72 bg-black/1 z-0 border gap-4 border-white/10 border-l-0 rounded-r-xl grid grid-rows-4">
                <div className="self-center justify-self-center border border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16 cursor-pointer" onClick={toggleMic}>

                    {micMute ? <MicOffIcon /> : <MicIcon />}

                </div>
                <div className="self-center justify-self-center border border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16 cursor-pointer" onClick={toggleAudio}>
                    {audioMute ? <VolumeOffIcon /> : <Volume2Icon />}

                </div>
                <div className="relative self-center justify-self-center border border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16 cursor-pointer" onClick={handleToggleLogBottomSheet}>
                    {
                        notificationCount.find(n => n.token === consumer.token)?.count > 0 && <div className="absolute w-3 h-3 bg-red-500 -top-1 -right-1 rounded-full"></div>
                    }
                    <FlagIcon />
                </div>
                <div className="self-center justify-self-center border border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16 cursor-pointer" onClick={() => handleFocusMode()}>
                    <FullscreenIcon />
                </div>
            </div>
        </div>
    )
}

export default React.memo(VideoContainer)
