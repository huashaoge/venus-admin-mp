import request from '@/utils/request'
/**
 * 获取菜单和操作权限列表
 * @param serviceId
 */
export function getAuthorityMenu() {
  return request({
    url: '/authority/menu',
    method: 'get'
  })
}

export function grantAuthorityUser({ userId, expireTime, authorityIds }) {
  const data = {
    userId: userId,
    expireTime: expireTime,
    authorityIds: authorityIds.join(',')
  }
  return request({
    url: '/authority/user/grant',
    data,
    method: 'post'
  })
}

export function getAuthorityUser(userId) {
  const params = {
    userId: userId
  }
  return request({
    url: '/authority/user',
    params,
    method: 'get'
  })
}

export function getAuthorityRole(roleId) {
  const params = {
    roleId: roleId
  }
  return request({
    url: '/authority/role',
    method: 'get',
    params
  })
}

export function grantAuthorityRole({ roleId, expireTime, authorityIds }) {
  const data = {
    roleId: roleId,
    expireTime: expireTime,
    authorityIds: authorityIds.join(',')
  }
  return request({
    url: '/authority/role/grant',
    method: 'post',
    data
  })
}

