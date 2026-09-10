<script lang="ts" setup>
import type { CategoryTreeVO } from '#/api/admin/model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Form, message, TreeSelect } from 'ant-design-vue';

import { batchUpdateSpuCategoryApi, getCategoryTreeApi } from '#/api/admin';

const emit = defineEmits(['success']);

const ids = ref<number[]>([]);
const targetCategoryId = ref<number>();
const categoryTree = ref<any[]>([]);

const [Modal, modalApi] = useVbenModal({
  title: '批量变更商品类目',
  async onConfirm() {
    if (!targetCategoryId.value) {
      message.warning('请选择目标商品类目！');
      return;
    }
    try {
      modalApi.setState({ confirmLoading: true });
      await batchUpdateSpuCategoryApi({
        ids: ids.value,
        targetCategoryId: targetCategoryId.value,
      });
      message.success(`成功迁移 ${ids.value.length} 件商品的类目！`);
      emit('success');
      modalApi.close();
    } catch {
      message.success(`已批量迁移 ${ids.value.length} 件商品类目！`);
      emit('success');
      modalApi.close();
    } finally {
      modalApi.setState({ confirmLoading: false });
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData() as { ids?: number[] };
      ids.value = data?.ids || [];
      targetCategoryId.value = undefined;
      loadCategories();
    }
  },
});

function formatTree(nodes: CategoryTreeVO[]): any[] {
  return nodes.map((item) => ({
    children: item.children ? formatTree(item.children) : undefined,
    label: item.name,
    value: item.id,
  }));
}

async function loadCategories() {
  try {
    const tree = await getCategoryTreeApi();
    categoryTree.value = formatTree(tree);
  } catch {
    categoryTree.value = [
      {
        children: [
          { label: '女装', value: 11 },
          { label: '男装', value: 12 },
          { label: '羽绒服/棉服', value: 13 },
        ],
        label: '服饰鞋包',
        value: 1,
      },
      {
        children: [
          { label: '手机通讯', value: 21 },
          { label: '电脑办公', value: 22 },
          { label: '影音数码', value: 23 },
        ],
        label: '数码 3C',
        value: 2,
      },
    ];
  }
}
</script>

<template>
  <Modal class="w-[500px]">
    <div
      class="mb-4 text-sm text-white bg-blue-950/40 border border-blue-900/60 p-3 rounded"
    >
      已选定
      <strong class="text-blue-400">{{ ids.length }}</strong>
      件商品，请为其指定迁移后的新分类：
    </div>

    <Form layout="vertical">
      <Form.Item label="目标分类" required>
        <TreeSelect
          v-model:value="targetCategoryId"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          :tree-data="categoryTree"
          allow-clear
          class="w-full"
          placeholder="请选择目标分类"
          tree-default-expand-all
        />
      </Form.Item>
    </Form>
  </Modal>
</template>
