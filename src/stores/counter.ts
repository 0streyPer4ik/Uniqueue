import { ref, computed, defineComponent } from 'vue'
import { defineStore, mapStores, mapState, mapActions } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

export const questionStore = defineStore('question', {
  state: () => ({
    list: [

    ]
  }),
  getters: {
    getQuestions(state){
        return state.list
      }
  },
  actions: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async setQuestions(list: any) {
      this.list = list
    }
  }
})

export default defineComponent({
  computed: {
    ...mapStores(useCounterStore, questionStore),
    // gives read access to this.count and this.double
    ...mapState(useCounterStore, ['count']),
    ...mapState(questionStore, ['list']),
  },
  methods: {
    // gives access to this.increment()
    ...mapActions(useCounterStore, ['increment']),
  },
})
