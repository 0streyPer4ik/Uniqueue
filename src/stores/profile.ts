import { defineStore } from 'pinia'
import type { StudentInterface } from '@/interfaces/QuestionInterface'
import axios from "axios"


export interface GroupInterface {
  semestr: number
  name: string
  year: number
  education_level: number | null
}

export interface UserInterface {
  id: number
  username: string
  role: string
  group: GroupInterface
}

export const ProfileStore = defineStore('profile', {
  state: () => ({
    analitic: null as StudentInterface | null,
    user: JSON.parse(localStorage.getItem('user') ?? 'null') as UserInterface | null,
    isLoggedInState: !!localStorage.getItem('authToken') as boolean,
  }),
  getters: {
    getAnalitic(state): StudentInterface | null {
      return state.analitic
    },
    isLoggedIn(): boolean {
      return this.isLoggedInState
    },

    getUser(state): UserInterface | null {
      return state.user
    },

    fio(): string {
      return this.getUser?.username || ''
    },

    group(): GroupInterface {
      return this.getUser?.group || { semestr: 10, name: 'loading', year: 0, education_level: null }
    },

    hasRoleAdmin(state): boolean {
      return state.user?.role === 'admin'
    },
  },
  actions: {
    async setAnalitic(data: StudentInterface) {
      this.analitic = data
    },

    setUser(data: any) {
      try {
        console.log(data)
        this.user = data.user
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
      } catch (error) {
        console.error('Ошибка сохранения данных пользователя:', error)
      }
    },

    logout(): void {
      localStorage.removeItem("authToken")
      localStorage.removeItem("user")
      this.user = null
      this.checkIsLoggedInState()
    },

    checkIsLoggedInState(): void {
      this.isLoggedInState = !!localStorage.getItem('authToken')
    },

    async login(studentId: string, password: string): Promise<string> {
      const loginData = { studentId, password }

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
