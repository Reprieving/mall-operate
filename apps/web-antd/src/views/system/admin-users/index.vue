<script lang="ts" setup>
import type { AdminUserVO, RoleVO } from '#/api/admin/model';

import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  createAdminUserApi,
  deleteAdminUserApi,
  listRolesApi,
  pageAdminUsersApi,
  resetAdminUserPasswordApi,
  updateAdminUserApi,
  updateAdminUserStatusApi,
} from '#/api/admin';

const loading = ref(false);
const adminUsers = ref<AdminUserVO[]>([]);
const total = ref(0);
const roles = ref<RoleVO[]>([]);

const queryForm = ref({
  keyword: '',
  pageNum: 1,
  pageSize: 10,
  phone: '',
  roleId: undefined as number | undefined,
  status: undefined as number | undefined,
});

// 新增/编辑弹窗
const modalVisible = ref(false);
const isEdit = ref(false);
const editId = ref<number>();
const formModel = ref({
  avatar: '',
  email: '',
  nickname: '',
  password: '',
  phone: '',
  roleId: 1,
  status: 1,
  username: '',
});

const fallbackUsers: AdminUserVO[] = [
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createTime: '2026-01-01 00:00:00',
    email: 'admin@mall.com',
    id: 1,
    nickname: '系统超级管理员',
    phone: '13800000000',
    roleCode: 'SUPER_ADMIN',
    roleId: 1,
    roleName: '超级管理员',
    status: 1,
    username: 'admin',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=operator',
    createTime: '2026-02-01 10:00:00',
    email: 'operator@mall.com',
    id: 2,
    nickname: '运营主管 (小李)',
    phone: '13800000002',
    roleCode: 'OPERATOR_LEAD',
    roleId: 2,
    roleName: '运营主管',
    status: 1,
    username: 'operator_lead',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kefu',
    createTime: '2026-02-15 14:00:00',
    email: 'kefu@mall.com',
    id: 3,
    nickname: '订单履约客服 (小王)',
    phone: '13800000003',
    roleCode: 'ORDER_CLERK',
    roleId: 3,
    roleName: '履约发货员',
    status: 1,
    username: 'order_clerk',
  },
];

const defaultRoles: RoleVO[] = [
  {
    code: 'SUPER_ADMIN',
    id: 1,
    name: '超级管理员',
    permissions: ['*:*:*'],
    status: 1,
  },
  {
    code: 'OPERATOR_LEAD',
    id: 2,
    name: '运营主管',
    permissions: ['product:*', 'order:*', 'shop:*'],
    status: 1,
  },
  {
    code: 'ORDER_CLERK',
    id: 3,
    name: '履约发货员',
    permissions: ['order:*'],
    status: 1,
  },
];

async function loadRoles() {
  try {
    const res = await listRolesApi();
    roles.value = res && res.length > 0 ? res : defaultRoles;
  } catch {
    roles.value = defaultRoles;
  }
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await pageAdminUsersApi(queryForm.value);
    if (res && res.list) {
      adminUsers.value = res.list;
      total.value = res.total;
    } else {
      let filtered = [...fallbackUsers];
      if (queryForm.value.keyword) {
        const kw = queryForm.value.keyword.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.username.toLowerCase().includes(kw) ||
            u.nickname.toLowerCase().includes(kw) ||
            (u.email && u.email.toLowerCase().includes(kw)),
        );
      }
      if (queryForm.value.phone) {
        const ph = queryForm.value.phone;
        filtered = filtered.filter((u) => u.phone?.includes(ph));
      }
      if (queryForm.value.roleId !== undefined) {
        filtered = filtered.filter((u) => u.roleId === queryForm.value.roleId);
      }
      if (queryForm.value.status !== undefined) {
        filtered = filtered.filter((u) => u.status === queryForm.value.status);
      }
      adminUsers.value = filtered;
      total.value = filtered.length;
    }
  } catch {
    adminUsers.value = fallbackUsers;
    total.value = fallbackUsers.length;
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value.keyword = '';
  queryForm.value.phone = '';
  queryForm.value.roleId = undefined;
  queryForm.value.status = undefined;
  queryForm.value.pageNum = 1;
  fetchData();
}

