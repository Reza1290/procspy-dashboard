"use client"
import { useEffect, useRef, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { EllipsisVertical, Eye, HistoryIcon, Unplug } from "lucide-react";
import session from "../../../../lib/session";


export type Setting = {
    id: string
    key: string
    value: string
};

const SettingTable = () => {

    const [settings, setSettings] = useState<Setting[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    useEffect(() => {

        fetchSettings(1);
    },[]);

    const fetchSettings = async (nextPage: number) => {
        try {
            const token = await session();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT || 'https://192.168.2.5:5050'}/api/global-settings?page=${nextPage}&paginationLimit=12`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setSettings(prev => {
                    const newSettings = data.data.filter((d:Setting) => !prev.some(p => p.id === d.id));
                    return [...prev, ...newSettings];
                });
                setHasMore(nextPage < data.totalPages);
                setLoading(false);
                setPage(nextPage);
            }
        } catch (err) {
            console.error("Failed to fetch session history", err);
        }
    };


    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el || loading || !hasMore) return;

        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
            fetchSettings(page + 1);
        }
    };


    return (
        <div className="">
            <div className="overflow-x-auto border-b border-white/15">
                <div className="mx-8 my-4">
                    <div className="flex">
                      JAWA
                    </div>
                </div>
                <div className="relative max-h-[76vh] overflow-y-auto " onScroll={handleScroll} ref={scrollRef}>
                    <table className="min-w-full table-fixed">
                        <thead className="sticky top-0 z-10 backdrop-blur-[2px]">
                            <tr className="">
                                <th className="pl-8 pr-4 py-2 text-left font-normal text-slate-100/75 text-sm">Id</th>
                                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Variable Name</th>
                                <th className="px-4 py-2 text-left font-normal text-slate-100/75 text-sm">Value</th>
                                <th className="pr-8 pl-4 text-left font-normal text-slate-100/75 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody className="">
                            {settings.map((setting) => (
                                <tr key={setting.id} className="border-t border-white/10 hover:bg-gray-600/30">
                                    <td className="pl-8 pr-4 py-4 text-sm text-white/70">{setting.id}</td>
                                    <td className="px-4 py-4 text-sm font-semibold">{setting.key}</td>
                                    <td className="px-4 py-4 text-sm text-sky-500/75 font-medium">{setting.value}</td>
                                    <td className="pr-8 pl-4 py-4 text-xs capitalize flex justify-start items-center gap-4">
                                        <EllipsisVertical className="max-w-4 aspect-square" />
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SettingTable;
