'use client'

import { useParams } from "next/navigation";
import Header from "../../../../../../components/ui/Header";
import HeaderTitle from "../../../../../../components/ui/HeaderTitle";

export default function Layout({ children }: { children: React.ReactNode }) {
    const {userId} = useParams()
    return (
        <section className="h-full">
            <Header><HeaderTitle><span className="dark:text-slate-100/80">Proctored Users</span>  &gt; <span className="dark:text-slate-100/80">{userId} </span> &gt; Analytics</HeaderTitle></Header>
            {children}
        </section>
    );
}