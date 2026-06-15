<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { QuestionStore, SubjectsStore } from "../stores/counter"
import TestingComponent from "../components/Testing.vue"

@Options({
  components: {
    TestingComponent,
  },
})
class SubjectComponent extends Vue {
  qListStore = QuestionStore()
  subjectsStore = SubjectsStore()
  answers: Record<number, boolean | null> = {}
  showResults = false
  id_subject = 0

  get qList() {
    return this.qListStore.list.filter(el => el.id_subject == this.id_subject)
  }

  mounted() {
    this.id_subject = parseInt(this.$route.params.id as string)
  }
}
export default SubjectComponent;
</script>

<template>
  <div class="container">
    <TestingComponent :questions="qList" />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}


@media (min-width: 360px) and (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}
</style>
