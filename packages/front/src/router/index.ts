import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import LobbyView from '../views/LobbyView.vue'
import RoomView from '../views/RoomView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import AdminUsersView from '../views/admin/AdminUsersView.vue'
import AdminRoomsView from '../views/admin/AdminRoomsView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/lobby',
    name: 'Lobby',
    component: LobbyView,
    meta: { requiresAuth: true },
  },
  {
    path: '/lobby/room/:roomId',
    name: 'Room',
    component: RoomView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboardView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsersView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/rooms',
    name: 'AdminRooms',
    component: AdminRoomsView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  const token = auth.getToken
  const isAdmin = auth.isAdmin

  // decode the base64 token to get user info
  const userInfo = token ? JSON.parse(atob(token.split('.')[1])) : null

  // console.log('Navigating to:', {
  //   name: to.name,
  //   requiresAuth: to.meta.requiresAuth,
  //   requiresAdmin: to.meta.requiresAdmin,
  //   token: token,
  //   isAdmin: isAdmin,
  //   userInfo: userInfo,
  //   from: from.name,
  //   auth,
  //   if1:
  //     to.meta.requiresAuth &&
  //     (token === null || token === undefined || token === '' || token === 'undefined'),
  //   if2: to.meta.requiresAdmin && !isAdmin && (!userInfo || !userInfo.roles.includes('admin')),
  // })

  if (
    to.meta.requiresAuth &&
    (token === null || token === undefined || token === '' || token === 'undefined') &&
    !auth.user
  ) {
    next({ name: 'Login' })
  } else if (
    to.meta.requiresAdmin &&
    !isAdmin &&
    (!userInfo || !userInfo.roles.includes('admin'))
  ) {
    next({ name: 'Lobby' })
  } else {
    next()
  }
})

export default router
