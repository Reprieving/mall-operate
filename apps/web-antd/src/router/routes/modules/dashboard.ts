import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: '运营大盘',
    },
    name: 'Dashboard',
    path: '/dashboard',
    children: [
      {
        name: 'MallOverview',
        path: 'overview',
        component: () => import('#/views/dashboard/overview/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:gauge',
          title: '运营工作台',
        },
      },
      {
        name: 'Analytics',
        path: 'analytics',
        component: () => import('#/views/dashboard/analytics/index.vue'),
        meta: {
          icon: 'lucide:area-chart',
          title: $t('page.dashboard.analytics'),
        },
      },
      {
        name: 'Workspace',
        path: 'workspace',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          icon: 'carbon:workspace',
          title: $t('page.dashboard.workspace'),
        },
      },
    ],
  },
];

export default routes;
