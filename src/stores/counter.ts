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

interface ListItemInterface {
  id: number;
  id_question_type: number;
  id_subject: number;
  additionalText?: string;
  content: {
    description?: string;          // Для QuestionType1
    qDescription?: string[];       // Для других типов
    answers?: Array<{              // Для QuestionType1
      text: string;
      isCorrect: boolean;
    }>;
    correctAnswer?: string[];      // Для QuestionType4,5
    answersType2?: Array<{         // Для QuestionType2
      text: string;
      matches: string;
    }>;
  };
}

export const questionStore = defineStore('question', {
  state: () => ({
    list: [] as ListItemInterface[],
  }),
  getters: {
    getQuestions(state): ListItemInterface[] {
      return state.list
    }
  },
  actions: {
    async setQuestions(list: ListItemInterface[]) {
      this.list = list
    },

    addQuestion(question: ListItemInterface) {
      this.list.push(question)
    }
  }
})

export default defineComponent({
  computed: {
    ...mapStores(useCounterStore, questionStore),
    ...mapState(useCounterStore, ['count']),
    ...mapState(questionStore, ['list']),
  },
  methods: {
    ...mapActions(useCounterStore, ['increment']),
  },
})
