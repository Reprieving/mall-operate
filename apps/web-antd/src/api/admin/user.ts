import type {
  AddressVO,
  AdminUserDetailVO,
  AdminUserQueryDTO,
  CertAuditDTO,
  CertBatchAuditDTO,
  CertQueryDTO,
  CommonPage,
  UserCertVO,
  UserVO,
} from './model';

import { requestClient } from '#/api/request';

/**
 * 运营端分页检索买家
 */
export async function pageUsersApi(params: AdminUserQueryDTO) {
  return requestClient.get<CommonPage<UserVO>>('/admin/user/page', {
    params,
  });
}

/**
 * 获取买家全景画像档案
 */
export async function getUserDetailApi(id: number) {
  return requestClient.get<AdminUserDetailVO>(`/admin/user/${id}/detail`);
}

/**
 * 封禁/解封买家账号 (1: 正常, 0: 冻结)
 */
export async function updateUserStatusApi(id: number, status: number) {
  return requestClient.put(`/admin/user/${id}/status`, undefined, {
    params: { status },
  });
}

/**
 * 重置买家登录密码
 */
export async function resetUserPasswordApi(id: number, password: string) {
  return requestClient.put(`/admin/user/${id}/reset-pwd`, undefined, {
    params: { password },
  });
}

/**
 * 查询指定买家收货地址
 */
export async function getUserAddressesApi(id: number) {
  return requestClient.get<AddressVO[]>(`/admin/user/${id}/addresses`);
}

/**
 * 多条件分页查询主体实名认证审核列表
 */
export async function pageCertificationsApi(params: CertQueryDTO) {
  return requestClient.get<CommonPage<UserCertVO>>('/user/cert/page', {
    params,
  });
}

/**
 * 按用户ID查询认证信息
 */
export async function getCertByUserIdApi(userId: number) {
  return requestClient.get<UserCertVO>(`/user/cert/${userId}`);
}

/**
 * 审批主体实名认证申请 (1: 通过, 2: 驳回)
 */
export async function auditCertificationApi(data: CertAuditDTO) {
  return requestClient.post<UserCertVO>('/user/cert/audit', data);
}

/**
 * 运营批量审核实名认证申请
 */
export async function batchAuditCertificationsApi(data: CertBatchAuditDTO) {
  return requestClient.post<number>('/admin/cert/batch-audit', data);
}
