import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(Router)


const router = new Router({
  routes:[
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
  ]
})

router.beforeEach((to, from, next) => { //to:将要访问的路径，from:表示从哪跳转过来, next:放行/使用next('/login')强制跳转
  if(to.path ==='/login') return next();
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})

export default router
