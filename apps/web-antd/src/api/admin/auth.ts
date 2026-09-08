import type { AdminInfoVO, AdminLoginDTO, AdminLoginVO } from './model';

import { requestClient } from '#/api/request';

/**
 * 运营管理员登录
 */
export async function adminLoginApi(data: AdminLoginDTO) {
  return requestClient.post<AdminLoginVO>('/admin/auth/login', data);
}

/**
 * 获取当前管理员信息与权限清单
 */
export async function getAdminInfoApi() {
  return requestClient.get<AdminInfoVO>('/admin/auth/info');
}

/**
 * 运营管理员退出登录
 */
export async function adminLogoutApi() {
  return requestClient.post('/admin/auth/logout');
}
