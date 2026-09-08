import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:users',
      order: 10,
      title: '用户与认证',
    },
    name: 'UserManagement',
    path: '/user',
    children: [
      {
        name: 'BuyerList',
        path: 'buyer-list',
        component: () => import('#/views/user/buyer-list/index.vue'),
        meta: {
          icon: 'lucide:user-check',
          title: '买家用户管控',
        },
      },
      {
        name: 'CertificationAudit',
        path: 'certification',
        component: () => import('#/views/user/certification/index.vue'),
        meta: {
          icon: 'lucide:shield-check',
          title: '主体认证审批',
        },
      },
    ],
  },
];

export default routes;
