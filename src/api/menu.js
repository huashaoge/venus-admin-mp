import request from '@/utils/request'

export function deleteMenu(menuId) {
  return request({
    url: '/menu/delete',
    method: 'post',
    data: { menuId }
  })
}

export function getMenus() {
  return request({
    url: '/menu/all',
    method: 'get'
  })
}
