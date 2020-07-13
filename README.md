# 后台管理UI

---
### 简介
基于vue-element-admin 前端框架<a href="https://github.com/PanJiaChen/vue-element-admin">传送门</a>
简化项目其余功能，实现主要的用户角色目录管理模块作为前端搭建脚手架
### 服务端代码仓库
<a target="_blank" href="https://github.com/huashaoge/venus-admin">Github</a> 

### 按钮权限控制
全局函数
hasAuthority('功能编码,功能编码2') 多个用,号隔开
 ```html
 <el-button v-show="hasAuthority('systemUserCreate')" type="primary">
 ```
### 安装
 ```bush
 npm install
 ```
### 运行(开发)
 ```bush
 npm run dev 
 ```
### 打包(生产) 
```bush
  npm run build:prod
```