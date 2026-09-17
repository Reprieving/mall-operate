<script lang="ts" setup>
import type { OrderAdminDetailVO } from '#/api/admin/model';

import { ref } from 'vue';

import { useVbenDrawer, useVbenModal } from '@vben/common-ui';

import {
  Button,
  Card,
  Divider,
  Empty,
  Image,
  Spin,
  Steps,
  Table,
  Tag,
  Timeline,
} from 'ant-design-vue';

import { getAdminOrderDetailApi, getAdminOrderRefundApi } from '#/api/admin';

import OrderRefundAuditModal from '../../refund-list/modules/refund-audit-modal.vue';

const loading = ref(false);
const detail = ref<null | OrderAdminDetailVO>(null);

const [AuditModal, auditModalApi] = useVbenModal({
  connectedComponent: OrderRefundAuditModal,
});

function handleOpenAuditModal() {
  if (!detail.value?.refundInfo) return;
  const r = detail.value.refundInfo;
  auditModalApi.setData({
    auditRemark: r.auditRemark,
    description: r.description,
    orderId: r.orderId ?? detail.value.orderInfo.id,
    orderSn: r.orderSn ?? detail.value.orderInfo.orderSn,
    proofPics: r.proofPics,
    reason: r.reason,
    refundAmount: r.refundAmount,
    refundId: r.id,
    refundSn: r.refundSn,
    refundTypeDesc: r.refundTypeDesc,
  });
  auditModalApi.open();
}

function handleAuditSuccess() {
  if (detail.value?.orderInfo?.id) {
    loadDetail(detail.value.orderInfo.id);
  }
}

function parsePics(pics?: string): string[] {
  if (!pics) return [];
  return pics
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const [Drawer, drawerApi] = useVbenDrawer({
  footer: false,
  title: '订单全生命周期履约与流转全景',
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData() as { orderId?: number };
      if (data?.orderId) {
        loadDetail(data.orderId);
      }
    }
  },
});

async function loadDetail(orderId: number) {
  loading.value = true;
  try {
    const res = await getAdminOrderDetailApi(orderId);
    detail.value = res;
    if (!detail.value.refundInfo) {
      try {
        const refundRes = await getAdminOrderRefundApi(orderId);
        if (refundRes && (refundRes.id || refundRes.refundSn)) {
          detail.value.refundInfo = refundRes;
        }
      } catch {
        // 该订单无退款记录，正常忽略
      }
    }
  } catch {
    // 模拟数据展示
    detail.value = {
      buyer: {
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer1',
        bio: '',
        certStatus: 1,
        createTime: '2026-01-15 10:20:00',
        email: 'zhangsan@example.com',
        gender: 1,
        id: 1001,
        nickname: '张小三',
        phone: '13800138000',
        realName: '张三',
        status: 1,
        updateTime: '2026-03-01 10:00:00',
        username: 'zhangsan',
      },
      items: [
        {
          createTime: '2026-03-08 09:30:00',
          id: 1,
          orderId,
          orderSn: 'DD202603080001',
          quantity: 1,
          skuCode: 'SPU101-BLK-L',
          skuId: 5002,
          skuName: '黑色 / L码',
          skuPic:
            'https://images.unsplash.com/photo-1544441893-675973e31985?w=100',
          skuPrice: 599,
          specData: '颜色:经典黑;尺码:L',
          spuId: 101,
          spuName: '2026春季轻薄保暖鹅绒服 (男女同款)',
          spuPic:
            'https://images.unsplash.com/photo-1544441893-675973e31985?w=100',
          subtotalAmount: 599,
        },
      ],
      orderInfo: {
        adminFlag: 1,
        adminRemark: '加急发货，已电话联系顺丰次日达',
        cancelReason: '',
        cancelTime: '',
        createTime: '2026-03-08 09:30:00',
        deliveryCompany: '顺丰速运',
        deliverySn: 'SF1029384756',
        deliveryTime: '2026-03-08 11:20:00',
        freightAmount: 0,
        id: orderId,
        mainPic:
          'https://images.unsplash.com/photo-1544441893-675973e31985?w=100',
        note: '请务必在工作日派送，谢谢！',
        orderSn: 'DD202603080001',
        payAmount: 599,
        paymentTime: '2026-03-08 09:32:15',
        payType: 1,
        receiveTime: '',
        receiverCity: '深圳市',
        receiverDetailAddress: '高新科技园南区 88 号大厦 1601',
        receiverDistrict: '南山区',
        receiverName: '张三',
        receiverPhone: '13800138000',
        receiverProvince: '广东省',
        status: 2,
        totalAmount: 599,
        totalQuantity: 1,
        tradeNo: 'PAY20260308093215887',
        userId: 1,
      },
      shop: {
        banner: '',
        certId: 1,
        createTime: '2026-01-01 10:00:00',
        id: 1,
        intro: '极地探险直营',
        logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=shop1',
        name: '极地探险户外旗舰店',
        notice: '官方自营',
        phone: '13800001111',
        score: 4.95,
        status: 1,
        statusName: '正常营业',
        type: 2,
        typeName: '品牌旗舰店',
        updateTime: '2026-01-01 10:00:00',
        userId: 1001,
      },
      timeline: [
        {
          action: '订单发货出库',
          detail: '承运商: 顺丰速运，运单号: SF1029384756',
          operator: '运营发货员 (李库管)',
          time: '2026-03-08 11:20:00',
        },
        {
          action: '运营插旗备注',
          detail: '插红旗：加急发货，已电话联系顺丰次日达',
          operator: '平台运营 (admin)',
          time: '2026-03-08 10:05:00',
        },
        {
          action: '订单支付成功',
          detail: '微信支付，流水号: PAY20260308093215887，实付: ¥599.00',
          operator: '买家系统自动流转',
          time: '2026-03-08 09:32:15',
        },
        {
          action: '买家提交下单',
          detail: '生成主订单，锁定库存 1 件',
          operator: '买家 (zhangsan)',
          time: '2026-03-08 09:30:00',
        },
      ],
    };
  } finally {
    loading.value = false;
  }
}

