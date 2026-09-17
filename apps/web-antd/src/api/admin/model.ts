/**
 * 商城运营端核心数据模型定义 (严格对照 OpenAPI 规范)
 */

export interface CommonPage<T> {
  pageNum: number;
  pageSize: number;
  total: number;
  totalPages: number;
  list: T[];
}

export interface CommonResult<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// --------------------------- 1. 认证与管理员 ---------------------------
export interface AdminLoginDTO {
  username: string;
  password?: string;
}

export interface AdminLoginVO {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  roleName: string;
  roleCode: string;
  token: string;
  tokenPrefix: string;
  expiresIn: number;
  permissions: string[];
}

export interface AdminInfoVO {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  phone: string;
  roleId: number;
  roleName: string;
  roleCode: string;
  permissions: string[];
}

export interface AdminUserVO {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  roleId: number;
  roleName?: string;
  roleCode?: string;
  status: number;
  createTime?: string;
  updateTime?: string;
}

export interface AdminUserCreateDTO {
  username: string;
  password?: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  roleId: number;
  status?: number;
}

export interface AdminUserUpdateDTO {
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  roleId: number;
  status?: number;
}

export interface RoleVO {
  id: number;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  status: number;
  createTime?: string;
  updateTime?: string;
}

export interface RoleDTO {
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  status?: number;
}

// --------------------------- 2. 运营数据大盘 ---------------------------
export interface DashboardOverviewVO {
  todayGmv: number;
  todayPayAmount: number;
  todayOrderCount: number;
  todayNewUsers: number;
  todayAov: number;
  totalUsers: number;
  totalShops: number;
  totalProducts: number;
  totalOrders: number;
  totalGmv: number;
}

export interface DashboardTodosVO {
  pendingCertCount: number;
  pendingShopCount: number;
  pendingDeliverCount: number;
  lowStockProductCount: number;
}

export interface DashboardTrendVO {
  dates: string[];
  gmvList: number[];
  orderCountList: number[];
}

export interface TopProductVO {
  spuId: number;
  spuName: string;
  spuPic: string;
  salesCount: number;
  salesAmount: number;
}

export interface CategoryRatioVO {
  categoryId: number;
  categoryName: string;
  salesAmount: number;
  ratio: number;
}

// --------------------------- 3. 买家用户与实名认证 ---------------------------
export interface UserVO {
  id: number;
  email: string;
  username: string;
  nickname: string;
  avatar: string;
  phone: string;
  gender: number;
  bio: string;
  status: number;
  certStatus: number;
  realName: string;
  createTime: string;
  updateTime: string;
}

