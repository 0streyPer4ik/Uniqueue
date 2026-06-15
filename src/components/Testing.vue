<script lang="ts">
import { Options, Vue } from "vue-class-component"
import QuestionComponent from "../components/Question.vue"
import type { QuestionData } from "../interfaces/QuestionInterface.ts"
import axios from "axios"
import { ElMessage } from "element-plus"
import type { MessageParams } from "element-plus"

@Options({
  props: {
    questions: {
      type: Array as () => QuestionData[],
      required: true,
    },
  },
  components: {
    QuestionComponent,
  },


  watch: {
    'questions': function (newQuestions: QuestionData[]) {
      if (newQuestions && newQuestions.length > 0) {
        this.startTimer()
      }
    }
  }
})
class TestingComponent extends Vue {
  questions!: QuestionData[]
  answers: Record<number, boolean | null> = {}
  showResults = false

  handleAnswerSubmitted(payload: {
    questionId: number;
    isCorrect: boolean | null;
    questionIndex: number;
  }) {
    this.answers[payload.questionId] = payload.isCorrect;
  }

  formatDateTime(date = new Date()) {
    const pad = (num: any) => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  showFinalResults() {
    this.stopTimer()
    this.showResults = true;



    const userData = localStorage.getItem("user")
    if (!userData) {
      return
    }

    let user
    try {
      user = JSON.parse(userData)
    } catch (error) {
      console.error("Ошибка парсинга данных:", error)
      return
    }


    const startDate = new Date();
    startDate.setSeconds(startDate.getSeconds() - (this.totalTime - this.remainingTime))

    const data = {
      id_student: user.id,
      date_begin: this.formatDateTime(startDate),
      date_finish: this.formatDateTime(),
      success_percent: this.results.percentCorrect
    }

    axios
      .post("/student-attempts", data)
      .then((response) => {
        console.log("попытка создана", response);
        const attempt = response.data.id
        this.questions.forEach(question => {
          const data = {
            id_student_attempt: attempt,
            id_question: question.id,
            statement: this.answers[question.id] ? 'succesfull' : 'failed',
          }
          axios
            .post("/student-attempt-questions", data)
            .then((response) => {
              console.log("ответ создан", response)
            })
            .catch((error) => {
              console.error("Ошибка!", error);
              ElMessage({
                message: "Ошибка сохранения!",
                type: "error",
              } as MessageParams);
            });

        })

        // this.answers[payload.questionId] = payload.isCorrect;
      })
      .catch((error) => {
        console.error("Ошибка!", error);
        ElMessage({
          message: "Ошибка сохранения!",
          type: "error",
        } as MessageParams);
      });

  }

  get results() {
    const totalQuestions = this.questions.length
    const answeredQuestions = Object.values(this.answers).filter(v => v !== null).length
    const correctAnswers = Object.values(this.answers).filter(Boolean).length
    const wrongAnswers = answeredQuestions - correctAnswers

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      wrongAnswers,
      unansweredQuestions: totalQuestions - answeredQuestions,
      percentCorrect: Math.floor(correctAnswers / totalQuestions * 100),
    }
  }

