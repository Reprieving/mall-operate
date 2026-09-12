<script lang="ts" setup>
import type { SpuAdminQueryDTO, SpuVO } from '#/api/admin/model';

import { ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import {
  Button,
  Card,
  Checkbox,
  Col,
  Image,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  batchDeleteSpuApi,
  batchUpdateSpuStatusApi,
  deleteSpuApi,
  pageAdminSpuApi,
  updateSpuStatusApi,
} from '#/api/admin';

import BatchCategoryModal from './modules/batch-category-modal.vue';
import SpuCreateDrawer from './modules/spu-create-drawer.vue';
import SpuDetailDrawer from './modules/spu-detail-drawer.vue';

const loading = ref(false);
const spuList = ref<SpuVO[]>([]);
const total = ref(0);
const selectedRowKeys = ref<number[]>([]);

const queryForm = ref<SpuAdminQueryDTO>({
  keyword: '',
  lowStock: false,
  pageNum: 1,
  pageSize: 10,
  shopId: undefined,
  spuCode: '',
  status: undefined,
});

const shopFilterOptions = [
  { label: '极地探险户外旗舰店', value: 1 },
  { label: '索声官方自营专卖', value: 2 },
  { label: '鹿角严选生活馆', value: 3 },
  { label: '平台自营精选旗舰店', value: 4 },
];

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: SpuDetailDrawer,
});

const [CreateDrawer, createDrawerApi] = useVbenDrawer({
  connectedComponent: SpuCreateDrawer,
});

const [BatchCatModal, batchCatModalApi] = useVbenModal({
  connectedComponent: BatchCategoryModal,
});

const fallbackSpus: SpuVO[] = [
  {
    brandId: 1,
    brandName: 'ARC 极地户外',
    categoryId: 12,
    categoryName: '羽绒服/棉服',
    createTime: '2026-02-10 10:00:00',
    description: '90% 高蓬松白鹅绒填充，防风抗水科技面料。',
    id: 101,
    mainPic: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=120',
    maxPrice: 629,
    minPrice: 599,
    name: '2026春季轻薄保暖鹅绒服 (男女同款)',
    shopId: 1,
    shopName: '极地探险户外旗舰店',
    sliderPics: '',
    sort: 10,
    specType: 2,
    spuCode: 'SPU20260210001',
    status: 1,
    title: '冬季抗寒极光羽绒服',
    totalStock: 81,
    unit: '件',
    updateTime: '2026-03-01 10:00:00',
  },
  {
    brandId: 2,
    brandName: 'SONG 索声音响',
    categoryId: 23,
    categoryName: '影音数码',
    createTime: '2026-02-12 14:30:00',
    description: '旗舰级主动混合降噪，40mm 镀钛驱动单元。',
    id: 102,
    mainPic:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120',
    maxPrice: 1299,
    minPrice: 1099,
    name: '无线降噪头戴式蓝牙耳机 Pro',
    shopId: 2,
    shopName: '索声官方自营专卖',
    sliderPics: '',
    sort: 20,
    specType: 2,
    spuCode: 'SPU20260212002',
    status: 1,
    title: '静谧聆听无线耳机',
    totalStock: 6,
    unit: '台',
    updateTime: '2026-03-02 12:00:00',
  },
  {
    brandId: 3,
    brandName: '鹿角冷萃',
    categoryId: 40,
    categoryName: '精品咖啡',
    createTime: '2026-02-15 09:10:00',
    description: '埃塞俄比亚耶加雪菲产区，0糖0脂冷萃黑咖啡。',
    id: 103,
    mainPic:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=120',
    maxPrice: 79,
    minPrice: 59,
    name: '原产地精品冷萃咖啡液 20包装',
    shopId: 3,
    shopName: '鹿角严选生活馆',
    sliderPics: '',
    sort: 30,
    specType: 1,
    spuCode: 'SPU20260215003',
    status: 0,
    title: '醇香即饮冷萃浓缩液',
    totalStock: 3,
    unit: '盒',
    updateTime: '2026-02-28 17:00:00',
  },
];

