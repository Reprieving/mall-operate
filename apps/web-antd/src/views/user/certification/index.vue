<script lang="ts" setup>
import type { CertQueryDTO, UserCertVO } from '#/api/admin/model';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import {
  Badge,
  Button,
  Card,
  Input,
  message,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import { pageCertificationsApi } from '#/api/admin';

import CertAuditModal from './modules/cert-audit-modal.vue';

const loading = ref(false);
const certList = ref<UserCertVO[]>([]);
const total = ref(0);
const selectedRowKeys = ref<number[]>([]);

const queryForm = ref<CertQueryDTO>({
  certType: undefined,
  keyword: '',
  pageNum: 1,
  pageSize: 10,
  status: undefined,
});

const [AuditModal, auditModalApi] = useVbenModal({
  connectedComponent: CertAuditModal,
});

// 默认模拟数据
const fallbackCerts: UserCertVO[] = [
  {
    auditRemark: '',
    auditTime: '',
    businessLicenseNo: '',
    businessLicensePic: '',
    certType: 1,
    certTypeName: '个人实名认证',
    companyAddress: '',
    companyName: '',
    createTime: '2026-03-08 09:20:15',
    id: 101,
    idCard: '110101199003072345',
    idCardBackPic:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200',
    idCardFrontPic:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200',
    realName: '王建国',
    status: 0,
    statusName: '待审核',
    userId: 1004,
  },
  {
    auditRemark: '',
    auditTime: '',
    businessLicenseNo: '92310115MA1H888888',
    businessLicensePic:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=200',
    certType: 2,
    certTypeName: '个体工商户认证',
    companyAddress: '上海市浦东新区金科路 2889 号',
    companyName: '浦东新区优品数码经营部',
    createTime: '2026-03-07 16:45:00',
    id: 102,
    idCard: '310115198810156677',
    idCardBackPic:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200',
    idCardFrontPic:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200',
    realName: '陈志远',
    status: 0,
    statusName: '待审核',
    userId: 1005,
  },
  {
    auditRemark: '营业执照经营范围与平台许可类目吻合',
    auditTime: '2026-03-06 11:30:00',
    businessLicenseNo: '91440300MA5EXXXX77',
    businessLicensePic:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=200',
    certType: 3,
    certTypeName: '企业主体认证',
    companyAddress: '深圳市南山区粤海街道高新南一道 9 号',
    companyName: '深圳市极光智联网络科技有限公司',
    createTime: '2026-03-05 14:10:00',
    id: 103,
    idCard: '440301198502129988',
    idCardBackPic:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200',
    idCardFrontPic:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200',
    realName: '赵雷',
    status: 1,
    statusName: '审核通过',
    userId: 1006,
  },
];

async function fetchData() {
  loading.value = true;
  try {
    const res = await pageCertificationsApi(queryForm.value);
    if (res && res.list) {
      certList.value = res.list;
      total.value = res.total;
    } else {
      certList.value = fallbackCerts;
      total.value = fallbackCerts.length;
    }
  } catch {
    certList.value = fallbackCerts;
    total.value = fallbackCerts.length;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  queryForm.value.pageNum = 1;
  fetchData();
}

function handleReset() {
  queryForm.value.certType = undefined;
  queryForm.value.status = undefined;
  queryForm.value.keyword = '';
  queryForm.value.pageNum = 1;
  fetchData();
}

function handleAudit(row: any) {
  auditModalApi.setData({ cert: row, isBatch: false });
  auditModalApi.open();
}

function handleBatchAudit() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先勾选需要审核的记录！');
    return;
  }
  auditModalApi.setData({ ids: selectedRowKeys.value, isBatch: true });
  auditModalApi.open();
}

function onSelectChange(keys: any[]) {
  selectedRowKeys.value = keys;
}

