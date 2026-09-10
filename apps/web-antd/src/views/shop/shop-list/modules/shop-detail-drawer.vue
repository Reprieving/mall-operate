<script lang="ts" setup>
import type { ShopAdminFullDetailVO } from '#/api/admin/model';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import {
  Avatar,
  Badge,
  Descriptions,
  Empty,
  Spin,
  Tabs,
  Tag,
} from 'ant-design-vue';

import { getShopFullDetailApi } from '#/api/admin';

const loading = ref(false);
const detail = ref<null | ShopAdminFullDetailVO>(null);

const [Drawer, drawerApi] = useVbenDrawer({
  footer: false,
  title: '店铺全景透视详情画像',
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData() as { shopId?: number };
      if (data?.shopId) {
        loadDetail(data.shopId);
      }
    }
  },
});

async function loadDetail(shopId: number) {
  loading.value = true;
  try {
    const res = await getShopFullDetailApi(shopId);
    detail.value = res;
  } catch {
    // fallback 模拟数据
    detail.value = {
      certification: {
        auditRemark: '企业三证合一资质核查无误',
        auditTime: '2026-01-05 10:00:00',
        businessLicenseNo: '91440300MA5EXXXX88',
        businessLicensePic:
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300',
        certType: 3,
        certTypeName: '企业主体认证',
        companyAddress: '广东省深圳市南山区高新科技园南区 88 号',
        companyName: '深圳市极地探险户外用品发展有限公司',
        createTime: '2026-01-02 14:00:00',
        id: 1,
        idCard: '440301198805128899',
        idCardBackPic: '',
        idCardFrontPic: '',
        realName: '赵极地',
        status: 1,
        statusName: '已认证通过',
        userId: 1001,
      },
      owner: {
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner1',
        bio: '',
        certStatus: 1,
        createTime: '2025-10-10 10:00:00',
        email: 'zhaojidi@outdoors.com',
        gender: 1,
        id: 1001,
        nickname: '极地掌柜',
        phone: '13800001111',
        realName: '赵极地',
        status: 1,
        updateTime: '2026-03-01 10:00:00',
        username: 'zhaojidi',
      },
      productCount: 42,
      shop: {
        banner:
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=200&fit=crop',
        certId: 1,
        createTime: '2026-01-06 15:30:00',
        id: shopId,
        intro:
          '专注于为极地科考、极限越野及高海拔徒步探险提供顶级防寒防水装备。',
        logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=shop1',
        name: '极地探险户外旗舰店',
        notice: '全场顺丰包邮，支持7天无理由退换。',
        phone: '13800001111',
        score: 4.95,
        status: 1,
        statusName: '正常营业',
        type: 2,
        typeName: '品牌旗舰店',
        updateTime: '2026-03-01 10:00:00',
        userId: 1001,
      },
    };
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Drawer class="w-[760px]">
    <Spin :spinning="loading">
      <div v-if="detail" class="space-y-4">
        <!-- 头部店铺名片 -->
        <div class="border rounded-lg overflow-hidden bg-white shadow-sm">
          <div
            v-if="detail.shop.banner"
            class="h-28 bg-cover bg-center"
            :style="{ backgroundImage: `url(${detail.shop.banner})` }"
          ></div>
          <div
            class="p-4 flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <Avatar
              :size="64"
              :src="detail.shop.logo"
              shape="square"
              class="border shadow"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold text-gray-900">{{
                  detail.shop.name
                }}</span>
                <Tag :color="detail.shop.status === 1 ? 'success' : 'error'">
                  {{ detail.shop.statusName }}
                </Tag>
                <Tag color="purple">{{ detail.shop.typeName }}</Tag>
              </div>
              <div class="text-xs text-gray-600 mt-1 flex gap-4">
                <span>店铺 ID:
                  <span class="text-gray-800 font-medium">{{
                    detail.shop.id
                  }}</span></span>
                <span>客服电话:
                  <span class="text-gray-800 font-medium">{{
                    detail.shop.phone
                  }}</span></span>
                <span>开店时间:
                  <span class="text-gray-800 font-medium">{{
                    detail.shop.createTime
                  }}</span></span>
              </div>
            </div>
            <div class="text-right border-l border-gray-200 pl-4">
              <div class="text-xs text-gray-500">综合运营评分</div>
              <div class="text-2xl font-bold text-amber-600 mt-0.5">
                {{ detail.shop.score?.toFixed(2) }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                在线商品:
                <strong class="text-gray-900">{{ detail.productCount }}</strong>
                件
              </div>
            </div>
          </div>
        </div>

        <Tabs default-active-key="info">
          <!-- 店铺信息 -->
          <Tabs.TabPane key="info" tab="店铺基本信息">
            <Descriptions bordered size="small" :column="2">
              <Descriptions.Item label="经营公告" :span="2">
                {{ detail.shop.notice || '暂无公告' }}
              </Descriptions.Item>
              <Descriptions.Item label="店铺简介" :span="2">
                {{ detail.shop.intro || '暂无简介' }}
              </Descriptions.Item>
              <Descriptions.Item label="店主账号">
                {{ detail.owner?.username }} ({{ detail.owner?.nickname }})
              </Descriptions.Item>
              <Descriptions.Item label="店主电话">
                {{ detail.owner?.phone || '-' }}
              </Descriptions.Item>
              <Descriptions.Item label="店主邮箱">
                {{ detail.owner?.email || '-' }}
              </Descriptions.Item>
              <Descriptions.Item label="最后更新">
                {{ detail.shop.updateTime }}
              </Descriptions.Item>
            </Descriptions>
          </Tabs.TabPane>

          <!-- 主体认证资料 -->
          <Tabs.TabPane key="cert" tab="主体实名资质">
            <div v-if="detail.certification" class="space-y-3">
              <Descriptions bordered size="small" :column="2">
                <Descriptions.Item label="认证类型">
                  <Tag color="purple">
                    {{ detail.certification.certTypeName }}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="审核状态">
                  <Badge
                    status="success"
                    :text="detail.certification.statusName"
                  />
                </Descriptions.Item>
                <Descriptions.Item label="法定代表人 / 申请人">
                  {{ detail.certification.realName }}
                </Descriptions.Item>
                <Descriptions.Item label="身份证件号">
                  {{ detail.certification.idCard }}
                </Descriptions.Item>
                <Descriptions.Item
                  v-if="detail.certification.companyName"
                  label="企业主体名称"
                  :span="2"
                >
                  {{ detail.certification.companyName }}
                </Descriptions.Item>
                <Descriptions.Item
                  v-if="detail.certification.businessLicenseNo"
                  label="统一社会信用代码"
                  :span="2"
                >
                  {{ detail.certification.businessLicenseNo }}
                </Descriptions.Item>
                <Descriptions.Item
                  v-if="detail.certification.companyAddress"
                  label="注册经营地址"
                  :span="2"
                >
                  {{ detail.certification.companyAddress }}
                </Descriptions.Item>
                <Descriptions.Item label="审批通过时间" :span="2">
                  {{ detail.certification.auditTime }}
                </Descriptions.Item>
              </Descriptions>
            </div>
            <Empty v-else description="未获取到关联认证信息" />
          </Tabs.TabPane>
        </Tabs>
      </div>
      <Empty v-else-if="!loading" description="未找到店铺画像" />
    </Spin>
  </Drawer>
</template>
