interface UserListProps {
  title: string;
  users: string[];
  status: "online" | "offline";
}

export function UserList({ title, users, status }: UserListProps) {
  return (
    <section className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <ul className="space-y-2">
        {users.map((username) => (
          <li
            key={`${status}-${username}`}
            className="flex items-center space-x-2"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                status === "online" ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span className="text-gray-700">{username}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