const columns = [
  {
    dataIndex: 'id',
    key: 'id',
    title: '申请编号',
    width: 90,
  },
  {
    dataIndex: 'userId',
    key: 'userId',
    title: '用户 ID',
    width: 90,
  },
  {
    dataIndex: 'certType',
    key: 'certType',
    title: '主体类型',
    width: 130,
  },
  {
    dataIndex: 'subject',
    key: 'subject',
    title: '认证主体信息',
    width: 240,
  },
  {
    dataIndex: 'idCard',
    key: 'idCard',
    title: '证件/代码',
    width: 190,
  },
  {
    dataIndex: 'status',
    key: 'status',
    title: '审核状态',
    width: 110,
  },
  {
    dataIndex: 'createTime',
    key: 'createTime',
    title: '申请时间',
    width: 170,
  },
  {
    dataIndex: 'auditRemark',
    key: 'auditRemark',
    title: '审核备注',
    width: 160,
  },
  {
    dataIndex: 'action',
    key: 'action',
    title: '操作',
    width: 120,
  },
];

fetchData();
</script>

<template>
  <Page
    description="对用户个人、个体工商户、企业主体三类实名认证资质进行审核核验与批量审批通过/驳回"
    title="主体实名认证审批"
  >
    <!-- 筛选过滤 -->
    <Card class="mb-4 shadow-sm" :body-style="{ padding: '18px 24px' }">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <Input
            v-model:value="queryForm.keyword"
            allow-clear
            class="w-64"
            placeholder="姓名/企业字号/证件号检索"
            @press-enter="handleSearch"
          />
          <Select
            v-model:value="queryForm.certType"
            allow-clear
            class="w-40"
            placeholder="认证类型"
          >
            <Select.Option :value="1">个人实名认证</Select.Option>
            <Select.Option :value="2">个体工商户认证</Select.Option>
            <Select.Option :value="3">企业主体认证</Select.Option>
          </Select>
          <Select
            v-model:value="queryForm.status"
            allow-clear
            class="w-36"
            placeholder="审核状态"
          >
            <Select.Option :value="0">待审核</Select.Option>
            <Select.Option :value="1">审核通过</Select.Option>
            <Select.Option :value="2">已驳回</Select.Option>
          </Select>
          <Button type="primary" @click="handleSearch">查询</Button>
          <Button @click="handleReset">重置</Button>
        </div>

        <Space>
          <Button
            type="primary"
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchAudit"
          >
            批量审批 ({{ selectedRowKeys.length }})
          </Button>
        </Space>
      </div>
    </Card>

    <!-- 审核表格 -->
    <Card class="shadow-sm">
      <Table
        :columns="columns"
        :data-source="certList"
        :loading="loading"
        :pagination="{
          current: queryForm.pageNum,
          pageSize: queryForm.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t: number) => `共 ${t} 条认证申请`,
        }"
        :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <!-- 主体类型 -->
          <template v-if="column.key === 'certType'">
            <Tag
              :color="
                record.certType === 1
                  ? 'blue'
                  : record.certType === 2
                    ? 'orange'
                    : 'purple'
              "
            >
              {{ record.certTypeName }}
            </Tag>
          </template>

          <!-- 主体信息 -->
          <template v-else-if="column.key === 'subject'">
            <div>
              <div class="font-medium text-gray-800">{{ record.realName }}</div>
              <div
                v-if="record.companyName"
                class="text-xs text-gray-500 mt-0.5"
              >
                企业: {{ record.companyName }}
              </div>
            </div>
          </template>

          <!-- 证件/代码 -->
          <template v-else-if="column.key === 'idCard'">
            <div>
              <div class="text-xs text-gray-700">
                身份证: {{ record.idCard }}
              </div>
              <div
                v-if="record.businessLicenseNo"
                class="text-xs text-gray-400 mt-0.5"
              >
                税号: {{ record.businessLicenseNo }}
              </div>
            </div>
          </template>

          <!-- 状态 -->
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
                (record.status === 1
                  ? '通过'
                  : record.status === 2
                    ? '驳回'
                    : '待审核')
              "
            />
          </template>

          <!-- 操作 -->
          <template v-else-if="column.key === 'action'">
            <Button size="small" type="link" @click="handleAudit(record)">
              {{ record.status === 0 ? '审核处理' : '核验详情' }}
            </Button>
          </template>
        </template>
      </Table>
    </Card>

    <AuditModal @success="fetchData" />
  </Page>
</template>
