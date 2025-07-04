<script lang="ts">
import { Options, Vue } from "vue-class-component"
import axios, { AxiosResponse } from 'axios'
import type { Question } from "@/interfaCES/QuestionInterface"
import { ElMessage } from 'element-plus'
import { ArrowUp, ArrowDown } from "@element-plus/icons-vue"

interface QDataContent {
  description: string
  answers: Answer[]
  qDescription?: string[]
  answersType2?: AnswerType2[]
  answersType3?: AnswerType3[]
  correctAnswer?: string[]
  correctAnswerType4?: string
}

interface Answer {
  text: string
  isCorrect: boolean
}

interface AnswerType2 {
  text: string
  matches: string
}

interface AnswerType3 {
  text: string
  correctPosition: number
}

interface Question {
  id: number
  id_question_type: number
  content: QDataContent
  id_subject: number
}

@Options({
  components: { ElMessage, ArrowUp, ArrowDown }
})

export default class QuestionType1Component extends Vue {
  id: number = 0;
  question: Question = {
    "id": 0,
    "id_question_type": 1,
    "content": {
      "description": "",
      "answers": [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
      ],
      "qDescription": [],
      "answersType2": [],
      "answersType3": [],
      "correctAnswer": ""
    },
    "id_subject": 0
  };

  mounted() {
  if (this.$route.params.id && parseInt(this.$route.params.id) > 0) {
    this.id = parseInt(this.$route.params.id)

    axios.get<Question>('http://test.local/questions/' + this.id)
      .then((response: AxiosResponse<Question>) => {
        this.question = response.data;
        this.transformQuestionContent()
      })
      .catch(error => {
        console.error('Ошибка при получении вопроса:', error)
      });
  }
}

transformQuestionContent() {
    if (this.question.id_question_type === 1) {
        if (typeof this.question.content === 'string') {
            try {
                this.question.content = JSON.parse(this.question.content);
            } catch (e) {
                console.error("Ошибка парсинга content", e)
                this.question.content = { description: "", answers: [] };
            }
        }
        if (!Array.isArray(this.question.content.answers)) {
            this.question.content.answers = [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false }
            ];
        }
    } else if (this.question.id_question_type === 2) {
        if (typeof this.question.content === 'string') {
            try {
                this.question.content = JSON.parse(this.question.content)
            } catch (e) {
                console.error("Ошибка парсинга content", e)
                this.question.content = { description: "", qDescription: [], answersType2: [] }
            }
        }


        if (!this.question.content.qDescription) {
            this.question.content.qDescription = []
        }
        if (!this.question.content.answersType2) {
            this.question.content.answersType2 = []
        }
    } else if (this.question.id_question_type === 3) {
        if (typeof this.question.content === 'string') {
            try {
                this.question.content = JSON.parse(this.question.content)
            } catch (e) {
                console.error("Ошибка парсинга content", e);
                this.question.content = { description: "", answersType3: [] }
            }
        }
        if (!this.question.content.answersType3) {
            this.question.content.answersType3 = [];
        }
    } else if (this.question.id_question_type === 4) {
        if (typeof this.question.content === 'string') {
            try {
                this.question.content = JSON.parse(this.question.content)
            } catch (e) {
                console.error("Ошибка парсинга content", e);
                this.question.content = { description: "", correctAnswer: "" }
            }
        }
        if (!this.question.content.correctAnswer) {
            this.question.content.correctAnswer = ""
        }
    } else if (this.question.id_question_type === 5) {
        if (typeof this.question.content === 'string') {
          try {
            this.question.content = JSON.parse(this.question.content)
          } catch (e) {
            console.error("Ошибка парсинга content", e);
            this.question.content = { description: "", correctAnswer: [] }
          }
        }
        if (!this.question.content.correctAnswer) {
          this.question.content.correctAnswer = []
        }
  }
}

  // Методы для первого типа вопроса
  addAnswer() {
    if (this.question && this.question.content) {
      this.question.content.answers.push({ text: "", isCorrect: false })
    }
  }

  removeAnswer(index: number) {
    if (this.question && this.question.content) {
      this.question.content.answers.splice(index, 1)
    }
  }

  resetCorrectAnswers() {
    if (this.question && this.question.content) {
      this.question.content.answers.forEach(answer => {
        answer.isCorrect = false
      });
    }
  }

  // Методы для второго типа вопроса
  addQuestion() {
    if (!this.question.content.qDescription) {
      this.question.content.qDescription = []
    }
    this.question.content.qDescription.push("")
  }

  removeQuestion(index: number) {
    if (this.question.content.qDescription) {
      this.question.content.qDescription.splice(index, 1)

      if (this.question.content.answersType2) {
          this.question.content.answersType2.forEach(answer => {
              if (answer.matches === this.question.content.qDescription[index]) {
                  answer.matches = ""
              }
          })
      }
    }
  }

