import type {
  CommonPage,
  ShopAdminFullDetailVO,
  ShopAuditDTO,
  ShopBatchStatusDTO,
  ShopDetailVO,
  ShopQueryDTO,
  ShopVO,
} from './model';

import { requestClient } from '#/api/request';

/**
 * 运营端分页检索店铺
 */
export async function pageAdminShopsApi(params: ShopQueryDTO) {
  return requestClient.get<CommonPage<ShopVO>>('/api/shop/admin/page', {
    params,
  });
}

/**
 * 查询店铺资质审核详情
 */
export async function getAdminShopDetailApi(id: number) {
  return requestClient.get<ShopDetailVO>(`/api/shop/admin/${id}`);
}

/**
 * 查询店铺全景详情画像 (聚合店铺、实名认证主体、店主买家、商品总数)
 */
export async function getShopFullDetailApi(id: number) {
  return requestClient.get<ShopAdminFullDetailVO>(
    `/admin/shop/${id}/full-detail`,
  );
}

/**
 * 审批开店申请 (1-通过, 2-驳回)
 */
export async function auditShopApi(data: ShopAuditDTO) {
  return requestClient.post<ShopDetailVO>('/api/shop/admin/audit', data);
}

/**
 * 管控店铺状态 (1-正常, 3-封禁)
 */
export async function updateAdminShopStatusApi(id: number, status: number) {
  return requestClient.put(`/api/shop/admin/${id}/status`, undefined, {
    params: { status },
  });
}

/**
 * 人工修正店铺评分 (1.00 ~ 5.00)
 */
export async function updateShopScoreApi(id: number, score: number) {
  return requestClient.put(`/admin/shop/${id}/score`, undefined, {
    params: { score },
  });
}

/**
 * 批量管控店铺状态
 */
export async function batchUpdateShopStatusApi(data: ShopBatchStatusDTO) {
  return requestClient.put<number>('/admin/shop/batch-status', data);
}
