import { ref, computed, defineComponent, reactive } from 'vue'
import { defineStore, mapStores, mapState, mapActions } from 'pinia'
import type { SubjectInterface, TeacherInterface, QuestionInterface, GroupInterface } from '@/interfaces/QuestionInterface'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})



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

export default defineComponent({
  computed: {
    ...mapStores(useCounterStore, QuestionStore, TeachersStore),
    ...mapState(useCounterStore, ['count']),
    ...mapState(QuestionStore, ['list']),
    ...mapState(TeachersStore, ['list']),
  },
  methods: {
    ...mapActions(useCounterStore, ['increment']),
  },
})
