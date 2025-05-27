/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { Request, Response } from "express";
import {
  addMessage,
  getMessagesByRoom,
  MessageInput,
} from "./messages/messages.controller";
import { Client } from "pg";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import {
  createUser,
  logUserIn,
  logUserInWithToken,
  getUsers,
  removeUser,
  getStatistics,
  getMonthlyUserStats,
} from "./user/user.controller";
import { CreateUserInput, LoginUserInput } from "./user/user.repository";
import { auth, adminAuth } from "./auth/auth.middleware";
import {
  addMember,
  createRoom,
  getAllRooms,
  getRoom,
  removeMember,
} from "./rooms/rooms.controller";
import { CreateRoomInput, EventResponse, UserDetails } from "../../common/src";
import { emitWithRetry } from "./web-socket/emit-with-retry";
import {
  createRoleController,
  getAllRolesController,
  assignRoleToUserController,
  removeRoleFromUserController,
  getUserRolesController,
  removeAllRolesFromUserController,
  removeAdminRoleController,
  assignAdminRoleController,
} from "./roles/roles.controller";

const app = express();
const db = new Client();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Track connected users for statistics
const connectedUsers = new Set<string>();

async function clientConnect() {
  await db.connect();
  console.log("Postgres database connected");
}

app.use(express.json());
app.use(cors());

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.post("/messages", auth, async (req: Request, res: Response) => {
  try {
    const message = await addMessage({ db }, req.body as MessageInput);
    if (!message) throw new Error("Message creation failed");

    // emit event to send message data to connected clients
    await emitWithRetry(io, message.roomId, "chat message", message);

    res.status(201).send(message);
  } catch (err) {
    res.status(500).send();
  }
});

app.post("/room", auth, async (req: Request, res: Response) => {
  try {
    const body = req.body as CreateRoomInput;
    const result = await createRoom({ db }, body);
    if (!result) throw new Error("Could not create room");

    res.status(200).send(result);
    return;
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send({ error: err.message });
      return;
    }
    res.status(500).send({ error: "Unexpected error" });
    return;
  }
});

app.post(
  "/rooms/:roomId/members",
  auth,
  async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;
      const { id: userId } = req.body as UserDetails;
      const result = await addMember({ db }, { roomId, userId });
      if (!result) throw new Error("Could not add member to room");

      res.status(200).send(result);
      return;
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ error: err.message });
        return;
      }
      res.status(500).send({ error: "Unexpected error" });
      return;
    }
  }
);

app.delete(
  "/rooms/:roomId/members/:userId",
  auth,
  async (req: Request, res: Response) => {
    try {
      const { roomId, userId } = req.params;
      const result = await removeMember({ db }, { roomId, userId });
      if (!result) throw new Error("Could not remove member from room");

      res.status(200).send(result);
      return;
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({ error: err.message });
        return;
      }
      res.status(500).send({ error: "Unexpected error" });
      return;
    }
  }
);

app.get("/rooms", auth, async (_: Request, res: Response) => {
  const rooms = await getAllRooms({ db });
  res.send(rooms);
});

app.get("/rooms/:roomId", auth, async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const room = await getRoom({ db }, roomId);
  res.send(room);
});

app.get(
  "/rooms/:roomId/messages",
  auth,
  async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const room = await getMessagesByRoom({ db }, roomId);
    res.send(room);
  }
);

app.post("/user/new", async (req: Request, res: Response) => {
  try {
    const body = req.body as CreateUserInput;
    const result = await createUser({ db }, body);

    res.status(200).send(result);
    return;
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send({ error: err.message });
      return;
    }
    res.status(500).send({ error: "Unexpected error" });
    return;
  }
});

app.post("/user/login", async (req: Request, res: Response) => {
  const userDetails = await logUserIn({ db }, req.body as LoginUserInput);
  if (userDetails) {
    res.status(200).send(userDetails);
    return;
  }
  res.status(401).send({ error: "Login failed" });
  return;
});

app.post("/user/verify", async (req: Request, res: Response) => {
  const userDetails = await logUserInWithToken(
    { db },
    req.body as { token: string }
  );
  if (userDetails) {
    res.status(200).send(userDetails);
    return;
  }
  res.status(401).send({ error: "Login failed" });
  return;
});

// New admin routes
app.get("/admin/users", adminAuth, async (_: Request, res: Response) => {
  try {
    const users = await getUsers({ db });

    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ error: "Failed to get users" });
  }
});

app.delete(
  "/admin/users/:userId",
  adminAuth,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const result = await removeUser({ db }, userId);
      if (!result) throw new Error("Could not delete user");

      res.status(200).send({ success: true });
    } catch (err) {
      res.status(500).send({ error: "Failed to delete user" });
    }
  }
);

