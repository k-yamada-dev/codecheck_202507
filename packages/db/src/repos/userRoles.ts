import { UserRole, Role } from '@prisma/client';
import { prisma } from '../client';
export type UserRoleRow = UserRole;

// Data for assigning a role
export type AssignRoleData = {
  userId: string;
  tenantId: string;
  role: Role;
};

export const userRolesRepo = {
  assignRole: (data: AssignRoleData) => {
    return prisma.userRole.create({
      data,
    });
  },

  removeRole: (userId: string, tenantId: string, role: Role) => {
    return prisma.userRole.delete({
      where: { userId_tenantId_role: { userId, tenantId, role } },
    });
  },

  findRolesByUser: (userId: string): Promise<UserRole[]> => {
    return prisma.userRole.findMany({ where: { userId } });
  },

  findRolesByTenant: (tenantId: string): Promise<UserRole[]> => {
    return prisma.userRole.findMany({ where: { tenantId } });
  },
};
