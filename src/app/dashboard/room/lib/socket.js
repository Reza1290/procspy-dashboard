"use client";

import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "https://192.168.2.8:3000/mediasoup");