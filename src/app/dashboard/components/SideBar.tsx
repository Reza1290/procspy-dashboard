'use client'
import { useEffect, useState } from "react";
import { SideBarLogProvider } from "../providers/SideBarLogProvider";
import SideBarLog from "../room/ui/SideBarLog";
import { useParams, usePathname, useRouter } from "next/navigation";
import UsersSidebar from "../ui/UsersSidebar";
import { HomeIcon, PanelRightOpen, SettingsIcon, UserRound, UserRoundIcon, UsersRound, UsersRoundIcon } from "lucide-react";
import SideBarItem from "./ui/SideBarItem";



export default function SideBar() {
    const router = useRouter()
    const { roomId } = useParams()
    const pathname = usePathname()
    const [active, setActive] = useState(false)
    const [usersSidebar, setUsersSidebar] = useState(false)

    const handleActiveToggle = (path: string) => {
        setActive(true)
        if (pathname !== path) {
            router.push(path)
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
                            roomId != undefined && <>

                                <div onClick={() => {
                                    setActive(false)
                                    router.push(`/dashboard/room/${roomId}/users`)
                                }} className="w-full fill-white/50  hover:bg-white/15 p-2.5 rounded-md max-w-10 flex h-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z" /></svg>
                                </div>
                                <div onClick={() => {
                                    setActive(false)
                                    router.push(`/dashboard/room/${roomId}/logs`)
                                }} className="w-full fill-white/50  hover:bg-white/15 p-3 rounded-md max-w-10 max-h-10 flex h-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32L0 64 0 368 0 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30l0-247.7c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48l0-16z" /></svg>
                                </div>
                            </>
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