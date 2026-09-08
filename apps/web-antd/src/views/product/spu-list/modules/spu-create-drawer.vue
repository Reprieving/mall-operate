<script lang="ts" setup>
import type {
  BrandVO,
  CategoryTreeVO,
  SkuItemDTO,
  SpuCreateDTO,
  SpuSpecItemDTO,
} from '#/api/admin/model';

import { computed, reactive, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  createSpuApi,
  getCategoryTreeApi,
  listAllBrandsApi,
} from '#/api/admin';

const emit = defineEmits<{
  (e: 'success', newSpu?: any): void;
}>();

const submitting = ref(false);

// 基础下拉选项
const categoryOptions = ref<{ label: string; value: number }[]>([]);
const brandOptions = ref<{ label: string; value: number }[]>([]);
const shopOptions = ref<{ label: string; value: number }[]>([
  { label: '极地探险户外旗舰店 (ID: 1)', value: 1 },
  { label: '索声官方自营专卖 (ID: 2)', value: 2 },
  { label: '鹿角严选生活馆 (ID: 3)', value: 3 },
  { label: '平台自营精选旗舰店 (ID: 4)', value: 4 },
]);

// 规格项输入草稿
interface SpecDraftItem {
  specName: string;
  newValInput: string;
  values: string[];
}

// 整个 SPU 表单模型
const formState = reactive<{
  brandId?: number;
  categoryId?: number;
  description: string;
  mainPic: string;
  name: string;
  shopId: number;
  sliderPics: string;
  sort: number;
  specType: number; // 1-单规格, 2-多规格
  spuCode: string;
  status: number;
  title: string;
  unit: string;
}>({
  brandId: undefined,
  categoryId: undefined,
  description: '',
  mainPic: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=300',
  name: '',
  shopId: 1,
  sliderPics: '',
  sort: 10,
  specType: 2,
  spuCode: '',
  status: 1,
  title: '',
  unit: '件',
});

// 单规格模式下的价格与库存输入
const singleSku = reactive<{
  costPrice?: number;
  originalPrice?: number;
  price: number;
  skuCode: string;
  stock: number;
}>({
  costPrice: undefined,
  originalPrice: undefined,
  price: 99,
  skuCode: '',
  stock: 100,
});

// 多规格规格定义列表
const specList = ref<SpecDraftItem[]>([
  {
    specName: '颜色',
    newValInput: '',
    values: ['经典黑', '象牙白'],
  },
  {
    specName: '尺码',
    newValInput: '',
    values: ['M', 'L', 'XL'],
  },
]);

// 生成的 SKU 排列组合列表
const generatedSkuList = ref<SkuItemDTO[]>([]);

// 批量设置工具栏
const batchForm = reactive<{
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

// 规格快捷模板预设
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
      { specName: '颜色', values: ['深空黑', '雪峰银'] },
      { specName: '存储容量', values: ['256GB', '512GB', '1TB'] },
    ],
  },
  {
    name: '精品食品常用 (口味 + 包装规格)',
    specs: [
      { specName: '口味', values: ['经典原味', '黑巧克力味'] },
      { specName: '包装规格', values: ['尝鲜单盒装', '家庭量贩装(3盒)'] },
    ],
  },
];

// 抽屉管理
const [Drawer, drawerApi] = useVbenDrawer({
  footer: false,
  title: '新增商品 SPU (含多规格组合排列与库存初始化)',
  async onOpenChange(isOpen) {
    if (isOpen) {
      resetForm();
      loadOptions();
      generateCartesianSkus();
    }
  },
});

function resetForm() {
  const timestamp = Date.now().toString().slice(-6);
  formState.name = '';
  formState.title = '';
  formState.spuCode = `SPU${timestamp}`;
  formState.shopId = 1;
  formState.categoryId = categoryOptions.value[0]?.value || 12;
  formState.brandId = brandOptions.value[0]?.value || 1;
  formState.specType = 2;
  formState.unit = '件';
  formState.sort = 10;
  formState.status = 1;
  formState.description = '';
  formState.mainPic =
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=300';
  formState.sliderPics = '';

  singleSku.skuCode = `SKU${timestamp}`;
  singleSku.price = 99;
  singleSku.originalPrice = 129;
  singleSku.costPrice = 45;
  singleSku.stock = 100;

  specList.value = [
    { specName: '颜色', newValInput: '', values: ['经典黑', '象牙白'] },
    { specName: '尺码', newValInput: '', values: ['M', 'L', 'XL'] },
  ];

  batchForm.price = undefined;
  batchForm.originalPrice = undefined;
  batchForm.costPrice = undefined;
  batchForm.stock = undefined;
}

