"use client"
import { useEffect, useState } from "react";
import session from "../../../../lib/session";
import { usePathname } from "next/navigation";

export enum SessionStatus {
    Scheduled,
    Ongoing,
    Completed,
    Paused,
}

export type SessionProps = {
    id: string;
    roomId: string;
    proctoredUserId: string;
    startTime?: string;
    endTime?: string;
    status?: SessionStatus;
};

const SessionTable = () => {
    const pathname = usePathname()

    const userId = pathname.split('/').slice(-1)[0]
    const [sessions, setSessions] = useState<SessionProps[]>([]);

    useEffect(() => {
        if (!userId) return;

        const fetchSessions = async () => {
            try {
                const token = await session();
                const res = await fetch(`https://192.168.2.7:5050/api/sessions/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                setSessions(data.data);
            } catch (err) {
                console.error("Failed to fetch session history", err);
            }
        };

        fetchSessions();
    }, [userId]);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Session History</h2>
            <div className="overflow-x-auto border border-white/10 rounded-lg">
                <table className="min-w-full table-auto">
                    <thead className="bg-slate-900/10">
                        <tr>
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Room ID</th>
                            <th className="px-4 py-2 text-left">User ID</th>
                            <th className="px-4 py-2 text-left">Start Time</th>
                            <th className="px-4 py-2 text-left">End Time</th>
                            <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((session) => (
                            <tr key={session.id} className="border-t border-white/10 hover:bg-slate-950">
                                <td className="px-4 py-2">{session.id}</td>
                                <td className="px-4 py-2">{session.roomId}</td>
                                <td className="px-4 py-2">{session.proctoredUserId}</td>
                                <td className="px-4 py-2">{session.startTime || "-"}</td>
                                <td className="px-4 py-2">{session.endTime || "-"}</td>
                                <td className="px-4 py-2">{SessionStatus[session.status ?? 0]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SessionTable;
