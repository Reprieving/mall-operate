import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:package',
      order: 20,
      title: '商品全景管控',
    },
    name: 'ProductManagement',
    path: '/product',
    children: [
      {
        name: 'SpuList',
        path: 'spu-list',
        component: () => import('#/views/product/spu-list/index.vue'),
        meta: {
          icon: 'lucide:shopping-bag',
          title: '商品统筹列表',
        },
      },
      {
        name: 'StockWarning',
        path: 'stock-warning',
        component: () => import('#/views/product/stock-warning/index.vue'),
        meta: {
          icon: 'lucide:alert-triangle',
          title: '库存告急预警',
        },
      },
      {
        name: 'CategoryManage',
        path: 'category',
        component: () => import('#/views/product/category/index.vue'),
        meta: {
          icon: 'lucide:folder-tree',
          title: '商品类目管理',
        },
      },
      {
        name: 'BrandManage',
        path: 'brand',
        component: () => import('#/views/product/brand/index.vue'),
        meta: {
          icon: 'lucide:award',
          title: '商品品牌管理',
        },
      },
      {
        name: 'SpecManage',
        path: 'spec',
        component: () => import('#/views/product/spec/index.vue'),
        meta: {
          icon: 'lucide:sliders',
          title: '规格属性模板',
        },
      },
    ],
  },
];

export default routes;
