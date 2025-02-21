import type { Route } from "./+types/login";
import { Form, useActionData, redirect } from "react-router";
import { verifyUser, updateUserStatus } from "~/utils/chatApi";
import { getSession, commitSession } from "~/utils/session";

export default function Login() {
  const actionData = useActionData();

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      {actionData?.error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {actionData.error}
        </div>
      )}
      <Form method="post">
        <label className="block mb-4">
          Username:
          <input
            type="text"
            name="username"
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            required
          />
        </label>
        <label className="block mb-4">
          Password:
          <input
            type="password"
            name="password"
            className="w-full mt-1 px-3 py-2 border rounded-lg"
            required
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Login
        </button>
      </Form>
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));

  const user = await verifyUser(username, password);

  if (!user) {
    return { error: "Invalid username or password" };
  }

  await updateUserStatus(username, "online");

  // Create new session
  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", user.id);
  session.set("username", username);

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}
