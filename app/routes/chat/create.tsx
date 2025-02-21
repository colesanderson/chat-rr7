import { Form, redirect } from "react-router";
import { createChatRoom } from "~/utils/chatApi";
import type { Route } from "./+types/create";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const roomName = formData.get("roomName");
  const newRoom = await createChatRoom(String(roomName));

  return redirect(`/chat/${newRoom.id}`);
}

export default function CreateChatRoom() {
  return (
    <div>
      <h2>Create a New Chat Room</h2>
      <Form method="post">
        <label>
          Room Name: <input type="text" name="roomName" required />
        </label>
        <br />
        <button type="submit">Create Room</button>
      </Form>
    </div>
  );
}
