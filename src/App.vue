<script setup lang="ts">
import { RouterView } from "vue-router"
import { QuestionStore, SubjectsStore, TeachersStore, GroupsStore } from "./stores/counter"
import { onMounted } from "vue"
import axios from 'axios'
import type { AxiosResponse } from 'axios'
import type { Question, SubjectInterface, TeacherInterface, GroupInterface } from "@/interfaces/QuestionInterface"
import LogInOutButton from "@/components/LogInOutButton.vue"

onMounted(() => {
  const qListStore = QuestionStore();
  const subjectStore = SubjectsStore();
  const teacherStore = TeachersStore();
  const groupStore = GroupsStore();


  const urlGroups = '/academic-groups?pagination=false'
  axios.get<GroupInterface[]>(urlGroups)
    .then((response: AxiosResponse<GroupInterface[]>) => {
      if (!response.data) {
        console.error('Response data is empty or undefined');
        return;
      }
      const groups = [...response.data]
      groupStore.setGroups(groups)
    })

  const urlTeachers = '/teachers?pagination=false'
  axios.get<TeacherInterface[]>(urlTeachers)
    .then((response: AxiosResponse<TeacherInterface[]>) => {
      if (!response.data) {
        console.error('Response data is empty or undefined');
        return;
      }
      const teachers = [...response.data]
      teacherStore.setTeachers(teachers)
    })


  const urlSubjects = '/subjects?pagination=false&filter[enabled]=1'
  axios.get<SubjectInterface[]>(urlSubjects)
    .then((response: AxiosResponse<SubjectInterface[]>) => {
      if (!response.data) {
        console.error('Response data is empty or undefined')
        return
      }
      const subjects = [...response.data]
      subjects.forEach(subject => { if (subject.teacher == null) subject.teacher = 0 })
      subjectStore.setSubjects(subjects)
    })

  axios.get<Question[]>('/questions?pagination=false')
    .then((response: AxiosResponse<Question[]>) => {
      if (!response.data) {
        console.error('Response data is empty or undefined')
        return
      }

      const questions = response.data.map((question, index) => {
        try {
          const processedQuestion = {
            ...question,
            content: typeof question.content === 'string' ? JSON.parse(question.content) : question.content
          }
          return processedQuestion
        } catch (error) {
          console.error(`Error processing question ${index + 1}:`, question, error);
          return {
            ...question,
            content: {
              qDescription: ['Ошибка загрузки вопроса'],
              correctAnswer: []
            }
          }
        }
      })

      qListStore.setQuestions(questions);
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
  <LogInOutButton />
</template>

<style type="scss">
@import "./assets/index.scss";
</style>