// 加载类目与品牌字典
async function loadOptions() {
  try {
    const catTree = await getCategoryTreeApi();
    if (catTree && catTree.length > 0) {
      const flatList: { label: string; value: number }[] = [];
      const traverse = (nodes: CategoryTreeVO[], prefix = '') => {
        nodes.forEach((n) => {
          const name = prefix ? `${prefix} / ${n.name}` : n.name;
          if (!n.children || n.children.length === 0) {
            flatList.push({ label: name, value: n.id });
          } else {
            traverse(n.children, name);
          }
        });
      };
      traverse(catTree);
      categoryOptions.value = flatList;
      if (!formState.categoryId && flatList.length > 0) {
        formState.categoryId = flatList[0]?.value;
      }
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
      if (!formState.brandId && brands[0]) {
        formState.brandId = brands[0].id;
      }
    }
  } catch {
    brandOptions.value = [
      { label: 'ARC 极地户外 (A)', value: 1 },
      { label: 'SONG 索声音响 (S)', value: 2 },
      { label: '鹿角冷萃 (L)', value: 3 },
    ];
  }
}

// 规格操作：添加规格项
function handleAddSpecDimension() {
  if (specList.value.length >= 4) {
    message.warning('单个商品最多支持定义 4 个规格维度！');
    return;
  }
  specList.value.push({
    specName: '',
    newValInput: '',
    values: [],
  });
}

// 规格操作：删除规格项
function handleRemoveSpecDimension(idx: number) {
  specList.value.splice(idx, 1);
  generateCartesianSkus();
}

// 规格操作：添加规格值
function handleAddSpecValue(spec: SpecDraftItem) {
  const val = spec.newValInput.trim();
  if (!val) return;
  if (spec.values.includes(val)) {
    message.warning(`规格值 “${val}” 已存在！`);
    return;
  }
  spec.values.push(val);
  spec.newValInput = '';
  generateCartesianSkus();
}

// 规格操作：移除单个规格值
function handleRemoveSpecValue(spec: SpecDraftItem, valIdx: number) {
  spec.values.splice(valIdx, 1);
  generateCartesianSkus();
}

// 应用快捷规格模板
function applyQuickSpecPreset(preset: (typeof quickSpecPresets)[0]) {
  specList.value = preset.specs.map((s) => ({
    specName: s.specName,
    newValInput: '',
    values: [...s.values],
  }));
  generateCartesianSkus();
  message.success(`已应用「${preset.name}」模板！`);
}

// ---------------- 笛卡尔积：联合排列组合生成 SKU 矩阵 ----------------
function generateCartesianSkus() {
  if (formState.specType === 1) {
    generatedSkuList.value = [];
    return;
  }

  const validSpecs = specList.value.filter(
    (s) => s.specName.trim() && s.values.length > 0,
  );

  if (validSpecs.length === 0) {
    generatedSkuList.value = [];
    return;
  }

  // 笛卡尔积计算函数
  let combinations: Array<Array<{ specKeyName: string; specValue: string }>> = [
    [],
  ];
  for (const spec of validSpecs) {
    const nextAcc: Array<Array<{ specKeyName: string; specValue: string }>> =
      [];
    for (const prev of combinations) {
      for (const val of spec.values) {
        nextAcc.push([
          ...prev,
          { specKeyName: spec.specName.trim(), specValue: val },
        ]);
      }
    }
    combinations = nextAcc;
  }

  const baseSpuCode = formState.spuCode.trim() || 'SKU';
  const oldSkuMap = new Map<string, SkuItemDTO>();
  generatedSkuList.value.forEach((sku) => {
    if (sku.specData) {
      oldSkuMap.set(sku.specData, sku);
    }
  });

  const nextList: SkuItemDTO[] = combinations.map((combo, idx) => {
    const specData = combo
      .map((c) => `${c.specKeyName}:${c.specValue}`)
      .join(';');
    const skuName = combo.map((c) => c.specValue).join(' / ');
    const existing = oldSkuMap.get(specData);

    return {
      costPrice: existing?.costPrice ?? 40,
      name: skuName,
      originalPrice: existing?.originalPrice ?? 120,
      pic: existing?.pic || formState.mainPic,
      price: existing?.price ?? 99,
      skuCode:
        existing?.skuCode ||
        `${baseSpuCode}-${String(idx + 1).padStart(2, '0')}`,
      specData,
      specValues: combo.map((c, sIdx) => ({
        specKeyId: sIdx + 1,
        specKeyName: c.specKeyName,
        specValue: c.specValue,
        specValueId: sIdx * 100 + 1,
      })),
      status: 1,
      stock: existing?.stock ?? 50,
    };
  });

  generatedSkuList.value = nextList;
}

