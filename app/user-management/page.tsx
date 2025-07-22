'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type User = {
  id: string;
  tenantId: string;
  provider: string;
  externalId: string;
  name: string;
  email: string;
  updatedAt: string;
  roles?: string[];
};

import { ALL_ROLES, USER_ROLES } from '@/app/types/role';

export default function UserManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRoles, setEditRoles] = useState<string[]>([]);

  // internal-admin以外はアクセス不可
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.roles?.includes(USER_ROLES.TENANT_ADMIN)) {
      router.replace('/'); // 権限なしはトップへリダイレクト
    }
  }, [session, status, router]);

  // ユーザー一覧取得
  useEffect(() => {
    if (!session?.user?.tenantId) return;
    setLoading(true);
    fetch(`/api/v1/users?tenantId=${session.user.tenantId}&search=${encodeURIComponent(search)}`)
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .finally(() => setLoading(false));
  }, [session?.user?.tenantId, search]);

  // ユーザー詳細表示
  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRoles(user.roles || []);
  };

  // 閉じる
  const handleCloseDetail = () => {
    setSelectedUser(null);
  };

  // ユーザー削除
  const handleDelete = async (user: User) => {
    if (!window.confirm(`ユーザー「${user.name}」を削除しますか？`)) return;
    await fetch(`/api/v1/users/${user.id}?tenantId=${user.tenantId}`, {
      method: 'DELETE',
    });
    setUsers(users.filter(u => u.id !== user.id));
    setSelectedUser(null);
  };

  // ユーザー編集
  const handleEdit = async () => {
    if (!selectedUser) return;
    await fetch(`/api/v1/users/${selectedUser.id}?tenantId=${selectedUser.tenantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, email: editEmail, roles: editRoles }),
    });
    setUsers(
      users.map(u =>
        u.id === selectedUser.id ? { ...u, name: editName, email: editEmail, roles: editRoles } : u
      )
    );
    setSelectedUser({ ...selectedUser, name: editName, email: editEmail, roles: editRoles });
  };

  // ロールのトグル
  const toggleRole = (role: string) => {
    setEditRoles(r => (r.includes(role) ? r.filter(x => x !== role) : [...r, role]));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ユーザー管理</h1>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="名前・メール・IDで検索"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button onClick={() => setSearch('')}>クリア</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">名前</th>
              <th className="border px-2 py-1">メール</th>
              <th className="border px-2 py-1">provider</th>
              <th className="border px-2 py-1">externalId</th>
              <th className="border px-2 py-1">最終更新</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  ユーザーが見つかりません
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr
                  key={user.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleRowClick(user)}
                >
                  <td className="border px-2 py-1">{user.id}</td>
                  <td className="border px-2 py-1">{user.name}</td>
                  <td className="border px-2 py-1">{user.email}</td>
                  <td className="border px-2 py-1">{user.provider}</td>
                  <td className="border px-2 py-1">{user.externalId}</td>
                  <td className="border px-2 py-1">{user.updatedAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* 詳細モーダル */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 min-w-[320px] max-w-lg">
            <h2 className="text-xl font-bold mb-2">ユーザー詳細</h2>
            <div className="mb-2">
              <strong>ID:</strong> {selectedUser.id}
            </div>
            <div className="mb-2">
              <strong>名前:</strong>
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="ml-2 inline-block w-48"
              />
            </div>
            <div className="mb-2">
              <strong>メール:</strong>
              <Input
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                className="ml-2 inline-block w-48"
              />
            </div>
            <div className="mb-2">
              <strong>provider:</strong> {selectedUser.provider}
            </div>
            <div className="mb-2">
              <strong>externalId:</strong> {selectedUser.externalId}
            </div>
            <div className="mb-2">
              <strong>最終更新:</strong> {selectedUser.updatedAt}
            </div>
            <div className="mb-2">
              <strong>ロール:</strong>
              <div className="flex gap-2 mt-1">
                {ALL_ROLES.map(role => (
                  <label key={role} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={editRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="destructive" onClick={() => handleDelete(selectedUser)}>
                削除
              </Button>
              <Button onClick={handleEdit}>保存</Button>
              <Button onClick={handleCloseDetail}>閉じる</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
