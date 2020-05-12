<template>
  <div>
    <el-button v-if="hasAuthority('systemUserView')">查看全部</el-button>
    <el-button v-if="hasAuthority('systemUserEdit')">编辑</el-button>
  </div>
</template>

<script>
export default {
  name: 'Index'
}
</script>

<style scoped>

</style>
