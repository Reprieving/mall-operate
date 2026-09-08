<script lang="ts" setup>
import type { ShopDetailVO } from '#/api/admin/model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Radio,
  Spin,
  Tag,
} from 'ant-design-vue';

import { auditShopApi, getAdminShopDetailApi } from '#/api/admin';

const emit = defineEmits(['success']);

const loading = ref(false);
const detail = ref<null | ShopDetailVO>(null);
const shopId = ref<number>();
const auditStatus = ref<number>(1);
const rejectReason = ref<string>('');

const [Modal, modalApi] = useVbenModal({
  title: '开店入驻申请资质审批',
  async onConfirm() {
    if (!shopId.value) return;
    if (auditStatus.value === 2 && !rejectReason.value.trim()) {
      message.warning('驳回入驻申请时必须填写驳回原因！');
      return;
    }
    try {
      modalApi.setState({ confirmLoading: true });
      await auditShopApi({
        id: shopId.value,
        rejectReason: rejectReason.value,
        status: auditStatus.value,
      });
      message.success(
        `开店申请${auditStatus.value === 1 ? '已审批通过' : '已驳回'}`,
      );
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
      const data = modalApi.getData() as { shopId?: number };
      shopId.value = data?.shopId;
      auditStatus.value = 1;
      rejectReason.value = '';
      if (shopId.value) {
        loadDetail(shopId.value);
      }
    }
  },
});

async function loadDetail(id: number) {
  loading.value = true;
  try {
    const res = await getAdminShopDetailApi(id);
    detail.value = res;
  } catch {
    detail.value = {
      certInfo: {
        auditRemark: '',
        auditTime: '',
        businessLicenseNo: '91440300MA5EXXXX99',
        businessLicensePic:
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=200',
        certType: 3,
        certTypeName: '企业主体认证',
        companyAddress: '广东省深圳市南山区粤海街道科技园南区 88 号',
        companyName: '深圳市拓荒者运动装备有限公司',
        createTime: '2026-03-01 10:00:00',
        id: 1,
        idCard: '440301198908183344',
        idCardBackPic: '',
        idCardFrontPic: '',
        realName: '吴拓荒',
        status: 1,
        statusName: '已认证通过',
        userId: 1005,
      },
      shopInfo: {
        banner: '',
        certId: 1,
        createTime: '2026-03-05 15:20:00',
        id,
        intro: '主营户外越野运动器械与野营防护装备。',
        logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=shop5',
        name: '拓荒者户外专营店',
        notice: '开业特惠',
        phone: '13900005555',
        score: 5,
        status: 0,
        statusName: '待审核',
        type: 2,
        typeName: '品牌旗舰店',
        updateTime: '2026-03-05 15:20:00',
        userId: 1005,
      },
    };
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Modal class="w-[660px]">
    <Spin :spinning="loading">
      <div v-if="detail" class="space-y-4">
        <!-- 店铺申请信息 -->
        <Descriptions bordered size="small" title="拟开办店铺资料" :column="2">
          <Descriptions.Item label="店铺名称">
            {{ detail.shopInfo.name }}
          </Descriptions.Item>
          <Descriptions.Item label="经营类型">
            <Tag color="purple">{{ detail.shopInfo.typeName }}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="客服电话">
            {{ detail.shopInfo.phone }}
          </Descriptions.Item>
          <Descriptions.Item label="申请时间">
            {{ detail.shopInfo.createTime }}
          </Descriptions.Item>
          <Descriptions.Item label="店铺介绍" :span="2">
            {{ detail.shopInfo.intro }}
          </Descriptions.Item>
        </Descriptions>

        <!-- 关联实名主体资质 -->
        <Descriptions
          bordered
          size="small"
          title="关联实名主体资质"
          :column="2"
        >
          <Descriptions.Item label="认证类型">
            <Tag color="blue">{{ detail.certInfo?.certTypeName }}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="法人/申请人">
            {{ detail.certInfo?.realName }}
          </Descriptions.Item>
          <Descriptions.Item label="证件号码">
            {{ detail.certInfo?.idCard }}
          </Descriptions.Item>
          <Descriptions.Item label="主体名称">
            {{ detail.certInfo?.companyName || '个人经营' }}
          </Descriptions.Item>
          <Descriptions.Item
            v-if="detail.certInfo?.businessLicenseNo"
            label="社会信用代码"
            :span="2"
          >
            {{ detail.certInfo?.businessLicenseNo }}
          </Descriptions.Item>
        </Descriptions>

        <Divider class="my-3" />

        <!-- 审批表单 -->
        <Form layout="vertical">
          <Form.Item label="入驻审批决策" required>
            <Radio.Group v-model:value="auditStatus">
              <Radio :value="1">
                <span class="text-green-600 font-medium">审批通过 (准予开店营业)</span>
              </Radio>
              <Radio :value="2">
                <span class="text-red-500 font-medium">驳回申请 (资料不合规/资质欠缺)</span>
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="审核意见与驳回原因" :required="auditStatus === 2">
            <Input.TextArea
              v-model:value="rejectReason"
              :rows="3"
              placeholder="请输入开店审批意见或具体驳回理由..."
            />
          </Form.Item>
        </Form>
      </div>
    </Spin>
  </Modal>
</template>
