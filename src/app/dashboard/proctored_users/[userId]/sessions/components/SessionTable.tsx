"use client"
import { useEffect, useRef, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import session from "../../../../../../lib/session";
import { ChartLineIcon, EllipsisVertical, Eye, Unplug } from "lucide-react";
import { FraudLevel, SessionProps } from "../../../../room/[roomId]/users/components/UserSessionTable";
import { useRouter } from "next/navigation";



const SessionTable = () => {
    const pathname = usePathname()

    const { userId } = useParams()
    const [sessions, setSessions] = useState<SessionProps[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [threshold, setThreshold] = useState(100)

    const router = useRouter()
    useEffect(() => {
        if (!userId) return;

        fetchSessions(1);
    }, [userId]);

    const fetchSessions = async (nextPage: number) => {
        try {
            const token = await session();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/sessions/${userId}?page=${nextPage}&paginationLimit=20`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setSessions(prev => {
                    const newSessions = data.data.filter((d: SessionProps) => !prev.some(p => p.token === d.token));
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


    const calcFraudLevel = (totalSeverity: number) => {
            const percentOfThreshold = (totalSeverity / threshold) * 100;
    
            return percentOfThreshold >= 90 ? FraudLevel.CRITICAL :
                percentOfThreshold >= 65 ? FraudLevel.HIGH :
                    percentOfThreshold >= 25 ? FraudLevel.MEDIUM :
                        FraudLevel.LOW;
        }

    return (
        <div className="">
            <div className="overflow-x-auto border-b border-white/15">
                <div className="mx-8 my-4">
                    Filter
                </div>
                <div className="relative max-h-[76vh] overflow-y-auto" onScroll={handleScroll} ref={scrollRef}>
                    <table className="min-w-full table-fixed">
                        <thead className="sticky top-0 backdrop-blur-[2px] z-10">
                            <tr className="">
                                <th className="pl-8 pr-4 py-2 text-left font-normal text-slate-100/75 text-sm">Session Token</th>
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

                                    <td className="pl-8 pr-4 py-4 text-sm font-semibold">{session.token}</td>
                                    <td className="px-4 py-4 text-sm">{session.startTime || "-"}</td>
                                    <td className="px-4 py-4 text-sm">{session.endTime || "-"}</td>
                                    <td className="px-4 py-4 text-xs capitalize">
                                        <div className="bg-red-500 w-min rounded p-1 px-2">{session.status}</div>
                                    </td>
                                    <td className="px-4 py-4 text-xs capitalize">
                                        <div className="bg-red-500 w-min rounded p-1 px-2">{session.session_result && calcFraudLevel(session.session_result.totalSeverity) || "LOW"}</div>
                                    </td>
                                    <td className="pr-8 pl-4 py-4 text-xs capitalize flex justify-start items-center gap-4">
                                       <div onClick={() => router.push(pathname + "/analytics/" + session.token)} className="bg-blue-500 w-max rounded p-1 px-2 cursor-pointer flex gap-1 items-center ">
                                            <ChartLineIcon className="w-4" /> Session Result</div>
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

export default SessionTable;