removeAnswerType2(index: number) {
    if (this.question.content.answersType2) {
      this.question.content.answersType2.splice(index, 1);
    }
  }

  moveItem(index: number, direction: number) {
    if (this.question.content.answersType2) {
      const newIndex = index + direction;

      if (newIndex >= 0 && newIndex < this.question.content.answersType2.length) {
        const newAnswers = [...this.question.content.answersType2];
        [newAnswers[index], newAnswers[newIndex]] = [
          newAnswers[newIndex],
          newAnswers[index],
        ];
        this.question.content.answersType2 = newAnswers;
      }
    }
  }

    addAnswerType2() {
        if (!this.question.content.answersType2) {
            this.question.content.answersType2 = [];
        }
        this.question.content.answersType2.push({ text: "", matches: "" });
    }

    addAnswerType3() {
        if (!this.question.content.answersType3) {
            this.question.content.answersType3 = [];
        }
        this.question.content.answersType3.push({ text: "", correctPosition: 0 });
    }

    addCorrectAnswer() {
      if (!this.question.content.correctAnswer) {
        this.question.content.correctAnswer = [];
      }
      this.question.content.correctAnswer.push("");
}

removeCorrectAnswer(index: number) {
  if (this.question.content.correctAnswer) {
    this.question.content.correctAnswer.splice(index, 1);
  }
}

removeAnswerType3(index: number) {
    if (this.question.content.answersType3) {
      this.question.content.answersType3.splice(index, 1);
    }
  }

  saveQuestion() {
    if (this.question && this.question.content) {
      let contentToSave;

      if (this.question.id_question_type === 1) {
        const answersToSave = this.question.content.answers.map(answer => ({
          text: answer.text,
          isCorrect: answer.isCorrect,
        }));

        contentToSave = {
          ...this.question.content,
          answers: answersToSave,
        };
      } else if (this.question.id_question_type === 2) {
          contentToSave = {
            description: this.question.content.description,
            qDescription: this.question.content.qDescription,
            answersType2: this.question.content.answersType2
          };
      } else if (this.question.id_question_type === 3) {
          contentToSave = {
            description: this.question.content.description,
            answersType3: this.question.content.answersType3,
          };
      } else if (this.question.id_question_type === 4) {
          contentToSave = {
            description: this.question.content.description,
            correctAnswer: this.question.content.correctAnswer,
          };
      } else if (this.question.id_question_type === 5) {
        contentToSave = {
          description: this.question.content.description,
          correctAnswer: this.question.content.correctAnswer,
        };
    }

      const updatedQuestion = {
        ...this.question,
        content: JSON.stringify(contentToSave),
      };

      axios.put('http://test.local/questions/' + this.id, updatedQuestion)
        .then(response => {
          console.log('Вопросы сохранены', response);
          ElMessage({
            message: 'Успешно сохранено!',
            type: 'success',
          });
        })
        .catch(error => {
          console.error('Ошибка!', error)
          ElMessage({
            message: 'Ошибка при сохранении!',
            type: 'error',
          })
        })
    }
  }
}
</script>

