<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: 'home'}">
                首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>
                订单管理
            </el-breadcrumb-item>
            <el-breadcrumb-item>
                订单列表
            </el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-row>
            <el-col>
                <el-input placeholder="输入要搜索的订单" v-model="queryInfo.query"><el-button slot="append" icon="el-icon-search" @click="getOrdersList()"></el-button></el-input>
            </el-col>
        </el-row>
        <el-table :data="OrdersList" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="订单编号" prop="order_number" width="600px"></el-table-column>
            <el-table-column label="订单价格" prop="order_price"></el-table-column>
            <el-table-column label="是否付款">
                <template v-slot="scope">
                    <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
                    <el-tag type="danger" v-else>未付款</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="是否发货"  prop="is_send"></el-table-column>
            <el-table-column label="下单时间" width="230px">
                <template v-slot="scope">
                    {{scope.row.create_time | dateFormat}}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="230px">
                <template v-slot="scope" >
                    <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress(scope.row)">进度</el-button>
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddress(scope.row)">修改地址</el-button>         
                </template>
            </el-table-column>
        </el-table>
        <!--分页区域-->
        <el-pagination @size-change="handleSizeChange" 
        @current-change="handleCurrentChange"
         :current-page="queryInfo.pagenum"
         :page-size="queryInfo.pagesize"
         :page-sizes="[1,2,5,10]" layout="total, sizes, prev, pager, next, jumper"
         :total="total">

        </el-pagination>
        <!--查看进度对话框-->
        <el-dialog title="查看进度" :visible.sync="progressDialogVisible">
            <el-timeline>
                <el-timeline-item
                v-for="(act, index) in progressData"
                :key="index"
                :timestamp="act.time">
                {{act.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
        <!--修改地址对话框-->
        <el-dialog title="修改地址" :visible.sync="addressDialogVisible" @close="addressDialogClosed">
            <el-form :model="addressForm" ref="addressFormRef" :rules="addressFormRules">
                <el-form-item  label="省市区/县" prop="address1">
                    <el-cascader v-model="addressForm.address1" :options="cityData"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址"  prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <el-button @click="addressDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="address()">确定</el-button>
        </el-dialog>
    </el-card>
  </div>
</template>

<script>
//导入地址信息
import cityData from './citydata.js'

export default {
    data(){
        return {
            //查询对象
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize: 10
            },
            //订单数据列表
            OrdersList:[],
            //订单数据数量
            total:0,
            //查看进度对话框的显示
            progressDialogVisible:false,
            //修改地址对话框的显示
            addressDialogVisible:false,
            //看进度的数据
            progressData:[
            {
                "time": "2018-05-10 09:39:00",
                "ftime": "2018-05-10 09:39:00",
                "context": "已签收,感谢使用顺丰,期待再次为您服务",
                "location": ""
            },
            {
                "time": "2018-05-10 08:23:00",
                "ftime": "2018-05-10 08:23:00",
                "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
                "location": ""
            },
            {
                "time": "2018-05-10 07:32:00",
                "ftime": "2018-05-10 07:32:00",
                "context": "快件到达 [北京海淀育新小区营业点]",
                "location": ""
            },
            {
                "time": "2018-05-10 02:03:00",
                "ftime": "2018-05-10 02:03:00",
                "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
                "location": ""
            },
            {
                "time": "2018-05-09 23:05:00",
                "ftime": "2018-05-09 23:05:00",
                "context": "快件到达 [北京顺义集散中心]",
                "location": ""
            },
            {
                "time": "2018-05-09 21:21:00",
                "ftime": "2018-05-09 21:21:00",
                "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
                "location": ""
            },
            {
                "time": "2018-05-09 13:07:00",
                "ftime": "2018-05-09 13:07:00",
                "context": "顺丰速运 已收取快件",
                "location": ""
            },
            {
                "time": "2018-05-09 12:25:03",
                "ftime": "2018-05-09 12:25:03",
                "context": "卖家发货",
                "location": ""
            },
            {
                "time": "2018-05-09 12:22:24",
                "ftime": "2018-05-09 12:22:24",
                "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
                "location": ""
            },
            {
                "time": "2018-05-08 21:36:04",
                "ftime": "2018-05-08 21:36:04",
                "context": "商品已经下单",
                "location": ""
            }],

            //修改地址的表单
            addressForm:{
                address1:[],
                address2:''
            },
            //修改地址的表单校验
            addressFormRules:{
                address1:[{required: true, message: '请选择区域', trigger:'blur'}],
                address2:[{required: true, message: '请输入详细地址', trigger:'blur'}]
            },
            //地址信息
            cityData:cityData,
        }
    },
    created(){
        this.getOrdersList()
    },
    methods:{
        //获取订单列表
        async getOrdersList(){
            const {data: res} = await this.$axios.get('orders',{
                params:this.queryInfo
            })
            if(res.meta.status !== 200) return this.$message.error('获取订单列表失败')
            this.OrdersList = res.data.goods
            this.total = res.data.total
        },
        //分页器尺寸变化
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getOrdersList()
        },

        //分页器大小变化
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getOrdersList()
        },

        //展示进度对话框
        async showProgress(data){
            this.progressDialogVisible = true
        },
    


        //展示修改地址对话框
        async showAddress(){
            this.addressDialogVisible = true
        },
        //修改地址对话框关闭
        addressDialogClosed(){
            this.$refs.addressFormRef.resetFields()
        },
        //修改地址完成
        async address(){
            this.$refs.addressFormRef.validate(valid =>{
                if(!valid) return
                this.$message.success('修改成功')
            })
            
        },
    }
}
</script>

<style>

</style>