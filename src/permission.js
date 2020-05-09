import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import { formatRouters } from '@/utils/util'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  // 有token执行
  if (hasToken) {
    // 如果是登录页访问，直接转首页
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      // 如果已经获取过用户以及权限数据则放过，直接访问
      if (store.state.user.hasGetInfo) {
        next()
        NProgress.done()
      } else {
        try {
          // get user info
          await store.dispatch('user/getInfo').then(async res => {
            // 动态路由存放
            let dyncRouters = []
            dyncRouters = dyncRouters.concat(...formatRouters(res.menus, res.access))
            const accessRoutes = await store.dispatch('permission/generateRoutes', dyncRouters)
            // 动态添加路由
            router.addRoutes(accessRoutes)
            next({ ...to, replace: true })
            NProgress.done()
          })
        } catch (error) {
          // 出错则重置token回到登录页
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    // 没有登录无token

    if (whiteList.indexOf(to.path) !== -1) {
      // 白名单页面直接访问
      next()
    } else {
      // 其他页面跳转登录页
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
