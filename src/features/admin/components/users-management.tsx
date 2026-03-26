"use client";

import { type ColumnDef } from "@tanstack/react-table";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ArrowUpDown,
  KeyRound,
  Loader2,
  MoreHorizontal,
  Plus,
  RotateCcw,
  ShieldCheck,
  SquarePen,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminToast } from "@/features/admin/components/admin-toast";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  deletedAt: string | null;
};

type RoleItem = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  level: number;
  isSystem: boolean;
};

type UsersManagementProps = {
  initialUsers: UserItem[];
  initialRoles: RoleItem[];
};

type UserForm = {
  name: string;
  email: string;
  role: string;
};

type PasswordForm = {
  password: string;
  confirmPassword: string;
};

type RoleForm = {
  key: string;
  name: string;
  description: string;
  level: number;
};

type PendingAction =
  | "create"
  | "edit"
  | "role"
  | "password"
  | "delete"
  | "reactivate"
  | "role_create"
  | "role_edit"
  | "role_remove"
  | null;

function sortRoles(input: RoleItem[]) {
  return [...input].sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
}

export function UsersManagement({ initialUsers, initialRoles }: UsersManagementProps) {
  const [users, setUsers] = useState(initialUsers);
  const [roles, setRoles] = useState(sortRoles(initialRoles));
  const { showError, showSuccess } = useAdminToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);

  const [roleCreateOpen, setRoleCreateOpen] = useState(false);
  const [roleEditOpen, setRoleEditOpen] = useState(false);
  const [roleDeleteOpen, setRoleDeleteOpen] = useState(false);

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const isPending = pendingAction !== null;

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);

  const defaultRole = roles.find((role) => role.key === "USERS")?.key ?? roles[0]?.key ?? "USERS";

  const [createForm, setCreateForm] = useState<UserForm & { password: string }>({
    name: "",
    email: "",
    role: defaultRole,
    password: "",
  });
  const [editForm, setEditForm] = useState<UserForm>({
    name: "",
    email: "",
    role: defaultRole,
  });
  const [roleForm, setRoleForm] = useState<{ role: string }>({ role: defaultRole });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    password: "",
    confirmPassword: "",
  });

  const [roleCreateForm, setRoleCreateForm] = useState<RoleForm>({
    key: "",
    name: "",
    description: "",
    level: 20,
  });
  const [roleEditForm, setRoleEditForm] = useState<Omit<RoleForm, "key">>({
    name: "",
    description: "",
    level: 20,
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
    if (isPending) return;
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setEditOpen(true);
  }

  function openRoleModal(user: UserItem) {
    if (isPending) return;
    setSelectedUser(user);
    setRoleForm({ role: user.role });
    setRoleOpen(true);
  }

  function openPasswordModal(user: UserItem) {
    if (isPending) return;
    setSelectedUser(user);
    setPasswordForm({ password: "", confirmPassword: "" });
    setPasswordOpen(true);
  }

  function openDeleteModal(user: UserItem) {
    if (isPending) return;
    setSelectedUser(user);
    setDeleteOpen(true);
  }

  function openReactivateModal(user: UserItem) {
    if (isPending) return;
    setSelectedUser(user);
    setReactivateOpen(true);
  }

  function openRoleEditModal(role: RoleItem) {
    if (isPending) return;
    setSelectedRole(role);
    setRoleEditForm({
      name: role.name,
      description: role.description ?? "",
      level: role.level,
    });
    setRoleEditOpen(true);
  }

  function openRoleDeleteModal(role: RoleItem) {
    if (isPending) return;
    setSelectedRole(role);
    setRoleDeleteOpen(true);
  }

  async function createUser() {
    if (isPending) return;

    setPendingAction("create");

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
      setCreateForm({ name: "", email: "", role: defaultRole, password: "" });
      showSuccess("User created successfully.");
    } catch (createError) {
      showError(createError instanceof Error ? createError.message : "Unexpected error.");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateUser() {
    if (!selectedUser || isPending) return;

    setPendingAction("edit");

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

      setUsers((prev) => prev.map((item) => (item.id === selectedUser.id ? (json.user as UserItem) : item)));
      setEditOpen(false);
      setSelectedUser(null);
      showSuccess("User updated successfully.");
    } catch (updateError) {
      showError(updateError instanceof Error ? updateError.message : "Unexpected error.");
    } finally {
      setPendingAction(null);
    }
  }

  async function updateRole() {
    if (!selectedUser || isPending) return;

    setPendingAction("role");

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
      setPendingAction(null);
    }
  }

  async function updatePassword() {
    if (!selectedUser || isPending) return;

    if (passwordForm.password.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      showError("Password confirmation does not match.");
      return;
    }

    setPendingAction("password");

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
      showError(passwordError instanceof Error ? passwordError.message : "Unexpected error.");
    } finally {
      setPendingAction(null);
    }
  }

  async function softDeleteUser() {
    if (!selectedUser || isPending) return;

    setPendingAction("delete");

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
      showError(deleteError instanceof Error ? deleteError.message : "Unexpected error.");
    } finally {
      setPendingAction(null);
    }
  }

  async function reactivateUser() {
    if (!selectedUser || isPending) return;

    setPendingAction("reactivate");

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/reactivate`, {
        method: "PATCH",
      });
      const json = (await response.json()) as { user?: UserItem; error?: string };
      if (!response.ok || !json.user) {
        throw new Error(json.error ?? "Failed to reactivate user.");
      }

      setUsers((prev) => prev.map((item) => (item.id === selectedUser.id ? (json.user as UserItem) : item)));
      setReactivateOpen(false);
      setSelectedUser(null);
      showSuccess("User reactivated successfully.");
    } catch (reactivateError) {
      showError(reactivateError instanceof Error ? reactivateError.message : "Unexpected error.");
    } finally {
      setPendingAction(null);
    }
  }

  async function createRole() {
    if (isPending) return;

    setPendingAction("role_create");

    try {
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleCreateForm),
      });

      const json = (await response.json()) as { role?: RoleItem; error?: string };
      if (!response.ok || !json.role) {
        throw new Error(json.error ?? "Failed to create role.");
      }

      setRoles((prev) => sortRoles([json.role as RoleItem, ...prev.filter((item) => item.id !== json.role?.id)]));
      setRoleCreateOpen(false);
      setRoleCreateForm({ key: "", name: "", description: "", level: 20 });
      showSuccess("Role created successfully.");
    } catch (createError) {
      showError(createError instanceof Error ? createError.message : "Unexpected error.");
    } finally {
      setPendingAction(null);
    }
  }

  async function editRole() {
    if (!selectedRole || isPending) return;

    setPendingAction("role_edit");

    try {
      const response = await fetch(`/api/admin/roles/${selectedRole.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleEditForm),
      });

      const json = (await response.json()) as { role?: RoleItem; error?: string };
      if (!response.ok || !json.role) {
        throw new Error(json.error ?? "Failed to update role.");
      }

      setRoles((prev) => sortRoles(prev.map((role) => (role.id === selectedRole.id ? (json.role as RoleItem) : role))));
      setRoleEditOpen(false);
      setSelectedRole(null);
      showSuccess("Role updated successfully.");
    } catch (editError) {
      showError(editError instanceof Error ? editError.message : "Unexpected error.");
    } finally {
      setPendingAction(null);
    }
  }

  async function removeRole() {
    if (!selectedRole || isPending) return;

    setPendingAction("role_remove");

    try {
      const response = await fetch(`/api/admin/roles/${selectedRole.id}`, {
        method: "DELETE",
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to remove role.");
      }

      setRoles((prev) => prev.filter((role) => role.id !== selectedRole.id));
      setRoleDeleteOpen(false);
      setSelectedRole(null);
      showSuccess("Role removed successfully.");
    } catch (removeError) {
      showError(removeError instanceof Error ? removeError.message : "Unexpected error.");
    } finally {
      setPendingAction(null);
    }
  }

  const userColumns: ColumnDef<UserItem>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="inline-flex items-center gap-1.5 font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
        >
          Name
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => <span className="font-medium text-neutral-900 dark:text-white">{row.original.name}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300">
          {row.original.role}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="inline-flex items-center gap-1.5 font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
        >
          Created
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => row.original.createdAt,
    },
    {
      id: "actions",
      enableSorting: false,
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                disabled={isPending}
                className="inline-flex items-center rounded-lg border border-neutral-200 p-1.5 text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300"
              >
                <MoreHorizontal className="h-4 w-4" />
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
                  Archive
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        );
      },
    },
  ];

  const rolesColumns: ColumnDef<RoleItem>[] = [
    {
      accessorKey: "key",
      header: "Key",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.key}</span>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: "level",
      header: ({ column }) => (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="inline-flex items-center gap-1.5 font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
        >
          Level
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => row.original.level,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description ?? "-",
    },
    {
      id: "role_actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openRoleEditModal(row.original)}
            disabled={isPending}
            className="rounded-md border border-neutral-200 px-2 py-1 text-xs font-medium text-neutral-700 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => openRoleDeleteModal(row.original)}
            disabled={isPending || row.original.isSystem}
            className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:text-red-300"
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  const archivedColumns: ColumnDef<UserItem>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium text-neutral-900 dark:text-white">{row.original.name}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "deletedAt",
      header: ({ column }) => (
        <button
          type="button"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="inline-flex items-center gap-1.5 font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
        >
          Archived At
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => row.original.deletedAt ?? "-",
    },
    {
      id: "actions",
      enableSorting: false,
      header: "Action",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <button
            type="button"
            onClick={() => openReactivateModal(user)}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2 py-1 text-xs font-medium text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-900/60 dark:text-emerald-300"
          >
            {pendingAction === "reactivate" && selectedUser?.id === user.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            Reactivate
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Users Management</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Manage your users with role-based access controls and safe confirmation flows.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingAction === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            New User
          </button>
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
          <Users className="h-3.5 w-3.5" />
          {activeUsers.length} active users, {archivedUsers.length} archived users, {roles.length} active roles
        </div>

        <div className="mb-6 rounded-lg border border-neutral-200/70 bg-neutral-50 p-3 dark:border-neutral-800/70 dark:bg-neutral-900/70">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Role Based CRUD</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Create, edit, and remove roles dynamically based on your project requirements.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRoleCreateOpen(true)}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-violet-900/60 dark:bg-neutral-800 dark:text-violet-300"
            >
              {pendingAction === "role_create" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              New Role
            </button>
          </div>
          <DataTable
            columns={rolesColumns}
            data={roles}
            filterColumnId="name"
            filterPlaceholder="Search role..."
            emptyMessage="No roles found."
            pageSize={5}
          />
        </div>

        <DataTable
          columns={userColumns}
          data={activeUsers}
          filterColumnId="name"
          filterPlaceholder="Search user name..."
          emptyMessage="No active users found."
        />
      </section>

      {archivedUsers.length > 0 ? (
        <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Archived Users</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Reactivate archived users when needed.
          </p>
          <div className="mt-4">
            <DataTable
              columns={archivedColumns}
              data={archivedUsers}
              filterColumnId="name"
              filterPlaceholder="Search archived user..."
              emptyMessage="No archived users found."
            />
          </div>
        </section>
      ) : null}

      <Modal
        open={createOpen}
        onClose={() => (isPending ? null : setCreateOpen(false))}
        title="Create user"
        description="Confirm new user creation."
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              disabled={isPending}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createUser}
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pendingAction === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Create
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            required
            value={createForm.name}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Full name"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <input
            required
            type="email"
            value={createForm.email}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="Email"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <input
            required
            type="password"
            minLength={6}
            value={createForm.password}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Password"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <Select
            value={createForm.role}
            onValueChange={(value) => setCreateForm((prev) => ({ ...prev, role: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.key}>
                  {role.name} ({role.key})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => (isPending ? null : setEditOpen(false))}
        title="Edit user"
        description="Confirm profile and role updates."
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              disabled={isPending}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={updateUser}
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pendingAction === "edit" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Edit
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            required
            value={editForm.name}
            onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Full name"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <input
            required
            type="email"
            value={editForm.email}
            onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="Email"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <Select
            value={editForm.role}
            onValueChange={(value) => setEditForm((prev) => ({ ...prev, role: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.key}>
                  {role.name} ({role.key})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Modal>

      <Modal
        open={roleOpen}
        onClose={() => (isPending ? null : setRoleOpen(false))}
        title="Change role"
        description={`Confirm role change for ${selectedUser?.email ?? "this user"}.`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setRoleOpen(false)}
              disabled={isPending}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={updateRole}
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pendingAction === "role" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Role Change
            </button>
          </>
        }
      >
        <Select value={roleForm.role} onValueChange={(value) => setRoleForm({ role: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.key}>
                {role.name} ({role.key})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Modal>

      <Modal
        open={passwordOpen}
        onClose={() => (isPending ? null : setPasswordOpen(false))}
        title="Change password"
        description={`Confirm password update for ${selectedUser?.email ?? "this user"}.`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setPasswordOpen(false)}
              disabled={isPending}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={updatePassword}
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pendingAction === "password" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
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
            onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="New password"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <input
            type="password"
            minLength={6}
            value={passwordForm.confirmPassword}
            onChange={(event) => setPasswordForm((prev) => ({
              ...prev,
              confirmPassword: event.target.value,
            }))}
            placeholder="Confirm new password"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => (isPending ? null : setDeleteOpen(false))}
        title="Delete user"
        description={`Soft delete ${selectedUser?.email ?? "this user"}? This user will be hidden from the list and blocked from login.`}
        icon={<Trash2 className="h-5 w-5" />}
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              disabled={isPending}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={softDeleteUser}
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pendingAction === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Delete
            </button>
          </>
        }
      />

      <Modal
        open={reactivateOpen}
        onClose={() => (isPending ? null : setReactivateOpen(false))}
        title="Reactivate user"
        description={`Reactivate ${selectedUser?.email ?? "this user"} and allow login access again?`}
        icon={<RotateCcw className="h-5 w-5" />}
        footer={
          <>
            <button
              type="button"
              onClick={() => setReactivateOpen(false)}
              disabled={isPending}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={reactivateUser}
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pendingAction === "reactivate" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Reactivate
            </button>
          </>
        }
      />

      <Modal
        open={roleCreateOpen}
        onClose={() => (isPending ? null : setRoleCreateOpen(false))}
        title="Create role"
        description="Add a new role to the system."
        footer={
          <>
            <button
              type="button"
              onClick={() => setRoleCreateOpen(false)}
              disabled={isPending}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createRole}
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pendingAction === "role_create" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Create
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            required
            value={roleCreateForm.key}
            onChange={(event) => setRoleCreateForm((prev) => ({ ...prev, key: event.target.value }))}
            placeholder="Role key (ex: SUPPORT_AGENT)"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm uppercase dark:border-neutral-700 dark:bg-neutral-800"
          />
          <input
            required
            value={roleCreateForm.name}
            onChange={(event) => setRoleCreateForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Role name"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <textarea
            value={roleCreateForm.description}
            onChange={(event) => setRoleCreateForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Description"
            className="min-h-20 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <input
            type="number"
            min={1}
            max={1000}
            value={roleCreateForm.level}
            onChange={(event) =>
              setRoleCreateForm((prev) => ({ ...prev, level: Number(event.target.value || 1) }))
            }
            placeholder="Level"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
      </Modal>

      <Modal
        open={roleEditOpen}
        onClose={() => (isPending ? null : setRoleEditOpen(false))}
        title="Edit role"
        description={`Update role settings for ${selectedRole?.key ?? "this role"}.`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setRoleEditOpen(false)}
              disabled={isPending}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={editRole}
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pendingAction === "role_edit" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Update
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            required
            value={roleEditForm.name}
            onChange={(event) => setRoleEditForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Role name"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <textarea
            value={roleEditForm.description}
            onChange={(event) => setRoleEditForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Description"
            className="min-h-20 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <input
            type="number"
            min={1}
            max={1000}
            value={roleEditForm.level}
            onChange={(event) =>
              setRoleEditForm((prev) => ({ ...prev, level: Number(event.target.value || 1) }))
            }
            placeholder="Level"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
      </Modal>

      <Modal
        open={roleDeleteOpen}
        onClose={() => (isPending ? null : setRoleDeleteOpen(false))}
        title="Remove role"
        description={`Remove role ${selectedRole?.key ?? ""}? This cannot be undone.`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setRoleDeleteOpen(false)}
              disabled={isPending}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium disabled:opacity-60 dark:border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={removeRole}
              disabled={isPending || selectedRole?.isSystem}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pendingAction === "role_remove" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Remove
            </button>
          </>
        }
      />
    </div>
  );
}
