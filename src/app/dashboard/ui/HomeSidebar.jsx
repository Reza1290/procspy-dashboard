
const HomeSidebar = () => {
    return (
        <div className="flex flex-col justify-start w-full max-w-72 border-r border-white/10 bg-gradient-to-bl from-black to-slate-950 py-8 px-6 gap-8">
            <div className="flex justify-between items-center">
                <h1 className="text-md font-medium">Room Selector</h1>
                <button className="bg-slate-900/50 text-sm rounded-lg border border-white/10 select-none max-w-6 max-h-6 w-full fill-white/80 p-1.5 pt-[0.325rem] ">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" /></svg>
                </button>
            </div>
            <div className="flex flex-col justify-start gap-2">
                <div className="flex justify-between items-center w-full border p-2 px-3 bg-white/10  rounded-lg border-white/10">
                    <p className="font-medium">233443</p>
                    <div className="w-full max-w-2.5 fill-white/50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" /></svg>
                    </div>
                </div>
                <div className="flex justify-between items-center w-full p-2 px-3 rounded-lg border-white/10 ">
                    <p className="font-medium text-white/50">233443</p>
                    <div className="w-full max-w-2.5 fill-white/50">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" /></svg>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeSidebar;