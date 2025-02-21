import { useState, useCallback } from "react";
import type { WebSocketMessage } from "./useWebSocket";

export function useUserStatus(username: string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [offlineUsers, setOfflineUsers] = useState<string[]>([]);

  const handleUserStatus = useCallback((data: WebSocketMessage) => {
    if (data.type === "user_status" && data.username) {
      setOnlineUsers((prev) => {
        if (data.status === "online") {
          return [...new Set([...prev, data.username ?? ""])];
        }
        return prev.filter((user) => user !== data.username);
      });

      setOfflineUsers((prev) => {
        if (data.status === "offline") {
          return [...new Set([...prev, data.username ?? ""])];
        }
        return prev.filter((user) => user !== data.username);
      });
    }
  }, []);

  return {
    onlineUsers,
    offlineUsers,
    setOnlineUsers,
    setOfflineUsers,
    handleUserStatus,
  };
}
