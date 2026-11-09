import { defineStore } from 'pinia'
import type { StudentInterface } from '@/interfaces/QuestionInterface'
import axios from "axios"

export const ProfileStore = defineStore('profile', {
  state: () => ({
    analitic: null as StudentInterface | null,
    isLoggedInState: !!localStorage.getItem('authToken') as boolean,
  }),
  getters: {
    getAnalitic(state): StudentInterface | null {
      return state.analitic
    },
    isLoggedIn(): boolean {
      return this.isLoggedInState
    },

    getUser(): any | null {
      const userData = localStorage.getItem('user')
      if (!userData) {
        return null
      }
      try {
        const user = JSON.parse(userData)
        return user
      } catch (error) {
        console.error('Ошибка парсинга данных:', error)
      }
      return null
    },

    fio(): string {
      return this.getUser?.username || ''
    },

    hasRoleAdmin(): boolean {
      const userData = localStorage.getItem('user')
      if (!userData) {
        return false
      }

      try {
        const user = JSON.parse(userData)
        return user.role === 'admin'
      } catch (error) {
        console.error('Ошибка парсинга данных:', error)
      }
      return false
    },
  },
  actions: {
    async setAnalitic(data: StudentInterface) {
      this.analitic = data
    },

    setUser(data: any) {
      try {
        console.log(data)
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
      } catch (error) {
        console.error('Ошибка сохранения данных пользователя:', error)
      }
    },

    logout(): void {
      localStorage.removeItem("authToken")
      localStorage.removeItem("user")

      this.checkIsLoggedInState()
    },

    checkIsLoggedInState(): void {
      this.isLoggedInState = !!localStorage.getItem('authToken')
    },

    async login(studentId: string, password: string): Promise<string> {
      const loginData = {
        studentId: studentId,
        password: password,
      }

      try {
        const response = await axios.post("/login", loginData)
        if (response.data.success) {
          this.setUser(response.data)
          return "ok"
        }
        return response.data.message as string
      }
      catch (error) {
        console.error("Ошибка!", error)
      }
      return "Ошибка входа!"
    }
  }
})
