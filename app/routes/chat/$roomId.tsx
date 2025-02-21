import { useLoaderData, useParams, redirect, data, Form } from "react-router";
import { getSession } from "~/utils/session";
import { getMessages, type Message } from "~/utils/chatApi";
import { useWebSocket } from "~/hooks/useWebSocket";
import { useChatCallbacks } from "~/hooks/useChatCallbacks";
import { useState, useEffect, useRef } from "react";
import type { Route } from "./+types/$roomId";

type LoaderData = {
  messages: Message[];
  username: string;
  roomId: string;
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const username = session.get("username");
  if (!username) return redirect("/login");
  if (!params.roomId) throw new Error("roomId is required");

  // Get the messages from the database
  const messages = await getMessages(params.roomId);

  // Return the messages, username, and roomId
  return data({ messages, username, roomId: params.roomId });
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const content = formData.get("content") as string;

  // If the message is empty, return an error
  if (!content?.trim()) {
    console.log("Message cannot be empty");
    return { ok: false, error: "Message cannot be empty" };
  }
};

export default function ChatRoom() {
  const { messages: initialMessages, username } = useLoaderData<LoaderData>();
  const { roomId: paramRoomId } = useParams();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messageContainerRef = useRef<HTMLDivElement>(null);

  if (!paramRoomId) return null;

  // Initialize WebSocket connection
  const ws = useWebSocket(paramRoomId, username, () => {});

  // Use our custom hook to get the callbacks.
  const { handleWebSocketMessage, handleTyping } = useChatCallbacks({
    username,
    roomId: paramRoomId,
    setMessages,
    setTypingUsers,
    ws,
  });

  // Update WebSocket message handler.
  useEffect(() => {
    if (ws) {
      // Set the WebSocket onmessage handler to process incoming messages
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
    }
  }, [ws, handleWebSocketMessage]);

  // Scroll to bottom on new messages.
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const formData = new FormData(form);
    const content = formData.get("content") as string;

    // If the message is empty or the WebSocket is not open, return
    if (!content.trim() || ws?.readyState !== WebSocket.OPEN) return;

    // Create the message data
    const messageData: Message = {
      id: `msg${Date.now()}`,
      content,
      username,
      roomId: paramRoomId,
      timestamp: new Date().toISOString(),
    };

    // Send the message to the WebSocket server
    ws.send(JSON.stringify({ type: "chat_message", ...messageData }));

    // Update the messages state
    setMessages((prev) => [...prev, messageData]);

    // Reset the form, clearing the input field
    form.reset();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="h-96 overflow-y-auto mb-4" ref={messageContainerRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.username === username ? "text-right" : "text-left"
              }`}
            >
              <div className="mb-1 text-sm text-gray-500">
                {message.username === username ? "You" : message.username}
              </div>
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.username === username
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p>{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {typingUsers.size > 0 && (
          <div className="text-sm text-gray-500 italic mb-2">
            {Array.from(typingUsers).join(", ")}{" "}
            {typingUsers.size === 1 ? "is" : "are"} typing...
          </div>
        )}

        <Form method="post" onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            name="content"
            className="flex-1 px-3 py-2 border rounded-lg"
            placeholder="Type your message..."
            onChange={handleTyping}
            onKeyDown={handleTyping}
            required
          />
          <input type="hidden" name="username" value={username} />
          <input type="hidden" name="roomId" value={paramRoomId} />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </Form>
      </div>
    </div>
  );
}
