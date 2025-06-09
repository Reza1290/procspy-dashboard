"use client"
import { redirect, useParams, useRouter } from "next/navigation";
import Header from "../../../../../../components/ui/Header";
import HeaderTitle from "../../../../../../components/ui/HeaderTitle";
import { useEffect, useMemo, useState } from "react";
import session from "../../../../../../lib/session";
import { BodyTable, LogProps } from "../../../../room/[roomId]/logs/components/LogsTable";
import PopOver from "../../../../../../components/ui/PopOver";
import PopOverItem from "../../../../../../components/ui/PopOverItem";
import DraggableTimeline from "../components/DraggableTimeline";
import ConfirmLogButton from "../../../../room/[roomId]/logs/components/ui/ConfirmLogButton";
import { FlagIcon, InfoIcon } from "lucide-react";
import { formattedTimestamp } from "../../../../../utils/timestamp";
import { SessionResultProps } from "../../../../room/[roomId]/users/components/UserSessionTable";




export default function AnalyticsPage() {
    const { token } = useParams()
    const router = useRouter()
    const [dataPoints, setDataPoints] = useState<Array<LogProps>>([])
    const [renderedFile, setRenderedFile] = useState(null)
    const [threeDataLog, setThreeDataLog] = useState<Array<LogProps | null>>([])

    const [currentIndex, setCurrentIndex] = useState(0)
    const [currentId, setCurrentId] = useState("")

    const [sessionResult, setSessionResult] = useState<SessionResultProps>(null)
    const [updateLog, setUpdateLog] = useState(0)
    const fetchlogs = async (nextPage: number, limit: number) => {
        try {
            const jwt = await session();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_ENDPOINT || "https://192.168.2.5:5050"}/api/logs-proctored-user/${token}?page=${nextPage}&paginationLimit=${limit}`,
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
            );
            const data = await res.json();
            if (res.ok) {
                return data
            }
        } catch (err) {
            console.error("Failed to fetch logs history", err);
        }

        return null
    };

    const fetchSessionResult = async () => {
        try {
            const jwt = await session();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_ENDPOINT || "https://192.168.2.5:5050"}/api/session-result-token/${token}`,
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }

            );
            if (res.ok) {
                const data = await res.json()
                if(data.name){
                    router.back()
                    return null
                }
                setSessionResult(data)
            }
        } catch (error) {

        }
    }

    useEffect(() => {
        const loadAllData = async () => {
            try {
                const { total } = await fetchlogs(1, 1);
                if (!total) return;

                const { data } = await fetchlogs(1, total);
                setDataPoints(data.reverse());
            } catch (e) {
                console.error("Error loading data", e);
            }
        };
        fetchSessionResult()
        setCurrentId(null)
        setCurrentIndex(0)
        loadAllData();
    }, [updateLog]);

    const timeline = useMemo(() => {
        if (dataPoints.length === 0) return [];

        const logs = dataPoints.map((d) => ({
            ...d,
            timestamp: new Date(d.timestamp),
        }));

        const timestamps = logs.map((d) => d.timestamp.getTime());
        let min = new Date(Math.min(...timestamps));
        let max = new Date(Math.max(...timestamps));
        const durationMs = max.getTime() - min.getTime();
        const oneHourMs = 60 * 60 * 1000;

        if (durationMs < oneHourMs) {
            max = new Date(min.getTime() + oneHourMs);
        }
        min = new Date(min.getTime() - 60 * 2 * 1000)
        max = new Date(max.getTime() + 60 * 5 * 1000)
        const timeline = [];
        let current = new Date(min);

        while (current <= max) {
            const minuteLogs = logs.filter((d) =>
                Math.floor(d.timestamp.getTime() / 15000) === Math.floor(current.getTime() / 15000)
            );

            timeline.push({
                time: new Date(current),
                logs: minuteLogs,
            });

            current = new Date(current.getTime() + 15 * 1000); // +n minute
        }

        setThreeDataLog([null, dataPoints[0], dataPoints[1]])

        return timeline;
    }, [dataPoints])

    const handleRenderImage = (id: string) => {
        const index = dataPoints.findIndex((item) => item.id === id);
        if (index === -1) {
            setThreeDataLog([]);
            return;
        }
        loadIndex(index)
    }

    const loadIndex = (index: number) => {
        const prevItem = dataPoints[index - 1] || null;
        const currentItem = dataPoints[index];
        const nextItem = dataPoints[index + 1] || null;
        setCurrentId(dataPoints[index].id)
        const newThree = [];
        newThree.push(prevItem);
        newThree.push(currentItem);
        newThree.push(nextItem);
        setRenderedFile(currentItem.attachment?.file ?? null)
        setCurrentIndex(index)
        setThreeDataLog(newThree);
    }

    const handleNextItem = () => {
        loadIndex(currentIndex + 1)
    }

    const handlePrevItem = () => {
        if (currentIndex != 0) {
            loadIndex(currentIndex - 1)
        }
    }


    return (
        <div className="flex flex-col h-full max-h-[90vh] oveflow-hidden">
            <div className="max-h-[60vh] h-full w-full flex">
                <div className="h-full min-w-[20%] border-r border-white/15 p-8">
                    {sessionResult && (
                        <table className="w-full text-sm ">
                            <tbody>
                                <tr>
                                    <td className="py-2 pr-4 text-gray-400">Total Severity</td>
                                    <td className="py-2 text-blue-500">{sessionResult.totalSeverity}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 text-gray-400">Total Flags</td>
                                    <td className="py-2 text-blue-500">{sessionResult.totalFlags}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 text-gray-400">Fraud Level</td>
                                    <td className="py-2 text-blue-500">{sessionResult.fraudLevel}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 text-gray-400">True Severity</td>
                                    <td className="py-2 text-blue-500">{sessionResult.trueSeverity}</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 text-gray-400">False Detection</td>
                                    <td className="py-2 text-blue-500">{sessionResult.falseDetection}</td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="h-full w-full max-w-[72vw] overflow-hidden ">
                    <div className="h-full flex flex-col justify-between">
                        <div className="w-full h-full flex justify-center items-center">
                            {
                                renderedFile ? <div className="max-h-[45vh] min-h-[45vh] border aspect-video rounded">
                                    <img className="rounded-md" src={`${process.env.STORAGE_ENDPOINT || 'https://192.168.2.5:5050'}` + renderedFile} alt=""

                                    />
                                </div> : <div className="text-xs">No Image</div>
                            }
                        </div>
                        <DraggableTimeline currentId={currentId} handleRenderImage={handleRenderImage} timeline={timeline}></DraggableTimeline>
                    </div>
                </div>
            </div>
            <div className="max-h-[30vh] h-full w-full ">
                <table className="min-w-full table-fixed h-full">

                    <thead className=" bg-black border-t border-white/15">
                        <tr>
                            <th className="pl-8 pr-4 py-2 text-right font-normal text-slate-100/75 text-sm">Timestamp</th>
                            <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Severity</th>
                            <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm"></th>
                            <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Flag Key</th>
                            <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Flag Detail</th>
                            <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Detect As</th>
                            <th className="pr-8 pl-4 text-left font-normal text-slate-100/75 text-sm">Action</th>
                            <th className="pr-8 pl-4 text-left font-normal text-slate-100/75 text-sm">Navigation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {threeDataLog.map((e, idx) =>
                            e != null ? (
                                <tr
                                    key={e?.id}
                                    className="border-t border-white/10 hover:bg-gray-600/30 h-[33%]"

                                >

                                    <td className="pl-8 pr-4 py-3 text-xs capitalize text-right text-slate-100/75">
                                        {formattedTimestamp(e.timestamp)}
                                    </td>
                                    <td className="px-4 py-3 text-xs capitalize">
                                        <div className="bg-red-500 w-min rounded p-1 px-2">
                                            {e.flag.severity}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 min-w-min">
                                        <FlagIcon />
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold">
                                        {e.flagKey || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-xs ">
                                        <div className="flex flex-col gap-2">
                                            <div className="font-medium">
                                                {e.flag.label || "-"}{" "}
                                                {e.attachment.title && (
                                                    <span className="font-normal bg-white/10 border-white/15 rounded px-1 border">
                                                        {" "}
                                                        {e.attachment?.title ?? "Unknown"}
                                                    </span>
                                                )}{" "}
                                                {e.attachment.url && (
                                                    <span className="font-light rounded px-1 italic text-sky-500">
                                                        {" "}
                                                        {e.attachment?.url ?? "Unknown"}
                                                    </span>
                                                )}
                                            </div>

                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold">
                                        {e.logType || "-"}
                                    </td>
                                    <td className="pr-8 pl-4 py-3 text-xs capitalize">
                                        {!["CONNECT", "DISCONNECT"].includes(e.flagKey) && (
                                            <ConfirmLogButton callback={() => setUpdateLog((prev) => prev + 1)} id={e.id} currentLogType={"System"} />
                                        )}
                                    </td>
                                    <td>
                                        <button className="bg-blue-500 rounded-md text-sm p-1 px-2 w-max"
                                            onClick={
                                                () => {
                                                    return idx === 0 ? handlePrevItem() : idx === 1 ? "Current" : handleNextItem()
                                                }
                                            }
                                        >
                                            {idx === 0 ? "Previous" : idx === 1 ? "Current" : "Next"}
                                        </button>

                                    </td>
                                </tr>
                            ) : (<tr key={idx}>
                                <td colSpan={7} className="text-xs text-center text-gray-300">No Data</td>
                                <td><button className="bg-blue-500 rounded-md text-sm p-1 px-2 w-max cursor-not-allowed" disabled>
                                    {idx === 0 ? "Previous" : idx === 1 ? "Current" : "Next"}
                                </button></td>
                            </tr>)
                        )}

                    </tbody>
                </table>
            </div>
        </div>
    );
}