<template>
  <div>
    <h2>Редактировать вопрос</h2>
    <br>

    <div v-if="question.id_question_type === 1">
      <!-- Интерфейс редактирования для 1 типа вопроса -->
      <el-input
        v-model="question.content.description"
        type="textarea"
        placeholder="Описание вопроса"
        style="width: 100%; margin-bottom: 15px;"
      />

      <div v-for="(answer, index) in question.content.answers" :key="index" style="margin-bottom: 10px;">
        <el-input v-model="answer.text" style="width: 800px;">
          <template #prepend>
            <el-checkbox v-model="answer.isCorrect"></el-checkbox>
          </template>
          <template #append>
            <el-button @click="removeAnswer(index)" type="danger" size="small">Удалить</el-button>
          </template>
        </el-input>
      </div>

      <el-button @click="addAnswer">Добавить ответ</el-button>
      <el-button @click="resetCorrectAnswers">Сбросить правильные ответы</el-button>
      <el-button type="primary" @click="saveQuestion">Сохранить</el-button>
    </div>

    <div v-else-if="question.id_question_type === 2">
      <!-- Интерфейс редактирования для 2 типа вопроса -->
      <el-input
        v-model="question.content.description"
        placeholder="Описание вопроса"
        style="width: 100%; margin-bottom: 15px;"
      />

      <h4>Вопросы:</h4>
      <div v-for="(qDescription, index) in question.content.qDescription" :key="'q' + index" style="margin-bottom: 10px;">
        <el-input
          v-model="question.content.qDescription[index]"
          placeholder="Вопрос"
          style="width: 800px;"
        >
          <template #append>
            <el-button @click="removeQuestion(index)" type="danger" size="small">Удалить</el-button>
          </template>
        </el-input>
      </div>
      <el-button @click="addQuestion" type="" style="margin-bottom: 15px;">Добавить вопрос</el-button>

      <h4>Ответы:</h4>
      <div v-for="(answer, index) in question.content.answersType2" :key="'a' + index" style="margin-bottom: 15px;">
        <div style="display: flex; align-items: center;">
          <el-input v-model="answer.text" placeholder="Ответ" style="flex: 1; margin-right: 10px;"></el-input>
          <el-select v-model="answer.matches" placeholder="Соответствующий вопрос" style="width: 200px; margin-right: 10px;">
            <el-option
              v-for="(qDescription, qIndex) in question.content.qDescription"
              :key="'match' + qIndex"
              :value="qDescription"
              :label="qDescription"
            ></el-option>
          </el-select>
          <el-button @click="removeAnswerType2(index)" type="danger" size="small">
            Удалить
          </el-button>
        </div>
      </div>
      <el-button @click="addAnswerType2" type="">Добавить ответ</el-button>
      <el-button type="primary" @click="saveQuestion">Сохранить</el-button>
    </div>
    <div v-else-if="question.id_question_type === 3" class="question-type-3-editor">
      <!-- Интерфейс редактирования для 3 типа вопроса -->
      <el-input
        type="textarea"
        v-model="question.content.description"
        placeholder="Описание вопроса"
        class="question-description-input"
      />

      <h4>Ответы:</h4>
      <div v-for="(answer, index) in question.content.answersType3" :key="'a3' + index" class="answer-item">
        <div class="answer-container">
          <el-input v-model="answer.text" placeholder="Текст ответа" class="answer-input" />
          <el-input
            v-model.number="answer.correctPosition"
            type="number"
            placeholder="Правильная позиция"
            class="answer-position-input"
            min="0"
            :max="question.content.answersType3.length - 1"
          />
          <el-button @click="removeAnswerType3(index)" type="danger" size="small">Удалить</el-button>
        </div>
      </div>
      <el-button @click="addAnswerType3" class="add-answer-button">Добавить ответ</el-button>
      <el-button type="primary" @click="saveQuestion">Сохранить</el-button>
    </div>
    <div v-else-if="question.id_question_type === 4" class="question-type-4-editor">
      <!-- Интерфейс редактирования для 4 типа вопроса -->
      <el-input
        v-model="question.content.description"
        type="textarea"
        placeholder="Описание вопроса"
        class="question-description-input"
      />

      <el-input
        v-model="question.content.correctAnswer"
        placeholder="Правильный ответ"
        class="correct-answer-input"
      />

      <el-button type="primary" @click="saveQuestion">Сохранить</el-button>
    </div>

      <div v-else-if="question.id_question_type === 5" class="question-type-5-editor">
      <!-- Интерфейс редактирования для 5 типа вопроса -->
      <el-input
        v-model="question.content.description"
        type="textarea"
        placeholder="Описание вопроса"
        class="question-description-input"
      />

      <h4>Правильные ответы:</h4>
      <div v-for="(answer, index) in question.content.correctAnswer" :key="'ca' + index" class="correct-answer-item">
        <el-input
          v-model="question.content.correctAnswer[index]"
          placeholder="Правильный ответ"
          class="correct-answer-input"
        >
          <template #append>
            <el-button @click="removeCorrectAnswer(index)" type="danger" size="small">Удалить</el-button>
          </template>
        </el-input>
      </div>

      <el-button @click="addCorrectAnswer" class="add-correct-answer-button">Добавить ответ</el-button>
      <el-button type="primary" @click="saveQuestion">Сохранить</el-button>
    </div>
  </div>
</template>

<style scoped>
.question-description-input {
  width: 100%;
  margin-bottom: 15px;
}

.question-item {
  margin-bottom: 10px;
}

.question-input {
  width: 800px;
}

.answer-item {
  margin-bottom: 15px;
}

.answer-container {
  display: flex;
  align-items: center;
}

.answer-input {
  flex: 1;
  margin-right: 10px;
}

.answer-match-select {
  width: 200px;
  margin-right: 10px;
}

.add-question-button {
  margin-bottom: 15px;
}

.question-type-3-editor {
  /* Add CSS classes for consistent styling */
}

.answer-container {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.answer-input {
  flex: 1;
  margin-right: 10px;
}

.answer-position-input {
  width: 150px;
  margin-right: 10px;
}

.question-type-4-editor {
  /* Add CSS classes for consistent styling */
}

.question-description-input {
  width: 100%;
  margin-bottom: 15px;
}

.correct-answer-input {
  width: 500px;
}
</style>
