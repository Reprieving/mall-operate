import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:clipboard-list',
      order: 30,
      title: '订单流转调度',
    },
    name: 'OrderManagement',
    path: '/order',
    children: [
      {
        name: 'OrderList',
        path: 'order-list',
        component: () => import('#/views/order/order-list/index.vue'),
        meta: {
          icon: 'lucide:truck',
          title: '订单调度大盘',
        },
      },
      {
        name: 'RefundList',
        path: 'refund-list',
        component: () => import('#/views/order/refund-list/index.vue'),
        meta: {
          icon: 'lucide:rotate-ccw',
          title: '售后退款审批',
        },
      },
    ],
  },
];

export default routes;
