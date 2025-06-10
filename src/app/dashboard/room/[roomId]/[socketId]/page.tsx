'use client'
import ChatBox from "../../../ui/ChatBox";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ConsumerData, useWebRtc } from "../../../../../context/WebRtcProvider";
import { CheckIcon, LogInIcon, MicIcon, MicOffIcon, Volume2Icon, VolumeIcon, VolumeOffIcon, VolumeX, XIcon } from "lucide-react";
import LogsWindow from "./components/LogsWindow";
import AudioMeter from "../components/AudioMeter";
import UserInfoWindow from "./components/DeviceInfoWindow";
import DeviceInfoWindow from "./components/DeviceInfoWindow";
import session from "../../../../../lib/session";
import { SessionResultProps } from "../users/components/UserSessionTable";

export default function Page() {
    const { roomId, socketId } = useParams();

    const { peers, setData, socketRef, notificationCount } = useWebRtc();

    const [userInfo, setUserInfo] = useState(null)
    const [sessionResult, setSessionResult] = useState<SessionResultProps>(null)
    useEffect(() => {
        if (socketId) {
            setData((prev) => ({
                roomId: roomId as string,
                singleConsumerSocketId: socketId as string,
            }));
        }
    }, [])

    useEffect(() => {
        if (peers && peers[0]) {
            prepareConsume(peers[0].consumers);
        }
    }, [peers])

    useEffect(() => {
        if (socketId && peers[0]) {
            fetchUserInfo(peers[0].token)
        }
    }, [peers])

    useEffect(() => {
        if (!socketId || !peers[0] || !peers[0].token || notificationCount.length === 0) return;

        if(notificationCount.find((e)=> e.token === peers[0].token)){
            fetchSessionResult(peers[0].token)
        }
    }, [notificationCount])

    const fetchUserInfo = async (token: string) => {
        try {

            const jwt = await session()
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || "https://192.168.2.5:5050"}/api/proctored-user/${token}`,
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
            )
            if (response.ok) {
                const { data } = await response.json()
                await fetchSessionResult(token)
                setUserInfo(data)
            } else {

            }
        } catch (error) {

        }
    }

    const fetchSessionResult = async (token: string) => {
        try {

            const jwt = await session()
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || "https://192.168.2.5:5050"}/api/session-result-token/${token}`,
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
            )
            if (response.ok) {
                const data = await response.json()
                setSessionResult(data)
            } else {
                
            }
        } catch (error) {

        }
    }
    

    const videoRef = useRef(null);
    const camRef = useRef(null);
    const audioRef = useRef(null);
    const micRef = useRef(null);

    const [audioMute, setAudioMute] = useState(true);
    const [micMute, setMicMute] = useState(true);
    const [micTrack, setMicTrack] = useState(null)

    const [messages, setMessages] = useState([])

    const [activeBar, setActiveBar] = useState(0)

    const prepareConsume = (consumers) => {
        consumers.forEach((element) => {
            console.log(element)
            const name = element.appData?.name;
            const track = element.consumer.track;

            if (!track || !(track instanceof MediaStreamTrack)) {
                console.error(`Invalid MediaStreamTrack for ${name}:`, track);
                return;
            }

            if (track.readyState === "ended") {
                console.warn(`Track for ${name} has ended`);
                return;
            }

            const stream = new MediaStream([track]);

            switch (name) {
                case "video":
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.muted = true;
                        videoRef.current.playsInline = true;
                    }
                    break;

                case "audio":
                    if (audioRef.current) {
                        audioRef.current.srcObject = stream;
                        audioRef.current.muted = audioMute;
                        audioRef.current.autoplay = true;
                    }
                    break;

                case "cam":
                    if (camRef.current) {
                        camRef.current.srcObject = stream;
                        camRef.current.muted = true;
                        camRef.current.playsInline = true;
                    }
                    break;

                case "mic":
                    if (micRef.current) {
                        setMicTrack(track)
                        micRef.current.srcObject = stream;
                        micRef.current.muted = micMute;
                        micRef.current.autoplay = true;
                    }
                    break;

                default:
                    console.warn(`Unknown media type: ${name}`);
            }
        });
    };

    const toggleAudio = () => {
        setAudioMute((prev) => {
            const newMuteState = !prev;
            if (audioRef.current) {
                audioRef.current.muted = newMuteState;
                if (!newMuteState) {
                    audioRef.current.play().catch((err) => console.error("Audio play error:", err));
                }
            }
            return newMuteState;
        });
    };

    const toggleMic = () => {
        setMicMute((prev) => {
            const newMuteState = !prev;
            if (micRef.current) {
                micRef.current.muted = newMuteState;
                if (!newMuteState) {
                    micRef.current.play().catch((err) => console.error("Mic play error:", err));
                }
            }
            return newMuteState;
        });
    };

    const handleSendMessage = (text) => {
        if (!peers[0]) return
        const newMessage = { from: "you", text };
        setMessages((prev) => [...prev, newMessage]);
        socketRef.current.emit("DASHBOARD_SERVER_MESSAGE", {
            data: {
                action: "SEND_CHAT",
                token: peers[0].token,
                roomId,
                body: text
            }
        })
    };

    return (
        <div className="grid grid-rows-6 grid-cols-12 w-full h-[90vh] overflow-hidden ">
            <div className="row-span-4 col-span-7 gap-6 flex justify-start items-start p-8">
                <div className="flex justify-center items-center  border rounded-lg  max-h-[50vh] aspect-video border-white/10 bg-white/10 p-1">
                    <video className="max-h-[50vh]" autoPlay ref={videoRef} playsInline></video>
                </div>
            </div>

            <div className="row-span-6 col-start-11 col-span-2 ">
                <div className="max-h-[90vh] h-[90vh]">
                    <ChatBox
                        user={{ name: "user#" + peers[0]?.token || "" }}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                    />
                </div>
            </div>
            <div className="row-start-1 row-span-3 col-span-3 col-start-8 flex justify-start items-start pt-8">
                <div className=" border border-white/10 bg-white/10 aspect-square rounded-lg flex justify-center items-center max-h-[35vh]">
                    <video className="aspect-square" autoPlay ref={camRef} playsInline></video>
                </div>
            </div>
            <div className="flex justify-between items-center row-start-4 col-span-3 col-start-8">

            </div>
            <div className="row-span-2 row-start-5 col-span-10 border-t border-white/15">
                <div className="flex items-center gap-4 p-2">
                    <button onClick={() => setActiveBar(0)} className={`${ activeBar === 0 ? "bg-gray-400/10  border-white/10 ": ""} border border-transparent min-w-16 text-xs px-4 rounded font-light py-1`}>Logs</button>
                    <button onClick={() => setActiveBar(1)} className={` ${ activeBar === 1 ? "bg-gray-400/10  border-white/10 ": ""} border border-transparent min-w-16 text-xs px-4 rounded font-light py-1`}>Device Info</button>
                    {/* <button className=" min-w-16 text-xs px-4 rounded font-light py-1">Moderation Tools</button> */}
                </div>
                <div className="flex justify-between border-t border-white/15 max-h-[20vh] h-[20vh]">
                    {
                        (activeBar === 0 && peers[0]) ? (
                            <LogsWindow token={peers[0].token}></LogsWindow>
                        ) : <div></div>
                    }
                    {
                        (userInfo && activeBar == 1) && (
                            <DeviceInfoWindow session={userInfo?.session_detail}></DeviceInfoWindow>
                        )
                    }
                    <div className="border-l border-white/10 p-4 min-w-[24%] min-h-[25vh] max-h-[25vh]">
                        <div className="flex flex-col gap-3">
                            <div className="text-xs gap-4 flex items-center">Fraud Level <span className="bg-red-500 rounded p-1">{sessionResult?.fraudLevel ?? "LOW"}</span></div>
                            <div className="text-xs gap-4 flex items-center">Total Flags <span className="bg-red-500 rounded p-1">{sessionResult?.totalFlags}</span></div>
                            <div className="text-xs gap-4 flex items-center">Total Fraud Severity <span className="bg-red-500 rounded p-1">{sessionResult?.totalSeverity}</span></div>
                            <div className="flex gap-4">
                                <div
                                    onClick={toggleMic}
                                    className="border border-white/10 bg-white/10 aspect-square rounded-lg cursor-pointer hover:border-transparent flex justify-center items-center p-2 max-w-16"
                                >
                                    {micMute ? (
                                        <MicOffIcon className="text-white" size={24} />
                                    ) : (
                                        <MicIcon className="text-white" size={24} />
                                    )}
                                </div>

                                <div
                                    onClick={toggleAudio}
                                    className="border border-white/10 bg-white/10 aspect-square rounded-lg flex justify-center hover:border-transparent items-center p-2 max-w-16"
                                >
                                    {audioMute ? (
                                        <VolumeOffIcon className="text-white" size={24} />
                                    ) : (
                                        <Volume2Icon className="text-white" size={24} />
                                    )}
                                </div>
                                <AudioMeter track={micTrack}></AudioMeter>

                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <audio autoPlay ref={audioRef} />
            <audio autoPlay ref={micRef} />
        </div>
    );
}
