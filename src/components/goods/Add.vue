<template>
  <div>
    <!--面包屑区域-->
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
            <el-breadcrumb-item>
                添加商品
            </el-breadcrumb-item>
    </el-breadcrumb>   
    <!--卡片区域--> 
    <el-card>
        <el-alert title="添加商品信息" type="info" left show-icon></el-alert>
        <!--步骤区域-->
        <el-steps :space="300" :active="activeIndex - 0" finish-status="success" align-center>
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
        </el-steps>
        <!--tab-->
        <el-form :model="addForm" :rules="addFormRules" label-width="100px" label-position="top" ref="addFormRef">
            <el-tabs :tab-position="'left'"  v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                <el-tab-pane label="基本信息" name="0">
                    <el-form-item label="商品名称" prop="goods_name">
                        <el-input v-model="addForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格" prop="goods_price">
                        <el-input v-model="addForm.goods_price"></el-input>
                    </el-form-item>
                    <el-form-item label="商品数量" prop="goods_number" type="number">
                        <el-input v-model="addForm.goods_number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量" prop="goods_weight">
                        <el-input v-model="addForm.goods_weight"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" prop="goods_cat">
                        <el-cascader expand-trigger="hover" :options="cateList" :props="cateProps" v-model="addForm.goods_cat"  @change="cateChange">
                            
                        </el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="1">
                    <el-form-item :label="item.attr_name" v-for="item in manyTableList" :key="item.attr_id">
                        <el-checkbox-group v-model="item.attr_vals">
                            <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i"></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性" name="2">
                    <el-form-item :label="item.attr_name" v-for="item in onlyTableList" :key="item.attr_id">
                        <el-input v-model="item.attr_vals"></el-input>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="3">
                    <el-upload
                    class="upload-demo"
                    :action="uploadURL"
                    :headers="headerOBJ"
                    :on-remove="handleRemove"
                    :file-list="fileList"
                    list-type="picture"
                    :on-success="handleSuccess"
                    >
                    <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                    <!--富文本编辑器组件-->
                    <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                    <el-button type="primary" class="addbtn" @click="add()">添加商品</el-button>
                </el-tab-pane>
            </el-tabs>
        </el-form>
    </el-card>
  </div>
</template>

<script>


export default {
    data(){
        return {
            //进度激活
            activeIndex:0,
            //添加商品的表单
            addForm:{
                goods_name:'',
                goods_price:'',
                goods_number:'',    
                goods_weight:'',
                goods_cat:[],
                pics:[],
                goods_introduce:'',
                attrs: []
            },
            //添加商品的表单规则
            addFormRules:{
                goods_name:[{required: true, message: '请输入商品名称', trigger: 'blur'},],
                goods_price:[{required: true, message: '请输入商品价格', trigger: 'blur'},],
                goods_number:[{required: true, message: '请输入商品数量', trigger: 'blur'},],    
                goods_weight:[{required: true, message: '请输入商品重量', trigger: 'blur'},],
                goods_cat:[{required: true, message: '请选择商品类型', trigger: 'blur'},]
            },
            //商品分类列表
            cateList:[],
            //联结选择框设置
            cateProps:{
                label:'cat_name',
                value:'cat_id',
                children:'children'
            },
            //动态参数列表
            manyTableList:[],
            //静态参数列表
            onlyTableList:[],
            //上传图片的url地址
            uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
            //请求头
            headerOBJ:{
                Authorization:window.sessionStorage.getItem('token')
            },
            fileList:[]
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        //获取商品分类
        async getCateList(){
            const {data: res } = await this.$axios.get('categories')
            console.log(res)
            if(res.meta.status !== 200) return this.$message.error('获取数据失败')
           
            this.cateList = res.data
        },
        //选择器改变
        cateChange(){
            if(this.addForm.goods_cat.length !== 3){
                this.$message.error('请选择三级分类')
                this.addForm.goods_cat = []
            }
            
        },
        //tab标签点击之前
        beforeTabLeave(activeName,oldActiveName){
            if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3 ){
                this.$message.error('请选择商品类别')
                return false
            }
             
        },
        //tab标签点击之后
        async tabClicked(){
            if(this.activeIndex === '1'){
                const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes`,{params:{
                    sel: 'many'
                }})
                if(res.meta.status !== 200) return this.$message.error('获取列表失败')
                res.data.forEach(item => {
                item.attr_vals = item.attr_vals.length ===0 ? [] : item.attr_vals.split(' ')
                })
                this.manyTableList = res.data
            }else if(this.activeIndex === '2'){
                const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes`,{params:{
                    sel: 'only'
                }})
                if(res.meta.status !== 200) return this.$message.error('获取列表失败')
                this.onlyTableList = res.data
            }
        },
        
        //上传图片成功后
        handleSuccess(response){
            const picInfo = {
                pic:response.data.tmp_path
            }
            this.addForm.pics.push(picInfo)
        },
        //删除图片后
        handleRemove(file){
            const filePath = file.response.data.tmp_path
            //获取满足条件的索引值
            const i = this.addForm.pics.findIndex(x => 
                x.pic === filePath
            )
            //删除该值
            this.addForm.pics.splice(i, 1)
        },
        add() {
            this.$refs.addFormRef.validate(async valid => {
                if(!valid) return
                //深拷贝，躲避双向绑定
                const form = JSON.parse(JSON.stringify(this.addForm))
                //处理字符串
                form.goods_cat = form.goods_cat.join(',')
                //处理动态参数
                this.manyTableList.forEach(item => {
                    const newInfo = {
                        attr_id:item.attr_id,
                        attr_vals:item.attr_vals.join(' ')
                    }
                    form.attrs.push(newInfo)
                })
                //处理静态属性
                this.onlyTableList.forEach(item => {
                    const newInfo = {
                        attr_id:item.attr_id,
                        attr_vals:item.attr_vals
                    }
                    form.attrs.push(newInfo)
                })


                const {data: res} = await this.$axios.post(`goods`,form)
                if(res.meta.status !== 201) return this.$message.error('添加失败')
                this.$message.success('添加成功')
                this.$router.push('/goods')
            })
        }
    },
    computed:{
        cateId(){
            return this.addForm.goods_cat.length ===3 ? this.addForm.goods_cat[2] : ''
        }
    }
    
}
</script>

<style lang="less" scoped>
.el-checkbox {
    margin: 0 5px 0 0 
}

.ql-editor {
    min-height: 300px;
}
.addbtn {
    margin-top: 8px;
}
</style>