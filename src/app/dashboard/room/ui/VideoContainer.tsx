"use client"

import { useRouter } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"
import { useSideBarLog } from "../../providers/SideBarLogProvider"
import { ConsumerData, Peer, useWebRtc } from "../../../../context/WebRtcProvider"
import {
    FlagIcon,
    FullscreenIcon,
    MicIcon,
    MicOffIcon,
    TriangleAlertIcon,
    Volume2Icon,
    VolumeOffIcon,
} from "lucide-react"
import AudioMeter from "../[roomId]/components/AudioMeter"
import { useLogBottomSheet } from "../../../../context/LogBottomSheetProvider"

const VideoContainer = ({ peer }: { peer: Peer }) => {
    const router = useRouter()
    const { data, notificationCount } = useWebRtc()
    const { setData } = useLogBottomSheet()

    const videoRef = useRef<HTMLVideoElement>(null)
    const camRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const micRef = useRef<HTMLAudioElement>(null)

    const [audioMute, setAudioMute] = useState(true)
    const [micMute, setMicMute] = useState(true)
    const [micTrack, setMicTrack] = useState<MediaStreamTrack | null>(null)

    const tryPlayMedia = (ref: React.RefObject<HTMLMediaElement>, label: string) => {
        const mediaEl = ref.current
        if (!mediaEl || !mediaEl.srcObject) return

        const tryPlay = () => {
            mediaEl.play().catch((err) => {
                console.warn(`${label} autoplay failed:`, err)
            })
        }

        if (mediaEl.readyState >= 3) {
            tryPlay()
        } else {
            const onCanPlay = () => {
                tryPlay()
                mediaEl.removeEventListener("canplay", onCanPlay)
            }
            mediaEl.addEventListener("canplay", onCanPlay)
        }
    }

    const setStream = (ref: React.RefObject<HTMLMediaElement>, stream: MediaStream) => {
        if (ref.current && ref.current.srcObject !== stream) {
            ref.current.srcObject = stream
            ref.current.onloadedmetadata = () => {
                ref.current?.play().catch(err => {
                    console.warn("Playback failed on metadata load:", err)
                })
            }
        }
    }

    const prepareConsume = (() => {
        let timeoutId: NodeJS.Timeout | null = null
        return (peer: Peer) => {
            if (timeoutId) clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                peer.consumers.forEach((element: ConsumerData) => {
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
                            if (audioRef.current) audioRef.current.muted = audioMute
                            tryPlayMedia(audioRef, "Audio")
                            break
                        case "mic":
                            // setMicTrack(track)
                            setStream(micRef, stream)
                            if (micRef.current) micRef.current.muted = micMute
                            tryPlayMedia(micRef, "Mic")
                            break
                        default:
                            console.warn(`Unknown track name: ${name}`)
                    }
                })
            }, 100)
        }
    })()

    useEffect(() => {
        if (peer.consumers?.length > 0) {
            prepareConsume(peer)
        }
    }, [peer.socketId, peer.consumers])

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
                    const obj = ref.current.srcObject as MediaStream
                    obj.getTracks().forEach(t => t.stop())
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
        router.push(`/dashboard/room/${data.roomId}/${peer.socketId}`)
    }

    const handleToggleLogBottomSheet = () => {
        setData(prev => ({
            active: !prev.active,
            token: peer.token
        }))
    }

    return (
        <div className="flex max-h-[30vh]">
            <div className="relative z-10 flex flex-col justify-between bg-black border border-white/10 rounded-xl p-3">
                <div className="flex justify-between gap-3 w-full">
                    <div className="aspect-video flex items-center justify-center bg-slate-950 rounded-lg border w-3/4 border-white/10 overflow-hidden relative">
                        <video autoPlay playsInline muted ref={videoRef}></video>
                        {!videoRef.current?.srcObject && (
                            <div className="absolute inset-0 bg-black/90 text-white text-sm flex items-center justify-center">
                                No video
                            </div>
                        )}
                        <div className="absolute mt-1 bottom-2 left-3 text-xs">
                            <h1 className="font-medium bg-slate-600/50 px-2 py-0.5 rounded text-slate-100">#id-{peer.token}</h1>
                        </div>
                    </div>

                    <div className="flex flex-col w-1/4 gap-4">
                        <div className="group aspect-square flex items-center justify-center bg-slate-950 rounded-lg border border-white/10 overflow-hidden cursor-ne-resize">
                            <video ref={camRef} autoPlay playsInline muted onDoubleClick={() => camRef.current?.requestFullscreen()}></video>
                            <span className="group-hover:block hidden absolute text-[0.6rem] -top-8 z-100 bg-black/10 p-1 rounded-lg border border-white/10">Double Click to Fullscreen</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            {micTrack && <AudioMeter track={micTrack} />}
                            <div className="flex items-center p-2 border border-white/10 rounded">
                                <TriangleAlertIcon className="text-red-500" />
                                <p className="text-xs ml-2 truncate">
                                    {notificationCount.find(n => n.token === peer.token)?.count || 0} New Flags
                                </p>
                            </div>
                        </div>
                        <audio ref={audioRef} playsInline></audio>
                        <audio ref={micRef} playsInline></audio>
                    </div>
                </div>
            </div>

            <div className="-ml-3 bg-black/15 p-3 pl-6 w-72 z-0 border gap-4 border-white/10 border-l-0 rounded-r-xl grid grid-rows-4">
                <div className="self-center justify-self-center border border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16 cursor-pointer" onClick={toggleMic}>
                    {micMute ? <MicOffIcon /> : <MicIcon />}
                </div>
                <div className="self-center justify-self-center border border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16 cursor-pointer" onClick={toggleAudio}>
                    {audioMute ? <VolumeOffIcon /> : <Volume2Icon />}
                </div>
                <div className="relative self-center justify-self-center border border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16 cursor-pointer" onClick={handleToggleLogBottomSheet}>
                    {notificationCount.find(n => n.token === peer.token)?.count > 0 && <div className="absolute w-3 h-3 bg-red-500 -top-1 -right-1 rounded-full"></div>}
                    <FlagIcon />
                </div>
                <div className="self-center justify-self-center border border-white/10 bg-white/10 aspect-square rounded flex justify-center items-center p-2 max-w-16 cursor-pointer" onClick={handleFocusMode}>
                    <FullscreenIcon />
                </div>
            </div>
        </div>
    )
}

export default VideoContainer
