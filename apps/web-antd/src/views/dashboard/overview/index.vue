<script lang="ts" setup>
import type {
  CategoryRatioVO,
  DashboardOverviewVO,
  DashboardTodosVO,
  DashboardTrendVO,
  TopProductVO,
} from '#/api/admin/model';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  Badge,
  Button,
  Card,
  Col,
  Progress,
  Radio,
  Row,
  Spin,
  Statistic,
} from 'ant-design-vue';

import {
  getCategoryRatioApi,
  getOverviewApi,
  getTodosApi,
  getTopProductsApi,
  getTrendApi,
} from '#/api/admin';

const router = useRouter();
const loading = ref(false);

const overviewData = ref<DashboardOverviewVO>({
  todayAov: 156.8,
  todayGmv: 42_860,
  todayNewUsers: 86,
  todayOrderCount: 273,
  todayPayAmount: 39_500,
  totalGmv: 1_589_000,
  totalOrders: 12_450,
  totalProducts: 852,
  totalShops: 46,
  totalUsers: 9820,
});

const todosData = ref<DashboardTodosVO>({
  lowStockProductCount: 6,
  pendingCertCount: 4,
  pendingDeliverCount: 18,
  pendingShopCount: 2,
});

const trendDays = ref<number>(7);
const trendData = ref<DashboardTrendVO>({
  dates: ['09-02', '09-03', '09-04', '09-05', '09-06', '09-07', '09-08'],
  gmvList: [28_000, 31_000, 35_000, 42_000, 39_000, 46_000, 42_860],
  orderCountList: [180, 210, 240, 280, 260, 310, 273],
});

const topProducts = ref<TopProductVO[]>([
  {
    salesAmount: 18_900,
    salesCount: 150,
    spuId: 101,
    spuName: '2026春季轻薄保暖鹅绒服 (男女同款)',
    spuPic:
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=120&h=120&fit=crop',
  },
  {
    salesAmount: 14_200,
    salesCount: 88,
    spuId: 102,
    spuName: '无线降噪头戴式蓝牙耳机 Pro',
    spuPic:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&h=120&fit=crop',
  },
  {
    salesAmount: 9600,
    salesCount: 320,
    spuId: 103,
    spuName: '原产地精品冷萃咖啡液 20包装',
    spuPic:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=120&h=120&fit=crop',
  },
  {
    salesAmount: 8200,
    salesCount: 45,
    spuId: 104,
    spuName: '人体工学透气网布电脑椅',
    spuPic:
      'https://images.unsplash.com/photo-1580481077197-2a543e33f388?w=120&h=120&fit=crop',
  },
  {
    salesAmount: 6500,
    salesCount: 110,
    spuId: 105,
    spuName: '复古陶瓷磨砂马克杯 (礼盒装)',
    spuPic:
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=120&h=120&fit=crop',
  },
]);

const categoryRatios = ref<CategoryRatioVO[]>([
  { categoryId: 1, categoryName: '服饰箱包', ratio: 38.5, salesAmount: 16_501 },
  { categoryId: 2, categoryName: '数码 3C', ratio: 27.2, salesAmount: 11_657 },
  { categoryId: 3, categoryName: '美妆个护', ratio: 16.8, salesAmount: 7200 },
  { categoryId: 4, categoryName: '食品生鲜', ratio: 12, salesAmount: 5143 },
  { categoryId: 5, categoryName: '家居生活', ratio: 5.5, salesAmount: 2359 },
]);

async function loadData() {
  loading.value = true;
  try {
    const [overview, todos, trend, top, cats] = await Promise.allSettled([
      getOverviewApi(),
      getTodosApi(),
      getTrendApi(trendDays.value),
      getTopProductsApi(10),
      getCategoryRatioApi(),
    ]);

    if (overview.status === 'fulfilled' && overview.value) {
      overviewData.value = overview.value;
    }
    if (todos.status === 'fulfilled' && todos.value) {
      todosData.value = todos.value;
    }
    if (trend.status === 'fulfilled' && trend.value) {
      trendData.value = trend.value;
    }
    if (top.status === 'fulfilled' && top.value && top.value.length > 0) {
      topProducts.value = top.value;
    }
    if (cats.status === 'fulfilled' && cats.value && cats.value.length > 0) {
      categoryRatios.value = cats.value;
    }
  } finally {
    loading.value = false;
  }
}

