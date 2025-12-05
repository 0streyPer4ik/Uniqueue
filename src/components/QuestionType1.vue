<script lang="ts">
import { Options, Vue } from "vue-class-component";

interface Answer {
  text: string
  isCorrect: boolean
}

interface QDataContent {
  description?: string
  answers?: Answer[]
}

interface QData {
  id: number
  content: QDataContent
  showResults?: boolean
}

@Options({
  props: {
    qData: {
      type: Object as () => QData,
      required: true
    }
  },
  emits: ['answer-submitted'],
  watch: {
    'qData.content.answers': {
      handler: 'shuffleAnswers',
      immediate: true
    }
  }
})
class QuestionType1Component extends Vue {
  qData!: QData
  selectedAnswer: number | null = null
  shuffledAnswers: Answer[] = []

  mounted() {
    this.shuffleAnswers()
  }

  shuffleAnswers() {
    if (this.qData.content?.answers) {
      this.shuffledAnswers = [...this.qData.content.answers]
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    }
  }

  submitAnswer() {
    if (this.selectedAnswer === null || !this.qData.content?.answers) return

    const isCorrect = this.shuffledAnswers[this.selectedAnswer]?.isCorrect ?? false
    this.$emit('answer-submitted', isCorrect)
  }
}
export default QuestionType1Component
</script>

<template>
  <div v-if="qData.content" class="question-container">
    <div class="description">
      <pre class="question-text">{{ qData.content.description?.trim() || '' }}</pre>
    </div>
    <el-radio-group
      v-model="selectedAnswer"
      class="answers-group"
      size="large"
      @change="submitAnswer"
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
.question-container {
  max-width: 800px;
  width: 100%;
  margin: 0 0 30px 0;
  padding: 0;
  box-sizing: border-box;
}

.description {
  margin-bottom: 25px;
}

.question-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  font-family: inherit;
  font-size: 1.1em;
  line-height: 1.5;
  margin: 0;
}

.answers-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.answer-option {
  width: 100%;
}

.answer-option :deep(.el-radio-button__inner) {
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.4;
}

.answer-text {
  display: inline-block;
  width: 100%;
  word-wrap: break-word;
  word-break: break-word;
}

@media (min-width: 360px) and (max-width: 720px) {
  .question-container {
    max-width: 100%;
    padding: 0;
    margin-bottom: 25px;
  }

  .question-text {
    font-size: 0.95em;
    padding: 12px;
    margin-bottom: 20px;
  }

  .answers-group {
    margin-left: 0;
    gap: 8px;
  }

  .answer-text {
    font-size: 0.9em;
  }

  .answer-option :deep(.el-radio-button__inner) {
    padding: 10px 12px;
    font-size: 0.9em;
  }
}

@media (min-width: 721px) and (max-width: 1024px) {
  .question-container {
    max-width: 100%;
  }
}
</style>
