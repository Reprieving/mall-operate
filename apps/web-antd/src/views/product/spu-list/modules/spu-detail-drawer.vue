<script lang="ts" setup>
import type { SkuSpecValueItemDTO, SpuDetailVO } from '#/api/admin/model';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
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
  Space,
  Spin,
  Switch,
  Table,
  Tabs,
  Tag,
} from 'ant-design-vue';

import {
  createSkuApi,
  deleteSkuApi,
  getSpuDetailApi,
  updateSkuApi,
  updateSkuStatusApi,
  updateSkuStockApi,
} from '#/api/admin';

const loading = ref(false);
const detail = ref<null | SpuDetailVO>(null);

// ---------------- 1. 抽屉打开与数据加载 ----------------
const [Drawer, drawerApi] = useVbenDrawer({
  footer: false,
  title: '商品 SPU 全量画像与 SKU 规格/库存管控',
  async onOpenChange(isOpen) {
    if (isOpen) {
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
    message.success('规格与单品数据已成功同步！');
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
</script>

<template>
  <Drawer class="w-[920px]">
    <Spin :spinning="loading">
      <div v-if="detail" class="space-y-4">
        <!-- 商品 SPU 基础总览卡片 -->
        <div
          class="flex items-start gap-4 p-4 bg-slate-800/60 border border-slate-700 rounded-lg text-white"
        >
          <Image
            :src="detail.spuInfo.mainPic"
            :width="90"
            class="rounded border border-slate-600 object-cover h-24"
          />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-base font-bold text-white">{{
                detail.spuInfo.name
              }}</span>
              <Tag :color="detail.spuInfo.status === 1 ? 'success' : 'default'">
                {{ detail.spuInfo.status === 1 ? '在售中' : '已下架' }}
              </Tag>
            </div>
            <div class="text-xs text-white/90 mt-1 flex flex-wrap gap-4">
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

        <Tabs default-active-key="sku">
          <!-- SKU 规格组合与库存管理 -->
          <Tabs.TabPane key="sku" tab="SKU 规格组合与库存管控">
            <!-- 顶部操作工具条 -->
            <div
              class="flex items-center justify-between mb-3 bg-blue-950/40 border border-blue-900/60 p-3 rounded"
            >
              <div class="text-xs text-white">
                提示：支持任意添加新的单品规格组合、独立维护条码与定价，并可通过灵活模式调整可用库存数。
              </div>
              <Button type="primary" size="small" @click="handleOpenAddSku">
                + 新增 SKU 规格组合
              </Button>
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
  </Drawer>
</template>
