<template>
    <div class = 'login_container'>
        <div class="login_box">
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
                <!---->
                <el-form ref="loginFormRef" label-width="0px" class="login_form" :model="loginForm" :rules="loginFormRules">
                    <el-form-item prop="username">
                        <el-input v-model="loginForm.username"  placeholder="用户名" prefix-icon="el-icon-user-solid"></el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input v-model="loginForm.password"  placeholder="密码" prefix-icon="el-icon-lock" type="password"></el-input>
                    </el-form-item>
                    <el-form-item class="btns">
                        <el-button type="primary" @click="login">登录</el-button>
                        <el-button type="info" @click="resetLoginForm">重置</el-button>
                    </el-form-item>
                </el-form>
        </div>
    </div>
</template>
<script>

export default {
    data(){
        return {
            loginForm: {
                username: 'admin',
                password: '123456'
            },
            loginFormRules: {
                username: [ //验证用户名是否合法
                    {
                        required:true, message:'未填写用户名', trigger:'blur'
                    },
                    {
                        min:3, max:10, message:'用户名长度在3-10个字符之间', trigger:'blur'
                    },
                ],
                password: [ //验证密码是否合法     
                    {
                        required:true, message:'未填写密码', trigger:'blur'
                    },
                    {
                        min:6, max:18, message:'用户名长度在6-18之间', trigger:'blur'
                    }
                ]
            }
        }
    },
    methods:{
        resetLoginForm() {  //重置表单
            this.$refs.loginFormRef.resetFields();
        },
        login(){            //验证rules的合法性，输出true/false
            this.$refs.loginFormRef.validate(async valid => {
                if(!valid)  return;
                const {data:res} =await this.$axios.post("login",this.loginForm);
                if(res.meta.status !== 200) return this.$message.error('登录失败')
                this.$message.success('登录成功')
                window.sessionStorage.setItem("token",res.data.token);
                this.$router.push('/home')
            })
        }
    }
}
</script>
<style lang = "less" scoped>
.login_container{
    background-color:  rgb(39, 57, 61);
    height: 100%;
}
.login_box{
    width: 600px;
    height: 250px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%)
}

.avatar_box{
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 0%;
    top: 50%;
    transform: translate(-50%,-50%);
    background-color: white;
    img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: grey;
    }
}

.btns{
    display: flex;
    justify-content: flex-end;
}

.login_form{
    position:absolute;
    bottom: 0;
    left: 15%;
    width: 80%;
    padding: 0 20px;
    box-sizing: border-box;
}
</style>