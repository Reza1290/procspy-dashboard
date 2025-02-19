'use client'

import { useEffect, useRef } from "react";
import { socket } from "../lib/socket";
import { Device } from "mediasoup-client"
export default function Page() {

    const userList = useRef([])

    useEffect(() => {
        socket.on()
    })



    return (
        <div>

        </div>
    );
}