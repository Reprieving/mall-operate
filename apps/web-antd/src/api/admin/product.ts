import type {
  BatchStatusDTO,
  BrandCreateDTO,
  BrandQueryDTO,
  BrandUpdateDTO,
  BrandVO,
  CategoryCreateDTO,
  CategoryTreeVO,
  CategoryUpdateDTO,
  CategoryVO,
  CommonPage,
  SkuItemDTO,
  SkuPriceUpdateDTO,
  SkuStockUpdateDTO,
  SkuUpdateDTO,
  SkuVO,
  SpecKeyCreateDTO,
  SpecKeyQueryDTO,
  SpecKeyUpdateDTO,
  SpecKeyVO,
  SpecValueCreateDTO,
  SpecValueUpdateDTO,
  SpecValueVO,
  SpuAdminQueryDTO,
  SpuBatchCategoryDTO,
  SpuBatchDeleteDTO,
  SpuCreateDTO,
  SpuDetailVO,
  SpuUpdateDTO,
  SpuVO,
  StockWarningVO,
} from './model';

import { requestClient } from '#/api/request';

// ---------------- SPU 运营统筹 ----------------
/**
 * 全平台跨店铺商品高级检索
 */
export async function pageAdminSpuApi(params: SpuAdminQueryDTO) {
  return requestClient.get<CommonPage<SpuVO>>('/admin/spu/page', {
    params,
  });
}

/**
 * 库存告急预警大盘
 */
export async function getStockWarningListApi(
  threshold: number = 10,
  limit: number = 50,
) {
  return requestClient.get<StockWarningVO[]>('/admin/spu/stock-warning', {
    params: { threshold, limit },
  });
}

/**
 * 批量变更商品类目
 */
export async function batchUpdateSpuCategoryApi(data: SpuBatchCategoryDTO) {
  return requestClient.put<number>('/admin/spu/batch/category', data);
}

/**
 * 批量删除违规商品
 */
export async function batchDeleteSpuApi(data: SpuBatchDeleteDTO) {
  return requestClient.delete<number>('/admin/spu/batch', {
    data,
  });
}

/**
 * 查询 SPU 完整详情
 */
export async function getSpuDetailApi(id: number) {
  return requestClient.get<SpuDetailVO>(`/spu/${id}`);
}

/**
 * 修改单个商品上下架状态 (1-上架, 0-下架)
 */
export async function updateSpuStatusApi(id: number, status: number) {
  return requestClient.put(`/spu/${id}/status`, undefined, {
    params: { status },
  });
}

/**
 * 批量修改商品上下架状态
 */
export async function batchUpdateSpuStatusApi(data: BatchStatusDTO) {
  return requestClient.put('/spu/batch/status', data);
}

/**
 * 删除商品 SPU
 */
export async function deleteSpuApi(id: number) {
  return requestClient.delete(`/spu/${id}`);
}

/**
 * 创建新 SPU 商品（含规格 specList 与初始 SKU 矩阵）
 */
export async function createSpuApi(data: SpuCreateDTO) {
  return requestClient.post<SpuDetailVO>('/spu', data);
}

/**
 * 修改 SPU 商品 (包含类目、品牌以及全量规格与SKU矩阵)
 */
export async function updateSpuApi(id: number, data: SpuUpdateDTO) {
  return requestClient.put<SpuDetailVO>(`/spu/${id}`, data);
}

// ---------------- SKU 调价与库存 ----------------
/**
 * 获取单个 SKU 详情
 */
export async function getSkuByIdApi(id: number) {
  return requestClient.get<SkuVO>(`/sku/${id}`);
}

/**
 * 获取指定 SPU 下的所有 SKU 列表
 */
export async function listSkuBySpuIdApi(spuId: number) {
  return requestClient.get<SkuVO[]>(`/sku/spu/${spuId}`);
}

/**
 * 为指定 SPU 新增单个 SKU 规格组合
 */
export async function createSkuApi(spuId: number, data: SkuItemDTO) {
  return requestClient.post<SkuVO>(`/sku/spu/${spuId}`, data);
}

/**
 * 修改单个 SKU 信息 (包含规格属性组合、售价、原价、成本价及库存)
 */
export async function updateSkuApi(id: number, data: SkuUpdateDTO) {
  return requestClient.put<SkuVO>(`/sku/${id}`, data);
}

/**
 * 删除单个 SKU 规格组合
 */
export async function deleteSkuApi(id: number) {
  return requestClient.delete(`/sku/${id}`);
}

/**
 * 单独调整 SKU 库存
 */
export async function updateSkuStockApi(id: number, data: SkuStockUpdateDTO) {
  return requestClient.put(`/sku/${id}/stock`, data);
}

/**
 * 单独调整 SKU 价格
 */
export async function updateSkuPriceApi(id: number, data: SkuPriceUpdateDTO) {
  return requestClient.put(`/sku/${id}/price`, data);
}

/**
 * 启用/禁用单个 SKU
 */
