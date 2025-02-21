import { createCookieSessionStorage } from "react-router";

type SessionData = {
  userId: string;
  username: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "chat_session",
      httpOnly: true,
      maxAge: 60 * 30, // 30 minutes
      path: "/",
      sameSite: "lax",
      secrets: ["s3cret1"], // Replace with your actual secret from env
      secure: process.env.NODE_ENV === "production",
    },
  });

export { getSession, commitSession, destroySession };
