import { defineStore } from 'pinia'
import type { GroupInterface } from '@/interfaces/QuestionInterface'


export const GroupsStore = defineStore('groups', {
  state: () => ({
    list: [] as GroupInterface[],
  }),
  getters: {
    getGroups(state): GroupInterface[] {
      return state.list
    }
  },
  actions: {
    async setGroups(list: GroupInterface[]) {
      this.list = list
    },
  }
})
