export interface Answer {
  text: string;
  isCorrect: boolean;
}

export interface AnswerType2 {
  text: string;
  matches: string;
}

export interface QData {
  description: string;
  answersType3: AnswerType3[];
}

export interface AnswerType3 {
  text: string;
  correctPosition: number;
}

export interface QDataContentSingleChoice {
  description: string;
  answers: Answer[];
}

export interface QDataContentMatching {
  description: string;
  qDescription: string[];
  answersType2: AnswerType2[];
}

export interface Question {
  id: number;
  id_question_type: number;
  content: QDataContentSingleChoice | QDataContentMatching;
  id_subject: number;
  additionalText?: string;
}
