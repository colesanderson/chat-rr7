import { useCallback, useRef } from "react";
import type { WebSocketMessage } from "~/hooks/useWebSocket";
import type { Message } from "~/utils/chatApi";

type UseChatCallbacksArgs = {
  username: string;
  roomId: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setTypingUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  ws: WebSocket | null;
};

export function useChatCallbacks({
  username,
  roomId,
  setMessages,
  setTypingUsers,
  ws,
}: UseChatCallbacksArgs) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleWebSocketMessage = useCallback(
    (data: WebSocketMessage) => {
      switch (data.type) {
        case "chat_message": {
          const newMessage =
            data.message ||
            ({
              id: data.id,
              content: data.content,
              username: data.username,
              roomId: data.roomId,
              timestamp: data.timestamp,
            } as Message);
          // Only add the message if it comes from a different user.
          if (newMessage.content && newMessage.username !== username) {
            setMessages((prev) => [...prev, newMessage]);
          }
          break;
        }
        case "user_typing": {
          if (data.username && data.username !== username) {
            setTypingUsers((prev) => {
              const updated = new Set(prev);
              updated.add(data.username as string);
              return updated;
            });
            // Remove the typing indicator after 3 seconds.
            setTimeout(() => {
              setTypingUsers((prev) => {
                const updated = new Set(prev);
                updated.delete(data.username as string);
                return updated;
              });
            }, 3000);
          }
          break;
        }
        default:
          break;
      }
    },
    [username, setMessages, setTypingUsers]
  );

  const handleTyping = useCallback(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      ws.send(
        JSON.stringify({
          type: "typing",
          username,
          roomId,
        })
      );
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(username);
          return updated;
        });
      }, 3000);
    }
  }, [ws, username, roomId, setTypingUsers]);

  return { handleWebSocketMessage, handleTyping };
}
