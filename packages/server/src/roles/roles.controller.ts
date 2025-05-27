// Role controller for managing roles and user_roles
import { Context } from "../db/connection";
import {
  createRole,
  getAllRoles,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  removeAllRolesFromUser,
  assignAdminRole,
  removeAdminRole,
} from "./roles.repository";

export const createRoleController = async (ctx: Context, name: string) => {
  return await createRole(ctx, name);
};

export const getAllRolesController = async (ctx: Context) => {
  return await getAllRoles(ctx);
};

export const assignRoleToUserController = async (
  ctx: Context,
  userId: string,
  roleId: number
) => {
  return await assignRoleToUser(ctx, userId, roleId);
};

export const assignAdminRoleController = async (
  ctx: Context,
  userId: string
) => {
  return await assignAdminRole(ctx, userId);
};

export const removeAdminRoleController = async (
  ctx: Context,
  userId: string
) => {
  return await removeAdminRole(ctx, userId);
};

export const removeRoleFromUserController = async (
  ctx: Context,
  userId: string,
  roleId: number
) => {
  return await removeRoleFromUser(ctx, userId, roleId);
};

export const getUserRolesController = async (ctx: Context, userId: string) => {
  return await getUserRoles(ctx, userId);
};

export const removeAllRolesFromUserController = async (
  ctx: Context,
  userId: string
) => {
  return await removeAllRolesFromUser(ctx, userId);
};
