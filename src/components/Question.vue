<script lang="ts">
import { Options, Vue } from "vue-class-component";
import QuestionType1Component from "./QuestionType1.vue"
import QuestionType2Component from "./QuestionType2.vue"
import QuestionType3Component from "./QuestionType3.vue"
import QuestionType4Component from "./QuestionType4.vue"
import QuestionType5Component from "./QuestionType5.vue"
import QuestionType6Component from "./QuestionType6.vue"

@Options({
  props: {
    qData: Object,
    index: Number,
    showResults: Boolean
  },
  components: {
    QuestionType1Component,
    QuestionType2Component,
    QuestionType3Component,
    QuestionType4Component,
    QuestionType5Component,
    QuestionType6Component,
  },
  emits: ['answer-submitted'],
})
export default class QuestionComponent extends Vue {
  qData!: any
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
</script>

<template>
  <div class="question" :id="`question-${index}`">
    <div v-if="qData.id_question_type == 1">
      <span class="text">Вопрос № {{ index + 1 }}</span><br />
      <div class="text_question">
        <span>Выберите один правильный вариант из предложенных</span>
      </div>
      <div>
        <QuestionType1Component
          :qData="{ content: qData.content, showResults, id: qData.id }"
          @answer-submitted="handleAnswer"
        />
      </div>
    </div>
    <div
    v-else-if="qData.id_question_type == 2"
    class="question_type_2"
    >
    <span class="text">Вопрос № {{ index + 1 }}</span><br />
    <span class="text_question">Соотнесите термин и его определение</span>
    <QuestionType2Component
    :qData="qData"
    @answer-submitted="handleAnswer" />
  </div>

  <div
  v-else-if="qData.id_question_type == 3"
  class="question_type_3"
  >
  <span class="text">Вопрос № {{ index + 1 }}</span><br />
  <span class="text_question question3_text">Расположите в правильной последовательности</span>
  <question-type-3-component
  :qData="qData"
  @answer-submitted="handleAnswer" />
  </div>

  <div
  v-else-if="qData.id_question_type == 4"
  class="question_type_4"
  >
  <span class="text">Вопрос № {{ index + 1 }}</span><br />
  <span class="text_question">Напишите правильный вариант ответа</span>
  <QuestionType4Component
  :qData="qData"
  @answer-submitted="handleAnswer" />

</div>

    <div
      v-else-if="qData.id_question_type == 5"
      class="question_type_5"
    >
    <div class="qustion5">
      <span class="text">Вопрос № {{ index + 1 }}</span><br />
      <span class="text_question">Напишите правильный вариант ответа</span>
      <QuestionType5Component
        :qData="qData"
        @answer-submitted="handleAnswer" />
    </div>
  </div>
  <!--
    <div
      v-else-if="qData.id_question_type == 6"
    >
    <span class="text">Вопрос № 6</span><br />
    <span class="text_question">Напишите правильный вариант ответа</span>
    <QuestionType6Component :qData="qData" />
  </div> -->
  </div>
</template>

<style scoped>

.text {
  margin-left: 0;
}

.question {
  margin: 0  0 33px 0;
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
