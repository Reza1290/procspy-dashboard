'use client'
import ChatBox from "../../../ui/ChatBox";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ConsumerData, useWebRtc } from "../../../../../context/WebRtcProvider";
import { CheckIcon, LogInIcon, MicIcon, MicOffIcon, VolumeOffIcon, VolumeX, XIcon } from "lucide-react";

export default function Page() {
    const { roomId, socketId } = useParams();

    const { peers, setData, socketRef } = useWebRtc();

    useEffect(() => {
        if (socketId) {
            setData((prev) => ({
                roomId: roomId,
                singleConsumerSocketId: socketId,
            }));
        }
    }, [])

    useEffect(() => {
        if (peers && peers[0]) {
            prepareConsume(peers[0].consumers);
        }
    }, [peers])

    const videoRef = useRef(null);
    const camRef = useRef(null);
    const audioRef = useRef(null);
    const micRef = useRef(null);

    const [audioMute, setAudioMute] = useState(true);
    const [micMute, setMicMute] = useState(true);


    const [messages, setMessages] = useState([])

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
                        videoRef.current.muted = true; // mute video element to allow autoplay
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
        if(!peers[0]) return
        const newMessage = { from: "you", text };
        setMessages((prev) => [...prev, newMessage]);
        socketRef.current.emit("DASHBOARD_SERVER_MESSAGE", {
            data :{
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
                <div className="h-full">
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
            <div className="row-start-4 col-span-3 col-start-8">

            </div>
            <div className="row-span-2 row-start-5 col-span-10 border-t border-white/15">
                <div className="flex items-center gap-4 p-2">
                    <button className="bg-gray-400/10 min-w-16 text-xs px-4 rounded border border-white/10 font-light py-1">Logs</button>
                    <button className=" min-w-16 text-xs px-4 rounded font-light py-1">User Info</button>
                    <button className=" min-w-16 text-xs px-4 rounded font-light py-1">Moderation Tools</button>
                </div>
                <div className="flex justify-between border-t border-white/15 max-h-[25vh]">
                    <div className="flex flex-col w-full p-4 overflow-y-scroll  [&::-webkit-scrollbar]:w-2
                            [&::-webkit-scrollbar-track]:rounded-full
                            [&::-webkit-scrollbar-track]:bg-gray-100
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            [&::-webkit-scrollbar-thumb]:bg-gray-300
                            dark:[&::-webkit-scrollbar-track]:bg-black
                            dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
                        <div className="flex items-start gap-2">
                            <span className="text-light text-xs py-1">[24-20-21]</span>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <LogInIcon className="w-4"></LogInIcon>
                                    <span className="font-semibold text-xs">SWITCH_TAB</span>
                                    <span className="text-light text-xs">user accessed a tab</span>
                                    <span className="bg-white/10 border border-white/10 p-1 px-2 text-xs rounded-md">https://loginc.m</span>
                                    <span className="bg-red-500 rounded text-xs py-1 px-2">7</span>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="bg-white/10 w-full aspect-video max-w-64 p-2 rounded-md border border-white/10 max-h-64">
                                        <img className="rounded-md" src={`${process.env.STORAGE_ENDPOINT || 'https://192.168.2.5:5050'}` + ""} alt="" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="bg-red-500 rounded p-1">
                                            <CheckIcon></CheckIcon>
                                        </button>
                                        <button className="bg-white/10 border border-white/10 rounded p-1">
                                            <XIcon></XIcon>
                                        </button>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-l border-white/10 p-4 w-[20%]">
                        <div className="flex flex-col gap-3">
                            <div className="text-xs gap-4 flex items-center">Fraud Level <span className="bg-red-500 rounded p-1">High</span></div>
                            <div className="text-xs gap-4 flex items-center">Total Flags <span className="bg-red-500 rounded p-1">127</span></div>
                            <div className="text-xs gap-4 flex items-center">Total Fraud Severity <span className="bg-red-500 rounded p-1">283</span></div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div
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
                    <VolumeX className="text-white" size={24} />
                )}
            </div> */}

            <audio autoPlay ref={audioRef} />
            <audio autoPlay ref={micRef} />
        </div>
    );
}
