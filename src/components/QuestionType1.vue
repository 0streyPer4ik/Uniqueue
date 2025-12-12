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
  selectedAnswers: number[] = []
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

  get hasMultipleCorrectAnswers(): boolean {
    if (!this.qData.content?.answers) return false
    const correctCount = this.qData.content.answers.filter(answer => answer.isCorrect).length
    return correctCount > 1
  }

  toggleAnswer(index: number) {
    const answerIndex = this.selectedAnswers.indexOf(index)
    if (answerIndex === -1) {
      this.selectedAnswers.push(index)
    } else {
      this.selectedAnswers.splice(answerIndex, 1)
    }

    this.submitAnswer()
  }

  submitAnswer() {
    if (!this.qData.content?.answers) return

    const correctIndices = this.shuffledAnswers
      .map((answer, idx) => ({ answer, idx }))
      .filter(item => item.answer.isCorrect)
      .map(item => item.idx)

    const incorrectIndices = this.shuffledAnswers
      .map((answer, idx) => ({ answer, idx }))
      .filter(item => !item.answer.isCorrect)
      .map(item => item.idx)

    const allCorrectSelected = correctIndices.every(idx =>
      this.selectedAnswers.includes(idx)
    )

    const noIncorrectSelected = incorrectIndices.every(idx =>
      !this.selectedAnswers.includes(idx)
    )

    const isCorrect = allCorrectSelected && noIncorrectSelected
    this.$emit('answer-submitted', isCorrect)
  }

  isAnswerSelected(index: number): boolean {
    return this.selectedAnswers.includes(index)
  }
}
export default QuestionType1Component
</script>

<template>
  <div v-if="qData.content" class="question-container">
    <div class="description">
      <pre class="question-text">{{ qData.content.description?.trim() || '' }}</pre>
    </div>

    <div class="answers-group">
      <div
        v-for="(answer, index) in shuffledAnswers"
        :key="index"
        class="answer-option"
        :class="{ 'selected': isAnswerSelected(index) }"
        @click="toggleAnswer(index)"
      >
        <div class="selector">
          <div class="checkbox" :class="{ 'checked': isAnswerSelected(index) }">
            <span v-if="isAnswerSelected(index)" class="checkmark">✓</span>
          </div>
          <span class="answer-text">{{ answer.text }}</span>
        </div>
      </div>
    </div>
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
  padding: 12px 16px;
  text-align: left;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.4;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
  box-sizing: border-box;
  color: #606266;
}

.answer-option:hover {
  border-color: #C0C4CC;
  color: #409EFF;
}

.answer-option.selected {
  background-color: #409EFF;
  border-color: #409EFF;
  color: white;
}

.answer-option.selected:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.selector {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.checkbox {
  display: none;
}

.answer-option.selected .checkbox {
  background-color: white;
  border-color: white;
}

.answer-option:hover .checkbox {
  border-color: #409EFF;
}

.checkbox.checked {
  background-color: #409EFF;
  border-color: #409EFF;
}

.checkmark {
  color: #409EFF;
  font-size: 14px;
  font-weight: bold;
}

.answer-option.selected .checkmark {
  color: #409EFF;
}

.answer-text {
  display: inline-block;
  width: 100%;
  word-wrap: break-word;
  word-break: break-word;
  flex: 1;
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

  .answer-option {
    padding: 10px 12px;
    font-size: 0.9em;
  }

  .checkbox {
    width: 18px;
    height: 18px;
    min-width: 18px;
  }

  .checkmark {
    font-size: 12px;
  }
}

@media (min-width: 721px) and (max-width: 1024px) {
  .question-container {
    max-width: 100%;
  }
}
</style>
