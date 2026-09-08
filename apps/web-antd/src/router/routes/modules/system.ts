import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:settings',
      order: 50,
      title: '系统与权限',
    },
    name: 'SystemManagement',
    path: '/system',
    children: [
      {
        name: 'AdminUsers',
        path: 'admin-users',
        component: () => import('#/views/system/admin-users/index.vue'),
        meta: {
          icon: 'lucide:user-cog',
          title: '管理员账号',
        },
      },
      {
        name: 'RolesManage',
        path: 'roles',
        component: () => import('#/views/system/roles/index.vue'),
        meta: {
          icon: 'lucide:shield',
          title: '角色与RBAC权限',
        },
      },
    ],
  },
];

export default routes;
