import request from '@/utils/request'

export function deleteMenu(menuId) {
  return request({
    url: '/menu/delete',
    method: 'post',
    data: { menuId }
  })
}

export function updateMenu(menu) {
  return request({
    url: '/menu/update',
    method: 'post',
    data: menu,
    type: 'json'
  })
}

export function addMenu(menu) {
  return request({
    url: '/menu/add',
    method: 'post',
    data: menu,
    type: 'json'
  })
}

export function getMenus() {
  return request({
    url: '/menu/all',
    method: 'get'
  })
}
