<template>
  <div style="padding: 32px">
    <div style="padding-bottom: 10px">
      <el-button type="primary" icon="el-icon-plus" @click="addAction">新增</el-button>
    </div>
    <div>
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        default-expand-all
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column label="功能代码" prop="actionCode" align="center" />
        <el-table-column label="功能名称" prop="actionName" align="center" />
        <el-table-column label="优先级" prop="priority" align="center" />
        <el-table-column label="修改时间" prop="updateTime" align="center">
          <template slot-scope="{ row: { updateTime }}">
            <span>{{ updateTime | timeFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column>
          <template slot-scope="{ row }">
            <el-button type="primary" icon="el-icon-edit" @click="editAction(row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deleteAction(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div>
      <el-dialog
        :visible.sync="detailVisible"
        :show-close="true"
        @close="closeDialog"
      >
        <el-form ref="actionForm" :model="actionItem" :rules="actionItemRules" label-width="80px" label-position="right">
          <el-form-item label="所属菜单">
            <el-input v-model="menuName" disabled />
          </el-form-item>
          <el-form-item prop="actionCode" label="功能标识">
            <el-input v-model="actionItem.actionCode" placeholder="默认后缀:View/Edit/Del/Add" />
          </el-form-item>
          <el-form-item prop="actionName" label="功能名称">
            <el-input v-model="actionItem.actionName" placeholder="功能名称" />
          </el-form-item>
          <el-form-item prop="priority" label="优先级">
            <el-input v-model="actionItem.priority" type="number" style="width:80px" placeholder="优先级" />
          </el-form-item>
          <el-form-item prop="status" label="状态">
            <el-radio-group v-model="actionItem.status">
              <el-radio :label="0">禁用</el-radio>
              <el-radio :label="1">启用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item prop="menuDesc" label="描述">
            <el-input v-model="actionItem.menuDesc" type="textarea" :rows="3" placeholder="请输入内容" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { parseTime } from '../../../utils'
import { getMenuAction } from '../../../api/menu'
import { addAction, deleteAction, updateAction } from '../../../api/action'
export default {
  name: 'Action',
  filters: {
    timeFilter(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}') : '无'
    }
  },
  data() {
    const validateEn = (rule, value, callback) => {
      const reg = /^[_a-zA-Z0-9]+$/
      if (value === '') {
        callback(new Error('功能标识不能为空'))
      } else if (value !== '' && !reg.test(value)) {
        callback(new Error('只允许字母、数字、下划线'))
      } else {
        callback()
      }
    }
    return {
      tableKey: 0,
      listLoading: false,
      list: [],
      detailVisible: false,
      menuName: '',
      saving: false,
      isEdit: false,
      actionItem: {
        actionId: '',
        actionCode: '',
        actionName: '',
        status: 1,
        menuId: '',
        priority: 0,
        actionDesc: ''
      },
      actionItemRules: {
        actionCode: [
          { required: true, validator: validateEn, trigger: 'blur' }
        ],
        actionName: [
          { required: true, message: '功能名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.getMenuAction()
  },
  methods: {
    deleteAction(row) {
      this.$confirm('此操作将永久删除该目录，是否继续？ ', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteAction(row.actionId).then(res => {
          if (res.code === 20000) {
            this.$notify({
              title: '成功',
              message: res.message || '删除成功',
              type: 'success',
              duration: 2000
            })
            this.getMenuAction()
          }
        })
      })
    },
    closeDialog() {
      this.$emit('close-dialogStatus', true)
      this.setDefault()
    },
    addAction() {
      this.detailVisible = true
    },
    editAction(row) {
      this.actionItem = Object.assign({}, row)
      this.detailVisible = true
      this.isEdit = true
    },
    setDefault() {
      const newData = {
        actionId: '',
        actionCode: '',
        actionName: '',
        status: 1,
        priority: 0,
        actionDesc: ''
      }
      this.actionItem = newData
      this.actionItem.menuId = this.$route.query.menuId
      this.$refs.actionForm.resetFields()
      this.isEdit = false
      this.saving = false
      this.detailVisible = false
    },
    handleSubmit() {
      this.$refs['actionForm'].validate((valid) => {
        if (valid) {
          this.saving = true
          if (this.isEdit) {
            // 修改
            updateAction(this.actionItem).then(res => {
              if (res.code === 20000) {
                const { message } = res
                this.$notify({
                  title: '操作成功',
                  message: message,
                  type: 'success',
                  duration: 2000
                })
                this.saving = false
                this.detailVisible = false
                this.getMenuAction()
                this.setDefault()
              }
            }).catch(() => {
              this.saving = false
            })
          } else {
            addAction(this.actionItem).then(res => {
              if (res.code === 20000) {
                const { message } = res
                this.$notify({
                  title: '操作成功',
                  message: message,
                  type: 'success',
                  duration: 2000
                })
                this.saving = false
                this.detailVisible = false
                this.getMenuAction()
                this.setDefault()
              }
            }).catch(() => {
              this.saving = false
            })
          }
        }
      })
    },
    getMenuAction() {
      this.listLoading = true
      const menuId = this.$route.query.menuId
      this.actionItem.menuId = menuId
      this.menuName = this.$route.query.menuName
      getMenuAction(menuId).then(res => {
        this.list = res.data
        this.listLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
