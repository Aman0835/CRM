export const broadcastRealtime = (io, event) => {
  if (!io) return;

  io.emit("realtime:update", {
    ...event,
    timestamp: new Date().toISOString(),
  });
};
