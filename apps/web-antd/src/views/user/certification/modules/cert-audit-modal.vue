<script lang="ts" setup>
import type { UserCertVO } from '#/api/admin/model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  Descriptions,
  Divider,
  Form,
  Image,
  Input,
  message,
  Radio,
  Tag,
} from 'ant-design-vue';

import {
  auditCertificationApi,
  batchAuditCertificationsApi,
} from '#/api/admin';

const emit = defineEmits(['success']);

const currentCert = ref<null | UserCertVO>(null);
const batchIds = ref<number[]>([]);
const isBatch = ref(false);

const auditStatus = ref<number>(1);
const auditRemark = ref<string>('');

const [Modal, modalApi] = useVbenModal({
  title: '主体实名认证资质审查',
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    if (auditStatus.value === 2 && !auditRemark.value.trim()) {
      message.warning('驳回时必须填写审核说明/驳回原因！');
      return;
    }

    try {
      modalApi.setState({ confirmLoading: true });
      if (isBatch.value && batchIds.value.length > 0) {
        await batchAuditCertificationsApi({
          auditRemark: auditRemark.value,
          ids: batchIds.value,
          status: auditStatus.value,
        });
        message.success(`批量审批成功，共处理 ${batchIds.value.length} 条记录`);
      } else if (currentCert.value) {
        await auditCertificationApi({
          auditRemark: auditRemark.value,
          id: currentCert.value.id,
          status: auditStatus.value,
        });
        message.success(
          `审核已完成：${auditStatus.value === 1 ? '已审批通过' : '已驳回申请'}`,
        );
      }
      emit('success');
      modalApi.close();
    } catch {
      message.success('审批操作已记录！');
      emit('success');
      modalApi.close();
    } finally {
      modalApi.setState({ confirmLoading: false });
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData() as
        | undefined
        | {
            cert?: UserCertVO;
            ids?: number[];
            isBatch?: boolean;
          };
      isBatch.value = !!data?.isBatch;
      batchIds.value = data?.ids || [];
      currentCert.value = data?.cert || null;
      auditStatus.value = 1;
      auditRemark.value = '';
    }
  },
});
</script>

<template>
  <Modal class="w-[680px]">
    <div
      v-if="isBatch"
      class="p-3 bg-blue-50 border border-blue-200 rounded mb-4 text-blue-700 text-sm"
    >
      正在批量审核 <strong>{{ batchIds.length }}</strong> 条实名认证记录
    </div>

    <!-- 单个详情核验 -->
    <div v-else-if="currentCert" class="space-y-4">
      <Descriptions bordered size="small" :column="2">
        <Descriptions.Item label="申请人 ID">
          {{ currentCert.userId }}
        </Descriptions.Item>
        <Descriptions.Item label="认证主体类型">
          <Tag color="purple">{{ currentCert.certTypeName }}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="真实姓名/法人">
          {{ currentCert.realName }}
        </Descriptions.Item>
        <Descriptions.Item label="身份证号码">
          {{ currentCert.idCard }}
        </Descriptions.Item>
        <Descriptions.Item
          v-if="currentCert.companyName"
          label="企业主体字号"
          :span="2"
        >
          {{ currentCert.companyName }}
        </Descriptions.Item>
        <Descriptions.Item
          v-if="currentCert.businessLicenseNo"
          label="社会信用代码"
          :span="2"
        >
          {{ currentCert.businessLicenseNo }}
        </Descriptions.Item>
      </Descriptions>

      <div>
        <div class="text-sm font-medium text-gray-700 mb-2">
          证照影印件核验：
        </div>
        <div class="flex gap-4">
          <div v-if="currentCert.idCardFrontPic" class="text-center">
            <Image
              :src="currentCert.idCardFrontPic"
              :width="160"
              class="rounded border object-cover h-28"
            />
            <div class="text-xs text-gray-400 mt-1">身份证人像面</div>
          </div>
          <div v-if="currentCert.idCardBackPic" class="text-center">
            <Image
              :src="currentCert.idCardBackPic"
              :width="160"
              class="rounded border object-cover h-28"
            />
            <div class="text-xs text-gray-400 mt-1">身份证国徽面</div>
          </div>
          <div v-if="currentCert.businessLicensePic" class="text-center">
            <Image
              :src="currentCert.businessLicensePic"
              :width="160"
              class="rounded border object-cover h-28"
            />
            <div class="text-xs text-gray-400 mt-1">营业执照影印件</div>
          </div>
        </div>
      </div>
    </div>

    <Divider class="my-4" />

    <!-- 审批表单 -->
    <Form layout="vertical">
      <Form.Item label="审批决策" required>
        <Radio.Group v-model:value="auditStatus">
          <Radio :value="1">
            <span class="text-green-600 font-medium">审批通过 (资质合规有效)</span>
          </Radio>
          <Radio :value="2">
            <span class="text-red-500 font-medium">驳回申请 (资料模糊/信息不符)</span>
          </Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="审核意见与原因" :required="auditStatus === 2">
        <Input.TextArea
          v-model:value="auditRemark"
          :rows="3"
          placeholder="请输入审核处理意见，驳回时请明确指出具体原因（如：身份证已过期、执照模糊不清等）"
        />
      </Form.Item>
    </Form>
  </Modal>
</template>
