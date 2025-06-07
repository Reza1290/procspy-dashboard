'use client'
import { useParams } from "next/navigation";
import Header from "../../../../../components/ui/Header";
import UserSessionTable from "./components/UserSessionTable";
import { useEffect } from "react";
import { useWebRtc } from "../../../../../context/WebRtcProvider";

export default function Page() {
    const { roomId } = useParams()

    const { connected, setData, peers } = useWebRtc()
    useEffect(() => {
        console.log(connected)
        if (connected) return;
        setData({
            roomId: roomId as string,
            singleConsumerSocketId: null,
        });
    }, [])


    return (
        <div className="">
            <Header>
                Users List Room {roomId}
            </Header>
            {
                peers.length > 0 && (
                    <div>
                        <UserSessionTable></UserSessionTable>
                    </div>
                )
            }
        </div>
    );
}