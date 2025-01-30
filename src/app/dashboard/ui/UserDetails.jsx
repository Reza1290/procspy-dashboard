const UserDetails = () => {
    return (
        <div className="flex flex-col w-full gap-4 bg-black rounded-lg border border-white/10 p-4">
            <h1 className="font-medium">User Info</h1>
            <div className="grid auto-rows-auto  text-sm gap-2">
                <div className="grid grid-cols-2">
                    <div>Unique Id</div>
                    <div className="text-white/70 truncate">6541bca123453221114</div>
                </div>
                <div className="grid grid-cols-2">
                    <div>Ipv4 Adresss</div>
                    <div className="text-white/70">192.168.0.1</div>
                </div>
                <div className="grid grid-cols-2">
                    <div>Browser Version</div>
                    <div className="text-white/70">128.01</div>
                </div>
                <div className="grid grid-cols-2">
                    <div>OS</div>
                    <div className="text-white/70">Windows</div>
                </div>
                <div className="grid grid-cols-2">
                    <div>Device</div>
                    <div className="text-white/70">Desktop</div>
                </div>
                <div className="grid grid-cols-2">
                    <div>Javascript Enabled</div>
                    <div className="text-white/70">True</div>
                </div>
            </div>
        </div>
    );
}

export default UserDetails;