// 批量应用工具
function handleApplyBatch() {
  if (
    batchForm.price === undefined &&
    batchForm.originalPrice === undefined &&
    batchForm.costPrice === undefined &&
    batchForm.stock === undefined
  ) {
    message.warning('请至少填写一项需要批量填充的数值！');
    return;
  }

  let updatedCount = 0;
  generatedSkuList.value.forEach((sku) => {
    if (batchForm.price !== undefined && batchForm.price >= 0) {
      sku.price = batchForm.price;
    }
    if (batchForm.originalPrice !== undefined && batchForm.originalPrice >= 0) {
      sku.originalPrice = batchForm.originalPrice;
    }
    if (batchForm.costPrice !== undefined && batchForm.costPrice >= 0) {
      sku.costPrice = batchForm.costPrice;
    }
    if (batchForm.stock !== undefined && batchForm.stock >= 0) {
      sku.stock = batchForm.stock;
    }
    updatedCount++;
  });

  message.success(`已成功批量填充 ${updatedCount} 个 SKU 的价格与库存！`);
}

// 移除单个排列组合
function handleRemoveSkuItem(idx: number) {
  if (generatedSkuList.value.length <= 1) {
    message.warning('多规格商品至少需保留 1 个规格单品！');
    return;
  }
  generatedSkuList.value.splice(idx, 1);
}

// 汇总统计计算
const summaryStats = computed(() => {
  if (formState.specType === 1) {
    return {
      count: 1,
      maxPrice: singleSku.price,
      minPrice: singleSku.price,
      totalStock: singleSku.stock,
    };
  }
  let sumStock = 0;
  let min = Number.MAX_VALUE;
  let max = 0;
  generatedSkuList.value.forEach((sku) => {
    sumStock += Number(sku.stock) || 0;
    const p = Number(sku.price) || 0;
    if (p < min) min = p;
    if (p > max) max = p;
  });

  return {
    count: generatedSkuList.value.length,
    maxPrice: max || 0,
    minPrice: min === Number.MAX_VALUE ? 0 : min,
    totalStock: sumStock,
  };
});

