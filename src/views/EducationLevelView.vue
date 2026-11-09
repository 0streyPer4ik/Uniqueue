<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { SubjectsStore, QuestionStore, TeachersStore } from "../stores"
import type { SubjectInterface } from "@/interfaces/QuestionInterface"
import { ProfileStore } from "@/stores";
import axios from "axios"
import type { AxiosResponse } from "axios"

@Options({
})
class EducationLevelComponent extends Vue {
  subjectsStore = SubjectsStore()
  questionStore = QuestionStore()
  teachersStore = TeachersStore()
  id_level: number = 0
  studentData: any[] = []
  latestSubjectPercent: Record<number, number> = {}

  get subjectList() {
    return this.subjectsStore.getSubjects.filter(el => el.education_level == this.id_level)
  }

  getSubjectsByTeacher(teacher: number) {
    return this.subjectList.filter(el => el.teacher == teacher)
  }

  get teachers() {
    return this.teachersStore.getTeachers
  }





  handleSetSubject(subjectId: number) {
    this.$router.push({
      name: "show-subject",
      params: { id: subjectId }
    })
  }

  handleSubjectOpenPdf(subject: SubjectInterface) {
    window.open("/pdf/" + subject.education_level + "/" + subject.teacher + "/" + subject.subject_pdf, "_blank", "noreferrer");
  }

  getSuccessTagType(success: number | string): 'success' | 'warning' | 'danger' | 'info' {
    const normalized = typeof success === 'string' ? success.trim() : String(success)

    if (normalized === '-' || normalized === '') {
      return 'info'
    }

    const percent = parseFloat(normalized)
    if (isNaN(percent)) {
      return 'info'
    }

    if (percent >= 90) return 'success'
    if (percent >= 75) return 'warning'
    return 'danger'
  }

  get subjectIds(): number[] {
    const list = this.studentData || []

    if (this.subjectsStore.list.length === 0 || list.length === 0) {
      return []
    }

    const seenIds = new Set<number>()
    const subjects: number[] = []

    list.forEach(student => {
      const attempts = student.studentAttempts || []
      attempts.forEach((attempt: any) => {
        const questions = attempt.studentAttemptQuestions || []
        const firstQuestion = questions[0]

        if (!firstQuestion || seenIds.has(firstQuestion.id_question)) {
          return
        }
        seenIds.add(firstQuestion.id_question)

        const question = this.questionStore.getQuestion(firstQuestion.id_question)
        if (question?.value?.id_subject !== undefined) {
          const subjectId = Number(question.value.id_subject)
          if (!isNaN(subjectId) && !subjects.includes(subjectId)) {
            subjects.push(subjectId)
          }
        }
      })
    })

    return subjects
  }

  /**
   * Обновляет latestSubjectPercent: для каждого предмета берёт процент из последней попытки.
   * Вызывай этот метод после того, как studentsGroupData заполнится данными.
   */
  updateLatestPercent(): void {
    const result: Record<number, number> = {}
    const now = new Date()
    const monthAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000)
    const list = this.studentData || []
    console.log(list)

    list.forEach(student => {
      const attempts = student.studentAttempts || []

      attempts.forEach((attempt: any) => {
        const attemptDate = new Date(attempt.date_begin)
        if (attemptDate.getTime() < monthAgo) {
          return
        }
        const questions = attempt.studentAttemptQuestions || []
        const firstQuestion = questions[0]
        if (!firstQuestion) return

        const question = this.questionStore.getQuestion(firstQuestion.id_question)
        if (!question?.value?.id_subject) return

        const subjectId = Number(question.value.id_subject)
        if (isNaN(subjectId)) return

        const percentRaw = attempt.success_percent
        // На всякий случай нормализуем: если строка — парсим, если уже число — оставляем
        const percent = typeof percentRaw === 'string' ? Number(percentRaw) : Number(percentRaw)

        if (!isNaN(percent)) {
          // Перезаписываем: в конце останется процент из самой последней попытки по этому предмету
          result[subjectId] = percent
        }
      })
    })

    this.latestSubjectPercent = result
  }

  async mounted() {
    this.id_level = parseInt(this.$route.params.id as string)
    try {
      const profileStore = ProfileStore()
      const user = profileStore.getUser
      if (!user) {
        return
      }
      const response: AxiosResponse<any> = await axios.get('/analytic/student-summary', {
        params: { id: user.id }
      })
      console.log(response.data)
      this.studentData = response.data
      this.updateLatestPercent()
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error)
    }
  }


}
export default EducationLevelComponent;
</script>

<template>
  <div class="container">
    <h1 v-if="id_level == 1">Бакалавриат</h1>
    <h1 v-else>Магистратура</h1>
    <br />
    Начать тестирование по
    <div class="teachers-subjects-list">
      <div v-for="teacher in teachers" :key="teacher.teacher_id" class="teacher-card">
        <div v-if="getSubjectsByTeacher(teacher.teacher_id).length > 0" class="subjects-list">
          <h2 class="teacher-name">{{ teacher.f }} {{ teacher.i }} {{ teacher.o }} </h2>
          <el-button-group v-for="obj in getSubjectsByTeacher(teacher.teacher_id)" :key="obj.id">
            <el-button @click="handleSetSubject(obj.id)">
              <div class="name_short">{{ obj.name_short }}</div>
              <div class="name_subject">{{ obj.name_subject }}</div>
            </el-button>
            <el-button :type="getSuccessTagType(latestSubjectPercent[obj.id] ?? 0)" plain>
              {{ latestSubjectPercent[obj.id] ?? 0 }}%
            </el-button>
            <el-button v-if="obj.subject_pdf" @click="handleSubjectOpenPdf(obj)" type="warning" class="striped-button diagonal">
              <el-icon>
                <Document />
              </el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.teacher-name {
  margin-top: 20px;
}

.el-button-group {
  margin-right: 1em;
}

.diagonal {
  background: repeating-linear-gradient(45deg,
      #409eff,
      #409eff 10px,
      #66b1ff 10px,
      #66b1ff 20px);
  color: white;
  border: none;
}

.name_subject {
  margin-left: 50px;
  display: none;
}

@media (max-width: 1024px) {
  .el-button-group {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    max-width: 800px;
    margin-right: 1em;
    margin-top: 1em;
  }

  .el-button-group .el-button:nth-child(1) {
    flex-grow: 1;
    min-width: 0;
  }

  .el-button-group .el-button:nth-child(2) {
    justify-content: center;
    width: 45px;
  }

  .el-button {
    justify-content: flex-start;
    padding: 0;
  }

  .el-button>span {
    display: flex;
    justify-content: flex-start;
    width: 100%;
    overflow: hidden;
  }

  .el-button .name_short {
    flex: none;
    min-width: 150px;
  }

  .el-button .name_subject {
    flex: 1;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
