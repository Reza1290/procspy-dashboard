"use client"
import { useEffect, useRef, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import session from "../../../../../../lib/session";
import { EllipsisVertical, Eye, Unplug } from "lucide-react";
import { useWebRtc } from "../../../../../../context/WebRtcProvider";
import PopOver from "../../../../../../components/ui/PopOver";

export enum SessionStatus {
    Scheduled,
    Ongoing,
    Completed,
    Paused,
}

export type SessionProps = {
    id: string;
    roomId: string;
    proctoredUserId: string;
    token: string
    proctored_user: {
        name: string
    }
    startTime?: string;
    endTime?: string;
    status?: SessionStatus;
    isOnline: boolean;
};

const UserSessionTable = () => {

    const { roomId } = useParams()
    const [sessions, setSessions] = useState<SessionProps[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const { peers } = useWebRtc()
    useEffect(() => {
        if (!roomId) return;

        fetchSessions(1);
    }, [roomId]);

    const fetchSessions = async (nextPage: number) => {
        try {
            const token = await session();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/sessions-in-room/${roomId}?page=${nextPage}&paginationLimit=20`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setSessions(prev => {
                    let newSessions = data.data
                        .filter((d: SessionProps) => !prev.some(p => p.token === d.token))
                        .map((d:SessionProps) => ({
                            ...d,
                            isOnline: peers.some(peer => peer.token === d.token)
                        }));
                    return [...prev, ...newSessions];
                });
                setHasMore(nextPage < data.totalPages);
                setLoading(false);
                setPage(nextPage);
            }
        } catch (err) {
            console.error("Failed to fetch session history", err);
        }
    };


    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el || loading || !hasMore) return;

        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
            fetchSessions(page + 1);
        }
    };

    const handleAbortSession = (sessionId: string) => {
        try {
            
        } catch (error) {
            
        }
    }


    return (
        <div className="">
            <div className="overflow-x-auto border-b border-t border-white/15">
                <div className="mx-8 my-4">
                    Filter
                </div>
                <div className="relative max-h-screen overflow-y-auto" onScroll={handleScroll} ref={scrollRef}>
                    <table className="min-w-full table-fixed">
                        <thead className="sticky top-0  z-10">
                            <tr className="">
                                <th className="pl-8 pr-4 py-2 text-left font-normal text-slate-100/75 text-sm">Connection Status</th>
                                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Session Token</th>
                                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Name</th>
                                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Start Time</th>
                                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">End Time</th>
                                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Session Status</th>
                                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Fraud Status</th>
                                <th className="pr-8 pl-4 text-left font-normal text-slate-100/75 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session) => (
                                <tr key={session.token} className="border-t border-white/10 hover:bg-gray-600/30">
                                    <td className="pl-8 pr-4 py-4 text-xs capitalize">
                                        {
                                            session.isOnline ? (
                                                <div className="w-min rounded flex justifyt-center items-center gap-2"> <div className="w-2 h-2 rounded-full bg-green-500 "></div>Connected</div>
                                            ) : (
                                                <div className="w-min rounded flex justifyt-center items-center gap-2"> <div className="w-2 h-2 rounded-full bg-red-500 "></div>Disconnected</div>

                                            )
                                        }
                                    </td>
                                    <td className="px-4 py-4 text-sm font-semibold">{session.token}</td>
                                    <td className="px-4 py-4 text-sm text-sky-500/75 font-medium">{session.proctored_user.name}</td>
                                    <td className="px-4 py-4 text-sm">{session.startTime || "-"}</td>
                                    <td className="px-4 py-4 text-sm">{session.endTime || "-"}</td>
                                    <td className="px-4 py-4 text-xs capitalize">
                                        <div className="bg-red-500 w-min rounded p-1 px-2">{session.status}</div>
                                    </td>
                                    <td className="px-4 py-4 text-xs capitalize">
                                        <div className="bg-red-500 w-min rounded p-1 px-2">High</div>
                                    </td>
                                    <td className="pr-8 pl-4 py-4 text-xs capitalize flex justify-start items-center gap-4">                                        
                                        <PopOver icon={<EllipsisVertical className="max-w-4 aspect-square" />}>
                                            <div className="flex flex-col gap-1">
                                                <div className="hover:bg-gray-700 cursor-pointer rounded text-sm p-1 px-2">
                                                    Abort
                                                </div>
                                            </div>
                                        </PopOver>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserSessionTable;
