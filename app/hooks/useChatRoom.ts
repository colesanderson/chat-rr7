import { useState, useRef, useCallback, useEffect } from "react";
import type { Message } from "~/utils/chatApi";
import type { WebSocketMessage } from "./useWebSocket";
import { useWebSocket } from "./useWebSocket";

export function useChatRoom(
  initialMessages: Message[],
  username: string,
  roomId: string
) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const handleWebSocketMessage = useCallback(
    (data: WebSocketMessage) => {
      console.log("Received WebSocket message:", data);

      if (data.type === "chat_message") {
        // Handle both message formats (nested and direct)
        const newMessage = data.message || {
          id: data.id!,
          content: data.content!,
          username: data.username!,
          roomId: data.roomId!,
          timestamp: data.timestamp!,
        };

        // Only update messages if it's from another user
        if (newMessage.username && newMessage.username !== username) {
          setMessages((prev) => [...prev, newMessage]);
        }
      } else if (data.type === "typing" || data.type === "user_typing") {
        if (data.username && data.username !== username) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.add(data.username!);
            return newSet;
          });
        }
      } else if (data.type === "stop_typing") {
        if (data.username) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.username!);
            return newSet;
          });
        }
      }
    },
    [username]
  );

  const ws = useWebSocket(roomId, username, handleWebSocketMessage);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return {
    messages,
    setMessages,
    typingUsers,
    setTypingUsers,
    ws,
    messageContainerRef,
    typingTimeoutRef,
  };
}
