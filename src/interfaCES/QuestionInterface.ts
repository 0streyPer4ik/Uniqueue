export interface Answer {
  text: string
  isCorrect: boolean
}

export interface AnswerType2 {
  text: string
  matches: string
}

export interface QData {
  description: string
  answersType3: AnswerType3[]
}

export interface AnswerType3 {
  text: string
  correctPosition: number
}

export interface QDataContentSingleChoice {
  description: string
  answers: Answer[]
}

export interface QDataContentMatching {
  description: string
  qDescription: string[]
  answersType2: AnswerType2[]
}

export interface Question {
  id: number
  id_question_type: number
  content: QDataContentSingleChoice | QDataContentMatching
  id_subject: number
  additionalText?: string
}


export interface QuestionInterface {
  id: number
  id_question_type: number
  id_subject: number
  additionalText?: string
  content: {
    description?: string          // Для QuestionType1
    qDescription?: string[]       // Для других типов
    answers?: Array<{              // Для QuestionType1
      text: string
      isCorrect: boolean
    }>
    correctAnswer?: string[]      // Для QuestionType4,5
    answersType2?: Array<{         // Для QuestionType2
      text: string
      matches: string
    }>
  }
}

export interface SubjectInterface {
  id: number
  name_subject: string
  name_short: string
  enabled: number
  education_level: number
  teacher: number | null
  subject_pdf: string
}

export interface TeacherInterface {
  teacher_id: number
  f: string
  i: string
  o: string
}

export interface GroupInterface {
  academicGroup_id: number
  name: string
  educationMode: string
  academicGroup_year: number
}

export interface QuestionContent {
  description?: string
  qDescription?: string[]
  answersType2?: Array<{ text: string, matches: string }>
  answersType3?: Array<{ text: string, correctPosition: number }>
  correctAnswer?: string
}

export interface QuestionData {
  id: number
  id_question_type: number
  content: QuestionContent
  answer?: number | number[] | string | string[] | boolean | null
  correctAnswers?: (number | string)[]
}


export interface StudentInterface {
  id: number
  group: number
  f: string
  i: string
  o: string
  code: string
  type: string
  studentAttempts: StudentAttemptInterface[]
  subjects?: Record<number, StudentAttemptInterface[]>
  attemptsLabels?: boolean
}

export interface StudentAttemptInterface {
  id: number
  id_student: number
  date_begin: string
  date_finish: string
  success_percent: number
  attempt_type: string
  studentAttemptQuestions: StudentAttemptQuestionInterface[]
}

export interface StudentAttemptQuestionInterface {
  id: number
  id_student_attempt: number
  id_question: number
  statement: 'succesfull' | 'failed'
}
