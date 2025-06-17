"use client";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import session from "../../../../../../lib/session";
import { CheckIcon, EllipsisVertical, Eye, InfoIcon, Unplug, XIcon } from "lucide-react";
import { formattedTimestamp } from "../../../../../utils/timestamp";
import { Peer, useWebRtc } from "../../../../../../context/WebRtcProvider";
import ConfirmLogButton from "./ui/ConfirmLogButton";

export enum logType {
    System = "System",
    True = "True",
    False = "False"
}

export type LogProps = {
    id: string;
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
    }
    session: {
        proctoredUserId: string
        token: string
    }

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

    const { peers, notificationCount } = useWebRtc()

    useEffect(() => {
        if (!roomId) return;


        setlogs([]);
        setPage(1);
        setHasMore(true);
        fetchlogs(1);

    }, [peers, roomId])

    useEffect(() => {
        if (!roomId || notificationCount.length === 0) return;
        insertNewLogsFromSocket(1)
    }, [notificationCount]);

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

                setlogs(prev => {
                    const uniqueNewLogs = data.data.filter(
                        (d: LogProps) => !prev.some((p) => p._id === d._id)
                    );

                    if (uniqueNewLogs.length === 0) return prev;

                    return [...prev, ...uniqueNewLogs];
                });

                setHasMore(nextPage < data.totalPages);
                setPage(nextPage);

                requestAnimationFrame(() => {
                    if (el && nextPage > 1) {
                        const newScrollHeight = el.scrollHeight;
                        el.scrollTop = newScrollHeight - prevScrollHeight;
                    } else {
                        el.scrollTop = el.scrollHeight ?? 0
                    }
                });
            }
        } catch (err) {
            console.error("Failed to fetch session history", err);
        } finally {
            setLoading(false);
        }
    };

    const insertNewLogsFromSocket = async (count: number) => {
        setLoading(true);
        try {
            const token = await session();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_ENDPOINT || "https://192.168.2.5:5050"}/api/logs-in-room/${roomId}?page=1&paginationLimit=${count}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await res.json();
            if (res.ok) {
                setlogs(prev => {
                    const uniqueNewLogs = data.data.filter(
                        (d: LogProps) => !prev.some((p) => p._id === d._id)
                    );
                    if (uniqueNewLogs.length === 0) return prev;
                    return [...uniqueNewLogs, ...prev];
                });

                requestAnimationFrame(() => {
                    const el = scrollRef.current;
                    if (el) el.scrollTop = el.scrollHeight;
                });
            }
        } catch (err) {
            console.error("Failed to fetch session history", err);
        } finally {
            setLoading(false);
        }
    }

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
            <div className=" overflow-x-auto border-b border-t dark:border-white/15 ">

                <div
                    className="relative overflow-y-scroll max-h-[90vh]"
                    onScroll={handleScroll}
                    ref={scrollRef}
                >
                    <table className="min-w-full table-fixed">
                        <tbody>
                            {[...logs].reverse().map((log) => <BodyTable key={log._id} log={log} />)}
                        </tbody>
                        <tfoot className="sticky bottom-[-2px] z-40 dark:bg-black bg-white border-t dark:border-white/15">
                            <tr>
                                <th className="pl-8 pr-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Timestamp</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Severity</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm"></th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Proctored User Id</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Session Token</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Flag Key</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Flag Detail</th>
                                <th className="pr-8 pl-4 text-left font-normal dark:text-slate-100/75 text-sm">Action</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LogsTable;


export const BodyTable = memo(function BodyTable({ log }: { log: LogProps }) {

    return <tr
        key={log._id}
        className="border-t dark:border-white/10 dark:dark:hover:bg-gray-600/30 hover:bg-black/5 hover:bg-black/5"
    >
        <td className="pl-8 pr-4 py-3 text-xs capitalize text-right dark:text-slate-100/75">
            {formattedTimestamp(log.timestamp)}
        </td>
        <td className="px-4 py-3 text-xs capitalize">
            <div className="bg-red-500 text-white w-min rounded p-1 px-2">
                {log.flag.severity}
            </div>
        </td>
        <td className="px-4 py-3 min-w-min">
            <InfoIcon />
        </td>
        <td className="px-4 py-3 text-xs font-normal text-sky-300">
            {log.session.proctoredUserId || "-"}
        </td>
        <td className="px-4 py-3 text-xs font-normal text-sky-300">
            {log.session.token || "-"}
        </td>
        <td className="px-4 py-3 text-xs font-semibold">
            {log.flagKey || "-"}
        </td>
        <td className="px-4 py-3 text-xs ">
            <div className="flex flex-col gap-2">
                <div className="font-medium">{log.flag.label || "-"} {log.attachment.title || log.attachment?.shortcut && <span className="font-normal bg-white/10 dark:border-white/15 rounded px-1 border"> {log.attachment?.title ? log.attachment.title : log.attachment.shortcut ? log.attachment.shortcut :"Unknown"}</span>} {log.attachment.url || log.attachment?.desc && <span className="font-light rounded px-1 italic text-sky-500 "> {log.attachment?.url ? log.attachment.url : log.attachment?.desc? log.attachment.desc: "Unknown"}</span>}</div>
                {
                    (log.attachment.file) && (
                        <>
                            <div className="flex justify-center items-center rounded-md font-normal bg-white/10 dark:border-white/15 p-2 border max-w-64 aspect-video overflow-hidden">
                                <img className="rounded-md" src={`${process.env.NEXT_PUBLIC_STORAGE_ENDPOINT || 'https://192.168.2.5:5050'}` + log.attachment.file} alt="" />
                            </div>
                        </>
                    )
                }
            </div>
        </td>
        <td className="pr-8 pl-4 py-3 text-xs capitalize">
            {
                !["CONNECT", "DISCONNECT"].includes(log.flagKey) && (
                    <ConfirmLogButton id={log._id} currentLogType={log.logType}></ConfirmLogButton>
                )
            }
        </td>
    </tr>
})