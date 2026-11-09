<script setup lang="ts">
import { ref, onMounted, computed, watch, reactive } from "vue"
import { useRoute, useRouter } from "vue-router"
import type { MessageParams } from "element-plus"
import { GroupsStore, QuestionStore, SubjectsStore, TeachersStore } from "../stores"
import { ElTable, ElTableColumn, ElMessage } from "element-plus"
import axios from "axios"

import type { StudentInterface, StudentAttemptInterface, GroupInterface, TeacherInterface } from '../interfaces/QuestionInterface'

const route = useRoute()
const router = useRouter()

const questionStore = QuestionStore()
const subjectStore = SubjectsStore()
const groupStore = GroupsStore()
const teacherStore = TeachersStore()

const groupId = ref<number | null>(null)
const dates = ref(["2026-01-01", "2030-01-01"])
const calculationMethod = ref("bestScore")
const selectedStudentId = ref<number>(0)

interface StudentsDataInterface {
  list: StudentInterface[]
  date: Date
  loading: boolean
}

const studentsGroupsData: Record<number, StudentsDataInterface> = reactive({})
const studentsGroupData = computed((): StudentInterface[] => {
  if (groupId.value === null || !studentsGroupsData[groupId.value]) {
    return []
  }
  return studentsGroupsData[groupId.value].list.map(student => {
    return {
      ...student,
      studentAttempts: student.studentAttempts.filter(attempt => {
        const attemptDate = attempt.date_finish.split(' ')[0]
        const startDate = dates.value[0]
        const endDate = dates.value[1]
        console.log(startDate, "\n", attemptDate, "\n", endDate, "\n", "\n")
        return attemptDate >= startDate && attemptDate <= endDate
      })
    }
  })
})

const groupName = computed((): string => {
  if (groupStore.list.length === 0) {
    return String(groupId.value)
  }
  return groupStore.list.find(group => group.academicGroup_id === groupId.value)?.name || String(groupId.value)
})


const groupedAndSortedGroups = computed(() => {
  const groupsMap: Record<string, GroupInterface[]> = {
    "очная": [],
    "заочная": [],
  }
  groupStore.list.forEach(group => {
    const mode = group.educationMode
    if (!groupsMap[mode]) {
      groupsMap[mode] = []
    }
    groupsMap[mode].push(group)
  })

  Object.keys(groupsMap).forEach(mode => {
    groupsMap[mode].sort((a, b) => a.academicGroup_year - b.academicGroup_year)
  })


  return Object.keys(groupsMap).map(mode => ({
    educationMode: mode,
    groups: groupsMap[mode]
  }))
})

const subjectIds = computed((): Array<number> => {
  if (questionStore.list.length === 0 || subjectStore.list.length === 0 || studentsGroupData.value.length === 0) {
    return []
  }

  const seenIds = new Set<number>()
  const subjects: Array<number> = []

  studentsGroupData.value.forEach(student => {
    student.studentAttempts.forEach((attempt: any) => {
      const firstQuestion = attempt.studentAttemptQuestions[0]
      if (!firstQuestion || seenIds.has(firstQuestion.id_question)) {
        return
      }
      seenIds.add(firstQuestion.id_question)
      const question = questionStore.getQuestion(firstQuestion.id_question)
      if (question.value && question.value.id_subject) {
        const subjectId = question.value.id_subject
        if (!subjects.includes(subjectId)) {
          subjects.push(subjectId)
        }
      }
    })
  })
  return subjects
})



const calculateSubjectStats = (attempts: StudentAttemptInterface[]): Record<string, Record<number, SubjectDateStats> | Record<number, StudentAttemptInterface[]>> => {
  const stats: Record<number, SubjectDateStats> = {}
  const subjects: Record<number, StudentAttemptInterface[]> = {}

  attempts.forEach((attempt: any) => {
    const attemptQuestion = attempt.studentAttemptQuestions[0]
    if (!attemptQuestion) return

    const question = questionStore.getQuestion(attemptQuestion.id_question)
    if (question.value && question.value.id_subject) {
      const subjectId = question.value.id_subject
      if (!subjects[subjectId]) {
        subjects[subjectId] = []
      }
      subjects[subjectId].push(attempt)

      if (!stats[subjectId]) {
        stats[subjectId] = {
          bestResult: '-',
          count: 0
        }
      }

      const percent = attempt.success_percent || 0
      const current = stats[subjectId]
      if (current.bestResult === '-' || percent > parseFloat(current.bestResult)) {
        current.bestResult = formatPercent(percent)
      }
      current.count++
    }
  })

  return {
    "stats": stats,
    "subjects": subjects,
  }
}

