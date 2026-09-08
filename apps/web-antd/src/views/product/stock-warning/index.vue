<script lang="ts" setup>
import type { StockWarningVO } from '#/api/admin/model';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import {
  Alert,
  Button,
  Card,
  Image,
  InputNumber,
  Table,
  Tag,
} from 'ant-design-vue';

import { getStockWarningListApi } from '#/api/admin';

import SpuDetailDrawer from '../spu-list/modules/spu-detail-drawer.vue';

const loading = ref(false);
const threshold = ref<number>(10);
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
  <Page
    description="筛选全平台总库存低于警戒阈值的在售商品，按库存升序排查并及时预警补货"
    title="库存告急预警大盘"
  >
    <Alert
      class="mb-4 shadow-sm"
      message="库存警戒策略：当商品全量 SKU 汇总可用库存低于阈值时，自动纳入预警大盘，请督促对应商家及时入库或调优分配！"
      show-icon
      type="warning"
    />

    <!-- 工具栏 -->
    <Card class="mb-4 shadow-sm" :body-style="{ padding: '16px 24px' }">
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-700">库存警戒阈值 (件)：</span>
        <InputNumber
          v-model:value="threshold"
          :max="100"
          :min="1"
          class="w-32"
          @change="fetchData"
        />
        <Button type="primary" @click="fetchData">刷新大盘</Button>
      </div>
    </Card>

    <!-- 告急表格 -->
    <Card class="shadow-sm">
      <Table
        :columns="columns"
        :data-source="warningList"
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
                  class="font-medium text-gray-800 line-clamp-1 hover:text-blue-600 cursor-pointer"
                  @click="handleOpenSpu(record.spuId)"
                >
                  {{ record.spuName }}
                </div>
                <div class="text-xs text-gray-400">
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
              <span class="text-xs font-normal text-gray-500">件</span>
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
