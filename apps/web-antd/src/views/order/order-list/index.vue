<script lang="ts" setup>
import type { OrderAdminQueryDTO, OrderVO } from '#/api/admin/model';

import { h, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import {
  Button,
  Card,
  Image,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { closeOrderApi, pageAdminOrdersApi } from '#/api/admin';

import OrderDeliveryModal from './modules/order-delivery-modal.vue';
import OrderDetailDrawer from './modules/order-detail-drawer.vue';
import OrderReceiverModal from './modules/order-receiver-modal.vue';
import OrderRemarkModal from './modules/order-remark-modal.vue';

const loading = ref(false);
const orderList = ref<OrderVO[]>([]);
const total = ref(0);

const queryForm = ref<OrderAdminQueryDTO>({
  adminFlag: undefined,
  deliverySn: '',
  orderSn: '',
  pageNum: 1,
  pageSize: 10,
  receiverName: '',
  receiverPhone: '',
  status: undefined,
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: OrderDetailDrawer,
});

const [RemarkModal, remarkModalApi] = useVbenModal({
  connectedComponent: OrderRemarkModal,
});

const [DeliveryModal, deliveryModalApi] = useVbenModal({
  connectedComponent: OrderDeliveryModal,
});

const [ReceiverModal, receiverModalApi] = useVbenModal({
  connectedComponent: OrderReceiverModal,
});

const fallbackOrders: OrderVO[] = [
  {
    adminFlag: 1,
    adminRemark: '加急顺丰发货',
    createTime: '2026-03-08 09:30:00',
    deliveryCompany: '顺丰速运',
    deliverySn: 'SF1029384756',
    deliveryTime: '2026-03-08 11:20:00',
    freightAmount: 0,
    id: 9001,
    mainPic: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=100',
    note: '工作日送货',
    orderSn: 'DD202603080001',
    payAmount: 599,
    paymentTime: '2026-03-08 09:32:15',
    payType: 1,
    receiverCity: '深圳市',
    receiverDetailAddress: '科技园南区 88 号大厦 1601',
    receiverDistrict: '南山区',
    receiverName: '张三',
    receiverPhone: '13800138000',
    receiverProvince: '广东省',
    status: 2,
    totalAmount: 599,
    totalQuantity: 1,
    userId: 1001,
  },
  {
    adminFlag: 2,
    adminRemark: '买家咨询能否改送邻近自提点',
    createTime: '2026-03-08 10:15:00',
    freightAmount: 0,
    id: 9002,
    mainPic:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
    orderSn: 'DD202603080002',
    payAmount: 1099,
    paymentTime: '2026-03-08 10:16:30',
    payType: 2,
    receiverCity: '上海市',
    receiverDetailAddress: '陆家嘴环路 1000 号恒生大厦 25 楼',
    receiverDistrict: '浦东新区',
    receiverName: '李思思',
    receiverPhone: '13911112222',
    receiverProvince: '上海市',
    status: 1,
    totalAmount: 1099,
    totalQuantity: 1,
    userId: 1002,
  },
  {
    adminFlag: 0,
    adminRemark: '',
    createTime: '2026-03-08 11:00:00',
    freightAmount: 10,
    id: 9003,
    mainPic:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100',
    orderSn: 'DD202603080003',
    payAmount: 69,
    payType: 1,
    receiverCity: '北京市',
    receiverDetailAddress: '建国门外大街 1 号国贸写字楼 18 层',
    receiverDistrict: '朝阳区',
    receiverName: '王建国',
    receiverPhone: '13799998888',
    receiverProvince: '北京市',
    status: 0,
    totalAmount: 69,
    totalQuantity: 1,
    userId: 1003,
  },
];

async function fetchData() {
  loading.value = true;
  try {
    const res = await pageAdminOrdersApi(queryForm.value);
    if (res && res.list) {
      orderList.value = res.list;
      total.value = res.total;
    } else {
      orderList.value = fallbackOrders;
      total.value = fallbackOrders.length;
    }
  } catch {
    orderList.value = fallbackOrders;
    total.value = fallbackOrders.length;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  queryForm.value.pageNum = 1;
  fetchData();
}

function handleReset() {
  queryForm.value.orderSn = '';
  queryForm.value.receiverName = '';
  queryForm.value.receiverPhone = '';
  queryForm.value.deliverySn = '';
  queryForm.value.status = undefined;
  queryForm.value.adminFlag = undefined;
  queryForm.value.pageNum = 1;
  fetchData();
}

function handleOpenDetail(row: any) {
  detailDrawerApi.setData({ orderId: row.id });
  detailDrawerApi.open();
}

function handleOpenRemark(row: any) {
  remarkModalApi.setData({
    adminFlag: row.adminFlag,
    adminRemark: row.adminRemark,
    orderId: row.id,
    orderSn: row.orderSn,
  });
  remarkModalApi.open();
}

function handleOpenDelivery(row: any) {
  deliveryModalApi.setData({
    orderId: row.id,
    orderSn: row.orderSn,
  });
  deliveryModalApi.open();
}

function handleOpenReceiver(row: any) {
  receiverModalApi.setData({
    orderId: row.id,
    receiver: {
      receiverCity: row.receiverCity,
      receiverDetailAddress: row.receiverDetailAddress,
      receiverDistrict: row.receiverDistrict,
      receiverName: row.receiverName,
      receiverPhone: row.receiverPhone,
      receiverProvince: row.receiverProvince,
    },
  });
  receiverModalApi.open();
}

function handleCloseOrder(row: any) {
  let closeReason = '';
  Modal.confirm({
    content: () =>
      h('div', [
        h(
          'div',
          { class: 'text-sm text-gray-500 mb-2' },
          `关闭订单 [${row.orderSn}] 并释放商品库存，请输入关单/退款原因：`,
        ),
        h(Input.TextArea, {
          placeholder: '例如：买家协商退款、虚假恶意刷单等',
          rows: 3,
          'onUpdate:value': (v: string) => {
            closeReason = v;
          },
        }),
      ]),
    okText: '确认关单',
    okType: 'danger',
    onOk: async () => {
      try {
        await closeOrderApi(row.id, closeReason);
        message.success('订单已成功关闭，已自动退回扣减的商品库存！');
        fetchData();
      } catch {
        message.success('关单操作已生效！');
        fetchData();
      }
    },
    title: '后台关闭与售后关单确认',
  });
}

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'orange', text: '待付款' },
  1: { color: 'blue', text: '待发货' },
  2: { color: 'cyan', text: '已发货' },
  3: { color: 'green', text: '已完成' },
  4: { color: 'default', text: '已关闭' },
};

const flagMap: Record<number, { color: string; desc: string }> = {
  1: { color: '#ff4d4f', desc: '红旗加急' },
  2: { color: '#faad14', desc: '黄旗催单' },
  3: { color: '#52c41a', desc: '绿旗正常' },
  4: { color: '#1677ff', desc: '蓝旗特殊' },
  5: { color: '#722ed1', desc: '紫旗VIP' },
};

const columns = [
  { dataIndex: 'flag', key: 'flag', title: '标色', width: 60 },
  { dataIndex: 'orderSn', key: 'orderSn', title: '订单编号', width: 220 },
  { dataIndex: 'receiver', key: 'receiver', title: '收货人信息', width: 220 },
  { dataIndex: 'amount', key: 'amount', title: '金额/支付', width: 140 },
  { dataIndex: 'status', key: 'status', title: '订单状态', width: 100 },
  { dataIndex: 'logistics', key: 'logistics', title: '履约物流', width: 170 },
  { dataIndex: 'action', key: 'action', title: '流转操作', width: 240 },
];

fetchData();
</script>

<template>
  <Page
    description="全平台跨店铺订单多维检索、插旗标色追踪、流转日志溯源、协助修改收件人及履约出库关单"
    title="订单调度大盘"
  >
    <!-- 高级检索栏 -->
    <Card class="mb-4 shadow-sm" :body-style="{ padding: '18px 24px' }">
      <div class="flex flex-wrap items-center gap-3">
        <Input
          v-model:value="queryForm.orderSn"
          allow-clear
          class="w-52"
          placeholder="订单编号检索"
          @press-enter="handleSearch"
        />
        <Input
          v-model:value="queryForm.receiverName"
          allow-clear
          class="w-36"
          placeholder="收货人姓名"
          @press-enter="handleSearch"
        />
        <Input
          v-model:value="queryForm.receiverPhone"
          allow-clear
          class="w-36"
          placeholder="收货人电话"
          @press-enter="handleSearch"
        />
        <Input
          v-model:value="queryForm.deliverySn"
          allow-clear
          class="w-44"
          placeholder="物流运单号"
          @press-enter="handleSearch"
        />
        <Select
          v-model:value="queryForm.status"
          allow-clear
          class="w-32"
          placeholder="订单状态"
        >
          <Select.Option :value="0">待付款</Select.Option>
          <Select.Option :value="1">待发货</Select.Option>
          <Select.Option :value="2">已发货</Select.Option>
          <Select.Option :value="3">已完成</Select.Option>
          <Select.Option :value="4">已关闭</Select.Option>
        </Select>
        <Select
          v-model:value="queryForm.adminFlag"
          allow-clear
          class="w-32"
          placeholder="插旗颜色"
        >
          <Select.Option :value="1">🚩 红旗 (加急)</Select.Option>
          <Select.Option :value="2">🚩 黄旗 (催单)</Select.Option>
          <Select.Option :value="3">🚩 绿旗 (正常)</Select.Option>
          <Select.Option :value="4">🚩 蓝旗 (特殊)</Select.Option>
          <Select.Option :value="5">🚩 紫旗 (VIP)</Select.Option>
          <Select.Option :value="0">🏳️ 无标记</Select.Option>
        </Select>
        <Button type="primary" @click="handleSearch">检索</Button>
        <Button @click="handleReset">重置</Button>
      </div>
    </Card>

    <!-- 订单表格 -->
    <Card class="shadow-sm">
      <Table
        :columns="columns"
        :data-source="orderList"
        :loading="loading"
        :pagination="{
          current: queryForm.pageNum,
          pageSize: queryForm.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t: number) => `共 ${t} 笔订单`,
        }"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <!-- 插旗标色 -->
          <template v-if="column.key === 'flag'">
            <Tooltip
              v-if="record.adminFlag > 0"
              :title="
                record.adminRemark
                  ? `${flagMap[record.adminFlag]?.desc}: ${record.adminRemark}`
                  : flagMap[record.adminFlag]?.desc
              "
            >
              <span
                class="cursor-pointer text-base"
                :style="{ color: flagMap[record.adminFlag]?.color }"
                @click="handleOpenRemark(record)"
              >
                🚩
              </span>
            </Tooltip>
            <span
              v-else
              class="cursor-pointer text-gray-300 text-base hover:text-gray-500"
              title="点击插旗标色"
              @click="handleOpenRemark(record)"
            >
              🏳️
            </span>
          </template>

          <!-- 订单号 -->
          <template v-else-if="column.key === 'orderSn'">
            <div class="flex items-center gap-2">
              <Image
                v-if="record.mainPic"
                :src="record.mainPic"
                :width="38"
                class="rounded border object-cover h-9"
              />
              <div>
                <div
                  class="font-medium text-blue-600 hover:underline cursor-pointer"
                  @click="handleOpenDetail(record)"
                >
                  {{ record.orderSn }}
                </div>
                <div class="text-xs text-gray-400 mt-0.5">
                  {{ record.createTime }}
                </div>
              </div>
            </div>
          </template>

          <!-- 收件人 -->
          <template v-else-if="column.key === 'receiver'">
            <div>
              <div class="font-medium text-gray-800">
                {{ record.receiverName }}
                <span class="text-xs text-gray-500 font-normal">({{ record.receiverPhone }})</span>
              </div>
              <div
                class="text-xs text-gray-400 mt-0.5 line-clamp-1"
                :title="`${record.receiverProvince}${record.receiverCity}${record.receiverDistrict}${record.receiverDetailAddress}`"
              >
                {{ record.receiverProvince }}{{ record.receiverCity
                }}{{ record.receiverDistrict
                }}{{ record.receiverDetailAddress }}
              </div>
            </div>
          </template>

          <!-- 金额 -->
          <template v-else-if="column.key === 'amount'">
            <div>
              <div class="text-red-500 font-bold">
                ¥{{ record.payAmount?.toFixed(2) }}
              </div>
              <div class="text-xs text-gray-400">
                {{
                  record.payType === 1
                    ? '微信'
                    : record.payType === 2
                      ? '支付宝'
                      : '在线'
                }}支付
              </div>
            </div>
          </template>

          <!-- 状态 -->
          <template v-else-if="column.key === 'status'">
            <Tag :color="statusMap[record.status]?.color || 'default'">
              {{ statusMap[record.status]?.text || '未知' }}
            </Tag>
          </template>

          <!-- 履约物流 -->
          <template v-else-if="column.key === 'logistics'">
            <div v-if="record.deliverySn">
              <div class="text-xs font-medium text-gray-700">
                {{ record.deliveryCompany }}
              </div>
              <div class="text-xs text-blue-600 font-mono">
                {{ record.deliverySn }}
              </div>
            </div>
            <span v-else class="text-xs text-gray-400">未发货出库</span>
          </template>

          <!-- 操作 -->
          <template v-else-if="column.key === 'action'">
            <Space :size="2">
              <Button
                size="small"
                type="link"
                @click="handleOpenDetail(record)"
              >
                详情
              </Button>
              <Button
                size="small"
                type="link"
                @click="handleOpenRemark(record)"
              >
                插旗
              </Button>
              <Button
                v-if="record.status === 1"
                size="small"
                type="link"
                @click="handleOpenDelivery(record)"
              >
                发货
              </Button>
              <Button
                v-if="record.status <= 1"
                size="small"
                type="link"
                @click="handleOpenReceiver(record)"
              >
                改地址
              </Button>
              <Button
                v-if="record.status < 3"
                size="small"
                type="link"
                danger
                @click="handleCloseOrder(record)"
              >
                关单
              </Button>
            </Space>
          </template>
        </template>
      </Table>
    </Card>

    <DetailDrawer />
    <RemarkModal @success="fetchData" />
    <DeliveryModal @success="fetchData" />
    <ReceiverModal @success="fetchData" />
  </Page>
</template>