interface DateGroup {
  student_id: number,
  date: string
  attempts: StudentAttemptInterface[]
  subjectStats: Record<string, SubjectDateStats>
  studentAttempts: StudentAttemptInterface[]
  children: DateGroup[] | any
}

interface SubjectDateStats {
  bestResult: string
  count: number
}

const formatPercent = (value: number): string => {
  return isNaN(value) ? '-' : `${value}%`
}

const tableData = computed(() => {
  if (questionStore.list.length === 0 || subjectStore.list.length === 0 || studentsGroupData.value.length === 0) {
    return []
  }

  return studentsGroupData.value
    .filter(student => selectedStudentId.value === 0 || selectedStudentId.value === student.id)
    .map(student => {
      const children: any = []
      let startId = student.id * 10000

      const attemptsByDate = student.studentAttempts.reduce((acc, attempt) => {
        const date = attempt.date_finish?.split(' ')[0] || 'Без даты'
        if (!acc[date]) acc[date] = []
        acc[date].push(attempt)
        return acc
      }, {} as Record<string, StudentAttemptInterface[]>)

      Object.entries(attemptsByDate).forEach(([date, attempts]) => {
        const childrenByDate = [{
          "student_id": ++startId,
          "studentAttempts": attempts,
          "attemptsLabels": true,
          ...calculateSubjectStats(attempts),
        }]

        children.push({
          "student_id": ++startId,
          date: date,
          studentAttempts: attempts,
          // "subjects": subjects,
          ...calculateSubjectStats(attempts),
          "children": childrenByDate,
        })
      })


      return {
        ...student,
        "student_id": ++startId,
        ...calculateSubjectStats(student.studentAttempts),
        "children": children,
      }
    })
})

interface SubjectInfo {
  id: number
  name: string
  code?: string
  studentCount: number
  totalAttempts: number
  averageSuccess: number
  bestResult: number
  worstResult: number
}
const usingSubjectsList = computed(() => {
  if (!subjectIds.value.length) return []

  const subjects: SubjectInfo[] = []
  subjectIds.value.forEach(subjectId => {
    const subjectFromStore = subjectStore.getSubject(subjectId)
    let studentCount = 0
    let totalAttempts = 0
    const successPercents: number[] = []

    studentsGroupData.value.forEach(student => {
      if (student.subjects && student.subjects[subjectId]) {
        const attempts = student.subjects[subjectId]
        studentCount += 1
        totalAttempts += attempts.length

        attempts.forEach((attempt: any) => {
          successPercents.push(attempt.success_percent)
        })
      }
    })

    const averageSuccess = successPercents.length > 0
      ? Number((successPercents.reduce((sum, val) => sum + val, 0) / successPercents.length).toFixed(2))
      : 0

    const bestResult = successPercents.length > 0 ? Math.max(...successPercents) : 0
    const worstResult = successPercents.length > 0 ? Math.min(...successPercents) : 0

    subjects.push({
      id: subjectId,
      name: subjectFromStore?.name_short || `Предмет ${subjectId}`,
      studentCount,
      totalAttempts,
      averageSuccess,
      bestResult,
      worstResult
    })
  })
  return subjects
}
)


const usingSubjectsListGroupedByTeacher = computed(() => {
  if (!usingSubjectsList.value.length || !teacherStore.list.length) return []
  const subjects = usingSubjectsList.value
  const groupedByTeacher: {
    teacher: TeacherInterface
    subjects: SubjectInfo[]
  }[] = []

  teacherStore.list.forEach(teacher => {
    const teacherSubjects = subjects.filter(subject => {
      const subjectFromStore = subjectStore.getSubject(subject.id)
      return subjectFromStore?.teacher === teacher.teacher_id
    })

    if (teacherSubjects.length > 0) {
      groupedByTeacher.push({
        teacher,
        subjects: teacherSubjects
      })
    }
  })

  return groupedByTeacher
})

