'use client'
import { useParams } from "next/navigation";
import Header from "../../../../../components/ui/Header";
import LogsTable from "./components/LogsTable";
import { useEffect } from "react";
import { useWebRtc } from "../../../../../context/WebRtcProvider";
import HeaderTitle from "../../../../../components/ui/HeaderTitle";

export default function Page() {
    const { roomId } = useParams()
    const { connected, setData } = useWebRtc()
    useEffect(() => {
        console.log(connected)
        if (connected) return;
        setData({
            roomId: roomId as string,
            singleConsumerSocketId: null,
        });
    }, [])
    
    return (
        <div className="min-h-screen flex flex-col">
            <Header>
                <HeaderTitle>Logs Room {roomId}</HeaderTitle>
            </Header>
            <div className="flex flex-col justify-end min-h-full w-full h-[90vh] overflow-hidden">
                <LogsTable></LogsTable>
            </div>
        </div>
    );
}