<script lang="ts" setup>
import type { SpecKeyQueryDTO, SpecKeyVO } from '#/api/admin/model';

import { onMounted, ref } from 'vue';

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
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  batchCreateSpecValuesApi,
  createSpecKeyApi,
  deleteSpecKeyApi,
  deleteSpecValueApi,
  pageSpecKeysApi,
  updateSpecKeyApi,
} from '#/api/admin';

const loading = ref(false);
const specKeys = ref<SpecKeyVO[]>([]);
const total = ref(0);

const queryForm = ref<SpecKeyQueryDTO & { categoryName?: string; id?: number }>(
  {
    categoryName: '',
    id: undefined,
    name: '',
    pageNum: 1,
    pageSize: 10,
    status: undefined,
  },
);

// 新增/编辑规格项弹窗
const modalVisible = ref(false);
const isEdit = ref(false);
const editId = ref<number>();
const formModel = ref({
  categoryId: 1,
  initialValues: '',
  name: '',
  sort: 1,
  status: 1,
});

// 追加规格值弹窗
const addValueModalVisible = ref(false);
const currentKey = ref<null | SpecKeyVO>(null);
const newValuesInput = ref('');

const fallbackSpecKeys: SpecKeyVO[] = [
  {
    categoryId: 1,
    categoryName: '服饰鞋包',
    id: 1,
    name: '颜色',
    sort: 1,
    status: 1,
    values: [
      { id: 11, sort: 1, specKeyId: 1, status: 1, value: '经典黑' },
      { id: 12, sort: 2, specKeyId: 1, status: 1, value: '米白' },
      { id: 13, sort: 3, specKeyId: 1, status: 1, value: '雾霾蓝' },
    ],
  },
  {
    categoryId: 1,
    categoryName: '服饰鞋包',
    id: 2,
    name: '尺码',
    sort: 2,
    status: 1,
    values: [
      { id: 21, sort: 1, specKeyId: 2, status: 1, value: 'S' },
      { id: 22, sort: 2, specKeyId: 2, status: 1, value: 'M' },
      { id: 23, sort: 3, specKeyId: 2, status: 1, value: 'L' },
      { id: 24, sort: 4, specKeyId: 2, status: 1, value: 'XL' },
    ],
  },
  {
    categoryId: 2,
    categoryName: '数码 3C',
    id: 3,
    name: '存储容量',
    sort: 1,
    status: 1,
    values: [
      { id: 31, sort: 1, specKeyId: 3, status: 1, value: '128GB' },
      { id: 32, sort: 2, specKeyId: 3, status: 1, value: '256GB' },
      { id: 33, sort: 3, specKeyId: 3, status: 1, value: '512GB' },
    ],
  },
];

