<template>
  <div style="padding: 16px">
    <el-card>
      <el-form :inline="true" :model="pageInfo">
        <el-form-item label="登录名" prop="userName">
          <el-input v-model="pageInfo.userName" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="pageInfo.mobile" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item label="邮箱号" prop="email">
          <el-input v-model="pageInfo.email" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" :disabled="hasAuthority('systemUserSearch')?false:true" @click="handleSearch(1)">查询</el-button>
        </el-form-item>
      </el-form>
      <div style="padding: 0 0 10px 0;">
        <el-button-group>
          <el-button type="primary" icon="el-icon-plus" size="mini" :disabled="hasAuthority('systemUserAdd')?false:true" @click="handleModal()"><span>添加</span></el-button>
        </el-button-group>
      </div>
      <el-table
        :key="tableKey"
        v-loading="loading"
        :data="data"
        border
        fit
        highlight-current-row
        style="width: 100%;"
        :default-sort="defaultSort"
        @sort-change="sortChange"
      >
        <el-table-column
          prop="userName"
          label="登录名"
        />
        <el-table-column
          prop="nickName"
          label="昵称"
        />
        <el-table-column
          prop="email"
          label="邮箱"
        />
        <el-table-column
          prop="mobile"
          label="手机号"
        />
        <el-table-column
          label="状态"
        >
          <template slot-scope="{ row: { status }}">
            <el-badge v-if="status=='1'" is-dot class="item" type="success">正常</el-badge>
            <el-badge v-if="status=='0'" is-dot class="item" type="danger">禁用</el-badge>
            <el-badge v-if="status=='2'" is-dot class="item" type="warning">锁定</el-badge>
          </template>
        </el-table-column>
        <el-table-column
          prop="roleDesc"
          label="描述"
          width="300"
        />
        <el-table-column label="注册时间" prop="createTime" align="center">
          <template slot-scope="{ row: { createTime }}">
            <span>{{ createTime | timeFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center">
          <template slot-scope="{ row }">
            <el-link type="primary" :disabled="hasAuthority('systemUserEdit')?false:true" @click="handleModal(row)">编辑</el-link>
            <el-link type="primary" :disabled="hasAuthority('systemUserGrantRolesEdit')?false:true" @click="handleModal(row, forms[1])">分配角色</el-link>
            <el-dropdown trigger="click" @command="handleClick($event,row)">
              <span>
                <el-link type="primary">更多<i class="el-icon-arrow-down" /></el-link>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :disabled="hasAuthority('systemUserGrantMenusEdit')?false:true" command="grantMenu" style="color: #1890ff">分配私人菜单</el-dropdown-item>
                <el-dropdown-item :disabled="hasAuthority('systemUserPasswordEdit')?false:true" command="updatePassword" style="color: #1890ff">修改密码</el-dropdown-item>
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
        <el-form-item prop="nickName" label="昵称">
          <el-input v-model="formItem.nickName" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item prop="userName" label="登录名">
          <el-input v-model="formItem.userName" :disabled="formItem.userId?true:false" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item v-if="formItem.userId?false:true" prop="password" label="登录密码">
          <el-input v-model="formItem.password" type="password" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item v-if="formItem.userId?false:true" prop="passwordConfirm" label="再次确定密码">
          <el-input v-model="formItem.passwordConfirm" type="password" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="formItem.email" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item prop="mobile" label="手机号">
          <el-input v-model="formItem.mobile" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item prop="status" label="状态">
          <el-radio-group v-model="formItem.status">
            <el-radio :label="0">禁用</el-radio>
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="2">锁定</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="menuDesc" label="描述">
          <el-input v-model="formItem.roleDesc" type="textarea" :rows="3" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <el-form v-show="current == 'form2'" ref="form2" :model="formItem" :rules="formItemRules" label-width="80px" label-position="right">
        <el-table
          ref="multipleTable"
          :key="tableKey"
          :data="selectRoles"
          border
          fit
          highlight-current-row
          style="width: 100%;"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="55"
          />
          <el-table-column
            prop="roleName"
            label="角色名称"
          />
          <el-table-column
            prop="roleDesc"
            label="描述"
            width="300"
          />
        </el-table>
      </el-form>
      <el-form v-show="current == 'form3'" ref="form3" :model="formItem" :rules="formItemRules" label-width="80px" label-position="right">
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
      <el-form v-show="current == 'form4'" ref="form4" :model="formItem" :rules="formItemRules" label-width="80px" label-position="right">
        <el-form-item prop="userName" label="登录名">
          <el-input v-model="formItem.userName" :disabled="formItem.userId?true:false" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item prop="password" label="登录密码">
          <el-input v-model="formItem.password" type="password" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item prop="passwordConfirm" label="再次确定密码">
          <el-input v-model="formItem.passwordConfirm" type="password" placeholder="请输入内容" />
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
import Pagination from '../../../components/Pagination/index'
import { parseTime } from '../../../utils'
import { getAllRoles } from '../../../api/role'
import { getUsers, addUser, updateUser, getUserRoles, addUserRoles, updatePassword } from '../../../api/user'
import { getAuthorityMenu, getAuthorityUser, grantAuthorityUser } from '../../../api/authority'
import { listConvertTree } from '../../../utils/util'
export default {
  name: 'User',
  components: { Pagination },
  filters: {
    timeFilter(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}') : '无'
    }
  },
  data() {
    const validateEn = (rule, value, callback) => {
      const reg = /^[_a-zA-Z0-9]+$/
      const reg2 = /^.{4,18}$/
      if (value === '') {
        callback(new Error('登录名不能为空'))
      } else if (value !== '' && !reg.test(value)) {
        callback(new Error('只允许字母、数字、下划线'))
      } else if (value !== '' && !reg2.test(value)) {
        callback(new Error('长度4到18个字符'))
      } else {
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      const reg2 = /^.{6,18}$/
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (value !== this.formItem.password) {
        callback(new Error('两次输入密码不一致'))
      } else if (value !== '' && !reg2.test(value)) {
        callback(new Error('长度6到18个字符'))
      } else {
        callback()
      }
    }
    const validatePassConfirm = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.formItem.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    const validateMobile = (rule, value, callback) => {
      const reg = /^1\d{10}$/
      if (value !== '' && !reg.test(value)) {
        callback(new Error('手机号码格式不正确'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      saving: false,
      tableKey: 0,
      modalVisible: false,
      modalTitle: '',
      current: 'form1',
      forms: [
        'form1',
        'form2',
        'form3',
        'form4'
      ],
      pageInfo: {
        total: 0,
        page: 1,
        limit: 10,
        userName: '',
        mobile: '',
        email: '',
        sort: ''
      },
      formItemRules: {
        userType: [
          { required: true, message: '用户类型不能为空', trigger: 'blur' }
        ],
        userName: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          { required: true, validator: validateEn, trigger: 'blur' }
        ],
        password: [
          { required: true, validator: validatePass, trigger: 'blur' }
        ],
        passwordConfirm: [
          { required: true, validator: validatePassConfirm, trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '昵称不能为空', trigger: 'blur' }
        ],
        email: [
          { required: false, type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ],
        mobile: [
          { validator: validateMobile, trigger: 'blur' }
        ]
      },
      selectRoles: [],
      selectMenus: [],
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
      formItem: {
        userId: '',
        userName: '',
        nickName: '',
        password: '',
        passwordConfirm: '',
        status: 1,
        companyId: '',
        email: '',
        mobile: '',
        userType: 'platform',
        userDesc: '',
        avatar: '',
        grantRoles: [],
        grantActions: [],
        grantMenus: [],
        expireTime: '',
        isExpired: false
      },
      defaultSort: {},
      data: []
    }
  },
  mounted() {
    this.handleSearch()
  },
  methods: {
    handleClick(command, row) {
      switch (command) {
        case 'grantMenu':
          this.handleModal(row, this.forms[2])
          break
        case 'updatePassword':
          this.handleModal(row, this.forms[3])
          break
      }
    },
    handleSelectionChange(vals) {
      const result = []
      vals.map(item => {
        result.push(item.roleId)
      })
      this.formItem.grantRoles = result
    },
    handleSubmit() {
      if (this.current === this.forms[0]) {
        this.$refs[this.current].validate((valid) => {
          if (valid) {
            this.saving = true
            if (this.formItem.userId) {
              // 更新
              console.log('formItem:' + JSON.stringify(this.formItem))
              updateUser(this.formItem).then(res => {
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
              addUser(this.formItem).then((res) => {
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
      if (this.current === this.forms[1] && this.formItem.userId) {
        this.$refs[this.current].validate((valid) => {
          if (valid) {
            this.saving = true
            console.log('formItem111:' + JSON.stringify(this.formItem))
            addUserRoles({
              userId: this.formItem.userId,
              grantRoles: this.formItem.grantRoles
            }).then(res => {
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
        })
      }
      if (this.current === this.forms[2] && this.formItem.userId) {
        this.$refs[this.current].validate((valid) => {
          if (valid) {
            const authorityIds = this.getCheckedAuthorities()
            this.saving = true
            grantAuthorityUser({
              userId: this.formItem.userId,
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
      if (this.current === this.forms[3] && this.formItem.userId) {
        this.$refs[this.current].validate((valid) => {
          if (valid) {
            this.saving = true
            updatePassword({
              userId: this.formItem.userId,
              password: this.formItem.password
            }).then(res => {
              if (res.code === 20000) {
                const { message } = res
                this.$notify({
                  title: '修改成功',
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
    handleModal(data, form) {
      if (data) {
        this.formItem = Object.assign({}, this.formItem, data)
      }
      if (!form) {
        form = this.forms[0]
      }
      if (form === this.forms[0]) {
        this.modalTitle = data ? '编辑用户 - ' + data.userName : '添加用户'
        this.modalVisible = true
      }
      if (form === this.forms[1]) {
        this.modalTitle = data ? '分配角色 - ' + data.userName : '分配角色'
        this.handleLoadRoles(this.formItem.userId)
      }
      if (form === this.forms[2]) {
        this.modalTitle = data ? '分配私人菜单 - ' + data.userName : '分配角色'
        this.handleLoadUserGranted(this.formItem.userId)
      }
      if (form === this.forms[3]) {
        this.modalTitle = data ? '修改密码 - ' + data.userName : '修改密码'
        this.modalVisible = true
      }
      this.current = form
    },
    handleLoadUserGranted(userId) {
      const that = this
      const p1 = getAuthorityMenu()
      const p2 = getAuthorityUser(userId)
      Promise.all([p1, p2]).then(function(values) {
        const res1 = values[0]
        const res2 = values[1]
        if (res1.code === 20000 && res1.data) {
          const opt = {
            primaryKey: 'menuId',
            parentKey: 'parentId',
            startPid: '0'
          }
          if (res2.code === 20000 && res2.data && res2.data.length > 0) {
            res2.data.map(item => {
              if (item.authority.indexOf('MENU_') !== -1) {
                that.formItem.grantMenus.push(item.authorityId)
              }
              if (item.authority.indexOf('ACTION_') !== -1) {
                that.formItem.grantActions.push(item.authorityId)
              }
            })
            that.formItem.expireTime = res2.data[0].expireTime
            that.formItem.isExpired = res2.data[0].isExpired
          }
          res1.data.map(item => {
            if (that.formItem.grantMenus.includes(item.authorityId)) {
              item._isChecked = true
            }
          })
          that.selectMenus = listConvertTree(res1.data, opt)
        }
        that.modalVisible = true
      })
    },
    handleLoadRoles(userId) {
      if (!userId) {
        return
      }
      const that = this
      const p1 = getAllRoles()
      const p2 = getUserRoles(userId)
      Promise.all([p1, p2]).then(values => {
        const res1 = values[0]
        const res2 = values[1]
        if (res1.code === 20000) {
          that.selectRoles = res1.data
        }
        if (res2.code === 20000) {
          res2.data.map(item => {
            this.$nextTick(() => {
              this.$refs.multipleTable.toggleRowSelection(that.selectRoles[that.selectRoles.findIndex((it, index, arr) => {
                return it.roleId === item.roleId
              })], true)
            })
          })
        }
        that.modalVisible = true
      })
    },
    handleResetForm(form) {
      this.$refs[form].resetFields()
    },
    closeDialog() {
      const newData = {
        userId: '',
        userName: '',
        nickName: '',
        password: '',
        passwordConfirm: '',
        status: 1,
        companyId: '',
        email: '',
        mobile: '',
        userType: 'platform',
        userDesc: '',
        avatar: '',
        grantRoles: [],
        grantMenus: [],
        grantActions: [],
        expireTime: '',
        isExpired: false
      }
      this.formItem = newData
      this.forms.map(form => {
        this.handleResetForm(form)
      })
      this.current = this.forms[0]
      this.formItem.grantMenus = []
      this.formItem.grantActions = []
      this.modalVisible = false
      this.saving = false
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
      this.loading = true
      getUsers(this.pageInfo).then(res => {
        this.data = res.data.records
        this.pageInfo.total = parseInt(res.data.total)
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