  scrollToQuestion(index: number) {
    const questionElement = document.getElementById(`question-${index}`)
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  getQuestionStatus(index: number): string {
    if (!this.showResults) {
      const question = this.questions[index];
      return this.answers[question.id] !== undefined && this.answers[question.id] !== null
        ? "answered"
        : "unanswered";
    }
    const question = this.questions[index]
    const answer = this.answers[question.id]

    if (answer === true) return "correct"
    if (answer === false) return "wrong"
    return "unanswered"
  }

  getQuestionStatusText(index: number): string {
    const status = this.getQuestionStatus(index)
    switch (status) {
      case "correct":
        return "✓ Правильно";
      case "wrong":
        return "✗ Неправильно";
      case "answered":
        return "Отвечен";
      default:
        return "Не отвечен";
    }
  }

  getTagType(percent: number) {
    if (percent >= 90) return 'success'
    if (percent >= 75) return 'primary'
    return 'danger'
  }




  private totalTime: number = 0;
  private remainingTime: number = 0;
  private timerInterval: number | null = null;

  get formattedTime(): string {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get progressPercentage(): number {
    if (this.totalTime === 0) return 0;
    return ((this.totalTime - this.remainingTime) / this.totalTime) * 100;
  }

  startTimer(): void {
    this.totalTime = this.questions.length * 60;
    this.remainingTime = this.totalTime;

    this.timerInterval = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
      } else {
        this.stopTimer();
        this.onTimeUp();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  onTimeUp(): void {
    console.log('Время вышло!');
    this.showFinalResults()
  }




  beforeUnmount(): void {
    this.stopTimer();
  }


}
export default TestingComponent;
</script>

<template>
  <div class="container">
    <main class="questions-main">
      <QuestionComponent v-for="(qData, index) in questions" :key="qData.id" :qData="qData" :index="index" :showResults="showResults" @answer-submitted="handleAnswerSubmitted" :id="`question-${index}`"></QuestionComponent>

      <div class="results-section" v-if="showResults">
        <h2>
          Результаты теста
          <el-tag :type="getTagType(results.percentCorrect)" effect="dark">
            {{ results.percentCorrect }}%
          </el-tag>
        </h2>
        <p>Всего вопросов: {{ results.totalQuestions }}</p>
        <p>Отвечено: {{ results.answeredQuestions }}</p>
        <p>Правильных ответов: {{ results.correctAnswers }}</p>
        <p>Неправильных ответов: {{ results.wrongAnswers }}</p>
        <p>Не отвечено: {{ results.unansweredQuestions }}</p>

        <div class="progress-container" v-if="results.totalQuestions > 0">
          <div class="progress-bar">
            <div class="progress-correct" :style="{ width: `${results.percentCorrect}%` }" :title="`Правильно: ${results.correctAnswers}`"></div>
            <div class="progress-wrong" :style="{ width: `${(results.wrongAnswers / results.totalQuestions) * 100}%` }" :title="`Неправильно: ${results.wrongAnswers}`"></div>
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
      <div class="timer-container">
        <div class="timer-display">
          <span class="timer-value">{{ formattedTime }}</span>
          <span class="timer-label">до завершения теста</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
      </div>

      <h3>Вопросы</h3>
      <div class="questions-sidebar-scroll">
        <div v-for="(qData, index) in questions" :key="`sidebar-${qData.id}`" class="sidebar-question" :class="getQuestionStatus(index)" @click="scrollToQuestion(index)" :title="getQuestionStatusText(index)">
          <span class="question-number">Вопрос {{ index + 1 }}
            <span class="question-status-badge">{{ getQuestionStatusText(index) }}</span>
          </span>
          <span class="question-preview">
            {{
              qData.content.description ||
              (qData.content.qDescription ? qData.content.qDescription[0] : "Нет описания")
            }}
          </span>
        </div>
      </div>

      <div class="sidebar-summary" v-if="showResults">
        <h4>Итого:
          <el-tag :type="getTagType(results.percentCorrect)" effect="dark">
            {{ results.percentCorrect }}%
          </el-tag>
        </h4>
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
  height: calc(100vh - 15px - 15px);
  display: grid;


  .questions-sidebar-scroll {
    overflow-x: hidden;
    overflow-y: auto;
  }
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
  align-self: flex-end;
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
  background-color: #4caf50;
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
  line-height: 1em;
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







.timer-container {
  text-align: center;
  margin: 20px 0;
}

.timer-display {
  margin-bottom: 10px;
}

.timer-value {
  font-size: 2em;
  font-weight: bold;
  color: #e74c3c;
}

.timer-label {
  display: block;
  color: #666;
  font-size: 0.9em;
}

.progress-bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e74c3c, #f39c12);
  transition: width 0.3s ease;
}
</style>
