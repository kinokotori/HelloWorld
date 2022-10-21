import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'


Vue.use(Router)


const router = new Router({
  routes:[
  {path: '/', redirect: '/login'},
  {path: '/login', component: Login},
  {path: '/home', component: Home, redirect: '/welcome',
    children:[{path: '/welcome', component: Welcome},
              {path: '/Users', component: Users},
              {path: '/Rights', component: Rights},
              {path: '/Roles', component: Roles}
  ]
  },
  ]
})

router.beforeEach((to, from, next) => { //to:将要访问的路径，from:表示从哪跳转过来, next:放行/使用next('/login')强制跳转
  if(to.path ==='/login') return next();
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})

export default router