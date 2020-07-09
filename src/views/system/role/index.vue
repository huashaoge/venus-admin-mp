<template>
  <div style="padding: 16px">
    <el-card>
      <el-form :inline="true" :model="pageInfo">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="pageInfo.roleName" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="pageInfo.roleCode" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="handleSearch(1)">查询</el-button>
        </el-form-item>
      </el-form>
      <div style="padding: 0 0 10px 0;">
        <el-button-group>
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleModal()"><span>添加</span></el-button>
        </el-button-group>
      </div>
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;"
        :default-sort="defaultSort"
        @sort-change="sortChange"
      >
        <el-table-column
          prop="roleName"
          label="角色名称"
        />
        <el-table-column
          prop="roleCode"
          label="角色标识"
        />
        <el-table-column
          label="状态"
        >
          <template slot-scope="{ row: { status }}">
            <el-badge v-if="status=='1'" is-dot class="item" type="success">有效</el-badge>
            <el-badge v-else is-dot class="item" type="danger">无效</el-badge>
          </template>
        </el-table-column>
        <el-table-column
          prop="roleDesc"
          label="描述"
        />
        <el-table-column label="修改时间" prop="updateTime" align="center">
          <template slot-scope="{ row: { updateTime }}">
            <span>{{ updateTime | timeFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="{ row }">
            <el-link type="primary" @click="handleModal(row)">编辑</el-link>
            <el-link type="primary" @click="handleModal(row, forms[1])">分配菜单</el-link>
            <el-dropdown trigger="click" @command="handleClick($event,row)">
              <span>
                <el-link type="primary">更多<i class="el-icon-arrow-down" /></el-link>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="addUser" style="color: #1890ff">添加成员</el-dropdown-item>
                <el-dropdown-item command="remove" style="color: #ff4949">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="pageInfo.total > 0"
        :total="pageInfo.total"
        :page.sync="pageInfo.page"
        :limit.sync="pageInfo.pageSize"
        @pagination="refresh"
      />
    </el-card>
    <el-dialog
      :visible.sync="modalVisible"
      :show-close="true"
      :title="modalTitle"
      @close="closeDialog"
    >
      <el-form v-show="current == 'form1'" ref="form1" :model="formItem" :rules="formItemRules" label-width="80px" label-position="right">
        <el-form-item prop="roleCode" label="角色标识">
          <el-input v-model="formItem.roleCode" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item prop="roleName" label="角色名称">
          <el-input v-model="formItem.roleName" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item prop="status" label="状态">
          <el-radio-group v-model="formItem.status">
            <el-radio :label="0">禁用</el-radio>
            <el-radio :label="1">启用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="menuDesc" label="描述">
          <el-input v-model="formItem.roleDesc" type="textarea" :rows="3" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <!--分配权限-->
      <el-form v-show="current == 'form2'" ref="form2" :model="formItem" :rules="formItemRules" label-width="80px" label-position="right">
        <el-form-item prop="expireTime" label="过期时间(选填)">
          <el-date-picker
            v-model="formItem.expireTime"
            type="datetime"
            placeholder="设置有效期"
          />
        </el-form-item>
        <el-form-item prop="grantMenus" label="功能菜单(选填)">
          <tree-table
            ref="tree"
            style="max-height:500px;overflow: auto"
            expand-key="menuName"
            :expand-type="false"
            :is-fold="false"
            :tree-type="true"
            :selectable="true"
            :columns="columns2"
            :data="selectMenus"
          >
            <template slot="operation" slot-scope="scope">
              <el-checkbox-group v-model="formItem.grantActions">
                <el-checkbox v-for="item in scope.row.actionList" :key="item.authorityId" :label="item.authorityId">
                  <span :title="item.actionDesc">{{ item.actionName }}</span>
                </el-checkbox>
              </el-checkbox-group>
            </template>
          </tree-table>
        </el-form-item>
      </el-form>
      <!--添加成员-->
      <el-form v-show="current == 'form3'" ref="form3" :model="formItem" :rules="formItemRules">
        <el-form-item prop="authorities" label="添加成员(选填)">
          <el-transfer
            v-model="value"
            style="text-align: left; display: inline-block"
            :data="selectUsers"
            :props="{
              key: 'userId',
              label: 'nickName'
            }"
            filterable
            :titles="['选择用户', '已选择用户']"
            :format="{
              noChecked: '${total}',
              hasChecked: '${checked}/${total}'
            }"
            @change="handleTransferChange"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" :loading="saving" size="mini" @click="handleSubmit">保存</el-button>
        <el-button type="default" size="mini" @click="closeDialog">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '../../../utils'
