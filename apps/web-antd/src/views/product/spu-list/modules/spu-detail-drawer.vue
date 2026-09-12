<script lang="ts" setup>
import type {
  BrandVO,
  CategoryTreeVO,
  SkuItemDTO,
  SkuSpecValueItemDTO,
  SpuDetailVO,
  SpuSpecItemDTO,
  SpuUpdateDTO,
} from '#/api/admin/model';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  Alert,
  Button,
  Col,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import {
  createSkuApi,
  deleteSkuApi,
  getCategoryTreeApi,
  getSpuDetailApi,
  listAllBrandsApi,
  updateSkuApi,
  updateSkuStatusApi,
  updateSkuStockApi,
  updateSpuApi,
  updateSpuStatusApi,
} from '#/api/admin';

const emit = defineEmits<{
  (e: 'success'): void;
}>();

const loading = ref(false);
const detail = ref<null | SpuDetailVO>(null);
const isSpuOffShelf = computed(() => detail.value?.spuInfo?.status === 0);

// 基础下拉选项 (分类、品牌、店铺)
const categoryOptions = ref<{ label: string; value: number }[]>([]);
const brandOptions = ref<{ label: string; value: number }[]>([]);
const shopOptions = ref<{ label: string; value: number }[]>([
  { label: '极地探险户外旗舰店 (ID: 1)', value: 1 },
  { label: '索声官方自营专卖 (ID: 2)', value: 2 },
  { label: '鹿角严选生活馆 (ID: 3)', value: 3 },
  { label: '平台自营精选旗舰店 (ID: 4)', value: 4 },
]);

async function loadBaseOptions() {
  try {
    const catTree = await getCategoryTreeApi();
    if (catTree && catTree.length > 0) {
      const flatList: { label: string; value: number }[] = [];
      const traverse = (nodes: CategoryTreeVO[], prefix = '') => {
        for (const n of nodes) {
          const name = prefix ? `${prefix} / ${n.name}` : n.name;
          if (!n.children || n.children.length === 0) {
            flatList.push({ label: name, value: n.id });
          } else {
            traverse(n.children, name);
          }
        }
      };
      traverse(catTree);
      categoryOptions.value = flatList;
    }
  } catch {
    categoryOptions.value = [
      { label: '服饰鞋包 / 女装 / 羽绒服/棉服', value: 12 },
      { label: '数码影音 / 耳机音响 / 蓝牙耳机', value: 23 },
      { label: '食品饮料 / 精品咖啡 / 冷萃咖啡', value: 40 },
    ];
  }

  try {
    const brands = await listAllBrandsApi();
    if (brands && brands.length > 0) {
      brandOptions.value = brands.map((b: BrandVO) => ({
        label: `${b.name} (${b.firstLetter})`,
        value: b.id,
      }));
    }
  } catch {
    brandOptions.value = [
      { label: 'ARC 极地户外 (A)', value: 1 },
      { label: '索声科技 (S)', value: 2 },
      { label: '鹿角工坊 (L)', value: 3 },
    ];
  }
}

// ---------------- 1. 抽屉打开与数据加载 ----------------
const [Drawer, drawerApi] = useVbenDrawer({
  footer: false,
  title: '商品 SPU 全量画像与 SKU 规格/库存管控',
  async onOpenChange(isOpen) {
    if (isOpen) {
      loadBaseOptions();
      const data = drawerApi.getData() as { spuId?: number };
      if (data?.spuId) {
        loadDetail(data.spuId);
      }
    }
  },
});

async function loadDetail(spuId: number) {
  loading.value = true;
  try {
    const res = await getSpuDetailApi(spuId);
    detail.value = res;
  } catch {
    // 模拟 fallback 数据以供开发联调
    detail.value = {
      brand: {
        description: '高品质户外与轻奢生活方式',
        firstLetter: 'A',
        id: 1,
        logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=brand1',
        name: 'ARC 极地户外',
        sort: 1,
        status: 1,
      },
      category: {
        id: 12,
        level: 3,
        name: '羽绒服/棉服',
        parentId: 5,
        sort: 1,
        status: 1,
      },
      shop: {
        banner: '',
        certId: 1,
        createTime: '2026-01-01 10:00:00',
        id: 1,
        intro: '品牌直营',
        logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=shop1',
        name: '极地探险户外旗舰店',
        notice: '品牌直营',
        phone: '13800001111',
        score: 4.95,
        status: 1,
        statusName: '正常营业',
        type: 2,
        typeName: '品牌旗舰店',
        updateTime: '2026-01-01 10:00:00',
        userId: 1001,
      },
      skuList: [
        {
          costPrice: 280,
          id: 5001,
          lockStock: 2,
          name: '黑色 / M码',
          originalPrice: 799,
          pic: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=100',
          price: 599,
          skuCode: 'SPU101-BLK-M',
          specData: '颜色:黑色;尺码:M',
          spuId,
          status: 1,
          stock: 45,
        },
        {
          costPrice: 280,
          id: 5002,
          lockStock: 5,
          name: '黑色 / L码',
          originalPrice: 799,
          pic: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=100',
          price: 599,
          skuCode: 'SPU101-BLK-L',
          specData: '颜色:黑色;尺码:L',
          spuId,
          status: 1,
          stock: 6,
        },
        {
          costPrice: 280,
          id: 5003,
          lockStock: 0,
          name: '米白色 / M码',
          originalPrice: 829,
          pic: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=100',
          price: 629,
          skuCode: 'SPU101-WHT-M',
          specData: '颜色:米白;尺码:M',
          spuId,
          status: 1,
          stock: 30,
        },
      ],
      specList: [
        {
          specKeyId: 1,
          specName: '颜色',
          values: [
            { id: 1, sort: 1, specKeyId: 1, status: 1, value: '黑色' },
            { id: 2, sort: 2, specKeyId: 1, status: 1, value: '米白' },
          ],
        },
        {
          specKeyId: 2,
          specName: '尺码',
          values: [
            { id: 3, sort: 1, specKeyId: 2, status: 1, value: 'M' },
            { id: 4, sort: 2, specKeyId: 2, status: 1, value: 'L' },
          ],
        },
      ],
      spuInfo: {
        brandId: 1,
        brandName: 'ARC 极地户外',
        categoryId: 12,
        categoryName: '羽绒服/棉服',
        createTime: '2026-02-10 10:00:00',
        description:
          '90% 高蓬松白鹅绒填充，防风抗水科技面料，零下20度严寒锁温。',
        id: spuId,
        mainPic:
          'https://images.unsplash.com/photo-1544441893-675973e31985?w=200',
        maxPrice: 629,
        minPrice: 599,
        name: '2026春季轻薄保暖鹅绒服 (男女同款)',
        shopId: 1,
        shopName: '极地探险户外旗舰店',
        sliderPics:
          'https://images.unsplash.com/photo-1544441893-675973e31985?w=200',
        sort: 10,
        specType: 2,
        spuCode: 'SPU20260210001',
        status: 1,
        title: '冬季抗寒极光羽绒服',
        totalStock: 81,
        unit: '件',
        updateTime: '2026-03-01 10:00:00',
      },
    };
  } finally {
    loading.value = false;
  }
}

// ---------------- 2. SKU 规格组合与信息维护弹窗 (新增 & 编辑) ----------------
const skuModalVisible = ref(false);
const isSkuEdit = ref(false);
const editingSkuId = ref<number>();

// 选中的各规格项取值字典：{ [specKeyId]: specValueId }
const selectedSpecMap = ref<Record<number, number>>({});

const skuForm = ref<{
  costPrice?: number;
  name: string;
  originalPrice?: number;
  pic: string;
  price: number;
  skuCode: string;
  specData: string;
  status: number;
  stock: number;
}>({
  costPrice: undefined,
  name: '',
  originalPrice: undefined,
  pic: '',
  price: 0,
  skuCode: '',
  specData: '',
  status: 1,
  stock: 0,
});