export interface AdminUserQueryDTO {
  keyword?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface AddressVO {
  id: number;
  userId: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  fullAddress: string;
  postalCode?: string;
  isDefault: number;
  tag?: string;
  createTime?: string;
  updateTime?: string;
}

export interface UserCertVO {
  id: number;
  userId: number;
  certType: number;
  certTypeName: string;
  realName: string;
  idCard: string;
  idCardFrontPic: string;
  idCardBackPic: string;
  companyName?: string;
  businessLicenseNo?: string;
  businessLicensePic?: string;
  companyAddress?: string;
  status: number;
  statusName: string;
  auditRemark?: string;
  auditTime?: string;
  createTime: string;
}

export interface CertQueryDTO {
  certType?: number;
  status?: number;
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface CertAuditDTO {
  id: number;
  status: number;
  auditRemark?: string;
}

export interface CertBatchAuditDTO {
  ids: number[];
  status: number;
  auditRemark?: string;
}

export interface AdminUserDetailVO {
  profile: UserVO;
  orderCount: number;
  totalSpent: number;
  certification?: UserCertVO;
  shop?: ShopVO;
  addresses?: AddressVO[];
}

// --------------------------- 4. 商品统筹与类目规格 ---------------------------
export interface SpuVO {
  id: number;
  shopId: number;
  shopName: string;
  name: string;
  spuCode: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  title: string;
  description: string;
  mainPic: string;
  sliderPics: string;
  specType: number;
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  unit: string;
  status: number;
  sort: number;
  createTime: string;
  updateTime: string;
}

export interface SpuAdminQueryDTO {
  keyword?: string;
  spuCode?: string;
  shopId?: number;
  categoryId?: number;
  brandId?: number;
  status?: number;
  lowStock?: boolean;
  lowStockThreshold?: number;
  pageNum?: number;
  pageSize?: number;
}

export interface SkuSpecValueVO {
  specKeyId: number;
  specKeyName: string;
  specValueId: number;
  specValue: string;
}

export interface SkuVO {
  id: number;
  spuId: number;
  skuCode: string;
  name: string;
  pic: string;
  price: number;
  originalPrice: number;
  costPrice: number;
  stock: number;
  lockStock: number;
  weight?: number;
  volume?: number;
  specData?: string;
  status: number;
  createTime?: string;
  updateTime?: string;
  specValues?: SkuSpecValueVO[];
}

export interface SpecValueVO {
  id: number;
  specKeyId: number;
  value: string;
  sort: number;
  status: number;
  createTime?: string;
  updateTime?: string;
}

export interface SpuSpecVO {
  specKeyId: number;
  specName: string;
  values: SpecValueVO[];
}

export interface SpuDetailVO {
  spuInfo: SpuVO;
  shop?: ShopVO;
  category?: CategoryVO;
  brand?: BrandVO;
  specList: SpuSpecVO[];
  skuList: SkuVO[];
}

export interface StockWarningVO {
  spuId: number;
  spuName: string;
  spuCode: string;
  spuPic: string;
  shopId: number;
  shopName: string;
  categoryId: number;
  categoryName: string;
  totalStock: number;
  minPrice: number;
  maxPrice: number;
  status: number;
}

export interface SpuBatchCategoryDTO {
  ids: number[];
  targetCategoryId: number;
}

export interface SpuBatchDeleteDTO {
  ids: number[];
}

export interface BatchStatusDTO {
  ids: number[];
  status: number;
}

export interface SkuStockUpdateDTO {
  stock: number;
}

export interface SkuPriceUpdateDTO {
  price: number;
  originalPrice?: number;
  costPrice?: number;
}

export interface SkuSpecValueItemDTO {
  specKeyId: number;
  specKeyName?: string;
  specValueId: number;
  specValue?: string;
}

export interface SkuItemDTO {
  id?: number;
  skuCode: string;
  name: string;
  pic?: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  stock: number;
  weight?: number;
  volume?: number;
  specValues?: SkuSpecValueItemDTO[];
  specData?: string;
  status?: number;
}

export interface SkuUpdateDTO {
  skuCode: string;
  name: string;
  pic?: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  stock: number;
  weight?: number;
  volume?: number;
  specValues?: SkuSpecValueItemDTO[];
  specData?: string;
  status?: number;
}

export interface SpuSpecItemDTO {
  specKeyId?: number;
  specName: string;
  specValueIds?: number[];
  specValues?: string[];
}

export interface SpuUpdateDTO {
  shopId?: number;
  name: string;
  spuCode?: string;
  categoryId: number;
  brandId?: number;
  title?: string;
  description?: string;
  mainPic?: string;
  sliderPics?: string;
  specType?: number;
  unit?: string;
  sort?: number;
  status?: number;
  specList?: SpuSpecItemDTO[];
  skuList: SkuItemDTO[];
}

/** 新增 SPU（与 UpdateDTO 字段对齐，shopId 必填） */
export interface SpuCreateDTO {
  shopId: number;
  name: string;
  spuCode?: string;
  categoryId: number;
  brandId?: number;
  title?: string;
  description?: string;
  mainPic?: string;
  sliderPics?: string;
  specType?: number;
  unit?: string;
  sort?: number;
  status?: number;
  specList?: SpuSpecItemDTO[];
  skuList: SkuItemDTO[];
}

export interface CategoryVO {
  id: number;
  parentId: number;
  name: string;
  level: number;
  icon?: string;
  sort: number;
  status: number;
  createTime?: string;
  updateTime?: string;
}

export interface CategoryTreeVO extends CategoryVO {
  children?: CategoryTreeVO[];
}

export interface CategoryCreateDTO {
  parentId: number;
  name: string;
  level?: number;
  icon?: string;
  sort?: number;
  status?: number;
}

export interface CategoryUpdateDTO {
  parentId: number;
  name: string;
  level?: number;
  icon?: string;
  sort?: number;
  status?: number;
}

export interface BrandVO {
  id: number;
  name: string;
  logo: string;
  description: string;
  firstLetter: string;
  sort: number;
  status: number;
  createTime?: string;
  updateTime?: string;
}

export interface BrandQueryDTO {
  name?: string;
  firstLetter?: string;
  status?: number;
  pageNum?: number;
  pageSize?: number;
}

export interface BrandCreateDTO {
  name: string;
  logo?: string;
  description?: string;
  firstLetter?: string;
  sort?: number;
  status?: number;
}

export interface BrandUpdateDTO {
  name: string;
  logo?: string;
  description?: string;
  firstLetter?: string;
  sort?: number;
  status?: number;
}

export interface SpecKeyVO {
  id: number;
  categoryId: number;
  categoryName?: string;
  name: string;
  sort: number;
  status: number;
  createTime?: string;
  updateTime?: string;
  values?: SpecValueVO[];
}

export interface SpecKeyQueryDTO {
  categoryId?: number;
  name?: string;
  status?: number;
  pageNum?: number;
  pageSize?: number;
}

export interface SpecKeyCreateDTO {
  categoryId: number;
  name: string;
  sort?: number;
  status?: number;
  initialValues?: string[];
}

export interface SpecKeyUpdateDTO {
  categoryId?: number;
  name: string;
  sort?: number;
  status?: number;
}

export interface SpecValueCreateDTO {
  specKeyId: number;
  value: string;
  sort?: number;
  status?: number;
}

export interface SpecValueUpdateDTO {
  value: string;
  sort?: number;
  status?: number;
}

// --------------------------- 5. 订单流转调度 ---------------------------
export interface OrderVO {
  id: number;
  userId: number;
  orderSn: string;
  totalAmount: number;
  freightAmount: number;
  payAmount: number;
  payType: number;
  status: number;
  receiverName: string;
  receiverPhone: string;
  receiverProvince: string;
  receiverCity: string;
  receiverDistrict: string;
  receiverDetailAddress: string;
  note?: string;
  deliveryCompany?: string;
  deliverySn?: string;
  tradeNo?: string;
  paymentTime?: string;
  deliveryTime?: string;
  receiveTime?: string;
  cancelTime?: string;
  cancelReason?: string;
  adminRemark?: string;
  adminFlag?: number;
  createTime: string;
  totalQuantity?: number;
  mainPic?: string;
}

export interface OrderItemVO {
  id: number;
  orderId: number;
  orderSn: string;
  spuId: number;
  spuName: string;
  spuPic: string;
  skuId: number;
  skuCode: string;
  skuName: string;
  skuPic: string;
  skuPrice: number;
  quantity: number;
  subtotalAmount: number;
  specData?: string;
  createTime?: string;
}

export interface OrderLogVO {
  time: string;
  action: string;
  operator: string;
  detail: string;
}

export interface OrderAdminDetailVO {
  orderInfo: OrderVO;
  items: OrderItemVO[];
  buyer?: UserVO;
  shop?: ShopVO;
  timeline: OrderLogVO[];
  refundInfo?: OrderRefundVO;
}

export interface OrderAdminQueryDTO {
  orderSn?: string;
  receiverName?: string;
  receiverPhone?: string;
  deliverySn?: string;
  status?: number;
  payType?: number;
  adminFlag?: number;
  startTime?: string;
  endTime?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface OrderAdminRemarkDTO {
  adminFlag?: number; // 1-红, 2-黄, 3-绿, 4-蓝, 5-紫, 0-无
  adminRemark?: string;
}

export interface OrderDeliveryDTO {
  deliveryCompany: string;
  deliverySn: string;
}

export interface OrderReceiverUpdateDTO {
  receiverName: string;
  receiverPhone: string;
  receiverProvince: string;
  receiverCity: string;
  receiverDistrict: string;
  receiverDetailAddress: string;
}

export interface OrderCancelDTO {
  cancelReason?: string;
}

export interface OrderRefundVO {
  id?: number;
  refundSn?: string;
  orderId?: number;
  orderSn?: string;
  shopId?: number;
  shopName?: string;
  userId?: number;
  refundType?: number; // 1-仅退款, 2-退货退款
  refundTypeDesc?: string;
  refundAmount?: number;
  reason?: string;
  description?: string;
  proofPics?: string;
  status?: number; // 0-待审核, 1-审核通过/退款成功, 2-已驳回
  statusDesc?: string;
  auditTime?: string;
  auditUserId?: number;
  auditUserName?: string;
  auditRemark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface OrderRefundAuditDTO {
  status: number; // 1-同意退款, 2-驳回退款
  auditRemark?: string;
}

export interface OrderRefundApplyDTO {
  refundType: number;
  refundAmount: number;
  reason: string;
  description?: string;
  proofPics?: string;
}

export interface OrderRefundQueryDTO {
  pageNum?: number;
  pageSize?: number;
  orderId?: number;
  orderSn?: string;
  refundSn?: string;
  status?: number;
  shopId?: number;
  userId?: number;
}

// --------------------------- 6. 店铺与商户监管 ---------------------------
export interface ShopVO {
  id: number;
  userId: number;
  certId: number;
  name: string;
  logo: string;
  banner: string;
  intro: string;
  notice: string;
  phone: string;
  type: number;
  typeName: string;
  status: number;
  statusName: string;
  rejectReason?: string;
  score: number;
  createTime: string;
  updateTime: string;
}

export interface ShopQueryDTO {
  name?: string;
  type?: number;
  status?: number;
  phone?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface ShopDetailVO {
  shopInfo: ShopVO;
  certInfo?: UserCertVO;
}

export interface ShopAdminFullDetailVO {
  shop: ShopVO;
  certification?: UserCertVO;
  owner?: UserVO;
  productCount: number;
}

export interface ShopAuditDTO {
  id: number;
  status: number; // 1-通过, 2-驳回
  rejectReason?: string;
}

export interface ShopBatchStatusDTO {
  ids: number[];
  status: number; // 1-正常营业, 3-关店封禁
}
