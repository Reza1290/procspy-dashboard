'use client'
import ChatBox from "../../../ui/ChatBox";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ConsumerData, useWebRtc } from "../../../../../context/WebRtcProvider";
import { MicIcon, MicOffIcon, VolumeOffIcon, VolumeX } from "lucide-react";

export default function Page() {
    const { roomId, socketId } = useParams();

    const { peers, setData } = useWebRtc();

    useEffect(() => {
        if (socketId) {
            setData((prev) => ({
                ...prev,
                roomId: roomId[0],
                singleConsumerSocketId: socketId[1],
            }));
        }
        if (peers && peers[0]) {
            prepareConsume(peers[0].consumers);
        }
    }, [socketId, setData, peers]);

    const videoRef = useRef(null);
    const camRef = useRef(null);
    const audioRef = useRef(null);
    const micRef = useRef(null);

    const [audioMute, setAudioMute] = useState(true);
    const [micMute, setMicMute] = useState(true);

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
        // Implement your message sending logic here
    };

    return (
        <div className="grid grid-rows-3 grid-cols-4 w-full gap-6 max-h-screen overflow-hidden ">
            <div className="grid row-span-2 col-span-3 gap-6 m-8 ">
                <div className="col-span-3 border aspect-video rounded-lg border-white/10 bg-white/10 w-11/12">
                    <video autoPlay ref={videoRef} playsInline></video>
                </div>
            </div>

            <div className="mt-8 mr-8 row-span-2">
                <div className="ml-4 border h-full rounded-lg ">
                    <ChatBox
                        user={{ name: "test" }}
                        messages={["messages"]}
                        onSendMessage={handleSendMessage}
                    />
                </div>
            </div>

            <div className="row-start-3 col-start-1 col-span-4 flex m-8 mt-0 gap-8">
                <div className="aspect-square border border-white/10 bg-white/10 rounded-lg h-full flex ">
                    <video autoPlay ref={camRef} playsInline></video>
                </div>
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
                        <VolumeX className="text-white" size={24} />
                    )}
                </div>
            </div>

            <audio autoPlay ref={audioRef} />
            <audio autoPlay ref={micRef} />
        </div>
    );
}