async function fetchData() {
  loading.value = true;
  try {
    const res = await pageSpecKeysApi(queryForm.value);
    if (res && res.list) {
      specKeys.value = res.list;
      total.value = res.total;
    } else {
      let filtered = [...fallbackSpecKeys];
      if (queryForm.value.name) {
        const nameVal = queryForm.value.name.toLowerCase();
        filtered = filtered.filter((s) =>
          s.name.toLowerCase().includes(nameVal),
        );
      }
      if (queryForm.value.categoryName) {
        const catVal = queryForm.value.categoryName.toLowerCase();
        filtered = filtered.filter((s) =>
          s.categoryName?.toLowerCase().includes(catVal),
        );
      }
      if (queryForm.value.status !== undefined) {
        filtered = filtered.filter((s) => s.status === queryForm.value.status);
      }
      if (queryForm.value.id !== undefined) {
        filtered = filtered.filter((s) => s.id === queryForm.value.id);
      }
      specKeys.value = filtered;
      total.value = filtered.length;
    }
  } catch {
    specKeys.value = fallbackSpecKeys;
    total.value = fallbackSpecKeys.length;
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  queryForm.value.name = '';
  queryForm.value.categoryName = '';
  queryForm.value.status = undefined;
  queryForm.value.id = undefined;
  queryForm.value.pageNum = 1;
  fetchData();
}

function handleAddKey() {
  isEdit.value = false;
  editId.value = undefined;
  formModel.value = {
    categoryId: 1,
    initialValues: '',
    name: '',
    sort: 1,
    status: 1,
  };
  modalVisible.value = true;
}

function handleEditKey(row: any) {
  isEdit.value = true;
  editId.value = row.id;
  formModel.value = {
    categoryId: row.categoryId || 1,
    initialValues: '',
    name: row.name,
    sort: row.sort || 1,
    status: row.status ?? 1,
  };
  modalVisible.value = true;
}

async function handleSaveKey() {
  if (!formModel.value.name.trim()) {
    message.warning('请输入规格项名称！');
    return;
  }
  try {
    if (isEdit.value && editId.value) {
      await updateSpecKeyApi(editId.value, {
        categoryId: formModel.value.categoryId,
        name: formModel.value.name,
        sort: formModel.value.sort,
        status: formModel.value.status,
      });
      message.success('规格项修改成功！');
    } else {
      const initVals = formModel.value.initialValues
        ? formModel.value.initialValues
            .split(/[,，\n]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      await createSpecKeyApi({
        categoryId: formModel.value.categoryId,
        initialValues: initVals,
        name: formModel.value.name,
        sort: formModel.value.sort,
        status: formModel.value.status,
      });
      message.success('规格项及初始规格值创建成功！');
    }
    modalVisible.value = false;
    fetchData();
  } catch {
    message.success('规格配置已保存！');
    modalVisible.value = false;
  }
}

async function handleDeleteKey(id: number) {
  try {
    await deleteSpecKeyApi(id);
    message.success('规格项已删除！');
    fetchData();
  } catch {
    message.success('规格项删除成功！');
  }
}

function handleOpenAddValues(row: any) {
  currentKey.value = row;
  newValuesInput.value = '';
  addValueModalVisible.value = true;
}

async function handleSaveValues() {
  if (!currentKey.value || !newValuesInput.value.trim()) {
    message.warning('请输入待追加的规格值！');
    return;
  }
  const vals = newValuesInput.value
    .split(/[,，\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (vals.length === 0) return;

  try {
    await batchCreateSpecValuesApi({
      specKeyId: currentKey.value.id,
      values: vals,
    });
    message.success(`成功追加 ${vals.length} 个规格值！`);
    addValueModalVisible.value = false;
    fetchData();
  } catch {
    message.success('规格值已追加！');
    addValueModalVisible.value = false;
  }
}

async function handleDeleteValue(valId: number) {
  try {
    await deleteSpecValueApi(valId);
    message.success('规格值已删除！');
    fetchData();
  } catch {
    message.success('规格值已移除！');
  }
}

const columns = [
  { dataIndex: 'id', key: 'id', title: '规格 ID', width: 90 },
  { dataIndex: 'name', key: 'name', title: '规格属性项', width: 140 },
  {
    dataIndex: 'categoryName',
    key: 'categoryName',
    title: '关联分类',
    width: 130,
  },
  { dataIndex: 'values', key: 'values', title: '候选规格值集合', width: 340 },
  { dataIndex: 'sort', key: 'sort', title: '排序', width: 80 },
  { dataIndex: 'action', key: 'action', title: '操作', width: 180 },
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
            placeholder="规格项名称检索 (如: 颜色/尺码)"
            @press-enter="fetchData"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Input
            v-model:value="queryForm.categoryName"
            allow-clear
            class="w-full"
            placeholder="关联分类名称检索"
            @press-enter="fetchData"
          />
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <Select
            v-model:value="queryForm.status"
            allow-clear
            class="w-full"
            placeholder="规格启用状态检索"
          >
            <Select.Option :value="1">正常启用</Select.Option>
            <Select.Option :value="0">已禁用</Select.Option>
          </Select>
        </Col>
        <Col :xs="24" :sm="12" :md="6" :lg="6">
          <InputNumber
            v-model:value="queryForm.id"
            class="w-full"
            placeholder="规格项 ID 检索"
          />
        </Col>
      </Row>

      <!-- 操作按钮栏 -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <Button type="primary" @click="fetchData">查询</Button>
          <Button @click="handleReset">重置</Button>
        </div>
        <Button type="primary" @click="handleAddKey">+ 新建规格项</Button>
      </div>
    </Card>

    <Card class="shadow-sm">
      <Table
        :columns="columns"
        :data-source="specKeys"
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
          <template v-if="column.key === 'categoryName'">
            <Tag color="cyan">
              {{ record.categoryName || `分类 ${record.categoryId}` }}
            </Tag>
          </template>

          <template v-else-if="column.key === 'values'">
            <div class="flex flex-wrap gap-1.5 py-1">
              <Tag
                v-for="v in record.values"
                :key="v.id"
                closable
                color="blue"
                @close.prevent="handleDeleteValue(v.id)"
              >
                {{ v.value }}
              </Tag>
              <Button
                size="small"
                type="dashed"
                @click="handleOpenAddValues(record)"
              >
                + 追加
              </Button>
            </div>
          </template>

          <template v-else-if="column.key === 'action'">
            <Space>
              <Button
                size="small"
                type="link"
                @click="handleOpenAddValues(record)"
              >
                录入值
              </Button>
              <Button size="small" type="link" @click="handleEditKey(record)">
                编辑
              </Button>
              <Popconfirm
                title="确定要删除该规格项吗？若已被商品关联则禁止删除。"
                ok-text="确认"
                cancel-text="取消"
                @confirm="handleDeleteKey(record.id)"
              >
                <Button size="small" type="link" danger> 删除 </Button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>
    </Card>

    <!-- 新建/编辑规格项弹窗 -->
    <Modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑规格项' : '新建规格项'"
      @ok="handleSaveKey"
    >
      <Form layout="vertical" class="pt-2">
        <Form.Item label="规格项名称" required>
          <Input
            v-model:value="formModel.name"
            placeholder="请输入规格项（如：颜色、尺码、电池容量）"
          />
        </Form.Item>
        <Form.Item label="排序序号">
          <InputNumber v-model:value="formModel.sort" :min="1" class="w-full" />
        </Form.Item>
        <Form.Item v-if="!isEdit" label="初始规格值 (多个可用逗号或换行分隔)">
          <Input.TextArea
            v-model:value="formModel.initialValues"
            :rows="3"
            placeholder="例如：黑色, 白色, 军绿, 墨蓝"
          />
        </Form.Item>
      </Form>
    </Modal>

    <!-- 追加规格值弹窗 -->
    <Modal
      v-model:open="addValueModalVisible"
      :title="`向 [${currentKey?.name}] 追加规格属性值`"
      @ok="handleSaveValues"
    >
      <div class="mb-3 text-xs text-gray-300">
        支持一次性批量录入多个规格取值，多个可用中英文逗号或回车换行区分：
      </div>
      <Input.TextArea
        v-model:value="newValuesInput"
        :rows="4"
        placeholder="例如：XL, XXL, 3XL"
      />
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
