<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { questionStore, SubjectsStore } from "../stores/counter"
import QuestionComponent from "../components/Question.vue"
// import UserAuthorization from "@/components/UserAuthorization.vue" авторизация

@Options({
  components: {
    QuestionComponent,
    // UserAuthorization авторизация
  }
})
class HomeComponent extends Vue {
  qListStore = questionStore()
  subjectsStore = SubjectsStore()
  answers: Record<number, boolean | null> = {}
  showResults = false
  id_subject = 0
  id_level = 0
  isAuthenticated = false

  get subjectList() {
    return this.subjectsStore.getSubjects.filter(el => el.education_level == this.id_level)
  }

  get qList() {
    return this.qListStore.list.filter(el => el.id_subject == this.id_subject)
  }

  handleAuthSuccess() {
    this.isAuthenticated = true
  }

  // НОВАЯ ФУНКЦИЯ: Выход из системы
  handleLogout() {
    this.isAuthenticated = false
    this.id_subject = 0
    this.id_level = 0
    this.answers = {}
    this.showResults = false

    // Очищаем данные авторизации из localStorage
    localStorage.removeItem('current_auth_token_v2')

    console.log('👤 Пользователь вышел из системы')
  }

  handleAnswerSubmitted(payload: { questionId: number, isCorrect: boolean | null, questionIndex: number }) {
    this.answers[payload.questionId] = payload.isCorrect
  }

  handleSetEducationLevel(data: number) {
    this.id_level = data
  }

  handleSetSubject(data: string) {
    this.id_subject = parseInt(data)
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
    if (!this.showResults) return 'unanswered'

    const answer = this.answers[index]
    if (answer === true) return 'correct'
    if (answer === false) return 'wrong'
    return 'unanswered'
  }
}
export default HomeComponent
</script>

<template>
  <!-- Показываем форму авторизации если не авторизован -->
  <!-- <div v-if="!isAuthenticated">
    <UserAuthorization @auth-success="handleAuthSuccess" />
  </div> -->

  <!-- Показываем основной контент если авторизован -->
  <!-- <div v-else> -->
    <!-- НОВАЯ КНОПКА ВЫХОДА В ШАПКЕ -->
    <!-- <div class="header-bar">
      <button @click="handleLogout" class="logout-header-btn">
        Выйти
      </button>
    </div> авторизация-->

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
            <span class="question-preview">
              {{
                qData.content.description ||
                (qData.content.qDescription ? qData.content.qDescription[0] : 'Нет описания')
              }}
            </span>
          </div>
      </aside>
    </div>
  <!-- </div> авторизация -->
</template>

<style scoped>
/* НОВЫЕ СТИЛИ ДЛЯ ШАПКИ И КНОПКИ ВЫХОДА */
.header-bar {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.logout-header-btn {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
}

.logout-header-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

/* Существующие стили остаются без изменений */
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

  .header-bar {
    position: static;
    text-align: center;
    margin-bottom: 15px;
  }
}
</style>
