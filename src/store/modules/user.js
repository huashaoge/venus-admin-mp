import { login, logout, getInfo, getCurrentUserMenu } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  userName: '',
  userId: '',
  nickName: '',
  avatar: '',
  access: [],
  mobile: '',
  email: '',
  menus: [],
  hasGetInfo: false
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_HASGETINFO(state, status) {
    state.hasGetInfo = status
  },
  SET_ACCESS: (state, access) => {
    state.access = access
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_NICKNAME: (state, nickName) => {
    state.nickName = nickName
  },
  SET_USERID: (state, id) => {
    state.userId = id
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_USERMENUS(state, menus) {
    state.menus = menus
  },
  SET_MOBILE(state, mobile) {
    state.mobile = mobile
  },
  SET_EMAIL(state, email) {
    state.email = email
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.access_token)
        setToken(data.access_token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      // 获取用户信息提交到store
      getInfo(state.token).then(res => {
        if (res.code === 20000) {
          commit('SET_AVATAR', res.data.avatar)
          commit('SET_NAME', res.data.userName)
          commit('SET_NICKNAME', res.data.nickName)
          commit('SET_USERID', res.data.userId)
          commit('SET_EMAIL', res.data.email)
          commit('SET_MOBILE', res.data.mobile)
          const access = []
          if (res.data.authorities) {
            res.data.authorities.map(item => {
              if (item.authority) {
                access.push(item.authority)
              }
            })
          }
          commit('SET_ACCESS', access)
          // 用于判断需不需要初始或重新调用用户信息
          commit('SET_HASGETINFO', true)
          getCurrentUserMenu().then(res => {
            if (res.code === 20000) {
              // 将用户可用的权限目录缓存
              commit('SET_USERMENUS', res.data)
              resolve(state)
            }
          }).catch(err => {
            reject(err)
          })
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_USERMENUS', [])
        commit('SET_HASGETINFO', false)
        removeToken()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_USERMENUS', [])
      commit('SET_HASGETINFO', false)
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  changeRoles({ commit, dispatch }, role) {
    return new Promise(async resolve => {
      const token = role + '-token'

      commit('SET_TOKEN', token)
      setToken(token)

      const { roles } = await dispatch('getInfo')

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
