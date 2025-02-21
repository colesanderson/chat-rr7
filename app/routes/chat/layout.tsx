import { Outlet, Link } from "react-router";

export default function ChatLayout() {
  return (
    <div>
      <header>
        <h1>Chat Rooms</h1>
        <nav>
          <Link to="/chat">Room List</Link> |{" "}
          <Link to="/chat/create">Create Room</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
