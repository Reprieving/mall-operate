import type {
  CategoryRatioVO,
  DashboardOverviewVO,
  DashboardTodosVO,
  DashboardTrendVO,
  TopProductVO,
} from './model';

import { requestClient } from '#/api/request';

/**
 * 获取今日核心大盘指标概览
 */
export async function getOverviewApi() {
  return requestClient.get<DashboardOverviewVO>('/admin/dashboard/overview');
}

/**
 * 获取运营待办事项角标数量
 */
export async function getTodosApi() {
  return requestClient.get<DashboardTodosVO>('/admin/dashboard/todos');
}

/**
 * 获取销售走势与订单量趋势图表数据
 */
export async function getTrendApi(days: number = 7) {
  return requestClient.get<DashboardTrendVO>('/admin/dashboard/trend', {
    params: { days },
  });
}

/**
 * 获取热销商品 Top 榜单
 */
export async function getTopProductsApi(limit: number = 10) {
  return requestClient.get<TopProductVO[]>('/admin/dashboard/top-products', {
    params: { limit },
  });
}

/**
 * 获取各品类销售占比
 */
export async function getCategoryRatioApi() {
  return requestClient.get<CategoryRatioVO[]>(
    '/admin/dashboard/category-ratio',
  );
}
