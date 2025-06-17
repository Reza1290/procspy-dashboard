"use client"
import { useEffect, useRef, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import session from "../../../../../../lib/session";
import { ChartLineIcon, EllipsisVertical, Eye, Unplug } from "lucide-react";
import { FraudLevel, SessionProps } from "../../../../room/[roomId]/users/components/UserSessionTable";
import { useRouter } from "next/navigation";
import PopOver from "../../../../../../components/ui/PopOver";
import SheetHeader from "../../../../../../components/ui/sheet/SheetHeader";
import { useSideSheet } from "../../../../../../context/SideSheetProvider";
import { useModal } from "../../../../../../context/ModalProvider";
import AlertModal from "../../../../../../components/ui/AlertModal";
import TitleModal from "../../../../../../components/ui/modal/TitleModal";
import BodyModal from "../../../../../../components/ui/modal/BodyModal";



const SessionTable = () => {
    const pathname = usePathname()
    const usedPathaname = pathname.split("/")
    usedPathaname.pop()

    const { userId } = useParams()
    const [sessions, setSessions] = useState<SessionProps[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [threshold, setThreshold] = useState(100)
    const { openModal, closeModal } = useModal()

    const { openSheet, closeSheet } = useSideSheet()

    const [rooms, setRooms] = useState(null)

    const router = useRouter()
    useEffect(() => {
        if (!userId) return;

        fetchSessions(1);
        fetchRooms()
        fetchGlobalSetting()
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


    const calcFraudLevel = (totalSeverity: number) => {
        const percentOfThreshold = (totalSeverity / threshold) * 100;

        return percentOfThreshold >= 90 ? FraudLevel.CRITICAL :
            percentOfThreshold >= 65 ? FraudLevel.HIGH :
                percentOfThreshold >= 25 ? FraudLevel.MEDIUM :
                    FraudLevel.LOW;
    }

    const handleSessionState = async (token: string, state: string) => {
        try {

            const jwt = await session()

            const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/session/update-status-proctor/${token}/${state}`, {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });

            if (res.ok) {
                setSessions([])
                fetchSessions(1)
            }
        } catch (error) {

        }
    }

    const roomRef = useRef<HTMLSelectElement>(null)

    const fetchRooms = async () => {
        try {
            const token = await session();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/rooms`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const { data } = await res.json();
                setRooms(data);
            }
        } catch (err) {
            console.error("Failed to fetch rooms", err);
        }
    }

    const handleAddSession = async () => {

        openSheet(
            <div className="w-96 flex flex-col gap-4 h-full">
                <SheetHeader>Add New Session</SheetHeader>
                <p className="text-sm dark:text-slate-500">Add New Session for user id {userId}</p>

                <div className="flex flex-col gap-2 mt-20">
                    <label htmlFor="room" className="text-sm font-medium">RoomId</label>
                    <select
                        id="room"
                        ref={roomRef}
                        className="p-2 text-sm bg-white/5 border dark:border-white/15 rounded-md"
                    >
                        <option value="">Select a room</option>
                        {rooms.map((room) => (
                            <option key={room.id} value={room.roomId} className="dark:text-slate-700">
                                {room.roomId}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-auto flex flex-col gap-1 p-1">
                    <div className="bg-slate-100 rounded-md text-black/90 p-1 text-center text-sm font-medium py-2 cursor-pointer" onClick={() => addSession(userId as string)}>
                        Save Change
                    </div>
                </div>
            </div>
        )
    }

    const addSession = async (id: string) => {
        closeSheet()
        const roomId = roomRef.current.value
        try {
            const token = await session();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/session/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    proctoredUserId: id,
                    roomId,
                }),
            });
            const data = await res.json()
            if (res.ok) {
                setSessions([])
                fetchSessions(1)
                openModal(
                    <AlertModal>
                        <TitleModal>Success</TitleModal>
                        <BodyModal><p className="text-sm dark:text-slate-300">Session Addd!</p>
                        </BodyModal>
                    </AlertModal>
                )
                setTimeout(() => {
                    closeModal()
                }, 1000)
            } else {
                openModal(
                    <AlertModal>
                        <TitleModal>Failed</TitleModal>
                        <BodyModal><p className="text-sm dark:text-slate-300">Data not created {data.error}</p>
                        </BodyModal>
                    </AlertModal>
                )
                setTimeout(() => {
                    closeModal()
                }, 2000)
            }
        } catch (err) {
            openModal(
                <AlertModal>
                    <TitleModal>Sorry</TitleModal>
                    <BodyModal><p className="text-sm dark:text-slate-300">Something went wrong</p>
                    </BodyModal>
                </AlertModal>
            )
            setTimeout(() => {
                closeModal()
            }, 2000)
        }

    }


    return (
        <div className="">
            <div className="overflow-x-auto border-b dark:border-white/15">
                <div className="flex justify-between mx-8 my-4">
                    <div>

                    </div>
                    <button
                        onClick={() => handleAddSession()}
                        className="bg-blue-500 text-white p-2 px-4 text-sm rounded-md min-w-32 hover:bg-blue-600"
                    >
                        Add Session
                    </button>
                </div>
                <div className="relative max-h-[76vh] overflow-y-auto" onScroll={handleScroll} ref={scrollRef}>
                    <table className="min-w-full table-fixed">
                        <thead className="sticky top-0 backdrop-blur-[2px] z-10">
                            <tr className="">
                                <th className="pl-8 pr-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Session Token</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Start Time</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">End Time</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Room Id</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Session Status</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Fraud Status</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Analytics</th>
                                <th className="pr-8 pl-4 text-left font-normal dark:text-slate-100/75 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session) => (
                                <tr key={session.token} className="border-t dark:border-white/10 dark:hover:bg-gray-600/30 hover:bg-black/5">

                                    <td className="pl-8 pr-4 py-4 text-sm font-semibold">{session.token}</td>
                                    <td className="px-4 py-4 text-sm">{session.startTime || "-"}</td>
                                    <td className="px-4 py-4 text-sm">{session.endTime || "-"}</td>
                                    <td className="px-4 py-4 text-sm font-semibold">{session.roomId || "-"}</td>
                                    <td className="px-4 py-4 text-xs capitalize">
                                        <div className="bg-red-500 text-white w-min rounded p-1 px-2">{session.status}</div>
                                    </td>
                                    <td className="px-4 py-4 text-xs capitalize">
                                        <div className="bg-red-500 text-white w-min rounded p-1 px-2">{session.session_result && calcFraudLevel(session.session_result.totalSeverity) || "LOW"}</div>
                                    </td>
                                    <td className="pr-8 pl-4 py-4 text-xs capitalize gap-4">
                                        <div onClick={() => router.push(usedPathaname.join("/") + "/analytics/" + session.token)} className="bg-blue-500 text-white w-max rounded p-1 px-2 cursor-pointer flex gap-1 items-center ">
                                            <ChartLineIcon className="w-4" /> Session Result</div>
                                    </td>
                                    <td className="pr-8 pl-4 py-4 text-xs capitalize flex justify-start items-center gap-4">
                                        <PopOver icon={<EllipsisVertical className="max-w-4 aspect-square" />}>
                                            <div className="flex flex-col gap-1">
                                                <div onClick={() => handleSessionState(session.token, "canceled")} className="dark:hover:bg-gray-700 hover:bg-slate-100 cursor-pointer rounded text-sm p-1 px-2">
                                                    Cancel
                                                </div>
                                                <div onClick={() => handleSessionState(session.token, "completed")} className="dark:hover:bg-gray-700 hover:bg-slate-100 cursor-pointer rounded text-sm p-1 px-2">
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

export default SessionTable;