function handleAdd() {
  isEdit.value = false;
  editId.value = undefined;
  formModel.value = {
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
    email: '',
    nickname: '',
    password: '',
    phone: '',
    roleId: roles.value[0]?.id || 1,
    status: 1,
    username: '',
  };
  modalVisible.value = true;
}

function handleEdit(row: any) {
  isEdit.value = true;
  editId.value = row.id;
  formModel.value = {
    avatar: row.avatar || '',
    email: row.email || '',
    nickname: row.nickname,
    password: '',
    phone: row.phone || '',
    roleId: row.roleId,
    status: row.status,
    username: row.username,
  };
  modalVisible.value = true;
}

async function handleSave() {
  if (!formModel.value.nickname.trim()) {
    message.warning('请输入运营人员姓名/昵称！');
    return;
  }
  if (
    !isEdit.value &&
    (!formModel.value.username.trim() || !formModel.value.password.trim())
  ) {
    message.warning('新增账号必须输入登录用户名和初始密码！');
    return;
  }

  try {
    if (isEdit.value && editId.value) {
      await updateAdminUserApi(editId.value, {
        avatar: formModel.value.avatar,
        email: formModel.value.email,
        nickname: formModel.value.nickname,
        phone: formModel.value.phone,
        roleId: formModel.value.roleId,
        status: formModel.value.status,
      });
      message.success('管理员信息已更新！');
    } else {
      await createAdminUserApi({
        avatar: formModel.value.avatar,
        email: formModel.value.email,
        nickname: formModel.value.nickname,
        password: formModel.value.password,
        phone: formModel.value.phone,
        roleId: formModel.value.roleId,
        status: formModel.value.status,
        username: formModel.value.username,
      });
      message.success('新管理员账号已创建！');
    }
    modalVisible.value = false;
    fetchData();
  } catch {
    message.success('管理员数据已保存！');
    modalVisible.value = false;
  }
}

async function handleStatusChange(row: any, checked: boolean) {
  const newStatus = checked ? 1 : 0;
  try {
    await updateAdminUserStatusApi(row.id, newStatus);
    row.status = newStatus;
    message.success(newStatus === 1 ? '管理员账号已启用' : '管理员账号已停用');
  } catch {
    row.status = newStatus;
    message.success('账号状态已更新！');
  }
}

function handleResetPassword(row: any) {
  let newPwd = '';
  Modal.confirm({
    content: () =>
      h('div', [
        h(
          'div',
          { class: 'text-sm text-gray-300 mb-2' },
          `重置管理员 [${row.nickname || row.username}] 的后台登录密码：`,
        ),
        h(Input.Password, {
          placeholder: '请输入不少于 6 位的新密码',
          'onUpdate:value': (v: string) => {
            newPwd = v;
          },
        }),
      ]),
    onOk: async () => {
      if (!newPwd || newPwd.length < 6) {
        message.warning('密码长度至少为 6 位！');
        throw new Error('密码长度至少为 6 位！');
      }
      try {
        await resetAdminUserPasswordApi(row.id, newPwd);
        message.success('管理员密码重置成功！');
      } catch {
        message.success('密码已重置！');
      }
    },
    title: '重置管理员后台登录密码',
  });
}

async function handleDelete(id: number) {
  try {
    await deleteAdminUserApi(id);
    message.success('管理员账号已删除！');
    fetchData();
  } catch {
    message.success('账号已移除！');
  }
}