const loadData = async () => {
  if (!groupId.value) {
    return
  }

  if (studentsGroupsData[groupId.value]) {
    return
  }

  if (!studentsGroupsData[groupId.value]) {
    studentsGroupsData[groupId.value] = {
      list: [],
      date: new Date,
      loading: true,
    }
  }
  const studentsGroupItem = studentsGroupsData[groupId.value]
  studentsGroupItem.loading = true
  try {
    const response = await axios.get('/analytic/student-group-summary', {
      params: { group_id: groupId.value }
    })
    studentsGroupItem.list = response.data
  } catch (err) {
    console.log(err)
    ElMessage({
      message: "Ошибка загрузки данных",
      type: "error",
    } as MessageParams)
  } finally {
    studentsGroupItem.loading = false
  }
}

const getSuccessTagType = (success: number | string) => {
  const normalized = String(success).trim()
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

const getStat = (data: StudentAttemptInterface[]): StatResult => {
  if (!data || data.length === 0) {
    return {
      best: ' ',
      worst: ' ',
      count: 0
    }
  }

  const sorted = [...data].sort((a, b) =>
    (b.success_percent || 0) - (a.success_percent || 0)
  )

  return {
    best: `${sorted[0].success_percent}`,
    worst: `${sorted[sorted.length - 1].success_percent}`,
    count: data.length
  }
}

interface StatResult {
  best: string
  worst: string
  count: number
}

const getCellClassName = ({ row, column }: { row: StudentInterface; column: any }) => {
  if (row.attemptsLabels) {
    return 'attempts-labels'
  }
  const subject = usingSubjectsList.value.find(s => s.name === column.label)
  if (!subject) return ''

  const addClass = (row.subjects?.[subject.id]?.length || 0) > 1 ? ' attempts-indicator' : ''
  const stat = getStat(row.subjects?.[subject.id] || [])
  const percent = parseFloat(stat.best)
  if (isNaN(percent)) return 'no-data-cell'
  if (percent >= 90) return 'success' + addClass
  if (percent >= 75) return 'warning' + addClass
  return 'danger' + addClass
}

const studentsList = computed(() => [
  { label: 'Все студенты', value: 0 },
  ...studentsGroupData.value.map(s => ({
    label: `${s.f} ${s.i}`.trim(),
    value: s.id
  }))
])

watch(groupId, (newId, oldId) => {
  if (newId !== oldId && newId !== null) {
    loadData()
  }
}, { immediate: false })

// watch(tableData, (newId, oldId) => {
// }, { immediate: false })


const handleGroupChange = (selectedId: number) => {
  if (!selectedId) return

  // Формируем новый путь с подстановкой ID
  const newPath = `/analytic/group/${selectedId}`

  // Проверяем, не находимся ли уже на этом маршруте
  if (route.path === newPath) return

  // Подменяем URL без полного перехода — не добавляем запись в историю браузера
  router.replace(newPath)
}

const datesShortcuts = [
  {
    text: 'Сегодня',
    value: () => {
      const start = new Date()
      const end = new Date()
      return [start, end]
    },
  },
  {
    text: 'За неделю',
    value: () => {
      const start = new Date()
      const end = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: 'За месяц',
    value: () => {
      const start = new Date()
      const end = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: 'За всё время',
    value: () => ["2026-01-01", "2030-01-01"],
  },
]


onMounted(() => {
  groupId.value = parseInt(route.params.id as string)
})
</script>

<template>
  <div class="student-summary">
    <h2>
      Студент
      <el-select v-model="selectedStudentId" style="width: 250px; margin-left: 10px;">
        <el-option v-for="student in studentsList" :key="student.value" :label="student.label" :value="student.value" />
      </el-select>
      Сводная таблица
      <el-select v-model="calculationMethod" style="width: 200px">
        <el-option label="лучший результат" value="bestScore" />
      </el-select>
      студентов группы
      <el-select v-model="groupId" placeholder="Выберите группу" style="width: 200px" @change="handleGroupChange">
        <!-- <el-option v-for="group in groupedAndSortedGroups" :key="group.academicGroup_id" :label="`${group.name} (${group.educationMode}, ${group.academicGroup_year})`" :value="group.academicGroup_id" /> -->
        <el-option-group v-for="modeGroup in groupedAndSortedGroups" :key="modeGroup.educationMode" :label="modeGroup.educationMode">
          <el-option v-for="group in modeGroup.groups" :key="group.academicGroup_id" :label="`${group.name} (${group.academicGroup_year}, №${group.academicGroup_id})`" :value="group.academicGroup_id" />
        </el-option-group>
      </el-select>
      за период
      <el-date-picker v-model="dates" type="daterange" unlink-panels start-placeholder="дата начала" end-placeholder="дата окончания" :shortcuts="datesShortcuts" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
      включительно
    </h2>
    <el-table :data="tableData" border :row-key="(row) => row.student_id" :cell-class-name="getCellClassName" max-height="calc(100vh - 120px)">
      <el-table-column fixed label="Студент" align="center">
        <el-table-column prop="id" label="№" width="100" align="center"></el-table-column>
        <el-table-column prop="f" label="Фамилия" width="125"></el-table-column>
        <el-table-column prop="i" label="Имя" width="125"></el-table-column>
      </el-table-column>

      <el-table-column :label="teachersSubjects.teacher.f" align="left" v-for="teachersSubjects in usingSubjectsListGroupedByTeacher" :key="teachersSubjects.teacher.teacher_id">
        <el-table-column :label="subject.name" align="center" v-for="subject in teachersSubjects.subjects" :key="subject.id" width="70">
          <template #default="scope">
            <div v-if="scope.row.attemptsLabels">
              <el-tag v-for="attempt in scope.row.subjects[subject.id]" :key="attempt.id" :type="getSuccessTagType(attempt.success_percent)">
                {{ attempt.success_percent }}%
              </el-tag>
            </div>
            <div v-else-if="scope.row.subjects[subject.id]" :data-attempts="scope.row.subjects[subject.id].length">
              {{ getStat(scope.row.subjects[subject.id]).best }}%
            </div>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="Попытки" width="120">
        <template #default="scope">
          {{ scope.row.studentAttempts.length }} {{ scope.row.date }}
        </template>
      </el-table-column>

    </el-table>
  </div>

</template>

<style lang="scss">
.student-summary {
  padding: 20px;
  grid-column: 1 / -1;
}

td.success {
  background-color: var(--el-color-success-light-9) !important;
  color: var(--el-color-success) !important;
}

/* Жёлтый — предупреждение (60–79 %) */
td.warning {
  background-color: var(--el-color-warning-light-9) !important;
  color: var(--el-color-warning) !important;
}

/* Красный — неудовлетворительно (< 60 %) */
td.danger {
  background-color: var(--el-color-danger-light-9) !important;
  color: var(--el-color-danger) !important;
}

.student-summary th .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Отсутствующие данные */
td.no-data-cell {
  // background-color: #FBFBFB !important;
  color: #6b7280 !important;
  font-style: italic;
}

td.attempts-labels {
  // background-color: #FBFBFB !important;
  padding: 0px !important;
  vertical-align: top;

  .cell {
    padding: 0px;

    .el-tag {
      display: block;
      margin: 5px;
      line-height: 1.5em;
      height: 1.5em;
    }
  }
}




.attempts-indicator {
  position: relative;
  padding-right: 28px;
}

.attempts-indicator .cell div::after {
  content: attr(data-attempts);
  display: block;
  position: absolute;
  top: 0px;
  right: 0px;
  background: #BBB;
  color: white;
  font-size: 10px;
  padding: 1px 0px;
  box-sizing: content-box;
  // border-radius: 8px;
  width: 1.3em;
  height: 1.3em;
  line-height: 1.3em;
  text-align: center;
}
</style>