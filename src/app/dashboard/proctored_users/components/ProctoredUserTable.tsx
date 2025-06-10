"use client"
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { EllipsisVertical, Eye, HistoryIcon, PlusIcon, Unplug } from "lucide-react";
import session from "../../../../lib/session";
import PopOver from "../../../../components/ui/PopOver";
import PopOverItem from "../../../../components/ui/PopOverItem";
import { useModal } from "../../../../context/ModalProvider";
import ConfirmModal from "../../../../components/ui/ConfirmModal";
import TitleModal from "../../../../components/ui/modal/TitleModal";
import AlertModal from "../../../../components/ui/AlertModal";
import BodyModal from "../../../../components/ui/modal/BodyModal";
import { useSideSheet } from "../../../../context/SideSheetProvider";
import SheetHeader from "../../../../components/ui/sheet/SheetHeader";


export type ProctoredUser = {
    id: string
    name: string
    email: string
    identifier: string
};

const ProctoredUserTable = () => {

    const [proctoredUsers, setProctoredUsers] = useState<ProctoredUser[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [rooms, setRooms] = useState(null)
    const pathname = usePathname()
    const router = useRouter()
    useEffect(() => {

        fetchProctoredUsers(1);
        fetchRooms()
    }, []);

    const fetchProctoredUsers = async (nextPage: number) => {
        try {
            const token = await session();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/proctored-users?page=${nextPage}&paginationLimit=20`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setProctoredUsers(prev => {
                    const newProctoredUsers = data.data.filter((d: ProctoredUser) => !prev.some(p => p.id === d.id));
                    return [...prev, ...newProctoredUsers];
                });
                setHasMore(nextPage < data.totalPages);
                setLoading(false);
                setPage(nextPage);
            }
        } catch (err) {
            console.error("Failed to fetch session history", err);
        }
    };

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


    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el || loading || !hasMore) return;

        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
            fetchProctoredUsers(page + 1);
        }
    };


    const { openModal, closeModal } = useModal()

    const handleDeleteProctoredUser = async (id: string) => {

        openModal(
            <ConfirmModal onConfirm={() => deleteProctoredUser(id)}>
                <TitleModal>Are you sure want to delete this?</TitleModal>
            </ConfirmModal>
        )


    }

    const deleteProctoredUser = async (id: string) => {
        try {
            const jwt = await session()
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/proctored-user/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`
                    },
                }
            )
            if (response.ok) {
                setProctoredUsers([])
                fetchProctoredUsers(1)
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
                        <TitleModal>Failed</TitleModal>
                        <BodyModal><p className="text-sm text-slate-300">Data not saved</p>
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
                    <BodyModal><p className="text-sm text-slate-300">Something went wrong</p>
                    </BodyModal>
                </AlertModal>
            )
            setTimeout(() => {
                closeModal()
            }, 2000)
        }
    }

    const { openSheet, closeSheet } = useSideSheet()

    const identifierRef = useRef<HTMLInputElement>(null)
    const nameRef = useRef<HTMLInputElement>(null)
    const emailRef = useRef<HTMLInputElement>(null)


    const handleSheet = async ({proctoredUser, onClick}:{ proctoredUser?: ProctoredUser | null, onClick?: MouseEventHandler}) => {
        openSheet(
            <div className="w-96 flex flex-col gap-4 h-full">
                <SheetHeader>Edit Proctored User</SheetHeader>
                <p className="text-sm text-slate-500">Make change for Proctored User, click Save when done.</p>

                <div className="flex flex-col gap-2 mt-20">
                    <label htmlFor="identifier" className="text-sm text-slate-100 font-medium">Identifier</label>
                    <input ref={identifierRef} type="text" id="identifier" className="p-2 text-sm px-2 bg-white/5 border border-white/15 rounded-md" defaultValue={proctoredUser ? proctoredUser.identifier : ""} />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm text-slate-100 font-medium">Name</label>
                    <input ref={nameRef} type="text" id="name" className="p-2 text-sm px-2 bg-white/5 border border-white/15 rounded-md" defaultValue={proctoredUser ? proctoredUser.name : ""} />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm text-slate-100 font-medium">Email</label>
                    <input ref={emailRef} type="text" id="email" className="p-2 text-sm px-2 bg-white/5 border border-white/15 rounded-md" defaultValue={proctoredUser ? proctoredUser.email : ""} />
                </div>
                <div className="mt-auto flex flex-col gap-1 p-1">
                    <div className="bg-slate-100 rounded-md text-black/90 p-1 text-center text-sm font-medium py-2 cursor-pointer" onClick={onClick}>
                        Save Change
                    </div>
                </div>
            </div>
        )
    }
    const handleEditProctoredUser = async (proctoredUser: ProctoredUser) => {

        handleSheet({proctoredUser, onClick: () => editProctoredUser({ id: proctoredUser.id, identifier: identifierRef.current.value, name: nameRef.current.value, email: emailRef.current.value })})
    
    }

    const handleAddProctoredUser = async () => {
        handleSheet({proctoredUser: null, onClick: () => addProctoredUser({ identifier: identifierRef.current.value, name: nameRef.current.value, email: emailRef.current.value })})

    }

    const addProctoredUser = async ({identifier, name, email}:{identifier: string, name: string, email: string}) => {
        closeSheet()
        try {
            const jwt = await session()
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/proctored-user`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`
                    },
                    body: JSON.stringify({
                        identifier, name, email
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
                fetchProctoredUsers(1)
                setTimeout(() => {
                    closeModal()
                }, 2000)
            } else {
                openModal(
                    <AlertModal>
                        <TitleModal>Failed</TitleModal>
                        <BodyModal><p className="text-sm text-slate-300">Data not saved {data.error}</p>
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
                    <BodyModal><p className="text-sm text-slate-300">Something went wrong</p>
                    </BodyModal>
                </AlertModal>
            )
            setTimeout(() => {
                closeModal()
            }, 2000)
        }
    }

    const editProctoredUser = async ({ id, identifier, name, email }: { id: string, identifier: string, name: string, email: string }) => {
        closeSheet()
        try {
            const jwt = await session()
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/proctored-user`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`
                    },
                    body: JSON.stringify({
                        id, identifier, name, email
                    })
                }
            )

            if (response.ok) {

                openModal(
                    <AlertModal>
                        <TitleModal>Success</TitleModal>
                        <BodyModal><p className="text-sm text-slate-300">Data saved</p>
                        </BodyModal>
                    </AlertModal>
                )
                fetchProctoredUsers(1)
                setTimeout(() => {
                    closeModal()
                }, 2000)
            } else {
                openModal(
                    <AlertModal>
                        <TitleModal>Failed</TitleModal>
                        <BodyModal><p className="text-sm text-slate-300">Data not saved</p>
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
                    <BodyModal><p className="text-sm text-slate-300">Something went wrong</p>
                    </BodyModal>
                </AlertModal>
            )
            setTimeout(() => {
                closeModal()
            }, 2000)
        }
    }



    const roomRef = useRef<HTMLSelectElement>(null)

    const handleGenerateSession = async (id: string) => {

        openSheet(
            <div className="w-96 flex flex-col gap-4 h-full">
                <SheetHeader>Generate New Session</SheetHeader>
                <p className="text-sm text-slate-500">Generate New Session for User id {id}.</p>

                <div className="flex flex-col gap-2 mt-20">
                    <label htmlFor="room" className="text-sm font-medium">RoomId</label>
                    <select
                        id="room"
                        ref={roomRef}
                        className="p-2 text-sm bg-white/5 border border-white/15 rounded-md"
                    >
                        <option value="">Select a room</option>
                        {rooms.map((room) => (
                            <option key={room.id} value={room.roomId} className="text-slate-700">
                                {room.roomId}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-auto flex flex-col gap-1 p-1">
                    <div className="bg-slate-100 rounded-md text-black/90 p-1 text-center text-sm font-medium py-2 cursor-pointer" onClick={() => generateSession(id)}>
                        Save Change
                    </div>
                </div>
            </div>
        )
    }

    const generateSession = async (id: string) => {
        closeSheet()
        const roomId = roomRef.current.value
        try {
            const token = await session();
            const res = await fetch("https://192.168.2.5:5050/api/session/", {
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
                openModal(
                    <AlertModal>
                        <TitleModal>Success</TitleModal>
                        <BodyModal><p className="text-sm text-slate-300">Session Generated!</p>
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
                        <BodyModal><p className="text-sm text-slate-300">Data not created {data.error}</p>
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
                    <BodyModal><p className="text-sm text-slate-300">Something went wrong</p>
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
            <div className="overflow-x-auto border-b border-white/15">
                <div className="flex justify-between mx-8 my-4">
                    <div>

                    </div>
                    <button
            onClick={() => handleAddProctoredUser()}
            className="bg-blue-500 p-2 px-4 text-sm rounded-md min-w-32 hover:bg-blue-600"
          >
            Add Proctored User
          </button>
                </div>
                <div className="relative max-h-[90vh] overflow-y-auto" onScroll={handleScroll} ref={scrollRef}>
                    <table className="min-w-full table-fixed">
                        <thead className="sticky top-0  z-10 backdrop-blur-[2px]">
                            <tr className="">
                                <th className="pl-8 pr-4 py-2 text-left font-normal text-slate-100/75 text-sm">Id</th>
                                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Identifier</th>
                                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Name</th>
                                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Email</th>
                                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Generate Session</th>
                                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Sessions</th>
                                <th className="pr-8 pl-4 text-left font-normal text-slate-100/75 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proctoredUsers.map((user: ProctoredUser) => (
                                <tr key={user.id} className="border-t border-white/10 hover:bg-gray-600/30">
                                    <td className="pl-8 pr-4 py-4 text-sm text-white/70">{user.id}</td>
                                    <td className="px-4 py-4 text-sm font-semibold">{user.identifier}</td>
                                    <td className="px-4 py-4 text-sm text-sky-500/75 font-medium">{user.name}</td>
                                    <td className="px-4 py-4 text-sm text-sky-500/75 font-medium">{user.email}</td>
                                    <td className="px-4 py-4 text-xs capitalize">
                                        <div onClick={() => handleGenerateSession(user.id)} className="bg-blue-500 w-max rounded p-1 px-2 cursor-pointer flex gap-1 items-center">
                                            <PlusIcon className="w-4" /> Generate</div>
                                    </td>
                                    <td className="px-4 py-4 text-xs capitalize">
                                        <div onClick={() => router.push(pathname + "/" + user.id + "/sessions/")} className="bg-blue-500 w-max rounded p-1 px-2 cursor-pointer flex gap-1 items-center">
                                            <HistoryIcon className="w-4" /> View Session History</div>
                                    </td>
                                    <td className="pr-8 pl-4 py-4 text-xs capitalize flex justify-start items-center gap-4">
                                        <PopOver icon={<EllipsisVertical className="max-w-4 aspect-square" />}>
                                            <PopOverItem onClick={() => handleEditProctoredUser(user)}>Edit</PopOverItem>
                                            <PopOverItem onClick={() => handleDeleteProctoredUser(user.id)}>Delete</PopOverItem>
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

export default ProctoredUserTable;
