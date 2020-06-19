<template>
  <div style="padding: 16px">
    <el-card>
      <el-form :inline="true" :model="pageInfo">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="pageInfo.roleName" placeholder="请输入关键字"></el-input>
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="pageInfo.roleCode" placeholder="请输入关键字"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch(1)">查询</el-button>
        </el-form-item>
      </el-form>
      <div></div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Index',
  data() {
    return {
      pageInfo: {
        total: 0,
        page: 1,
        limit: 10,
        roleCode: '',
        roleName: ''
      }
    }
  },
  methods: {
    handleSearch(page) {
      console.log('11')
    }
  }
}
</script>

<style scoped>

</style>