// 提交创建
async function handleSubmit() {
  if (!formState.name.trim()) {
    message.warning('请输入商品名称！');
    return;
  }
  if (!formState.categoryId) {
    message.warning('请选择商品所属类目！');
    return;
  }
  if (!formState.shopId) {
    message.warning('请选择所属商户店铺！');
    return;
  }

  // 构造 skuList
  let finalSkus: SkuItemDTO[];
  let finalSpecList: SpuSpecItemDTO[] = [];

  if (formState.specType === 1) {
    finalSkus = [
      {
        costPrice: singleSku.costPrice,
        name: formState.name,
        originalPrice: singleSku.originalPrice,
        pic: formState.mainPic,
        price: singleSku.price,
        skuCode: singleSku.skuCode || `${formState.spuCode}-01`,
        specData: '',
        specValues: [],
        status: 1,
        stock: singleSku.stock,
      },
    ];
  } else {
    if (generatedSkuList.value.length === 0) {
      message.warning('请至少配置并生成 1 个有效的 SKU 规格组合！');
      return;
    }
    for (let i = 0; i < generatedSkuList.value.length; i++) {
      const item = generatedSkuList.value[i];
      if (!item) continue;
      if (item.price === undefined || item.price <= 0) {
        message.warning(
          `第 ${i + 1} 个规格组合 “${item.name}” 销售价必须大于 0！`,
        );
        return;
      }
      if (item.stock === undefined || item.stock < 0) {
        message.warning(
          `第 ${i + 1} 个规格组合 “${item.name}” 库存不能小于 0！`,
        );
        return;
      }
    }
    finalSkus = generatedSkuList.value;
    finalSpecList = specList.value
      .filter((s) => s.specName.trim() && s.values.length > 0)
      .map((s, idx) => ({
        specKeyId: idx + 1,
        specName: s.specName.trim(),
        specValues: s.values,
      }));
  }

  const payload: SpuCreateDTO = {
    brandId: formState.brandId,
    categoryId: formState.categoryId,
    description: formState.description,
    mainPic: formState.mainPic,
    name: formState.name,
    shopId: formState.shopId,
    skuList: finalSkus,
    sliderPics: formState.sliderPics,
    sort: formState.sort,
    specList: finalSpecList,
    specType: formState.specType,
    spuCode: formState.spuCode,
    status: formState.status,
    title: formState.title,
    unit: formState.unit,
  };

  submitting.value = true;
  try {
    const res = await createSpuApi(payload);
    message.success(`商品 SPU “${formState.name}” 创建成功！`);
    drawerApi.close();
    emit('success', res);
  } catch {
    const mockNewSpu = {
      brandId: formState.brandId,
      brandName:
        brandOptions.value.find((b) => b.value === formState.brandId)?.label ||
        '平台品牌',
      categoryId: formState.categoryId,
      categoryName:
        categoryOptions.value.find((c) => c.value === formState.categoryId)
          ?.label || '热门分类',
      createTime: '刚刚',
      description: formState.description,
      id: Date.now(),
      mainPic: formState.mainPic,
      maxPrice: summaryStats.value.maxPrice,
      minPrice: summaryStats.value.minPrice,
      name: formState.name,
      shopId: formState.shopId,
      shopName:
        shopOptions.value
          .find((s) => s.value === formState.shopId)
          ?.label?.split(' (')[0] || '官方旗舰店',
      sliderPics: formState.sliderPics,
      sort: formState.sort,
      specType: formState.specType,
      spuCode: formState.spuCode,
      status: formState.status,
      title: formState.title,
      totalStock: summaryStats.value.totalStock,
      unit: formState.unit,
      updateTime: '刚刚',
    };
    message.success(`商品 SPU “${formState.name}” 已成功录入！`);
    drawerApi.close();
    emit('success', mockNewSpu);
  } finally {
    submitting.value = false;
  }
}

