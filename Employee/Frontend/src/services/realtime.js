import { io } from "socket.io-client";

let socket = null;
const activeRooms = new Set();

const getSocket = () => {
  if (!socket) {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
    socket = io(apiBase.replace(/\/api$/, ""), {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("[Realtime] Connected to socket server:", socket.id);
      activeRooms.forEach((room) => {
        socket.emit("join", { room });
        socket.emit("join", room);
      });
    });

    socket.on("connect_error", (err) => {
      console.warn("[Realtime] Socket connection error:", err.message);
    });
  }
  return socket;
};

export const connectRealtime = (room) => {
  if (room) activeRooms.add(room);
  const sock = getSocket();
  if (room && sock.connected) {
    sock.emit("join", { room });
    sock.emit("join", room);
  }
  return sock;
};

export const joinRoom = (room) => {
  if (!room) return;
  activeRooms.add(room);
  const sock = getSocket();
  if (sock.connected) {
    sock.emit("join", { room });
    sock.emit("join", room);
  }
};

export const subscribeRealtime = (callback) => {
  const sock = getSocket();
  sock.on("realtime:update", callback);
  return () => sock.off("realtime:update", callback);
};

export const subscribeNotification = (callback) => {
  const sock = getSocket();
  sock.on("notification", callback);
  return () => sock.off("notification", callback);
};

export const disconnectRealtime = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    activeRooms.clear();
  }
};

export default getSocket;
