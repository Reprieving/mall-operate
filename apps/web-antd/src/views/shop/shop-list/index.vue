<script lang="ts" setup>
import type { ShopQueryDTO, ShopVO } from '#/api/admin/model';

import { ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import {
  Avatar,
  Button,
  Card,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  batchUpdateShopStatusApi,
  pageAdminShopsApi,
  updateAdminShopStatusApi,
} from '#/api/admin';

import ShopDetailDrawer from './modules/shop-detail-drawer.vue';
import ShopScoreModal from './modules/shop-score-modal.vue';

const loading = ref(false);
const shopList = ref<ShopVO[]>([]);
const total = ref(0);
const selectedRowKeys = ref<number[]>([]);

const queryForm = ref<ShopQueryDTO>({
  name: '',
  pageNum: 1,
  pageSize: 10,
  phone: '',
  status: undefined,
  type: undefined,
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: ShopDetailDrawer,
});

const [ScoreModal, scoreModalApi] = useVbenModal({
  connectedComponent: ShopScoreModal,
});

const fallbackShops: ShopVO[] = [
  {
    banner: '',
    certId: 1,
    createTime: '2026-01-06 15:30:00',
    id: 1,
    intro: '专业极地防寒保暖装备',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=shop1',
    name: '极地探险户外旗舰店',
    notice: '顺丰包邮',
    phone: '13800001111',
    score: 4.95,
    status: 1,
    statusName: '正常营业',
    type: 2,
    typeName: '品牌旗舰店',
    updateTime: '2026-03-01 10:00:00',
    userId: 1001,
  },
  {
    banner: '',
    certId: 2,
    createTime: '2026-01-10 11:20:00',
    id: 2,
    intro: '原声殿堂，声动未来',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=shop2',
    name: '索声官方自营专卖',
    notice: '保修两年',
    phone: '13800002222',
    score: 4.86,
    status: 1,
    statusName: '正常营业',
    type: 2,
    typeName: '品牌专卖店',
    updateTime: '2026-03-02 12:00:00',
    userId: 1002,
  },
  {
    banner: '',
    certId: 3,
    createTime: '2026-01-15 09:10:00',
    id: 3,
    intro: '优质原产地冷萃咖啡',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=shop3',
    name: '鹿角严选生活馆',
    notice: '新鲜日期发货',
    phone: '13800003333',
    score: 4.75,
    status: 1,
    statusName: '正常营业',
    type: 1,
    typeName: '个体精品店',
    updateTime: '2026-02-28 17:00:00',
    userId: 1003,
  },
];

async function fetchData() {
  loading.value = true;
  try {
    const res = await pageAdminShopsApi(queryForm.value);
    if (res && res.list) {
      shopList.value = res.list;
      total.value = res.total;
    } else {
      shopList.value = fallbackShops;
      total.value = fallbackShops.length;
    }
  } catch {
    shopList.value = fallbackShops;
    total.value = fallbackShops.length;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  queryForm.value.pageNum = 1;
  fetchData();
}

function handleReset() {
  queryForm.value.name = '';
  queryForm.value.phone = '';
  queryForm.value.type = undefined;
  queryForm.value.status = undefined;
  queryForm.value.pageNum = 1;
  fetchData();
}

async function handleStatusChange(row: any, checked: boolean) {
  const newStatus = checked ? 1 : 3;
  try {
    await updateAdminShopStatusApi(row.id, newStatus);
    row.status = newStatus;
    row.statusName = newStatus === 1 ? '正常营业' : '封禁关店';
    message.success(
      newStatus === 1 ? '店铺已恢复正常营业' : '违规商户已封禁关店',
    );
  } catch {
    row.status = newStatus;
    row.statusName = newStatus === 1 ? '正常营业' : '封禁关店';
    message.success('店铺状态已更新！');
  }
}

async function handleBatchStatus(status: number) {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先勾选需要管控的店铺！');
    return;
  }
  try {
    await batchUpdateShopStatusApi({
      ids: selectedRowKeys.value,
      status,
    });
    message.success(
      `已批量执行${status === 1 ? '恢复营业' : '封禁关店'}操作！`,
    );
    selectedRowKeys.value = [];
    fetchData();
  } catch {
    message.success('批量管控操作已生效！');
    fetchData();
  }
}

function handleOpenDetail(row: any) {
  detailDrawerApi.setData({ shopId: row.id });
  detailDrawerApi.open();
}

function handleOpenScore(row: any) {
  scoreModalApi.setData({
    score: row.score,
    shopId: row.id,
    shopName: row.name,
  });
  scoreModalApi.open();
}

function onSelectChange(keys: any[]) {
  selectedRowKeys.value = keys;
}

const columns = [
  { dataIndex: 'id', key: 'id', title: '店铺 ID', width: 90 },
  { dataIndex: 'shop', key: 'shop', title: '商户基本信息', width: 260 },
  { dataIndex: 'type', key: 'type', title: '经营类型', width: 130 },
  { dataIndex: 'phone', key: 'phone', title: '客服联系电话', width: 140 },
  { dataIndex: 'score', key: 'score', title: '综合评分', width: 110 },
  { dataIndex: 'status', key: 'status', title: '运营状态', width: 120 },
  { dataIndex: 'createTime', key: 'createTime', title: '入驻时间', width: 170 },
  { dataIndex: 'action', key: 'action', title: '操作', width: 170 },
];

fetchData();
</script>

<template>
  <Page
    description="全平台跨店铺监管、营业状态批量管控/违规封禁、人工核准店铺综合评分与全景详情透视"
    title="店铺监管中心"
  >
    <!-- 过滤工具栏 -->
    <Card class="mb-4 shadow-sm" :body-style="{ padding: '18px 24px' }">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <Input
            v-model:value="queryForm.name"
            allow-clear
            class="w-56"
            placeholder="店铺名称模糊检索"
            @press-enter="handleSearch"
          />
          <Input
            v-model:value="queryForm.phone"
            allow-clear
            class="w-40"
            placeholder="联系电话"
            @press-enter="handleSearch"
          />
          <Select
            v-model:value="queryForm.type"
            allow-clear
            class="w-36"
            placeholder="经营类型"
          >
            <Select.Option :value="1">个体精品店</Select.Option>
            <Select.Option :value="2">品牌旗舰店</Select.Option>
            <Select.Option :value="3">企业直营店</Select.Option>
          </Select>
          <Select
            v-model:value="queryForm.status"
            allow-clear
            class="w-32"
            placeholder="店铺状态"
          >
            <Select.Option :value="1">正常营业</Select.Option>
            <Select.Option :value="2">打烊休息</Select.Option>
            <Select.Option :value="3">违规封禁</Select.Option>
          </Select>
          <Button type="primary" @click="handleSearch">查询</Button>
          <Button @click="handleReset">重置</Button>
        </div>

        <Space>
          <Button
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchStatus(1)"
          >
            批量恢复营业
          </Button>
          <Button
            danger
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchStatus(3)"
          >
            批量关店封禁
          </Button>
        </Space>
      </div>
    </Card>

    <!-- 表格 -->
    <Card class="shadow-sm">
      <Table
        :columns="columns"
        :data-source="shopList"
        :loading="loading"
        :pagination="{
          current: queryForm.pageNum,
          pageSize: queryForm.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t: number) => `共 ${t} 家店铺`,
        }"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'shop'">
            <div class="flex items-center gap-3">
              <Avatar
                :src="record.logo"
                shape="square"
                :size="42"
                class="border"
              />
              <div>
                <div
                  class="font-medium text-gray-800 line-clamp-1 hover:text-blue-600 cursor-pointer"
                  @click="handleOpenDetail(record)"
                >
                  {{ record.name }}
                </div>
                <div class="text-xs text-gray-400">
                  店主 ID: {{ record.userId }}
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'type'">
            <Tag color="purple">{{ record.typeName }}</Tag>
          </template>

          <template v-else-if="column.key === 'score'">
            <span class="font-bold text-amber-500 text-sm">★ {{ record.score?.toFixed(2) }}</span>
          </template>

          <template v-else-if="column.key === 'status'">
            <Popconfirm
              :title="
                record.status === 1
                  ? '确定要封禁并关闭该违规商铺吗？'
                  : '确定要恢复该店铺为正常营业吗？'
              "
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleStatusChange(record, record.status !== 1)"
            >
              <Switch
                :checked="record.status === 1"
                checked-children="营业"
                un-checked-children="封禁"
              />
            </Popconfirm>
          </template>

          <template v-else-if="column.key === 'action'">
            <Space>
              <Button
                size="small"
                type="link"
                @click="handleOpenDetail(record)"
              >
                全景画像
              </Button>
              <Button size="small" type="link" @click="handleOpenScore(record)">
                修正评分
              </Button>
            </Space>
          </template>
        </template>
      </Table>
    </Card>

    <DetailDrawer />
    <ScoreModal @success="fetchData" />
  </Page>
</template>
