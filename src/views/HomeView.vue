<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { QuestionStore, SubjectsStore } from "../stores/counter"
import QuestionComponent from "../components/Question.vue"

@Options({
  components: {
    QuestionComponent,
  },
})
class HomeComponent extends Vue {
  qListStore = QuestionStore()
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

  handleAnswerSubmitted(payload: {
    questionId: number;
    isCorrect: boolean | null;
    questionIndex: number;
  }) {
    this.answers[payload.questionId] = payload.isCorrect;
  }

  handleSetEducationLevel(educationLevelId: number) {
    this.$router.push({
      name: "show-education-level",
      params: { id: educationLevelId }
    })
  }

  showFinalResults() {
    this.showResults = true;
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
      unansweredQuestions: totalQuestions - answeredQuestions,
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
      const question = this.qList[index];
      return this.answers[question.id] !== undefined && this.answers[question.id] !== null
        ? "answered"
        : "unanswered";
    }
    const question = this.qList[index]
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
}
export default HomeComponent;
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


@media (min-width: 360px) and (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}
</style>
