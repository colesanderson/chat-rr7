import { Link } from "react-router";

export function ChatControls() {
  return (
    <div className="flex space-x-4">
      <Link to="/chat/create">
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
        >
          Create New Chat Room
        </button>
      </Link>
      <Link to="/chat">
        <button
          type="button"
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
        >
          View Chat Rooms
        </button>
      </Link>
    </div>
  );
}
