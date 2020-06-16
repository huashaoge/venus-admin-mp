<template>
  <el-dialog
    :visible.sync="detailVisible"
    :show-close="true"
    @close="closeDialog"
  >
    <el-form ref="menuForm" :model="formItem" :rules="formItemRules" label-width="80px" label-position="right">
      <el-form-item prop="parentId" label="上级菜单">
        <treeselect
          v-model="formItem.parentId"
          :disabled="disabled"
          :options="selectTreeData"
          :default-expand-level="1"
          :normalizer="treeSelectNormalizer"
        />
      </el-form-item>
      <el-form-item prop="menuCode" label="菜单标识">
        <el-input v-model="formItem.menuCode" placeholder="菜单标识" />
      </el-form-item>
      <el-form-item prop="menuName" label="菜单名称">
        <el-input v-model="formItem.menuName" placeholder="菜单名称" />
      </el-form-item>
      <el-form-item prop="path" label="页面地址">
        <el-select v-model="formItem.scheme">
          <el-option label="/" value="/" />
          <el-option label="http://" value="http://" />
          <el-option label="https://" value="https://" />
        </el-select>
        <el-input v-model="formItem.path" placeholder="地址" style="width:250px" />
        <el-select v-model="formItem.target">
          <el-option label="窗口内打开" value="_self" />
          <el-option label="新窗口打开" value="_blank" />
        </el-select>
        <span>前端组件所在位置：/views/{{ formItem.path }}.vue</span>
      </el-form-item>
      <el-form-item prop="icon" label="菜单图标">
        <el-input v-model="formItem.icon">
          <svg-icon slot="prepend" size="16" :class-name="formItem.icon" :icon-class="formItem.icon" />
          <el-popover
            slot="append"
            placement="left"
            width="600"
            trigger="click"
          >
            <el-button slot="reference" icon="el-icon-search">查询</el-button>
            <div>
              <ul class="icons">
                <li v-for="item in selectIcons" :key="item" class="icons-item" :title="item" @click="onIconClick(item)">
                  <svg-icon size="28" :class-name="item" :icon-class="item" />
                  <p>{{ item }}</p>
                </li>
              </ul>
            </div>
          </el-popover>
        </el-input>
      </el-form-item>
      <el-form-item prop="priority" label="优先级">
        <el-input v-model="formItem.priority" style="width:50px" placeholder="优先级" />
      </el-form-item>
      <el-form-item prop="status" label="状态">
        <el-radio-group v-model="formItem.status">
          <el-radio :label="0">禁用</el-radio>
          <el-radio :label="1">启用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="menuDesc" label="描述">
        <el-input v-model="formItem.menuDesc" type="textarea" :rows="3" placeholder="请输入内容" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
        <el-button @click="detailVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import icons from './icons'
import { updateMenu, addMenu } from '../../../../api/menu'
export default {
  name: 'Detail',
  props: {
    formItem: {
      type: Object,
      default: () => ({})
    },
    visible: Boolean,
    isEdit: Boolean,
    selectTreeData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const validateEn = (rule, value, callback) => {
      const reg = /^[_a-zA-Z0-9]+$/
      if (value === '') {
        callback(new Error('菜单标识不能为空'))
      } else if (value !== '' && !reg.test(value)) {
        callback(new Error('只允许字母、数字、下划线'))
      } else {
        callback()
      }
    }
    return {
      detailVisible: false,
      disabled: false,
      selectIcons: icons,
      saving: false,
      formItemRules: {
        parentId: [
          { required: true, message: '上级菜单', trigger: 'blur' }
        ],
        menuCode: [
          { required: true, validator: validateEn, trigger: 'blur' }
        ],
        menuName: [
          { required: true, message: '菜单名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    visible(newValue) {
      this.detailVisible = newValue
    },
    isEdit(newValue) {
      this.isEdit = newValue
    }
  },
  methods: {
    closeDialog() {
      this.$emit('close-dialogStatus', true)
    },
    onIconClick(item) {
      this.formItem.icon = item
    },
    treeSelectNormalizer(node) {
      return {
        id: node.menuId,
        label: node.menuName,
        children: node.children
      }
    },
    refresh() {
      this.$parent.getList()
    },
    handleSubmit() {
      this.$refs['menuForm'].validate((valid) => {
        if (valid) {
          this.saving = true
          if (this.isEdit) {
            // 修改
            updateMenu(this.formItem).then(res => {
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
                this.refresh()
              }
            }).catch(() => {
              this.saving = false
            })
          } else {
            addMenu(this.formItem).then(res => {
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
                this.refresh()
              }
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
  .icons {
    overflow: auto;
    zoom: 1;
    height: 300px;
  }
  .icons-item {
    float: left;
    margin: 6px;
    width: 60px;
    text-align: center;
    list-style: none;
    cursor: pointer;
    color: #5c6b77;
    transition: all .2s ease;
    position: relative;
  }
</style>
