"use client";

import { Role } from "@prisma/client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { KeyRound, Loader2, Plus, RotateCcw, ShieldCheck, SquarePen, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Modal } from "@/components/ui/modal";
import { useAdminToast } from "@/features/admin/components/admin-toast";
import { roles } from "@/lib/auth/roles";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  deletedAt: string | null;
};

type UsersManagementProps = {
  initialUsers: UserItem[];
};

type UserForm = {
  name: string;
  email: string;
  role: Role;
};

type PasswordForm = {
  password: string;
  confirmPassword: string;
};

const defaultCreateForm: UserForm & { password: string } = {
  name: "",
  email: "",
  role: Role.VIEWER,
  password: "",
};

export function UsersManagement({ initialUsers }: UsersManagementProps) {
  const [users, setUsers] = useState(initialUsers);
  const { showError, showSuccess } = useAdminToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [createForm, setCreateForm] = useState(defaultCreateForm);
  const [editForm, setEditForm] = useState<UserForm>({
    name: "",
    email: "",
    role: Role.VIEWER,
  });
  const [roleForm, setRoleForm] = useState<{ role: Role }>({ role: Role.VIEWER });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    password: "",
    confirmPassword: "",
  });

  const activeUsers = useMemo(
    () =>
      [...users]
        .filter((user) => !user.deletedAt)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [users],
  );

  const archivedUsers = useMemo(
    () =>
      [...users]
        .filter((user) => Boolean(user.deletedAt))
        .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? "")),
    [users],
  );

  function openEditModal(user: UserItem) {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setEditOpen(true);
  }

  function openRoleModal(user: UserItem) {
    setSelectedUser(user);
    setRoleForm({ role: user.role });
    setRoleOpen(true);
  }

  function openPasswordModal(user: UserItem) {
    setSelectedUser(user);
    setPasswordForm({ password: "", confirmPassword: "" });
    setPasswordOpen(true);
  }

  function openDeleteModal(user: UserItem) {
    setSelectedUser(user);
    setDeleteOpen(true);
  }

  function openReactivateModal(user: UserItem) {
    setSelectedUser(user);
    setReactivateOpen(true);
  }

  async function createUser() {
    if (submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const json = (await response.json()) as { user?: UserItem; error?: string };
      if (!response.ok || !json.user) {
        throw new Error(json.error ?? "Failed to create user.");
      }

      setUsers((prev) => [json.user as UserItem, ...prev]);
      setCreateOpen(false);
      setCreateForm(defaultCreateForm);
      showSuccess("User created successfully.");
    } catch (createError) {
      showError(
        createError instanceof Error ? createError.message : "Unexpected error.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function updateUser() {
    if (!selectedUser || submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const json = (await response.json()) as { user?: UserItem; error?: string };
      if (!response.ok || !json.user) {
        throw new Error(json.error ?? "Failed to update user.");
      }

      setUsers((prev) =>
        prev.map((item) => (item.id === selectedUser.id ? (json.user as UserItem) : item)),
      );
      setEditOpen(false);
      setSelectedUser(null);
      showSuccess("User updated successfully.");
    } catch (updateError) {
      showError(
        updateError instanceof Error ? updateError.message : "Unexpected error.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function updateRole() {
    if (!selectedUser || submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleForm),
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to update role.");
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === selectedUser.id ? { ...item, role: roleForm.role } : item,
        ),
      );
      setRoleOpen(false);
      setSelectedUser(null);
      showSuccess("Role updated successfully.");
    } catch (roleError) {
      showError(roleError instanceof Error ? roleError.message : "Unexpected error.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updatePassword() {
    if (!selectedUser || submitting) return;

    if (passwordForm.password.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      showError("Password confirmation does not match.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordForm.password }),
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to change password.");
      }

      setPasswordOpen(false);
      setSelectedUser(null);
      setPasswordForm({ password: "", confirmPassword: "" });
      showSuccess("Password changed successfully.");
    } catch (passwordError) {
      showError(
        passwordError instanceof Error
          ? passwordError.message
          : "Unexpected error.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function softDeleteUser() {
    if (!selectedUser || submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      const json = (await response.json()) as { error?: string; deletedAt?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to archive user.");
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === selectedUser.id
            ? { ...item, deletedAt: json.deletedAt ?? new Date().toISOString().slice(0, 10) }
            : item,
        ),
      );
      setDeleteOpen(false);
      setSelectedUser(null);
      showSuccess("User archived successfully.");
    } catch (deleteError) {
      showError(
        deleteError instanceof Error ? deleteError.message : "Unexpected error.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function reactivateUser() {
    if (!selectedUser || submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/reactivate`, {
        method: "PATCH",
      });
      const json = (await response.json()) as { user?: UserItem; error?: string };
      if (!response.ok || !json.user) {
        throw new Error(json.error ?? "Failed to reactivate user.");
      }

      setUsers((prev) =>
        prev.map((item) => (item.id === selectedUser.id ? (json.user as UserItem) : item)),
      );
      setReactivateOpen(false);
      setSelectedUser(null);
      showSuccess("User reactivated successfully.");
    } catch (reactivateError) {
      showError(
        reactivateError instanceof Error
          ? reactivateError.message
          : "Unexpected error.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Users Management</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              All user actions are handled through confirmation modals.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>

        <div className="overflow-x-auto">
          <ScrollArea.Root className="w-full overflow-hidden rounded-lg border border-neutral-200/60 dark:border-neutral-800/60">
            <ScrollArea.Viewport className="w-full">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                    <th className="px-2 py-2 font-medium">Name</th>
                    <th className="px-2 py-2 font-medium">Email</th>
                    <th className="px-2 py-2 font-medium">Role</th>
                    <th className="px-2 py-2 font-medium">Created</th>
                    <th className="px-2 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.map((user) => (
                    <tr key={user.id} className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="px-2 py-3 text-neutral-900 dark:text-white">{user.name}</td>
                      <td className="px-2 py-3 text-neutral-700 dark:text-neutral-300">{user.email}</td>
                      <td className="px-2 py-3 text-neutral-700 dark:text-neutral-300">{user.role}</td>
                      <td className="px-2 py-3 text-neutral-700 dark:text-neutral-300">{user.createdAt}</td>
                      <td className="px-2 py-3">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button
                              type="button"
                              className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
                            >
                              Manage
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content className="z-50 min-w-44 rounded-lg border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                              <DropdownMenu.Item
                                onClick={() => openEditModal(user)}
                                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-700 outline-none hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                              >
                                <SquarePen className="h-3.5 w-3.5" />
                                Edit
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onClick={() => openRoleModal(user)}
                                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-700 outline-none hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Role
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onClick={() => openPasswordModal(user)}
                                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-700 outline-none hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                              >
                                <KeyRound className="h-3.5 w-3.5" />
                                Password
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onClick={() => openDeleteModal(user)}
                                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-red-600 outline-none hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical" className="w-2.5 p-0.5">
              <ScrollArea.Thumb className="rounded-full bg-neutral-300 dark:bg-neutral-700" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>
      </section>

      {archivedUsers.length > 0 ? (
        <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Archived Users</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Reactivate archived users when needed.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="px-2 py-2 font-medium">Email</th>
                  <th className="px-2 py-2 font-medium">Archived At</th>
                  <th className="px-2 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {archivedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-100 dark:border-neutral-800">
                    <td className="px-2 py-3 text-neutral-900 dark:text-white">{user.name}</td>
                    <td className="px-2 py-3 text-neutral-700 dark:text-neutral-300">{user.email}</td>
                    <td className="px-2 py-3 text-neutral-700 dark:text-neutral-300">{user.deletedAt}</td>
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        onClick={() => openReactivateModal(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-300"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <Modal
        open={createOpen}
        onClose={() => (submitting ? null : setCreateOpen(false))}
        title="Create user"
        description="Confirm new user creation."
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              disabled={submitting}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createUser}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Create
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            required
            value={createForm.name}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="Full name"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <input
            required
            type="email"
            value={createForm.email}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="Email"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <input
            required
            type="password"
            minLength={6}
            value={createForm.password}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder="Password"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <select
            value={createForm.role}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, role: event.target.value as Role }))
            }
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => (submitting ? null : setEditOpen(false))}
        title="Edit user"
        description="Confirm profile and role updates."
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              disabled={submitting}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={updateUser}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Edit
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            required
            value={editForm.name}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="Full name"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <input
            required
            type="email"
            value={editForm.email}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="Email"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <select
            value={editForm.role}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, role: event.target.value as Role }))
            }
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </Modal>

      <Modal
        open={roleOpen}
        onClose={() => (submitting ? null : setRoleOpen(false))}
        title="Change role"
        description={`Confirm role change for ${selectedUser?.email ?? "this user"}.`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setRoleOpen(false)}
              disabled={submitting}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={updateRole}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Role Change
            </button>
          </>
        }
      >
        <select
          value={roleForm.role}
          onChange={(event) => setRoleForm({ role: event.target.value as Role })}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </Modal>

      <Modal
        open={passwordOpen}
        onClose={() => (submitting ? null : setPasswordOpen(false))}
        title="Change password"
        description={`Confirm password update for ${selectedUser?.email ?? "this user"}.`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setPasswordOpen(false)}
              disabled={submitting}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={updatePassword}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Password Change
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            type="password"
            minLength={6}
            value={passwordForm.password}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder="New password"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <input
            type="password"
            minLength={6}
            value={passwordForm.confirmPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({
                ...prev,
                confirmPassword: event.target.value,
              }))
            }
            placeholder="Confirm new password"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => (submitting ? null : setDeleteOpen(false))}
        title="Delete user"
        description={`Soft delete ${selectedUser?.email ?? "this user"}? This user will be hidden from the list and blocked from login.`}
        icon={<Trash2 className="h-5 w-5" />}
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              disabled={submitting}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={softDeleteUser}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Delete
            </button>
          </>
        }
      />

      <Modal
        open={reactivateOpen}
        onClose={() => (submitting ? null : setReactivateOpen(false))}
        title="Reactivate user"
        description={`Reactivate ${selectedUser?.email ?? "this user"} and allow login access again?`}
        icon={<RotateCcw className="h-5 w-5" />}
        footer={
          <>
            <button
              type="button"
              onClick={() => setReactivateOpen(false)}
              disabled={submitting}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={reactivateUser}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Reactivate
            </button>
          </>
        }
      />
    </div>
  );
}
