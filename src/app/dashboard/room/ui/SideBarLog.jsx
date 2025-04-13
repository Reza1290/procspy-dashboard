'use client'
import { useSideBarLog } from "../../providers/SideBarLogProvider";
import WindowChangeFlagComponent from '../components/WindowChangeFlagComponent'
import UserDisconnectedFlagComponent from '../components/UserDisconnectedFlagComponent'
import KeyStrokeFlagComponent from '../components/KeyStrokeFlagComponent'
import UserConnectedFlagComponent from '../components/UserConnectedFlagComponent'
import KeyboardFlagComponent from '../components/KeyboardFlagComponent'
import { useEffect, useState } from "react";
import session from "../../../../lib/session";

const SideBarLog = () => {
    const getFlagComponent = (flagKey) => {
        const windowFlags = [
            'SWITCH_TAB',
            'MINIMIZE_WINDOW',
            'CLOSED_EXAM_TAB',
            'EXIT_FULLSCREEN',
            'MULTIPLE_TABS'
        ]
        const disconnectFlags = [
            'DISCONNECT',
            'CONNECTION_LOST',
            'NETWORK_CHANGE',
            'HIGH_LATENCY',
            'HIGH_PACKET_LOSS'
        ]
        const keystrokeFlags = ['USED_SHORTCUT']
        const connectedFlags = ['CONNECT']
        const keyboardFlags = ['KEYSTROKE']

        if (windowFlags.includes(flagKey)) return WindowChangeFlagComponent
        if (disconnectFlags.includes(flagKey)) return UserDisconnectedFlagComponent
        if (keystrokeFlags.includes(flagKey)) return KeyStrokeFlagComponent
        if (connectedFlags.includes(flagKey)) return UserConnectedFlagComponent
        if (keyboardFlags.includes(flagKey)) return KeyboardFlagComponent

        return null
    }
    const { data, setData } = useSideBarLog()

    const [logsData, setLogsData] = useState([])

    const handleToggleSidebarLog = () => {
        setData((prev) => {
            return {
                isActive: !prev.isActive,
                consumer: [...prev.consumer],
                token: null,
            }
        })
    }

    const fetchLogFromToken = async (userToken) => {
        try {
            const token = await session()
            const response = await fetch(`https://192.168.2.7:5050/api/proctored-user/${userToken}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const responseData = await response.json();


            if (response.ok && Array.isArray(responseData.data?.logs)) {
                const logs = responseData.data.logs;

                setLogsData((prevLogs) => {
                    const updated = [...prevLogs];

                    logs.forEach((incoming) => {
                        const index = updated.findIndex((log) => log.id === incoming.id);

                        if (index !== -1) {
                            updated[index] = { ...updated[index], ...incoming };
                        } else {
                            updated.push(incoming);
                        }
                    });

                    return updated;
                });
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }

    useEffect(() => {
        console.log("data.isActive", data.isActive)
        console.log("data.token", data.token)

        if (data.isActive && data.token != null) {
            fetchLogFromToken(data.token)
        }
    }, [data.isActive, data.token])

    return data.isActive && (
        <div className="flex flex-col justify-start ml-auto max-w-80 w-full border-l border-white/10 bg-gradient-to-t from-black to-slate-900/20 p-4 max-h-screen">
            <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3 w-3/4 p-2">
                    <div className="w-full max-w-4 fill-white/90">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32L0 64 0 368 0 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30l0-247.7c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48l0-16z" /></svg>

                    </div>
                    <p className="truncate">
                        Logs of <span className="font-semibold">user-6541bca123453221114</span>
                    </p>
                </div>
                <div onClick={handleToggleSidebarLog} className="w-full max-w-8 p-2 py-1.5 fill-white/70 hover:bg-white/10 rounded-full hover:border hover:border-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
                </div>
            </div>
            <div className="flex flex-col pl-2 mt-8 gap-2 overflow-y-scroll">
                {logsData.map((flag, idx) => {
                    const Component = getFlagComponent(flag.flagKey)
                    return Component ? <Component key={flag.id} {...flag} /> : null
                })}
            </div>
        </div>


    );
}

export default SideBarLog;

