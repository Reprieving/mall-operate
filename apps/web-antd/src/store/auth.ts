import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import {
  adminLoginApi,
  adminLogoutApi,
  getAccessCodesApi,
  getAdminInfoApi,
  getUserInfoApi,
  loginApi,
  logoutApi,
} from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      let accessToken = '';
      let accessCodes: string[] = [];

      try {
        // 优先对接平台运营管理员登录接口
        const adminRes = await adminLoginApi({
          username: params.username,
          password: params.password,
        });
        accessToken = adminRes.token;
        accessCodes = adminRes.permissions || ['*:*:*'];
        userInfo = {
          avatar:
            adminRes.avatar ||
            'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          desc: 'Platform Administrator',
          homePath: preferences.app.defaultHomePath,
          realName: adminRes.nickname || adminRes.username,
          roles: [adminRes.roleCode || 'admin'],
          token: accessToken,
          userId: String(adminRes.id),
          username: adminRes.username,
        };
      } catch {
        // 后备使用基础登录接口 (用于开发环境或本地Mock)
        const baseRes = await loginApi(params);
        accessToken = baseRes.accessToken;
      }

      if (accessToken) {
        accessStore.setAccessToken(accessToken);

        if (!userInfo) {
          const [fetchUserInfoResult, codes] = await Promise.all([
            fetchUserInfo(),
            getAccessCodesApi().catch(() => ['*:*:*']),
          ]);
          userInfo = fetchUserInfoResult;
          accessCodes = codes;
        }

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo?.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await adminLogoutApi();
    } catch {
      try {
        await logoutApi();
      } catch {
        // 不做任何处理
      }
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: UserInfo;
    try {
      const adminInfo = await getAdminInfoApi();
      userInfo = {
        avatar:
          adminInfo.avatar ||
          'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        desc: 'Platform Administrator',
        homePath: preferences.app.defaultHomePath,
        realName: adminInfo.nickname || adminInfo.username,
        roles: [adminInfo.roleCode || 'admin'],
        token: '',
        userId: String(adminInfo.id),
        username: adminInfo.username,
      };
      if (adminInfo.permissions) {
        accessStore.setAccessCodes(adminInfo.permissions);
      }
    } catch {
      userInfo = await getUserInfoApi();
    }
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
