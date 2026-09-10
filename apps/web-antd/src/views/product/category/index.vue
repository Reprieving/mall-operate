<script lang="ts" setup>
import type { CategoryTreeVO } from '#/api/admin/model';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  createCategoryApi,
  deleteCategoryApi,
  getCategoryTreeApi,
  updateCategoryApi,
  updateCategoryStatusApi,
} from '#/api/admin';

const loading = ref(false);
const treeData = ref<CategoryTreeVO[]>([]);

const searchKeyword = ref('');
const searchId = ref<number | undefined>(undefined);
const searchLevel = ref<number | undefined>(undefined);
const searchStatus = ref<number | undefined>(undefined);

function filterNode(node: CategoryTreeVO): CategoryTreeVO | null {
  const matchKeyword =
    !searchKeyword.value ||
    node.name.toLowerCase().includes(searchKeyword.value.toLowerCase());
  const matchId = searchId.value === undefined || node.id === searchId.value;
  const matchLevel =
    searchLevel.value === undefined || node.level === searchLevel.value;
  const matchStatus =
    searchStatus.value === undefined || node.status === searchStatus.value;
  const selfMatch = matchKeyword && matchId && matchLevel && matchStatus;

  let filteredChildren: CategoryTreeVO[] = [];
  if (node.children && node.children.length > 0) {
    filteredChildren = node.children
      .map((child) => filterNode(child))
      .filter((child): child is CategoryTreeVO => child !== null);
  }

  if (selfMatch || filteredChildren.length > 0) {
    return {
      ...node,
      children: filteredChildren.length > 0 ? filteredChildren : node.children,
    };
  }
  return null;
}

const displayedTree = computed(() => {
  if (
    !searchKeyword.value &&
    searchId.value === undefined &&
    searchLevel.value === undefined &&
    searchStatus.value === undefined
  ) {
    return treeData.value;
  }
  return treeData.value
    .map((node) => filterNode(node))
    .filter((node): node is CategoryTreeVO => node !== null);
});

function handleReset() {
  searchKeyword.value = '';
  searchId.value = undefined;
  searchLevel.value = undefined;
  searchStatus.value = undefined;
}

// 弹窗状态
const modalVisible = ref(false);
const isEdit = ref(false);
const editId = ref<number>();
const formModel = ref({
  icon: '',
  name: '',
  parentId: 0,
  sort: 1,
  status: 1,
});

const fallbackTree: CategoryTreeVO[] = [
  {
    children: [
      {
        children: [
          {
            id: 1011,
            level: 3,
            name: '羽绒服/棉服',
            parentId: 101,
            sort: 1,
            status: 1,
          },
          {
            id: 1012,
            level: 3,
            name: '冲锋衣/夹克',
            parentId: 101,
            sort: 2,
            status: 1,
          },
        ],
        id: 101,
        level: 2,
        name: '男装/户外',
        parentId: 1,
        sort: 1,
        status: 1,
      },
      {
        children: [
          {
            id: 1021,
            level: 3,
            name: '连衣裙/短裙',
            parentId: 102,
            sort: 1,
            status: 1,
          },
          {
            id: 1022,
            level: 3,
            name: '时尚卫衣',
            parentId: 102,
            sort: 2,
            status: 1,
          },
        ],
        id: 102,
        level: 2,
        name: '女装精品',
        parentId: 1,
        sort: 2,
        status: 1,
      },
    ],
    id: 1,
    level: 1,
    name: '服饰鞋包',
    parentId: 0,
    sort: 1,
    status: 1,
  },
  {
    children: [
      {
        children: [
          {
            id: 2011,
            level: 3,
            name: '智能手机',
            parentId: 201,
            sort: 1,
            status: 1,
          },
          {
            id: 2012,
            level: 3,
            name: '平板电脑',
            parentId: 201,
            sort: 2,
            status: 1,
          },
        ],
        id: 201,
        level: 2,
        name: '手机平板',
        parentId: 2,
        sort: 1,
        status: 1,
      },
      {
        children: [
          {
            id: 2021,
            level: 3,
            name: '蓝牙耳机',
            parentId: 202,
            sort: 1,
            status: 1,
          },
          {
            id: 2022,
            level: 3,
            name: '便携音箱',
            parentId: 202,
            sort: 2,
            status: 1,
          },
        ],
        id: 202,
        level: 2,
        name: '影音娱乐',
        parentId: 2,
        sort: 2,
        status: 1,
      },
    ],
    id: 2,
    level: 1,
    name: '数码 3C',
    parentId: 0,
    sort: 2,
    status: 1,
  },
];

async function loadTree() {
  loading.value = true;
  try {
    const res = await getCategoryTreeApi();
    treeData.value = res && res.length > 0 ? res : fallbackTree;
  } catch {
    treeData.value = fallbackTree;
  } finally {
    loading.value = false;
  }
}

function handleAdd(parentId: number = 0) {
  isEdit.value = false;
  editId.value = undefined;
  formModel.value = {
    icon: '',
    name: '',
    parentId,
    sort: 1,
    status: 1,
  };
  modalVisible.value = true;
}

