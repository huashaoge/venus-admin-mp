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
        width="120"
        align="center"
        fixed="right"
      >
        <template slot-scope="{ row }">
          <el-button type="text" icon="el-icon-edit" />
          <el-button type="text" icon="el-icon-delete" style="color: red" @click="handleDelete(row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getMenus, deleteMenu } from '../../../api/menu'
import { listConvertTree } from '../../../utils/util'

export default {
  name: 'List',
  data() {
    return {
      list: []
    }
  },
  created() {
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      getMenus().then(res => {
        const opt = {
          primaryKey: 'menuId',
          parentKey: 'parentId',
          startPid: '0'
        }
        this.list = listConvertTree(res.data, opt)
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
    }
  }
}
</script>

<style scoped>

</style>
