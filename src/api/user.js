import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login/token',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/current/user',
    method: 'get',
    params: { token }
  })
}

export function logout(token) {
  return request({
    url: '/logout/token',
    method: 'post',
    data: { token: token }
  })
}
