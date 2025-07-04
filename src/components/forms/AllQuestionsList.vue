<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import axios from 'axios'

interface Subject {
  id: number
  name_subject: string
}

interface Question {
  id: number
  id_question_type: number
  id_subject: number
  content: QDataContent
}

interface QDataContent {
  description: string
  answers: Answer[]
}

interface Answer {
  text: string
  isCorrect: boolean
}

@Options({
  data() {
    return {
      questions: [] as Question[],
      selectedQuestionType: null as string | null,
      subjects: [] as Subject[],
      selectedSubject: null as number | null,
    }
  },
  computed: {
    questionTypes(): string[] {
      if (this.questions && this.questions.length > 0) {
        const questionTypes = [...new Set(this.questions.map(q => q.id_question_type.toString()))]
        console.log('Question Types:', questionTypes)
        return questionTypes
      } else {
        console.log('Question Types: (No questions loaded yet)')
        return []
      }
    },
    filteredQuestions(): Question[] {
      if (this.questions && this.questions.length > 0) {
        let filtered = [...this.questions]

        console.log('Selected Question Type:', this.selectedQuestionType, typeof this.selectedQuestionType)
        console.log('Selected Subject:', this.selectedSubject, typeof this.selectedSubject)

        if (this.selectedQuestionType) {
          filtered = filtered.filter(q => {
            console.log('Question id_question_type:', q.id_question_type, typeof q.id_question_type)
            return q.id_question_type === Number(this.selectedQuestionType)
          });
        }

        if (this.selectedSubject) {
          filtered = filtered.filter(q => q.id_subject === this.selectedSubject)
        }

        console.log('Filtered Questions:', filtered)
        return filtered
      } else {
        console.log('Filtered Questions: (No questions loaded yet)')
        return [];
      }
    },
  },
  mounted() {
    this.fetchQuestions()
    this.fetchSubjects()
  },
  methods: {
    async fetchQuestions() {
      try {
        const response = await axios.get<any[]>('http://test.local/questions')
        this.questions = response.data.map(item => ({
          ...item,
          content: JSON.parse(item.content)
        }))
        console.log('Fetched Questions:', this.questions)
      } catch (error) {
        console.error('Ошибка при загрузке вопросов:', error)
      }
    },
    async fetchSubjects() {
      try {
        const response = await axios.get<Subject[]>('http://test.local/subjects')
        this.subjects = response.data
        console.log('Fetched Subjects:', this.subjects)
      } catch (error) {
        console.error('Ошибка при загрузке предметов:', error)
      }
    },
    filterQuestions() {
      console.log('filterQuestions() called')
    }
  },
})
export default class QuestionListComponent extends Vue {
  questions!: Question[]
  selectedQuestionType: string | null = null
  subjects!: Subject[]
  selectedSubject: number | null = null

  questionTypes!: string[]
  filteredQuestions!: Question[]

  async fetchQuestions() {
    try {
      const response = await axios.get<any[]>('http://test.local/questions')
      this.questions = response.data.map(item => ({
        ...item,
        content: JSON.parse(item.content)
      }))
      console.log('Fetched Questions:', this.questions)
    } catch (error) {
      console.error('Ошибка при загрузке вопросов:', error)
    }
  }

  async fetchSubjects() {
    try {
      const response = await axios.get<Subject[]>('http://test.local/subjects')
      this.subjects = response.data
      console.log('Fetched Subjects:', this.subjects)
    } catch (error) {
      console.error('Ошибка при загрузке предметов:', error)
    }
  }

  filterQuestions() {
    console.log('filterQuestions() called')
  }
}
</script>

<template>
  <div class="question-list">
    <h1>Список Вопросов</h1>

    <el-select v-model="selectedSubject" placeholder="Выберите предмет">
      <el-option v-for="subject in subjects" :key="subject.id" :label="subject.name_subject" :value="subject.id" />
    </el-select>

    <el-select v-model="selectedQuestionType" placeholder="Выберите тип вопроса" @change="filterQuestions">
      <el-option v-for="type in questionTypes" :key="type" :label="type" :value="type" />
    </el-select>

    <div v-if="filteredQuestions.length > 0 && selectedQuestionType !== null && selectedSubject !== null">
      <h2>Вопросы:</h2>
      <ul>
        <li v-for="question in filteredQuestions" :key="question.id">
          <RouterLink :to="`/edit/${question.id}`">
            {{ question.content?.description }}
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.question-list {
  font-family: Arial, sans-serif;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.el-select {
  width: 200px;
  margin-right: 20px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
</style>
