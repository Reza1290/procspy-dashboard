'use client'
import { useParams } from "next/navigation";
import Header from "../../../../../components/ui/Header";
import UserSessionTable from "./components/UserSessionTable";

export default function Page() {
    const {roomId} = useParams()
    return (
       <div className="">
        <Header>
            Users List Room {roomId}
        </Header>
        <div>
            <UserSessionTable></UserSessionTable>
        </div>
       </div>
    );
}