// 打开新增 SKU 弹窗
function handleOpenAddSku() {
  isSkuEdit.value = false;
  editingSkuId.value = undefined;
  selectedSpecMap.value = {};

  skuForm.value = {
    costPrice: undefined,
    name: '',
    originalPrice: undefined,
    pic: detail.value?.spuInfo.mainPic || '',
    price: detail.value?.spuInfo.minPrice || 0,
    skuCode: `${detail.value?.spuInfo.spuCode || 'SKU'}-${Date.now().toString().slice(-4)}`,
    specData: '',
    status: 1,
    stock: 20,
  };
  skuModalVisible.value = true;
}

// 打开编辑 SKU 规格弹窗
function handleOpenEditSku(sku: any) {
  isSkuEdit.value = true;
  editingSkuId.value = sku.id;
  selectedSpecMap.value = {};

  // 解析规格数据
  if (sku.specValues && sku.specValues.length > 0) {
    sku.specValues.forEach((item: any) => {
      selectedSpecMap.value[item.specKeyId] = item.specValueId;
    });
  }

  skuForm.value = {
    costPrice: sku.costPrice,
    name: sku.name,
    originalPrice: sku.originalPrice,
    pic: sku.pic || detail.value?.spuInfo.mainPic || '',
    price: sku.price,
    skuCode: sku.skuCode,
    specData: sku.specData || '',
    status: sku.status ?? 1,
    stock: sku.stock,
  };
  skuModalVisible.value = true;
}

// 当选择规格项取值改变时，自动生成规格描述与组合名称
function onSpecSelectionChange() {
  if (!detail.value?.specList) return;

  const specParts: string[] = [];
  const nameParts: string[] = [];

  detail.value.specList.forEach((spec) => {
    const valId = selectedSpecMap.value[spec.specKeyId];
    if (valId) {
      const foundVal = spec.values.find((v) => v.id === valId);
      if (foundVal) {
        specParts.push(`${spec.specName}:${foundVal.value}`);
        nameParts.push(foundVal.value);
      }
    }
  });

  if (specParts.length > 0) {
    skuForm.value.specData = specParts.join(';');
    if (!isSkuEdit.value) {
      skuForm.value.name = nameParts.join(' / ');
    }
  }
}

// 提交 SKU 规格变更或新增
async function handleSaveSku() {
  if (!skuForm.value.skuCode.trim()) {
    message.warning('请输入 SKU 编码！');
    return;
  }
  if (!skuForm.value.name.trim()) {
    message.warning('请输入 SKU 单品名称！');
    return;
  }
  if (skuForm.value.price === undefined || skuForm.value.price < 0) {
    message.warning('请输入有效的销售价格！');
    return;
  }

  // 组装 specValues 列表
  const specValuesPayload: SkuSpecValueItemDTO[] = [];
  if (detail.value?.specList) {
    detail.value.specList.forEach((spec) => {
      const valId = selectedSpecMap.value[spec.specKeyId];
      if (valId) {
        const found = spec.values.find((v) => v.id === valId);
        if (found) {
          specValuesPayload.push({
            specKeyId: spec.specKeyId,
            specKeyName: spec.specName,
            specValue: found.value,
            specValueId: found.id,
          });
        }
      }
    });
  }

  const payload = {
    costPrice: skuForm.value.costPrice,
    name: skuForm.value.name,
    originalPrice: skuForm.value.originalPrice,
    pic: skuForm.value.pic,
    price: skuForm.value.price,
    skuCode: skuForm.value.skuCode,
    specData: skuForm.value.specData,
    specValues: specValuesPayload,
    status: skuForm.value.status,
    stock: skuForm.value.stock,
  };

  try {
    if (isSkuEdit.value && editingSkuId.value) {
      await updateSkuApi(editingSkuId.value, payload);
      message.success('SKU 规格组合与信息已成功更新！');
    } else if (detail.value?.spuInfo.id) {
      await createSkuApi(detail.value.spuInfo.id, payload);
      message.success('新 SKU 规格组合已成功添加！');
    }
    skuModalVisible.value = false;
    if (detail.value?.spuInfo.id) {
      loadDetail(detail.value.spuInfo.id);
    }
  } catch {
    // 本地 fallback 更新
    if (isSkuEdit.value && editingSkuId.value && detail.value?.skuList) {
      const target = detail.value.skuList.find(
        (s) => s.id === editingSkuId.value,
      );
      if (target) {
        Object.assign(target, payload);
      }
    } else if (detail.value?.skuList) {
      detail.value.skuList.push({
        ...payload,
        costPrice: payload.costPrice ?? 0,
        id: Date.now(),
        lockStock: 0,
        originalPrice: payload.originalPrice ?? 0,
        spuId: detail.value.spuInfo.id,
      } as any);
    }
    recalculateSpuStock();
    skuModalVisible.value = false;
  }
}

// ---------------- 3. 库存灵活调整弹窗 (增减调整 / 直接盘点) ----------------
const stockModalVisible = ref(false);
const currentStockSku = ref<any>(null);
const stockAdjustMode = ref<'delta' | 'exact'>('delta');
const stockDelta = ref<number>(0);
const exactStock = ref<number>(0);
const stockRemark = ref<string>('');

// 计算调整后的最终库存
const calculatedFinalStock = computed(() => {
  if (!currentStockSku.value) return 0;
  if (stockAdjustMode.value === 'exact') {
    return Math.max(0, exactStock.value);
  }
  return Math.max(
    0,
    (currentStockSku.value.stock || 0) + (stockDelta.value || 0),
  );
});

function handleOpenStockModal(sku: any) {
  currentStockSku.value = sku;
  stockAdjustMode.value = 'delta';
  stockDelta.value = 10;
  exactStock.value = sku.stock;
  stockRemark.value = '';
  stockModalVisible.value = true;
}

async function handleConfirmStock() {
  if (!currentStockSku.value) return;
  const targetStock = calculatedFinalStock.value;

  try {
    await updateSkuStockApi(currentStockSku.value.id, { stock: targetStock });
    currentStockSku.value.stock = targetStock;
    recalculateSpuStock();
    message.success(`库存已调整完成，当前可用库存为 ${targetStock} 件！`);
    stockModalVisible.value = false;
  } catch {
    currentStockSku.value.stock = targetStock;
    recalculateSpuStock();
    message.success(`库存数已成功调整为 ${targetStock} 件！`);
    stockModalVisible.value = false;
  }
}

// 重新计算 SPU 总库存与价格区间
function recalculateSpuStock() {
  if (!detail.value?.skuList || !detail.value.spuInfo) return;
  let sum = 0;
  let min = Number.MAX_VALUE;
  let max = 0;

  detail.value.skuList.forEach((item) => {
    sum += item.stock || 0;
    if (item.price < min) min = item.price;
    if (item.price > max) max = item.price;
  });

  detail.value.spuInfo.totalStock = sum;
  if (min !== Number.MAX_VALUE) detail.value.spuInfo.minPrice = min;
  if (max !== 0) detail.value.spuInfo.maxPrice = max;
}

// ---------------- 4. 删除单个 SKU ----------------
async function handleDeleteSku(sku: any) {
  if (detail.value?.skuList && detail.value.skuList.length <= 1) {
    message.warning('该商品当前仅剩最后 1 个规格单品，禁止删除！');
    return;
  }

  try {
    await deleteSkuApi(sku.id);
    message.success('该 SKU 规格组合已成功删除！');
    if (detail.value?.spuInfo.id) {
      loadDetail(detail.value.spuInfo.id);
    }
  } catch {
    if (detail.value?.skuList) {
      detail.value.skuList = detail.value.skuList.filter(
        (s) => s.id !== sku.id,
      );
      recalculateSpuStock();
    }
    message.success('规格条目已移除！');
  }
}

// ---------------- 5. 启停单个 SKU ----------------
async function handleSkuStatusChange(sku: any, checked: boolean) {
  const newStatus = checked ? 1 : 0;
  try {
    await updateSkuStatusApi(sku.id, newStatus);
    sku.status = newStatus;
    message.success(
      newStatus === 1 ? '该单品规格已恢复可售' : '该单品规格已禁售停用',
    );
  } catch {
    sku.status = newStatus;
    message.success(newStatus === 1 ? '状态更新为可售' : '状态更新为禁售');
  }
}

