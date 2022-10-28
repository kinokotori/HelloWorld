<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: 'home'}">
                首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>
                权限管理
            </el-breadcrumb-item>
            <el-breadcrumb-item>
                角色列表
            </el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片-->
        <el-card>
            <el-row>
                <el-col>
                    <!--添加角色按钮-->
                    <el-button type="primary" @click="addRoleDialog">添加角色</el-button>
                </el-col>
            </el-row>
            <!--角色列表-->
            <el-table :data="rolesList">
                <!--展开列-->
                <el-table-column type="expand">
                    <template v-slot="scope">
                        <el-row v-for="(item1, index1) in scope.row.children" :key="item1.id" :class="['bdbottom','ccenter']">
                            <!--渲染一级权限-->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!--渲染二级权限-->
                            <el-col :span="19">
                                <el-row  v-for="(item2, index2) in item1.children" :key="item2.id" :class="['bdtop','ccenter']">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3, index3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                            <!--渲染三级权限-->
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作">
                    <template v-slot="scope">
                        <!--编辑按钮-->
                        <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoleDialog(scope.row)"></el-button>
                        </el-tooltip>
                        <!--删除按钮-->
                        <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row)"></el-button>
                        </el-tooltip>
                        <!--分配权限-->
                        <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false" >
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        
        <!--添加角色的对话框-->
        <el-dialog  title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="addRoleDialogClosed">
            <el-form :model="newRole"  :rules="addRoleRules" ref="addRoleRef">
                <el-form-item label="角色名" prop="roleName">
                    <el-input v-model="newRole.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="newRole.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <el-button @click="addRoleDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="addRole" >确定</el-button>
        </el-dialog>
        <!--修改角色的对话框-->
        <el-dialog  title="修改角色" :visible.sync="editRoleDialogVisible" width="50%" @close="editRoleDialogClosed">
            <el-form :model="editRoleForm" ref="editRoleRef" :rules="addRoleRules">
                <el-form-item label="角色名" prop="roleName">
                    <el-input v-model="editRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <el-button @click="editRoleDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="editRole" >确定</el-button>
        </el-dialog>
        <!--分配权限的对话框-->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <el-tree :data="rightsList"  :props="treeProps"  ref="treeRef" show-checkbox default-expand-all node-key="id" :default-checked-keys="defkeys" >


            </el-tree>
            <el-button @click="setRightDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="allotRights" >确定</el-button>
        </el-dialog>
    </div>
</template>

<script>

