"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import session from "../../../../../../lib/session";
import { EllipsisVertical, Eye, InfoIcon, Unplug } from "lucide-react";
import { formattedTimestamp } from "../../../../../utils/timestamp";
import { useWebRtc } from "../../../../../../context/WebRtcProvider";

export enum logType {
    System = "System",
    True = "True",
    False = "False"
}

export type LogProps = {
    _id: string;
    sessionId: string;
    attachment?: any;
    logType: logType;
    timestamp: string;
    flagKey?: string | null;
    flag: {
        id: string;
        flagKey: string;
        label: string;
        severity: number;
    };
};

const LogsTable = () => {
    const pathname = usePathname();
    const { roomId } = useParams();
    const [logs, setlogs] = useState<LogProps[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const initialLoadRef = useRef(false);

    const { peers, eventRef } = useWebRtc()
    useEffect(() => {
        console.log("Peers changed:", peers);
        if (!roomId) return;
        setlogs([]);
        setPage(1);
        setHasMore(true);
        fetchlogs(1);
    }, [peers, roomId]);

    useEffect(() => {
        if (!eventRef.current) return;

        const handleEvent = () => {
            if (!roomId) return;
            setlogs([]);
            setPage(1);
            setHasMore(true);
            fetchlogs(1);
        };

        eventRef.current.on("log", handleEvent);

        return () => {
            eventRef.current?.off("log", handleEvent);
        };
    }, [eventRef, roomId]);

    const fetchlogs = async (nextPage: number) => {
        setLoading(true);
        try {
            const token = await session();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_ENDPOINT || "https://192.168.2.5:5050"}/api/logs-in-room/${roomId}?page=${nextPage}&paginationLimit=20`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await res.json();
            if (res.ok) {


                const el = scrollRef.current;
                const prevScrollHeight = el?.scrollHeight || 0;

                setlogs((prev) => {
                    const uniqueNewLogs = data.data.filter(
                        (d: LogProps) => !prev.some((p) => p._id === d._id)
                    );
                    return [...uniqueNewLogs, ...prev];
                });

                setHasMore(nextPage < data.totalPages);
                setPage(nextPage);

                requestAnimationFrame(() => {
                    if (el) {
                        const newScrollHeight = el.scrollHeight;
                        el.scrollTop = newScrollHeight - prevScrollHeight;
                    }
                });
            }
        } catch (err) {
            console.error("Failed to fetch session history", err);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el || loading || !hasMore) return;

        if (el.scrollTop <= 50) {
            fetchlogs(page + 1);
        }
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el && logs.length > 0 && !initialLoadRef.current) {
            requestAnimationFrame(() => {
                el.scrollTop = el.scrollHeight;
            });
            initialLoadRef.current = true;
        }
    }, [logs]);

    return (
        <div className="">
            <div className="overflow-x-auto border-b border-t border-white/15">
                <div
                    className="relative overflow-y-scroll max-h-screen"
                    onScroll={handleScroll}
                    ref={scrollRef}
                >
                    <table className="min-w-full table-fixed">
                        <tbody>
                            {[...logs].reverse().map((log) => (
                                <tr
                                    key={log._id}
                                    className="border-t border-white/10 hover:bg-gray-600/30"
                                >
                                    <td className="pl-8 pr-4 py-3 text-xs capitalize text-right text-slate-100/75">
                                        {formattedTimestamp(log.timestamp)}
                                    </td>
                                    <td className="px-4 py-3 text-xs capitalize">
                                        <div className="bg-red-500 w-min rounded p-1 px-2">
                                            {log.flag.severity}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 min-w-min">
                                        <InfoIcon />
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold">
                                        {log.flagKey || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-xs ">
                                        <div className="flex flex-col gap-2">
                                            <div className="font-medium">{log.flag.label || "-"} {log.attachment.title && <span className="font-normal bg-white/10 border-white/15 rounded px-1 border"> {log.attachment?.title ?? "Unknown"}</span>} {log.attachment.url && <span className="font-light rounded px-1 italic text-sky-500"> {log.attachment?.url ?? "Unknown"}</span>}</div>
                                            {
                                                (log.attachment.file) && (
                                                    <>
                                                        <div className="flex justify-center items-center rounded-md font-normal bg-white/10 border-white/15 p-2 border max-w-64 aspect-video">
                                                            <img className="rounded-md" src={`${process.env.STORAGE_ENDPOINT || 'https://192.168.2.5:5050'}` + log.attachment.file} alt="" />
                                                        </div>
                                                    </>
                                                )
                                            }
                                        </div>
                                    </td>
                                    <td className="pr-8 pl-4 py-3 text-xs capitalize">
                                        <EllipsisVertical className="max-w-4 aspect-square" />
                                    </td>
                                </tr>
                            ))}
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-sm text-white/60">
                                        Loading...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LogsTable;
