<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { ElInput } from 'element-plus'

interface QDataContent {
  description?: string
  correctAnswer: string[]
}

interface QData {
  id: number
  description?: string
  correctAnswer: string[]
  content: QDataContent
  id_question_type: number
  userAnswer: string | null | undefined
}

const props = defineProps<{
  qData: QData
}>()

const emit = defineEmits<{
  (e: 'update:userAnswer', value: string | null): void
  (e: 'answer-submitted', value: boolean | null): void
}>()

const inputWidth = ref('200px')
const hasUserInteracted = ref(false)
const localUserAnswer = ref(props.qData.userAnswer)

const checkAnswer = (newVal: string | null | undefined, oldVal: string | null | undefined) => {
  if (oldVal === undefined && newVal === null) return

  hasUserInteracted.value = true
  emit('update:userAnswer', newVal || null)

  if (newVal?.trim()) {
    const userAnswer = newVal.toLowerCase().trim()
    const isCorrect = props.qData.content.correctAnswer.some(
      ans => ans.toLowerCase().trim() === userAnswer
    )
    emit('answer-submitted', isCorrect)
  } else {
    emit('answer-submitted', null)
  }
}

watch(localUserAnswer, checkAnswer)
watch(() => props.qData.userAnswer, (val) => {
  localUserAnswer.value = val
})

onMounted(() => {
  nextTick(() => {
    const maxLength = Math.max(...props.qData.content.correctAnswer.map(a => a.length))
    inputWidth.value = `${Math.min(300, Math.max(150, maxLength * 8))}px`
  })
})
</script>

<script lang="ts">
export default {
  name: 'QuestionType5Component'
}
</script>

<template>
  <div class="question-container">
    <div class="question-text">
      <template v-if="qData.content.description">
        <template v-for="(part, index) in qData.content.description.split(/(_{5,})/)" :key="index">
          <ElInput
            v-if="part.match(/_{5,}/)"
            v-model="localUserAnswer"
            :style="{ width: inputWidth }"
            placeholder="Введите ответ"
            clearable
            class="inline-input"
            @input="hasUserInteracted = true"
          />
          <span v-else>{{ part }}</span>
        </template>
      </template>
      <span v-else>Описание вопроса отсутствует</span>
    </div>
  </div>
</template>

<style scoped>
.question-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
  margin: 10px 0 0 0;
}

.question-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.8;
  font-size: 20px;
  color: white;
}

.inline-input {
  display: inline-flex;
  vertical-align: middle;
  margin: 0 4px;
}

@media (min-width: 320px) and (max-width: 768px) {
  .inline-input {
    width: 100% !important;
    margin: 4px 0;
    display: block;
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
