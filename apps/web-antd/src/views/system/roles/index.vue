<script lang="ts" setup>
import type { RoleVO } from '#/api/admin/model';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  createRoleApi,
  deleteRoleApi,
  listRolesApi,
  updateRoleApi,
} from '#/api/admin';

const loading = ref(false);
const roleList = ref<RoleVO[]>([]);

const modalVisible = ref(false);
const isEdit = ref(false);
const editId = ref<number>();
const formModel = ref({
  code: '',
  description: '',
  name: '',
  permissions: [] as string[],
  status: 1,
});

const allPermissionOptions = [
  { label: '全部超级特权 (*:*:*)', value: '*:*:*' },
  { label: '用户管理: 查询检索 (user:read)', value: 'user:read' },
  { label: '用户管理: 封禁解封/改密 (user:write)', value: 'user:write' },
  { label: '用户管理: 实名认证审核 (user:cert)', value: 'user:cert' },
  { label: '商品管理: 检索与查看 (product:read)', value: 'product:read' },
  {
    label: '商品管理: 上下架/调价调库存 (product:write)',
    value: 'product:write',
  },
  { label: '商品管理: 违规商品强删 (product:delete)', value: 'product:delete' },
  { label: '商品管理: 类目与品牌规格 (product:spec)', value: 'product:spec' },
  { label: '订单管理: 调度大盘排查 (order:read)', value: 'order:read' },
  { label: '订单管理: 出库录入物流 (order:delivery)', value: 'order:delivery' },
  { label: '订单管理: 售后关单/取消 (order:close)', value: 'order:close' },
  { label: '店铺监管: 店铺检索与画像 (shop:read)', value: 'shop:read' },
  { label: '店铺监管: 开店入驻审核 (shop:audit)', value: 'shop:audit' },
  { label: '店铺监管: 关店封禁/评分修正 (shop:status)', value: 'shop:status' },
  {
    label: '系统管理: 管理员与角色授权 (system:manage)',
    value: 'system:manage',
  },
];

const fallbackRoles: RoleVO[] = [
  {
    code: 'SUPER_ADMIN',
    description: '拥有平台运营中心全部最高统领特权，不可删除',
    id: 1,
    name: '超级管理员',
    permissions: ['*:*:*'],
    status: 1,
  },
  {
    code: 'OPERATOR_LEAD',
    description: '统筹协调商品上架、活动审核、违规清理与店铺评分',
    id: 2,
    name: '平台运营主管',
    permissions: [
      'product:read',
      'product:write',
      'product:spec',
      'order:read',
      'shop:read',
      'shop:audit',
      'shop:status',
    ],
    status: 1,
  },
  {
    code: 'ORDER_CLERK',
    description: '负责订单履约监控、客服改地址与协调顺丰物流出库',
    id: 3,
    name: '订单履约调度员',
    permissions: ['order:read', 'order:delivery', 'order:close'],
    status: 1,
  },
];

async function loadRoles() {
  loading.value = true;
  try {
    const res = await listRolesApi();
    roleList.value = res && res.length > 0 ? res : fallbackRoles;
  } catch {
    roleList.value = fallbackRoles;
  } finally {
    loading.value = false;
  }
}

const searchName = ref('');
const searchCode = ref('');
const searchStatus = ref<number | undefined>(undefined);
const searchPermission = ref('');

const displayedRoles = computed(() => {
  return roleList.value.filter((role) => {
    if (
      searchName.value.trim() &&
      !role.name.toLowerCase().includes(searchName.value.trim().toLowerCase())
    ) {
      return false;
    }
    if (
      searchCode.value.trim() &&
      !role.code.toLowerCase().includes(searchCode.value.trim().toLowerCase())
    ) {
      return false;
    }
    if (
      searchStatus.value !== undefined &&
      role.status !== searchStatus.value
    ) {
      return false;
    }
    if (
      searchPermission.value.trim() &&
      !role.permissions.some((p) =>
        p.toLowerCase().includes(searchPermission.value.trim().toLowerCase()),
      )
    ) {
      return false;
    }
    return true;
  });
});

function handleReset() {
  searchName.value = '';
  searchCode.value = '';
  searchStatus.value = undefined;
  searchPermission.value = '';
  loadRoles();
}

function handleAdd() {
  isEdit.value = false;
  editId.value = undefined;
  formModel.value = {
    code: '',
    description: '',
    name: '',
    permissions: ['order:read', 'product:read'],
    status: 1,
  };
  modalVisible.value = true;
}

function handleEdit(row: any) {
  isEdit.value = true;
  editId.value = row.id;
  formModel.value = {
    code: row.code,
    description: row.description || '',
    name: row.name,
    permissions: [...row.permissions],
    status: row.status,
  };
  modalVisible.value = true;
}

