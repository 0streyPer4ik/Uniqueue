import { defineStore } from 'pinia'
import type { TeacherInterface } from '@/interfaces/QuestionInterface'

export const TeachersStore = defineStore('teachers', {
  state: () => ({
    list: [] as TeacherInterface[],
  }),
  getters: {
    getTeachers(state): TeacherInterface[] {
      return state.list
    }
  },
  actions: {
    async setTeachers(list: TeacherInterface[]) {
      this.list = list
    },
  }
})