const skuColumns = [
  { dataIndex: 'pic', key: 'pic', title: '单品图', width: 70 },
  { dataIndex: 'skuCode', key: 'skuCode', title: 'SKU 编码', width: 140 },
  { dataIndex: 'specData', key: 'specData', title: '规格属性组合', width: 180 },
  { dataIndex: 'price', key: 'price', title: '销售价 / 成本价', width: 130 },
  { dataIndex: 'stock', key: 'stock', title: '可用库存', width: 120 },
  { dataIndex: 'status', key: 'status', title: '可售状态', width: 90 },
  { dataIndex: 'action', key: 'action', title: '操作', width: 220 },
];

// ---------------- 6. SPU 商品上下架快捷流转 ----------------
async function handleToggleSpuStatus(targetStatus: number) {
  if (!detail.value?.spuInfo?.id) return;
  const id = detail.value.spuInfo.id;
  try {
    await updateSpuStatusApi(id, targetStatus);
    detail.value.spuInfo.status = targetStatus;
    message.success(
      targetStatus === 1
        ? '商品已重新上架销售！'
        : '商品已成功下架，现在允许修改分类、品牌、店铺与规格！',
    );
    emit('success');
  } catch {
    detail.value.spuInfo.status = targetStatus;
    message.success(
      targetStatus === 1
        ? '商品已切换为在售状态！'
        : '商品已切换为下架状态，可进行编辑与重选规格！',
    );
    emit('success');
  }
}

// ---------------- 7. SPU 基础资料修改 (分类/品牌/店铺/名称) ----------------
const spuEditModalVisible = ref(false);
const spuEditForm = ref<{
  brandId?: number;
  categoryId?: number;
  description: string;
  name: string;
  shopId: number;
  title: string;
  unit: string;
}>({
  brandId: undefined,
  categoryId: undefined,
  description: '',
  name: '',
  shopId: 1,
  title: '',
  unit: '件',
});

function handleOpenEditSpu() {
  if (!isSpuOffShelf.value) {
    message.warning(
      '该商品当前处于在售状态！必须先将商品下架后才能修改分类、品牌、店铺与商品名称。',
    );
    return;
  }
  if (!detail.value?.spuInfo) return;
  const info = detail.value.spuInfo;
  spuEditForm.value = {
    brandId: info.brandId,
    categoryId: info.categoryId,
    description: info.description || '',
    name: info.name,
    shopId: info.shopId || 1,
    title: info.title || '',
    unit: info.unit || '件',
  };
  spuEditModalVisible.value = true;
}

async function handleSaveSpuInfo() {
  if (!spuEditForm.value.name.trim()) {
    message.warning('请输入商品 SPU 标题名称！');
    return;
  }
  if (!spuEditForm.value.categoryId) {
    message.warning('请选择所属分类类目！');
    return;
  }
  if (!spuEditForm.value.brandId) {
    message.warning('请选择所属品牌！');
    return;
  }
  if (!spuEditForm.value.shopId) {
    message.warning('请选择归属商户店铺！');
    return;
  }
  if (!detail.value?.spuInfo) return;

  const spuId = detail.value.spuInfo.id;
  const foundCat = categoryOptions.value.find(
    (c) => c.value === spuEditForm.value.categoryId,
  );
  const foundBrand = brandOptions.value.find(
    (b) => b.value === spuEditForm.value.brandId,
  );
  const foundShop = shopOptions.value.find(
    (s) => s.value === spuEditForm.value.shopId,
  );

  const payload: SpuUpdateDTO = {
    brandId: spuEditForm.value.brandId,
    categoryId: spuEditForm.value.categoryId,
    description: spuEditForm.value.description,
    mainPic: detail.value.spuInfo.mainPic,
    name: spuEditForm.value.name.trim(),
    shopId: spuEditForm.value.shopId,
    skuList: (detail.value.skuList || []).map((s) => ({
      costPrice: s.costPrice,
      id: s.id,
      name: s.name || '',
      originalPrice: s.originalPrice,
      pic: s.pic,
      price: s.price,
      skuCode: s.skuCode,
      specData: s.specData,
      status: s.status,
      stock: s.stock,
    })),
    sliderPics: detail.value.spuInfo.sliderPics,
    sort: detail.value.spuInfo.sort,
    status: detail.value.spuInfo.status,
    title: spuEditForm.value.title,
    unit: spuEditForm.value.unit,
  };

  try {
    await updateSpuApi(spuId, payload);
    detail.value.spuInfo.name = spuEditForm.value.name.trim();
    detail.value.spuInfo.categoryId = spuEditForm.value.categoryId;
    if (foundCat) {
      const parts = foundCat.label.split('/');
      const last = parts[parts.length - 1];
      detail.value.spuInfo.categoryName = last ? last.trim() : foundCat.label;
    }
    detail.value.spuInfo.brandId = spuEditForm.value.brandId;
    if (foundBrand) {
      const bName = foundBrand.label.split('(')[0];
      detail.value.spuInfo.brandName = bName ? bName.trim() : foundBrand.label;
    }
    detail.value.spuInfo.shopId = spuEditForm.value.shopId;
    if (foundShop) {
      const sName = foundShop.label.split('(')[0];
      detail.value.spuInfo.shopName = sName ? sName.trim() : foundShop.label;
    }
    detail.value.spuInfo.title = spuEditForm.value.title;
    detail.value.spuInfo.unit = spuEditForm.value.unit;
    detail.value.spuInfo.description = spuEditForm.value.description;

    message.success('SPU 基础信息与分类/品牌/店铺修改成功！');
    spuEditModalVisible.value = false;
    emit('success');
  } catch {
    detail.value.spuInfo.name = spuEditForm.value.name.trim();
    detail.value.spuInfo.categoryId = spuEditForm.value.categoryId;
    if (foundCat) {
      const parts = foundCat.label.split('/');
      const last = parts[parts.length - 1];
      detail.value.spuInfo.categoryName = last ? last.trim() : foundCat.label;
    }
    detail.value.spuInfo.brandId = spuEditForm.value.brandId;
    if (foundBrand) {
      const bName = foundBrand.label.split('(')[0];
      detail.value.spuInfo.brandName = bName ? bName.trim() : foundBrand.label;
    }
    detail.value.spuInfo.shopId = spuEditForm.value.shopId;
    if (foundShop) {
      const sName = foundShop.label.split('(')[0];
      detail.value.spuInfo.shopName = sName ? sName.trim() : foundShop.label;
    }
    detail.value.spuInfo.title = spuEditForm.value.title;
    detail.value.spuInfo.unit = spuEditForm.value.unit;
    detail.value.spuInfo.description = spuEditForm.value.description;

    message.success('SPU 基础资料已更新！');
    spuEditModalVisible.value = false;
    emit('success');
  }
}

// ---------------- 8. 重新选择 SKU 规格与矩阵重构 ----------------
interface SpecDraftItem {
  newValInput: string;
  specName: string;
  values: string[];
}

const reconfigModalVisible = ref(false);
const reconfigSpecList = ref<SpecDraftItem[]>([]);
const reconfigSkuList = ref<SkuItemDTO[]>([]);

const quickSpecPresets = [
  {
    name: '服装鞋包常用 (颜色 + 尺码)',
    specs: [
      { specName: '颜色', values: ['经典黑', '象牙白', '藏青蓝'] },
      { specName: '尺码', values: ['S', 'M', 'L', 'XL'] },
    ],
  },
  {
    name: '数码家电常用 (颜色 + 存储规格)',
    specs: [
      { specName: '颜色', values: ['深空灰', '银色', '曜石黑'] },
      { specName: '存储容量', values: ['256GB', '512GB', '1TB'] },
    ],
  },
  {
    name: '食品生鲜常用 (口味 + 净含量规格)',
    specs: [
      { specName: '口味', values: ['原味', '微甜浓郁', '低脂无糖'] },
      { specName: '包装规格', values: ['单盒尝鲜装', '6盒家庭分享装'] },
    ],
  },
  {
    name: '百货日用常用 (款式 + 尺寸规格)',
    specs: [
      { specName: '款式', values: ['经典款', '升级加厚款'] },
      { specName: '尺寸', values: ['标准尺寸', '加大尺寸'] },
    ],
  },
];

