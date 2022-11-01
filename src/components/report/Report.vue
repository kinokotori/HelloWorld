<template>
    <div>
        <!--面包屑区域-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item :to="{ path: 'home'}">
                    首页
                </el-breadcrumb-item>
                <el-breadcrumb-item>
                    数据统计
                </el-breadcrumb-item>
                <el-breadcrumb-item>
                    数据报表
                </el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片区域-->
        <el-card>
            <!--图表区域-->
            <div id="main" style="width: 600px; height:400px" ref="ect"></div>
        </el-card>
    </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
    data(){
        return {
            //获取到的报表
            reports:[]
        }
    },
    created(){

    },
    async mounted(){
        const {data: res} = await this.$axios.get('reports/type/1')
            this.reports = res.data
            console.log(res.data)
        const myChart = echarts.init(this.$refs.ect)
        myChart.setOption(this.reports)
    },
    methods:{
    }
}
</script>

<style>

</style>