function handleDaysChange(e: any) {
  trendDays.value = e.target.value;
  getTrendApi(trendDays.value)
    .then((res) => {
      if (res) trendData.value = res;
    })
    .catch(() => {});
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <Page
    description="全平台跨店铺核心运营监控指标、待办事务调度及商品流转分析"
    title="运营数据大盘"
  >
    <Spin :spinning="loading">
      <!-- 待办事项告警条 -->
      <Row :gutter="[16, 16]" class="mb-4">
        <Col :lg="6" :md="12" :sm="24" :xs="24">
          <Card
            hoverable
            class="border-l-4 border-l-blue-500 cursor-pointer shadow-sm"
            @click="router.push('/user/certification')"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-gray-500 font-medium">
                  待审核实名认证
                </div>
                <div class="text-2xl font-bold text-blue-600 mt-1">
                  {{ todosData.pendingCertCount }}
                  <span class="text-xs text-gray-400 font-normal">单</span>
                </div>
              </div>
              <Badge :count="todosData.pendingCertCount" :overflow-count="99">
                <div
                  class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold"
                >
                  审
                </div>
              </Badge>
            </div>
          </Card>
        </Col>

        <Col :lg="6" :md="12" :sm="24" :xs="24">
          <Card
            hoverable
            class="border-l-4 border-l-purple-500 cursor-pointer shadow-sm"
            @click="router.push('/shop/shop-audit')"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-gray-500 font-medium">
                  待审批开店申请
                </div>
                <div class="text-2xl font-bold text-purple-600 mt-1">
                  {{ todosData.pendingShopCount }}
                  <span class="text-xs text-gray-400 font-normal">家</span>
                </div>
              </div>
              <Badge :count="todosData.pendingShopCount" :overflow-count="99">
                <div
                  class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 font-bold"
                >
                  店
                </div>
              </Badge>
            </div>
          </Card>
        </Col>

        <Col :lg="6" :md="12" :sm="24" :xs="24">
          <Card
            hoverable
            class="border-l-4 border-l-amber-500 cursor-pointer shadow-sm"
            @click="router.push('/order/order-list')"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-gray-500 font-medium">
                  待履约发货订单
                </div>
                <div class="text-2xl font-bold text-amber-600 mt-1">
                  {{ todosData.pendingDeliverCount }}
                  <span class="text-xs text-gray-400 font-normal">笔</span>
                </div>
              </div>
              <Badge
                :count="todosData.pendingDeliverCount"
                :overflow-count="99"
              >
                <div
                  class="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 font-bold"
                >
                  单
                </div>
              </Badge>
            </div>
          </Card>
        </Col>

        <Col :lg="6" :md="12" :sm="24" :xs="24">
          <Card
            hoverable
            class="border-l-4 border-l-red-500 cursor-pointer shadow-sm"
            @click="router.push('/product/stock-warning')"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-gray-500 font-medium">
                  库存告急警戒商品
                </div>
                <div class="text-2xl font-bold text-red-600 mt-1">
                  {{ todosData.lowStockProductCount }}
                  <span class="text-xs text-gray-400 font-normal">件</span>
                </div>
              </div>
              <Badge
                :count="todosData.lowStockProductCount"
                :overflow-count="99"
              >
                <div
                  class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 font-bold"
                >
                  警
                </div>
              </Badge>
            </div>
          </Card>
        </Col>
      </Row>

      <!-- 今日核心指标大卡片 -->
      <Row :gutter="[16, 16]" class="mb-4">
        <Col :lg="6" :md="12" :sm="24" :xs="24">
          <Card class="shadow-sm">
            <Statistic
              title="今日成交 GMV (元)"
              :value="overviewData.todayGmv"
              :precision="2"
              :value-style="{ color: '#1677ff', fontWeight: 'bold' }"
            />
            <div class="mt-2 text-xs text-gray-400 flex justify-between">
              <span>今日实付流水</span>
              <span class="text-gray-700 font-medium">¥{{ overviewData.todayPayAmount?.toFixed(2) }}</span>
            </div>
            <div class="mt-1 text-xs text-gray-400 flex justify-between">
              <span>平台累计 GMV</span>
              <span class="text-gray-700 font-medium">¥{{ overviewData.totalGmv?.toLocaleString() }}</span>
            </div>
          </Card>
        </Col>

        <Col :lg="6" :md="12" :sm="24" :xs="24">
          <Card class="shadow-sm">
            <Statistic
              title="今日订单总量 (笔)"
              :value="overviewData.todayOrderCount"
              :value-style="{ color: '#52c41a', fontWeight: 'bold' }"
            />
            <div class="mt-2 text-xs text-gray-400 flex justify-between">
              <span>今日客单价 (AOV)</span>
              <span class="text-gray-700 font-medium">¥{{ overviewData.todayAov?.toFixed(2) }}</span>
            </div>
            <div class="mt-1 text-xs text-gray-400 flex justify-between">
              <span>平台累计订单数</span>
              <span class="text-gray-700 font-medium">{{ overviewData.totalOrders?.toLocaleString() }} 笔</span>
            </div>
          </Card>
        </Col>

        <Col :lg="6" :md="12" :sm="24" :xs="24">
          <Card class="shadow-sm">
            <Statistic
              title="今日新增买家 (人)"
              :value="overviewData.todayNewUsers"
              :value-style="{ color: '#fa8c16', fontWeight: 'bold' }"
            />
            <div class="mt-2 text-xs text-gray-400 flex justify-between">
              <span>注册用户总数</span>
              <span class="text-gray-700 font-medium">{{ overviewData.totalUsers?.toLocaleString() }} 人</span>
            </div>
            <div class="mt-1 text-xs text-gray-400 flex justify-between">
              <span>活跃入驻商户</span>
              <span class="text-gray-700 font-medium">{{ overviewData.totalShops }} 家</span>
            </div>
          </Card>
        </Col>

        <Col :lg="6" :md="12" :sm="24" :xs="24">
          <Card class="shadow-sm">
            <Statistic
              title="全平台在线商品 (件)"
              :value="overviewData.totalProducts"
              :value-style="{ color: '#722ed1', fontWeight: 'bold' }"
            />
            <div class="mt-2 text-xs text-gray-400 flex justify-between">
              <span>库存警戒线下线</span>
              <span class="text-red-500 font-medium">{{ todosData.lowStockProductCount }} 件</span>
            </div>
            <div class="mt-1 text-xs text-gray-400 flex justify-between">
              <span>商铺入驻正常率</span>
              <span class="text-green-600 font-medium">98.5%</span>
            </div>
          </Card>
        </Col>
      </Row>

      <!-- 趋势与分类分布 -->
      <Row :gutter="[16, 16]" class="mb-4">
        <!-- 销售走势图 -->
        <Col :lg="16" :md="24" :sm="24" :xs="24">
          <Card title="业务销售与订单走势" class="shadow-sm">
            <template #extra>
              <Radio.Group
                :value="trendDays"
                size="small"
                @change="handleDaysChange"
              >
                <Radio.Button :value="7">近 7 天</Radio.Button>
                <Radio.Button :value="30">近 30 天</Radio.Button>
              </Radio.Group>
            </template>

            <div class="space-y-4">
              <div
                v-for="(date, idx) in trendData.dates"
                :key="date"
                class="border-b pb-2 last:border-b-0"
              >
                <div class="flex justify-between items-center mb-1 text-sm">
                  <span class="font-medium text-gray-700 w-16">{{ date }}</span>
                  <span class="text-xs text-gray-500">
                    流水:
                    <strong class="text-blue-600">¥{{ trendData.gmvList[idx]?.toLocaleString() }}</strong>
                    &nbsp;|&nbsp; 订单:
                    <strong class="text-green-600">{{
                      trendData.orderCountList[idx]
                    }}</strong>
                    笔
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <Progress
                    :percent="
                      Math.min(
                        100,
                        Math.round(
                          ((trendData.gmvList[idx] || 0) / 50000) * 100,
                        ),
                      )
                    "
                    stroke-color="#1677ff"
                    size="small"
                    :format="() => `GMV`"
                  />
                  <Progress
                    :percent="
                      Math.min(
                        100,
                        Math.round(
                          ((trendData.orderCountList[idx] || 0) / 350) * 100,
                        ),
                      )
                    "
                    stroke-color="#52c41a"
                    size="small"
                    :format="() => `订单`"
                  />
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <!-- 类目销售占比 -->
        <Col :lg="8" :md="24" :sm="24" :xs="24">
          <Card title="一级类目销售体量占比" class="shadow-sm">
            <div class="space-y-4 pt-1">
              <div v-for="cat in categoryRatios" :key="cat.categoryId">
                <div class="flex justify-between items-center mb-1 text-sm">
                  <span class="font-medium text-gray-700">{{
                    cat.categoryName
                  }}</span>
                  <span class="text-gray-500 text-xs">¥{{ cat.salesAmount?.toLocaleString() }} ({{
                      cat.ratio
                    }}%)</span>
                </div>
                <Progress
                  :percent="cat.ratio"
                  :status="cat.ratio > 30 ? 'active' : 'normal'"
                  :stroke-color="
                    cat.ratio > 30
                      ? '#1677ff'
                      : cat.ratio > 20
                        ? '#52c41a'
                        : '#fa8c16'
                  "
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <!-- 热销榜单 Top 10 -->
      <Card title="爆款热销商品榜单 (Top 10)" class="shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b text-gray-500">
                <th class="py-2.5 px-3 w-16 text-center">排名</th>
                <th class="py-2.5 px-3">商品信息</th>
                <th class="py-2.5 px-3 w-32 text-right">总销量 (件)</th>
                <th class="py-2.5 px-3 w-36 text-right">销售额 (元)</th>
                <th class="py-2.5 px-3 w-28 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in topProducts"
                :key="item.spuId"
                class="border-b hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 px-3 text-center">
                  <span
                    class="inline-block w-6 h-6 rounded-full text-xs font-bold text-center leading-6"
                    :class="{
                      'bg-amber-500 text-white': index === 0,
                      'bg-slate-400 text-white': index === 1,
                      'bg-amber-700 text-white': index === 2,
                      'bg-gray-100 text-gray-600': index > 2,
                    }"
                  >
                    {{ index + 1 }}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <div class="flex items-center gap-3">
                    <img
                      :src="item.spuPic"
                      alt=""
                      class="w-11 h-11 rounded object-cover border"
                    />
                    <div>
                      <div class="font-medium text-gray-800 line-clamp-1">
                        {{ item.spuName }}
                      </div>
                      <div class="text-xs text-gray-400 mt-0.5">
                        SPU ID: {{ item.spuId }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3 text-right font-semibold text-gray-700">
                  {{ item.salesCount?.toLocaleString() }}
                </td>
                <td class="py-3 px-3 text-right font-semibold text-blue-600">
                  ¥{{ item.salesAmount?.toLocaleString() }}
                </td>
                <td class="py-3 px-3 text-center">
                  <Button
                    type="link"
                    size="small"
                    @click="router.push('/product/spu-list')"
                  >
                    查看详情
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </Spin>
  </Page>
</template>
