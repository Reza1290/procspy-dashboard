import { CheckIcon, LogInIcon, XIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useWebRtc } from "../../../../../../context/WebRtcProvider";
import session from "../../../../../../lib/session";
import LogComponent from "./ui/LogComponent";

export enum logType {
    System = "System",
    True = "True",
    False = "False"
}

export type LogProps = {
    id: string;
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
const LogsWindow = ({ token, canDrag = false }: { token: string, canDrag?: boolean }) => {

    const [logs, setlogs] = useState<LogProps[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const initialLoadRef = useRef(false);

    const { peers, notificationCount, setNotificationCount } = useWebRtc()

    useEffect(() => {
        if (!token) return;
        setlogs([]);
        setPage(1);
        setHasMore(true);
        fetchlogs(1);

    }, [peers, token])

    useEffect(() => {
        if (!token || notificationCount.length === 0) return;

        if(notificationCount.find((e)=> e.token === token)){
            insertNewLogsFromSocket(1)
            setNotificationCount((prev) => {
                return prev.filter(e => e.token !== token)
            })
        }
    }, [notificationCount]);

    const fetchlogs = async (nextPage: number) => {
        setLoading(true);
        try {
            const jwt = await session();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_ENDPOINT || "https://192.168.2.5:5050"}/api/logs-proctored-user/${token}?page=${nextPage}&paginationLimit=7`,
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
            );
            const data = await res.json();
            if (res.ok) {


                const el = scrollRef.current;

                const prevScrollHeight = el ? el.scrollHeight : 0;

                setlogs(prev => {
                    const uniqueNewLogs = data.data.filter(
                        (d: LogProps) => !prev.some((p) => p.id === d.id)
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
                        el.scrollTop = el.scrollHeight
                    }
                });
            }
        } catch (err) {
            console.error("Failed to fetch logs history", err);
        } finally {
            setLoading(false);
        }
    };


    const [height, setHeight] = useState(300);
    const startY = useRef(0);
    const startHeight = useRef(0);

    const onMouseDown = (e: any) => {
        startY.current = e.clientY;
        startHeight.current = height;
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e: any) => {
        const dy = startY.current - e.clientY;
        const newHeight = Math.min(
            Math.max(startHeight.current + dy, 100),
            window.innerHeight - 100
        );
        setHeight(newHeight);
    };

    const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    };

    const insertNewLogsFromSocket = async (count: number) => {
        setLoading(true);
        try {
            const jwt = await session();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_ENDPOINT || "https://192.168.2.5:5050"}/api/logs-proctored-user/${token}?page=1&paginationLimit=${count}`,
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
            );
            const data = await res.json();
            if (res.ok) {
                setlogs(prev => {
                    const uniqueNewLogs = data.data.filter(
                        (d: LogProps) => !prev.some((p) => p.id === d.id)
                    );
                    if (uniqueNewLogs.length === 0) return prev;
                    return [ ...uniqueNewLogs, ...prev];
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
        <div className="w-full">
            {
                canDrag && (
                    <div className="cursor-row-resize border-t border-white/10" onMouseDown={onMouseDown}>

                    </div>
                )
            }
            <div className={`relative flex flex-col w-full gap-3 p-4 overflow-y-scroll ${ canDrag ? "" : "max-h-[25vh]"}  [&::-webkit-scrollbar]:w-2
                            [&::-webkit-scrollbar-track]:rounded-full
                            [&::-webkit-scrollbar-track]:bg-gray-100
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            [&::-webkit-scrollbar-thumb]:bg-gray-300
                            dark:[&::-webkit-scrollbar-track]:bg-black
                            dark:[&::-webkit-scrollbar-thumb]:bg-gray-600`}
                onScroll={handleScroll}
                style={{ height }}
                ref={scrollRef}
            >

                {
                    [...logs].reverse().map((val) => (
                        <LogComponent key={val.id} log={val} />
                    ))
                }
            </div>
        </div>
    );
}

export default LogsWindow;