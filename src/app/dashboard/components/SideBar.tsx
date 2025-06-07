'use client'
import { useEffect, useState } from "react"
import { SideBarLogProvider } from "../providers/SideBarLogProvider"
import SideBarLog from "../room/ui/SideBarLog"
import { useParams, usePathname, useRouter } from "next/navigation"
import UsersSidebar from "../ui/UsersSidebar"
import { CctvIcon, FlagIcon, HomeIcon, MonitorIcon, PanelRightOpen, SettingsIcon, UserRound, UserRoundIcon, UserRoundSearchIcon, UsersRound, UsersRoundIcon } from "lucide-react"
import SideBarItem from "./ui/SideBarItem"
import { useModal } from "../../../context/ModalProvider"
import ConfirmModal from "../../../components/ui/ConfirmModal"



export default function SideBar() {
    const router = useRouter()
    const { roomId, socketId } = useParams()
    const pathname = usePathname()
    const [active, setActive] = useState(false)
    const [usersSidebar, setUsersSidebar] = useState(false)


    const { openModal } = useModal()

    const handleRedirect = (path: string) => {
        openModal(
            <ConfirmModal
                element={
                    <div className="flex flex-col gap-4">
                        <h1 className="font-bold">Exit Proctoring Mode</h1>
                        <p className="text-sm text-slate-300">Are you sure you want to leave proctoring mode?</p>
                    </div>

                }
                onConfirm={() => {
                    router.push(path)
                }}
                onCancel={() => {
                    
                }}
            />
        )
    }

    const handleActiveToggle = (path: string) => {
        setActive(true)
        if (pathname !== path) {
            if (pathname.includes("/dashboard/room") && !path.includes("/dashboard/room")) {
                handleRedirect(path)
            } else {
                router.push(path)
            }
        }
    }

    const closeSidebar = () => {
        setActive(false)
    }

    return (
        <div className={`${active ? 'w-full' : 'w-[3.7rem] '} max-w-56 transition-all duration-500 overflow-hidden delay-100 ease-in-out flex flex-col p-auto h-screen border-r border-white/15  bg-gradient-to-b from-black to-slate-950 `}>
            <div className="flex justify-between items-center min-h-[10vh] w-full border-b border-white/15 px-2">
                <div className={`flex gap-4 items-center`}>
                    <div className="min-w-10 max-w-10 h-10 bg-white rounded p-1">
                        <img className="" src="/image/logo.png" alt="" />
                    </div>
                    <div className="font-semibold">
                        <h1>Procspy 1.0</h1>
                    </div>
                </div>


                <div className={` ${active ? "opacity-100" : "opacity-0"} transition-all duration-500 hover:opacity-100 opacity-70`}>
                    <PanelRightOpen className="border border-transparent hover:border-white/50 cursor-pointer rounded-md " onClick={closeSidebar} />
                </div>

            </div>
            <div className="flex flex-col justify-between min-h-[90vh]">

                <div className="flex flex-col items-start w-full p-2 py-4">
                    <div className="flex flex-col items-start gap-3 w-full">
                        <SideBarItem onClick={() => handleActiveToggle('/dashboard/')} active={(pathname === '/dashboard')} icon={HomeIcon} label="Dashboard"></SideBarItem>
                        {
                            roomId ? <>
                                <SideBarItem onClick={() => handleActiveToggle(`/dashboard/room/${roomId}`)} active={(pathname === `/dashboard/room/${roomId}`)} icon={MonitorIcon} label="Proctoring Mode"></SideBarItem>
                                <SideBarItem onClick={() => handleActiveToggle(`/dashboard/room/${roomId}/users`)} active={(pathname === `/dashboard/room/${roomId}/users`)} icon={UserRoundSearchIcon} label="Participants"></SideBarItem>
                                <SideBarItem onClick={() => handleActiveToggle(`/dashboard/room/${roomId}/logs`)} active={(pathname === `/dashboard/room/${roomId}/logs`)} icon={FlagIcon} label="Room Logs"></SideBarItem>

                            </> :
                                <SideBarItem onClick={() => handleActiveToggle('/dashboard/room')} active={(pathname === '/dashboard/room')} icon={CctvIcon} label="Proctoring Rooms"></SideBarItem>
                        }

                    </div>
                </div>
                <div className="flex flex-col w-full p-2 items-start gap-2 ">
                    <SideBarItem onClick={() => handleActiveToggle('/dashboard/proctored_users')} active={pathname === '/dashboard/proctored_users'} icon={UsersRoundIcon} label="Proctored Users"></SideBarItem>
                    <SideBarItem onClick={() => handleActiveToggle('/dashboard/settings')} active={pathname === '/dashboard/settings'} icon={SettingsIcon} label="Global Settings"></SideBarItem>
                    <SideBarItem onClick={() => handleActiveToggle('/dashboard/profile')} active={pathname === '/dashboard/profile'} icon={UserRoundIcon} label="Profile"></SideBarItem>
                </div>
            </div>

        </div>
    )
}