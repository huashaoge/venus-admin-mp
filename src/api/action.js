import request from '@/utils/request'

export function addAction(data) {
  return request({
    url: '/action/add',
    method: 'post',
    data,
    type: 'json'
  })
}
