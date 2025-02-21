import type { Route } from "./+types/index";
import { useLoaderData, Form, redirect, data } from "react-router";
import { getUsers, updateUserStatus, getUserByUsername } from "~/utils/chatApi";
import { getSession, destroySession } from "~/utils/session";
import { useEffect } from "react";
import { useWebSocket } from "~/hooks/useWebSocket";
import { useUserStatus } from "~/hooks/useUserStatus";
import { UserList } from "~/components/UserList";
import { ChatControls } from "~/components/ChatControls";

type User = {
  id: string;
  username: string;
  status: "online" | "offline";
};

type LoaderData = {
  users: User[];
  username: string | null;
};

export const loader = async ({ request }: { request: Request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const username = session.get("username");

  if (!username) {
    return redirect("/login");
  }

  const users = await getUsers();
  return data({ users, username });
};

export const action = async ({ request }: { request: Request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const username = session.get("username");

  if (username) {
    try {
      const user = await getUserByUsername(username);
      if (user) {
        await updateUserStatus(username, "offline");
      } else {
        console.error("User not found:", username);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

export function meta(_: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { users, username } = useLoaderData<LoaderData>();
  const {
    onlineUsers,
    offlineUsers,
    setOnlineUsers,
    setOfflineUsers,
    handleUserStatus,
  } = useUserStatus(username ?? "");

  // Initialize WebSocket connection
  const ws = useWebSocket("", username ?? "", handleUserStatus);

  // Initialize user lists
  useEffect(() => {
    const initialOnline = users
      .filter((u) => u.status === "online")
      .map((u) => u.username);
    const initialOffline = users
      .filter((u) => u.status === "offline")
      .map((u) => u.username);

    setOnlineUsers(initialOnline);
    setOfflineUsers(initialOffline);
  }, [users, setOnlineUsers, setOfflineUsers]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome to Chat
            </h1>
            {username && (
              <p className="text-lg text-gray-600">
                Logged in as: <span className="font-semibold">{username}</span>
              </p>
            )}
          </div>
          <Form method="post">
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
            >
              Logout
            </button>
          </Form>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <UserList title="Online Users" users={onlineUsers} status="online" />
          <UserList
            title="Offline Users"
            users={offlineUsers}
            status="offline"
          />
        </div>
        <ChatControls />
      </div>
    </div>
  );
}
