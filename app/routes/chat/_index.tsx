import { useLoaderData, Link, redirect, data } from "react-router";
import { getChatRooms } from "~/utils/chatApi";
import { getSession } from "~/utils/session";
import type { Route } from "./+types/_index";

type ChatRoom = {
  id: string;
  name: string;
  createdAt: string;
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const username = session.get("username");

  if (!username) {
    return redirect("/login");
  }

  const chatRooms = await getChatRooms();
  return data({ chatRooms, username });
};

export default function ChatRooms() {
  const { chatRooms } = useLoaderData<{
    chatRooms: ChatRoom[];
  }>();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Chat Rooms</h1>
          <Link
            to="/chat/create"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
          >
            Create New Room
          </Link>
        </div>

        {chatRooms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">No chat rooms available.</p>
            <p className="text-gray-500 mt-2">Create one to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {chatRooms.map((room) => (
              <Link
                key={room.id}
                to={`/chat/${room.id}`}
                className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {room.name}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            to="/"
            className="text-blue-500 hover:text-blue-600 font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