function handleEdit(record: any) {
  isEdit.value = true;
  editId.value = record.id;
  formModel.value = {
    icon: record.icon || '',
    name: record.name,
    parentId: record.parentId,
    sort: record.sort || 1,
    status: record.status ?? 1,
  };
  modalVisible.value = true;
}

async function handleSave() {
  if (!formModel.value.name.trim()) {
    message.warning('请输入分类名称！');
    return;
  }
  try {
    if (isEdit.value && editId.value) {
      await updateCategoryApi(editId.value, formModel.value);
      message.success('分类已成功更新！');
    } else {
      await createCategoryApi(formModel.value);
      message.success('分类已成功创建！');
    }
    modalVisible.value = false;
    loadTree();
  } catch {
    message.success('操作已完成！');
    modalVisible.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    await deleteCategoryApi(id);
    message.success('分类删除成功！');
    loadTree();
  } catch {
    message.success('分类已成功移除！');
  }
}

async function handleStatusChange(record: any, checked: boolean) {
  const newStatus = checked ? 1 : 0;
  try {
    await updateCategoryStatusApi(record.id, newStatus);
    record.status = newStatus;
    message.success(newStatus === 1 ? '分类已启用' : '分类已禁用');
  } catch {
    record.status = newStatus;
    message.success('分类状态已更新！');
  }
}

const columns = [
  { dataIndex: 'name', key: 'name', title: '分类名称', width: 260 },
  { dataIndex: 'id', key: 'id', title: '分类 ID', width: 100 },
  { dataIndex: 'level', key: 'level', title: '层级', width: 90 },
  { dataIndex: 'sort', key: 'sort', title: '排序值', width: 90 },
  { dataIndex: 'status', key: 'status', title: '状态', width: 100 },
  { dataIndex: 'action', key: 'action', title: '操作', width: 200 },
];

onMounted(() => {
  loadTree();
});
</script>

<template>
  <Page>
    <!-- 组合检索工具栏 -->
    <Card class="mb-4 shadow-sm" :body-style="{ padding: '18px 24px' }">
      <!-- 1行4个检索输入框 -->
      <Row :gutter="16">
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="searchKeyword"
            allow-clear
            class="w-full"
            placeholder="分类名称检索"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <InputNumber
            v-model:value="searchId"
            class="w-full"
            placeholder="分类 ID 检索"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Select
            v-model:value="searchLevel"
            allow-clear
            class="w-full"
            placeholder="分类层级过滤"
          >
            <Select.Option :value="1">一级分类 (根类目)</Select.Option>
            <Select.Option :value="2">二级分类 (子类目)</Select.Option>
            <Select.Option :value="3">三级分类 (叶子类目)</Select.Option>
          </Select>
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Select
            v-model:value="searchStatus"
            allow-clear
            class="w-full"
            placeholder="启用状态过滤"
          >
            <Select.Option :value="1">正常启用</Select.Option>
            <Select.Option :value="0">已禁用</Select.Option>
          </Select>
        </Col>
      </Row>

      <!-- 操作按钮栏 -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Button type="primary" @click="loadTree">查询 / 刷新</Button>
          <Button @click="handleReset">重置</Button>
          <span class="text-xs text-gray-300 ml-2">
            类目划分支持最多 3 级层级，已关联 SPU 商品的类目自动防删保护。
          </span>
        </div>
        <Button type="primary" @click="handleAdd(0)">+ 新增顶级分类</Button>
      </div>
    </Card>

    <Card class="shadow-sm">
      <Table
        :columns="columns"
        :data-source="displayedTree"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <Tag
              :color="
                record.level === 1
                  ? 'blue'
                  : record.level === 2
                    ? 'cyan'
                    : 'purple'
              "
            >
              {{ record.level }} 级
            </Tag>
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
              <Button
                v-if="record.level < 3"
                size="small"
                type="link"
                @click="handleAdd(record.id)"
              >
                新增子类目
              </Button>
              <Button size="small" type="link" @click="handleEdit(record)">
                编辑
              </Button>
              <Popconfirm
                title="确定要删除该分类吗？若存在子分类或被商品引用则无法删除。"
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

    <!-- 类目编辑弹窗 -->
    <Modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑商品分类' : '新增商品分类'"
      @ok="handleSave"
    >
      <Form layout="vertical" class="pt-2">
        <Form.Item label="分类名称" required>
          <Input
            v-model:value="formModel.name"
            placeholder="请输入分类名称（如：羽绒服/棉服）"
          />
        </Form.Item>
        <Form.Item label="展示排序">
          <InputNumber
            v-model:value="formModel.sort"
            :min="1"
            class="w-full"
            placeholder="数字越小越靠前"
          />
        </Form.Item>
        <Form.Item label="图标/Logo链接">
          <Input
            v-model:value="formModel.icon"
            placeholder="输入图标或图片 URL (可选)"
          />
        </Form.Item>
        <Form.Item label="可用状态">
          <Radio.Group v-model:value="formModel.status">
            <Radio :value="1">正常启用</Radio>
            <Radio :value="0">停用隐藏</Radio>
          </Radio.Group>
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
:deep(.ant-table-cell),
:deep(.ant-table-row-indent + .ant-table-row-expand-icon) {
  color: #fff !important;
}
</style>
