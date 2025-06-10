"use client"
import { useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import session from "../../../../../../lib/session";
import { ChartLineIcon, EllipsisVertical, Eye, Unplug } from "lucide-react";
import { useWebRtc } from "../../../../../../context/WebRtcProvider";
import PopOver from "../../../../../../components/ui/PopOver";
import { useModal } from "../../../../../../context/ModalProvider";
import AlertModal from "../../../../../../components/ui/AlertModal";
import TitleModal from "../../../../../../components/ui/modal/TitleModal";
import BodyModal from "../../../../../../components/ui/modal/BodyModal";

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
    session_result: SessionResultProps
};
export enum FraudLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export type SessionResultProps = {
    id: string
    sessionId: string
    fraudLevel: FraudLevel
    totalFlags: number
    totalSeverity: number
    falseDetection: number
    trueSeverity: number
    updatedAt?: string
    createdAt?: string
}

const UserSessionTable = () => {

    const router = useRouter()
    const pathname = usePathname()

    const { roomId } = useParams()
    const [sessions, setSessions] = useState<SessionProps[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const { openModal, closeModal } = useModal()

    const [threshold, setThreshold] = useState(100)
    const { peers, data, socketRef } = useWebRtc()

    useEffect(() => {
        if (!roomId) return;
        fetchSessions(1)
        fetchGlobalSetting()
    }, [roomId]);

    useEffect(() => {
        if (peers.length < 0) return
        console.log("NEW JOINED")
        fetchSessions(1)
        fetchGlobalSetting()
    }, [peers])

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
                    const updatedSessions = prev.map(session => ({
                        ...session,
                        isOnline: peers.some(peer => peer.token === session.token),
                    }));

                    const newSessions = data.data
                        .filter((d: SessionProps) => !prev.some(p => p.token === d.token))
                        .map((d: SessionProps) => ({
                            ...d,
                            isOnline: peers.some(peer => peer.token === d.token),
                        }));

                    return [...updatedSessions, ...newSessions]
                });
                setHasMore(nextPage < data.totalPages);
                setLoading(false);
                setPage(nextPage);
            }
        } catch (err) {
            console.error("Failed to fetch session history", err);
        }
    };

    const fetchGlobalSetting = async () => {
        try {
            const token = await session();
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/global-settings?page=1&paginationLimit=1`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const { data } = await response.json()
                setThreshold(parseInt(data[0].value))
            }
        } catch (error) {

        }
    }


    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el || loading || !hasMore) return;

        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
            fetchSessions(page + 1);
        }
    };





    const calcFraudLevel = (totalSeverity: number) => {
        console.log(threshold)
        const percentOfThreshold = (totalSeverity / threshold) * 100;

        return percentOfThreshold >= 90 ? FraudLevel.CRITICAL :
            percentOfThreshold >= 65 ? FraudLevel.HIGH :
                percentOfThreshold >= 25 ? FraudLevel.MEDIUM :
                    FraudLevel.LOW;
    }

    const handleAbortSession = async (token: string, state: string) => {
        await sendAbortMessageToSocket(token, state)
    }

    const sendAbortMessageToSocket = async (token: string, state: string) => {
        socketRef.current.emit("DASHBOARD_SERVER_MESSAGE", {
            data: {
                action: "ABORT_PROCTORING",
                token,
                roomId,
                state,
                error: ":Proctor " + state + " the session"
            }
        }, (data: any) => {

            if (data.success) {
                setSessions([])
                fetchSessions(1)
                openModal(
                    <AlertModal>
                        <TitleModal>Success</TitleModal>
                        <BodyModal><p className="text-sm text-slate-300">State Updated</p>
                        </BodyModal>
                    </AlertModal>
                )
                setTimeout(() => {
                    closeModal()
                }, 2000)
            } else {
                openModal(
                    <AlertModal>
                        <TitleModal>Failed</TitleModal>
                        <BodyModal><p className="text-sm text-slate-300">Cant abort or complete session that not started yet and cancel session that already started</p>
                        </BodyModal>
                    </AlertModal>
                )
                setTimeout(() => {
                    closeModal()
                }, 2000)
            }
        })
    };

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
                                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Analytics</th>
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
                                        <div className="bg-red-500 w-min rounded p-1 px-2 capitalize">{session.session_result != null && calcFraudLevel(session.session_result.totalSeverity) || "LOW"}</div>
                                    </td>
                                    <td className="px-4 py-4 text-xs capitalize gap-4">
                                        <div onClick={() => router.push(pathname + "/analytics/" + session.token)} className="bg-blue-500 w-max rounded p-1 px-2 cursor-pointer flex gap-1 items-center ">
                                            <ChartLineIcon className="w-4" /> Session Result
                                        </div>
                                    </td>
                                    <td className="pr-8 pl-4 py-4 text-xs capitalize flex justify-start items-center gap-4">
                                        <PopOver icon={<EllipsisVertical className="max-w-4 aspect-square" />}>
                                            <div className="flex flex-col gap-1">
                                                <div onClick={() => handleAbortSession(session.token, "aborted")} className="hover:bg-gray-700 cursor-pointer rounded text-sm p-1 px-2">
                                                    Abort
                                                </div>
                                                <div onClick={() => handleAbortSession(session.token, "completed")} className="hover:bg-gray-700 cursor-pointer rounded text-sm p-1 px-2">
                                                    End (Complete)
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
