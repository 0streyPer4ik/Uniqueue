<script setup lang="ts">
import { RouterView } from "vue-router"
import { questionStore } from "./stores/counter"
import { onMounted } from "vue"
import axios, { AxiosResponse } from 'axios'
import type { Question } from "@/interfaCES/QuestionInterface"
//////////////////////
// ХРАНИЛИЩЕ ДАННЫХ //
//////////////////////

onMounted(() => {
  const qListStore = questionStore();
  axios.get<Question[]>('http://test.local/questions?pagination=false')
      .then((response: AxiosResponse<Question[]>) => {
          const questions = response.data
          questions.forEach(obj => {
              obj.content = JSON.parse(obj.content)
            })
            qListStore.setQuestions(questions)
      })
      .catch(error => {
          console.error('There was an error!', error)
      })
})
</script>

<template>
  <RouterView />
</template>

<style type="scss">
@import "./assets/index.scss";
</style>
