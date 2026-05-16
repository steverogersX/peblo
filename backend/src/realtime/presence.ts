import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";

interface Viewer {
  id: string;
  name: string;
  color: string;
}

// token → (socketId → Viewer)
const rooms = new Map<string, Map<string, Viewer>>();

export function attachPresence(httpServer: HttpServer, corsOrigin: string) {
  const io = new SocketServer(httpServer, {
    cors: { origin: corsOrigin, methods: ["GET", "POST"] },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    let currentToken: string | null = null;

    socket.on("presence:join", (payload: { token: string; viewer: Omit<Viewer, "id"> }) => {
      const { token, viewer } = payload;
      currentToken = token;

      if (!rooms.has(token)) rooms.set(token, new Map());
      rooms.get(token)!.set(socket.id, { id: socket.id, ...viewer });

      socket.join(token);
      io.to(token).emit("presence:update", roomViewers(token));
    });

    socket.on("disconnect", () => {
      if (!currentToken) return;
      rooms.get(currentToken)?.delete(socket.id);
      io.to(currentToken).emit("presence:update", roomViewers(currentToken));
      if (rooms.get(currentToken)?.size === 0) rooms.delete(currentToken);
    });
  });

  return io;
}

function roomViewers(token: string): Viewer[] {
  return Array.from(rooms.get(token)?.values() ?? []);
}