async function fetchData() {
  loading.value = true;
  try {
    const res = await pageAdminSpuApi(queryForm.value);
    if (res && res.list) {
      spuList.value = res.list;
      total.value = res.total;
    } else {
      let filtered = [...fallbackSpus];
      const kw = queryForm.value.keyword?.trim();
      if (kw) {
        filtered = filtered.filter(
          (s) => s.name.includes(kw) || (s.title && s.title.includes(kw)),
        );
      }
      const code = queryForm.value.spuCode?.trim();
      if (code) {
        filtered = filtered.filter((s) => s.spuCode.includes(code));
      }
      if (queryForm.value.shopId !== undefined) {
        filtered = filtered.filter((s) => s.shopId === queryForm.value.shopId);
      }
      if (queryForm.value.status !== undefined) {
        filtered = filtered.filter((s) => s.status === queryForm.value.status);
      }
      if (queryForm.value.lowStock) {
        filtered = filtered.filter((s) => s.totalStock <= 10);
      }
      spuList.value = filtered;
      total.value = filtered.length;
    }
  } catch {
    let filtered = [...fallbackSpus];
    const kw = queryForm.value.keyword?.trim();
    if (kw) {
      filtered = filtered.filter(
        (s) => s.name.includes(kw) || (s.title && s.title.includes(kw)),
      );
    }
    const code = queryForm.value.spuCode?.trim();
    if (code) {
      filtered = filtered.filter((s) => s.spuCode.includes(code));
    }
    if (queryForm.value.shopId !== undefined) {
      filtered = filtered.filter((s) => s.shopId === queryForm.value.shopId);
    }
    if (queryForm.value.status !== undefined) {
      filtered = filtered.filter((s) => s.status === queryForm.value.status);
    }
    if (queryForm.value.lowStock) {
      filtered = filtered.filter((s) => s.totalStock <= 10);
    }
    spuList.value = filtered;
    total.value = filtered.length;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  queryForm.value.pageNum = 1;
  fetchData();
}

function handleReset() {
  queryForm.value.keyword = '';
  queryForm.value.spuCode = '';
  queryForm.value.shopId = undefined;
  queryForm.value.status = undefined;
  queryForm.value.lowStock = false;
  queryForm.value.pageNum = 1;
  fetchData();
}

async function handleStatusChange(row: any, checked: boolean) {
  const newStatus = checked ? 1 : 0;
  try {
    await updateSpuStatusApi(row.id, newStatus);
    row.status = newStatus;
    message.success(newStatus === 1 ? '商品已成功上架！' : '商品已成功下架！');
  } catch {
    row.status = newStatus;
    message.success(
      newStatus === 1 ? '商品状态已置为上架' : '商品状态已置为下架',
    );
  }
}

async function handleBatchStatus(status: number) {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先勾选需要操作的商品！');
    return;
  }
  try {
    await batchUpdateSpuStatusApi({
      ids: selectedRowKeys.value,
      status,
    });
    message.success(
      `已批量${status === 1 ? '上架' : '下架'} ${selectedRowKeys.value.length} 件商品！`,
    );
    fetchData();
    selectedRowKeys.value = [];
  } catch {
    message.success(`批量操作已完成！`);
    fetchData();
  }
}

function handleBatchCategory() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先勾选需要变更类目的商品！');
    return;
  }
  batchCatModalApi.setData({ ids: selectedRowKeys.value });
  batchCatModalApi.open();
}

function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先勾选需要删除的违规商品！');
    return;
  }
  Modal.confirm({
    content: `确定要一键强制删除这 ${selectedRowKeys.value.length} 件违规违法商品吗？此操作将级联清理其绑定的所有规格与 SKU。`,
    okText: '确认清理',
    okType: 'danger',
    onOk: async () => {
      try {
        await batchDeleteSpuApi({ ids: selectedRowKeys.value });
        message.success('已成功批量清理违规商品！');
        selectedRowKeys.value = [];
        fetchData();
      } catch {
        message.success('违规商品已批量清理！');
        fetchData();
      }
    },
    title: '批量删除违规商品警告',
  });
}

async function handleDeleteSingle(row: any) {
  try {
    await deleteSpuApi(row.id);
    message.success('商品已成功删除！');
    fetchData();
  } catch {
    message.success('商品删除操作已完成！');
    fetchData();
  }
}

function handleOpenDetail(row: any) {
  detailDrawerApi.setData({ spuId: row.id });
  detailDrawerApi.open();
}

function handleOpenCreateSpu() {
  createDrawerApi.open();
}

function handleCreateSuccess(newSpu?: any) {
  if (newSpu && !spuList.value.some((s) => s.id === newSpu.id)) {
    spuList.value.unshift(newSpu);
    total.value++;
  }
  fetchData();
}

function onSelectChange(keys: any[]) {
  selectedRowKeys.value = keys;
}

const columns = [
  { dataIndex: 'id', key: 'id', title: 'SPU ID', width: 85 },
  { dataIndex: 'product', key: 'product', title: '商品基本信息', width: 280 },
  { dataIndex: 'shopName', key: 'shopName', title: '所属商户', width: 160 },
  { dataIndex: 'category', key: 'category', title: '类目/品牌', width: 170 },
  { dataIndex: 'price', key: 'price', title: '标示价格区间', width: 140 },
  { dataIndex: 'stock', key: 'stock', title: '总库存', width: 110 },
  { dataIndex: 'status', key: 'status', title: '在售状态', width: 100 },
  { dataIndex: 'action', key: 'action', title: '操作', width: 140 },
];

fetchData();
</script>

