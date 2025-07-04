import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import EditQuestion from './components/forms/EditQuestion.vue'
import AllQuestionsList from './components/forms/AllQuestionsList.vue'
import CreateQuestion from './components/forms/CreateQuestion.vue'
import StudentEnter from './components/forms/StudentEnter.vue'
import Dashboard from './components/forms/Dashboard.vue'

/////////////////////////////////////////
// ПУТЬ И ОТОБРАЖЕНИЕ ГЛАВНОЙ СТРАНИЦЫ //
/////////////////////////////////////////

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/edit/:id',
      name: 'edit',
      component: EditQuestion,
    },
    {
      path: '/list',
      name: 'list',
      component: AllQuestionsList,
    },
    {
      path: '/new',
      name: 'new',
      component: CreateQuestion,
    },
    {
      path: '/enter',
      name: 'enter',
      component: StudentEnter,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
    },
  ],
})

export default router
