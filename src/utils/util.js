import Layout from '@/layout'
export const formatRouters = (array, access) => {
  const opt = {
    primaryKey: 'menuId',
    parentKey: 'parentId',
    startPid: 0
  }
  const menus = listConvertTree(array, opt)
  const routers = filterRouter(menus, access, [])
  return routers
}
/**
 *  将数据处理成router识别的数据，过滤无效数据
 * @param array
 * @param access
 * @param routers
 * @returns {*}
 */
export const filterRouter = (array, access, routers) => {
  const list = array.map(item => {
    const path = startWith(item.path, '/') ? item.path.substring(1) : item.path
    const url = item.scheme + item.path
    const router = {
      name: `${item.menuCode}`,
      path: url,
      meta: {
        title: item.menuName,
        icon: item.icon || 'document'
      },
      children: []
    }
    if (item.parentId === 0 || item.parentId === '0') {
      // 根节点
      // router.path = '/'
      router.component = Layout
      if (!hasChild(item)) {
        // 非根节点
        if (item.target === '_blank') {
          // 新窗口打开，使用meta.href
          router.meta.href = url
        } else {
          if (item.scheme === '/') {
            // 内部组件
            router.component = (resolve) => {
              require([`@/views/${path}.vue`], resolve)
            }
          } else {
            // iframe
            router.path = `/iframe?src=${encodeURIComponent(url)}`
            // iframe 组件
            router.component = (resolve) => {
              // require([`_c/iframe-view`], resolve)
            }
          }
        }
      }
    } else {
      if (item.target === '_blank') {
        router.meta.href = url
      } else {
        if (item.scheme === '/') {
          // 内部组件
          router.component = (resolve) => {
            require([`@/views/${path}.vue`], resolve)
          }
        } else {
          router.path = `/iframe?src=${encodeURIComponent(url)}`
          // frame组件
          router.component = (resolve) => {
            // require([`_c/iframe-view`], resolve)
          }
        }
      }
    }
    if (hasChild(item)) {
      router.children.push(...filterRouter(item.children, access, []))
    }
    return router
  }
  )
  routers.push(...list)
  return routers
}

export const hasChild = (item) => {
  return item.children && item.children.length !== 0
}

export const startWith = (str, prefix) => {
  const reg = new RegExp('^' + prefix)
  return reg.test(str)
}
/**
 *  将平行数据转换成多层数据
 * @param array
 * @param opt
 * @returns {Array|*}
 */
export const listConvertTree = (array, opt) => {
  const obj = {
    primaryKey: opt.primaryKey || 'id',
    parentKey: opt.parentKey || 'pid',
    startPid: opt.startPid || 0,
    currentDept: opt.currentDept || 0,
    maxDept: opt.maxDept || 100,
    childKey: opt.childKey || 'children'
  }
  return listToTree(array, obj.startPid, obj.currentDept, obj)
}

export const listToTree = (array, startPid, currentDept, opt) => {
  if (opt.maxDept < currentDept) {
    return []
  }
  let child = []
  if (array && array.length > 0) {
    child = array.map(item => {
      if (typeof item[opt.parentKey] !== 'undefined' && +item[opt.parentKey] === +startPid) {
        // 递归循环出子节点
        const nextChild = listToTree(array, item[opt.primaryKey], currentDept + 1, opt)
        // 节点信息保存
        if (nextChild.length > 0) {
          item['hasChild'] = true
          item[opt.childKey] = nextChild
        } else {
          item['hasChild'] = false
        }
        return item
      }
    }).filter(item => {
      return item !== undefined
    })
  }
  return child
}
