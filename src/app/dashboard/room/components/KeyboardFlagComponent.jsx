const KeyboardFlagComponent = (flags) => {
    console.log(flags)
    return (
        <div className="flex items-start gap-3">
            <span className="fill-white max-w-4 max-h-4 w-full flex">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M.1 29.3C-1.4 47 11.7 62.4 29.3 63.9l8 .7C70.5 67.3 96 95 96 128.3L96 224l-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l32 0 0 95.7c0 33.3-25.5 61-58.7 63.8l-8 .7C11.7 449.6-1.4 465 .1 482.7s16.9 30.7 34.5 29.2l8-.7c34.1-2.8 64.2-18.9 85.4-42.9c21.2 24 51.2 40 85.4 42.9l8 .7c17.6 1.5 33.1-11.6 34.5-29.2s-11.6-33.1-29.2-34.5l-8-.7C185.5 444.7 160 417 160 383.7l0-95.7 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-32 0 0-95.7c0-33.3 25.5-61 58.7-63.8l8-.7c17.6-1.5 30.7-16.9 29.2-34.5S239-1.4 221.3 .1l-8 .7C179.2 3.6 149.2 19.7 128 43.7c-21.2-24-51.2-40-85.4-42.9l-8-.7C17-1.4 1.6 11.7 .1 29.3z" /></svg>

            </span>
            <div className="flex flex-col gap-1">
                <p className="text-sm">User <span className="font-semibold">typed in keyboard</span> <span className="p-0.5 px-1 border border-white/10 bg-white/10 rounded-md ">ini contoh lagi typing</span></p>
                <p className="text-xs text-slate-500">29 January 2025 - 19.47 KST</p>
                <div className="bg-white/10 w-full p-2 rounded-md border border-white/10 max-h-64">
                    <img className="rounded-md" src="https://i.pcmag.com/imagery/articles/02k3o8Ta7w6FsbWQy9ujIQ8-1..v1696872551.jpg" alt="" />
                </div>
                <div className="flex gap-2">
                    <div className="w-8 h-8 bg-red-500/80 rounded-md border border-white/10 p-2 fill-white cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" /></svg>
                    </div>
                    <div className="w-8 h-8 bg-slate-900 rounded-md border border-white/10 flex items-center p-2 fill-white cursor-pointer" >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">{/*<!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->*/}<path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default KeyboardFlagComponent;