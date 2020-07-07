<template>
  <div style="padding: 32px">
    <el-table
      :data="list"
      style="width: 100%;margin-bottom: 20px;"
      row-key="menuId"
      border
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column
        prop="menuName"
        label="菜单名称"
      />
      <el-table-column
        prop="priority"
        label="权重(值小靠前)"
      />
      <el-table-column
        label="状态"
      >
        <template slot-scope="{ row: { icon,status }}">
          <el-badge is-dot class="item" :type="status=='1' ? 'success' : 'danger'" />
          <svg-icon :class-name="icon" :icon-class="icon" />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="600"
        align="center"
        fixed="right"
      >
        <template slot-scope="{ row }">
          <el-button type="primary" icon="el-icon-plus" :disabled="hasAuthority('systemMenuAdd')?false:true" @click="handleAddChild(row)">新增</el-button>
          <el-button type="primary" icon="el-icon-edit" :disabled="hasAuthority('systemMenuEdit')?false:true" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" :disabled="hasAuthority('systemMenuDel')?false:true" @click="handleDelete(row)">删除</el-button>
          <el-button type="primary" icon="el-icon-setting" :disabled="hasAuthority('systemMenuAction')?false:true" @click="handleAction(row)">功能</el-button>
        </template>
      </el-table-column>
    </el-table>
    <detail :form-item="formItem" :select-tree-data="selectTreeData" :is-edit="isEdit" :visible="visible" @close-dialogStatus="close_dialog" />
  </div>
</template>

<script>
import { getMenus, deleteMenu } from '../../../api/menu'
import { listConvertTree } from '../../../utils/util'
import Detail from './components/Detail'

export default {
  name: 'List',
  components: { Detail },
  data() {
    return {
      list: [],
      visible: false,
      isEdit: true,
      showAction: false,
      formItem: {
        menuId: '',
        menuCode: '',
        menuName: '',
        icon: 'clipboard',
        path: '',
        scheme: '/',
        target: '_self',
        status: 0,
        parentId: '0',
        priority: 0,
        menuDesc: ''
      },
      selectTreeData: [{
        menuId: 0,
        menuName: '无'
      }]
    }
  },
  created() {
  },
  mounted() {
    this.getList()
  },
  methods: {
    close_dialog() {
      this.visible = false
    },
    setSelectTree(data) {
      this.selectTreeData = data
    },
    getList() {
      getMenus().then(res => {
        const opt = {
          primaryKey: 'menuId',
          parentKey: 'parentId',
          startPid: '0'
        }
        this.list = listConvertTree(res.data, opt)
        this.setSelectTree(this.list)
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除该目录，是否继续？ ', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteMenu(row.menuId).then(res => {
          if (res.code === 20000) {
            this.$notify({
              title: '成功',
              message: res.message || '删除成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          }
        })
      })
    },
    handleEdit(row) {
      this.formItem = Object.assign({}, row)
      this.visible = true
    },
    handleAddChild(row) {
      this.formItem = {}
      this.formItem.parentId = row.menuId
      this.formItem.icon = 'documentation'
      this.isEdit = false
      this.visible = true
    },
    handleAction(row) {
      this.showAction = true
      this.$router.push({
        path: '/system/menus/action',
        query: { menuId: row.menuId, menuName: row.menuName }
      })
    }
  }
}
</script>

<style scoped>

</style>
