import type { Id } from "./base";

export interface UserItem {
  userId: Id;
  fullName: string;
  email: string;
  phone: string | null;
  roleId: Id | null;
  avatarUrl: string | null;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  phone: string;
  roleId: Id;
  password: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  newPassword?: string;
}

export type SimpleUser = Pick<UserItem, "userId" | "fullName" | "email">;
