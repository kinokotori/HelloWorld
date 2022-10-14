<template>
  <div>
    <el-button type="info" @click="logout">登出</el-button>
  </div>
</template>
<script>
import router from '@/router'
export default {
    methods:{
        logout(){
            window.sessionStorage.clear();
            this.$router.replace('/login')
        }
    }
}
</script>

<style>

</style>