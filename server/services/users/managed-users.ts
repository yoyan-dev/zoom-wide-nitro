import type { PaginatedResult, User, UserRole } from "../../types";
import {
  deleteSupabaseAuthUser,
  updateSupabaseAuthUser,
} from "../../lib/supabase";
import { deleteUserRecord } from "../../repositories/users/delete-user";
import { getUserByIdRecord } from "../../repositories/users/get-user-by-id";
import { listUserRecords } from "../../repositories/users/list-users";
import {
  updateUserRecord,
  type UpdateUserRecordInput,
} from "../../repositories/users/update-user";
import {
  conflictError,
  internalServerError,
  notFoundError,
} from "../../utils/errors";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { string } from "../../utils/validator";
import {
  isDuplicateUserError,
  isMissingAuthUserError,
} from "./user-account-errors";

export type ListManagedUsersParams = {
  q?: string;
  page?: number;
  limit?: number;
  roles: readonly UserRole[];
};

export type ManagedUserUpdateInput = UpdateUserRecordInput & {
  password?: string;
};

type ManagedUserScopeInput = {
  id: unknown;
  allowedRoles: readonly UserRole[];
  notFoundMessage: string;
};

type UpdateManagedUserInput = ManagedUserScopeInput & {
  input: ManagedUserUpdateInput;
};

function isRoleInScope(
  role: UserRole,
  allowedRoles: readonly UserRole[],
): boolean {
  return allowedRoles.includes(role);
}

async function getScopedUserOrThrow(
  input: ManagedUserScopeInput,
): Promise<User> {
  const userId = string(input.id, "User id");
  const user = await getUserByIdRecord(userId);

  if (!user || !isRoleInScope(user.role, input.allowedRoles)) {
    throw notFoundError(input.notFoundMessage);
  }

  return user;
}

async function rollbackUserRecordOrThrow(
  userId: string,
  existingUser: User,
): Promise<void> {
  try {
    const rollbackResult = await updateUserRecord(userId, {
      email: existingUser.email,
      full_name: existingUser.full_name,
      role: existingUser.role,
      phone: existingUser.phone,
      is_active: existingUser.is_active,
    });

    if (!rollbackResult) {
      throw new Error("Rollback record not found");
    }
  } catch {
    throw internalServerError(
      "User account update failed and user record rollback could not be completed",
    );
  }
}

export async function listManagedUsers(
  params: ListManagedUsersParams,
): Promise<PaginatedResult<User[]>> {
  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listUserRecords({
    q: params.q,
    roles: params.roles,
    from: pagination.from,
    to: pagination.to,
  });

  return {
    data: result.data,
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
    }),
  };
}

export async function getManagedUserById(
  input: ManagedUserScopeInput,
): Promise<User> {
  return getScopedUserOrThrow(input);
}

export async function updateManagedUser(
  params: UpdateManagedUserInput,
): Promise<User> {
  const userId = string(params.id, "User id");
  const existingUser = await getScopedUserOrThrow({
    id: userId,
    allowedRoles: params.allowedRoles,
    notFoundMessage: params.notFoundMessage,
  });
  const hasUpdates = Object.values(params.input).some(
    (value) => value !== undefined,
  );

  if (!hasUpdates) {
    return existingUser;
  }

  const userRecordUpdates: UpdateUserRecordInput = {
    email: params.input.email,
    full_name: params.input.full_name,
    role: params.input.role,
    phone: params.input.phone,
    is_active: params.input.is_active,
  };
  const hasUserRecordUpdates = Object.values(userRecordUpdates).some(
    (value) => value !== undefined,
  );

  let updatedUser = existingUser;

  if (hasUserRecordUpdates) {
    try {
      const userRecord = await updateUserRecord(userId, userRecordUpdates);

      if (!userRecord || !isRoleInScope(userRecord.role, params.allowedRoles)) {
        throw notFoundError(params.notFoundMessage);
      }

      updatedUser = userRecord;
    } catch (error) {
      if (isDuplicateUserError(error)) {
        throw conflictError("An account with this email already exists");
      }

      if (error instanceof Error) {
        throw internalServerError(error.message);
      }

      throw internalServerError("Unable to update user account");
    }
  }

  const hasAuthUpdates =
    params.input.email !== undefined ||
    params.input.password !== undefined ||
    params.input.role !== undefined ||
    params.input.full_name !== undefined ||
    params.input.phone !== undefined;

  if (!hasAuthUpdates) {
    return updatedUser;
  }

  try {
    await updateSupabaseAuthUser({
      userId,
      email: params.input.email,
      password: params.input.password,
      role: params.input.role,
      fullName: params.input.full_name,
      phone: params.input.phone,
    });

    return updatedUser;
  } catch (error) {
    if (hasUserRecordUpdates) {
      await rollbackUserRecordOrThrow(userId, existingUser);
    }

    if (isDuplicateUserError(error)) {
      throw conflictError("An account with this email already exists");
    }

    if (error instanceof Error) {
      throw internalServerError(error.message);
    }

    throw internalServerError("Unable to update user account");
  }
}

export async function deleteManagedUser(
  input: ManagedUserScopeInput,
): Promise<void> {
  const userId = string(input.id, "User id");

  await getScopedUserOrThrow({
    id: userId,
    allowedRoles: input.allowedRoles,
    notFoundMessage: input.notFoundMessage,
  });

  try {
    await deleteSupabaseAuthUser(userId);
  } catch (error) {
    if (isMissingAuthUserError(error)) {
      const deleted = await deleteUserRecord(userId);

      if (!deleted) {
        throw notFoundError(input.notFoundMessage);
      }

      return;
    }

    if (error instanceof Error) {
      throw internalServerError(error.message);
    }

    throw internalServerError("Unable to delete user account");
  }
}
