<script lang="ts" setup>
import type { AdminUserDetailVO } from '#/api/admin/model';

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

import { getUserDetailApi } from '#/api/admin';

const loading = ref(false);
const detail = ref<AdminUserDetailVO | null>(null);

const [Drawer, drawerApi] = useVbenDrawer({
  footer: false,
  title: '买家全景画像档案',
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData() as { userId?: number };
      if (data?.userId) {
        loadDetail(data.userId);
      }
    }
  },
});

async function loadDetail(userId: number) {
  loading.value = true;
  try {
    const res = await getUserDetailApi(userId);
    detail.value = res;
  } catch {
    // 模拟数据展示以备未联网时测试
    detail.value = {
      addresses: [
        {
          city: '深圳市',
          createTime: '2026-01-10 12:00:00',
          detailAddress: '粤海街道科技园南区 88 号高新科技大厦 A 座 1601',
          district: '南山区',
          fullAddress:
            '广东省深圳市南山区粤海街道科技园南区 88 号高新科技大厦 A 座 1601',
          id: 1,
          isDefault: 1,
          name: '张三',
          phone: '13800138000',
          province: '广东省',
          tag: '公司',
          userId,
        },
      ],
      certification: {
        auditRemark: '资质齐全真实有效',
        auditTime: '2026-02-01 10:00:00',
        certType: 1,
        certTypeName: '个人实名认证',
        createTime: '2026-01-28 15:30:00',
        id: 1,
        idCard: '44030119950101****',
        idCardBackPic:
          'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200',
        idCardFrontPic:
          'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200',
        realName: '张三',
        status: 1,
        statusName: '已认证通过',
        userId,
      },
      orderCount: 16,
      profile: {
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
        bio: '数码极客，热爱生活',
        certStatus: 1,
        createTime: '2025-11-20 09:15:30',
        email: 'zhangsan@example.com',
        gender: 1,
        id: userId,
        nickname: '张小三',
        phone: '13800138000',
        realName: '张三',
        status: 1,
        updateTime: '2026-03-01 11:20:00',
        username: 'zhangsan',
      },
      shop: {
        banner: '',
        certId: 1,
        createTime: '2026-02-05 14:20:00',
        id: 8,
        intro: '主营智能数码与潮流配饰',
        logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=shop8',
        name: '极客潮玩官方小店',
        notice: '全场包邮，极速发货',
        phone: '13800138000',
        score: 4.88,
        status: 1,
        statusName: '正常营业',
        type: 1,
        typeName: '个人集市店',
        updateTime: '2026-03-01 10:00:00',
        userId,
      },
      totalSpent: 4890.5,
    };
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Drawer class="w-[720px]">
    <Spin :spinning="loading">
      <div v-if="detail" class="space-y-4">
        <!-- 头部用户核心名片 -->
        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
          <Avatar :size="64" :src="detail.profile?.avatar" />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-lg font-bold text-gray-800">{{
                detail.profile?.nickname || detail.profile?.username
              }}</span>
              <Tag :color="detail.profile?.status === 1 ? 'success' : 'error'">
                {{ detail.profile?.status === 1 ? '账号正常' : '已冻结封禁' }}
              </Tag>
              <Tag
                :color="detail.profile?.certStatus === 1 ? 'blue' : 'default'"
              >
                {{ detail.profile?.certStatus === 1 ? '已实名认证' : '未实名' }}
              </Tag>
            </div>
            <div class="text-xs text-gray-500 mt-1 flex gap-4">
              <span>用户ID: {{ detail.profile?.id }}</span>
              <span>用户名: {{ detail.profile?.username }}</span>
              <span>手机: {{ detail.profile?.phone || '-' }}</span>
              <span>邮箱: {{ detail.profile?.email || '-' }}</span>
            </div>
          </div>
          <div class="text-right border-l pl-4">
            <div class="text-xs text-gray-400">历史累计消费</div>
            <div class="text-xl font-bold text-blue-600 mt-0.5">
              ¥{{ detail.totalSpent?.toFixed(2) }}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              完成订单: <strong>{{ detail.orderCount }}</strong> 笔
            </div>
          </div>
        </div>

        <Tabs default-active-key="1">
          <!-- 基础信息 -->
          <Tabs.TabPane key="1" tab="基础档案">
            <Descriptions bordered size="small" :column="2">
              <Descriptions.Item label="真实姓名">
                {{ detail.profile?.realName || '未认证' }}
              </Descriptions.Item>
              <Descriptions.Item label="用户性别">
                {{
                  detail.profile?.gender === 1
                    ? '男'
                    : detail.profile?.gender === 2
                      ? '女'
                      : '未知'
                }}
              </Descriptions.Item>
              <Descriptions.Item label="联系邮箱">
                {{ detail.profile?.email || '-' }}
              </Descriptions.Item>
              <Descriptions.Item label="联系手机">
                {{ detail.profile?.phone || '-' }}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {{ detail.profile?.createTime || '-' }}
              </Descriptions.Item>
              <Descriptions.Item label="最后更新">
                {{ detail.profile?.updateTime || '-' }}
              </Descriptions.Item>
              <Descriptions.Item label="个性签名" :span="2">
                {{ detail.profile?.bio || '暂无签名' }}
              </Descriptions.Item>
            </Descriptions>
          </Tabs.TabPane>

          <!-- 实名认证资质 -->
          <Tabs.TabPane key="2" tab="实名资质">
            <div v-if="detail.certification" class="space-y-3">
              <Descriptions bordered size="small" :column="2">
                <Descriptions.Item label="认证类型">
                  <Tag color="purple">
                    {{ detail.certification.certTypeName }}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="审核状态">
                  <Badge
                    :status="
                      detail.certification.status === 1
                        ? 'success'
                        : detail.certification.status === 2
                          ? 'error'
                          : 'processing'
                    "
                    :text="detail.certification.statusName"
                  />
                </Descriptions.Item>
                <Descriptions.Item label="真实姓名/法人">
                  {{ detail.certification.realName }}
                </Descriptions.Item>
                <Descriptions.Item label="证件号码">
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
                <Descriptions.Item label="审核意见" :span="2">
                  {{ detail.certification.auditRemark || '无' }}
                </Descriptions.Item>
                <Descriptions.Item label="认证时间" :span="2">
                  {{
                    detail.certification.auditTime ||
                    detail.certification.createTime
                  }}
                </Descriptions.Item>
              </Descriptions>
            </div>
            <Empty v-else description="该用户暂未提交实名认证" />
          </Tabs.TabPane>

          <!-- 关联店铺 -->
          <Tabs.TabPane key="3" tab="名下店铺">
            <div
              v-if="detail.shop"
              class="p-3 bg-gray-50 border rounded-lg flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <Avatar :size="48" :src="detail.shop.logo" shape="square" />
                <div>
                  <div class="font-bold text-gray-800">
                    {{ detail.shop.name }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    <span>类型: {{ detail.shop.typeName }}</span> &nbsp;|&nbsp;
                    <span>综合评分:
                      <strong class="text-amber-500">{{
                        detail.shop.score
                      }}</strong></span>
                  </div>
                </div>
              </div>
              <Tag :color="detail.shop.status === 1 ? 'success' : 'error'">
                {{ detail.shop.statusName }}
              </Tag>
            </div>
            <Empty v-else description="该买家名下无入驻开店" />
          </Tabs.TabPane>

          <!-- 收货地址列表 -->
          <Tabs.TabPane key="4" tab="收货地址">
            <div
              v-if="detail.addresses && detail.addresses.length > 0"
              class="space-y-2"
            >
              <div
                v-for="addr in detail.addresses"
                :key="addr.id"
                class="p-3 border rounded-lg flex justify-between items-start"
                :class="{
                  'border-blue-400 bg-blue-50/20': addr.isDefault === 1,
                }"
              >
                <div>
                  <div
                    class="flex items-center gap-2 font-medium text-gray-800"
                  >
                    <span>{{ addr.name }}</span>
                    <span>{{ addr.phone }}</span>
                    <Tag v-if="addr.isDefault === 1" color="blue">默认地址</Tag>
                    <Tag v-if="addr.tag" color="cyan">{{ addr.tag }}</Tag>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{
                      addr.fullAddress ||
                      `${addr.province}${addr.city}${addr.district}${addr.detailAddress}`
                    }}
                  </div>
                </div>
                <span class="text-xs text-gray-400">ID: {{ addr.id }}</span>
              </div>
            </div>
            <Empty v-else description="暂无收货地址" />
          </Tabs.TabPane>
        </Tabs>
      </div>
      <Empty v-else-if="!loading" description="未找到买家档案" />
    </Spin>
  </Drawer>
</template>
