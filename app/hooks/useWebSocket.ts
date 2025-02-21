import { useEffect, useRef } from "react";

export type WebSocketMessage = {
  type:
    | "chat_message"
    | "user_status"
    | "user_typing"
    | "auth"
    | "join_room"
    | "connection_established"
    | "typing";
  message?: Message;
  id?: string;
  content?: string;
  username?: string;
  roomId?: string;
  timestamp?: string;
  status?: "online" | "offline";
};

export type Message = {
  id: string;
  content: string;
  username: string;
  roomId: string;
  timestamp: string;
};

export function useWebSocket(
  roomId: string | null,
  username: string,
  onMessage: (data: WebSocketMessage) => void
) {
  const ws = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  // Update the ref when onMessage changes
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!username) return;

    // Create WebSocket connection
    const wsUrl = "ws://localhost:3000/ws";
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket Connected");
      // Send auth message when connection is established
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "auth",
            username,
            roomId,
          })
        );

        // Only send join_room if we have a roomId
        if (roomId) {
          ws.current.send(
            JSON.stringify({
              type: "join_room",
              roomId,
              username,
            })
          );
        }
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket received:", data);

        // For chat messages, the actual message is nested
        if (data.type === "chat_message" && data.message) {
          onMessageRef.current({
            type: "chat_message",
            ...data.message,
          });
        } else {
          onMessageRef.current(data);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Cleanup on unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [roomId, username]);

  return ws.current;
}
