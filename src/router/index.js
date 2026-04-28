import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login',             name: 'login',          component: () => import('@/views/SplashView.vue'),        meta: { noNav: true } },
  { path: '/entrar',            name: 'entrar',         component: () => import('@/views/LoginView.vue'),         meta: { noNav: true } },
  { path: '/cadastro',          name: 'cadastro',       component: () => import('@/views/RegisterView.vue'),      meta: { noNav: true } },
  { path: '/setup-nickname',    name: 'setup-nickname', component: () => import('@/views/NicknameSetupView.vue'), meta: { noNav: true } },
  { path: '/inbox',             name: 'inbox',          component: () => import('@/views/InboxView.vue') },
  { path: '/',                  name: 'home',           component: () => import('@/views/HomeView.vue') },
  { path: '/treinos',           name: 'treinos',   component: () => import('@/views/TrainingsView.vue') },
  { path: '/treino/:id',        name: 'programa',  component: () => import('@/views/ProgramView.vue') },
  { path: '/criar-treino',      name: 'criar',     component: () => import('@/views/CreateProgramView.vue') },
  { path: '/editar-treino/:id', name: 'editar',    component: () => import('@/views/CreateProgramView.vue') },
  { path: '/sessao',            name: 'sessao',    component: () => import('@/views/SessionView.vue') },
  { path: '/historico',         name: 'historico', component: () => import('@/views/HistoryView.vue') },
  { path: '/mapa',              name: 'mapa',      component: () => import('@/views/MindMapView.vue') },
  { path: '/perfil',            name: 'perfil',    component: () => import('@/views/ProfileView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

const publicRoutes = ['login', 'entrar', 'cadastro', 'setup-nickname']

router.beforeEach((to) => {
  const seen = localStorage.getItem('gymtrack_seen')
  if (!seen && !publicRoutes.includes(to.name)) {
    return { name: 'login' }
  }
})

export default router
