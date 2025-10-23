<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { ElInput } from 'element-plus'

interface QDataContent {
  description: string
  correctAnswer?: string
}

interface QData {
  id: number
  description: string
  correctAnswer?: string
  correctAnswers?: (number | string)[]
  content: QDataContent
  id_question_type: number
  userAnswer: string | null | undefined
}

@Options({
  props: {
    qData: {
      type: Object as () => QData,
      required: true,
    },
  },
  components: {
    ElInput,
  },
  emits: ['answer-submitted'],
  watch: {
    'qData.userAnswer': {
      handler: 'checkAnswer',
      immediate: false
    }
  }
})
class QuestionType4Component extends Vue {
  qData!: QData;
  inputWidth = '200px';
  hasUserInteracted = false;

  mounted() {
    this.$nextTick(() => {
      const correctAnswer = this.getCorrectAnswer();
      const length = correctAnswer.length;
      this.inputWidth = `${Math.min(300, Math.max(150, length * 8))}px`;
    });
  }

  getCorrectAnswer(): string {
    // Проверяем разные возможные места хранения правильного ответа
    if (this.qData.content?.correctAnswer) {
      return this.qData.content.correctAnswer;
    }
    if (this.qData.correctAnswer) {
      return this.qData.correctAnswer;
    }
    if (this.qData.correctAnswers && this.qData.correctAnswers.length > 0) {
      return String(this.qData.correctAnswers[0]);
    }
    return '';
  }

  checkAnswer(newVal: string | null | undefined, oldVal: string | null | undefined) {
    if (oldVal === undefined && newVal === null) return;

    this.hasUserInteracted = true;

    if (newVal?.trim()) {
      const correctAnswer = this.getCorrectAnswer();
      const isCorrect = newVal.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      this.$emit('answer-submitted', isCorrect);
    } else {
      this.$emit('answer-submitted', null);
    }
  }
}
export default QuestionType4Component
</script>

<template>
  <div class="question-container">
    <div class="question-text">
      {{ qData.content?.description?.replace('—', '') ?? '' }}
      <span class="input-wrapper">
        <el-input
          v-model="qData.userAnswer"
          :style="{ width: inputWidth }"
          placeholder="Введите ответ"
          clearable
          class="answer-input"
          @input="hasUserInteracted = true"
        />
      </span>
    </div>
  </div>
</template>

<style scoped>
.question-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: auto;
  margin: 10px 0 0 0;
}

.question-text {
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.9;
  font-size: 20px;
  color: white;
}

.input-wrapper {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.el-input {
  width: 200px !important;
}

@media (min-width: 320px) and (max-width: 768px) {
  .input-wrapper {
    display: flex;
    margin: 8px 0;
    width: 100%;
  }

  .answer-input {
    width: 100% !important;
  }

  .question-text {
    font-size: 1.1em;
    margin: 4px 0;
  }

  .question-container {
    margin-left: 0;
  }
}
</style>
