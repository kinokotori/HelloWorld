<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: 'home'}">
            首页
        </el-breadcrumb-item>
        <el-breadcrumb-item>
            账号管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>
            用户列表
        </el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
        <!--搜索栏-->
        <el-row :gutter="20">
            <el-col :span="7">
                <el-input v-model="queryInfo.query" @clear="getUserList" clearable>
                    <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
            </el-col>
        </el-row>
        <!--用户信息表-->
        <el-table :data="userlist" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="姓名" prop="username"></el-table-column>
            <el-table-column label="邮箱" prop="email"></el-table-column>
            <el-table-column label="电话" prop="mobile"></el-table-column>
            <el-table-column label="角色" prop="role_name"></el-table-column>
            <el-table-column label="状态" prop="mg_state">
                <template v-slot="scope">
                    <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
                            
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180px">
                <template v-slot="scope" >
                        <!--修改按钮-->
                        <el-tooltip effect="dark" content="修改用户信息" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialong(scope.row.id)"></el-button>
                        </el-tooltip>
                        <!--删除按钮-->
                        <el-tooltip effect="dark" content="删除用户信息" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                        </el-tooltip>
                        <!--分配权限-->
                        <el-tooltip effect="dark" content="分配权限" placement="top">
                            <el-button type="warning" icon="el-icon-setting" size="mini" :enterable="false"></el-button>
                        </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <!--分页器-->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1,2,5,10]" 
        :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>
    </el-card>
    <!--添加用户的对话框-->
    <el-dialog title="提示" :visible.sync="addDialogVisible" width="30%"  @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="addForm.username">

                </el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="addForm.password">

                </el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="addForm.email">

                </el-input>
            </el-form-item>
            <el-form-item label="电话号码" prop="mobile">
                <el-input v-model="addForm.mobile">

                </el-input>
            </el-form-item>
        </el-form>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addUser">确定</el-button>
    </el-dialog>
    <!--修改用户的对话框-->
    <el-dialog title="提示" :visible.sync="editDialogVisible" width="30%"  @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef">
            <el-form-item label="用户名" prop="username" >
                <el-input v-model="editForm.username" disabled>

                </el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email">

                </el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
                <el-input v-model="editForm.mobile">

                </el-input>
            </el-form-item>
        </el-form>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editUser">确定</el-button>
    </el-dialog>
  </div>
</template>

<script>


export default {
    data(){
        //验证邮箱的规则
        var checkEmail = (rule, value, cb) => {
            const regEmail =/^[\da-z]+([\-\.\_]?[\da-z]+)*@[\da-z]+([\-\.]?[\da-z]+)*(\.[a-z]{2,})+$/
            if(regEmail.test(value))
            //合法对象
            return cb()
            
            cb(new Error('请输入合法的邮箱'))
        }
        //验证手机号的规则
        var checkMobile = (rule, value, cb) => {
            const regMobile =/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
            if(regMobile.test(value))
            //合法对象
            return cb()
            
            cb(new Error('请输入合法的电话号码'))
        }
        return {
            //获取用户列表对象
            queryInfo:{
                query:'',
                pagenum: 1,
                pagesize: 10
            },
            //用户列表
            userlist:[],
            //用户总数
            total:0,
            //控制添加用户的对话框的显示与隐藏
            addDialogVisible:false,
            
            //添加用户的表单数据
            addForm:{
                username:'',
                password:'',
                email:'',
                mobile:'',
                
            },
            //添加表单的验证规则对象
            addFormRules:{
                username:[
                    {required: true, message: '请输入用户名', trigger:'blur'},
                    {min:3, max:10, message:'用户名的长度在3~10个字符之间',trigger:'blur'},
                ],
                password:[
                    {required: true, message: '请输入密码', trigger:'blur'},
                    {min:6, max:15, message:'密码的长度在6~15个字符之间',trigger:'blur'}
                ],
                email:[
                    {required: true, message: '请输入邮箱', trigger:'blur'},
                    {validator:checkEmail, trigger:'blur'}
                ],
                mobile:[
                    {required: true, message: '请输入电话号码', trigger:'blur'},
                    {validator:checkMobile, trigger:'blur'}
                ]
            },
            //控制修改用户的对话框
            editDialogVisible:false,
            //查询到用于修改的用户信息
            editForm:{},
            editFormRules:{
                email:[
                    {required: true, message: '请输入邮箱', trigger:'blur'},
                    {validator:checkEmail, trigger:'blur'}
                ],
                mobile:[
                    {required: true, message: '请输入电话号码', trigger:'blur'},
                    {validator:checkMobile, trigger:'blur'}
                ]
            }
        }
    },
    created(){
        this.getUserList()
    },
    methods:{
        //获取用户列表
        async getUserList(){
            const {data:res} = await this.$axios.get('users',{ params:this.queryInfo})
            if(res.meta.status !== 200) return this.$message.error('获取用户列表失败')
            this.userlist = res.data.users
            this.total = res.data.total
            
        },
        //监听pagesize的改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        //监听页码值的改变
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        //监听switch开关状态的改变
        async userStateChange(userinfo){
            const {data: res} = await this.$axios.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            if(res.meta.status !== 200 ) {
                userinfo.mg_state = !userinfo.mg_state
                return this.$message.error('状态修改失败')
            }
            this.$message.success('更改用户状态状态成功')
        },
        //监听添加用户对话框的关闭事件
        addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        //点击按钮添加新用户
       addUser(){
            this.$refs.addFormRef.validate(async valid => {
                if(!valid)   return
                //发起添加请求
                const {data:res} = await this.$axios.post('users',this.addForm)
                if(res.meta.status !== 201) return this.$message.error('添加用户失败')
                this.$message.success('添加成功')
                //调整为不可视
                this.addDialogVisible = false
                //调用列表
                this.getUserList()
            })
        },
        //修改用户对话框
        async showEditDialong(id){
            const {data: res} = await this.$axios.get('users/' + id)
            if(res.meta.status !== 200)    return this.$message.error('用户查询失败')
            this.editForm = res.data
            this.editDialogVisible = true
        },
        //修改对话框关闭
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        //修改用户确认操作
        editUser(){
            this.$refs.editFormRef.validate(async valid => {
                const {data: res} = await this.$axios.put('users/' + this.editForm.id,{
                    email: this.editForm.email,
                    mobile: this.editForm.mobile
                })
                if(res.meta.status !== 200) return this.$message.error('修改失败')
                this.editDialogVisible = false
                this.getUserList()
                this.$message.success('修改成功')
            })
            
        },
        //根据ID删除用户的信息
        async removeUserById(id){
            //弹窗询问
            const confirmResult = await this.$confirm('此操作将永久删除用户，是否继续？','提示',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if(confirmResult !== 'confirm') return this.$message.info('操作已取消')

            const {data: res} = await this.$axios.delete('users/'+id)
            if(res.meta.status !== 200) return this.$message.error('删除失败')
            this.$message.success('删除成功')
            this.getUserList()
        }

    }
}
</script>

<style>

</style>