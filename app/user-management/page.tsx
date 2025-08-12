'use client';

import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/DataTable';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { UserResponse } from '@/app/api/_schemas/users';
import {
  useUsersGetUsers,
  useUsersCreateUser,
  useUsersUpdateUser,
  useUsersDeleteUser,
} from '@/__generated__/hooks';
import { UserForm, UserFormValues } from '@/components/features/users/UserForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { USER_ROLES } from '@/lib/types/role';
import { useQueryClient } from '@tanstack/react-query';

export default function UserManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  const tenantId = session?.user?.tenantId;

  // --- Data Fetching ---
  const {
    data: usersData,
    isLoading,
    error,
  } = useUsersGetUsers(
    { query: { tenantId: tenantId!, search, limit: 100 } },
    { enabled: !!tenantId }
  );

  // --- Mutations ---
  const commonMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
      setIsFormOpen(false);
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : '不明なエラーが発生しました';
      toast({ title: 'エラー', description: message, variant: 'destructive' });
    },
  };

  const createUserMutation = useUsersCreateUser({
    ...commonMutationOptions,
    onSuccess: () => {
      toast({ title: 'ユーザーが作成されました' });
      commonMutationOptions.onSuccess();
    },
  });

  const updateUserMutation = useUsersUpdateUser({
    ...commonMutationOptions,
    onSuccess: () => {
      toast({ title: 'ユーザーが更新されました' });
      commonMutationOptions.onSuccess();
    },
  });

  const deleteUserMutation = useUsersDeleteUser({
    ...commonMutationOptions,
    onSuccess: () => {
      toast({ title: 'ユーザーが削除されました' });
      commonMutationOptions.onSuccess();
    },
  });

  // --- Authorization ---
  React.useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.roles?.includes(USER_ROLES.TENANT_ADMIN)) {
      router.replace('/');
    }
  }, [session, status, router]);

  // --- Handlers ---
  const handleFormSubmit = (values: UserFormValues) => {
    const { id, ...data } = values;
    if (id) {
      updateUserMutation.mutate({ path: { userId: id }, body: data });
    } else {
      createUserMutation.mutate({ body: data });
    }
  };

  const openCreateForm = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const openEditForm = (user: UserResponse) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('本当にこのユーザーを削除しますか？')) {
      deleteUserMutation.mutate({ path: { userId } });
    }
  };

  // --- Table Columns ---
  const columns: {
    header: React.ReactNode;
    accessor: keyof UserResponse | ((row: UserResponse) => React.ReactNode);
  }[] = useMemo(
    () => [
      { header: 'ID', accessor: 'id' },
      { header: '名前', accessor: 'name' },
      { header: 'メール', accessor: 'email' },
      { header: 'ロール', accessor: (row: UserResponse) => row.roles.join(', ') },
      {
        header: '最終更新',
        accessor: (row: UserResponse) => format(new Date(row.updatedAt), 'yyyy-MM-dd HH:mm'),
      },
    ],
    []
  );

  const actions = (row: UserResponse) => [
    {
      label: '編集',
      onClick: () => openEditForm(row),
    },
    {
      label: '削除',
      onClick: () => handleDelete(row.id),
    },
  ];

  if (status === 'loading' || !tenantId) {
    return <div>Loading...</div>;
  }
  if (error) {
    const message = error instanceof Error ? error.message : '不明なエラーが発生しました';
    return <div>エラーが発生しました: {message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ユーザー管理</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="名前・メールで検索..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateForm}>新規ユーザー作成</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedUser ? 'ユーザー編集' : '新規ユーザー作成'}</DialogTitle>
            </DialogHeader>
            <UserForm
              onSubmit={handleFormSubmit}
              defaultValues={selectedUser}
              isSubmitting={
                createUserMutation.isPending ||
                updateUserMutation.isPending ||
                deleteUserMutation.isPending
              }
            />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <DataTable data={usersData?.users || []} columns={columns} actions={actions} />
      )}
      <Toaster />
    </div>
  );
}
