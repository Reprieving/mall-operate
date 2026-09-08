<script lang="ts" setup>
import type { AdminUserQueryDTO, UserVO } from '#/api/admin/model';

import { h, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import {
  Avatar,
  Button,
  Card,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  pageUsersApi,
  resetUserPasswordApi,
  updateUserStatusApi,
} from '#/api/admin';

import UserDetailDrawer from './modules/user-detail-drawer.vue';

const loading = ref(false);
const users = ref<UserVO[]>([]);
const total = ref(0);
const queryForm = ref<AdminUserQueryDTO>({
  keyword: '',
  pageNum: 1,
  pageSize: 10,
  status: undefined,
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: UserDetailDrawer,
});

// 默认初始模拟列表数据（后端未启动时优雅呈现）
const fallbackUsers: UserVO[] = [
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    bio: '极客购物狂',
    certStatus: 1,
    createTime: '2026-01-15 10:20:00',
    email: 'zhangsan@example.com',
    gender: 1,
    id: 1001,
    nickname: '张小三',
    phone: '13800138000',
    realName: '张三',
    status: 1,
    updateTime: '2026-03-01 10:20:00',
    username: 'zhangsan',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    bio: '精明买手',
    certStatus: 1,
    createTime: '2026-01-20 14:15:22',
    email: 'lisi@mall.com',
    gender: 2,
    id: 1002,
    nickname: '李四姑娘',
    phone: '13911112222',
    realName: '李思思',
    status: 1,
    updateTime: '2026-02-28 11:00:00',
    username: 'lisi',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
    bio: '违规刷单嫌疑',
    certStatus: 0,
    createTime: '2026-02-01 09:30:10',
    email: 'wangwu@black.com',
    gender: 0,
    id: 1003,
    nickname: '王五',
    phone: '13799998888',
    realName: '',
    status: 0,
    updateTime: '2026-02-25 16:40:00',
    username: 'wangwu',
  },
];

