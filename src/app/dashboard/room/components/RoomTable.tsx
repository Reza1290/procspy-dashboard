"use client"
import { useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { EllipsisVertical, Eye, HistoryIcon, ScreenShareIcon, Unplug } from "lucide-react";
import session from "../../../../lib/session";
import PopOver from "../../../../components/ui/PopOver";
import PopOverItem from "../../../../components/ui/PopOverItem";
import { useModal } from "../../../../context/ModalProvider";
import AlertModal from "../../../../components/ui/AlertModal";
import TitleModal from "../../../../components/ui/modal/TitleModal";
import BodyModal from "../../../../components/ui/modal/BodyModal";
import ConfirmModal from "../../../../components/ui/ConfirmModal";


export type Room = {
    id: string
    roomId: string
};

const RoomTable = () => {

    const [rooms, setRooms] = useState<Room[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const pathname = usePathname()
    const router = useRouter()
    useEffect(() => {

        fetchRooms(1);
    }, []);

    const fetchRooms = async (nextPage: number) => {
        try {
            const token = await session();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/rooms?page=${nextPage}&paginationLimit=20`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setRooms(prev => {
                    const newRooms = data.data.filter((d: Room) => !prev.some(p => p.id === d.id));
                    return [...prev, ...newRooms];
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
            fetchRooms(page + 1);
        }
    };
    const { openModal, closeModal } = useModal()

    const handleDeleteRoom = async (id: string) => {

        openModal(
            <ConfirmModal onConfirm={() => deleteRoom(id)}>
                <TitleModal>Are you sure want to delete this?</TitleModal>
            </ConfirmModal>
        )


    }

    const deleteRoom = async (id: string) => {
        try {
            const jwt = await session()
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/room/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`
                    },
                }
            )
            if (response.ok) {

                setTimeout(() => {
                    openModal(
                        <>Success!</>
                    )
                }, 3000)
            } else {
                openModal(
                    <>Failed!</>
                )
                setTimeout(() => {
                    closeModal()
                }, 3000)
            }
        } catch (error) {
            openModal(
                <AlertModal>
                    <TitleModal>Sorry</TitleModal>
                    <BodyModal><p className="text-sm text-slate-300">Something went wrong</p>
                    </BodyModal>
                </AlertModal>
            )
            setTimeout(() => {
                closeModal()
            }, 3000)
        }
    }


    return (
        <div className="">
            <div className="overflow-x-auto border-b border-white/15">
                <div className="mx-8 my-4">
                    Filter
                </div>
                <div className="relative max-h-[76vh] overflow-y-auto" onScroll={handleScroll} ref={scrollRef}>
                    <table className="min-w-full table-fixed">
                        <thead className="sticky top-0  z-10 backdrop-blur-[2px]">
                            <tr className="">
                                <th className="pl-8 pr-4 py-2 text-left font-normal text-slate-100/75 text-sm">Room Id</th>
                                <th className="pl-8 pr-4 py-2 text-left font-normal text-slate-100/75 text-sm">Connected Users</th>
                                <th className="pl-8 pr-4 py-2 text-left font-normal text-slate-100/75 text-sm">Join</th>
                                <th className="pr-8 pl-4 text-left font-normal text-slate-100/75 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room) => (
                                <tr key={room.id} className="border-t border-white/10 hover:bg-gray-600/30">
                                    <td className="pl-8 pr-4 py-4 text-sm font-medium">{room.roomId}</td>
                                    <td className="px-4 py-4 text-sm text-sky-500/75 font-medium">-</td>
                                    <td className="px-4 py-4 text-xs capitalize">
                                        <div onClick={() => router.push(pathname + '/' + room.roomId)} className="bg-blue-500 w-max rounded p-1 px-2 cursor-pointer flex gap-1 items-center">
                                            <ScreenShareIcon className="w-4" /> Join</div>
                                    </td>
                                    <td className="pr-8 pl-4 py-4 text-xs capitalize flex justify-start items-center gap-4">

                                        <PopOver icon={<EllipsisVertical className="max-w-4 aspect-square" />}>
                                            <PopOverItem onClick={() => { }}>Edit</PopOverItem>
                                            <PopOverItem onClick={() => handleDeleteRoom(room.id)}>Delete</PopOverItem>
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

export default RoomTable;
