import { UserDetails } from "../../../common/src";
import { Context } from "../db/connection";
import {
  CreateUserInput,
  LoginUserInput,
  insertUser,
  loginUser,
  loginUserWithToken,
  getAllUsers,
  deleteUser,
  getServerStatistics,
  getMonthlyUserStatistics,
} from "./user.repository";

export const createUser = async (
  ctx: Context,
  userData: CreateUserInput
): Promise<UserDetails | null> => {
  if (!userData.email || !userData.name || !userData.password) {
    throw new Error("Missing user data");
  }

  return await insertUser(ctx, userData);
};

export const logUserIn = async (
  ctx: Context,
  userData: LoginUserInput
): Promise<UserDetails | null> => await loginUser(ctx, userData);

export const logUserInWithToken = async (
  ctx: Context,
  data: { token: string }
): Promise<UserDetails | null> =>
  await loginUserWithToken(ctx, { token: data.token });

// Admin functionalities
export const getUsers = async (ctx: Context): Promise<UserDetails[]> =>
  await getAllUsers(ctx);

export const removeUser = async (
  ctx: Context,
  userId: string
): Promise<boolean> => await deleteUser(ctx, userId);

export const getStatistics = async (
  ctx: Context
): Promise<ReturnType<typeof getServerStatistics>> =>
  await getServerStatistics(ctx);

export const getMonthlyUserStats = async (
  ctx: Context
): Promise<ReturnType<typeof getMonthlyUserStatistics>> =>
  await getMonthlyUserStatistics(ctx);
