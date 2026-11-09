import { computed } from 'vue'
import { defineStore } from 'pinia'
import type { QuestionInterface } from '@/interfaces/QuestionInterface'

export const QuestionStore = defineStore('question', {
  state: () => ({
    list: [] as QuestionInterface[],
  }),
  getters: {
    getQuestions(state): QuestionInterface[] {
      return state.list
    },

    getQuestion: (state) => {
      return (id: number) => computed(() => {
        return state.list.find(subject => subject.id == id)
      })
    },
  },
  actions: {
    async setQuestions(list: QuestionInterface[]) {
      this.list = list
    },

    addQuestion(question: QuestionInterface) {
      this.list.push(question)
    }
  }
})
