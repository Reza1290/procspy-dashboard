const UsersSidebar = ({ active }) => {
    return (
        <div className={`${active ? 'w-full opacity-100' : 'w-0 opacity-0 overflow-hidden -ml-[3rem] '} transition-all duration-500 delay-200 ease-in-out flex flex-col justify-start border-r border-white/10 bg-gradient-to-bl from-black to-slate-950 py-8 px-6 gap-8`}>
            <div className="flex justify-between items-center">
                <h1 className="text-md font-medium">Users Connected</h1>
            </div>
            <div className="flex flex-col justify-start gap-2">
                <div className="flex justify-between items-center w-full border p-2 px-3 bg-white/10  rounded-lg border-white/10">
                    <div className="flex gap-3 items-center">
                        <div className="w-2 h-2 bg-red-500/80 rounded-full"></div>
                        <p className="font-medium truncate max-w-44">user-6541bca123453221114</p>
                    </div>
                    <div className="w-full max-w-2.5 fill-white/50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" /></svg>
                    </div>
                </div>
                <div className="flex justify-between items-center w-full p-2 px-3 rounded-lg border-white/10 ">
                    <p className="font-medium text-white/50 truncate max-w-48">user-6541bca123453221114</p>
                    <div className="w-full max-w-2.5 fill-white/50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" /></svg>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UsersSidebar;