import { getRoles, addRole, updateRole, deleteRole, getRoleUsers, addRoleUsers } from '../../../api/role'
import { getAllUsers } from '../../../api/user'
import { getAuthorityMenu, getAuthorityRole, grantAuthorityRole } from '../../../api/authority'
import Pagination from '../../../components/Pagination/index'
import { listConvertTree } from '../../../utils/util'
export default {
  name: 'Index',
  components: { Pagination },
  filters: {
    timeFilter(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}') : '无'
    }
  },
  data() {
    const validateEn = (rule, value, callback) => {
      const reg = /^[_a-zA-Z0-9]+$/
      if (value === '') {
        callback(new Error('角色标识不能为空'))
      } else if (value !== '' && !reg.test(value)) {
        callback(new Error('只允许字母、数字、下划线'))
      } else {
        callback()
      }
    }
    return {
      value: [],
      tableKey: 0,
      listLoading: false,
      modalVisible: false,
      modalTitle: '',
      list: [],
      current: 'form1',
      selectMenus: [],
      selectUsers: [],
      forms: [
        'form1',
        'form2',
        'form3'
      ],
      formItem: {
        roleId: '',
        roleCode: '',
        roleName: '',
        path: '',
        status: 1,
        menuId: '',
        priority: 0,
        roleDesc: '',
        grantMenus: [],
        grantActions: [],
        expireTime: '',
        isExpired: false,
        userIds: []
      },
      columns2: [
        {
          title: '菜单',
          key: 'menuName',
          minWidth: '250px'
        },
        {
          title: '功能',
          type: 'template',
          template: 'operation',
          minWidth: '200px'
        }
      ],
      saving: false,
      formItemRules: {
        roleCode: [
          { required: true, validator: validateEn, trigger: 'blur' }
        ],
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ]
      },
      defaultSort: {},
      pageInfo: {
        total: 0,
        page: 1,
        limit: 10,
        roleCode: '',
        roleName: '',
        sort: ''
      }
    }
  },
  mounted() {
    this.handleSearch()
  },
  methods: {
    handleTransferChange(value, direction, moveKeys) {
      this.formItem.userIds = value
    },
    // transferRender(h, option) {
    //   return `<span  title="${option.label}">---${option.label}</span>`
    // },
    handleClick(command, row) {
      switch (command) {
        case 'addUser':
          this.handleModal(row, this.forms[2])
          break
        case 'remove':
          this.handleRemove(row)
          break
      }
    },
    handleRemove(row) {
      this.$confirm('确定删除吗？ ', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRole(row.roleId).then(res => {
          if (res.code === 20000) {
            this.$notify({
              title: '成功',
              message: res.message || '删除成功',
              type: 'success',
              duration: 2000
            })
            this.handleSearch()
          }
        })
      })
    },
    handleSubmit() {
      if (this.current === this.forms[0]) {
        this.$refs[this.current].validate((valid) => {
          if (valid) {
            this.saving = true
            if (this.formItem.roleId) {
              updateRole(this.formItem).then(res => {
                if (res.code === 20000) {
                  const { message } = res
                  this.$notify({
                    title: '操作成功',
                    message: message,
                    type: 'success',
                    duration: 2000
                  })
                  this.closeDialog()
                }
                this.handleSearch()
              }).finally(() => {
                this.saving = false
              })
            } else {
              addRole(this.formItem).then(res => {
                if (res.code === 20000) {
                  const { message } = res
                  this.$notify({
                    title: '操作成功',
                    message: message,
                    type: 'success',
                    duration: 2000
                  })
                  this.closeDialog()
                }
                this.handleSearch()
              }).finally(() => {
                this.saving = false
              })
            }
          }
        })
      }
      if (this.current === this.forms[1]) {
        this.$refs[this.current].validate((valid) => {
          if (valid) {
            const authorityIds = this.getCheckedAuthorities()
            this.saving = true
            grantAuthorityRole({
              roleId: this.formItem.roleId,
              expireTime: this.formItem.expireTime ? this.formItem.expireTime.pattern('yyyy-MM-dd HH:mm:ss') : '',
              authorityIds: authorityIds
            }).then(res => {
              if (res.code === 20000) {
                const { message } = res
                this.$notify({
                  title: '授权成功',
                  message: message,
                  type: 'success',
                  duration: 2000
                })
                this.closeDialog()
              }
              this.handleSearch()
            }).finally(() => {
              this.saving = false
            })
          }
        })
      }
      if (this.current === this.forms[2]) {
        this.$refs[this.current].validate((valid) => {
          if (valid) {
            this.saving = true
            addRoleUsers({
              roleId: this.formItem.roleId,
              userIds: this.formItem.userIds
            }).then(res => {
              if (res.code === 20000) {
                const { message } = res
                this.$notify({
                  title: '授权成功',
                  message: message,
                  type: 'success',
                  duration: 2000
                })
                this.closeDialog()
              }
              this.handleSearch()
            }).finally(() => {
              this.saving = false
            })
          }
        })
      }
    },
    getCheckedAuthorities() {
      const menus = this.$refs['tree'].getCheckedProp('authorityId')
      return menus.concat(this.formItem.grantActions)
    },
    closeDialog() {
      const newData = {
        roleId: '',
        roleCode: '',
        roleName: '',
        path: '',
        status: 1,
        menuId: '',
        priority: 0,
        roleDesc: '',
        grantMenus: [],
        grantActions: [],
        expireTime: '',
        isExpired: false,
        userIds: []
      }
      this.modalVisible = false
      this.formItem = newData
      this.formItem.grantMenus = []
      this.formItem.grantActions = []
      this.modalVisible = false
      this.saving = false
    },
    handleModal(data, form) {
      if (data) {
        this.formItem = Object.assign(this.formItem, data)
      }
      if (!form) {
        form = this.forms[0]
      }
      if (form === this.forms[0]) {
        this.modalTitle = data ? '编辑角色 - ' + data.roleName : '添加角色'
        this.modalVisible = true
      }
      if (form === this.forms[1]) {
        this.modalTitle = data ? '分配权限 - ' + data.roleName : '分配权限'
        this.handleLoadRoleGranted(this.formItem.roleId)
      }
      if (form === this.forms[2]) {
        this.modalTitle = data ? '添加成员 - ' + data.roleName : '添加成员'
        this.handleLoadRoleUsers(this.formItem.roleId)
      }
      this.current = form
    },
    handleLoadRoleUsers(roleId) {
      if (!roleId) {
        return
      }
      const that = this
      const p1 = getAllUsers()
      const p2 = getRoleUsers(roleId)
      Promise.all([p1, p2]).then(function(values) {
        const res1 = values[0]
        const res2 = values[1]
        if (res1.code === 20000) {
          res1.data.map(item => {
            item.key = item.userId
            item.label = `${item.userName}(${item.nickName})`
          })
          that.selectUsers = res1.data
        }
        if (res2.code === 20000) {
          res2.data.map(item => {
            that.formItem.userIds.push(item.userId)
            that.value.push(item.userId)
          })
        }
        that.modalVisible = true
      })
    },
    handleLoadRoleGranted(roleId) {
      if (!roleId) {
        return
      }
      const that = this
      const p1 = getAuthorityMenu()
      const p2 = getAuthorityRole(roleId)
      Promise.all([p1, p2]).then((values) => {
        const res1 = values[0]
        const res2 = values[1]
        if (res1.code === 20000 && res1.data) {
          const opt = {
            primaryKey: 'menuId',
            parentKey: 'parentId',
            startPid: '0'
          }
          if (res2.code === 20000 && res2.data) {
            res2.data.map(item => {
              // 菜单权限
              if (item.authority.indexOf('MENU_') !== -1) {
                that.formItem.grantMenus.push(item.authorityId)
              }
              // 操作权限
              if (item.authority.indexOf('ACTION_') !== -1) {
                that.formItem.grantActions.push(item.authorityId)
              }
            })
            // 时间
            if (res2.data.length > 0) {
              that.formItem.expireTime = res2.data[0].expireTime
              that.formItem.isExpired = res2.data[0].isExpired
            }
          }
          res1.data.map(item => {
            // 菜单选中
            if (that.formItem.grantMenus.includes(item.authorityId)) {
              item._isChecked = true
            }
          })
          that.selectMenus = listConvertTree(res1.data, opt)
        }
        that.modalVisible = true
      })
    },
    refresh(current) {
      this.pageInfo.page = current
      this.handleSearch()
    },
    sortChange(data) {
      console.log('sortChange', data)
      const { prop, order } = data
      this.sortBy(prop, order)
    },
    sortBy(prop, order) {
      if (order === 'ascending') {
        this.pageInfo.sort = `+${prop}`
      } else {
        this.pageInfo.sort = `-${prop}`
      }
      this.handleSearch()
    },
    handleSearch(page) {
      if (page) {
        this.pageInfo.page = page
      }
      this.listLoading = true
      getRoles(this.pageInfo).then(res => {
        this.list = res.data.records
        this.pageInfo.total = parseInt(res.data.total)
      }).finally(() => {
        this.listLoading = false
      })
    }
  }
}
</script>

<style scoped>
  .item {
    margin-top: 10px;
    margin-right: 40px;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
</style>
