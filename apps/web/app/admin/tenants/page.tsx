'use client';

import { useState } from 'react';
import { handleUIError } from '@/lib/errors/uiHandler';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { CreateTenantRequest, GetTenantsResponse } from '@acme/contracts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Tenant } from '@acme/contracts';
import { TenantForm } from '@/components/admin/TenantForm';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(2),
  adminEmail: z.string().email(),
});

type FormData = z.infer<typeof formSchema>;

export default function TenantsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Dialog states
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Data states
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);

  // APIからテナント一覧を取得
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: async () => {
      const response = await apiClient.admin.getTenants();
      return response.body as GetTenantsResponse;
    },
  });
  const tenants = (data as GetTenantsResponse)?.tenants ?? [];

  // CRUD mutations
  const createTenantMutation = useMutation({
    mutationFn: (data: CreateTenantRequest) =>
      apiClient.admin.createTenant({ body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      body: Partial<CreateTenantRequest>;
    }) => {
      // Update APIが実装されていない場合のプレースホルダー
      throw new Error(
        `Update tenant API not implemented. Tried to update tenant ${data.id}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
  });

  const deleteTenantMutation = useMutation({
    mutationFn: async (data: { id: string }) => {
      // Delete APIが実装されていない場合のプレースホルダー
      throw new Error(
        `Delete tenant API not implemented. Tried to delete tenant ${data.id}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
    },
  });

  const handleFormSubmit = async (values: FormData) => {
    setIsSubmitting(true);

    try {
      const parsedValues = formSchema.parse(values);

      if (editingTenant) {
        await updateTenantMutation.mutateAsync({
          id: editingTenant.id,
          body: parsedValues,
        });
      } else {
        await createTenantMutation.mutateAsync(parsedValues);
      }

      setIsFormDialogOpen(false);
      refetch();
    } catch (err) {
      handleUIError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTenant) return;
    setIsSubmitting(true);

    try {
      await deleteTenantMutation.mutateAsync({
        id: deletingTenant.id,
      });
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (err) {
      handleUIError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openNewTenantDialog = () => {
    setEditingTenant(null);
    setIsFormDialogOpen(true);
  };

  const openEditTenantDialog = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsFormDialogOpen(true);
  };

  const openDeleteTenantDialog = (tenant: Tenant) => {
    setDeletingTenant(tenant);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        An error occurred
        <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );

  // デバッグ用: dataの内容を一時表示
  if (
    !isLoading &&
    !error &&
    (!(data as GetTenantsResponse)?.tenants ||
      !Array.isArray((data as GetTenantsResponse).tenants))
  ) {
    return (
      <div>
        <div>データ取得失敗または形式不正</div>
        <pre style={{ color: 'orange', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tenant Management</h1>
        <Button onClick={openNewTenantDialog}>New Tenant</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Tenant Code</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant: Tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>{tenant.name}</TableCell>
                <TableCell>{tenant.tenantCode}</TableCell>
                <TableCell>
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => openEditTenantDialog(tenant)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteTenantDialog(tenant)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog for Create/Edit */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingTenant ? 'Edit Tenant' : 'Create New Tenant'}
            </DialogTitle>
            <DialogDescription>
              {editingTenant
                ? 'Update the tenant details.'
                : 'Enter details for the new tenant.'}
            </DialogDescription>
          </DialogHeader>
          <TenantForm
            tenant={editingTenant}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tenant &quot;
              {deletingTenant?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
