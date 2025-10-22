<script setup lang="ts">
import { RouterView } from "vue-router"
import { questionStore } from "./stores/counter"
import { onMounted } from "vue"
import axios from 'axios'
import type { AxiosResponse } from 'axios'
import type { Question } from "@/interfaces/QuestionInterface"

onMounted(() => {
  const qListStore = questionStore();
  axios.get<Question[]>('/questions?pagination=false')
    .then((response: AxiosResponse<Question[]>) => {
      if (!response.data) {
        console.error('Response data is empty or undefined');
        return;
      }

      const questions = response.data.map((question, index) => {

        try {
          if (typeof question.content === 'string') {
            try {
              // contentObj = JSON.parse(question.content);
              //console.log(`Parsed content for question ${index + 1}:`, contentObj);
            } catch (parseError) {
              console.error(`Failed to parse content for question ${index + 1}:`, question.content, parseError);
              // contentObj = {};
            }
          } else if (typeof question.content === 'object' && question.content !== null) {
            // contentObj = question.content;
          } else {
            console.warn(`Question ${index + 1} content is not an object or string`, question.content);
            // contentObj = {};
          }

          // const description = contentObj.description || '';
          // //console.log(`Question ${index + 1} description:`, description);

          // let correctAnswer: string[] = [];

          // if ('answers' in contentObj && Array.isArray(contentObj.answers)) {
          //   //console.log(`Question ${index + 1} has answers property`);
          //   const answers = contentObj.answers;

          //   //console.log(`Question ${index + 1} answers array:`, answers);
          //   correctAnswer = answers
          //   .filter((answer: { isCorrect?: boolean; text?: string }) => {
          //     const isCorrect = answer?.isCorrect;
          //     //console.log(`Answer ${answer?.text} isCorrect:`, isCorrect);
          //     return isCorrect;
          //   })
          //   .map((answer: { text?: string }) => {
          //     const text = answer?.text || '';
          //     //console.log(`Answer text:`, text);
          //     return text;
          //   })
          //   .filter((text: string) => text !== '');
          // } else {
          //  // console.warn(`Question ${index + 1} has no valid answers property`);
          // }

          //console.log(`Question ${index + 1} correct answers:`, correctAnswer);

          const processedQuestion = {
            ...question,
            content: typeof question.content === 'string' ? JSON.parse(question.content) : question.content
          };

         // console.log(`Processed question ${index + 1}:`, processedQuestion);
          return processedQuestion;
        } catch (error) {
          console.error(`Error processing question ${index + 1}:`, question, error);
          return {
            ...question,
            content: {
              qDescription: ['Ошибка загрузки вопроса'],
              correctAnswer: []
            }
          };
        }
      });

      //console.log('All questions processed:', questions);
      qListStore.setQuestions(questions);
      //console.log('Questions stored successfully');
    })
    //.catch(error => {
      //console.error('There was an error fetching questions!', error);
      //console.group('Error details');
      //console.error('Error message:', error.message);
      //console.error('Error response:', error.response);
      //console.error('Error config:', error.config);
     // console.groupEnd();
    //});
});
</script>

<template>
  <RouterView />
</template>

<style type="scss">
@import "./assets/index.scss";
</style>
