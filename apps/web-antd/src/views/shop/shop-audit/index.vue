<script lang="ts" setup>
import type { ShopQueryDTO, ShopVO } from '#/api/admin/model';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Table,
  Tag,
} from 'ant-design-vue';

import { pageAdminShopsApi } from '#/api/admin';

import ShopAuditModal from './modules/shop-audit-modal.vue';

const loading = ref(false);
const auditList = ref<ShopVO[]>([]);
const total = ref(0);

const queryForm = ref<ShopQueryDTO>({
  name: '',
  pageNum: 1,
  pageSize: 10,
  phone: '',
  status: 0, // 默认排查待审核入驻申请
  type: undefined,
});

const [AuditModal, auditModalApi] = useVbenModal({
  connectedComponent: ShopAuditModal,
});

const fallbackAudits: ShopVO[] = [
  {
    banner: '',
    certId: 10,
    createTime: '2026-03-05 15:20:00',
    id: 5,
    intro: '户外探险装备',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=shop5',
    name: '拓荒者户外专营店',
    notice: '',
    phone: '13900005555',
    score: 5,
    status: 0,
    statusName: '待审核',
    type: 2,
    typeName: '品牌旗舰店',
    updateTime: '2026-03-05 15:20:00',
    userId: 1005,
  },
  {
    banner: '',
    certId: 11,
    createTime: '2026-03-06 10:40:00',
    id: 6,
    intro: '原创纯棉复古T恤',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=shop6',
    name: '拾光原创服饰小铺',
    notice: '',
    phone: '13900006666',
    score: 5,
    status: 0,
    statusName: '待审核',
    type: 1,
    typeName: '个体精品店',
    updateTime: '2026-03-06 10:40:00',
    userId: 1006,
  },
];

async function fetchData() {
  loading.value = true;
  try {
    const res = await pageAdminShopsApi(queryForm.value);
    if (res && res.list) {
      auditList.value = res.list;
      total.value = res.total;
    } else {
      let filtered = [...fallbackAudits];
      if (queryForm.value.name) {
        const nameVal = queryForm.value.name.toLowerCase();
        filtered = filtered.filter((s) =>
          s.name.toLowerCase().includes(nameVal),
        );
      }
      if (queryForm.value.phone) {
        const phoneVal = queryForm.value.phone;
        filtered = filtered.filter((s) => s.phone.includes(phoneVal));
      }
      if (queryForm.value.type !== undefined) {
        filtered = filtered.filter((s) => s.type === queryForm.value.type);
      }
      if (queryForm.value.status !== undefined) {
        filtered = filtered.filter((s) => s.status === queryForm.value.status);
      }
      auditList.value = filtered;
      total.value = filtered.length;
    }
  } catch {
    auditList.value = fallbackAudits;
    total.value = fallbackAudits.length;
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value.name = '';
  queryForm.value.phone = '';
  queryForm.value.type = undefined;
  queryForm.value.status = 0;
  queryForm.value.pageNum = 1;
  fetchData();
}

function handleOpenAudit(row: any) {
  auditModalApi.setData({ shopId: row.id });
  auditModalApi.open();
}

const columns = [
  { dataIndex: 'id', key: 'id', title: '申请编号', width: 90 },
  { dataIndex: 'shop', key: 'shop', title: '拟开办店铺资料', width: 260 },
  { dataIndex: 'type', key: 'type', title: '经营类型', width: 130 },
  { dataIndex: 'phone', key: 'phone', title: '申请联系电话', width: 140 },
  { dataIndex: 'status', key: 'status', title: '审批状态', width: 110 },
  {
    dataIndex: 'createTime',
    key: 'createTime',
    title: '提交申请时间',
    width: 170,
  },
  { dataIndex: 'action', key: 'action', title: '操作', width: 140 },
];

onMounted(() => {
  fetchData();
});
</script>

<template>
  <Page>
    <Card class="mb-4 shadow-sm" :body-style="{ padding: '18px 24px' }">
      <!-- 1行4个检索输入框 -->
      <Row :gutter="16">
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="queryForm.name"
            allow-clear
            class="w-full"
            placeholder="拟开办店铺名称检索"
            @press-enter="fetchData"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="queryForm.phone"
            allow-clear
            class="w-full"
            placeholder="申请人联系电话检索"
            @press-enter="fetchData"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Select
            v-model:value="queryForm.type"
            allow-clear
            class="w-full"
            placeholder="拟经营类型检索"
          >
            <Select.Option :value="1">个体精品店</Select.Option>
            <Select.Option :value="2">品牌旗舰店</Select.Option>
            <Select.Option :value="3">企业直营店</Select.Option>
          </Select>
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Select
            v-model:value="queryForm.status"
            allow-clear
            class="w-full"
            placeholder="入驻审核状态检索"
          >
            <Select.Option :value="0">待审核申请</Select.Option>
            <Select.Option :value="1">已审核通过</Select.Option>
            <Select.Option :value="2">已驳回申请</Select.Option>
          </Select>
        </Col>
      </Row>

      <!-- 操作按钮栏 -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Button type="primary" @click="fetchData">查询</Button>
          <Button @click="handleReset">重置</Button>
        </div>
      </div>
    </Card>

    <Card class="shadow-sm">
      <Table
        :columns="columns"
        :data-source="auditList"
        :loading="loading"
        :pagination="{
          current: queryForm.pageNum,
          pageSize: queryForm.pageSize,
          total,
        }"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'shop'">
            <div class="flex items-center gap-3">
              <Avatar
                :src="record.logo"
                shape="square"
                :size="40"
                class="border"
              />
              <div>
                <div class="font-medium text-white">{{ record.name }}</div>
                <div class="text-xs text-gray-300">
                  申请人 ID: {{ record.userId }}
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'type'">
            <Tag color="purple">{{ record.typeName }}</Tag>
          </template>

          <template v-else-if="column.key === 'status'">
            <Badge
              :status="
                record.status === 1
                  ? 'success'
                  : record.status === 2
                    ? 'error'
                    : 'processing'
              "
              :text="
                record.statusName ||
                (record.status === 0
                  ? '待审核'
                  : record.status === 1
                    ? '已通过'
                    : '已驳回')
              "
            />
          </template>

          <template v-else-if="column.key === 'action'">
            <Button size="small" type="link" @click="handleOpenAudit(record)">
              资质审查与审批
            </Button>
          </template>
        </template>
      </Table>
    </Card>

    <AuditModal @success="fetchData" />
  </Page>
</template>

<style scoped>
:deep(.ant-table-thead > tr > th),
:deep(.ant-table-tbody > tr > td),
:deep(.ant-checkbox-wrapper),
:deep(.ant-pagination-total-text),
:deep(.ant-pagination-item a),
:deep(.ant-table-cell),
:deep(.ant-badge-status-text) {
  color: #fff !important;
}
</style>
