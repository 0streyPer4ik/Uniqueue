import { createRouter, createWebHistory } from "vue-router"
import HomeView from "./views/HomeView.vue"
import SubjectView from "./views/SubjectView.vue"
import EducationLevelView from "./views/EducationLevelView.vue"
import AnalyticGroupView from "./views/AnalyticGroupView.vue"
import EditQuestion from "./components/forms/EditQuestion.vue"
import AllQuestionsList from "./components/forms/AllQuestionsList.vue"
import CreateQuestion from "./components/forms/CreateQuestion.vue"
import StudentEnter from "./views/StudentEnter.vue"
import Dashboard from "./components/forms/Dashboard.vue"
import NotFound from "./views/NotFound.vue"

/////////////////////////////////////////
// ПУТЬ И ОТОБРАЖЕНИЕ ГЛАВНОЙ СТРАНИЦЫ //
/////////////////////////////////////////

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { title: "АКИТ тестирование", requiresAuth: false },
    },
    {
      path: "/education-level/:id",
      name: "show-education-level",
      component: EducationLevelView,
      meta: { title: "АКИТ тестирование", requiresAuth: false },
    },
    {
      path: "/subject/:id",
      name: "show-subject",
      component: SubjectView,
      meta: { title: "АКИТ тестирование", requiresAuth: false },
    },
    {
      path: "/analytic/group/:id",
      name: "analytic-group",
      component: AnalyticGroupView,
      meta: { title: "АКИТ аналитика группы", requiresAuth: false },
    },
    {
      path: "/edit/:id",
      name: "edit",
      component: EditQuestion,
      meta: { title: "Редактирование вопроса", requiresAuth: true },
    },
    {
      path: "/list",
      name: "list",
      component: AllQuestionsList,
      meta: { title: "Все вопросы", requiresAuth: true },
    },
    {
      path: "/new",
      name: "new",
      component: CreateQuestion,
      meta: { title: "Новый вопрос", requiresAuth: true },
    },
    {
      path: "/enter",
      name: "enter",
      component: StudentEnter,
      meta: { title: "Вход", requiresAuth: false },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: Dashboard,
      meta: { title: "Dashboard", requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFound,
      meta: { title: "404", requiresAuth: false },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("authToken")
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth && !isAuthenticated) {
    next({ name: "enter" })
  } else {
    next()
  }
})

router.afterEach((to) => {
  document.title = (to.meta.title as string) ?? "АКИТ - тестирование"
})

export default router
