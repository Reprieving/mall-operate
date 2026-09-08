import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:store',
      order: 40,
      title: '店铺入驻监管',
    },
    name: 'ShopManagement',
    path: '/shop',
    children: [
      {
        name: 'ShopList',
        path: 'shop-list',
        component: () => import('#/views/shop/shop-list/index.vue'),
        meta: {
          icon: 'lucide:building-2',
          title: '店铺全景监管',
        },
      },
      {
        name: 'ShopAudit',
        path: 'shop-audit',
        component: () => import('#/views/shop/shop-audit/index.vue'),
        meta: {
          icon: 'lucide:file-check',
          title: '入驻开店审核',
        },
      },
    ],
  },
];

export default routes;
