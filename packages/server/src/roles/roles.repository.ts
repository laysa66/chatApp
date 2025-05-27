// Role repository for managing roles and user_roles
import { Role } from "../../../common/src";
import { Context } from "../db/connection";

export const createRole = async ({ db }: Context, name: string) => {
  const res = await db.query(
    "INSERT INTO roles (name) VALUES ($1) RETURNING *",
    [name]
  );
  return res.rows[0];
};

export const getAllRoles = async ({ db }: Context) => {
  const res = await db.query("SELECT * FROM roles ORDER BY id ASC");
  return res.rows;
};

export const assignRoleToUser = async (
  { db }: Context,
  userId: string,
  roleId: number
) => {
  await db.query(
    "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [userId, roleId]
  );
  return true;
};

export const assignAdminRole = async ({ db }: Context, userId: string) => {
  await db.query("BEGIN");
  try {
    // Get the admin role id
    const adminRoleRes = await db.query(
      "SELECT id FROM roles WHERE name = $1",
      ["admin"]
    );
    if (adminRoleRes.rowCount === 0) {
      throw new Error("Admin role not found");
    }
    const adminRoleId = adminRoleRes.rows[0].id;

    await db.query("DELETE FROM user_roles WHERE user_id = $1", [userId]);
    await db.query(
      "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
      [userId, adminRoleId]
    );
    await db.query("COMMIT");
    return true;
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
};

export const removeAdminRole = async ({ db }: Context, userId: string) => {
  await db.query("BEGIN");
  try {
    // Get the default role id (assuming 'user' is the default)
    const defaultRoleRes = await db.query(
      "SELECT id FROM roles WHERE name = $1",
      ["user"]
    );
    if (defaultRoleRes.rowCount === 0) {
      throw new Error("Default role not found");
    }
    const defaultRoleId = defaultRoleRes.rows[0].id;

    await db.query("DELETE FROM user_roles WHERE user_id = $1", [userId]);
    await db.query(
      "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
      [userId, defaultRoleId]
    );
    await db.query("COMMIT");
    return true;
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
};

export const removeRoleFromUser = async (
  { db }: Context,
  userId: string,
  roleId: number
) => {
  await db.query("DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2", [
    userId,
    roleId,
  ]);
  return true;
};

export const removeAllRolesFromUser = async (
  { db }: Context,
  userId: string
) => {
  await db.query("DELETE FROM user_roles WHERE user_id = $1", [userId]);
  return true;
};

export const getUserRoles = async (
  { db }: Context,
  userId: string
): Promise<Role[]> => {
  const res = await db.query(
    "SELECT r.id, r.name FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1",
    [userId]
  );
  return res.rows as Role[];
};
