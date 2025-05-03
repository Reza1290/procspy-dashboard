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
        <div className="flex flex-col w-full justify-between gap-4 h-full p-4 border border-white/10 bg-black text-white rounded-lg">
            {/* Messages */}
            <div className="flex flex-col gap-3 justify-end overflow-y-auto h-full bg-white/5 p-3 rounded">
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
                                className={`px-3 py-1 rounded-lg text-sm max-w-[70%] overflow-hidden ${
                                    isSentByMe
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

            {/* Input */}
            <div className=" border border-white/10 rounded-lg flex p-2 gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type and press Enter"
                    className="w-full rounded-md bg-black px-1 py-1 text-sm text-white outline-none"
                />
            </div>
        </div>
    );
};

export default ChatBox;
