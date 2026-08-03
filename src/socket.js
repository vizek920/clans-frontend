import { io } from "socket.io-client";

// غيّر هذا الرابط لرابط السيرفر بتاعك على Render بعد النشر
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});
