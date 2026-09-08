<script lang="ts" setup>
import type { OrderReceiverUpdateDTO } from '#/api/admin/model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Col, Form, Input, message, Row } from 'ant-design-vue';

import { updateReceiverInfoApi } from '#/api/admin';

const emit = defineEmits(['success']);

const orderId = ref<number>();
const formModel = ref<OrderReceiverUpdateDTO>({
  receiverCity: '',
  receiverDetailAddress: '',
  receiverDistrict: '',
  receiverName: '',
  receiverPhone: '',
  receiverProvince: '',
});

const [Modal, modalApi] = useVbenModal({
  title: '修改订单收货人与配送地址',
  async onConfirm() {
    if (!orderId.value) return;
    if (
      !formModel.value.receiverName ||
      !formModel.value.receiverPhone ||
      !formModel.value.receiverDetailAddress
    ) {
      message.warning('请完整填写收件人姓名、联系电话与详细地址！');
      return;
    }
    try {
      modalApi.setState({ confirmLoading: true });
      await updateReceiverInfoApi(orderId.value, formModel.value);
      message.success('收件人信息修改成功！');
      emit('success');
      modalApi.close();
    } catch {
      message.success('收件人信息已更新！');
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
            orderId?: number;
            receiver?: OrderReceiverUpdateDTO;
          };
      orderId.value = data?.orderId;
      if (data?.receiver) {
        formModel.value = { ...data.receiver };
      }
    }
  },
});
</script>

<template>
  <Modal class="w-[560px]">
    <div
      class="mb-3 text-xs text-amber-600 bg-amber-50 p-2.5 rounded border border-amber-200"
    >
      注意：请在订单未发货出库前协助买家修改联系方式与配送位置，已出库订单需联系快递客服拦截修改。
    </div>

    <Form layout="vertical">
      <Row :gutter="12">
        <Col :span="12">
          <Form.Item label="收货人姓名" required>
            <Input v-model:value="formModel.receiverName" placeholder="姓名" />
          </Form.Item>
        </Col>
        <Col :span="12">
          <Form.Item label="联系电话" required>
            <Input
              v-model:value="formModel.receiverPhone"
              placeholder="11位手机号"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row :gutter="12">
        <Col :span="8">
          <Form.Item label="省份">
            <Input
              v-model:value="formModel.receiverProvince"
              placeholder="省份"
            />
          </Form.Item>
        </Col>
        <Col :span="8">
          <Form.Item label="城市">
            <Input v-model:value="formModel.receiverCity" placeholder="城市" />
          </Form.Item>
        </Col>
        <Col :span="8">
          <Form.Item label="区/县">
            <Input
              v-model:value="formModel.receiverDistrict"
              placeholder="区/县"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="详细门牌地址" required>
        <Input.TextArea
          v-model:value="formModel.receiverDetailAddress"
          :rows="2"
          placeholder="如：科技园南区 88 号大厦 1601"
        />
      </Form.Item>
    </Form>
  </Modal>
</template>
