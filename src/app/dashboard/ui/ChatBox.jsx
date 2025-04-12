const ChatBox = () => {
    return (
        <div className="flex flex-col w-full justify-between gap-6 h-full">
            <div className="flex flex-col gap-4 overflow-y-scroll h-full">
                <div className="flex flex-col gap-1 ">
                    <p className="text-xs">from <span className="font-semibold">you&nbsp;</span>to <span className="font-semibold">user-6541bca123453221114</span></p>
                    <p className="bg-white/10 rounded-lg text-xs px-2 w-2/3 py-0.5">please turn around your camera make sure the sorrounding is appear</p>
                </div>
               
            </div>
            <div className="bg-white/10 border border-white/10 rounded-lg max-h-12 flex justify-center p-1 gap-2">
                <input type="text" className="w-full rounded-md bg-white/10 px-2" />
                <div className="max-w-12 w-full flex justify-center items-center bg-white/20 rounded-lg fill-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="max-w-6 w-full" viewBox="0 0 512 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" /></svg>
                </div>
            </div>
        </div>
    );
}

export default ChatBox;