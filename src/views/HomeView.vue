<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { questionStore, SubjectsStore } from "../stores/counter"
import QuestionComponent from "../components/Question.vue"

@Options({
  components: {
    QuestionComponent
  }
})
class HomeComponent extends Vue {
  qListStore = questionStore()
  subjectsStore = SubjectsStore()
  answers: Record<number, boolean | null> = {}
  showResults = false
  id_subject = 0
  id_level = 0

  get subjectList() {
    return this.subjectsStore.getSubjects.filter(el => el.education_level == this.id_level)
  }

  get qList() {
    return this.qListStore.list.filter(el => el.id_subject == this.id_subject)
  }


  handleAnswerSubmitted(payload: { questionId: number, isCorrect: boolean | null, questionIndex: number }) {
    this.answers[payload.questionId] = payload.isCorrect
  }

  handleSetEducationLevel(data: number) {
    this.id_level = data
  }

  handleSetSubject(data: number) {
    this.id_subject = data
    this.answers = {}
    this.showResults = false
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
    if (!this.showResults) {
      const question = this.qList[index]
      return this.answers[question.id] !== undefined && this.answers[question.id] !== null ? 'answered' : 'unanswered'
    }
    const question = this.qList[index]
    const answer = this.answers[question.id]

    if (answer === true) return 'correct'
    if (answer === false) return 'wrong'
    return 'unanswered'
  }

  getQuestionStatusText(index: number): string {
    const status = this.getQuestionStatus(index)
    switch(status) {
      case 'correct': return '✓ Правильно'
      case 'wrong': return '✗ Неправильно'
      case 'answered': return 'Отвечен'
      default: return 'Не отвечен'
    }
  }
}
export default HomeComponent
</script>

<template>
    <div id="educationTypeSelect" v-if="id_level == 0">
      <div @click="handleSetEducationLevel(1)">
        <img src="/img/mb.png" /><br />
        Бакалавриат
      </div>
      <div @click="handleSetEducationLevel(2)">
        <img src="/img/mm.png" /><br />
        Магистратура
      </div>
    </div>
    <div class="container" v-else-if="id_subject == 0">
      Начать тестирование по
      <el-button
        v-for="obj in subjectList"
        :key="obj.id"
        @click="handleSetSubject(obj.id)"
      >
        {{ obj.name_short }}
      </el-button>
    </div>
    <div class="container" v-if="id_subject > 0">
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

          <div class="progress-container" v-if="results.totalQuestions > 0">
            <div class="progress-bar">
              <div
                class="progress-correct"
                :style="{ width: `${(results.correctAnswers / results.totalQuestions) * 100}%` }"
                :title="`Правильно: ${results.correctAnswers}`"
              ></div>
              <div
                class="progress-wrong"
                :style="{ width: `${(results.wrongAnswers / results.totalQuestions) * 100}%` }"
                :title="`Неправильно: ${results.wrongAnswers}`"
              ></div>
            </div>
            <div class="progress-labels">
              <span class="progress-label correct">Правильно: {{ results.correctAnswers }}</span>
              <span class="progress-label wrong">Неправильно: {{ results.wrongAnswers }}</span>
              <span class="progress-label unanswered">Не отвечено: {{ results.unansweredQuestions }}</span>
            </div>
          </div>
        </div>

        <button @click="showFinalResults" class="submit-btn" v-if="!showResults">
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
            :title="getQuestionStatusText(index)"
          >
            <span class="question-number">Вопрос {{ index + 1 }}</span>
            <span class="question-status-badge">{{ getQuestionStatusText(index) }}</span>
            <span class="question-preview">
              {{
                qData.content.description ||
                (qData.content.qDescription ? qData.content.qDescription[0] : 'Нет описания')
              }}
            </span>
          </div>

          <div class="sidebar-summary" v-if="showResults">
            <h4>Итого:</h4>
            <div class="summary-item correct">
              <span class="summary-dot"></span>
              Правильных: {{ results.correctAnswers }}
            </div>
            <div class="summary-item wrong">
              <span class="summary-dot"></span>
              Неправильных: {{ results.wrongAnswers }}
            </div>
            <div class="summary-item unanswered">
              <span class="summary-dot"></span>
              Не отвечено: {{ results.unansweredQuestions }}
            </div>
          </div>
      </aside>
    </div>
</template>

<style scoped>
#educationTypeSelect {
  display: flex;
  div {
    width: 400px;
    margin: 0px auto;
    text-align: center;
    cursor: pointer;
    img {
      max-height: 250px;
      border: 2px solid #2b2b2b;
      border-radius: 10%;
    }
  }
}
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
  color: #fff;
}

.sidebar-question {
  padding: 10px;
  margin: 8px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  border: 1px solid transparent;
}

.sidebar-question:hover {
  transform: translateX(3px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.sidebar-question.unanswered {
  background: #f0f0f0;
  color: #666;
  border-left: 4px solid #ccc;
}

.sidebar-question.answered {
  background: #e3f2fd;
  color: #1565c0;
  border-left: 4px solid #2196f3;
}

.sidebar-question.correct {
  background: #e8f5e9;
  color: #2e7d32;
  border-left: 4px solid #4caf50;
  border: 1px solid #4caf50;
}

.sidebar-question.wrong {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #f44336;
  border: 1px solid #f44336;
}

.question-number {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
  font-size: 15px;
}

.question-status-badge {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-bottom: 5px;
  align-self: flex-start;
}

.sidebar-question.correct .question-status-badge {
  background: #4caf50;
  color: white;
}

.sidebar-question.wrong .question-status-badge {
  background: #f44336;
  color: white;
}

.sidebar-question.answered .question-status-badge {
  background: #2196f3;
  color: white;
}

.sidebar-question.unanswered .question-status-badge {
  background: #ccc;
  color: #666;
}

.question-preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.submit-btn {
  margin: 25px 0;
  padding: 12px 24px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.submit-btn:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.results-section {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.results-section h2 {
  color: #333;
  margin-top: 0;
}

.results-section p {
  margin: 8px 0;
  font-size: 16px;
  color: #333;
}

.progress-container {
  margin-top: 20px;
}

.progress-bar {
  height: 24px;
  background: #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  margin-bottom: 10px;
}

.progress-correct {
  background: #4caf50;
  height: 100%;
  transition: width 0.5s ease;
}

.progress-wrong {
  background: #f44336;
  height: 100%;
  transition: width 0.5s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.progress-label.correct {
  color: #4caf50;
  font-weight: bold;
}

.progress-label.wrong {
  color: #f44336;
  font-weight: bold;
}

.progress-label.unanswered {
  color: #666;
}

.sidebar-summary {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

.sidebar-summary h4 {
  color: #fff;
  margin-top: 0;
  margin-bottom: 10px;
}

.summary-item {
  display: flex;
  align-items: center;
  margin: 5px 0;
  padding: 5px;
  border-radius: 4px;
  font-size: 14px;
}

.summary-item.correct {
  color: #e8f5e9;
}

.summary-item.wrong {
  color: #ffebee;
}

.summary-item.unanswered {
  color: #f0f0f0;
}

.summary-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.summary-item.correct .summary-dot {
  background: #4caf50;
}

.summary-item.wrong .summary-dot {
  background: #f44336;
}

.summary-item.unanswered .summary-dot {
  background: #ccc;
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

  .header-bar {
    position: static;
    text-align: center;
    margin-bottom: 15px;
  }

  .results-section {
    width: 100%;
  }
}
</style>
