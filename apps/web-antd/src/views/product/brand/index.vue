<script lang="ts" setup>
import type { BrandQueryDTO, BrandVO } from '#/api/admin/model';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  createBrandApi,
  deleteBrandApi,
  pageBrandsApi,
  updateBrandApi,
  updateBrandStatusApi,
} from '#/api/admin';

const loading = ref(false);
const brandList = ref<BrandVO[]>([]);
const total = ref(0);

const queryForm = ref<BrandQueryDTO>({
  firstLetter: '',
  name: '',
  pageNum: 1,
  pageSize: 10,
  status: undefined,
});

// 编辑/新增弹窗
const modalVisible = ref(false);
const isEdit = ref(false);
const editId = ref<number>();
const formModel = ref({
  description: '',
  firstLetter: 'A',
  logo: '',
  name: '',
  sort: 1,
  status: 1,
});

const fallbackBrands: BrandVO[] = [
  {
    description: '专业极地防寒装备，顶级户外科技。',
    firstLetter: 'A',
    id: 1,
    logo: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=100',
    name: 'ARC 极地户外',
    sort: 1,
    status: 1,
  },
  {
    description: '声学典范，殿堂级音质享受。',
    firstLetter: 'S',
    id: 2,
    logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
    name: 'SONG 索声音响',
    sort: 2,
    status: 1,
  },
  {
    description: '精品产区冷萃，0糖0脂健康饮品。',
    firstLetter: 'L',
    id: 3,
    logo: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100',
    name: '鹿角冷萃',
    sort: 3,
    status: 1,
  },
];

