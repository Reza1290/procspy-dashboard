'use client'
import { useEffect, useState } from "react";
import RoomInput from "../components/RoomInput";
import session from "../../../lib/session";
import { useRouter } from "next/navigation";

const HomeSidebar = ({ active }) => {
    const [roomInput, setRoomInput] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [rooms, setRooms] = useState([])
    const router = useRouter()
    const handleSetRoomInput = () => {
        setRoomInput(!roomInput)
    }

    const getRooms = async () => {
        setIsLoading(true)
        try {
            // const res = await fetch('/api/session')
            // const { token } = await res.json()
            const token = await session()
            const response = await fetch(`${ process.env.ENDPOINT || 'https://192.168.2.5:5050'}/api/rooms`,
                {
                    method: "GET",
                    headers: {

                        "Authorization": `Bearer ${token}`
                    }
                }
            )
            const data = await response.json()
            if (response.ok) {
                setRooms(data.data)
            }
        } catch (e) {

        } finally {
            setIsLoading(false)
        }
    }

    const handleClickRoom = (roomId) => {
        router.push(`/dashboard/room/${roomId}`)
    }

    useEffect(() => {
        getRooms()

    }, [active])
    return (
        <div className={`${active ? 'w-full opacity-100' : 'w-0 opacity-0 overflow-hidden -ml-[3rem] '} transition-all duration-500 delay-200 ease-in-out flex flex-col justify-start max-w-72 border-r border-white/10 bg-gradient-to-bl from-black to-slate-950 py-8 px-6 gap-8`}>
            <div className="flex justify-between items-center">
                <h1 className="text-md font-medium">Room Selector</h1>
                <button onClick={handleSetRoomInput} className="bg-slate-900/50 text-sm rounded-lg border border-white/10 select-none max-w-6 max-h-6 w-full fill-white/80 p-1.5 pt-[0.325rem] ">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" /></svg>
                </button>
            </div>
            {roomInput ? <RoomInput /> : ''}

            <div className="flex flex-col justify-start gap-2">
                {isLoading ? (
                    <div className="flex justify-between items-center w-full p-2 px-3 rounded-lg border-white/10 ">
                        <p className="font-medium text-white/50">Loading Rooms</p>

                    </div>
                ) :
                    rooms && rooms.length > 0 ?
                        rooms.map((v, i) => (
                            <div onClick={() => handleClickRoom(v.roomId)} key={v.id} className="flex justify-between items-center w-full border border-transparent p-2 px-3 hover:bg-white/10  rounded-lg hover:border-white/10 cursor-pointer">
                                <p className="font-medium">{v.roomId}</p>
                                <div className="w-full max-w-2.5 fill-white/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" /></svg>
                                </div>
                            </div>

                        ))
                        : (
                            <div className="flex justify-between items-center w-full p-2 px-3 rounded-lg border-white/10 ">
                                <p className="font-medium text-white/50">No Running Room</p>

                            </div>
                        )
                }
            </div>
        </div>
    );
}

export default HomeSidebar;