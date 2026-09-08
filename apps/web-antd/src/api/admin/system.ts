import type {
  AdminUserCreateDTO,
  AdminUserUpdateDTO,
  AdminUserVO,
  CommonPage,
  RoleDTO,
  RoleVO,
} from './model';

import { requestClient } from '#/api/request';

/**
 * 分页查询管理员列表
 */
export async function pageAdminUsersApi(params: {
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
  roleId?: number;
  status?: number;
}) {
  return requestClient.get<CommonPage<AdminUserVO>>('/admin/sys/user/page', {
    params,
  });
}

/**
 * 新增管理员账号
 */
export async function createAdminUserApi(data: AdminUserCreateDTO) {
  return requestClient.post<AdminUserVO>('/admin/sys/user', data);
}

/**
 * 编辑管理员账号
 */
export async function updateAdminUserApi(id: number, data: AdminUserUpdateDTO) {
  return requestClient.put<AdminUserVO>(`/admin/sys/user/${id}`, data);
}

/**
 * 删除管理员账号
 */
export async function deleteAdminUserApi(id: number) {
  return requestClient.delete(`/admin/sys/user/${id}`);
}

/**
 * 启用/停用管理员账号 (1-启用, 0-停用)
 */
export async function updateAdminUserStatusApi(id: number, status: number) {
  return requestClient.put(`/admin/sys/user/${id}/status`, undefined, {
    params: { status },
  });
}

/**
 * 重置管理员密码
 */
export async function resetAdminUserPasswordApi(id: number, password: string) {
  return requestClient.put(`/admin/sys/user/${id}/reset-pwd`, undefined, {
    params: { password },
  });
}

/**
 * 查询全量角色列表
 */
export async function listRolesApi() {
  return requestClient.get<RoleVO[]>('/admin/sys/role/list');
}

/**
 * 新增角色
 */
export async function createRoleApi(data: RoleDTO) {
  return requestClient.post<RoleVO>('/admin/sys/role', data);
}

/**
 * 修改角色
 */
export async function updateRoleApi(id: number, data: RoleDTO) {
  return requestClient.put<RoleVO>(`/admin/sys/role/${id}`, data);
}

/**
 * 删除角色
 */
export async function deleteRoleApi(id: number) {
  return requestClient.delete(`/admin/sys/role/${id}`);
}
