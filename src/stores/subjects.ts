import { defineStore } from 'pinia'
import type { SubjectInterface } from '@/interfaces/QuestionInterface'


export const SubjectsStore = defineStore('subjects', {
  state: () => ({
    list: [] as SubjectInterface[],
  }),
  getters: {
    getSubjects(state): SubjectInterface[] {
      return state.list
    },
    getSubject(state) {
      return (id: number): SubjectInterface | undefined => {
        return state.list.find(subject => subject.id === id)
      }
    },
  },
  actions: {
    async setSubjects(list: SubjectInterface[]) {
      this.list = list
    },
  }
})
