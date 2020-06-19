import request from '@/utils/request'

export function addAction(data) {
  return request({
    url: '/action/add',
    method: 'post',
    data,
    type: 'json'
  })
}

export function updateAction(data) {
  return request({
    url: '/action/update',
    method: 'post',
    data,
    type: 'json'
  })
}

export function deleteAction(actionId) {
  return request({
    url: '/action/delete',
    method: 'post',
    data: { actionId }
  })
}