const statusMap: Record<number, { color: string; label: string }> = {
  0: { color: 'orange', label: '待付款' },
  1: { color: 'blue', label: '待发货' },
  2: { color: 'cyan', label: '已发货' },
  3: { color: 'green', label: '已完成' },
  4: { color: 'default', label: '已关闭' },
};

const itemColumns = [
  { dataIndex: 'pic', key: 'pic', title: '商品快照', width: 70 },
  { dataIndex: 'name', key: 'name', title: '商品及规格', width: 260 },
  { dataIndex: 'skuPrice', key: 'skuPrice', title: '单价', width: 90 },
  { dataIndex: 'quantity', key: 'quantity', title: '数量', width: 80 },
  {
    dataIndex: 'subtotalAmount',
    key: 'subtotalAmount',
    title: '小计',
    width: 100,
  },
];
</script>

<template>
  <Drawer class="w-[860px]">
    <Spin :spinning="loading">
      <div v-if="detail" class="space-y-4">
        <!-- 订单状态顶栏 -->
        <div
          class="flex items-center justify-between p-4 bg-slate-800/80 border border-slate-700 rounded-lg"
        >
          <div>
            <div class="flex items-center gap-3">
              <span class="text-base font-bold text-white">订单号: {{ detail.orderInfo.orderSn }}</span>
              <Tag
                :color="statusMap[detail.orderInfo.status]?.color || 'default'"
              >
                {{ statusMap[detail.orderInfo.status]?.label || '未知状态' }}
              </Tag>
              <Tag v-if="detail.orderInfo.adminFlag === 1" color="red">
                红旗加急
              </Tag>
              <Tag v-else-if="detail.orderInfo.adminFlag === 2" color="orange">
                黄旗催单
              </Tag>
              <Tag v-else-if="detail.orderInfo.adminFlag === 3" color="green">
                绿旗正常
              </Tag>
              <Tag v-else-if="detail.orderInfo.adminFlag === 4" color="blue">
                蓝旗排查
              </Tag>
              <Tag v-else-if="detail.orderInfo.adminFlag === 5" color="purple">
                紫旗特殊
              </Tag>
            </div>
            <div class="text-xs text-slate-300 mt-1 flex gap-4">
              <span>下单时间:
                <span class="text-white font-medium">{{
                  detail.orderInfo.createTime
                }}</span></span>
              <span v-if="detail.orderInfo.paymentTime">支付时间:
                <span class="text-white font-medium">{{
                  detail.orderInfo.paymentTime
                }}</span></span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-400">应付 / 实付款</div>
            <div class="text-2xl font-bold text-red-500 mt-0.5">
              ¥{{ detail.orderInfo.payAmount?.toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- 运营备注提示 -->
        <div
          v-if="detail.orderInfo.adminRemark"
          class="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 text-sm"
        >
          <strong>运营内部备忘：</strong> {{ detail.orderInfo.adminRemark }}
        </div>

        <!-- 售后退款流转卡片 (若该订单存在退款申请) -->
        <div
          v-if="detail.refundInfo"
          class="p-4 rounded-lg border border-amber-500/40 bg-amber-950/20"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base font-bold text-amber-400">⚡ 订单售后退款申请</span>
              <Tag v-if="detail.refundInfo.status === 0" color="warning">
                ⏳ 待运营审批
              </Tag>
              <Tag v-else-if="detail.refundInfo.status === 1" color="success">
                ✅ 审核通过 / 已退款
              </Tag>
              <Tag v-else-if="detail.refundInfo.status === 2" color="error">
                ❌ 申请已被驳回
              </Tag>
              <Tag color="cyan">
                {{
                  detail.refundInfo.refundTypeDesc ||
                  (detail.refundInfo.refundType === 2 ? '退货退款' : '仅退款')
                }}
              </Tag>
            </div>
            <Button
              v-if="detail.refundInfo.status === 0"
              type="primary"
              danger
              size="small"
              @click="handleOpenAuditModal"
            >
              立即审批退款
            </Button>
          </div>

          <div class="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span class="text-slate-400">退款单号：</span>
              <span class="font-mono text-white font-medium">{{
                detail.refundInfo.refundSn
              }}</span>
            </div>
            <div>
              <span class="text-slate-400">申请退款金额：</span>
              <span class="text-red-400 font-bold text-sm">¥{{ detail.refundInfo.refundAmount?.toFixed(2) }}</span>
            </div>
            <div>
              <span class="text-slate-400">申请时间：</span>
              <span class="text-slate-300">{{
                detail.refundInfo.createTime
              }}</span>
            </div>
            <div>
              <span class="text-slate-400">退款原因：</span>
              <span class="text-slate-200 font-medium">{{
                detail.refundInfo.reason
              }}</span>
            </div>
          </div>

          <div
            v-if="detail.refundInfo.description"
            class="mt-2 text-xs text-slate-300"
          >
            <span class="text-slate-400">买家说明：</span>{{ detail.refundInfo.description }}
          </div>

          <!-- 凭证图片预览 -->
          <div
            v-if="parsePics(detail.refundInfo.proofPics).length > 0"
            class="mt-2"
          >
            <span class="text-xs text-slate-400 block mb-1">售后退款凭证：</span>
            <Image.PreviewGroup>
              <div class="flex items-center gap-2">
                <Image
                  v-for="(pic, idx) in parsePics(detail.refundInfo.proofPics)"
                  :key="idx"
                  :src="pic"
                  :width="48"
                  :height="48"
                  class="rounded border border-slate-700 object-cover"
                />
              </div>
            </Image.PreviewGroup>
          </div>

          <!-- 若已审批，展示审批结果 -->
          <div
            v-if="detail.refundInfo.status !== 0 && detail.refundInfo.auditTime"
            class="mt-2 pt-2 border-t border-amber-900/40 text-xs text-slate-400 flex flex-wrap items-center gap-4"
          >
            <span>审批人：<span class="text-slate-200">{{
                detail.refundInfo.auditUserName || '运营管理员'
              }}</span></span>
            <span>审批时间：<span class="text-slate-200">{{
                detail.refundInfo.auditTime
              }}</span></span>
            <span v-if="detail.refundInfo.auditRemark">审批说明：<span class="text-amber-300 font-medium">{{
                detail.refundInfo.auditRemark
              }}</span></span>
          </div>
        </div>

        <!-- 流转关键节点步骤条 -->
        <Card size="small" class="shadow-sm">
          <Steps
            :current="
              detail.orderInfo.status === 4 ? 1 : detail.orderInfo.status
            "
            :status="detail.orderInfo.status === 4 ? 'error' : 'finish'"
            size="small"
            :items="[
              {
                title: '买家下单',
                description: detail.orderInfo.createTime?.split(' ')[1],
              },
              {
                title: '已付款',
                description:
                  detail.orderInfo.paymentTime?.split(' ')[1] || '待支付',
              },
              {
                title: '商家发货',
                description:
                  detail.orderInfo.deliveryTime?.split(' ')[1] || '待发货',
              },
              {
                title: '买家签收',
                description:
                  detail.orderInfo.receiveTime?.split(' ')[1] || '待签收',
              },
            ]"
          />
        </Card>

        <!-- 关联信息描述 -->
        <Row :gutter="16">
          <Col :span="12">
            <Card title="收件与配送信息" size="small" class="h-full">
              <div class="text-sm space-y-1.5 text-white">
                <div>
                  <span class="text-gray-300">收货人：</span><strong>{{ detail.orderInfo.receiverName }}</strong> ({{
                    detail.orderInfo.receiverPhone
                  }})
                </div>
                <div>
                  <span class="text-gray-300">详细地址：</span>{{ detail.orderInfo.receiverProvince
                  }}{{ detail.orderInfo.receiverCity
                  }}{{ detail.orderInfo.receiverDistrict
                  }}{{ detail.orderInfo.receiverDetailAddress }}
                </div>
                <Divider class="my-2" />
                <div>
                  <span class="text-gray-300">承运物流：</span>{{ detail.orderInfo.deliveryCompany || '未录入物流' }}
                </div>
                <div>
                  <span class="text-gray-300">快递单号：</span><strong class="text-blue-400">{{
                    detail.orderInfo.deliverySn || '暂无运单'
                  }}</strong>
                </div>
                <div v-if="detail.orderInfo.note">
                  <span class="text-gray-300">买家留言：</span>{{ detail.orderInfo.note }}
                </div>
              </div>
            </Card>
          </Col>
          <Col :span="12">
            <Card title="买家与商户画像" size="small" class="h-full">
              <div class="text-sm space-y-1.5 text-white">
                <div>
                  <span class="text-gray-300">买家账号：</span>{{ detail.buyer?.username }} ({{
                    detail.buyer?.nickname || '-'
                  }})
                </div>
                <div>
                  <span class="text-gray-300">买家电话：</span>{{ detail.buyer?.phone || '-' }}
                </div>
                <Divider class="my-2" />
                <div>
                  <span class="text-gray-300">所属商户：</span><strong class="text-blue-400">{{
                    detail.shop?.name || '平台自营'
                  }}</strong>
                </div>
                <div>
                  <span class="text-gray-300">商户电话：</span>{{ detail.shop?.phone || '-' }}
                </div>
                <div>
                  <span class="text-gray-300">支付方式：</span>{{
                    detail.orderInfo.payType === 1
                      ? '微信支付'
                      : detail.orderInfo.payType === 2
                        ? '支付宝'
                        : '在线支付'
                  }}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <!-- 商品快照条目 -->
        <Card title="订购商品明细快照" size="small">
          <Table
            :columns="itemColumns"
            :data-source="detail.items"
            :pagination="false"
            row-key="id"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'pic'">
                <Image
                  :src="record.skuPic || record.spuPic"
                  :width="44"
                  class="rounded border h-11 object-cover"
                />
              </template>
              <template v-else-if="column.key === 'name'">
                <div>
                  <div class="font-medium text-white">
                    {{ record.spuName }}
                  </div>
                  <div class="text-xs text-gray-300 mt-0.5">
                    规格: {{ record.specData }}
                  </div>
                  <div class="text-xs text-gray-300">
                    SKU 编码: {{ record.skuCode }}
                  </div>
                </div>
              </template>
              <template v-else-if="column.key === 'skuPrice'">
                <span>¥{{ record.skuPrice }}</span>
              </template>
              <template v-else-if="column.key === 'subtotalAmount'">
                <strong class="text-red-400">¥{{ record.subtotalAmount }}</strong>
              </template>
            </template>
          </Table>
        </Card>

        <!-- 订单流转时间轴日志 -->
        <Card title="订单流转时间轴日志 (OrderLog)" size="small">
          <Timeline class="pt-3">
            <Timeline.Item
              v-for="(log, idx) in detail.timeline"
              :key="idx"
              :color="idx === 0 ? 'green' : 'blue'"
            >
              <div class="flex items-center gap-2">
                <span class="font-bold text-white text-sm">{{
                  log.action
                }}</span>
                <span class="text-xs text-slate-400">({{ log.time }})</span>
              </div>
              <div class="text-xs text-slate-300 mt-0.5">{{ log.detail }}</div>
              <div class="text-xs text-slate-400 mt-0.5">
                经手人: {{ log.operator }}
              </div>
            </Timeline.Item>
          </Timeline>
        </Card>
      </div>
      <Empty v-else-if="!loading" description="未找到订单信息" />
    </Spin>

    <!-- 审批退款弹窗 -->
    <AuditModal @success="handleAuditSuccess" />
  </Drawer>
</template>
