'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatBox from '../../../ui/ChatBox';
import { ConsumerData, useWebRtc } from '../../../../../context/WebRtcProvider';
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
    
    const consumedIds = useRef<Set<string>>(new Set());
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
        if (peers?.[0]) {
            prepareConsume(peers[0].consumers);
        }
    }, [peers]);

    useEffect(() => {
        if (socketId && peers?.[0]?.token) {
            fetchUserInfo(peers[0].token);
        }
    }, [peers, socketId]);

    useEffect(() => {
        const token = peers?.[0]?.token;
        if (!token || notificationCount.length === 0) return;
        if (notificationCount.some(e => e.token === token)) {
            fetchSessionResult(token);
        }
    }, [notificationCount, peers]);

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

    const prepareConsume = (consumers: ConsumerData[]) => {
        consumers.forEach(({ appData, consumer }) => {
            if (consumedIds.current.has(consumer.id)) return;
            consumedIds.current.add(consumer.id)

            const name = appData?.name;
            const track = consumer.track;

            if (!track || !(track instanceof MediaStreamTrack)) return;

            const stream = new MediaStream([track]);

            switch (name) {
                case 'video':
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.muted = true;
                    }
                    break;
                case 'audio':
                    if (audioRef.current) {
                        audioRef.current.srcObject = stream;
                        audioRef.current.muted = audioMute;
                        audioRef.current.autoplay = true;
                    }
                    break;
                case 'cam':
                    if (camRef.current) {
                        camRef.current.srcObject = stream;
                        camRef.current.muted = true;
                    }
                    break;
                case 'mic':
                    if (micRef.current) {
                        micRef.current.srcObject = stream;
                        micRef.current.muted = micMute;
                        micRef.current.autoplay = true;
                        setMicTrack(track);
                    }
                    break;
                default:
                    console.warn(`Unknown track name: ${name}`);
            }
        });
    };

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
        const token = peers?.[0]?.token;
        if (!token) return;

        setPrivateMessages(prev => {
            const existing = prev.findIndex(m => m.token === token);
            if (existing !== -1) {
                const updated = [...prev];
                updated[existing].messages.push({ from: 'you', text });
                return updated;
            }
            return [...prev, { token, messages: [{ from: 'you', text }] }];
        });

        socketRef.current?.emit('DASHBOARD_SERVER_MESSAGE', {
            data: {
                action: 'SEND_CHAT',
                token,
                roomId,
                body: text,
            },
        });
    };

    const peerToken = peers?.[0]?.token;

    return (
        <div className="grid grid-rows-6 grid-cols-12 w-full h-[90vh] overflow-hidden">
            <div className="row-span-4 col-span-7 gap-6 flex justify-start items-start p-8">
                <div className="border rounded-lg bg-white/10 border-white/10 p-1 max-h-[50vh] aspect-video flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="max-h-[50vh]" />
                </div>
            </div>

            <div className="row-start-1 row-span-3 col-span-3 col-start-8 pt-8 flex items-start justify-start">
                <div className="border border-white/10 bg-white/10 rounded-lg aspect-square max-h-[35vh] flex justify-center items-center">
                    <video ref={camRef} autoPlay playsInline className="aspect-square" />
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
                                <AudioMeter track={micTrack} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <audio ref={audioRef} autoPlay />
            <audio ref={micRef} autoPlay />
        </div>
    );
}
