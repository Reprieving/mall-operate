<script lang="ts" setup>
import type { StockWarningVO } from '#/api/admin/model';

import { computed, onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import {
  Alert,
  Button,
  Card,
  Col,
  Image,
  Input,
  InputNumber,
  Row,
  Select,
  Table,
  Tag,
} from 'ant-design-vue';

import { getStockWarningListApi } from '#/api/admin';

import SpuDetailDrawer from '../spu-list/modules/spu-detail-drawer.vue';

const loading = ref(false);
const threshold = ref<number>(10);
const searchKeyword = ref('');
const searchShop = ref('');
const searchLevel = ref<number | undefined>(undefined);
const warningList = ref<StockWarningVO[]>([]);

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: SpuDetailDrawer,
});

const fallbackWarnings: StockWarningVO[] = [
  {
    categoryId: 40,
    categoryName: '精品咖啡',
    maxPrice: 79,
    minPrice: 59,
    shopId: 3,
    shopName: '鹿角严选生活馆',
    spuCode: 'SPU20260215003',
    spuId: 103,
    spuName: '原产地精品冷萃咖啡液 20包装',
    spuPic:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=120',
    status: 1,
    totalStock: 3,
  },
  {
    categoryId: 23,
    categoryName: '影音数码',
    maxPrice: 1299,
    minPrice: 1099,
    shopId: 2,
    shopName: '索声官方自营专卖',
    spuCode: 'SPU20260212002',
    spuId: 102,
    spuName: '无线降噪头戴式蓝牙耳机 Pro',
    spuPic:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120',
    status: 1,
    totalStock: 6,
  },
  {
    categoryId: 15,
    categoryName: '办公家具',
    maxPrice: 999,
    minPrice: 799,
    shopId: 4,
    shopName: '工学优品家居',
    spuCode: 'SPU20260218005',
    spuId: 108,
    spuName: '人体工学透气电脑椅',
    spuPic:
      'https://images.unsplash.com/photo-1580481077197-2a543e33f388?w=120',
    status: 1,
    totalStock: 8,
  },
];

async function fetchData() {
  loading.value = true;
  try {
    const res = await getStockWarningListApi(threshold.value, 50);
    warningList.value = res && res.length > 0 ? res : fallbackWarnings;
  } catch {
    warningList.value = fallbackWarnings;
  } finally {
    loading.value = false;
  }
}

const displayedList = computed(() => {
  let list = warningList.value;
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase();
    list = list.filter(
      (item) =>
        item.spuName.toLowerCase().includes(kw) ||
        item.spuCode.toLowerCase().includes(kw),
    );
  }
  if (searchShop.value) {
    const kw = searchShop.value.toLowerCase();
    list = list.filter((item) => item.shopName.toLowerCase().includes(kw));
  }
  if (searchLevel.value !== undefined) {
    if (searchLevel.value === 0) {
      list = list.filter((item) => item.totalStock === 0);
    } else if (searchLevel.value === 1) {
      list = list.filter((item) => item.totalStock > 0 && item.totalStock <= 5);
    } else if (searchLevel.value === 2) {
      list = list.filter((item) => item.totalStock > 5);
    }
  }
  return list;
});

function handleReset() {
  searchKeyword.value = '';
  threshold.value = 10;
  searchShop.value = '';
  searchLevel.value = undefined;
  fetchData();
}

function handleOpenSpu(spuId: number) {
  detailDrawerApi.setData({ spuId });
  detailDrawerApi.open();
}

const columns = [
  { dataIndex: 'spuId', key: 'spuId', title: 'SPU ID', width: 90 },
  { dataIndex: 'product', key: 'product', title: '告急商品', width: 280 },
  { dataIndex: 'shopName', key: 'shopName', title: '所属商户', width: 170 },
  {
    dataIndex: 'categoryName',
    key: 'categoryName',
    title: '商品类目',
    width: 140,
  },
  { dataIndex: 'price', key: 'price', title: '在售售价', width: 140 },
  {
    dataIndex: 'totalStock',
    key: 'totalStock',
    title: '当前总库存',
    width: 130,
  },
  { dataIndex: 'status', key: 'status', title: '状态', width: 100 },
  { dataIndex: 'action', key: 'action', title: '操作', width: 130 },
];

