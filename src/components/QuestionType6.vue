<script lang="ts">
import { Options, Vue } from "vue-class-component"

////////////////////////
// ШЕСТОЙ ТИП ВОПРОСА //
////////////////////////

@Options({
  props: {
    qData: Object
  },
})
export default class QuestionType6Component extends Vue {
  qData!: QData
}
</script>

<template>
<div class="question6">
  <el-input
    v-model="qData.answersType6"
    style="width: 200px"
    placeholder="Введите ответ"
    clearable
  />
  </div>
</template>
