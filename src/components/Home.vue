<template>
    <!-- 头部区域-->
    <el-container>
        <el-header>
            <div>
                <img src="../assets/logo.png" alt=""/>
                <span>电商管理平台</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
    <el-container>
        <!-- 侧边栏区域-->
        <el-aside :width="isCollapse ? '64px':'200px'">
            <div class="toggle-button" @click="toggleCollapse">|||</div>
            <el-menu
            :default-active="$route.path"
            class="el-menu-vertical-demo"
            background-color="#525b63"
            text-color="#fff"
            active-text-color="#359bff"
            unique-opened
            :collapse="isCollapse"
            :collapse-transition="false"
            router>
                <!--一级菜单-->
                <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
                    <!--一级菜单的模板区域-->
                    <template slot="title">
                        <!--图标-->
                        <i :class="iconsObject[item.id]"></i>
                        <!--文本-->
                        <span>{{item.authName}}</span>
                    </template>
                    <!--二级菜单-->
                        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id">
                            <template slot="title">
                            <!--图标-->
                            <i class="el-icon-menu"></i>
                            <!--文本-->
                            <span>{{subItem.authName}}</span>
                        </template>
                    </el-menu-item>
                </el-submenu>
            </el-menu>

        </el-aside>
        <!-- 主要区域-->
        <el-main><router-view></router-view></el-main>
    </el-container>
    </el-container>
</template>
<script>
import router from '@/router'
export default {
    data(){
        return {
            //菜单的列表
            menulist:'',
            //index所对应的导航栏属性
            iconsObject:{
                '125': 'iconfont icon-user',
                '103': 'iconfont icon-tijikongjian',
                '101': 'iconfont icon-shangpin',
                '102': 'iconfont icon-danju',
                '145': 'iconfont icon-baobiao',
            },
            isCollapse:false
        }
    },
    created(){
        this.getMenuList()
    },
    methods: {
        logout() {  //登出
            window.sessionStorage.clear();
            this.$router.replace('/login')
        },
        async getMenuList()   //获取所有的菜单
        {
            const {data: res} = await this.$axios.get('menus')
            if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.menulist = res.data
        },
        toggleCollapse(){   //切换折叠与展开
            this.isCollapse = !this.isCollapse
        }
    }
}
</script>

<style lang="less" scoped>
.el-container{
    height: 100%;
}
.el-header{
    background-color: #373c41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: white;
    font-size: 20px;
    > div{
        display: flex;
        align-items: center;
        span{
            margin: left;
        }
    }
}
.el-aside{
    background-color: #323744;
    .el-menu{
        border-right: none;
    }
}
.el-main{
    background-color: #eaedf2;
}

.toggle-button{
    background-color: #465061;
    font-size: 10px;
    line-height: 24px;
    color:#fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
</style>