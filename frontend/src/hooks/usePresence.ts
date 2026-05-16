"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

export interface Viewer {
  id: string;
  name: string;
  color: string;
}

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function usePresence(
  token: string,
  viewer: { name: string; color: string }
): Viewer[] {
  const [viewers, setViewers] = useState<Viewer[]>([]);

  useEffect(() => {
    const s = getSocket();

    function onUpdate(all: Viewer[]) {
      // Show everyone except this socket
      setViewers(all.filter((v) => v.id !== s.id));
    }

    s.emit("presence:join", { token, viewer });
    s.on("presence:update", onUpdate);

    return () => {
      s.off("presence:update", onUpdate);
    };
  }, [token, viewer.name, viewer.color]);

  return viewers;
}
