import type {
  CommonPage,
  OrderAdminDetailVO,
  OrderAdminQueryDTO,
  OrderAdminRemarkDTO,
  OrderCancelDTO,
  OrderDeliveryDTO,
  OrderLogVO,
  OrderReceiverUpdateDTO,
  OrderRefundApplyDTO,
  OrderRefundAuditDTO,
  OrderRefundQueryDTO,
  OrderRefundVO,
  OrderVO,
} from './model';

import { requestClient } from '#/api/request';

/**
 * 全平台跨店铺订单高级检索
 */
export async function pageAdminOrdersApi(params: OrderAdminQueryDTO) {
  return requestClient.get<CommonPage<OrderVO>>('/admin/order/page', {
    params,
  });
}

/**
 * 查询全量订单详情 (含订单基础信息、买家画像、商户信息、商品快照、时间线)
 */
export async function getAdminOrderDetailApi(id: number) {
  return requestClient.get<OrderAdminDetailVO>(`/admin/order/${id}/detail`);
}

/**
 * 查询订单流转时间轴日志
 */
export async function getOrderLogsApi(id: number) {
  return requestClient.get<OrderLogVO[]>(`/admin/order/${id}/logs`);
}

/**
 * 运营订单插旗与添加备注 (adminFlag: 1-红, 2-黄, 3-绿, 4-蓝, 5-紫, 0-无)
 */
export async function updateOrderRemarkApi(
  id: number,
  data: OrderAdminRemarkDTO,
) {
  return requestClient.put(`/admin/order/${id}/remark`, data);
}

/**
 * 订单发货录入物流
 */
export async function deliveryOrderApi(id: number, data: OrderDeliveryDTO) {
  return requestClient.post<OrderVO>(`/api/order/admin/${id}/delivery`, data);
}

/**
 * 修改收货人信息
 */
export async function updateReceiverInfoApi(
  id: number,
  data: OrderReceiverUpdateDTO,
) {
  return requestClient.put<OrderVO>(`/api/order/admin/${id}/receiver`, data);
}

/**
 * 后台关闭/售后退款订单
 */
export async function closeOrderApi(id: number, reason?: string) {
  return requestClient.post<OrderVO>(
    `/api/order/admin/${id}/close`,
    undefined,
    {
      params: { reason },
    },
  );
}

/**
 * 后台强制取消订单
 */
export async function adminCancelOrderApi(id: number, data: OrderCancelDTO) {
  return requestClient.post<OrderVO>(`/api/order/admin/${id}/cancel`, data);
}

/**
 * 全平台退款申请分页检索
 */
export async function pageRefundsApi(params: OrderRefundQueryDTO) {
  return requestClient.get<CommonPage<OrderRefundVO>>(
    '/admin/order/refund/page',
    {
      params,
    },
  );
}

/**
 * 查询指定订单的退款记录
 */
export async function getAdminOrderRefundApi(orderId: number) {
  return requestClient.get<OrderRefundVO>(`/admin/order/${orderId}/refund`);
}

/**
 * 审批订单退款申请 (根据退款记录 ID)
 */
export async function auditRefundApi(
  refundId: number,
  data: OrderRefundAuditDTO,
) {
  return requestClient.post<OrderRefundVO>(
    `/admin/order/refund/${refundId}/audit`,
    data,
  );
}

/**
 * 根据订单 ID 审批退款申请
 */
export async function auditRefundByOrderIdApi(
  orderId: number,
  data: OrderRefundAuditDTO,
) {
  return requestClient.post<OrderRefundVO>(
    `/admin/order/${orderId}/refund/audit`,
    data,
  );
}

/**
 * 申请订单退款 (买家端接口)
 */
export async function applyRefundApi(
  orderId: number,
  data: OrderRefundApplyDTO,
) {
  return requestClient.post<OrderRefundVO>(
    `/api/order/${orderId}/refund`,
    data,
  );
}

/**
 * 查询退款记录 (买家端接口)
 */
export async function getOrderRefundApi(orderId: number) {
  return requestClient.get<OrderRefundVO>(`/api/order/${orderId}/refund`);
}