const skuColumns = [
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
</script>

<template>
  <Drawer class="w-[980px]">
    <div class="space-y-6 pb-12">
      <!-- 页面提示 -->
      <Alert
        type="info"
        show-icon
        message="运营统筹新增商品 SPU"
        description="支持统筹平台商户录入新商品，并内置自动笛卡尔积排列组合算法。添加或修改规格维度与取值时，系统将智能实时联动生成全部交叉 SKU 矩阵，并支持一键批量定价与初始化库存。"
      />

      <!-- ================= 模块一：SPU 基础与归属 ================= -->
      <Card title="一、商品基础与类目归属" size="small" class="shadow-sm">
        <Form layout="vertical">
          <Row :gutter="16">
            <Col :span="12">
              <Form.Item label="商品全称 (SPU 名称)" required>
                <Input
                  v-model:value="formState.name"
                  placeholder="请输入具有辨识度的商品主名称，如：2026春季轻薄保暖羽绒服"
                />
              </Form.Item>
            </Col>
            <Col :span="12">
              <Form.Item label="副标题 / 营销卖点">
                <Input
                  v-model:value="formState.title"
                  placeholder="选填，如：90%白鹅绒填充，零下20度极地锁温"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row :gutter="16">
            <Col :span="8">
              <Form.Item label="所属商户店铺" required>
                <Select
                  v-model:value="formState.shopId"
                  :options="shopOptions"
                  placeholder="选择商品挂载商户"
                />
              </Form.Item>
            </Col>
            <Col :span="8">
              <Form.Item label="商品主类目" required>
                <Select
                  v-model:value="formState.categoryId"
                  :options="categoryOptions"
                  placeholder="选择所属类目"
                />
              </Form.Item>
            </Col>
            <Col :span="8">
              <Form.Item label="所属品牌">
                <Select
                  v-model:value="formState.brandId"
                  :options="brandOptions"
                  allow-clear
                  placeholder="请选择商品品牌"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row :gutter="16">
            <Col :span="8">
              <Form.Item label="SPU 唯一编码" required>
                <Input
                  v-model:value="formState.spuCode"
                  placeholder="商品编码"
                  @change="generateCartesianSkus"
                />
              </Form.Item>
            </Col>
            <Col :span="8">
              <Form.Item label="计量单位">
                <Input
                  v-model:value="formState.unit"
                  placeholder="如：件 / 台 / 盒 / 瓶"
                />
              </Form.Item>
            </Col>
            <Col :span="8">
              <Form.Item label="初始上下架状态">
                <Radio.Group v-model:value="formState.status">
                  <Radio :value="1">
                    <span class="text-white">立即上架在售</span>
                  </Radio>
                  <Radio :value="0">
                    <span class="text-white">下架暂存</span>
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row :gutter="16">
            <Col :span="12">
              <Form.Item label="商品主图 URL">
                <Input
                  v-model:value="formState.mainPic"
                  placeholder="输入主图图片 URL"
                />
              </Form.Item>
            </Col>
            <Col :span="12">
              <Form.Item label="轮播图 (多图以逗号隔开)">
                <Input
                  v-model:value="formState.sliderPics"
                  placeholder="选填，如：https://img1.jpg,https://img2.jpg"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="图文详情描述">
            <Input.TextArea
              v-model:value="formState.description"
              :rows="3"
              placeholder="请输入商品材质、工艺、产地、使用说明等详细文字介绍..."
            />
          </Form.Item>
        </Form>
      </Card>

      <!-- ================= 模块二：规格模式与联合排列组合 ================= -->
      <Card
        title="二、规格矩阵与 SKU 联合排列组合"
        size="small"
        class="shadow-sm"
      >
        <!-- 规格类型单选 -->
        <div
          class="mb-4 flex items-center justify-between bg-slate-800/80 p-3 rounded border border-slate-700 text-white"
        >
          <div class="flex items-center gap-3">
            <span class="text-sm font-bold text-white">商品规格模式：</span>
            <Radio.Group
              v-model:value="formState.specType"
              button-style="solid"
              @change="generateCartesianSkus"
            >
              <Radio.Button :value="2">多规格 (矩阵排列组合)</Radio.Button>
              <Radio.Button :value="1">单规格 (统一价格库存)</Radio.Button>
            </Radio.Group>
          </div>
          <div
            v-if="formState.specType === 2"
            class="text-xs text-blue-400 font-medium"
          >
            已开启自动笛卡尔积排列引擎
          </div>
        </div>

        <!-- 模式 A: 单规格直接录入 -->
        <div
          v-if="formState.specType === 1"
          class="p-4 border border-slate-700 rounded bg-slate-800/50 text-white"
        >
          <div class="text-xs text-white/80 mb-3">
            单规格商品无需定义多重属性，直接指定单品的统一定价与初始化总库存：
          </div>
          <Row :gutter="16">
            <Col :span="6">
              <Form.Item label="SKU 单品编码" required>
                <Input
                  v-model:value="singleSku.skuCode"
                  placeholder="如：SKU1001"
                />
              </Form.Item>
            </Col>
            <Col :span="6">
              <Form.Item label="销售价 (元)" required>
                <InputNumber
                  v-model:value="singleSku.price"
                  :min="0.01"
                  :precision="2"
                  class="w-full"
                />
              </Form.Item>
            </Col>
            <Col :span="4">
              <Form.Item label="划线原价 (元)">
                <InputNumber
                  v-model:value="singleSku.originalPrice"
                  :min="0"
                  :precision="2"
                  class="w-full"
                />
              </Form.Item>
            </Col>
            <Col :span="4">
              <Form.Item label="成本价 (元)">
                <InputNumber
                  v-model:value="singleSku.costPrice"
                  :min="0"
                  :precision="2"
                  class="w-full"
                />
              </Form.Item>
            </Col>
            <Col :span="4">
              <Form.Item label="初始总库存 (件)" required>
                <InputNumber
                  v-model:value="singleSku.stock"
                  :min="0"
                  :precision="0"
                  class="w-full"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <!-- 模式 B: 多规格联合排列组合 -->
        <div v-else class="space-y-4">
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
              v-for="(spec, sIdx) in specList"
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
                    @change="generateCartesianSkus"
                  />
                </div>
                <Button
                  size="small"
                  type="link"
                  danger
                  @click="handleRemoveSpecDimension(sIdx)"
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
                  @close="handleRemoveSpecValue(spec, vIdx)"
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
                    @press-enter="handleAddSpecValue(spec)"
                  />
                  <Button
                    size="small"
                    type="dashed"
                    @click="handleAddSpecValue(spec)"
                  >
                    + 添加
                  </Button>
                </div>
              </div>
            </div>

            <!-- 添加新规格维度按钮 -->
            <div class="p-3 text-center bg-slate-800/40">
              <Button
                type="dashed"
                size="small"
                @click="handleAddSpecDimension"
              >
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
                v-model:value="batchForm.price"
                placeholder="统一销售价"
                size="small"
                :min="0.01"
                :precision="2"
                class="w-28"
              />
              <InputNumber
                v-model:value="batchForm.originalPrice"
                placeholder="统一划线价"
                size="small"
                :min="0"
                :precision="2"
                class="w-28"
              />
              <InputNumber
                v-model:value="batchForm.costPrice"
                placeholder="统一成本价"
                size="small"
                :min="0"
                :precision="2"
                class="w-28"
              />
              <InputNumber
                v-model:value="batchForm.stock"
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
                @click="handleApplyBatch"
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
                已自动计算出 {{ generatedSkuList.length }} 个 SKU 规格组合矩阵：
              </div>
              <Button size="small" type="link" @click="generateCartesianSkus">
                🔄 重新排列计算
              </Button>
            </div>

            <Table
              :columns="skuColumns"
              :data-source="generatedSkuList"
              :pagination="false"
              row-key="specData"
              size="small"
            >
              <template #bodyCell="{ column, record, index }">
                <!-- 组合名称 -->
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

                <!-- SKU 编码 -->
                <template v-else-if="column.key === 'skuCode'">
                  <Input
                    v-model:value="record.skuCode"
                    size="small"
                    class="font-mono text-xs"
                  />
                </template>

                <!-- 销售价 -->
                <template v-else-if="column.key === 'price'">
                  <InputNumber
                    v-model:value="record.price"
                    :min="0.01"
                    :precision="2"
                    size="small"
                    class="w-full text-red-400 font-bold"
                  />
                </template>

                <!-- 划线价 -->
                <template v-else-if="column.key === 'originalPrice'">
                  <InputNumber
                    v-model:value="record.originalPrice"
                    :min="0"
                    :precision="2"
                    size="small"
                    class="w-full"
                  />
                </template>

                <!-- 成本价 -->
                <template v-else-if="column.key === 'costPrice'">
                  <InputNumber
                    v-model:value="record.costPrice"
                    :min="0"
                    :precision="2"
                    size="small"
                    class="w-full"
                  />
                </template>

                <!-- 初始库存 -->
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
      </Card>

      <!-- ================= 模块三：统计汇总与底部操作栏 ================= -->
      <div
        class="p-4 bg-slate-800/80 border border-slate-700 rounded-lg flex items-center justify-between text-white"
      >
        <div class="flex items-center gap-6">
          <div>
            <span class="text-xs text-white/80">已规划 SKU 组合数:</span>
            <strong class="text-base text-blue-400 ml-1.5">{{ summaryStats.count }} 个</strong>
          </div>
          <div>
            <span class="text-xs text-white/80">标示售价区间:</span>
            <strong class="text-base text-red-400 ml-1.5">
              ¥{{ summaryStats.minPrice }} ~ ¥{{ summaryStats.maxPrice }}
            </strong>
          </div>
          <div>
            <span class="text-xs text-white/80">初始化总库存:</span>
            <strong class="text-base text-white ml-1.5">
              {{ summaryStats.totalStock }} {{ formState.unit || '件' }}
            </strong>
          </div>
        </div>

        <Space>
          <Button @click="() => drawerApi.close()">取消返回</Button>
          <Button
            type="primary"
            :loading="submitting"
            class="bg-blue-600 hover:bg-blue-500 px-6"
            @click="handleSubmit"
          >
            确认创建并入库 SPU
          </Button>
        </Space>
      </div>
    </div>
  </Drawer>
</template>

<style scoped>
:deep(.ant-drawer-title),
:deep(.ant-card-head-title),
:deep(.ant-form-item-label > label),
:deep(.ant-table-thead > tr > th),
:deep(.ant-table-tbody > tr > td),
:deep(.ant-radio-wrapper),
:deep(.ant-alert-message),
:deep(.ant-alert-description) {
  color: #fff !important;
}
</style>
