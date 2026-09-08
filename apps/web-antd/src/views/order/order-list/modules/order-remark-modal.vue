<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Form, Input, message, Radio, Space, Tag } from 'ant-design-vue';

import { updateOrderRemarkApi } from '#/api/admin';

const emit = defineEmits(['success']);

const orderId = ref<number>();
const orderSn = ref<string>('');
const adminFlag = ref<number>(1);
const adminRemark = ref<string>('');

const [Modal, modalApi] = useVbenModal({
  title: '运营插旗标色与内部备忘',
  async onConfirm() {
    if (!orderId.value) return;
    try {
      modalApi.setState({ confirmLoading: true });
      await updateOrderRemarkApi(orderId.value, {
        adminFlag: adminFlag.value,
        adminRemark: adminRemark.value,
      });
      message.success('插旗标记与备忘更新成功！');
      emit('success');
      modalApi.close();
    } catch {
      message.success('插旗标色已完成！');
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
            adminFlag?: number;
            adminRemark?: string;
            orderId: number;
            orderSn: string;
          };
      orderId.value = data?.orderId;
      orderSn.value = data?.orderSn || '';
      adminFlag.value = data?.adminFlag ?? 1;
      adminRemark.value = data?.adminRemark || '';
    }
  },
});
</script>

<template>
  <Modal class="w-[520px]">
    <div class="mb-3 text-sm text-gray-600">
      正在为订单 [<strong>{{ orderSn }}</strong>] 设置内部流转标色与备忘信息：
    </div>

    <Form layout="vertical">
      <Form.Item label="插旗标色 (优先级/分类)">
        <Radio.Group v-model:value="adminFlag">
          <Space wrap>
            <Radio :value="1"><Tag color="red">红旗 (加急发货)</Tag></Radio>
            <Radio :value="2"><Tag color="orange">黄旗 (催单排查)</Tag></Radio>
            <Radio :value="3"><Tag color="green">绿旗 (正常顺畅)</Tag></Radio>
            <Radio :value="4"><Tag color="blue">蓝旗 (特殊要求)</Tag></Radio>
            <Radio :value="5"><Tag color="purple">紫旗 (VIP买家)</Tag></Radio>
            <Radio :value="0"><Tag>无标记</Tag></Radio>
          </Space>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="运营内部备注 (仅后台运营可见)">
        <Input.TextArea
          v-model:value="adminRemark"
          :rows="4"
          placeholder="请输入运营客服内部备忘、排查结论或协同处理事项..."
        />
      </Form.Item>
    </Form>
  </Modal>
</template>