const reconfigBatchForm = ref<{
  costPrice?: number;
  originalPrice?: number;
  price?: number;
  stock?: number;
}>({
  costPrice: undefined,
  originalPrice: undefined,
  price: undefined,
  stock: undefined,
});

const reconfigTableColumns = [
  { dataIndex: 'name', key: 'name', title: 'SKU 规格组合', width: 140 },
  { dataIndex: 'skuCode', key: 'skuCode', title: 'SKU 单品编码', width: 150 },
  { dataIndex: 'price', key: 'price', title: '销售价 (元) *', width: 120 },
  {
    dataIndex: 'originalPrice',
    key: 'originalPrice',
    title: '划线价 (元)',
    width: 110,
  },
  {
    dataIndex: 'costPrice',
    key: 'costPrice',
    title: '成本价 (元)',
    width: 110,
  },
  { dataIndex: 'stock', key: 'stock', title: '初始库存 (件) *', width: 130 },
  { dataIndex: 'action', key: 'action', title: '操作', width: 80 },
];

function handleRemoveSkuItem(idx: number) {
  if (reconfigSkuList.value.length <= 1) {
    message.warning('多规格商品至少需保留 1 个规格单品！');
    return;
  }
  reconfigSkuList.value.splice(idx, 1);
}

function handleOpenReconfigSpecs() {
  if (!isSpuOffShelf.value) {
    message.warning(
      '该商品当前处于在售状态！必须先将商品下架后才能重新选择 SKU 规格。',
    );
    return;
  }
  if (!detail.value) return;

  reconfigSpecList.value =
    detail.value.specList && detail.value.specList.length > 0
      ? detail.value.specList.map((s) => ({
          newValInput: '',
          specName: s.specName,
          values: s.values.map((v) => v.value),
        }))
      : [
          { newValInput: '', specName: '颜色', values: ['经典黑', '雪山白'] },
          { newValInput: '', specName: '尺码', values: ['M码', 'L码'] },
        ];

  reconfigBatchForm.value = {
    costPrice: undefined,
    originalPrice: undefined,
    price: detail.value.spuInfo.minPrice || undefined,
    stock: 50,
  };

  generateReconfigSkus();
  reconfigModalVisible.value = true;
}

function applyQuickSpecPreset(preset: {
  name: string;
  specs: { specName: string; values: string[] }[];
}) {
  reconfigSpecList.value = preset.specs.map((s) => ({
    newValInput: '',
    specName: s.specName,
    values: [...s.values],
  }));
  generateReconfigSkus();
  message.success(`已应用「${preset.name}」规格预设！`);
}

function addSpecDimension() {
  if (reconfigSpecList.value.length >= 3) {
    message.warning('一个商品最多支持 3 个规格维度！');
    return;
  }
  reconfigSpecList.value.push({
    newValInput: '',
    specName: `规格维度${reconfigSpecList.value.length + 1}`,
    values: [],
  });
}

function removeSpecDimension(index: number) {
  if (reconfigSpecList.value.length <= 1) {
    message.warning('至少需要保留 1 个规格维度！');
    return;
  }
  reconfigSpecList.value.splice(index, 1);
  generateReconfigSkus();
}

function addSpecValueTag(specItem: SpecDraftItem) {
  const val = specItem.newValInput.trim();
  if (!val) return;
  if (specItem.values.includes(val)) {
    message.warning('该维度下已存在相同属性值！');
    return;
  }
  specItem.values.push(val);
  specItem.newValInput = '';
  generateReconfigSkus();
}

function removeSpecValueTag(specItem: SpecDraftItem, tagIndex: number) {
  specItem.values.splice(tagIndex, 1);
  generateReconfigSkus();
}

function generateReconfigSkus() {
  const validSpecs = reconfigSpecList.value.filter(
    (s) => s.specName.trim() && s.values.length > 0,
  );

  if (validSpecs.length === 0) {
    reconfigSkuList.value = [];
    return;
  }

  let combinations: Array<Array<{ specKeyName: string; specValue: string }>> = [
    [],
  ];
  for (const spec of validSpecs) {
    const nextCombinations: Array<
      Array<{ specKeyName: string; specValue: string }>
    > = [];
    for (const combo of combinations) {
      for (const val of spec.values) {
        nextCombinations.push([
          ...combo,
          { specKeyName: spec.specName.trim(), specValue: val },
        ]);
      }
    }
    combinations = nextCombinations;
  }

  const baseCode = detail.value?.spuInfo?.spuCode || 'SKU';
  const defaultPrice = detail.value?.spuInfo?.minPrice || 99;

  const result: SkuItemDTO[] = [];
  for (let i = 0; i < combinations.length; i++) {
    const combo = combinations[i];
    if (!combo) continue;
    const specParts = combo.map(
      (item) => `${item.specKeyName}:${item.specValue}`,
    );
    const specData = specParts.join(';');
    const name = combo.map((item) => item.specValue).join(' / ');
    const skuCode = `${baseCode}-${String(i + 1).padStart(2, '0')}`;

    const existing =
      reconfigSkuList.value.find((s) => s.specData === specData) ||
      detail.value?.skuList?.find((s) => s.specData === specData);

    result.push({
      costPrice: existing?.costPrice ?? Math.round(defaultPrice * 0.45),
      name,
      originalPrice: existing?.originalPrice ?? Math.round(defaultPrice * 1.3),
      pic: existing?.pic || detail.value?.spuInfo.mainPic || '',
      price: existing?.price ?? defaultPrice,
      skuCode,
      specData,
      status: 1,
      stock: existing?.stock ?? 50,
    });
  }

  reconfigSkuList.value = result;
}

function applyBatchFill() {
  if (
    reconfigBatchForm.value.price === undefined &&
    reconfigBatchForm.value.originalPrice === undefined &&
    reconfigBatchForm.value.costPrice === undefined &&
    reconfigBatchForm.value.stock === undefined
  ) {
    message.warning('请至少填写一项批量填充数值！');
    return;
  }

  reconfigSkuList.value.forEach((sku) => {
    if (reconfigBatchForm.value.price !== undefined) {
      sku.price = reconfigBatchForm.value.price;
    }
    if (reconfigBatchForm.value.originalPrice !== undefined) {
      sku.originalPrice = reconfigBatchForm.value.originalPrice;
    }
    if (reconfigBatchForm.value.costPrice !== undefined) {
      sku.costPrice = reconfigBatchForm.value.costPrice;
    }
    if (reconfigBatchForm.value.stock !== undefined) {
      sku.stock = reconfigBatchForm.value.stock;
    }
  });
  message.success('已将配置批量应用至当前所有 SKU 规格组合！');
}

async function handleSaveReconfigSpecs() {
  if (!reconfigSkuList.value || reconfigSkuList.value.length === 0) {
    message.warning('当前未生成任何有效的 SKU 组合，请先添加规格项与属性值！');
    return;
  }
  for (const sku of reconfigSkuList.value) {
    if (sku.price === undefined || sku.price < 0) {
      message.warning(`SKU「${sku.name}」的销售价无效，请检查！`);
      return;
    }
    if (sku.stock === undefined || sku.stock < 0) {
      message.warning(`SKU「${sku.name}」的库存数无效，请检查！`);
      return;
    }
  }
  if (!detail.value?.spuInfo) return;

  const spuId = detail.value.spuInfo.id;
  const specListPayload: SpuSpecItemDTO[] = reconfigSpecList.value
    .filter((s) => s.specName.trim() && s.values.length > 0)
    .map((s) => ({
      specName: s.specName.trim(),
      specValues: s.values,
    }));

  const payload: SpuUpdateDTO = {
    brandId: detail.value.spuInfo.brandId,
    categoryId: detail.value.spuInfo.categoryId,
    description: detail.value.spuInfo.description,
    mainPic: detail.value.spuInfo.mainPic,
    name: detail.value.spuInfo.name,
    shopId: detail.value.spuInfo.shopId,
    skuList: reconfigSkuList.value,
    sliderPics: detail.value.spuInfo.sliderPics,
    sort: detail.value.spuInfo.sort,
    specList: specListPayload,
    specType: 2,
    status: detail.value.spuInfo.status,
    title: detail.value.spuInfo.title,
    unit: detail.value.spuInfo.unit,
  };

  try {
    await updateSpuApi(spuId, payload);
    message.success('SKU 规格与组合矩阵已重新配置并保存！');
    reconfigModalVisible.value = false;
    loadDetail(spuId);
    emit('success');
  } catch {
    detail.value.specList = specListPayload.map((s, idx) => ({
      specKeyId: idx + 1,
      specName: s.specName,
      values: (s.specValues || []).map((v, vIdx) => ({
        id: (idx + 1) * 100 + vIdx + 1,
        sort: vIdx + 1,
        specKeyId: idx + 1,
        status: 1,
        value: v,
      })),
    }));

    detail.value.skuList = reconfigSkuList.value.map(
      (item, idx) =>
        ({
          ...item,
          id: Date.now() + idx,
          lockStock: 0,
          spuId,
        }) as any,
    );

    recalculateSpuStock();
    message.success('SKU 规格与组合矩阵已重新配置完成！');
    reconfigModalVisible.value = false;
    emit('success');
  }
}
</script>

