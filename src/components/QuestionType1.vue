<script lang="ts">
import { Options, Vue } from "vue-class-component";
import type { Question } from "@/interfaCES/QuestionInterface";

interface Answer {
  text: string
  isCorrect: boolean
}

interface QDataContent {
  description: string | null
  answers: Answer[]
}

interface QData {
  content: QDataContent | null
  answer: string | null
  answers: Answer[]
  correctAnswers: number[]
}

@Options({
  props: {
    qData: {
      type: Object as () => QData | undefined,
      required: false,
      default: () => ({
        content: { description: null, answers: [] },
        answer: null,
        answers: [],
        correctAnswers: [],
      }),
    },
  },
  emits: ['answer-submitted'],
  watch: {
    'qData.content.answers': {
      handler: 'shuffleAnswers',
      immediate: true
    },
    selectedAnswer: {
      handler: 'submitAnswer',
      immediate: false
    }
  }
})
export default class QuestionType1Component extends Vue {
  qData!: QData
  questions: Question[] = []
  currentQuestionIndex: number = 0
  selectedAnswer: number | null = null
  shuffledAnswers: Answer[] = []

  mounted() {
    this.shuffleAnswers()
  }

  shuffleAnswers() {
    if (this.qData && this.qData.content && this.qData.content.answers) {
      this.shuffledAnswers = [...this.qData.content.answers]
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    } else {
      this.shuffledAnswers = []
    }
  }

  submitAnswer() {
    if (this.selectedAnswer === null || !this.qData?.content) return

    const isCorrect = this.shuffledAnswers[this.selectedAnswer].isCorrect
    this.$emit('answer-submitted', isCorrect)
  }
}
</script>

<template>
  <div v-if="qData && qData.content" class="question-container">
    <div class="description">
      <pre class="question-text">{{ qData.content.description.trim() }}</pre>
    </div>
    <el-radio-group
      v-model="selectedAnswer"
      class="answers-group"
      size="large"
    >
      <el-radio-button
        v-for="(answer, index) in shuffledAnswers"
        :key="index"
        :label="index"
        class="answer-option"
      >
        <span class="answer-text">{{ answer.text }}</span>
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<style scoped>
  @media (min-width: 360px) and (max-width: 720px) {
    .question-text {
      font-size: 0.8em;
      margin-bottom: 20px;
    }

    .answers-group {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-left: 10px;
    }

    .answer-text {
      font-size: 0.7em;
      padding: 0;
    }
    .answer-option :deep(.el-radio-button__inner) {
    padding: 8px 10px;
    display: flex;
    right: 9px;
  }

  .question-container {
    margin-bottom: 30px;
  }
  }
</style>
