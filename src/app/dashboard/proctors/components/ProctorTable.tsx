"use client"
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { EllipsisVertical, Eye, HistoryIcon, PlusIcon, ToggleLeft, ToggleRight, Unplug } from "lucide-react";
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


export type Proctor = {
    id: string
    name: string
    email: string
    username: string
    active?: boolean
    createdAt?: string
};

const ProctorTable = () => {

    const [proctor, setProctor] = useState<Proctor[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const pathname = usePathname()
    const router = useRouter()
    useEffect(() => {

        fetchProctor(1);
    }, []);

    const fetchProctor = async (nextPage: number) => {
        try {
            const token = await session();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/users?page=${nextPage}&paginationLimit=20`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setProctor(prev => {
                    const newProctor = data.data.filter((d: Proctor) => !prev.some(p => p.id === d.id));
                    return [...prev, ...newProctor];
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
            fetchProctor(page + 1);
        }
    };


    const { openModal, closeModal } = useModal()

    const handleDeleteProctor = async (id: string) => {

        openModal(
            <ConfirmModal onConfirm={() => deleteProctor(id)}>
                <TitleModal>Are you sure want to delete this?</TitleModal>
            </ConfirmModal>
        )


    }

    const deleteProctor = async (id: string) => {
        try {
            const jwt = await session()
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/user/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`
                    },
                }
            )
            if (response.ok) {
                setProctor([])
                fetchProctor(1)
                openModal(
                    <AlertModal>
                        <TitleModal>Success</TitleModal>
                        <BodyModal><p className="text-sm dark:text-slate-300">Data saved</p>
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
                        <BodyModal><p className="text-sm dark:text-slate-300">Data not saved</p>
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

    const { openSheet, closeSheet } = useSideSheet()

    const usernameRef = useRef<HTMLInputElement>(null)
    const nameRef = useRef<HTMLInputElement>(null)
    const emailRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)


    const handleSheet = async ({proctor, onClick, register = false}:{ proctor?: Proctor | null, onClick?: MouseEventHandler, register?: boolean}) => {
        openSheet(
            <div className="w-96 flex flex-col gap-4 h-full">
                <SheetHeader>Edit Proctored User</SheetHeader>
                <p className="text-sm dark:text-slate-500">Make change for Proctored User, click Save when done.</p>

                <div className="flex flex-col gap-2 mt-20">
                    <label htmlFor="username" className="text-sm dark:text-slate-100 font-medium">Username</label>
                    <input ref={usernameRef} type="text" id="username" className="p-2 text-sm px-2 bg-white/5 border dark:border-white/15 rounded-md" defaultValue={proctor ? proctor.username : ""} />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm dark:text-slate-100 font-medium">Name</label>
                    <input ref={nameRef} type="text" id="name" className="p-2 text-sm px-2 bg-white/5 border dark:border-white/15 rounded-md" defaultValue={proctor ? proctor.name : ""} />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm dark:text-slate-100 font-medium">Email</label>
                    <input ref={emailRef} type="text" id="email" className="p-2 text-sm px-2 bg-white/5 border dark:border-white/15 rounded-md" defaultValue={proctor ? proctor.email : ""} />
                </div>
                {
                    register && (
                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-sm dark:text-slate-100 font-medium">Password</label>
                            <input ref={passwordRef} type="text" id="password" className="p-2 text-sm px-2 bg-white/5 border dark:border-white/15 rounded-md" />
                        </div>
                    )
                }
                <div className="mt-auto flex flex-col gap-1 p-1">
                    <div className="bg-slate-100 rounded-md text-black/90 p-1 text-center text-sm font-medium py-2 cursor-pointer" onClick={onClick}>
                        Save Change
                    </div>
                </div>
            </div>
        )
    }
    const handleEditProctor = async (proctor: Proctor) => {

        handleSheet({proctor, onClick: () => editProctor({ id: proctor.id, username :usernameRef.current.value, name: nameRef.current.value, email: emailRef.current.value }), })
    
    }

    const handleAddProctor = async () => {
        handleSheet({proctor: null, onClick: () => addProctor({ username :usernameRef.current.value, name: nameRef.current.value, email: emailRef.current.value, password: passwordRef.current.value}),register: true})

    }

    const addProctor = async ({username, name, email, password}:{username: string, name: string, email: string, password: string}) => {
        closeSheet()
        try {
            const jwt = await session()
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`
                    },
                    body: JSON.stringify({
                        username, name, email, password
                    })
                    
                }
            )
            const data = await response.json()
            if (response.ok) {
                
                openModal(
                    <AlertModal>
                        <TitleModal>Success</TitleModal>
                        <BodyModal><p className="text-sm dark:text-slate-300">Data saved</p>
                        </BodyModal>
                    </AlertModal>
                )
                fetchProctor(1)
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

    const editProctor = async ({ id, username, name, email }: { id: string, username: string, name: string, email: string }) => {
        closeSheet()
        try {
            const jwt = await session()
            const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/user`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`
                    },
                    body: JSON.stringify({
                        id, username, name, email
                    })
                }
            )

            if (response.ok) {

                openModal(
                    <AlertModal>
                        <TitleModal>Success</TitleModal>
                        <BodyModal><p className="text-sm dark:text-slate-300">Data saved</p>
                        </BodyModal>
                    </AlertModal>
                )
                setProctor([])
                fetchProctor(1)
                setTimeout(() => {
                    closeModal()
                }, 2000)
            } else {
                openModal(
                    <AlertModal>
                        <TitleModal>Failed</TitleModal>
                        <BodyModal><p className="text-sm dark:text-slate-300">Data not saved</p>
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

    const handleActivateUser = async (id: string) => {
        activateUser(id)
    }

    const activateUser = async (id: string) => {
        closeSheet()
        try {
            const token = await session();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/activate-user/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json()
            if (res.ok) {
                setProctor([])
                fetchProctor(1)
                openModal(
                    <AlertModal>
                        <TitleModal>Success</TitleModal>
                        <BodyModal><p className="text-sm dark:text-slate-300">Account Activated!</p>
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
            onClick={() => handleAddProctor()}
            className="bg-blue-500 text-white p-2 px-4 text-sm rounded-md min-w-32 hover:bg-blue-600"
          >
            Add Proctored User
          </button>
                </div>
                <div className="relative max-h-[90vh] overflow-y-auto" onScroll={handleScroll} ref={scrollRef}>
                    <table className="min-w-full table-fixed">
                        <thead className="sticky top-0  z-10 backdrop-blur-[2px]">
                            <tr className="">
                                <th className="pl-8 pr-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Id</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Email</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Name</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Username</th>
                                <th className="px-4 py-2 text-left font-normal dark:text-slate-100/75 text-sm">Activate</th>
                                <th className="pr-8 pl-4 text-left font-normal dark:text-slate-100/75 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proctor.map((user: Proctor) => (
                                <tr key={user.id} className="border-t dark:border-white/10 dark:hover:bg-gray-600/30 hover:bg-black/5">
                                    <td className="pl-8 pr-4 py-4 text-sm dark:text-white/70">{user.id}</td>
                                    <td className="px-4 py-4 text-sm font-semibold">{user.email}</td>
                                    <td className="px-4 py-4 text-sm text-sky-500/75 font-medium">{user.name}</td>
                                    <td className="px-4 py-4 text-sm text-sky-500/75 font-medium">{user.username}</td>
                                    <td className="px-4 py-4 text-xs capitalize">
                                        <div onClick={() => handleActivateUser(user.id)} className="w-max rounded p-1 px-2 cursor-pointer  gap-1 items-center">
                                            {user?.active ? 
                                            <div className="flex items-center gap-1">
                                                <ToggleRight className="" ></ToggleRight>  Deactivate 
                                            </div>
                                            :    
                                            <div className="flex items-center gap-1">

                                            <ToggleLeft className="" > </ToggleLeft> Activate 
                                            </div>
                                        }
                                        </div>
                                    </td>
                                    
                                    <td className="pr-8 pl-4 py-4 text-xs capitalize flex justify-start items-center gap-4">
                                        <PopOver icon={<EllipsisVertical className="max-w-4 aspect-square" />}>
                                            {/* <PopOverItem onClick={() => handleResetPasswordProctor(user.id)}>Reset Password</PopOverItem> */}
                                            <PopOverItem onClick={() => handleEditProctor(user)}>Edit</PopOverItem>
                                            {/* <PopOverItem onClick={() => handleDeleteProctor(user.id)}>Delete</PopOverItem> */}
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

export default ProctorTable;
