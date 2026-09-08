<script lang="ts" setup>
import type { ShopQueryDTO, ShopVO } from '#/api/admin/model';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
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
      auditList.value = fallbackAudits;
      total.value = fallbackAudits.length;
    }
  } catch {
    auditList.value = fallbackAudits;
    total.value = fallbackAudits.length;
  } finally {
    loading.value = false;
  }
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
  <Page
    description="运营人员核查商家主体资质、营业执照及开店经营类型，执行入驻审批通过或驳回并记录审核原因"
    title="入驻开店审核"
  >
    <Card class="mb-4 shadow-sm" :body-style="{ padding: '16px 24px' }">
      <div class="flex items-center gap-3">
        <Input
          v-model:value="queryForm.name"
          allow-clear
          class="w-56"
          placeholder="店铺名称"
          @press-enter="fetchData"
        />
        <Select
          v-model:value="queryForm.status"
          allow-clear
          class="w-36"
          placeholder="审核状态"
        >
          <Select.Option :value="0">待审核申请</Select.Option>
          <Select.Option :value="1">已审核通过</Select.Option>
          <Select.Option :value="2">已驳回申请</Select.Option>
        </Select>
        <Button type="primary" @click="fetchData">查询</Button>
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
                <div class="font-medium text-gray-800">{{ record.name }}</div>
                <div class="text-xs text-gray-400">
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
