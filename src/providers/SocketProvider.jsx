import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../store/authStore";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("balance:updated", ({ group_id }) => {
      queryClient.invalidateQueries(["balances", group_id]);
      queryClient.invalidateQueries(["dashboard-balances"]);
    });

    socket.on("comment:new", ({ expense_id }) => {
      queryClient.invalidateQueries(["comments", expense_id]);
    });

    return () => socket.disconnect();
  }, [token]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
}
