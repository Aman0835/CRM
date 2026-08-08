import { io } from "socket.io-client";

let socket = null;

const getSocket = () => {
  if (!socket) {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
    socket = io(apiBase.replace(/\/api$/, ""), {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const connectRealtime = (room) => {
  const sock = getSocket();
  sock.emit("join", { room });
  return sock;
};

export const subscribeRealtime = (callback) => {
  const sock = getSocket();
  sock.on("realtime:update", callback);
  return () => sock.off("realtime:update", callback);
};

export const disconnectRealtime = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;