export async function updateSkuStatusApi(id: number, status: number) {
  return requestClient.put(`/sku/${id}/status`, undefined, {
    params: { status },
  });
}

// ---------------- 类目管理 ----------------
/**
 * 获取全量分类树状结构
 */
export async function getCategoryTreeApi() {
  return requestClient.get<CategoryTreeVO[]>('/category/tree');
}

/**
 * 平铺条件检索分类列表
 */
export async function getCategoryListApi(params?: {
  name?: string;
  parentId?: number;
  status?: number;
}) {
  return requestClient.get<CategoryVO[]>('/category/list', {
    params,
  });
}

/**
 * 获取分类详情
 */
export async function getCategoryByIdApi(id: number) {
  return requestClient.get<CategoryVO>(`/category/${id}`);
}

/**
 * 创建商品分类
 */
export async function createCategoryApi(data: CategoryCreateDTO) {
  return requestClient.post<CategoryVO>('/category', data);
}

/**
 * 修改商品分类
 */
export async function updateCategoryApi(id: number, data: CategoryUpdateDTO) {
  return requestClient.put<CategoryVO>(`/category/${id}`, data);
}

/**
 * 删除商品分类
 */
export async function deleteCategoryApi(id: number) {
  return requestClient.delete(`/category/${id}`);
}

/**
 * 启用/禁用分类 (1-启用, 0-禁用)
 */
export async function updateCategoryStatusApi(id: number, status: number) {
  return requestClient.put(`/category/${id}/status`, undefined, {
    params: { status },
  });
}

// ---------------- 品牌管理 ----------------
/**
 * 分页查询品牌列表
 */
export async function pageBrandsApi(params: BrandQueryDTO) {
  return requestClient.get<CommonPage<BrandVO>>('/brand/page', {
    params,
  });
}

/**
 * 获取全量可用品牌列表
 */
export async function listAllBrandsApi() {
  return requestClient.get<BrandVO[]>('/brand/list-all');
}

/**
 * 获取品牌详情
 */
export async function getBrandByIdApi(id: number) {
  return requestClient.get<BrandVO>(`/brand/${id}`);
}

/**
 * 创建商品品牌
 */
export async function createBrandApi(data: BrandCreateDTO) {
  return requestClient.post<BrandVO>('/brand', data);
}

/**
 * 修改商品品牌
 */
export async function updateBrandApi(id: number, data: BrandUpdateDTO) {
  return requestClient.put<BrandVO>(`/brand/${id}`, data);
}

/**
 * 删除商品品牌
 */
export async function deleteBrandApi(id: number) {
  return requestClient.delete(`/brand/${id}`);
}

/**
 * 启用/禁用品牌
 */
export async function updateBrandStatusApi(id: number, status: number) {
  return requestClient.put(`/brand/${id}/status`, undefined, {
    params: { status },
  });
}

// ---------------- 规格管理 ----------------
/**
 * 分页查询规格项列表
 */
export async function pageSpecKeysApi(params: SpecKeyQueryDTO) {
  return requestClient.get<CommonPage<SpecKeyVO>>('/spec/key/page', {
    params,
  });
}

/**
 * 按分类查询规格模板
 */
export async function listSpecsByCategoryApi(categoryId: number) {
  return requestClient.get<SpecKeyVO[]>(`/spec/category/${categoryId}`);
}

/**
 * 获取规格项详情
 */
export async function getSpecKeyByIdApi(id: number) {
  return requestClient.get<SpecKeyVO>(`/spec/key/${id}`);
}

/**
 * 创建规格项
 */
export async function createSpecKeyApi(data: SpecKeyCreateDTO) {
  return requestClient.post<SpecKeyVO>('/spec/key', data);
}

/**
 * 修改规格项
 */
export async function updateSpecKeyApi(id: number, data: SpecKeyUpdateDTO) {
  return requestClient.put<SpecKeyVO>(`/spec/key/${id}`, data);
}

/**
 * 删除规格项
 */
export async function deleteSpecKeyApi(id: number) {
  return requestClient.delete(`/spec/key/${id}`);
}

/**
 * 启用/禁用规格项
 */
export async function updateSpecKeyStatusApi(id: number, status: number) {
  return requestClient.put(`/spec/key/${id}/status`, undefined, {
    params: { status },
  });
}

/**
 * 新增单个规格值
 */
export async function createSpecValueApi(data: SpecValueCreateDTO) {
  return requestClient.post<SpecValueVO>('/spec/value', data);
}

/**
 * 批量新增规格值
 */
export async function batchCreateSpecValuesApi(data: {
  specKeyId: number;
  values: string[];
}) {
  return requestClient.post<SpecValueVO[]>('/spec/value/batch', data);
}

/**
 * 修改规格值
 */
export async function updateSpecValueApi(id: number, data: SpecValueUpdateDTO) {
  return requestClient.put<SpecValueVO>(`/spec/value/${id}`, data);
}

/**
 * 删除规格值
 */
export async function deleteSpecValueApi(id: number) {
  return requestClient.delete(`/spec/value/${id}`);
}
