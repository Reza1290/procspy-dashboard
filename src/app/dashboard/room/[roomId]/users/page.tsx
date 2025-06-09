'use client'
import { useParams } from "next/navigation";
import Header from "../../../../../components/ui/Header";
import UserSessionTable from "./components/UserSessionTable";
import { useEffect } from "react";
import { useWebRtc } from "../../../../../context/WebRtcProvider";
import HeaderTitle from "../../../../../components/ui/HeaderTitle";

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
                <HeaderTitle>
                    Users List Room {roomId}

                </HeaderTitle>
            </Header>

            <div>
                <UserSessionTable></UserSessionTable>
            </div>


        </div>
    );
}