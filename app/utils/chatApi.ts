import axios from "axios";

const API_URL = "http://localhost:3000/api";

export interface User {
  id: string;
  username: string;
  status: "online" | "offline";
}

export interface Message {
  id: string;
  content: string;
  username: string;
  roomId: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  name: string;
}

export async function getUsers(): Promise<User[]> {
  try {
    const response = await axios.get<User[]>(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getUserByUsername(
  username: string
): Promise<User | null> {
  try {
    const response = await axios.get<User>(`${API_URL}/users/${username}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function createUser(
  username: string,
  password: string
): Promise<User> {
  try {
    const response = await axios.post<User>(`${API_URL}/users/register`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function verifyUser(
  username: string,
  password: string
): Promise<User | null> {
  try {
    const response = await axios.post<User>(`${API_URL}/users/login`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying user:", error);
    return null;
  }
}

export async function updateUserStatus(
  username: string,
  status: User["status"]
): Promise<User> {
  try {
    const response = await axios.put<User>(
      `${API_URL}/users/${username}/status`,
      {
        status,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating user status:",
      error instanceof Error ? error.message : error
    );
    throw error;
  }
}

// Chat room functions
export async function createChatRoom(name: string): Promise<ChatRoom> {
  try {
    const response = await axios.post<ChatRoom>(`${API_URL}/rooms`, { name });
    return response.data;
  } catch (error) {
    console.error("Error creating chat room:", error);
    throw error;
  }
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  try {
    const response = await axios.get<ChatRoom[]>(`${API_URL}/rooms`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return [];
  }
}

// Message functions
export async function getMessages(roomId: string): Promise<Message[]> {
  try {
    const response = await axios.get<Message[]>(
      `${API_URL}/rooms/${roomId}/messages`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

interface AddMessagePayload {
  content: string;
  username: string;
  roomId: string;
}

export async function addMessage(
  roomId: string,
  message: AddMessagePayload
): Promise<Message> {
  try {
    const response = await axios.post<Message>(
      `${API_URL}/rooms/${roomId}/messages`,
      {
        content: message.content,
        username: message.username,
        roomId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
}