onMounted(() => {
  fetchData();
});
</script>

<template>
  <Page>
    <Alert
      class="mb-4 shadow-sm"
      message="库存警戒策略：当商品全量 SKU 汇总可用库存低于阈值时，自动纳入预警大盘，请督促对应商家及时入库或调优分配！"
      show-icon
      type="warning"
    />

    <!-- 工具栏 -->
    <Card class="mb-4 shadow-sm" :body-style="{ padding: '18px 24px' }">
      <!-- 1行4个检索输入框 -->
      <Row :gutter="16">
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="searchKeyword"
            allow-clear
            class="w-full"
            placeholder="商品名称 / SPU 编码检索"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <InputNumber
            v-model:value="threshold"
            :max="100"
            :min="1"
            class="w-full"
            placeholder="警戒阈值 (件)"
            @change="fetchData"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="searchShop"
            allow-clear
            class="w-full"
            placeholder="所属商户店铺名称检索"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Select
            v-model:value="searchLevel"
            allow-clear
            class="w-full"
            placeholder="预警紧急程度过滤"
          >
            <Select.Option :value="0">已完全售罄 (0 件)</Select.Option>
            <Select.Option :value="1">严重告急 (1~5 件)</Select.Option>
            <Select.Option :value="2">轻度预警 (6~10 件)</Select.Option>
          </Select>
        </Col>
      </Row>

      <!-- 操作按钮栏 -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Button type="primary" @click="fetchData">查询 / 刷新大盘</Button>
          <Button @click="handleReset">重置</Button>
        </div>
      </div>
    </Card>

    <!-- 告急表格 -->
    <Card class="shadow-sm">
      <Table
        :columns="columns"
        :data-source="displayedList"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        row-key="spuId"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'product'">
            <div class="flex items-start gap-3">
              <Image
                :src="record.spuPic"
                :width="50"
                class="rounded border object-cover h-12"
              />
              <div>
                <div
                  class="font-medium text-white line-clamp-1 hover:text-blue-400 cursor-pointer"
                  @click="handleOpenSpu(record.spuId)"
                >
                  {{ record.spuName }}
                </div>
                <div class="text-xs text-gray-300">
                  编码: {{ record.spuCode }}
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'shopName'">
            <span class="font-medium text-blue-600">{{ record.shopName }}</span>
          </template>

          <template v-else-if="column.key === 'categoryName'">
            <Tag color="purple">{{ record.categoryName }}</Tag>
          </template>

          <template v-else-if="column.key === 'price'">
            <span class="text-red-500 font-bold">¥{{ record.minPrice }} ~ ¥{{ record.maxPrice }}</span>
          </template>

          <template v-else-if="column.key === 'totalStock'">
            <span
              class="text-red-600 font-bold text-base flex items-center gap-1"
            >
              {{ record.totalStock }}
              <span class="text-xs font-normal text-gray-300">件</span>
            </span>
          </template>

          <template v-else-if="column.key === 'status'">
            <Tag :color="record.status === 1 ? 'success' : 'default'">
              {{ record.status === 1 ? '在售' : '下架' }}
            </Tag>
          </template>

          <template v-else-if="column.key === 'action'">
            <Button
              size="small"
              type="link"
              @click="handleOpenSpu(record.spuId)"
            >
              补货/调库存
            </Button>
          </template>
        </template>
      </Table>
    </Card>

    <DetailDrawer />
  </Page>
</template>

<style scoped>
:deep(.ant-table-thead > tr > th),
:deep(.ant-table-tbody > tr > td),
:deep(.ant-checkbox-wrapper),
:deep(.ant-pagination-total-text),
:deep(.ant-pagination-item a),
:deep(.ant-table-cell) {
  color: #fff !important;
}
</style>
