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

