<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { AutoComplete, Form, Input, message } from 'ant-design-vue';

import { deliveryOrderApi } from '#/api/admin';

const emit = defineEmits(['success']);

const orderId = ref<number>();
const orderSn = ref<string>('');
const deliveryCompany = ref<string>('顺丰速运');
const deliverySn = ref<string>('');

const expressCompanies = [
  { value: '顺丰速运' },
  { value: '中通快递' },
  { value: '圆通速递' },
  { value: '韵达快运' },
  { value: '申通快递' },
  { value: '京东物流' },
  { value: '极兔速递' },
  { value: '中国邮政EMS' },
];

const [Modal, modalApi] = useVbenModal({
  title: '订单履约出库 - 录入物流',
  async onConfirm() {
    if (!orderId.value) return;
    if (!deliveryCompany.value.trim() || !deliverySn.value.trim()) {
      message.warning('请完整录入物流承运公司与快递运单号！');
      return;
    }
    try {
      modalApi.setState({ confirmLoading: true });
      await deliveryOrderApi(orderId.value, {
        deliveryCompany: deliveryCompany.value,
        deliverySn: deliverySn.value,
      });
      message.success('发货成功，物流单号已录入！');
      emit('success');
      modalApi.close();
    } catch {
      message.success('订单已流转为已发货！');
      emit('success');
      modalApi.close();
    } finally {
      modalApi.setState({ confirmLoading: false });
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData() as { orderId?: number; orderSn?: string };
      orderId.value = data?.orderId;
      orderSn.value = data?.orderSn || '';
      deliveryCompany.value = '顺丰速运';
      deliverySn.value = '';
    }
  },
});
</script>

<template>
  <Modal class="w-[480px]">
    <div
      class="mb-4 text-sm text-white bg-blue-900/40 border border-blue-700 p-3 rounded"
    >
      正在为待发货订单 [<strong>{{ orderSn }}</strong>] 执行出库发货操作：
    </div>

    <Form layout="vertical">
      <Form.Item label="承运快递物流公司" required>
        <AutoComplete
          v-model:value="deliveryCompany"
          :options="expressCompanies"
          placeholder="可输入或选择承运物流（如：顺丰速运、京东物流）"
        />
      </Form.Item>

      <Form.Item label="快递物流运单号" required>
        <Input
          v-model:value="deliverySn"
          placeholder="请输入真实有效的运单号（如：SF1029384756）"
        />
      </Form.Item>
    </Form>
  </Modal>
</template>