export default {
    data(){
        return {
            //角色列表
            rolesList:[],
            //权限树列表
            rightsList:[],
            //树形控制的绑定对象
            treeProps:{
                label: 'authName',
                children: 'children'
            },
            //默认选中的节点的id数值
            defkeys:[],
            //角色ID
            roleId:'',
            //添加角色表单
            newRole:{
                roleName:'',
                roleDesc:''
            },
            //修改角色表单
            editRoleForm:{},
            //添加角色表单验证
            addRoleRules:{
                roleName:[{required: true, message: '请输入角色名', trigger:'blur'}],
                roleDesc:[{required: true, message: '请输入角色描述', trigger:'blur'}]
            },
            //控制添加角色对话框的显示
            addRoleDialogVisible:false,
            //控制修改角色对话框的显示
            editRoleDialogVisible:false,
            //控制分配权限对话框的显示
            setRightDialogVisible:false
        }
    },
    created(){
        this.getRolesList()
    },
    methods:{
        //获取角色列表
        async getRolesList(){
            const {data: res} = await this.$axios.get('roles')
            if(res.meta.status !== 200) return this.$message.error('获取角色列表失败')
            this.rolesList = res.data
        },
         //-----------------------------------------------------------------------------------
        //删除权限
        async removeRightById(role, rightid){
            const confirmResult = await this.$confirm('此操作将永久删除文件，是否继续？','提示',{
                confirmButtonText: '确定',
                cancelButtonText: '取消'
            }).catch(err => err)
            if(confirmResult !== 'confirm') return this.$message.info('取消了删除')
            const {data: res} = await this.$axios.delete(`roles/${role.id}/rights/${rightid}`)
            if(res.meta.status !== 200) return this.$message.error('删除权限失败')
            this.$message.success('删除权限成功')
            role.children = res.data
        },
         //-----------------------------------------------------------------------------------
        //展示修改角色的对话框
        async showEditRoleDialog(row){
            const {data: res} = await this.$axios.get(`roles/${row.id}`)
            if(res.meta.status !== 200) return this.$message.error('获取角色信息失败')
            this.editRoleForm = res.data
            this.editRoleDialogVisible = true
        },
        //修改角色对话框关闭
        editRoleDialogClosed(){
            this.$refs.editRoleRef.resetFields()
        },
        //修改角色
        editRole(){
            this.$refs.editRoleRef.validate(async valid => {
                if(!valid) return
                const { data: res} = await this.$axios.put(`roles/${this.editRoleForm.roleId}`,{
                    roleName:this.editRoleForm.roleName,
                    roleDesc:this.editRoleForm.roleDesc
                })
                if(res.meta.status !== 200) return this.$message.error('修改角色失败')
                this.$message.success('修改角色成功')
                this.getRolesList()
                this.editRoleDialogVisible = false
            })
        },
        //-----------------------------------------------------------------------------------
        //展示添加角色的对话框
        addRoleDialog(){
            this.addRoleDialogVisible = true
        },
        //完成添加角色
        addRole(){
            this.$refs.addRoleRef.validate(async valid => {
                if(!valid) return
                const {data: res} = await this.$axios.post('roles',this.newRole)
                if(res.meta.status !== 201) return this.$message.error('添加用户失败')
                this.$message.success('添加用户成功')
                this.getRolesList()
                this.addRoleDialogVisible = false
            })
        },
        //添加角色的对话框关闭
        addRoleDialogClosed(){
            this.$refs.addRoleRef.resetFields()
        },
         //-----------------------------------------------------------------------------------
        //删除角色
        async deleteRole(row){
            const confirmResule = await this.$confirm('此操作将永久删除角色，是否继续？',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if(confirmResule !== 'confirm') return this.$message.info('操作已取消')
            const {data: res} = await this.$axios.delete(`roles/${row.id}`)
            if(res.meta.status !== 200) return this.$message.error('删除失败')
            this.$message.success('删除成功')
            this.getRolesList()
        },
         //-----------------------------------------------------------------------------------
        //展示分配权限的对话框
        async showSetRightDialog(role){
            //获取所有权限的数据
            this.roleId = role.id
            const { data: res} = await this.$axios.get('rights/tree')
            if(res.meta.status !== 200) return this.$message.error('获取权限树失败')
            this.rightsList = res.data
            //递归获取三级节点的id
            this.getLeafKeys(role, this.defkeys)
            this.setRightDialogVisible = true
            
        },
        //通过递归的形式，获取角色下所有三级权限的id，并保存到defkeys数组中
        getLeafKeys(node, arr){
            //如果当前node节点不包含children属性，则是三级节点
            if(!node.children){
                return arr.push(node.id)
            }
            node.children.forEach(item => this.getLeafKeys(item, arr))//递归调用自身 要加this
        },
        //关闭对话框时触发
        setRightDialogClosed(){
            this.defkeys = []
        },
        //确认复选框,分配权限
        async allotRights(){
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]

            const idStr = keys.join(',')
            const {data: res} = await this.$axios.post(`roles/${this.roleId}/rights`,{rids:idStr})
            if(res.meta.status !== 200) return this.$message.error('更新权限失败')
            this.$message.success('更新权限成功')
            this.getRolesList()
            this.setRightDialogVisible = false
        }
    }   
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}

.bdtop {
    border-top: 1px solid #eee
}

.bdbottom {
    border-top: 1px solid #eee
}

.ccenter {
    display: flex;
    align-items: center;
}
</style>