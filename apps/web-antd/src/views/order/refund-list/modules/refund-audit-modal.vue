<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Form, Image, Input, message, Radio, Space, Tag } from 'ant-design-vue';

import { auditRefundApi, auditRefundByOrderIdApi } from '#/api/admin';

interface RefundModalData {
  auditRemark?: string;
  description?: string;
  orderId?: number;
  orderSn?: string;
  proofPics?: string;
  reason?: string;
  refundAmount?: number;
  refundId?: number;
  refundSn?: string;
  refundTypeDesc?: string;
}

const emit = defineEmits<{
  (e: 'success'): void;
}>();

const refundId = ref<number>();
const orderId = ref<number>();
const refundSn = ref<string>('');
const orderSn = ref<string>('');
const refundAmount = ref<number>(0);
const refundTypeDesc = ref<string>('');
const reason = ref<string>('');
const description = ref<string>('');
const proofPics = ref<string>('');
const status = ref<number>(1);
const auditRemark = ref<string>('');

const proofList = computed(() => {
  if (!proofPics.value) return [];
  return proofPics.value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
});

const [Modal, modalApi] = useVbenModal({
  title: '商品售后退款申请审批',
  async onConfirm() {
    if (!refundId.value && !orderId.value) {
      message.error('未找到有效退款记录标识');
      return;
    }

    if (status.value === 2 && !auditRemark.value.trim()) {
      message.warning('驳回退款申请时，必须填写驳回原因说明！');
      return;
    }

    try {
      modalApi.setState({ confirmLoading: true });
      if (refundId.value) {
        await auditRefundApi(refundId.value, {
          auditRemark: auditRemark.value.trim(),
          status: status.value,
        });
      } else if (orderId.value) {
        await auditRefundByOrderIdApi(orderId.value, {
          auditRemark: auditRemark.value.trim(),
          status: status.value,
        });
      }

      const successText =
        status.value === 1
          ? '售后退款申请已审批通过，系统已执行退款与库存释放！'
          : '售后退款申请已被驳回！';
      message.success(successText);
      emit('success');
      modalApi.close();
    } catch (error) {
      console.error('审批退款申请失败:', error);
    } finally {
      modalApi.setState({ confirmLoading: false });
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData() as RefundModalData | undefined;
      refundId.value = data?.refundId;
      orderId.value = data?.orderId;
      refundSn.value = data?.refundSn || '';
      orderSn.value = data?.orderSn || '';
      refundAmount.value = data?.refundAmount ?? 0;
      refundTypeDesc.value = data?.refundTypeDesc || '仅退款';
      reason.value = data?.reason || '';
      description.value = data?.description || '';
      proofPics.value = data?.proofPics || '';
      status.value = 1;
      auditRemark.value = data?.auditRemark || '';
    }
  },
});
</script>

<template>
  <Modal class="w-[560px]">
    <div
      class="mb-4 rounded-lg border border-slate-700 bg-slate-900/90 p-3.5 text-sm space-y-2"
    >
      <div class="flex items-center justify-between">
        <span class="text-slate-400">退款申请单号：</span>
        <span class="font-mono font-medium text-white">{{
          refundSn || '-'
        }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-slate-400">关联订购单号：</span>
        <span class="font-mono font-medium text-blue-400">{{
          orderSn || '-'
        }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-slate-400">申请退款金额：</span>
        <span class="text-base font-bold text-red-500">
          ¥{{ refundAmount.toFixed(2) }}
        </span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-slate-400">退款类型：</span>
        <Tag color="cyan">{{ refundTypeDesc || '仅退款' }}</Tag>
      </div>
      <div class="pt-1 border-t border-slate-800">
        <span class="text-slate-400">退款申请原因：</span>
        <span class="font-medium text-slate-200">{{
          reason || '买家未注明原因'
        }}</span>
      </div>
      <div v-if="description">
        <span class="text-slate-400">买家补充说明：</span>
        <span class="text-slate-300">{{ description }}</span>
      </div>
      <div v-if="proofList.length > 0" class="pt-1">
        <span class="mb-1.5 block text-slate-400">买家凭证图片：</span>
        <Image.PreviewGroup>
          <div class="flex flex-wrap gap-2">
            <Image
              v-for="(pic, idx) in proofList"
              :key="idx"
              :height="56"
              :src="pic"
              :width="56"
              class="rounded border border-slate-700 object-cover"
            />
          </div>
        </Image.PreviewGroup>
      </div>
    </div>

    <Form layout="vertical">
      <Form.Item label="审批处理裁决" required>
        <Radio.Group v-model:value="status">
          <Space size="large">
            <Radio :value="1">
              <Tag class="px-2.5 py-1 text-sm cursor-pointer" color="success">
                ✅ 同意退款 (通过并执行退款)
              </Tag>
            </Radio>
            <Radio :value="2">
              <Tag class="px-2.5 py-1 text-sm cursor-pointer" color="error">
                ❌ 驳回申请 (拒绝退款)
              </Tag>
            </Radio>
          </Space>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        :label="status === 2 ? '驳回原因说明 (必填)' : '运营审批备忘 (选填)'"
        :required="status === 2"
      >
        <Input.TextArea
          v-model:value="auditRemark"
          :placeholder="
            status === 2
              ? '请详细输入驳回退款的原因，该信息将展示给买家与商户（例如：商品已发货并签收超期，或凭证不足等）...'
              : '可录入退款审核批示、资金原路退还说明或跨部门协同备忘...'
          "
          :rows="4"
        />
      </Form.Item>
    </Form>
  </Modal>
</template>