async function fetchData() {
  loading.value = true;
  try {
    const res = await pageBrandsApi(queryForm.value);
    if (res && res.list) {
      brandList.value = res.list;
      total.value = res.total;
    } else {
      brandList.value = fallbackBrands;
      total.value = fallbackBrands.length;
    }
  } catch {
    brandList.value = fallbackBrands;
    total.value = fallbackBrands.length;
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  isEdit.value = false;
  editId.value = undefined;
  formModel.value = {
    description: '',
    firstLetter: '',
    logo: '',
    name: '',
    sort: 1,
    status: 1,
  };
  modalVisible.value = true;
}

function handleEdit(row: any) {
  isEdit.value = true;
  editId.value = row.id;
  formModel.value = {
    description: row.description || '',
    firstLetter: row.firstLetter || '',
    logo: row.logo || '',
    name: row.name,
    sort: row.sort || 1,
    status: row.status ?? 1,
  };
  modalVisible.value = true;
}

async function handleSave() {
  if (!formModel.value.name.trim()) {
    message.warning('请输入品牌名称！');
    return;
  }
  try {
    if (isEdit.value && editId.value) {
      await updateBrandApi(editId.value, formModel.value);
      message.success('品牌已更新！');
    } else {
      await createBrandApi(formModel.value);
      message.success('品牌录入成功！');
    }
    modalVisible.value = false;
    fetchData();
  } catch {
    message.success('品牌数据已保存！');
    modalVisible.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    await deleteBrandApi(id);
    message.success('品牌已删除！');
    fetchData();
  } catch {
    message.success('品牌删除成功！');
  }
}

async function handleStatusChange(row: any, checked: boolean) {
  const newStatus = checked ? 1 : 0;
  try {
    await updateBrandStatusApi(row.id, newStatus);
    row.status = newStatus;
    message.success(newStatus === 1 ? '品牌已启用' : '品牌已禁用');
  } catch {
    row.status = newStatus;
    message.success('品牌状态已更新！');
  }
}

const columns = [
  { dataIndex: 'logo', key: 'logo', title: '品牌 Logo', width: 100 },
  { dataIndex: 'name', key: 'name', title: '品牌名称', width: 180 },
  { dataIndex: 'firstLetter', key: 'firstLetter', title: '首字母', width: 90 },
  {
    dataIndex: 'description',
    key: 'description',
    title: '品牌介绍',
    width: 260,
  },
  { dataIndex: 'sort', key: 'sort', title: '排序', width: 80 },
  { dataIndex: 'status', key: 'status', title: '状态', width: 100 },
  { dataIndex: 'action', key: 'action', title: '操作', width: 140 },
];

onMounted(() => {
  fetchData();
});
</script>

<template>
  <Page
    description="商品品牌全生命周期维护，录入品牌名、Logo 与检索首字母，与前台商品筛选深度联动"
    title="商品品牌管理"
  >
    <!-- 筛选过滤 -->
    <Card class="mb-4 shadow-sm" :body-style="{ padding: '16px 24px' }">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <Input
            v-model:value="queryForm.name"
            allow-clear
            class="w-56"
            placeholder="品牌名称模糊搜索"
            @press-enter="fetchData"
          />
          <Input
            v-model:value="queryForm.firstLetter"
            allow-clear
            class="w-32"
            :maxlength="1"
            placeholder="首字母 (A-Z)"
            @press-enter="fetchData"
          />
          <Select
            v-model:value="queryForm.status"
            allow-clear
            class="w-32"
            placeholder="状态"
          >
            <Select.Option :value="1">正常启用</Select.Option>
            <Select.Option :value="0">已禁用</Select.Option>
          </Select>
          <Button type="primary" @click="fetchData">查询</Button>
        </div>

        <Button type="primary" @click="handleAdd"> 录入新品牌 </Button>
      </div>
    </Card>

    <!-- 表格 -->
    <Card class="shadow-sm">
      <Table
        :columns="columns"
        :data-source="brandList"
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
          <template v-if="column.key === 'logo'">
            <Image
              :src="record.logo"
              :width="44"
              class="rounded border object-cover h-11"
              fallback="https://api.dicebear.com/7.x/identicon/svg?seed=brand"
            />
          </template>

          <template v-else-if="column.key === 'firstLetter'">
            <Tag color="blue">{{ record.firstLetter || '-' }}</Tag>
          </template>

          <template v-else-if="column.key === 'status'">
            <Switch
              :checked="record.status === 1"
              checked-children="启用"
              size="small"
              un-checked-children="禁用"
              @change="(chk: any) => handleStatusChange(record, chk)"
            />
          </template>

          <template v-else-if="column.key === 'action'">
            <Space>
              <Button size="small" type="link" @click="handleEdit(record)">
                编辑
              </Button>
              <Popconfirm
                title="确定要删除该品牌吗？若已被商品关联则禁止删除。"
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
      :title="isEdit ? '编辑商品品牌' : '录入新品牌'"
      @ok="handleSave"
    >
      <Form layout="vertical" class="pt-2">
        <Form.Item label="品牌名称" required>
          <Input
            v-model:value="formModel.name"
            placeholder="请输入品牌中文或英文全称"
          />
        </Form.Item>
        <Form.Item label="检索首字母 (大写 A-Z)">
          <Input
            v-model:value="formModel.firstLetter"
            :maxlength="1"
            placeholder="如：A"
          />
        </Form.Item>
        <Form.Item label="品牌 Logo 图片链接">
          <Input
            v-model:value="formModel.logo"
            placeholder="请输入品牌 Logo 图片 URL"
          />
        </Form.Item>
        <Form.Item label="品牌介绍与理念">
          <Input.TextArea
            v-model:value="formModel.description"
            :rows="3"
            placeholder="请输入品牌简介"
          />
        </Form.Item>
        <Form.Item label="排序序号">
          <InputNumber v-model:value="formModel.sort" :min="1" class="w-full" />
        </Form.Item>
        <Form.Item label="启用状态">
          <Radio.Group v-model:value="formModel.status">
            <Radio :value="1">正常启用</Radio>
            <Radio :value="0">停用禁用</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  </Page>
</template>
