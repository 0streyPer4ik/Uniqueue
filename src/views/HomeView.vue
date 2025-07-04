<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { questionStore } from "../stores/counter"
import QuestionComponent from "../components/Question.vue"

@Options({
  components: {
    QuestionComponent
  }
})
export default class HomeComponent extends Vue {
  qListStore = questionStore()
  answers: Record<number, boolean | null> = {}
  showResults = false

  get qList() {
    return this.qListStore.list
  }

  handleAnswerSubmitted(payload: { questionId: number, isCorrect: boolean | null, questionIndex: number }) {
    this.answers[payload.questionIndex] = payload.isCorrect
  }

  showFinalResults() {
    this.showResults = true
  }

  get results() {
    const totalQuestions = this.qList.length
    const answeredQuestions = Object.values(this.answers).filter(v => v !== null).length
    const correctAnswers = Object.values(this.answers).filter(Boolean).length
    const wrongAnswers = answeredQuestions - correctAnswers

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      wrongAnswers,
      unansweredQuestions: totalQuestions - answeredQuestions
    }
  }

  scrollToQuestion(index: number) {
    const questionElement = document.getElementById(`question-${index}`)
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  getQuestionStatus(index: number): string {
    if (!this.showResults) return 'unanswered' // До показа результатов все вопросы считаются неотвеченными

    const answer = this.answers[index]
    if (answer === true) return 'correct'
    if (answer === false) return 'wrong'
    return 'unanswered'
  }
}
</script>

<template>
  <div class="container">
    <main class="questions-main">
      <QuestionComponent
        v-for="(qData, index) in qList"
        :key="qData.id"
        :qData="qData"
        :index="index"
        :showResults="showResults"
        @answer-submitted="handleAnswerSubmitted"
        :id="`question-${index}`"
      ></QuestionComponent>

      <div class="results-section" v-if="showResults">
        <h2>Результаты теста</h2>
        <p>Всего вопросов: {{ results.totalQuestions }}</p>
        <p>Отвечено: {{ results.answeredQuestions }}</p>
        <p>Правильных ответов: {{ results.correctAnswers }}</p>
        <p>Неправильных ответов: {{ results.wrongAnswers }}</p>
        <p>Не отвечено: {{ results.unansweredQuestions }}</p>
      </div>

      <button @click="showFinalResults" class="submit-btn">
        Показать результаты
      </button>
    </main>

    <aside class="questions-sidebar">
      <h3>Вопросы</h3>
      <div
        v-for="(qData, index) in qList"
        :key="`sidebar-${qData.id}`"
        class="sidebar-question"
        :class="getQuestionStatus(index)"
        @click="scrollToQuestion(index)"
      >
        <span class="question-number">Вопрос {{ index + 1 }}</span>
        <span class="question-preview">{{ qData.content.description }}</span>
      </div>
    </aside>
  </div>
</template>

<style scoped>
/* Стили остаются такими же как в предыдущем примере */
.container {
  display: flex;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.questions-main {
  flex: 1;
  max-width: 800px;
}

.questions-sidebar {
  width: 300px;
  padding: 15px;
  background: #2b2b2b;
  border-radius: 8px;
  position: fixed;
  top: 15px;
  right: 10px;
  max-height: 90vh;
  overflow-y: auto;
}

.questions-sidebar h3 {
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.sidebar-question {
  padding: 10px;
  margin: 5px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.sidebar-question:hover {
  background: #e9e9e9;
}

.sidebar-question.unanswered {
  background: #f0f0f0;
  color: #888;
}

.sidebar-question.correct {
  background: #e8f5e9;
  color: #2e7d32;
  border-left: 3px solid #2e7d32;
}

.sidebar-question.wrong {
  background: #ffebee;
  color: #c62828;
  border-left: 3px solid #c62828;
}

.question-number {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.question-preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.submit-btn {
  margin-bottom: 25px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.submit-btn:hover {
  background-color: #45a049;
}

.results-section {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 50%;
}

@media (min-width: 360px) and (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .questions-sidebar {
    width: auto;
    position: static;
    order: 1;
    margin-bottom: 20px;
    max-height: 200px;
  }
}
</style>