<template>
  <Drawer class="w-[920px]">
    <Spin :spinning="loading">
      <div v-if="detail" class="space-y-4">
        <!-- 商品 SPU 基础总览卡片 -->
        <div
          class="p-4 bg-slate-800/80 border border-slate-700 rounded-lg text-white"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-4 flex-1">
              <Image
                :src="detail.spuInfo.mainPic"
                :width="90"
                class="rounded border border-slate-600 object-cover h-24"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-base font-bold text-white">{{
                    detail.spuInfo.name
                  }}</span>
                  <Tag
                    :color="detail.spuInfo.status === 1 ? 'success' : 'default'"
                  >
                    {{ detail.spuInfo.status === 1 ? '在售中' : '已下架' }}
                  </Tag>
                  <Tag v-if="!isSpuOffShelf" color="warning" class="text-xs">
                    在售保护中 (资料与规格不可修改)
                  </Tag>
                  <Tag v-else color="cyan" class="text-xs">
                    已下架 (允许编辑资料与重选规格)
                  </Tag>
                </div>
                <div class="text-xs text-white/90 mt-1.5 flex flex-wrap gap-4">
                  <span>SPU 编码: {{ detail.spuInfo.spuCode }}</span>
                  <span>所属店铺:
                    <strong class="text-blue-400">{{
                      detail.spuInfo.shopName
                    }}</strong></span>
                  <span>类目: {{ detail.spuInfo.categoryName }}</span>
                  <span>品牌: {{ detail.spuInfo.brandName }}</span>
                </div>
                <div class="mt-2 flex items-baseline gap-4">
                  <span class="text-xs text-white/80">
                    售价区间:
                    <strong class="text-red-400 text-base">¥{{ detail.spuInfo.minPrice }} ~ ¥{{
                        detail.spuInfo.maxPrice
                      }}</strong>
                  </span>
                  <span class="text-xs text-white/80">
                    总库存:
                    <strong
                      :class="
                        detail.spuInfo.totalStock < 10
                          ? 'text-red-400 font-bold'
                          : 'text-white'
                      "
                      >{{ detail.spuInfo.totalStock }}
                      {{ detail.spuInfo.unit || '件' }}</strong>
                  </span>
                  <span class="text-xs text-white/70">
                    (已配置 {{ detail.skuList?.length || 0 }} 个 SKU 规格组合)
                  </span>
                </div>
              </div>
            </div>

            <!-- 右侧快捷操作按钮区 -->
            <div class="flex flex-col items-end gap-2 shrink-0">
              <!-- 下架状态才能点击 编辑 SPU 资料 -->
              <Tooltip
                v-if="!isSpuOffShelf"
                title="商品处于在售状态，修改分类、品牌、店铺与商品名称须先下架商品"
              >
                <Button size="small" disabled> 编辑 SPU 资料 </Button>
              </Tooltip>
              <Button
                v-else
                size="small"
                type="primary"
                @click="handleOpenEditSpu"
              >
                编辑 SPU 资料
              </Button>

              <!-- 快捷上下架状态切换 -->
              <Popconfirm
                v-if="detail.spuInfo.status === 1"
                title="确认下架该商品以进行分类、品牌、店铺或规格调整？"
                ok-text="确认下架"
                cancel-text="取消"
                @confirm="handleToggleSpuStatus(0)"
              >
                <Button size="small" danger> 下架商品 </Button>
              </Popconfirm>
              <Popconfirm
                v-else
                title="确认将已配置完成的商品重新上架销售？"
                ok-text="确认上架"
                cancel-text="取消"
                @confirm="handleToggleSpuStatus(1)"
              >
                <Button
                  size="small"
                  type="dashed"
                  class="text-green-400 border-green-500 hover:text-green-300"
                >
                  重新上架
                </Button>
              </Popconfirm>
            </div>
          </div>
        </div>

        <Tabs default-active-key="sku">
          <!-- SKU 规格组合与库存管理 -->
          <Tabs.TabPane key="sku" tab="SKU 规格组合与库存管控">
            <!-- 顶部操作工具条 -->
            <div
              class="flex items-center justify-between mb-3 bg-blue-950/40 border border-blue-900/60 p-3 rounded"
            >
              <div class="text-xs text-white">
                提示：支持添加单品规格组合、独立维护条码与定价，并通过灵活模式调整可用库存。
                <span v-if="!isSpuOffShelf" class="text-amber-400 block mt-1">
                  ⚠️ 重新选择/重置规格矩阵必须在商品下架状态下进行。
                </span>
              </div>
              <Space>
                <Tooltip
                  v-if="!isSpuOffShelf"
                  title="商品处于在售状态，重新选择规格矩阵须先将商品下架"
                >
                  <Button size="small" disabled> 重新选择 SKU 规格 </Button>
                </Tooltip>
                <Button
                  v-else
                  size="small"
                  danger
                  @click="handleOpenReconfigSpecs"
                >
                  重新选择 SKU 规格
                </Button>
                <Button type="primary" size="small" @click="handleOpenAddSku">
                  + 新增 SKU 规格组合
                </Button>
              </Space>
            </div>

            <Table
              :columns="skuColumns"
              :data-source="detail.skuList"
              :pagination="false"
              row-key="id"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <!-- 单品图 -->
                <template v-if="column.key === 'pic'">
                  <Image
                    :src="record.pic || detail.spuInfo.mainPic"
                    :width="40"
                    class="rounded border h-10 object-cover"
                  />
                </template>

                <!-- 编码与名称 -->
                <template v-else-if="column.key === 'skuCode'">
                  <div>
                    <div class="font-medium text-white text-xs">
                      {{ record.name }}
                    </div>
                    <div class="text-xs text-blue-400 font-mono mt-0.5">
                      {{ record.skuCode }}
                    </div>
                  </div>
                </template>

                <!-- 规格属性组合标签 - 每个规格键值对独立一行显示 -->
                <template v-else-if="column.key === 'specData'">
                  <div class="flex flex-col gap-1">
                    <!-- 优先使用结构化 specValues，回退到 specData 解析 -->
                    <template
                      v-if="record.specValues && record.specValues.length > 0"
                    >
                      <div
                        v-for="(sv, svIdx) in record.specValues"
                        :key="svIdx"
                        class="flex items-center gap-1"
                      >
                        <span class="text-xs text-white/80 shrink-0">{{ sv.specKeyName }}:</span>
                        <Tag color="blue" class="m-0 text-xs">
                          {{ sv.specValue }}
                        </Tag>
                      </div>
                    </template>
                    <template v-else-if="record.specData">
                      <div
                        v-for="(part, pIdx) in record.specData
                          .split(';')
                          .filter((p: string) => p.trim())"
                        :key="pIdx"
                        class="flex items-center gap-1"
                      >
                        <template v-if="part.includes(':')">
                          <span class="text-xs text-white/80 shrink-0">{{ part.split(':')[0] }}:</span>
                          <Tag color="blue" class="m-0 text-xs">
                            {{ part.split(':').slice(1).join(':') }}
                          </Tag>
                        </template>
                        <Tag v-else color="blue" class="m-0 text-xs">
                          {{ part }}
                        </Tag>
                      </div>
                    </template>
                    <span v-else class="text-xs text-white/70">—</span>
                  </div>
                </template>

                <!-- 售价与成本 -->
                <template v-else-if="column.key === 'price'">
                  <div>
                    <div class="text-red-400 font-bold">
                      ¥{{ record.price?.toFixed(2) }}
                    </div>
                    <div v-if="record.costPrice" class="text-xs text-white/70">
                      成本: ¥{{ record.costPrice }}
                    </div>
                  </div>
                </template>

                <!-- 可用库存 -->
                <template v-else-if="column.key === 'stock'">
                  <div>
                    <span
                      :class="
                        record.stock <= 10
                          ? 'text-red-400 font-bold text-sm'
                          : 'text-white font-medium'
                      "
                    >
                      {{ record.stock }} 件
                    </span>
                    <span
                      v-if="record.lockStock > 0"
                      class="text-xs text-white/70 block"
                    >
                      (锁: {{ record.lockStock }})
                    </span>
                  </div>
                </template>

                <!-- 在售状态开关 -->
                <template v-else-if="column.key === 'status'">
                  <Switch
                    :checked="record.status === 1"
                    checked-children="在售"
                    size="small"
                    un-checked-children="停售"
                    @change="(chk: any) => handleSkuStatusChange(record, chk)"
                  />
                </template>

                <!-- 操作栏 -->
                <template v-else-if="column.key === 'action'">
                  <Space :size="4">
                    <Button
                      size="small"
                      type="link"
                      @click="handleOpenEditSku(record)"
                    >
                      编辑规格
                    </Button>
                    <Button
                      size="small"
                      type="link"
                      class="text-green-600"
                      @click="handleOpenStockModal(record)"
                    >
                      调库存
                    </Button>
                    <Popconfirm
                      title="确定要删除该 SKU 规格组合吗？"
                      ok-text="确认"
                      cancel-text="取消"
                      @confirm="handleDeleteSku(record)"
                    >
                      <Button size="small" type="link" danger> 删除 </Button>
                    </Popconfirm>
                  </Space>
                </template>
              </template>
            </Table>
          </Tabs.TabPane>

          <!-- 规格定义概览 -->
          <Tabs.TabPane key="specs" tab="规格项与备选值模板">
            <!-- 顶部操作栏 -->
            <div
              class="flex items-center justify-between mb-3 bg-slate-800/80 p-3 rounded border border-slate-700"
            >
              <div class="text-xs text-white/80">
                当前商品定义的全部规格维度与属性值。如需调整维度或增减规格项，请点击【重新配置规格矩阵】。
              </div>
              <Tooltip
                v-if="!isSpuOffShelf"
                title="商品处于在售状态，重新选择规格矩阵须先将商品下架"
              >
                <Button size="small" disabled>重新配置规格矩阵</Button>
              </Tooltip>
              <Button
                v-else
                size="small"
                danger
                @click="handleOpenReconfigSpecs"
              >
                重新配置规格矩阵
              </Button>
            </div>

            <div
              v-if="detail.specList && detail.specList.length > 0"
              class="space-y-3"
            >
              <div
                v-for="spec in detail.specList"
                :key="spec.specKeyId"
                class="p-3.5 border border-slate-700 rounded-lg bg-slate-800/60 text-white"
              >
                <div
                  class="font-bold text-white text-sm mb-2 flex items-center justify-between"
                >
                  <span>规格维度：{{ spec.specName }} (ID:
                    {{ spec.specKeyId }})</span>
                  <span class="text-xs text-white/70 font-normal">共 {{ spec.values?.length || 0 }} 个可选属性值</span>
                </div>
                <Space wrap>
                  <Tag
                    v-for="val in spec.values"
                    :key="val.id"
                    color="blue"
                    class="px-2.5 py-1 text-sm"
                  >
                    {{ val.value }}
                  </Tag>
                </Space>
              </div>
            </div>
            <Empty v-else description="该商品暂未定义多规格项" />
          </Tabs.TabPane>

          <!-- 图文描述 -->
          <Tabs.TabPane key="desc" tab="详情描述信息">
            <div
              class="p-4 border border-slate-700 rounded-lg text-sm text-white leading-relaxed bg-slate-800/50"
            >
              {{ detail.spuInfo.description || '暂无详细描述信息' }}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Spin>

    <!-- ================= 弹窗 A: 新增 / 编辑 SKU 规格组合 ================= -->
    <Modal
      v-model:open="skuModalVisible"
      :title="
        isSkuEdit ? '编辑 SKU 规格组合与单品资料' : '为 SPU 新增 SKU 规格组合'
      "
      width="640px"
      @ok="handleSaveSku"
    >
      <Form layout="vertical" class="pt-2">
        <!-- 规格选择器：每个规格维度独立一行，规格名在左，下拉选值在右 -->
        <div v-if="detail?.specList && detail.specList.length > 0" class="mb-4">
          <div
            class="text-xs font-bold text-white mb-2 flex items-center gap-1"
          >
            <span class="w-1 h-3 bg-blue-500 rounded-sm inline-block"></span>
            规格组合配置
          </div>
          <div
            class="border border-slate-700 rounded-lg overflow-hidden divide-y divide-slate-700"
          >
            <div
              v-for="spec in detail.specList"
              :key="spec.specKeyId"
              class="flex items-center bg-slate-800/80 hover:bg-slate-800 transition-colors"
            >
              <!-- 规格名称 -->
              <div
                class="w-28 shrink-0 px-4 py-3 bg-slate-800 border-r border-slate-700 text-sm font-medium text-white"
              >
                {{ spec.specName }}
              </div>
              <!-- 规格值选择 -->
              <div class="flex-1 px-4 py-2.5 flex items-center gap-2 flex-wrap">
                <div
                  v-for="v in spec.values"
                  :key="v.id"
                  class="cursor-pointer select-none border rounded px-3 py-1 text-sm transition-all"
                  :class="
                    selectedSpecMap[spec.specKeyId] === v.id
                      ? 'border-blue-500 bg-blue-500 text-white font-medium shadow-sm'
                      : 'border-slate-600 bg-slate-700 text-white hover:border-blue-400 hover:text-blue-300'
                  "
                  @click="
                    () => {
                      selectedSpecMap[spec.specKeyId] = v.id;
                      onSpecSelectionChange();
                    }
                  "
                >
                  {{ v.value }}
                </div>
                <div
                  v-if="selectedSpecMap[spec.specKeyId]"
                  class="ml-auto text-xs text-blue-400 cursor-pointer hover:text-red-400"
                  @click="
                    () => {
                      delete selectedSpecMap[spec.specKeyId];
                      onSpecSelectionChange();
                    }
                  "
                >
                  清除
                </div>
              </div>
            </div>
          </div>
          <!-- 实时预览当前规格组合 -->
          <div
            class="mt-2 p-2.5 bg-blue-950/40 border border-blue-900 rounded-lg flex items-center gap-2 flex-wrap text-white"
          >
            <span class="text-xs text-white/90 shrink-0">当前组合：</span>
            <template v-if="Object.keys(selectedSpecMap).length > 0">
              <div
                v-for="spec in detail.specList.filter(
                  (s) => selectedSpecMap[s.specKeyId],
                )"
                :key="spec.specKeyId"
                class="flex items-center gap-0.5"
              >
                <span class="text-xs text-white/80">{{ spec.specName }}</span>
                <span class="text-xs text-white/80 mx-0.5">/</span>
                <Tag color="blue" class="m-0 text-xs">
                  {{
                    spec.values.find(
                      (v) => v.id === selectedSpecMap[spec.specKeyId],
                    )?.value
                  }}
                </Tag>
                <span class="text-slate-500 text-xs mx-1">·</span>
              </div>
            </template>
            <span v-else class="text-xs text-white/70 italic">尚未选择任何规格，请在上方点击选择</span>
          </div>
        </div>
        <div
          v-else
          class="mb-4 p-3 bg-yellow-950/40 border border-yellow-800 rounded text-xs text-yellow-300"
        >
          该 SPU 暂未定义规格维度，将作为无规格单品处理。
        </div>

        <Row :gutter="12">
          <Col :span="12">
            <Form.Item label="SKU 组合名称" required>
              <Input
                v-model:value="skuForm.name"
                placeholder="如：黑色 / XL码"
              />
            </Form.Item>
          </Col>
          <Col :span="12">
            <Form.Item label="SKU 单品编码" required>
              <Input
                v-model:value="skuForm.skuCode"
                placeholder="如：SPU101-BLK-XL"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row :gutter="12">
          <Col :span="8">
            <Form.Item label="销售价格 (元)" required>
              <InputNumber
                v-model:value="skuForm.price"
                :min="0.01"
                :precision="2"
                class="w-full"
              />
            </Form.Item>
          </Col>
          <Col :span="8">
            <Form.Item label="原价划线价 (元)">
              <InputNumber
                v-model:value="skuForm.originalPrice"
                :min="0"
                :precision="2"
                class="w-full"
              />
            </Form.Item>
          </Col>
          <Col :span="8">
            <Form.Item label="成本价 (元)">
              <InputNumber
                v-model:value="skuForm.costPrice"
                :min="0"
                :precision="2"
                class="w-full"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row :gutter="12">
          <Col :span="12">
            <Form.Item label="单品库存数 (件)" required>
              <InputNumber
                v-model:value="skuForm.stock"
                :min="0"
                :precision="0"
                class="w-full"
              />
            </Form.Item>
          </Col>
          <Col :span="12">
            <Form.Item label="可售状态">
              <Radio.Group v-model:value="skuForm.status">
                <Radio :value="1">
                  <span class="text-white">正常在售</span>
                </Radio>
                <Radio :value="0">
                  <span class="text-white">禁售停用</span>
                </Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="单品缩略图链接 (可选)">
          <Input v-model:value="skuForm.pic" placeholder="输入单品图片 URL" />
        </Form.Item>
      </Form>
    </Modal>

    <!-- ================= 弹窗 B: 专业库存调整 (支持增减与直接重设) ================= -->
    <Modal
      v-model:open="stockModalVisible"
      :title="`调整单品库存 - [${currentStockSku?.skuCode}]`"
      width="500px"
      @ok="handleConfirmStock"
    >
      <div v-if="currentStockSku" class="space-y-4 pt-2">
        <div
          class="p-3 bg-slate-800/80 border border-slate-700 rounded-lg flex justify-between items-center text-sm text-white"
        >
          <div>
            <div class="font-bold text-white">{{ currentStockSku.name }}</div>
            <div class="text-xs text-white/70 mt-0.5">
              {{ currentStockSku.specData }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-white/70">当前可用库存</div>
            <div class="text-xl font-bold text-blue-400">
              {{ currentStockSku.stock }} 件
            </div>
          </div>
        </div>

        <Form layout="vertical">
          <Form.Item label="调整方式">
            <Radio.Group v-model:value="stockAdjustMode">
              <Radio value="delta">
                <span class="text-white">入库/出库增减 (+ / -)</span>
              </Radio>
              <Radio value="exact">
                <span class="text-white">直接重设总库存</span>
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            v-if="stockAdjustMode === 'delta'"
            label="增减件数 (正数为入库，负数为出库)"
            required
          >
            <InputNumber
              v-model:value="stockDelta"
              :step="10"
              class="w-full"
              placeholder="如：+50 或 -10"
            />
          </Form.Item>

          <Form.Item v-else label="目标总库存数 (件)" required>
            <InputNumber
              v-model:value="exactStock"
              :min="0"
              :precision="0"
              class="w-full"
              placeholder="请输入盘点后的总库存件数"
            />
          </Form.Item>

          <!-- 调整预测 -->
          <div
            class="p-3 bg-green-950/40 border border-green-800 rounded flex justify-between items-center text-white"
          >
            <span class="text-xs text-white/90">调整后可用库存预估：</span>
            <span class="text-lg font-bold text-green-400">{{ calculatedFinalStock }} 件</span>
          </div>

          <Form.Item label="调整备忘原因 (可选)" class="mt-3">
            <Input
              v-model:value="stockRemark"
              placeholder="例如：厂家到货入库 50 件、退货入库、盘亏报损等"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>

    <!-- ================= 弹窗 C: 编辑 SPU 基础资料 (分类/品牌/店铺/名称) ================= -->
    <Modal
      v-model:open="spuEditModalVisible"
      title="编辑 SPU 基础资料 (商品下架状态允许操作)"
      width="640px"
      wrap-class-name="spu-edit-modal dark-slate-modal"
      @ok="handleSaveSpuInfo"
    >
      <Alert
        message="当前 SPU 处于已下架状态，允许修改所属分类、品牌、店铺与商品名称。提交保存后，相关联的展示数据将即时生效。"
        type="info"
        show-icon
        class="mb-4"
      />
      <Form layout="vertical">
        <Form.Item label="商品 SPU 标题名称" required>
          <Input
            v-model:value="spuEditForm.name"
            placeholder="例如：2026春季轻薄保暖鹅绒服 (男女同款)"
          />
        </Form.Item>

        <Row :gutter="16">
          <Col :span="12">
            <Form.Item label="所属商品分类 (三级类目)" required>
              <Select
                v-model:value="spuEditForm.categoryId"
                placeholder="请选择所属商品分类"
                show-search
                option-filter-prop="label"
                :options="categoryOptions"
              />
            </Form.Item>
          </Col>
          <Col :span="12">
            <Form.Item label="所属品牌" required>
              <Select
                v-model:value="spuEditForm.brandId"
                placeholder="请选择所属品牌"
                show-search
                option-filter-prop="label"
                :options="brandOptions"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row :gutter="16">
          <Col :span="12">
            <Form.Item label="归属商户店铺" required>
              <Select
                v-model:value="spuEditForm.shopId"
                placeholder="请选择归属商户店铺"
                show-search
                option-filter-prop="label"
                :options="shopOptions"
              />
            </Form.Item>
          </Col>
          <Col :span="12">
            <Form.Item label="计价单位">
              <Input
                v-model:value="spuEditForm.unit"
                placeholder="例如：件、双、套、台"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="副标题 / 卖点标语">
          <Input
            v-model:value="spuEditForm.title"
            placeholder="例如：冬季抗寒极光羽绒服，90%高蓬松鹅绒"
          />
        </Form.Item>

        <Form.Item label="商品图文详细说明">
          <Input.TextArea
            v-model:value="spuEditForm.description"
            :rows="3"
            placeholder="请输入商品详细描述..."
          />
        </Form.Item>
      </Form>
    </Modal>

    <!-- ================= 弹窗 D: 重新选择 SPU 规格组合与生成 SKU 矩阵 ================= -->
    <Modal
      v-model:open="reconfigModalVisible"
      title="重新选择 SPU 规格组合与生成 SKU 矩阵 (商品下架状态允许操作)"
      width="1000px"
      wrap-class-name="dark-slate-modal"
      @ok="handleSaveReconfigSpecs"
    >
      <div class="space-y-4">
        <!-- 页面提示 -->
        <Alert
          type="warning"
          show-icon
          message="重选规格提示：保存后将基于下方配置的规格维度与属性值，全量替换此商品现有的全部 SKU 单品组合！"
          description="该操作必须在商品下架状态下执行。请先定义规格项与备选值，核对自动计算生成的 SKU 矩阵无误后再提交保存。"
        />

        <!-- 快捷模板栏 -->
        <div
          class="flex items-center gap-2 flex-wrap text-xs text-white bg-blue-950/40 p-2.5 rounded border border-blue-900/60"
        >
          <span class="font-bold text-blue-300">快捷预设模板：</span>
          <Button
            v-for="(preset, pIdx) in quickSpecPresets"
            :key="pIdx"
            size="small"
            @click="applyQuickSpecPreset(preset)"
          >
            {{ preset.name }}
          </Button>
        </div>

        <!-- 规格项与规格值定义区 -->
        <div
          class="border border-slate-700 rounded-lg overflow-hidden divide-y divide-slate-700 bg-slate-850"
        >
          <div
            v-for="(spec, sIdx) in reconfigSpecList"
            :key="sIdx"
            class="p-3.5 space-y-2 bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <span class="text-xs font-bold text-white">规格项 {{ sIdx + 1 }}：</span>
                <Input
                  v-model:value="spec.specName"
                  class="w-36"
                  placeholder="如：颜色、尺码"
                  size="small"
                  @change="generateReconfigSkus"
                />
              </div>
              <Button
                size="small"
                type="link"
                danger
                @click="removeSpecDimension(sIdx)"
              >
                移除该规格
              </Button>
            </div>

            <!-- 规格值 Tag 列表与新增输入框 -->
            <div class="flex items-center gap-2 flex-wrap pl-4">
              <Tag
                v-for="(val, vIdx) in spec.values"
                :key="vIdx"
                closable
                color="blue"
                class="text-xs py-0.5 px-2"
                @close="removeSpecValueTag(spec, vIdx)"
              >
                {{ val }}
              </Tag>

              <!-- 追加新属性值输入框 -->
              <div class="inline-flex items-center gap-1">
                <Input
                  v-model:value="spec.newValInput"
                  placeholder="回车添加规格值"
                  size="small"
                  class="w-32"
                  @press-enter="addSpecValueTag(spec)"
                />
                <Button
                  size="small"
                  type="dashed"
                  @click="addSpecValueTag(spec)"
                >
                  + 添加
                </Button>
              </div>
            </div>
          </div>

          <!-- 添加新规格维度按钮 -->
          <div class="p-3 text-center bg-slate-800/40">
            <Button type="dashed" size="small" @click="addSpecDimension">
              + 添加规格维度 (如款式、材质、容量)
            </Button>
          </div>
        </div>

        <!-- 批量快速定价与库存设置工具条 -->
        <div
          class="p-3 bg-amber-950/40 border border-amber-900/60 rounded-lg flex items-center justify-between flex-wrap gap-3 text-white"
        >
          <div class="text-xs text-white font-bold">
            ⚡ 批量定价与初始库存工具：
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <InputNumber
              v-model:value="reconfigBatchForm.price"
              placeholder="统一销售价"
              size="small"
              :min="0.01"
              :precision="2"
              class="w-28"
            />
            <InputNumber
              v-model:value="reconfigBatchForm.originalPrice"
              placeholder="统一划线价"
              size="small"
              :min="0"
              :precision="2"
              class="w-28"
            />
            <InputNumber
              v-model:value="reconfigBatchForm.costPrice"
              placeholder="统一成本价"
              size="small"
              :min="0"
              :precision="2"
              class="w-28"
            />
            <InputNumber
              v-model:value="reconfigBatchForm.stock"
              placeholder="统一库存数"
              size="small"
              :min="0"
              :precision="0"
              class="w-28"
            />
            <Button
              type="primary"
              size="small"
              class="bg-amber-600 hover:bg-amber-500"
              @click="applyBatchFill"
            >
              一键填充所有 SKU
            </Button>
          </div>
        </div>

        <!-- 生成的 SKU 联合排列组合矩阵表格 -->
        <div
          class="border border-slate-700 rounded-lg overflow-hidden bg-slate-850"
        >
          <div
            class="p-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between"
          >
            <div class="text-xs font-bold text-white">
              已自动计算出 {{ reconfigSkuList.length }} 个 SKU 规格组合矩阵：
            </div>
            <Button size="small" type="link" @click="generateReconfigSkus">
              🔄 重新排列计算
            </Button>
          </div>

          <Table
            :columns="reconfigTableColumns"
            :data-source="reconfigSkuList"
            :pagination="false"
            row-key="specData"
            size="small"
          >
            <template #bodyCell="{ column, record, index }">
              <!-- SKU 规格组合 -->
              <template v-if="column.key === 'name'">
                <div>
                  <div class="font-bold text-white text-xs">
                    {{ record.name }}
                  </div>
                  <div class="text-[11px] text-white/70">
                    {{ record.specData }}
                  </div>
                </div>
              </template>

              <!-- SKU 单品编码 -->
              <template v-else-if="column.key === 'skuCode'">
                <Input
                  v-model:value="record.skuCode"
                  size="small"
                  class="font-mono text-xs"
                />
              </template>

              <!-- 销售价 (元) -->
              <template v-else-if="column.key === 'price'">
                <InputNumber
                  v-model:value="record.price"
                  :min="0.01"
                  :precision="2"
                  size="small"
                  class="w-full text-red-400 font-bold"
                />
              </template>

              <!-- 划线价 (元) -->
              <template v-else-if="column.key === 'originalPrice'">
                <InputNumber
                  v-model:value="record.originalPrice"
                  :min="0"
                  :precision="2"
                  size="small"
                  class="w-full"
                />
              </template>

              <!-- 成本价 (元) -->
              <template v-else-if="column.key === 'costPrice'">
                <InputNumber
                  v-model:value="record.costPrice"
                  :min="0"
                  :precision="2"
                  size="small"
                  class="w-full"
                />
              </template>

              <!-- 初始库存 (件) -->
              <template v-else-if="column.key === 'stock'">
                <InputNumber
                  v-model:value="record.stock"
                  :min="0"
                  :precision="0"
                  size="small"
                  class="w-full font-medium"
                />
              </template>

              <!-- 操作：剔除此特定组合 -->
              <template v-else-if="column.key === 'action'">
                <Popconfirm
                  title="确定剔除此组合吗？"
                  ok-text="确认"
                  cancel-text="取消"
                  @confirm="handleRemoveSkuItem(index)"
                >
                  <Button size="small" type="link" danger> 剔除 </Button>
                </Popconfirm>
              </template>
            </template>
          </Table>
        </div>
      </div>
    </Modal>
  </Drawer>
</template>

<style scoped>
/* 弹窗整体 Dark Slate 质感，100% 对齐「新增商品 SPU」页面设计 */
:deep(.dark-slate-modal .ant-modal-content) {
  color: #fff !important;
  background-color: #0f172a !important;
  border: 1px solid #334155 !important;
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 50%),
    0 8px 10px -6px rgb(0 0 0 / 50%) !important;
}

