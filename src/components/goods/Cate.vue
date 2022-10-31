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
                商品分类
            </el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card>
        <el-row>
            <el-row>
                <el-button type="primary" @click="showAddCateDialog">添加类型</el-button>
            </el-row>
        </el-row>
        <!--表格-->
        <el-table  :data="cateList" row-key="cat_id" :tree-props="{children: 'children'}" border >
            <el-table-column prop="cat_name" label="分类名称"></el-table-column>
            <el-table-column label="是否有效">
                <template v-slot="scope">
                    <i class="el-icon-success" v-if="!scope.row.cat_deleted" style="color: lightgreen;"></i>
                    <i class="el-icon-success" v-if="scope.row.cat_deleted" style="color: red;"></i>
                </template>
            </el-table-column>
            <el-table-column label="排序">
                <template v-slot="scope">
                    <el-tag type="primary" size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template v-slot="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCatedialog(scope.row.cat_id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
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
        <!--添加分类的对话框-->
        <el-dialog  :visible.sync="addCateDialogVisible" width="30%" @close="addCateDialogClosed">
            <el-form ref="addCateRef" :model="addCateForm" label-width="100px" :rules="addCateRules">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：" >
                    <el-cascader expand-trigger="hover" :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable change-on-select>
                    </el-cascader>
                </el-form-item>
            </el-form>
            <el-button @click="addCateDialogVisible = false">取消</el-button>
            <el-button @click="addCate" type="primary">确定</el-button>
        </el-dialog>

        <!--修改分类的对话框-->
        <el-dialog  :visible.sync="editCateDialogVisible" width="30%" @close="editCateDialogClosed">
            <el-form ref="editCateRef" :model="editCateForm" label-width="100px" :roles="addCateRules" >
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <el-button @click="editCateDialogVisible = false">取消</el-button>
            <el-button @click="editCate" type="primary">确定</el-button>
        </el-dialog>
    </el-card>
  </div>
</template>

<script>


export default {
    data(){
        return {
            //分类列表
            cateList:[],
            //查询参数
            queryInfo:{
                pagenum:1,
                pagesize:5
            },
            //总数据条数
            total:0,
            //控制添加对话框
            addCateDialogVisible:false,
            //添加表单
            addCateForm:{
                cat_pid:0,
                cat_name:'',
                //默认为一级分类
                cat_level:0
            },
            //添加表单验证规则
            addCateRules:{
                cat_name:[
                    {required: true, message: '请输入分类明名称', trigger: 'blur'},
                ]
            },
            //父元素类型列表
            parentCateList:[],
            // 指定级联选择器的配置对象
            cascaderProps: {
                value:'cat_id',
                label:'cat_name',
                children:'children',
            },
            //选中的值
            selectedKeys: [],


            //控制修改对话框
            editCateDialogVisible:false,
            //修改角色的表单
            editCateForm:{
                cat_id:'',
                cat_name:''
            }
            
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        //获取类别列表数据
        async getCateList(){
            const {data: res } = await this.$axios.get('categories',{ params: this.queryInfo})
            if(res.meta.status !== 200) return this.$message.error('获取数据失败')
            this.cateList = res.data.result
            this.total = res.data.total    
        },
        
        //获取父级分类的数据列表
        async getParentCateList(){
            const {data: res} = await this.$axios.get('categories',{ params: { type: 2 }})
            if(res.meta.status !== 200) return this.$message.error('获取失败')
            this.parentCateList = res.data
        },
        //-----------------------------------------------------------------------------------
        //监听pagesize改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        //监听pagenum的改变
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },

        //-----------------------------------------------------------------------------------
        //添加对话框开启
        showAddCateDialog(){
            this.addCateDialogVisible = true
            this.getParentCateList()
        },
        //添加对话框关闭
        addCateDialogClosed(){
            this.$refs.addCateRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_level = 0
            this.addCateForm.cat_pid = 0
        },
        
        //选择项发生变化触发函数
        parentCateChanged(){
            if(this.selectedKeys.length > 0){
                //获取处于末端的选项的id【父元素的id】
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                //获取层级
                this.addCateForm.cat_level = this.selectedKeys.length
            }else{
                //重置
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
        },
        //添加完成
        addCate(){
            this.$refs.addCateRef.validate(async valid=>{
                if(!valid) return
                const {data: res} = await this.$axios.post('categories',this.addCateForm)
                if(res.meta.status !== 201) return this.$message.error('添加失败')
                this.$message.success('添加成功')
                this.addCateDialogVisible = false
                this.getCateList()
            })
            
        },
        //-----------------------------------------------------------------------------------
        //修改分类对话框开启
        async showEditCatedialog(id){
            this.editCateDialogVisible = true
            const {data: res} = await this.$axios.get(`categories/${id}`)
            if(res.meta.status !== 200) return this.$message.error('获取分类失败')
            this.editCateForm.cat_id = res.data.cat_id
            this.editCateForm.cat_name = res.data.cat_name
        },
        //监控修改对话框关闭
        editCateDialogClosed(){
            this.$refs.editCateRef.resetFields()
        },
        //修改分类完成
        async editCate(){
            const {data: res} = await this.$axios.put(`categories/${this.editCateForm.cat_id}`,{cat_name:this.editCateForm.cat_name})
            if(res.meta.status !== 200) return this.$message.error('编辑失败')
            this.$message.success('编辑成功')   
            this.editCateDialogVisible = false
            this.getCateList()
        },
        //-----------------------------------------------------------------------------------

        //删除分类
        async deleteCate(id){
            const confirmResule = await this.$confirm('此操作将永久删除类型以及子类型，是否继续？',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if(confirmResule !== 'confirm') return this.$message.info('操作已取消')
            const {data: res} = await this.$axios.delete(`categories/${id}`)
            if(res.meta.status !== 200) return this.$message.error('删除失败')
            this.$message.success('删除成功')
            this.getCateList()
        }
    }
}
</script>

<style>

</style>