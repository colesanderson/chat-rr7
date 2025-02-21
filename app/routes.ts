import {
  type RouteConfig,
  index,
  route,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("./routes/index.tsx"),

  layout("./routes/auth/layout.tsx", [
    route("login", "./routes/auth/login.tsx"),
    route("register", "./routes/auth/register.tsx"),
  ]),

  ...prefix("chat", [
    layout("./routes/chat/layout.tsx", [
      index("./routes/chat/_index.tsx"),
      route("create", "./routes/chat/create.tsx"),
      route(":roomId", "./routes/chat/$roomId.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
