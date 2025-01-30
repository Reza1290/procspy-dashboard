const ReportBox = () => {
    return (
        <div className="flex flex-col w-full gap-4 bg-black rounded-lg border border-white/10 p-4 overflow-y-scroll">
            <div className="grid grid-rows-4 grid-cols-2 gap-2">
                <div className="bg-white/10 rounded-lg p-3 border border-white/10 text-sm">
                    Typing in keyboard
                </div>
                <div className="bg-white/10 rounded-lg p-3 border border-white/10 text-sm">
                    Acessing prohibited resources
                </div>
                <div className="bg-white/10 rounded-lg p-3 border border-white/10 text-sm">
                    Using keyboard shortcut
                </div>
                <div className="bg-white/10 rounded-lg p-3 border border-white/10 text-sm">
                    Talking with someone in room
                </div>
                <div className="bg-white/10 rounded-lg p-3 border border-white/10 text-sm">
                    Not focusing to the screen
                </div>
                <div className="bg-white/10 rounded-lg p-3 border border-white/10 text-sm">
                    Turn off Camera
                </div>
                <div className="bg-white/10 rounded-lg p-3 border border-white/10 text-sm">
                    Other
                </div>

            </div>
        </div>
    );
}

export default ReportBox;