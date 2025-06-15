"use client"
import { useParams } from "next/navigation";
import Header from "../../../../../components/ui/Header";
import HeaderTitle from "../../../../../components/ui/HeaderTitle";
import SessionTable from "./components/SessionTable";

export default function Page() {
    const {userId} = useParams()

    return (
        <>
            <Header><HeaderTitle><span className="dark:text-slate-100/80">Proctored Users</span>  &gt; <span className="dark:text-slate-100/80">{userId} </span> &gt; Sessions</HeaderTitle></Header>
            <SessionTable></SessionTable>
        </>
    );
}