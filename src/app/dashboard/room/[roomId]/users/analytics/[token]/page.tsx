'use client'
import { useParams } from "next/navigation";
import Header from "../../../../../../../components/ui/Header";
import AnalyticsPage from "../../../../../proctored_users/[userId]/analytics/[token]/page";

export default function Page() {
    const {token} = useParams()
    return (
        <div className="h-full">
            <Header>Session Analytic / {token}</Header>
            <AnalyticsPage></AnalyticsPage>
        </div>
    );
}