app.post(
  "/admin/users/:userId/promoteadmin",
  adminAuth,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      // Remove all roles first, then assign admin role (assume admin role id is 1)
      await removeAllRolesFromUserController({ db }, userId);
      const assigned = await assignAdminRoleController({ db }, userId);
      res.status(200).send({ success: assigned });
    } catch (err) {
      res.status(500).send({ error: "Failed to promote user to admin" });
    }
  }
);

app.post(
  "/admin/users/:userId/demoteadmin",
  adminAuth,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const removed = await removeAdminRoleController({ db }, userId);
      res.status(200).send({ success: removed });
    } catch (err) {
      res.status(500).send({ error: "Failed to demote admin" });
    }
  }
);

app.get("/admin/statistics", adminAuth, async (_: Request, res: Response) => {
  try {
    const stats = await getStatistics({ db });
    // Add currently connected users count
    const result = {
      ...stats,
      connectedUsers: connectedUsers.size,
    };
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to get statistics" });
  }
});

app.get(
  "/admin/statistics/monthly-users",
  adminAuth,
  async (_: Request, res: Response) => {
    try {
      const monthlyStats = await getMonthlyUserStats({ db });
      res.status(200).send(monthlyStats);
    } catch (err) {
      res.status(500).send({ error: "Failed to get monthly user statistics" });
    }
  }
);

// Role endpoints
app.post("/roles", adminAuth, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).send({ error: "Role name required" });
    const role = await createRoleController({ db }, name);
    res.status(201).send(role);
  } catch (err) {
    res.status(500).send({ error: "Failed to create role" });
  }
});

app.get("/roles", adminAuth, async (_: Request, res: Response) => {
  try {
    const roles = await getAllRolesController({ db });
    res.status(200).send(roles);
  } catch (err) {
    res.status(500).send({ error: "Failed to get roles" });
  }
});

app.post(
  "/users/:userId/roles/:roleId",
  adminAuth,
  async (req: Request, res: Response) => {
    try {
      const { userId, roleId } = req.params;
      const result = await assignRoleToUserController(
        { db },
        userId,
        Number(roleId)
      );
      res.status(200).send({ success: result });
    } catch (err) {
      res.status(500).send({ error: "Failed to assign role" });
    }
  }
);

app.put(
  "/users/:userId/roles/:roleId",
  adminAuth,
  async (req: Request, res: Response) => {
    try {
      const { userId, roleId } = req.params;
      // Remove all roles from the user first
      await removeAllRolesFromUserController({ db }, userId);
      // Assign the new role
      const assigned = await assignRoleToUserController(
        { db },
        userId,
        Number(roleId)
      );
      res.status(200).send({ success: assigned });
    } catch (err) {
      res.status(500).send({ error: "Failed to update user role" });
    }
  }
);

app.delete(
  "/users/:userId/roles/:roleId",
  adminAuth,
  async (req: Request, res: Response) => {
    try {
      const { userId, roleId } = req.params;
      const result = await removeRoleFromUserController(
        { db },
        userId,
        Number(roleId)
      );
      res.status(200).send({ success: result });
    } catch (err) {
      res.status(500).send({ error: "Failed to remove role" });
    }
  }
);

app.get(
  "/users/:userId/roles",
  adminAuth,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const roles = await getUserRolesController({ db }, userId);
      res.status(200).send(roles);
    } catch (err) {
      res.status(500).send({ error: "Failed to get user roles" });
    }
  }
);

io.on("connection", (socket) => {
  console.log("a user connected");

  // Handle user authentication and track connected users
  socket.on("authenticate", (userId: string) => {
    if (userId) {
      socket.data.userId = userId;
      connectedUsers.add(userId);

      // Emit updated connection count to admin clients
      io.emit("user-connection-update", connectedUsers.size);
    }
  });

  socket.on(
    "join room",
    async (roomId: string, callback: ({ status }: EventResponse) => void) => {
      await socket.join(roomId);
      callback({ status: "room join acknowledged" });
    }
  );

  socket.on(
    "leave room",
    async (roomId: string, callback: ({ status }: EventResponse) => void) => {
      await socket.leave(roomId);
      callback({ status: "room leave acknowledged" });
    }
  );

  socket.on("disconnect", () => {
    console.log("user disconnected");
    if (socket.data.userId) {
      connectedUsers.delete(socket.data.userId);

      // Emit updated connection count to admin clients
      io.emit("user-connection-update", connectedUsers.size);
    }
  });
});

void clientConnect();
server.listen(4000, () => console.log("Server started on port 4000"));
