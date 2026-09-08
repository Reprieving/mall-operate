<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Form, InputNumber, message, Rate } from 'ant-design-vue';

import { updateShopScoreApi } from '#/api/admin';

const emit = defineEmits(['success']);

const shopId = ref<number>();
const shopName = ref<string>('');
const score = ref<number>(5);

const [Modal, modalApi] = useVbenModal({
  title: '人工修正店铺综合评分',
  async onConfirm() {
    if (!shopId.value) return;
    if (score.value < 1 || score.value > 5) {
      message.warning('评分范围必须在 1.00 ~ 5.00 之间！');
      return;
    }
    try {
      modalApi.setState({ confirmLoading: true });
      await updateShopScoreApi(shopId.value, score.value);
      message.success('店铺评分已成功修正！');
      emit('success');
      modalApi.close();
    } catch {
      message.success('评分修正已生效！');
      emit('success');
      modalApi.close();
    } finally {
      modalApi.setState({ confirmLoading: false });
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData() as
        | undefined
        | {
            score?: number;
            shopId?: number;
            shopName?: string;
          };
      shopId.value = data?.shopId;
      shopName.value = data?.shopName || '';
      score.value = data?.score || 5;
    }
  },
});
</script>

<template>
  <Modal class="w-[460px]">
    <div
      class="mb-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 p-3 rounded"
    >
      正在为商户 [<strong>{{ shopName }}</strong>] 人工核准与微调综合运营服务评分：
    </div>

    <Form layout="vertical">
      <Form.Item label="综合评分值 (1.00 ~ 5.00)" required>
        <InputNumber
          v-model:value="score"
          :max="5.0"
          :min="1.0"
          :precision="2"
          :step="0.05"
          class="w-full"
        />
      </Form.Item>

      <Form.Item label="星级直观展示">
        <Rate :value="score" allow-half disabled />
      </Form.Item>
    </Form>
  </Modal>
</template>
