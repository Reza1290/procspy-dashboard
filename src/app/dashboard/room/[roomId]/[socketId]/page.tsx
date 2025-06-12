'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatBox from '../../../ui/ChatBox';
import { ConsumerData, Peer, useWebRtc } from '../../../../../context/WebRtcProvider';
import { MicIcon, MicOffIcon, Volume2Icon, VolumeOffIcon } from 'lucide-react';
import LogsWindow from './components/LogsWindow';
import AudioMeter from '../components/AudioMeter';
import DeviceInfoWindow from './components/DeviceInfoWindow';
import session from '../../../../../lib/session';
import { SessionResultProps } from '../users/components/UserSessionTable';

type UserInfo = {
    session_detail: any;
    [key: string]: any;
};

export default function Page() {
    const { roomId, socketId } = useParams();
    const { peers, setData, socketRef, notificationCount, privateMessages, setPrivateMessages } = useWebRtc();

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [sessionResult, setSessionResult] = useState<SessionResultProps | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const camRef = useRef<HTMLVideoElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const micRef = useRef<HTMLAudioElement | null>(null);

    const [audioMute, setAudioMute] = useState(true);
    const [micMute, setMicMute] = useState(true);
    const [micTrack, setMicTrack] = useState<MediaStreamTrack | null>(null);

    const [activeBar, setActiveBar] = useState(0);

    const firstPeer = useMemo(() => peers?.[0], [peers]);
    const firstToken = firstPeer?.token;
    const peerToken = firstToken;

    const lastProcessedToken = useRef<string | null>(null);

    const [hasUserInteracted, setHasUserInteracted] = useState(false);

    useEffect(() => {
        const onUserInteraction = () => {
            setHasUserInteracted(true);
            document.removeEventListener("click", onUserInteraction);
            document.removeEventListener("keydown", onUserInteraction);
        };

        document.addEventListener("click", onUserInteraction);
        document.addEventListener("keydown", onUserInteraction);

        return () => {
            document.removeEventListener("click", onUserInteraction);
            document.removeEventListener("keydown", onUserInteraction);
        };
    }, []);


    useEffect(() => {
        if (socketId && roomId) {
            setData(prev => ({
                ...prev,
                roomId: roomId as string,
                singleConsumerSocketId: socketId as string,
            }));
        }
    }, [roomId, socketId, setData]);

    useEffect(() => {
        if (!firstPeer || firstPeer.token === lastProcessedToken.current) return;
        lastProcessedToken.current = firstPeer.token;
        
        prepareConsume(firstPeer);
    }, [firstPeer]);

    useEffect(() => {
        if (socketId && firstToken) {
            fetchUserInfo(firstToken);
        }
    }, [firstToken, socketId]);

    useEffect(() => {
        if (!firstToken || notificationCount.length === 0) return;

        if (notificationCount.some(e => e.token === firstToken)) {
            fetchSessionResult(firstToken);
        }
    }, [notificationCount, firstToken]);

    const fetchUserInfo = async (token: string) => {
        try {
            const jwt = await session();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/proctored-user/${token}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            if (res.ok) {
                const { data } = await res.json();
                setUserInfo(data);
                fetchSessionResult(token);
            }
        } catch (err) {
            console.error('Fetch user info failed:', err);
        }
    };

    const fetchSessionResult = async (token: string) => {
        try {
            const jwt = await session();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/session-result-token/${token}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            if (res.ok) {
                const data = await res.json();
                setSessionResult(data);
            }
        } catch (err) {
            console.error('Fetch session result failed:', err);
        }
    };

    const setStreamAndPlay = (ref: React.RefObject<HTMLMediaElement>, stream: MediaStream, label: string, muted: boolean) => {
        const mediaEl = ref.current;
        if (!mediaEl) return;

        mediaEl.srcObject = stream;
        mediaEl.muted = muted;

        const tryPlay = (attempt = 0) => {
            if (!mediaEl) return;
            mediaEl.play().catch((err) => {
                if (attempt < 5) {
                    const delay = 500 * Math.pow(2, attempt);
                    console.warn(`[${label}] play() failed (attempt ${attempt + 1}), retrying in ${delay}ms`, err);
                    setTimeout(() => tryPlay(attempt + 1), delay);
                } else {
                    console.error(`[${label}] play() failed after max attempts`, err);
                }
            });
        };

        const onCanPlay = () => {
            tryPlay();
            mediaEl.removeEventListener("canplay", onCanPlay);
        };

        if (mediaEl.readyState >= 3) {
            tryPlay();
        } else {
            mediaEl.addEventListener("canplay", onCanPlay);
        }
    };


    const prepareConsume = (() => {
        let timeoutId: NodeJS.Timeout | null = null;
        return (peer: Peer) => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                peer.consumers.forEach((element: ConsumerData) => {
                    const name = element.appData?.name;
                    const track = element.consumer.track;

                    if (!track || !(track instanceof MediaStreamTrack) || track.readyState !== "live") {
                        console.warn(`Skipping invalid track for ${name}`, track);
                        return;
                    }

                    const stream = new MediaStream([track]);

                    switch (name) {
                        case "video":
                            setStreamAndPlay(videoRef, stream, "Video", false)
                            break;
                        case "cam":
                            setStreamAndPlay(camRef, stream, "Cam", false)
                            break;
                        case "audio":
                            setStreamAndPlay(audioRef, stream, "Audio", audioMute);
                            break;
                        case "mic":
                            setStreamAndPlay(micRef, stream, "Mic", micMute);
                            break;
                        default:
                            console.warn(`Unknown track name: ${name}`);
                    }
                });
            }, 100);
        };
    })();

    const toggleAudio = () => {
        setAudioMute(prev => {
            const muted = !prev;
            if (audioRef.current) {
                audioRef.current.muted = muted;
                if (!muted) audioRef.current.play().catch(console.error);
            }
            return muted;
        });
    };

    const toggleMic = () => {
        setMicMute(prev => {
            const muted = !prev;
            if (micRef.current) {
                micRef.current.muted = muted;
                if (!muted) micRef.current.play().catch(console.error);
            }
            return muted;
        });
    };

    const handleSendMessage = (text: string) => {
        if (!peerToken) return;

        setPrivateMessages(prev => {
            const existing = prev.findIndex(m => m.token === peerToken);
            if (existing !== -1) {
                const updated = [...prev];
                updated[existing].messages.push({ from: 'you', text });
                return updated;
            }
            return [...prev, { token: peerToken, messages: [{ from: 'you', text }] }];
        });

        socketRef.current?.emit('DASHBOARD_SERVER_MESSAGE', {
            data: {
                action: 'SEND_CHAT',
                token: peerToken,
                roomId,
                body: text,
            },
        });
    };

    return (
        <div className="grid grid-rows-6 grid-cols-12 w-full h-[90vh] overflow-hidden">
            <div className="row-span-4 col-span-7 gap-6 flex justify-start items-start p-8">
                <div className="border rounded-lg bg-white/10 border-white/10 p-1 max-h-[50vh] aspect-video flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline muted className="max-h-[50vh]" />
                </div>
            </div>

            <div className="row-start-1 row-span-3 col-span-3 col-start-8 pt-8 flex items-start justify-start">
                <div className="border border-white/10 bg-white/10 rounded-lg aspect-square max-h-[35vh] flex justify-center items-center">
                    <video ref={camRef} autoPlay playsInline muted className="aspect-square" />
                </div>
            </div>

            <div className="row-span-6 col-span-2 col-start-11">
                <div className="h-[90vh]">
                    <ChatBox
                        user={{ name: `user#${peerToken ?? ''}` }}
                        privateMessages={privateMessages.filter(m => m.token === peerToken)}
                        onSendMessage={handleSendMessage}
                    />
                </div>
            </div>

            <div className="row-span-2 row-start-5 col-span-10 border-t border-white/15">
                <div className="flex gap-4 items-center p-2">
                    <button onClick={() => setActiveBar(0)} className={`min-w-16 text-xs px-4 py-1 rounded font-light border ${activeBar === 0 ? 'bg-gray-400/10 border-white/10' : 'border-transparent'}`}>Logs</button>
                    <button onClick={() => setActiveBar(1)} className={`min-w-16 text-xs px-4 py-1 rounded font-light border ${activeBar === 1 ? 'bg-gray-400/10 border-white/10' : 'border-transparent'}`}>Device Info</button>
                </div>

                <div className="flex justify-between border-t border-white/15 max-h-[20vh] h-[20vh]">
                    {activeBar === 0 && peerToken && <LogsWindow token={peerToken} />}
                    {activeBar === 1 && userInfo && <DeviceInfoWindow session={userInfo.session_detail} />}
                    <div className="border-l border-white/10 p-4 min-w-[24%] min-h-[25vh] max-h-[25vh]">
                        <div className="flex flex-col gap-3 text-xs">
                            <div className="flex items-center gap-4">Fraud Level <span className="bg-red-500 p-1 rounded">{sessionResult?.fraudLevel ?? 'LOW'}</span></div>
                            <div className="flex items-center gap-4">Total Flags <span className="bg-red-500 p-1 rounded">{sessionResult?.totalFlags}</span></div>
                            <div className="flex items-center gap-4">Total Fraud Severity <span className="bg-red-500 p-1 rounded">{sessionResult?.totalSeverity}</span></div>

                            <div className="flex gap-4">
                                <button onClick={toggleMic} className="bg-white/10 hover:border-transparent border border-white/10 p-2 rounded-lg max-w-16 flex justify-center items-center">
                                    {micMute ? <MicOffIcon className="text-white" size={24} /> : <MicIcon className="text-white" size={24} />}
                                </button>
                                <button onClick={toggleAudio} className="bg-white/10 hover:border-transparent border border-white/10 p-2 rounded-lg max-w-16 flex justify-center items-center">
                                    {audioMute ? <VolumeOffIcon className="text-white" size={24} /> : <Volume2Icon className="text-white" size={24} />}
                                </button>
                                {micTrack && <AudioMeter track={micTrack} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <audio ref={audioRef} autoPlay muted />
            <audio ref={micRef} autoPlay muted />
        </div>
    );
}
