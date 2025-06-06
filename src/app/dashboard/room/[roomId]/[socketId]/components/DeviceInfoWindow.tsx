type Storage = {
    id: string
    capacity: string
    type: string
}

type Display = {
    name: string
    height: string
    width: string
    isPrimary: boolean
}

export type SessionDetailProps = {
    id: string
    sessionId: string
    deviceId: string
    operatingSystem: string
    userAgent: string
    ipAddress: string
    cpuModel: string
    cpuArch: string
    primaryDisplay: string
    browser: string
    browserVersion: string
    cpuNumOfProcessors: number
    gpu?: string
    ramSize?: string
    storages?: Array<Storage>
    displays?: Array<Display>
    isVM?: boolean
}



const DeviceInfoWindow = ({ session }: { session: SessionDetailProps }) => {
    return (
        <div className="relative flex flex-col w-full gap-3 p-4 overflow-y-scroll h-[25vh]
                        text-xs  text-gray-700 dark:text-gray-200
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-gray-100
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                        dark:[&::-webkit-scrollbar-track]:bg-black
                        dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
            <div className="text-xs"><strong>OS:</strong> {session.operatingSystem}</div>
            <div className="text-xs"><strong>Browser:</strong> {session.browser} {session.browserVersion}</div>
            <div className="text-xs"><strong>IP:</strong> {session.ipAddress}</div>
            <div className="text-xs"><strong>CPU:</strong> {session.cpuModel} ({session.cpuNumOfProcessors} cores)</div>
            <div className="text-xs"><strong>Arch:</strong> {session.cpuArch}</div>
            {session.gpu && <div className="text-xs"><strong>GPU:</strong> {session.gpu}</div>}
            {session.ramSize && <div className="text-xs"><strong>RAM:</strong> {session.ramSize}</div>}
            {session.isVM && <div className="text-xs"><strong>Running in VM</strong></div>}

            {session.displays?.length ? (
                <details>
                    <summary className="cursor-pointer">Displays ({session.displays.length})</summary>
                    <ul className="ml-4 mt-1 list-disc">
                        {session.displays.map((d, idx) => (
                            <li key={idx}>
                                {d.name}: {d.width}x{d.height} {d.isPrimary && "(Primary)"}
                            </li>
                        ))}
                    </ul>
                </details>
            ) : null}

            {/* Storages */}
            {session.storages?.length ? (
                <details>
                    <summary className="cursor-pointer">Storages ({session.storages.length})</summary>
                    <ul className="ml-4 mt-1 list-disc">
                        {session.storages.map((s, idx) => (
                            <li key={idx}>
                                {s.type}: {s.capacity}
                            </li>
                        ))}
                    </ul>
                </details>
            ) : null}
        </div>
    );
};

export default DeviceInfoWindow;
