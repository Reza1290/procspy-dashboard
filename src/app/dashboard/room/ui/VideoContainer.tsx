"use client"

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
    const [micTrack, setMicTrack] = useState(null)

    
    useEffect(() => {   
        if (consumer?.consumers?.length) {
            prepareConsume(consumer)
        }
    }, [consumer])

    const tryPlayMedia = (ref, label) => {
        if (ref.current && ref.current.srcObject) {
            ref.current.play().catch(err => {
                console.warn(`${label} autoplay failed:`, err)
            })
        }
    }

    const setStream = (ref, stream) => {
        if (ref.current) {
            if (ref.current.srcObject !== stream) {
                ref.current.srcObject = null
                ref.current.srcObject = stream
            }
        }
    }

    const prepareConsume = (consumer) => {
        consumer.consumers.forEach(element => {

            const name = element.appData?.name
            const track = element.consumer.track

            if (!track || !(track instanceof MediaStreamTrack) || track.readyState !== "live") {
                console.warn(`Skipping invalid track for ${name}`, track)
                return
            }

            const stream = new MediaStream([track])

            switch (name) {
                case "video":
                    setStream(videoRef, stream)
                    tryPlayMedia(videoRef, "Video")
                    break

                case "cam":
                    setStream(camRef, stream)
                    tryPlayMedia(camRef, "Cam")
                    break

                case "audio":
                    setStream(audioRef, stream)
                    audioRef.current.muted = audioMute
                    tryPlayMedia(audioRef, "Audio")
                    break

                case "mic":
                    setMicTrack(track)
                    setStream(micRef, stream)
                    micRef.current.muted = micMute
                    tryPlayMedia(micRef, "Mic")
                    break

                default:
                    console.warn(`Unknown track name: ${name}`)
            }
        })
    }

    useEffect(() => {
        const enableAutoplay = () => {
            tryPlayMedia(videoRef, "Video")
            tryPlayMedia(audioRef, "Audio")
            tryPlayMedia(camRef, "Cam")
            tryPlayMedia(micRef, "Mic")
        }
        document.addEventListener("click", enableAutoplay, { once: true })

        return () => {
            [videoRef, camRef, audioRef, micRef].forEach(ref => {
                if (ref.current?.srcObject) {
                    const tracks = ref.current.srcObject.getTracks()
                    tracks.forEach(t => t.stop())
                    ref.current.srcObject = null
                }
            })
        }
    }, [])

    const toggleAudio = () => {
        setAudioMute(prev => {
            const muted = !prev
            if (audioRef.current) {
                audioRef.current.muted = muted
                if (!muted) tryPlayMedia(audioRef, "Audio")
            }
            return muted
        })
    }

    const toggleMic = () => {
        setMicMute(prev => {
            const muted = !prev
            if (micRef.current) {
                micRef.current.muted = muted
                if (!muted) tryPlayMedia(micRef, "Mic")
            }
            return muted
        })
    }

    const handleFocusMode = () => {
        router.push(`/dashboard/room/${data.roomId}/${consumer.socketId}`)
    }

    const handleToggleLogBottomSheet = () => {
        setData(prev => ({
            active: !prev.active,
            token: consumer.token
        }))
    }

    return (
        <div className="flex max-h-[30vh]">
            <div className="relative z-10 flex flex-col justify-between dark:bg-black border dark:border-white/10 rounded-xl p-3">
                <div className="flex justify-between gap-3 w-full">
                    <div className="aspect-video flex items-center justify-center bg-slate-950 rounded-lg border w-3/4 dark:border-white/10 overflow-hidden relative">
                        <video autoPlay playsInline ref={videoRef}></video>
                        {!videoRef.current?.srcObject && (
                            <div className="absolute inset-0 dark:bg-black/90 text-white text-sm flex items-center justify-center">
                                No video
                            </div>
                        )}
                        <div className="absolute mt-1 bottom-2 left-3 text-xs">
                            <h1 className="font-medium bg-slate-600/50 px-2 py-0.5 rounded text-slate-100">#id-{consumer.token}</h1>
                        </div>
                    </div>

                    <div className="flex flex-col w-1/4 gap-4">
                        <div className="group aspect-square flex items-center justify-center bg-slate-950 rounded-lg border dark:border-white/10 overflow-hidden cursor-ne-resize">
                            <video autoPlay ref={camRef} playsInline onDoubleClick={() => camRef.current?.requestFullscreen()}></video>
                            <span className="group-hover:block hidden absolute text-[0.6rem] -top-8 z-100 bg-white dark:bg-black/10 p-1 rounded-lg border dark:border-white/10">Double Click to Fullscreen</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <AudioMeter track={micTrack} />
                            <div className="flex items-center p-2 border dark:border-white/10 rounded">
                                <TriangleAlertIcon className="text-red-500" />
                                <p className="text-xs ml-2 truncate">
                                    {notificationCount.find(n => n.token === consumer.token)?.count || 0} New Flags
                                </p>
                            </div>
                        </div>
                        <audio ref={audioRef}></audio>
                        <audio ref={micRef}></audio>
                    </div>
                </div>
            </div>

            <div className="-ml-3 bg-white dark:bg-black/15 p-3 pl-6 w-72 z-0 border gap-4 dark:border-white/10 border-l-0 rounded-r-xl grid grid-rows-4">
                <div className="self-center justify-self-center border dark:border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16 cursor-pointer" onClick={toggleMic}>
                    {micMute ? <MicOffIcon /> : <MicIcon />}
                </div>
                <div className="self-center justify-self-center border dark:border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16 cursor-pointer" onClick={toggleAudio}>
                    {audioMute ? <VolumeOffIcon /> : <Volume2Icon />}
                </div>
                <div className="relative self-center justify-self-center border dark:border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16 cursor-pointer" onClick={handleToggleLogBottomSheet}>
                    {notificationCount.find(n => n.token === consumer.token)?.count > 0 && <div className="absolute w-3 h-3 bg-red-500 -top-1 -right-1 rounded-full"></div>}
                    <FlagIcon />
                </div>
                <div className="self-center justify-self-center border dark:border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16 cursor-pointer" onClick={handleFocusMode}>
                    <FullscreenIcon />
                </div>
            </div>
        </div>
    )
}

export default React.memo(VideoContainer)
