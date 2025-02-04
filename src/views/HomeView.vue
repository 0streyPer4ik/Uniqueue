<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { questionStore } from "../stores/counter"
import QuestionComponent from "../components/Question.vue"
// import { getElement } from "element-plus/es/utils/index.mjs";

@Options({
  components: {
    QuestionComponent
  }
})
export default class HomeComponent extends Vue {
  // list = {
  //   a: "Вопрос номер 1",
  //   a1: "Вопрос номер 2",
  //   a2: "Вопрос номер 3",
  //   b: "Вопрос номер 4",
  // }

  qListStore = questionStore()
  get qList() {
    return this.qListStore.list
  }

  sel1 = 0

  selected = document.getElementById('selected')
}

</script>

<template>
  <main>
    <QuestionComponent
      v-for="(val, key) in qList"
      :key="key"
      :val="val"
    ></QuestionComponent>
    <div
      v-for="(val, key) in qList"
      :key="key"
    >
      <!-- {{ key }}  -->
      Вопрос № {{ key + 1 }}
      <div>{{ val.description }}</div>
      <div
        v-for="answer in val.answers"
        :key="answer"
      >
        <div v-on:click="() => {
          console.log(answer)
          // answer.style.background = 'gray'
        }">{{ answer }}</div>
      </div>

      <div
        v-for="answer in val.answers"
        :key="answer"
      >
      <input
        v-model="val.answer"
        type="radio"
        :value="answer"
        :id="answer"
        />
        <label
          :for="answer"
        >
        {{ answer }}
      </label>
    </div>
      <br>
    </div>
  </main>
</template>
