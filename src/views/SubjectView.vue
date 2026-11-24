<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { QuestionStore, SubjectsStore } from "../stores"
import TestingComponent from "../components/Testing.vue"
import type { QuestionInterface } from "@/interfaces/QuestionInterface.ts"

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

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
  id_subjects: number[] = []

  get qList() {
    const selected = this.qListStore.list.filter(el => this.id_subjects.includes(el.id_subject))

    if (this.id_subjects.length === 1) return selected

    const targetTotal = Math.round(selected.length / this.id_subjects.length)

    const bySubjectType = new Map<string, QuestionInterface[]>()
    for (const q of selected) {
      const key = `${q.id_subject}_${q.id_question_type}`
      const bucket = bySubjectType.get(key)
      if (bucket) bucket.push(q)
      else bySubjectType.set(key, [q])
    }

    const pools = [...bySubjectType.values()].map(pool => shuffle(pool))
    const result: QuestionInterface[] = []
    let idx = 0
    while (result.length < targetTotal && pools.some(p => p.length > 0)) {
      const pool = pools[idx % pools.length]
      if (pool.length > 0) {
        result.push(pool.pop() as QuestionInterface)
      }
      idx++
    }

    return result
  }

  mounted() {
    this.id_subjects = (this.$route.params.id as string).split(',').map(s => parseInt(s)).filter(n => !isNaN(n))
  }
}
export default SubjectComponent;
</script>

<template>
  <div class="container">
    <TestingComponent :id_subjects="id_subjects" :questions="qList" />
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
