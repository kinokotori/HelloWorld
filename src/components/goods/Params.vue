<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: 'home'}">
                首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>
                商品管理
            </el-breadcrumb-item>
            <el-breadcrumb-item>
                参数列表
            </el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row class="goods_row">
                <el-col>
                    <span>选择商品分类：&nbsp;</span>
                    <el-cascader expand-trigger="hover" :options="cateList" :props="cascaderProps" v-model="selectedKeys" @change="CateChanged">
                    </el-cascader>
                </el-col>
            </el-row>
            <el-tabs v-model="activeName" @tab-click="handleTabClick()">
                <!--动态参数的面板-->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" @click="showAddDialog" :disabled="isBtnDisable">添加属性</el-button>
                    <!--动态参数表格-->
                    <el-table :data="manyTableData">
                        <!--展开列-->
                        <el-table-column type="expand">
                            <template v-slot="scope">
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" @close="TagClose(i,scope.row)" closable>{{item}}</el-tag>
                                <el-input class="newTag" v-if="scope.row.inputVisible" size="small" v-model="scope.row.newTag" @keyup.enter.native="handleTag(scope.row)" @blur="handleTag(scope.row)" ref="inputRef"></el-input>
                                <el-button v-else size="small" @click="showTag(scope.row)">+ 添加新标签</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="序号" type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button type="primary" icon="el-icon-edit" @click="showedit(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!--静态属性的面板-->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" @click="showAddDialog" :disabled="isBtnDisable">添加参数</el-button>
                    <!--静态属性表格-->
                    <el-table :data="onlyTableData">
                        <!--展开列-->
                        <el-table-column type="expand">
                            <template v-slot="scope">
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" @close="TagClose(i,scope.row)" closable>{{item}}</el-tag>
                                <el-input class="newTag" v-if="scope.row.inputVisible" size="small" v-model="scope.row.newTag" @keyup.enter.native="handleTag(scope.row)" @blur="handleTag(scope.row)" ref="inputRef"></el-input>
                                <el-button v-else size="small" @click="showTag(scope.row)">+ 添加新标签</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="序号" type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button type="primary" icon="el-icon-edit" @click="showedit(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!--添加对话框-->
        <el-dialog :title="addDialogTitle" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef">
                <el-form-item prop="attr_name" label="属性名">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <el-button @click="addDialogVisible = false">取消</el-button>
            <el-button @click="add" type="primary">确定</el-button>
        </el-dialog>
        <!--修改对话框-->
        <el-dialog :title="addDialogTitle" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="addFormRules" ref="editFormRef">
                <el-form-item prop="attr_name" label="属性名">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button @click="edit" type="primary">确定</el-button>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return {
            //获取类型列表
            cateList:[],
            //级联选择框设置
            cascaderProps:{
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            //绑定级联选择框数据
            selectedKeys:[],
            //被激活的页签的名称
            activeName:'many',
            //动态参数数据
            manyTableData:[],
            //静态属性数据
            onlyTableData:[],
            //控制对话框的显示
            addDialogVisible: false,
            //添加表单数据
            addForm:{
                attr_name: '',
            },
            //添加页面规则
            addFormRules:{
                attr_name:[{required:'true', message:'请填写属性名', trigger: 'blur'}]
            },
            //控制修改对话框的显示
            editDialogVisible: false,
            //修改表单数据
            editForm:{
                attr_name: '',
                attr_id:''
            },
        }
    },
    created(){
        this.getCateList()
    },
    computed:{
        //计算按钮是否启用
        isBtnDisable (){
            return this.selectedKeys.length !== 3 ? true : false
        },
        //计算当前选中三级分类的id
        cateId (){
            return this.selectedKeys.length ===3 ? this.selectedKeys[2] : null
        },
        //动态计算标题的文本
        addDialogTitle(){
            return this.activeName === 'many' ?  '动态参数':'静态属性'
        }
    },
    methods:{
        //获取分类
        async getCateList(){
            const {data: res } = await this.$axios.get('categories')
            if(res.meta.status !== 200) return this.$message.error('获取数据失败')
            this.cateList = res.data  
        },
        //获取分页数据
        async getParamsData(){
            //根据所选分类的id + tab面板的名称，获取对应参数
            const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes`,{params: { sel: this.activeName }})
            if(res.meta.status !== 200) return this.$message.error('参数获取错误')
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                item.inputVisible = false
                item.newTag = ''
            })
            this.activeName === 'many' ? this.manyTableData = res.data : this.onlyTableData = res.data
            
        },
        //监控选择框选择改变
        CateChanged(){
            if(this.selectedKeys.length !== 3){
                this.selectedKeys = []
                this.$message.info('只能选择三级分类')
                return
            }
            this.getParamsData()
        },
        //监控tab页签的点击事件
        handleTabClick(){
            this.getParamsData()    
        },
        //开启添加对话框
        showAddDialog(){
            this.addDialogVisible = true
        },
        //监控添加对话框的关闭
        addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        //添加完成
        add(){
           this.$refs.addFormRef.validate(async valid => {
                if(!valid) return
                const {data: res} = await this.$axios.post(`categories/${this.cateId}/attributes`,{
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                if(res.meta.status !== 201) return this.$message.error('添加失败')
                this.$message.success('添加成功')
                this.getParamsData()
                this.addDialogVisible = false
                
           }) 
        },
        //开启修改对话框
        async showedit(id)
        {
            const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes/${id}`,{attr_sel:this.activeName})
            if(res.meta.status !== 200) return this.$message.error('获取失败')
            this.editForm.attr_name = res.data.attr_name
            this.editForm.attr_id = id
            this.editDialogVisible = true
        },
        //修改对话框关闭
        editDialogClosed(){
            this.$refs.editFormRef.resetFields();
        },
        //修改完成
        edit(){
            this.$refs.editFormRef.validate(async valid => {
                if(!valid) return 
                const {data: res} = await this.$axios.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
                    attr_name:this.editForm.attr_name,
                    attr_sel:this.activeName
                })
                if(res.meta.status !== 200) return this.$message.error('修改失败')
                this.$message.success('修改成功')
                this.getParamsData()
                this.editDialogVisible = false
            })
        },
        //删除属性
        async deleteParams(id){
            const confirmResule = await this.$confirm('此操作将永久删除类型以及子类型，是否继续？',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if(confirmResule !== 'confirm') return this.$message.info('操作已取消')
            const {data: res} = await this.$axios.delete(`categories/${this.cateId}/attributes/${id}`)
            if(res.meta.status !== 200) return this.$message.error('删除失败')
            this.$message.success('删除成功')
            this.getParamsData()
        },
        //让tag输入可见
        showTag(data){
            data.inputVisible = true
            //自动获取焦点
            //nextTick: 当页面元素被重新渲染后，才会调用指定回调函数的代码
            this.$nextTick(_ => {
                //获取两次dom元素 保证能在渲染完毕后获得Dom 再获取焦点（也可以用定时器）
                this.$refs.inputRef.$refs.input.focus()
            })
        },
        //tag输入完毕
        async handleTag(data){
            if(data.newTag.trim().length === 0) return this.$message.error('请输入要加入的标签')
            data.attr_vals.push(data.newTag.trim())
            const {data: res} = await this.$axios.put(`categories/${this.cateId}/attributes/${data.attr_id}`,{
                    attr_name:data.attr_name,
                    attr_sel:data.attr_sel,
                    attr_vals:data.attr_vals.join(' ')
            })
            if(res.meta.status !== 200) return this.$message.error('添加失败')
            this.$message.success('添加成功')
            data.newTag = ''
            data.inputVisible =  false 
        },
        //删除tag
        async TagClose(i,data){
            data.attr_vals.splice(i,1)
            const {data: res} = await this.$axios.put(`categories/${this.cateId}/attributes/${data.attr_id}`,{
                    attr_name:data.attr_name,
                    attr_sel:data.attr_sel,
                    attr_vals:data.attr_vals.join(' ')
            })
            if(res.meta.status !== 200) return this.$message.error('删除失败')
            this.$message.success('删除成功')
            data.newTag = ''
            data.inputVisible =  false 
        }

    }
}
</script>

<style lang='less' scoped>
.goods_row{
    margin-top: 10px;
}

.el-tag{
    margin-right: 8px;
}

.newTag{
    width: 200px;
}
</style>