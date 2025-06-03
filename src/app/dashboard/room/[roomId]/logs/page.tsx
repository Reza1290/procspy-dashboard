'use client'
import { useParams } from "next/navigation";
import Header from "../../../../../components/ui/Header";
import LogsTable from "./components/LogsTable";

export default function Page() {
    const {roomId} = useParams()
    return (
       <div className="min-h-screen flex flex-col">
        <Header>
            Logs Room {roomId}
        </Header>
        <div className="flex flex-col justify-end min-h-full w-full h-[90vh] overflow-hidden">
            <LogsTable></LogsTable>
        </div>
       </div>
    );
}