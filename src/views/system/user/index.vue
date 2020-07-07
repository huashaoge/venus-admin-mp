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
            <el-link type="primary" @click="handleModal(row)">编辑</el-link>
            <el-link type="primary" @click="handleModal(row, forms[1])">分配角色</el-link>
            <el-dropdown trigger="click" @command="handleClick($event,row)">
              <span>
                <el-link type="primary">更多<i class="el-icon-arrow-down" /></el-link>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="grantMenu" style="color: #1890ff">分配私人菜单</el-dropdown-item>
                <el-dropdown-item command="updatePassword" style="color: #1890ff">修改密码</el-dropdown-item>
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
          <el-input v-model="formItem.userName" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item prop="password" label="登录密码">
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
import { getUsers, addUser } from '../../../api/user'
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
      const reg2 = /^.{6,18}$/
      if (value === '') {
        callback(new Error('登录名不能为空'))
      } else if (value !== '' && !reg.test(value)) {
        callback(new Error('只允许字母、数字、下划线'))
      } else if (value !== '' && !reg2.test(value)) {
        callback(new Error('长度6到18个字符'))
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
    handleSubmit() {
      if (this.current === this.forms[0]) {
        this.$refs[this.current].validate((valid) => {
          if (valid) {
            this.saving = true
            if (this.formItem.userId) {
              // 更新
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
      this.current = form
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
      // this.forms.map(form => {
      //   this.handleResetForm(form)
      // })
      this.handleResetForm('form1')
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