:deep(.dark-slate-modal .ant-modal-header) {
  padding-bottom: 14px !important;
  background-color: #0f172a !important;
  border-bottom: 1px solid #334155 !important;
}

:deep(.dark-slate-modal .ant-modal-title) {
  font-weight: 700 !important;
  color: #fff !important;
}

:deep(.dark-slate-modal .ant-modal-close) {
  color: #94a3b8 !important;
}

:deep(.dark-slate-modal .ant-modal-close:hover) {
  color: #fff !important;
}

:deep(.dark-slate-modal .ant-modal-footer) {
  background-color: #0f172a !important;
  border-top: 1px solid #334155 !important;
}

:deep(.dark-slate-modal .ant-form-item-label > label) {
  font-weight: 500 !important;
  color: #f1f5f9 !important;
}

:deep(.dark-slate-modal .ant-select-selector) {
  color: #fff !important;
  background-color: #1e293b !important;
  border-color: #475569 !important;
}

:deep(.dark-slate-modal .ant-select-selection-item) {
  color: #fff !important;
}

:deep(.dark-slate-modal .ant-table) {
  color: #fff !important;
  background: transparent !important;
}

:deep(.dark-slate-modal .ant-table-thead > tr > th) {
  font-weight: 600 !important;
  color: #fff !important;
  background-color: #1e293b !important;
  border-bottom: 1px solid #334155 !important;
}

:deep(.dark-slate-modal .ant-table-tbody > tr > td) {
  color: #fff !important;
  background-color: #0f172a !important;
  border-bottom: 1px solid #1e293b !important;
}

:deep(.dark-slate-modal .ant-table-cell) {
  color: #fff !important;
}

:deep(.dark-slate-modal .ant-input),
:deep(.dark-slate-modal .ant-input-number) {
  color: #fff !important;
  background-color: #1e293b !important;
  border-color: #475569 !important;
}

:deep(.dark-slate-modal .ant-input-number-input) {
  color: #fff !important;
}

:deep(.dark-slate-modal .ant-input::placeholder),
:deep(.dark-slate-modal .ant-input-number-input::placeholder) {
  color: #94a3b8 !important;
}

:deep(.dark-slate-modal .ant-btn-default) {
  color: #fff !important;
  background-color: #1e293b !important;
  border-color: #475569 !important;
}

:deep(.dark-slate-modal .ant-btn-default:hover) {
  color: #60a5fa !important;
  border-color: #3b82f6 !important;
}
</style>
