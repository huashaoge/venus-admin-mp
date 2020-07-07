import request from '@/utils/request'

/* 登录获取token信息 */
export function login(data) {
  return request({
    url: '/login/token',
    method: 'post',
    data
  })
}

/* 获取用户信息，主要获取用户的基础信息*/
export function getInfo(token) {
  return request({
    url: '/current/user',
    method: 'get',
    params: { token }
  })
}
/* 获取用户有权限的菜单目录*/
export function getCurrentUserMenu() {
  return request({
    url: '/current/user/menus',
    method: 'get'
  })
}

export function logout(token) {
  return request({
    url: '/logout/token',
    method: 'post',
    data: { token: token }
  })
}

export function getUsers(params) {
  return request({
    url: '/user',
    params,
    method: 'get'
  })
}

export function getAllUsers() {
  return request({
    url: '/user/all',
    method: 'get'
  })
}

export function addUser(data) {
  return request({
    url: '/user/add',
    data,
    type: 'json',
    method: 'post'
  })
}