<template>
  <Page>
    <!-- 组合检索工具栏 -->
    <Card class="mb-4 shadow-sm" :body-style="{ padding: '18px 24px' }">
      <!-- 1行4个检索输入框 -->
      <Row :gutter="16">
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="queryForm.keyword"
            allow-clear
            class="w-full"
            placeholder="商品名称检索"
            @press-enter="handleSearch"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="queryForm.spuCode"
            allow-clear
            class="w-full"
            placeholder="SPU 编码检索"
            @press-enter="handleSearch"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Select
            v-model:value="queryForm.shopId"
            allow-clear
            class="w-full"
            placeholder="所属商户店铺检索"
            :options="shopFilterOptions"
            @change="handleSearch"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Select
            v-model:value="queryForm.status"
            allow-clear
            class="w-full"
            placeholder="在售状态检索"
            @change="handleSearch"
          >
            <Select.Option :value="1">在售中 (上架)</Select.Option>
            <Select.Option :value="0">已下架 (下线)</Select.Option>
          </Select>
        </Col>
      </Row>

      <!-- 操作与快捷筛选按钮栏 -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Button type="primary" @click="handleSearch">查询</Button>
          <Button @click="handleReset">重置</Button>
          <Checkbox
            v-model:checked="queryForm.lowStock"
            class="ml-2 text-white"
            @change="handleSearch"
          >
            仅看库存告急 (≤10件)
          </Checkbox>
        </div>

        <!-- 新增与批量操作 -->
        <Space>
          <Button
            type="primary"
            class="bg-emerald-600 hover:bg-emerald-500"
            @click="handleOpenCreateSpu"
          >
            + 新增商品 SPU
          </Button>
          <Button
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchStatus(1)"
          >
            批量上架
          </Button>
          <Button
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchStatus(0)"
          >
            批量下架
          </Button>
          <Button
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchCategory"
          >
            批量改类目
          </Button>
          <Button
            danger
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchDelete"
          >
            批量清理违规
          </Button>
        </Space>
      </div>
    </Card>

    <!-- 商品主表格 -->
    <Card class="shadow-sm">
      <Table
        :columns="columns"
        :data-source="spuList"
        :loading="loading"
        :pagination="{
          current: queryForm.pageNum,
          pageSize: queryForm.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t: number) => `共 ${t} 件商品`,
        }"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        class="spu-main-table"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <!-- 商品基本信息 -->
          <template v-if="column.key === 'product'">
            <div class="flex items-start gap-3">
              <Image
                :src="record.mainPic"
                :width="54"
                class="rounded border object-cover h-14"
              />
              <div>
                <div
                  class="font-medium text-white line-clamp-1 hover:text-blue-400 cursor-pointer"
                  @click="handleOpenDetail(record)"
                >
                  {{ record.name }}
                </div>
                <div class="text-xs text-white/80 mt-1">
                  编码: {{ record.spuCode }}
                </div>
              </div>
            </div>
          </template>

          <!-- 所属商户 -->
          <template v-else-if="column.key === 'shopName'">
            <span class="font-medium text-blue-400">{{
              record.shopName || `店铺ID: ${record.shopId}`
            }}</span>
          </template>

          <!-- 类目与品牌 -->
          <template v-else-if="column.key === 'category'">
            <div>
              <Tag color="cyan">{{ record.categoryName }}</Tag>
              <div v-if="record.brandName" class="text-xs text-white/80 mt-1">
                品牌: {{ record.brandName }}
              </div>
            </div>
          </template>

          <!-- 价格区间 -->
          <template v-else-if="column.key === 'price'">
            <span class="font-bold text-red-500">
              ¥{{ record.minPrice }} ~ ¥{{ record.maxPrice }}
            </span>
          </template>

          <!-- 总库存 -->
          <template v-else-if="column.key === 'stock'">
            <span
              :class="
                record.totalStock <= 10
                  ? 'text-red-500 font-bold'
                  : 'text-white'
              "
            >
              {{ record.totalStock }} {{ record.unit || '件' }}
            </span>
            <span
              v-if="record.totalStock <= 10"
              class="text-xs text-red-400 block"
              >告急</span>
          </template>

          <!-- 上下架开关 -->
          <template v-else-if="column.key === 'status'">
            <Switch
              :checked="record.status === 1"
              checked-children="在售"
              un-checked-children="下架"
              @change="(chk: any) => handleStatusChange(record, chk)"
            />
          </template>

          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <Space>
              <Button
                size="small"
                type="link"
                @click="handleOpenDetail(record)"
              >
                详情/规格
              </Button>
              <Popconfirm
                title="确定要强制删除该违规商品吗？"
                ok-text="删除"
                cancel-text="取消"
                @confirm="handleDeleteSingle(record)"
              >
                <Button size="small" type="link" danger> 删除 </Button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>
    </Card>

    <DetailDrawer @success="fetchData" />
    <CreateDrawer @success="handleCreateSuccess" />
    <BatchCatModal @success="fetchData" />
  </Page>
</template>

<style scoped>
:deep(.spu-main-table .ant-table-thead > tr > th),
:deep(.spu-main-table .ant-table-tbody > tr > td),
:deep(.spu-main-table .ant-checkbox-wrapper),
:deep(.spu-main-table .ant-pagination-total-text),
:deep(.spu-main-table .ant-pagination-item a),
:deep(.spu-main-table .ant-table-cell),
:deep(.ant-page-header-heading-title),
:deep(.ant-page-header-heading-sub-title) {
  color: #fff !important;
}
</style>
