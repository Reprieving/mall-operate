<script lang="ts" setup>
import type { OrderRefundQueryDTO, OrderRefundVO } from '#/api/admin/model';

import { computed, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import {
  Button,
  Card,
  Col,
  Image,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'ant-design-vue';

import { pageRefundsApi } from '#/api/admin';

import OrderDetailDrawer from '../order-list/modules/order-detail-drawer.vue';
import OrderRefundAuditModal from './modules/refund-audit-modal.vue';

const loading = ref(false);
const refundList = ref<OrderRefundVO[]>([]);
const total = ref(0);

const queryForm = ref<OrderRefundQueryDTO>({
  orderSn: '',
  pageNum: 1,
  pageSize: 10,
  refundSn: '',
  shopId: undefined,
  status: undefined,
  userId: undefined,
});

const [AuditModal, auditModalApi] = useVbenModal({
  connectedComponent: OrderRefundAuditModal,
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: OrderDetailDrawer,
});

// 计算核心统计数据 (遵循无 Array#reduce 规范)
const stats = computed(() => {
  let pendingCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;
  let totalAmount = 0;

  for (const item of refundList.value) {
    if (item.status === 0) {
      pendingCount += 1;
    } else if (item.status === 1) {
      approvedCount += 1;
    } else if (item.status === 2) {
      rejectedCount += 1;
    }
    totalAmount += item.refundAmount ?? 0;
  }

  return {
    approvedCount,
    pendingCount,
    rejectedCount,
    totalAmount,
  };
});

async function fetchData() {
  loading.value = true;
  try {
    const params: OrderRefundQueryDTO = {
      pageNum: queryForm.value.pageNum,
      pageSize: queryForm.value.pageSize,
    };
    if (queryForm.value.refundSn?.trim()) {
      params.refundSn = queryForm.value.refundSn.trim();
    }
    if (queryForm.value.orderSn?.trim()) {
      params.orderSn = queryForm.value.orderSn.trim();
    }
    if (queryForm.value.status !== undefined) {
      params.status = queryForm.value.status;
    }
    if (queryForm.value.shopId) {
      params.shopId = queryForm.value.shopId;
    }
    if (queryForm.value.userId) {
      params.userId = queryForm.value.userId;
    }

    const res = await pageRefundsApi(params);
    refundList.value = res?.list ?? [];
    total.value = res?.total ?? 0;
  } catch (error) {
    console.error('获取全平台退款申请列表失败', error);
    refundList.value = [];
    total.value = 0;
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
  queryForm.value.refundSn = '';
  queryForm.value.status = undefined;
  queryForm.value.shopId = undefined;
  queryForm.value.userId = undefined;
  queryForm.value.pageNum = 1;
  fetchData();
}

function handleOpenAuditModal(record: OrderRefundVO) {
  auditModalApi.setData({
    auditRemark: record.auditRemark,
    description: record.description,
    orderId: record.orderId,
    orderSn: record.orderSn,
    proofPics: record.proofPics,
    reason: record.reason,
    refundAmount: record.refundAmount,
    refundId: record.id,
    refundSn: record.refundSn,
    refundTypeDesc: record.refundTypeDesc,
  });
  auditModalApi.open();
}

function handleOpenOrderDetail(record: OrderRefundVO) {
  if (record.orderId) {
    detailDrawerApi.setData({ orderId: record.orderId });
    detailDrawerApi.open();
  }
}

function parsePics(pics?: string): string[] {
  if (!pics) return [];
  return pics
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const columns = [
  {
    dataIndex: 'refundSn',
    key: 'refundSn',
    title: '退款单号',
    width: 190,
  },
  {
    dataIndex: 'orderSn',
    key: 'orderSn',
    title: '关联订单号',
    width: 180,
  },
  {
    dataIndex: 'shopName',
    key: 'shopName',
    title: '所属商户店铺',
    width: 170,
  },
  {
    dataIndex: 'refundType',
    key: 'refundType',
    title: '退款类型',
    width: 110,
  },
  {
    dataIndex: 'refundAmount',
    key: 'refundAmount',
    title: '退款金额',
    width: 120,
  },
  {
    dataIndex: 'reason',
    key: 'reason',
    title: '退款原因与说明',
    width: 220,
  },
  {
    dataIndex: 'proofPics',
    key: 'proofPics',
    title: '买家凭证',
    width: 120,
  },
  {
    dataIndex: 'status',
    key: 'status',
    title: '审批状态',
    width: 120,
  },
  {
    dataIndex: 'createTime',
    key: 'createTime',
    title: '申请时间',
    width: 170,
  },
  {
    dataIndex: 'auditInfo',
    key: 'auditInfo',
    title: '审批处理记录',
    width: 180,
  },
  {
    dataIndex: 'action',
    fixed: 'right' as const,
    key: 'action',
    title: '审批流转操作',
    width: 180,
  },
];

fetchData();
</script>

<template>
  <Page>
    <!-- 核心统计指标卡 -->
    <Row :gutter="16" class="mb-4">
      <Col :xs="24" :sm="12" :md="6">
        <Card size="small" class="shadow-sm border-amber-500/30">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400">待审核退款申请</div>
              <div class="text-2xl font-bold text-amber-500 mt-1">
                {{ stats.pendingCount }}
              </div>
            </div>
            <div
              class="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-xl font-bold"
            >
              ⏳
            </div>
          </div>
        </Card>
      </Col>
      <Col :xs="24" :sm="12" :md="6">
        <Card size="small" class="shadow-sm border-emerald-500/30">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400">审核通过 / 已退款</div>
              <div class="text-2xl font-bold text-emerald-500 mt-1">
                {{ stats.approvedCount }}
              </div>
            </div>
            <div
              class="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xl font-bold"
            >
              ✅
            </div>
          </div>
        </Card>
      </Col>
      <Col :xs="24" :sm="12" :md="6">
        <Card size="small" class="shadow-sm border-rose-500/30">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400">已驳回退款申请</div>
              <div class="text-2xl font-bold text-rose-500 mt-1">
                {{ stats.rejectedCount }}
              </div>
            </div>
            <div
              class="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 text-xl font-bold"
            >
              ❌
            </div>
          </div>
        </Card>
      </Col>
      <Col :xs="24" :sm="12" :md="6">
        <Card size="small" class="shadow-sm border-blue-500/30">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400">售后退款涉及总金额</div>
              <div class="text-2xl font-bold text-blue-400 mt-1">
                ¥{{ stats.totalAmount.toFixed(2) }}
              </div>
            </div>
            <div
              class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-xl font-bold"
            >
              💰
            </div>
          </div>
        </Card>
      </Col>
    </Row>

    <!-- 高级检索栏 (严格遵循 1行4个输入框 规范) -->
    <Card class="mb-4 shadow-sm" :body-style="{ padding: '18px 24px' }">
      <Row :gutter="[16, 16]">
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="queryForm.refundSn"
            allow-clear
            class="w-full"
            placeholder="退款申请单号检索"
            @press-enter="handleSearch"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="queryForm.orderSn"
            allow-clear
            class="w-full"
            placeholder="关联订单编号检索"
            @press-enter="handleSearch"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Select
            v-model:value="queryForm.status"
            allow-clear
            class="w-full"
            placeholder="退款审批状态检索"
          >
            <Select.Option :value="0">待运营审批</Select.Option>
            <Select.Option :value="1">审核通过 (已同意退款)</Select.Option>
            <Select.Option :value="2">已驳回退款申请</Select.Option>
          </Select>
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="queryForm.shopId"
            allow-clear
            class="w-full"
            placeholder="商户店铺编号 / ID检索"
            @press-enter="handleSearch"
          />
        </Col>
      </Row>

      <!-- 操作按钮栏 -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Button type="primary" @click="handleSearch">检索</Button>
          <Button @click="handleReset">重置</Button>
        </div>
      </div>
    </Card>

    <!-- 售后退款数据表格 -->
    <Card class="shadow-sm">
      <Table
        :columns="columns"
        :data-source="refundList"
        :loading="loading"
        :pagination="{
          current: queryForm.pageNum,
          pageSize: queryForm.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t: number) => `共检索出 ${t} 笔售后退款记录`,
          onChange: (p: number, ps: number) => {
            queryForm.pageNum = p;
            queryForm.pageSize = ps;
            fetchData();
          },
        }"
        row-key="id"
        :scroll="{ x: 1400 }"
      >
        <template #bodyCell="{ column, record }">
          <!-- 退款单号 -->
          <template v-if="column.key === 'refundSn'">
            <div class="font-mono font-medium text-white">
              {{ record.refundSn }}
            </div>
            <div class="text-xs text-slate-400">
              买家ID: {{ record.userId }}
            </div>
          </template>

          <!-- 关联订单单号 -->
          <template v-if="column.key === 'orderSn'">
            <a
              class="font-mono text-blue-400 hover:underline cursor-pointer"
              @click="handleOpenOrderDetail(record)"
            >
              {{ record.orderSn }}
            </a>
          </template>

          <!-- 所属商户 -->
          <template v-if="column.key === 'shopName'">
            <div class="text-slate-200 font-medium">
              {{ record.shopName || '平台自营商户' }}
            </div>
            <div class="text-xs text-slate-400">ID: #{{ record.shopId }}</div>
          </template>

          <!-- 退款类型 -->
          <template v-if="column.key === 'refundType'">
            <Tag :color="record.refundType === 2 ? 'purple' : 'cyan'">
              {{
                record.refundTypeDesc ||
                (record.refundType === 2 ? '退货退款' : '仅退款')
              }}
            </Tag>
          </template>

          <!-- 退款金额 -->
          <template v-if="column.key === 'refundAmount'">
            <span class="text-base font-bold text-red-500">
              ¥{{ record.refundAmount?.toFixed(2) ?? '0.00' }}
            </span>
          </template>

          <!-- 退款原因 -->
          <template v-if="column.key === 'reason'">
            <div class="text-sm font-medium text-slate-200">
              {{ record.reason || '无明确原因' }}
            </div>
            <Tooltip v-if="record.description" :title="record.description">
              <div class="text-xs text-slate-400 truncate max-w-[200px]">
                {{ record.description }}
              </div>
            </Tooltip>
          </template>

          <!-- 买家凭证图片 -->
          <template v-if="column.key === 'proofPics'">
            <div v-if="parsePics(record.proofPics).length > 0">
              <Image.PreviewGroup>
                <div class="flex items-center gap-1">
                  <Image
                    v-for="(pic, idx) in parsePics(record.proofPics)"
                    :key="idx"
                    :height="36"
                    :src="pic"
                    :width="36"
                    class="rounded border border-slate-700 object-cover"
                  />
                </div>
              </Image.PreviewGroup>
            </div>
            <span v-else class="text-xs text-slate-500">无凭证</span>
          </template>

          <!-- 审批状态 -->
          <template v-if="column.key === 'status'">
            <Tag v-if="record.status === 0" color="warning"> ⏳ 待审核 </Tag>
            <Tag v-else-if="record.status === 1" color="success">
              ✅ 审核通过
            </Tag>
            <Tag v-else-if="record.status === 2" color="error"> ❌ 已驳回 </Tag>
          </template>

          <!-- 审批处理记录 -->
          <template v-if="column.key === 'auditInfo'">
            <div v-if="record.status !== 0 && record.auditTime">
              <div class="text-xs text-slate-300">
                处理人: {{ record.auditUserName || '运营管理员' }}
              </div>
              <div class="text-xs text-slate-400">
                时间: {{ record.auditTime }}
              </div>
              <Tooltip v-if="record.auditRemark" :title="record.auditRemark">
                <div class="text-xs text-amber-400 truncate max-w-[160px]">
                  备注: {{ record.auditRemark }}
                </div>
              </Tooltip>
            </div>
            <span v-else class="text-xs text-slate-500">待处理</span>
          </template>

          <!-- 操作栏 -->
          <template v-if="column.key === 'action'">
            <Space>
              <Button
                v-if="record.status === 0"
                type="primary"
                size="small"
                @click="handleOpenAuditModal(record)"
              >
                审批退款
              </Button>
              <Button size="small" @click="handleOpenOrderDetail(record)">
                订单全景
              </Button>
            </Space>
          </template>
        </template>
      </Table>
    </Card>

    <!-- 审批退款弹窗 -->
    <AuditModal @success="fetchData" />

    <!-- 订单全景画像抽屉 -->
    <DetailDrawer />
  </Page>
</template>
