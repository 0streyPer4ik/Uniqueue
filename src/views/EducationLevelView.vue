<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { SubjectsStore, TeachersStore } from "../stores/counter"

@Options({
})
class EducationLevelComponent extends Vue {
  subjectsStore = SubjectsStore()
  teachersStore = TeachersStore()
  id_level: number = 0

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

  handleSubjectOpenPdf(link: string) {
    window.open("/pdf/" + link, "_blank", "noreferrer");
  }

  mounted() {
    this.id_level = parseInt(this.$route.params.id as string)
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
              {{ obj.name_short }}
            </el-button>
            <el-button v-if="obj.subject_pdf" @click="handleSubjectOpenPdf(obj.subject_pdf)" type="warning" class="striped-button diagonal">
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
</style>
