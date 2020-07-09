import request from '@/utils/request'

export function getRoles({ page, limit, roleCode, roleName }) {
  const params = { page: page, limit: limit, roleCode: roleCode, roleName: roleName }
  return request({
    url: '/role',
    params,
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/role/add',
    method: 'post',
    type: 'json',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/role/update',
    method: 'post',
    data,
    type: 'json'
  })
}

export function deleteRole(roleId) {
  return request({
    url: `/role/delete`,
    method: 'post',
    data: { roleId }
  })
}

export function getRoleUsers(roleId) {
  const params = {
    roleId: roleId
  }
  return request({
    url: '/role/users',
    method: 'get',
    params
  })
}

export function addRoleUsers({ roleId, userIds }) {
  const data = {
    roleId: roleId,
    userIds: userIds.join(',')
  }
  return request({
    url: '/role/users/add',
    data,
    method: 'post'
  })
}

export function getAllRoles() {
  return request({
    url: '/role/all',
    method: 'get'
  })
}
