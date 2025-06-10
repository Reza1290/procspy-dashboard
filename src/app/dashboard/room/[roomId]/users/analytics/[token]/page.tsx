'use client'
import { useParams } from "next/navigation";
import Header from "../../../../../../../components/ui/Header";
import AnalyticsPage from "../../../../../proctored_users/[userId]/analytics/[token]/page";
import HeaderTitle from "../../../../../../../components/ui/HeaderTitle";

export default function Page() {
    const {token} = useParams()
    return (
        <div className="h-full">
            <Header><HeaderTitle>Session Analytic / {token} </HeaderTitle></Header>
            <AnalyticsPage></AnalyticsPage>
        </div>
    );
}