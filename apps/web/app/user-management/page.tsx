'use client';

import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/dateUtils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/DataTable';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { apiClient } from '@/lib/api/client';
import type { UserListResponse } from '@acme/contracts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserForm, UserFormValues } from '@/components/features/users/UserForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { USER_ROLE } from '@acme/contracts';

// Define types locally since they may not be exported from contracts
type UserResponse = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  updatedAt: string;
};

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
  } = useQuery({
    queryKey: ['users', 'list', { tenantId, search }],
    queryFn: async () => {
      const response = await apiClient.users.getUsers({
        query: { search, limit: 100 },
      });
      return response.body as UserListResponse;
    },
    enabled: !!tenantId,
  });

  // --- Mutations ---
  const commonMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
      setIsFormOpen(false);
    },
    onError: (e: unknown) => {
      const message =
        e instanceof Error ? e.message : '不明なエラーが発生しました';
      toast({ title: 'エラー', description: message, variant: 'destructive' });
    },
  };

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const response = await apiClient.users.createUser({
        body: data,
      });
      return response.body;
    },
    ...commonMutationOptions,
    onSuccess: () => {
      toast({ title: 'ユーザーが作成されました' });
      commonMutationOptions.onSuccess();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: UserFormValues;
    }) => {
      // Note: updateUser may not be available in the current API
      // This is a placeholder implementation
      throw new Error(
        `Update user functionality not implemented ${userId} ${JSON.stringify(data)}`
      );
    },
    ...commonMutationOptions,
    onSuccess: () => {
      toast({ title: 'ユーザーが更新されました' });
      commonMutationOptions.onSuccess();
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Note: deleteUser may not be available in the current API
      // This is a placeholder implementation
      throw new Error(`Delete user functionality not implemented ${userId}`);
    },
    ...commonMutationOptions,
    onSuccess: () => {
      toast({ title: 'ユーザーが削除されました' });
      commonMutationOptions.onSuccess();
    },
  });

  // --- Authorization ---
  React.useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.roles?.includes(USER_ROLE.TENANT_ADMIN)) {
      router.replace('/');
    }
  }, [session, status, router]);

  // --- Handlers ---
  const handleFormSubmit = (values: UserFormValues) => {
    const { id, ...data } = values;
    if (id) {
      updateUserMutation.mutate({ userId: id, data });
    } else {
      createUserMutation.mutate(data);
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
      deleteUserMutation.mutate(userId);
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
      {
        header: 'ロール',
        accessor: (row: UserResponse) => row.roles.join(', '),
      },
      {
        header: '最終更新',
        accessor: (row: UserResponse) =>
          formatDate(row.updatedAt, 'yyyy-MM-dd HH:mm'),
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
    const message =
      error instanceof Error ? error.message : '不明なエラーが発生しました';
    return <div>エラーが発生しました: {message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ユーザー管理</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="名前・メールで検索..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="max-w-sm"
        />
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateForm}>新規ユーザー作成</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? 'ユーザー編集' : '新規ユーザー作成'}
              </DialogTitle>
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
        <DataTable
          data={usersData?.users || []}
          columns={columns}
          actions={actions}
        />
      )}
      <Toaster />
    </div>
  );
}