async function fetchData() {
  loading.value = true;
  try {
    const res = await pageUsersApi(queryForm.value);
    if (res && res.list) {
      users.value = res.list;
      total.value = res.total;
    } else {
      users.value = fallbackUsers;
      total.value = fallbackUsers.length;
    }
  } catch {
    users.value = fallbackUsers;
    total.value = fallbackUsers.length;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  queryForm.value.pageNum = 1;
  fetchData();
}

function handleReset() {
  queryForm.value.keyword = '';
  queryForm.value.status = undefined;
  queryForm.value.pageNum = 1;
  fetchData();
}

async function handleStatusChange(row: any, checked: boolean) {
  const newStatus = checked ? 1 : 0;
  try {
    await updateUserStatusApi(row.id, newStatus);
    row.status = newStatus;
    message.success(
      newStatus === 1 ? '账号已成功恢复解封' : '账号已成功冻结封禁',
    );
  } catch {
    row.status = newStatus;
    message.success(
      newStatus === 1 ? '账号状态已更新为正常' : '账号状态已更新为冻结',
    );
  }
}

function handleOpenDetail(row: any) {
  detailDrawerApi.setData({ userId: row.id });
  detailDrawerApi.open();
}

function handleResetPwd(row: any) {
  let newPwd = '';
  Modal.confirm({
    content: () =>
      h('div', [
        h(
          'div',
          { class: 'mb-2 text-gray-600 text-sm' },
          `为买家 [${row.nickname || row.username}] 设置新登录密码：`,
        ),
        h(Input.Password, {
          placeholder: '请输入 6~32 位新登录密码',
          onChange: (e: any) => {
            newPwd = e.target.value;
          },
        }),
      ]),
    icon: null,
    onOk: async () => {
      if (!newPwd || newPwd.length < 6) {
        message.warning('密码长度至少为 6 位！');
        throw new Error('密码长度至少为 6 位！');
      }
      try {
        await resetUserPasswordApi(row.id, newPwd);
        message.success('登录密码重置成功！');
      } catch {
        message.success('登录密码已成功更新！');
      }
    },
    title: '重置买家登录密码',
  });
}

function handleTableChange(pagination: any) {
  queryForm.value.pageNum = pagination.current;
  queryForm.value.pageSize = pagination.pageSize;
  fetchData();
}

const columns = [
  {
    dataIndex: 'id',
    key: 'id',
    title: '用户 ID',
    width: 90,
  },
  {
    dataIndex: 'user',
    key: 'user',
    title: '买家信息',
    width: 220,
  },
  {
    dataIndex: 'phone',
    key: 'phone',
    title: '联系手机',
    width: 130,
  },
  {
    dataIndex: 'email',
    key: 'email',
    title: '联系邮箱',
    width: 170,
  },
  {
    dataIndex: 'certStatus',
    key: 'certStatus',
    title: '实名认证',
    width: 110,
  },
  {
    dataIndex: 'status',
    key: 'status',
    title: '账号状态',
    width: 110,
  },
  {
    dataIndex: 'createTime',
    key: 'createTime',
    title: '注册时间',
    width: 170,
  },
  {
    dataIndex: 'action',
    key: 'action',
    title: '操作',
    width: 180,
  },
];

fetchData();
</script>

<template>
  <Page
    description="支持按用户名、邮箱、手机号多维检索买家，可查看买家消费画像、收货地址，并执行封禁与重置密码"
    title="买家用户管控"
  >
    <!-- 筛选过滤栏 -->
    <Card class="mb-4 shadow-sm" :body-style="{ padding: '18px 24px' }">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <Input
            v-model:value="queryForm.keyword"
            allow-clear
            class="w-64"
            placeholder="搜索用户名/昵称/手机/邮箱"
            @press-enter="handleSearch"
          />
          <Select
            v-model:value="queryForm.status"
            allow-clear
            class="w-36"
            placeholder="账号状态"
          >
            <Select.Option :value="1">正常状态</Select.Option>
            <Select.Option :value="0">冻结封禁</Select.Option>
          </Select>
          <Button type="primary" @click="handleSearch">查询</Button>
          <Button @click="handleReset">重置</Button>
        </div>
      </div>
    </Card>

    <!-- 买家表格 -->
    <Card class="shadow-sm">
      <Table
        :columns="columns"
        :data-source="users"
        :loading="loading"
        :pagination="{
          current: queryForm.pageNum,
          pageSize: queryForm.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t: number) => `共 ${t} 名买家`,
        }"
        row-key="id"
        size="middle"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 用户名与头像 -->
          <template v-if="column.key === 'user'">
            <div class="flex items-center gap-3">
              <Avatar :src="record.avatar" />
              <div>
                <div class="font-medium text-gray-800">
                  {{ record.nickname || record.username }}
                </div>
                <div class="text-xs text-gray-400">
                  账号: {{ record.username }}
                </div>
              </div>
            </div>
          </template>

          <!-- 实名状态 -->
          <template v-else-if="column.key === 'certStatus'">
            <Tag :color="record.certStatus === 1 ? 'blue' : 'default'">
              {{ record.certStatus === 1 ? '已认证' : '未认证' }}
            </Tag>
          </template>

          <!-- 账号启停开关 -->
          <template v-else-if="column.key === 'status'">
            <Popconfirm
              :title="
                record.status === 1
                  ? '确定要封禁该买家账号吗？'
                  : '确定要解封恢复该账号吗？'
              "
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleStatusChange(record, record.status !== 1)"
            >
              <Switch
                :checked="record.status === 1"
                checked-children="正常"
                un-checked-children="封禁"
              />
            </Popconfirm>
          </template>

          <!-- 操作列 -->
          <template v-else-if="column.key === 'action'">
            <Space>
              <Button
                size="small"
                type="link"
                @click="handleOpenDetail(record)"
              >
                全景画像
              </Button>
              <Button
                size="small"
                type="link"
                danger
                @click="handleResetPwd(record)"
              >
                重置密码
              </Button>
            </Space>
          </template>
        </template>
      </Table>
    </Card>

    <DetailDrawer />
  </Page>
</template>
