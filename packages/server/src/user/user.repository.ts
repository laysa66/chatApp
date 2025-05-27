import { v4 as uuid } from "uuid";
import jwt, { Secret } from "jsonwebtoken";
import { Context } from "../db/connection";
import bcrypt from "bcryptjs";
import type { Role, User, UserDetails } from "../../../common/src/index";
import { getUserRoles } from "../roles/roles.repository";

const SECRET_KEY: Secret = "your-secret-key-here";

export type CreateUserInput = Pick<
  User,
  "email" | "name" | "password" | "roles"
>;

export type LoginUserInput = Pick<User, "email" | "password">;

// When creating a user, also assign a default role (user) in user_roles
export const insertUser = async (
  { db }: Context,
  userData: CreateUserInput
): Promise<UserDetails | null> => {
  const client = db;
  try {
    await client.query("BEGIN");

    const userId = uuid();
    const hashedPassword = bcrypt.hashSync(userData.password);
    const sql = `INSERT INTO users (id, email, name, password) VALUES($1, $2, $3, $4) RETURNING *`;
    const values = [userId, userData.email, userData.name, hashedPassword];

    const {
      rows: [user],
    } = await client.query<User>(sql, values);

    // Get role from userData or default to "user"
    const roleNameUser = "user";
    const roleUserRes = await client.query(
      "SELECT id FROM roles WHERE name = $1",
      [roleNameUser]
    );

    if (roleUserRes.rows[0]) {
      await client.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [
          userId,
          userData.roles?.length > 0
            ? userData.roles[0].id
            : (roleUserRes.rows as Role[])[0].id,
        ]
      );
    }

    await client.query("COMMIT");

    if (user) {
      // Fetch user roles
      const roles = await getUserRoles({ db: client }, user.id);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: roles,
      };
    }
    return null;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return null;
  }
};

const getUserByEmail = async (
  { db }: Context,
  userEmail: string
): Promise<User | null> => {
  try {
    const sql = `SELECT * FROM users WHERE email = $1`;
    const values = [userEmail];

    const {
      rows: [user],
    } = await db.query<User>(sql, values);

    if (user) return user;
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const loginUser = async (
  { db }: Context,
  userData: LoginUserInput
): Promise<
  | (UserDetails & {
      token: string;
    })
  | null
> => {
  const { email, password } = userData;

  try {
    const user = await getUserByEmail({ db }, email);

    if (!user) throw new Error();

    const isPasswordMatching = bcrypt.compareSync(
      password,
      user.password.toString()
    );

    if (!isPasswordMatching) throw new Error();

    // Fetch user roles
    const roles: Role[] = await getUserRoles({ db }, user.id);
    // the token is gone be valid for 7 days 
    const token = jwt.sign(
      { id: user.id, email: user.email, roles: roles.map((r) => r.name) },
      SECRET_KEY,
      {
        expiresIn: "7 days",
      }
    );

    return {
      id: user.id,
      email,
      name: user.name,
      token,
      roles: roles,
    };
  } catch (error) {
    console.error("Login failed: ", error);
    return null;
  }
};

export const loginUserWithToken = async (
  { db }: Context,
  data: { token: string }
): Promise<
  | (UserDetails & {
      token: string;
    })
  | null
> => {
  try {
    const { token } = data;
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: string;
      email: string;
      roles?: Array<string>;
      iat: number;
      exp: number;
    };

    const user = await getUserByEmail({ db }, decoded.email);

    if (!user) throw new Error();

    // Fetch user roles
    const roles = await getUserRoles({ db }, user.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      token,
      roles: roles,
    };
  } catch (error) {
    console.error("Login failed: ", error);
    return null;
  }
};

// New admin functions for user management
export const getAllUsers = async ({ db }: Context): Promise<UserDetails[]> => {
  try {
    const sql = `SELECT id, email, name FROM users ORDER BY created DESC`;
    const { rows } = await db.query<UserDetails>(sql);

    // Fetch roles for each user
    const usersWithRoles = await Promise.all(
      rows.map(async (user) => {
        const roles = await getUserRoles({ db }, user.id);
        return {
          ...user,
          roles: roles,
        };
      })
    );

    return usersWithRoles;
  } catch (error) {
    console.error("Failed to get all users:", error);
    return [];
  }
};

export const deleteUser = async (
  { db }: Context,
  userId: string
): Promise<boolean> => {
  try {
    // First, we need to delete the user's relationships
    // Delete from room_members
    await db.query(`DELETE FROM room_members WHERE user_id = $1`, [userId]);

    // Delete user's messages
    await db.query(`DELETE FROM messages WHERE user_id = $1`, [userId]);

    // Delete rooms owned by user (and their associated messages and memberships)
    const roomsQuery = await db.query(`SELECT id FROM rooms WHERE owner = $1`, [
      userId,
    ]);
    const roomIds = roomsQuery.rows.map((row) => row.id);

    for (const roomId of roomIds) {
      await db.query(`DELETE FROM messages WHERE room_id = $1`, [roomId]);
      await db.query(`DELETE FROM room_members WHERE room_id = $1`, [roomId]);
    }

    await db.query(`DELETE FROM rooms WHERE owner = $1`, [userId]);

    // Finally, delete the user
    const result = await db.query(`DELETE FROM users WHERE id = $1`, [userId]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Failed to delete user:", error);
    return false;
  }
};

// Get server statistics for admin dashboard
export const getServerStatistics = async ({
  db,
}: Context): Promise<{
  totalUsers: number;
  totalRooms: number;
  totalMessages: number;
  activeRooms: {
    id: string;
    name: string;
    memberCount: number;
    messageCount: number;
  }[];
}> => {
  try {
    const userCountQuery = await db.query(`SELECT COUNT(*) FROM users`);
    const roomCountQuery = await db.query(`SELECT COUNT(*) FROM rooms`);
    const messageCountQuery = await db.query(`SELECT COUNT(*) FROM messages`);

    const activeRoomsQuery = await db.query(`
      SELECT r.id, r.name, 
        (SELECT COUNT(*) FROM room_members rm WHERE rm.room_id = r.id) as member_count,
        (SELECT COUNT(*) FROM messages m WHERE m.room_id = r.id) as message_count
      FROM rooms r
      ORDER BY message_count DESC
      LIMIT 10
    `);

    return {
      totalUsers: parseInt(userCountQuery.rows[0].count),
      totalRooms: parseInt(roomCountQuery.rows[0].count),
      totalMessages: parseInt(messageCountQuery.rows[0].count),
      activeRooms: activeRoomsQuery.rows.map((row) => ({
        id: row.id,
        name: row.name,
        memberCount: parseInt(row.member_count),
        messageCount: parseInt(row.message_count),
      })),
    };
  } catch (error) {
    console.error("Failed to get server statistics:", error);
    return { totalUsers: 0, totalRooms: 0, totalMessages: 0, activeRooms: [] };
  }
};

// Get monthly user statistics
export const getMonthlyUserStatistics = async ({
  db,
}: Context): Promise<{ month: string; userCount: number }[]> => {
  try {
    // Query to get the count of users created per month
    const sql = `
      SELECT 
        TO_CHAR(created, 'YYYY-MM') as month,
        COUNT(*) as user_count
      FROM 
        users
      GROUP BY 
        TO_CHAR(created, 'YYYY-MM')
      ORDER BY 
        month ASC
    `;

    const { rows } = await db.query(sql);

    // Transform the data into the expected format
    return rows.map((row) => ({
      month: row.month,
      userCount: parseInt(row.user_count),
    }));
  } catch (error) {
    console.error("Failed to get monthly user statistics:", error);
    return [];
  }
};
