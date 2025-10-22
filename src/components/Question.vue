<script lang="ts">
import { Options, Vue } from "vue-class-component";

import QuestionType1Component from "./QuestionType1.vue"
import QuestionType2Component from "./QuestionType2.vue"
import QuestionType3Component from "./QuestionType3.vue"
import QuestionType4Component from "./QuestionType4.vue"
import QuestionType5Component from "./QuestionType5.vue"

interface QuestionContent {
  description?: string;
  qDescription?: string[];
  answersType2?: Array<{ text: string, matches: string }>;
  answersType3?: Array<{ text: string, correctPosition: number }>;
  correctAnswer?: string;
}

interface QuestionData {
  id: number
  id_question_type: number
  content: QuestionContent
  answer?: number | number[] | string | string[] | boolean | null
  correctAnswers?: (number | string)[]
}



@Options({
  props: {
    qData: {
      type: Object as () => QuestionData,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    showResults: {
      type: Boolean,
      default: false
    }
  },
components: {
  QuestionType1Component,
  QuestionType2Component,
  QuestionType3Component,
  QuestionType4Component,
  QuestionType5Component,
},
  emits: ['answer-submitted'],
})
class QuestionComponent extends Vue {
  qData!: QuestionData
  index!: number
  showResults!: boolean

  handleAnswer(isCorrect: boolean) {
    this.$emit('answer-submitted', {
      questionId: this.qData.id,
      isCorrect,
      questionIndex: this.index
    });
  }
}
export default QuestionComponent
</script>

<template>
  <div class="question" :class="{ 'disabled-div': showResults }" :id="`question-${index}`">
    <div v-if="qData.id_question_type == 1">
        <span class="text">Вопрос № {{ index + 1 }}</span>
        <span class="text_question">Выберите один правильный вариант из предложенных</span>
        <QuestionType1Component
          :qData="{ content: qData.content, showResults, id: qData.id }"
          @answer-submitted="handleAnswer"
        />
    </div>
    <div v-else-if="qData.id_question_type == 2" class="question_type_2">
      <span class="text">Вопрос № {{ index + 1 }}</span>
      <span class="text_question">Соотнесите термин и его определение</span>
      <QuestionType2Component
        :qData="qData"
        @answer-submitted="handleAnswer" />
    </div>

    <div v-else-if="qData.id_question_type == 3" class="question_type_3">
      <span class="text">Вопрос № {{ index + 1 }}</span>
      <span class="text_question question3_text">Расположите в правильной последовательности</span>
      <question-type-3-component
        :qData="qData"
        @answer-submitted="handleAnswer" />
    </div>

    <div v-else-if="qData.id_question_type == 4" class="question_type_4">
      <span class="text">Вопрос № {{ index + 1 }}</span>
      <span class="text_question">Напишите правильный вариант ответа</span>
      <QuestionType4Component
        :qData="qData"
        @answer-submitted="handleAnswer" />
    </div>

    <div v-else-if="qData.id_question_type == 5" class="question_type_5">
      <div class="qustion5">
        <span class="text">Вопрос № {{ index + 1 }}</span>
        <span class="text_question">Напишите правильный вариант ответа</span>
        <QuestionType5Component
          :qData="qData"
          @answer-submitted="handleAnswer" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.text {
  margin-left: 0;
  user-select: none;
}

.question {
  margin: 0  0 33px 0;
  user-select: none;
}

.text_question {
  padding-left: 20px;
  font-style: italic;
}

.disabled-div {
  pointer-events: none;
  opacity: 0.6;
}

@media (min-width: 360px) and (max-width: 720px) {
  .text_question {
    width: 300px;
    white-space: break-spaces;
    margin: 10px 0;
  }

  .text {
    margin: 10px 0;
  }

  .question {
    padding: 0;
  }
}
</style>
