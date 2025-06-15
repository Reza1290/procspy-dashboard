"use client"
import { MouseEventHandler, useEffect, useRef, useState } from "react";
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
import { useSideSheet } from "../../../../context/SideSheetProvider";
import SheetHeader from "../../../../components/ui/sheet/SheetHeader";


export type Room = {
    id: string
    roomId: string
    title?: string
};

const RoomTable = () => {

    const [rooms, setRooms] = useState<Room[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const pathname = usePathname()
    const router = useRouter()

    const { openSheet, closeSheet } = useSideSheet()

    useEffect(() => {

        fetchRooms(1);
    }, []);

    const fetchRooms = async (nextPage: number) => {
        try {
            const token = await session();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/rooms?page=${nextPage}&paginationLimit=15`, {
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
                setRooms([])
                fetchRooms(1)
                openModal(
                    <AlertModal>
                        <TitleModal>Success</TitleModal>
                        <BodyModal><p className="text-sm text-slate-300">Data saved</p>
                        </BodyModal>
                    </AlertModal>
                )
                setTimeout(() => {
                    closeModal()
                }, 2000)
            } else {
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
        } catch (error) {
            openModal(
                <AlertModal>
                    <TitleModal>Sorry</TitleModal>
                    <BodyModal><p className="text-sm dark:text-slate-300">Something went wrong</p>
                    </BodyModal>
                </AlertModal>
            )
            setTimeout(() => {
                closeModal()
            }, 3000)
        }
    }

    const handleAddRoom = async () => {
        handleSheet({ room: null, onClick: () => addRoom({ roomId: roomIdRef.current.value, title: titleRoomRef.current.value }) })
    }

    const addRoom = async ({ title, roomId }: { title?: string, roomId: string }) => {
        closeSheet()
        try {
            const jwt = await session()
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/room`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`
                    },
                    body: JSON.stringify({
                        title, roomId
                    })

                }
            )
            const data = await response.json()
            if (response.ok) {

                openModal(
                    <AlertModal>
                        <TitleModal>Success</TitleModal>
                        <BodyModal><p className="text-sm text-slate-300">Data saved</p>
                        </BodyModal>
                    </AlertModal>
                )
                fetchRooms(1)
                setTimeout(() => {
                    closeModal()
                }, 2000)
            } else {
                openModal(
                    <AlertModal>
                        <TitleModal>Failed</TitleModal>
                        <BodyModal><p className="text-sm dark:text-slate-300">Data not saved {data.error}</p>
                        </BodyModal>
                    </AlertModal>
                )
                setTimeout(() => {
                    closeModal()
                }, 2000)
            }
        } catch (error) {
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

    const roomIdRef = useRef<HTMLInputElement>(null)
    const titleRoomRef = useRef<HTMLInputElement>(null)

    const handleSheet = async ({ room, onClick }: { room?: Room | null, onClick?: MouseEventHandler }) => {
        openSheet(
            <div className="w-96 flex flex-col gap-4 h-full">
                <SheetHeader>Edit Proctored User</SheetHeader>
                <p className="text-sm dark:text-slate-500">Make change for Proctored User, click Save when done.</p>

                <div className="flex flex-col gap-2 mt-20">
                    <label htmlFor="roomId" className="text-sm dark:text-slate-100 font-medium">Room Id</label>
                    <input ref={roomIdRef} type="text" id="roomId" className="p-2 text-sm px-2 bg-white/5 border dark:border-white/15 rounded-md" defaultValue={room ? room.roomId : ""} />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="titleRoom" className="text-sm dark:text-slate-100 font-medium">Title</label>
                    <input ref={titleRoomRef} type="text" id="titleRoom" className="p-2 text-sm px-2 bg-white/5 border dark:border-white/15 rounded-md" defaultValue={room ? room.title : ""} />
                </div>
                <div className="mt-auto flex flex-col gap-1 p-1">
                    <div className="bg-slate-100 rounded-md text-black/90 p-1 text-center text-sm font-medium py-2 cursor-pointer" onClick={onClick}>
                        Save Change
                    </div>
                </div>
            </div>
        )
    }


    return (
        <div className="">
            <div className="overflow-x-auto border-b dark:border-white/15">
                <div className="flex justify-between mx-8 my-4">
                    <div>

                    </div>
                    <button
                        onClick={() => handleAddRoom()}
                        className="bg-blue-500 p-2 px-4 text-sm rounded-md min-w-32 hover:bg-blue-600 dark:text-black text-white"
                    >
                        Add Variable
                    </button>
                </div>
                <div className="relative max-h-[90vh] overflow-y-auto" onScroll={handleScroll} ref={scrollRef}>
                    <table className="min-w-full table-fixed">
                        <thead className="sticky top-0  z-10 backdrop-blur-[2px]">
                            <tr className="">
                                <th className="pl-8 pr-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Room Id</th>
                                <th className="pl-8 pr-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Room Title</th>
                                <th className="pl-8 pr-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Join</th>
                                <th className="pr-8 pl-4 text-left font-normal dark:text-slate-100/75 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room) => (
                                <tr key={room.id} className="border-t border-white/10 hover:bg-gray-600/30">
                                    <td className="pl-8 pr-4 py-4 text-sm font-medium">{room.roomId}</td>
                                    <td className="px-4 py-4 text-sm text-sky-500/75 font-medium">{room.title || "No Name"}</td>
                                    <td className="px-4 py-4 text-xs capitalize">
                                        <div onClick={() => router.push(pathname + '/' + room.roomId)} className="bg-blue-500 dark:text-black text-white w-max rounded p-1 px-2 cursor-pointer flex gap-1 items-center">
                                            <ScreenShareIcon className="w-4" /> Join</div>
                                    </td>
                                    <td className="pr-8 pl-4 py-4 text-xs capitalize flex justify-start items-center gap-4">

                                        <PopOver icon={<EllipsisVertical className="max-w-4 aspect-square" />}>
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
