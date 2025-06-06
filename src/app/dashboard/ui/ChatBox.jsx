import React, { useState, useRef, useEffect } from "react";

const ChatBox = ({ user, messages, onSendMessage }) => {
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && inputValue.trim()) {
            onSendMessage(inputValue.trim());
            setInputValue("");
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    return (
        <div className="flex flex-col w-full justify-between gap-4 h-full max-h-[90vh] border-l border-white/10 ">
            <div className="flex grow w-full justify-end flex-col ">
                <div className="flex flex-col gap-3 p-6 pb-3 w-full max-h-[80vh] overflow-y-scroll 
                [&::-webkit-scrollbar]:w-2
                            [&::-webkit-scrollbar-track]:rounded-full
                            [&::-webkit-scrollbar-track]:bg-gray-100
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            [&::-webkit-scrollbar-thumb]:bg-gray-300
                            dark:[&::-webkit-scrollbar-track]:bg-gray-800
                            dark:[&::-webkit-scrollbar-thumb]:bg-gray-600
            ">
                    {messages && messages.map((msg, idx) => {
                        const isSentByMe = msg.from === "you";
                        return (
                            <div
                                key={idx}
                                className={`flex flex-col ${isSentByMe ? "items-end" : "items-start"}`}
                            >
                                <p className="text-xs text-gray-400 pb-1">
                                    from <span className="font-semibold">{msg.from}</span>
                                </p>
                                <p
                                    className={`px-3 py-1 rounded-sm text-xs max-w-[70%] overflow-hidden font-normal ${isSentByMe
                                        ? "bg-blue-500 text-white"
                                        : "bg-white/10 text-white"
                                        }`}
                                >
                                    {msg.text}
                                </p>
                            </div>
                        );
                    })}

                    <div ref={messagesEndRef} />
                </div>
            </div>


            {/* Input */}
            <div className=" border-white/10 flex gap-2 border-t">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type and press Enter"
                    className="w-full rounded bg-black px-2 py-2 text-xs text-white outline-none border border-white/10 bg-gray-400/10 m-4"
                />
            </div>
        </div>
    );
};

export default ChatBox;
