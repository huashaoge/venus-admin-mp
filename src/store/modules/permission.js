import { constantRoutes } from '@/router'

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}
/**
 * 把路由信息提交到store 主要sidebar和顶部导航处理
 * @type {{generateRoutes({commit: *}, *=): *}}
 */
const actions = {
  generateRoutes({ commit }, routes) {
    return new Promise(resolve => {
      commit('SET_ROUTES', routes)
      resolve(routes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