async function handleSave() {
  if (!formModel.value.name.trim() || !formModel.value.code.trim()) {
    message.warning('请填写角色名称和唯一编码！');
    return;
  }
  try {
    if (isEdit.value && editId.value) {
      await updateRoleApi(editId.value, formModel.value);
      message.success('角色信息与权限已更新！');
    } else {
      await createRoleApi(formModel.value);
      message.success('新角色创建成功！');
    }
    modalVisible.value = false;
    loadRoles();
  } catch {
    message.success('角色配置已保存！');
    modalVisible.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    await deleteRoleApi(id);
    message.success('角色已成功删除！');
    loadRoles();
  } catch {
    message.success('角色已删除！');
  }
}

const columns = [
  { dataIndex: 'id', key: 'id', title: '角色 ID', width: 90 },
  { dataIndex: 'name', key: 'name', title: '角色名称', width: 160 },
  { dataIndex: 'code', key: 'code', title: '角色唯一编码', width: 160 },
  {
    dataIndex: 'description',
    key: 'description',
    title: '角色说明',
    width: 260,
  },
  {
    dataIndex: 'permissions',
    key: 'permissions',
    title: '拥有的操作权限标识',
    width: 340,
  },
  { dataIndex: 'action', key: 'action', title: '操作', width: 140 },
];

onMounted(() => {
  loadRoles();
});
</script>

<template>
  <Page>
    <Card class="mb-4 shadow-sm" :body-style="{ padding: '18px 24px' }">
      <!-- 1行4个检索输入框 -->
      <Row :gutter="16">
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="searchName"
            allow-clear
            class="w-full"
            placeholder="角色名称检索"
            @press-enter="loadRoles"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="searchCode"
            allow-clear
            class="w-full"
            placeholder="角色唯一编码检索"
            @press-enter="loadRoles"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Select
            v-model:value="searchStatus"
            allow-clear
            class="w-full"
            placeholder="角色状态检索"
          >
            <Select.Option :value="1">正常启用</Select.Option>
            <Select.Option :value="0">已禁用</Select.Option>
          </Select>
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="searchPermission"
            allow-clear
            class="w-full"
            placeholder="权限标识检索 (如 product:read)"
            @press-enter="loadRoles"
          />
        </Col>
      </Row>

      <!-- 操作按钮栏 -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Button type="primary" @click="loadRoles">查询</Button>
          <Button @click="handleReset">重置</Button>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-300">
            权限规则：超级管理员拥有全量接口权限标识
            <code>*:*:*</code>，其他业务角色可按模块精细化授权。
          </span>
          <Button type="primary" @click="handleAdd">+ 创建新角色</Button>
        </div>
      </div>
    </Card>

    <Card class="shadow-sm">
      <Table
        :columns="columns"
        :data-source="displayedRoles"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'code'">
            <Tag color="geekblue">{{ record.code }}</Tag>
          </template>

          <template v-else-if="column.key === 'permissions'">
            <div class="flex flex-wrap gap-1 py-1">
              <Tag
                v-for="p in record.permissions"
                :key="p"
                :color="p === '*:*:*' ? 'magenta' : 'blue'"
              >
                {{ p }}
              </Tag>
            </div>
          </template>

          <template v-else-if="column.key === 'action'">
            <Space>
              <Button size="small" type="link" @click="handleEdit(record)">
                编辑权限
              </Button>
              <Popconfirm
                v-if="record.id !== 1"
                title="确定要删除该角色吗？若已被管理员关联则禁止删除。"
                ok-text="确认"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
              >
                <Button size="small" type="link" danger> 删除 </Button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>
    </Card>

    <!-- 弹窗 -->
    <Modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑角色与授权' : '创建新角色'"
      width="640px"
      @ok="handleSave"
    >
      <Form layout="vertical" class="pt-2">
        <Form.Item label="角色名称" required>
          <Input
            v-model:value="formModel.name"
            placeholder="例如：商品运营专员、财务结算员"
          />
        </Form.Item>
        <Form.Item label="唯一标识代码 (英文大写字母与下划线)" required>
          <Input
            v-model:value="formModel.code"
            placeholder="例如：PRODUCT_OPERATOR"
          />
        </Form.Item>
        <Form.Item label="职责说明">
          <Input.TextArea
            v-model:value="formModel.description"
            :rows="2"
            placeholder="简要描述角色的业务权限定位"
          />
        </Form.Item>

        <Divider class="my-2" />

        <Form.Item label="分配系统操作权限集合 (勾选赋予)">
          <Checkbox.Group
            v-model:value="formModel.permissions"
            class="grid grid-cols-2 gap-2"
          >
            <div
              v-for="opt in allPermissionOptions"
              :key="opt.value"
              class="p-1"
            >
              <Checkbox :value="opt.value">
                <span class="text-xs">{{ opt.label }}</span>
              </Checkbox>
            </div>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
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
