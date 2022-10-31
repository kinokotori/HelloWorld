<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: 'home'}">
                首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>
                商品管理
            </el-breadcrumb-item>
            <el-breadcrumb-item>
                商品列表
            </el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
        <el-row>
            <el-col :span="8">
                <el-input placeholder="请输入内容" v-model="queryInfo.query">
                    <el-button slot="append" icon="el-icon-search" @click="searchGoods"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button class="addbtn" type="primary" @click="goAdd">添加商品</el-button>
            </el-col>
        </el-row>
        <el-table :data="goodsList">
            <el-table-column type="index"></el-table-column>
            <el-table-column label="商品名称" prop="goods_name" width="700px"></el-table-column>
            <el-table-column label="商品价格（元）" prop="goods_price"></el-table-column>
            <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
            <el-table-column label="商品数量" prop="goods_number"></el-table-column>
            <el-table-column label="创建时间">
                <template v-slot="scope">
                    {{scope.row.add_time | dateFormat}}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="300px">
                <template v-slot="scope">
                    <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑</el-button>
                    <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteGoods(scope.row)">删除</el-button>
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

        
        <!--修改商品对话框-->
        <el-dialog :visible.sync="editDialogVisible" @close="editDialogClosed" ref="editDialogRef">
            <el-form :model="editGoodsForm" ref="editDialogRef" :rules="editGoodsRules">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="editGoodsForm.goods_name">

                    </el-input>
                </el-form-item>
                <el-form-item label="商品价格（元）" prop="goods_price">
                    <el-input v-model="editGoodsForm.goods_price">

                    </el-input>
                </el-form-item>
                <el-form-item label="商品重量" prop="goods_weight"> 
                    <el-input v-model="editGoodsForm.goods_weight">

                    </el-input>
                </el-form-item>
                <el-form-item label="商品数量" prop="goods_number">
                    <el-input v-model="editGoodsForm.goods_number">

                    </el-input>
                </el-form-item>
            </el-form>
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="editGoods">确定</el-button>
        </el-dialog>
    </el-card>
  </div>
</template>

<script>

export default {
    data(){
        return {
            //搜索绑定
            queryInfo:{
                query: '',
                pagenum: 1,
                pagesize: 10
            },
            //商品列表
            goodsList:[],
            //搜索结果总数
            total:'',
            
            //修改对话框的显示
            editDialogVisible: false,
 
            //修改商品的规则
            editGoodsRules:{
                goods_name:[{required: true, message: '请输入商品名称', trigger: 'blur'},],
                goods_price:[{required: true, message: '请输入商品价格', trigger: 'blur'},],
                goods_number:[{required: true, message: '请输入商品数量', trigger: 'blur'},],    
                goods_weight:[{required: true, message: '请输入商品重量', trigger: 'blur'},]
            },
            //修改商品的表单
            editGoodsForm:{
                goods_id:'',
                goods_name:'',
                goods_price:'',
                goods_number:'',    
                goods_weight:''
            }
        }
    },
    created(){
        this.getGoodsList()
    },
    methods:{
        //搜索获取商品列表
        async getGoodsList(){
            const {data: res} = await this.$axios.get('goods',{ params: this.queryInfo})
            if(res.meta.status !== 200) return this.$message.error('查询失败')
            this.goodsList = res.data.goods
            this.total = res.data.total
        },
        //搜索商品
        searchGoods(){
            this.getGoodsList()
        },
        //页面尺寸变化
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getGoodsList()
        },
        //页面数变化
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getGoodsList()
        },

        //前往添加商品
        goAdd(){
            this.$router.push('/goods/add')
        },

        //展示修改对话框
        async showEditDialog(data){
            this.editDialogVisible = true
            const {data: res} = await this.$axios.get(`goods/${data.goods_id}`)
            if(res.meta.status !== 200) return this.$message.error('获取商品数据失败')
            this.editGoodsForm = res.data 

        },

        //修改对话框关闭
        editDialogClosed(){
            this.$refs.editDialogRef.resetFields()
        },

        //完成修改
        editGoods(){
            this.$refs.editDialogRef.validate(async valid => {
                if(!valid) return 
                const {data: res} = await this.$axios.put(`goods/${this.editGoodsForm.goods_id}`,{
                    goods_name:this.editGoodsForm.goods_name,
                    goods_price:this.editGoodsForm.goods_price,
                    goods_number:this.editGoodsForm.goods_number,    
                    goods_weight:this.editGoodsForm.goods_weight,   
                    goods_cat:this.editGoodsForm.goods_cat
                })
                if(res.meta.status !== 200) return this.$message.error('编辑失败')
                this.$message.success('编辑成功')
                this.getGoodsList()
                this.editDialogVisible = false
            })

            
        },

        //删除商品
        async deleteGoods(data){
            const confirmResule = await this.$confirm('此操作将永久删除类型以及子类型，是否继续？',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if(confirmResule !== 'confirm') return this.$message.info('已取消操作')
            const {data: res} = await this.$axios.delete(`goods/${data.goods_id}`)
            if(res.meta.status !== 200) return this.$message.error('删除失败')
            this.$message.success('删除成功')
            this.getGoodsList()
        }


    }
}
</script>

<style lang="less" scoped>
.addbtn{
    margin-left: 8px;
}
</style>