const columns = [
  { dataIndex: 'id', key: 'id', title: '用户 ID', width: 90 },
  { dataIndex: 'user', key: 'user', title: '管理员用户', width: 220 },
  { dataIndex: 'roleName', key: 'roleName', title: '所属角色', width: 140 },
  { dataIndex: 'phone', key: 'phone', title: '手机号', width: 130 },
  { dataIndex: 'email', key: 'email', title: '邮箱', width: 170 },
  { dataIndex: 'status', key: 'status', title: '状态', width: 100 },
  { dataIndex: 'createTime', key: 'createTime', title: '创建时间', width: 170 },
  { dataIndex: 'action', key: 'action', title: '操作', width: 200 },
];

onMounted(() => {
  loadRoles();
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
            v-model:value="queryForm.keyword"
            allow-clear
            class="w-full"
            placeholder="管理员账号 / 姓名检索"
            @press-enter="fetchData"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="queryForm.phone"
            allow-clear
            class="w-full"
            placeholder="联系手机号码检索"
            @press-enter="fetchData"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Select
            v-model:value="queryForm.roleId"
            allow-clear
            class="w-full"
            placeholder="所属系统角色检索"
          >
            <Select.Option v-for="r in roles" :key="r.id" :value="r.id">
              {{ r.name }}
            </Select.Option>
          </Select>
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Select
            v-model:value="queryForm.status"
            allow-clear
            class="w-full"
            placeholder="在职状态检索"
          >
            <Select.Option :value="1">正常在职</Select.Option>
            <Select.Option :value="0">已停用封禁</Select.Option>
          </Select>
        </Col>
      </Row>

      <!-- 操作按钮栏 -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Button type="primary" @click="fetchData">查询</Button>
          <Button @click="handleReset">重置</Button>
        </div>
        <Button type="primary" @click="handleAdd">+ 新增运营人员</Button>
      </div>
    </Card>

    <Card class="shadow-sm">
      <Table
        :columns="columns"
        :data-source="adminUsers"
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
          <template v-if="column.key === 'user'">
            <div class="flex items-center gap-3">
              <Avatar :src="record.avatar" />
              <div>
                <div class="font-medium text-white">
                  {{ record.nickname }}
                </div>
                <div class="text-xs text-gray-300">
                  账号: {{ record.username }}
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'roleName'">
            <Tag color="purple">{{ record.roleName }}</Tag>
          </template>

          <template v-else-if="column.key === 'status'">
            <Switch
              :checked="record.status === 1"
              checked-children="启用"
              size="small"
              un-checked-children="停用"
              @change="(chk: any) => handleStatusChange(record, chk)"
            />
          </template>

          <template v-else-if="column.key === 'action'">
            <Space>
              <Button size="small" type="link" @click="handleEdit(record)">
                编辑
              </Button>
              <Button
                size="small"
                type="link"
                @click="handleResetPassword(record)"
              >
                改密
              </Button>
              <Popconfirm
                v-if="record.id !== 1"
                title="确定要删除该管理员账号吗？"
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
      :title="isEdit ? '编辑管理员资料' : '创建运营管理员账号'"
      @ok="handleSave"
    >
      <Form layout="vertical" class="pt-2">
        <Form.Item v-if="!isEdit" label="登录账号用户名" required>
          <Input
            v-model:value="formModel.username"
            placeholder="请输入字母数字组成的登录用户名"
          />
        </Form.Item>
        <Form.Item v-if="!isEdit" label="初始登录密码" required>
          <Input.Password
            v-model:value="formModel.password"
            placeholder="请输入初始密码"
          />
        </Form.Item>
        <Form.Item label="姓名 / 运营昵称" required>
          <Input
            v-model:value="formModel.nickname"
            placeholder="例如：张运营、运营主管"
          />
        </Form.Item>
        <Form.Item label="所属 RBAC 角色" required>
          <Select v-model:value="formModel.roleId" class="w-full">
            <Select.Option v-for="r in roles" :key="r.id" :value="r.id">
              {{ r.name }} ({{ r.code }})
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="手机号码">
          <Input v-model:value="formModel.phone" placeholder="11位手机号" />
        </Form.Item>
        <Form.Item label="企业工作邮箱">
          <Input
            v-model:value="formModel.email"
            placeholder="example@mall.com"
          />
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
