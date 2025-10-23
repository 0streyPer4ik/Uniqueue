<script lang="ts">
import { Options, Vue } from "vue-class-component"
import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { MessageParams } from 'element-plus'

interface QDataContent {
    description: string
    answers?: Answer[]
    qDescription?: string[]
    answersType2?: AnswerType2[]
    answersType3?: AnswerType3[]
    correctAnswer?: string | string[]
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

interface Subject {
    id: number
    name_subject: string
}

const MessageComponent = {
  template: '<div></div>',
  methods: {
    show(options: MessageParams | string) {
      return ElMessage(options)
    },
    success(message: string) {
      return ElMessage.success(message)
    },
    warning(message: string) {
      return ElMessage.warning(message)
    },
    error(message: string) {
      return ElMessage.error(message)
    },
    info(message: string) {
      return ElMessage.info(message)
    }
  }
}

@Options({
  components: {
    ElMessage: MessageComponent
  }
})
class QuestionParserComponent extends Vue {
    inputText: string = ''
    matchingData: { qDescription: string[], answersType2: AnswerType2[] } = {
        qDescription: ['', '', '', ''],
        answersType2: [{ text: '', matches: '' }, { text: '', matches: '' }, { text: '', matches: '' }, { text: '', matches: '' }]
    };

    sequenceData: { answersType3: AnswerType3[] } = {
        answersType3: [{ text: '', correctPosition: 1 }, { text: '', correctPosition: 1 }, { text: '', correctPosition: 1 }, { text: '', correctPosition: 1 }]
    };

    question: Question = {
        id: 0,
        id_question_type: 1,
        content: {
            description: '',
            answers: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
            ],
        },
        id_subject: 1,
    };

    subjects: Subject[] = []

    updateSequencePosition(index: number, value: number) {
        if (this.sequenceData.answersType3[index]) {
            this.sequenceData.answersType3[index].correctPosition = value;
        }
    }

    mounted() {
        this.fetchSubjects()
    }

    addAnswer() {
        if (this.question?.content?.answers) {
            this.question.content.answers.push({ text: "", isCorrect: false })
        }
    }

    removeAnswer(index: number) {
        if (this.question?.content?.answers) {
            this.question.content.answers.splice(index, 1)
        }
    }

    resetCorrectAnswers() {
        if (this.question?.content?.answers) {
            this.question.content.answers.forEach(answer => {
                answer.isCorrect = false
            });
        }
    }

    addMatchingPair() {
        this.matchingData.qDescription.push('')
        this.matchingData.answersType2.push({ text: '', matches: '' })
    }

    removeMatchingPair(index: number) {
        this.matchingData.qDescription.splice(index, 1)
        this.matchingData.answersType2.splice(index, 1)
    }

    resetMatchingPairs() {
        this.matchingData.qDescription = ['', '', '', '']
        this.matchingData.answersType2 = [{ text: '', matches: '' }, { text: '', matches: '' }, { text: '', matches: '' }, { text: '', matches: '' }]
    }

    addSequenceAnswer() {
        this.sequenceData.answersType3.push({ text: '', correctPosition: this.sequenceData.answersType3.length + 1 })
    }

    removeSequenceAnswer(index: number) {
        this.sequenceData.answersType3.splice(index, 1)
        this.sequenceData.answersType3.forEach((answer, i) => {
            answer.correctPosition = i + 1
        })
    }

    resetSequenceAnswers() {
        this.sequenceData.answersType3 = this.sequenceData.answersType3.map((answer, i) => ({ ...answer, correctPosition: i + 1 }))
    }

    async fetchSubjects() {
        try {
            const response = await axios.get<Subject[]>('/subjects')
            this.subjects = response.data
            console.log('Fetched Subjects:', this.subjects)
        } catch (error) {
            console.error('Ошибка при загрузке предметов:', error)
            ElMessage({
                message: 'Ошибка при загрузке предметов',
                type: 'error',
            } as MessageParams)
        }
    }

    saveQuestion() {
        if (!this.question?.content) return;

        let contentToSave;

        if (this.question.id_question_type === 1 && this.question.content.answers) {
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
                qDescription: this.matchingData.qDescription,
                answersType2: this.matchingData.answersType2,
            };
        } else if (this.question.id_question_type === 3) {
            const answersType3ToSave = this.sequenceData.answersType3.map(answer => ({
                ...answer,
                correctPosition: answer.correctPosition - 1
            }));

            contentToSave = {
                description: this.question.content.description,
                answersType3: answersType3ToSave,
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

        const newQuestion = {
            ...this.question,
            content: JSON.stringify(contentToSave),
        };

        axios.post('/questions', newQuestion)
            .then(response => {
                console.log('Вопрос создан', response)
                ElMessage({
                    message: 'Успешно создано!',
                    type: 'success',
                } as MessageParams);

                // Сброс формы
                this.resetForm();
            })
            .catch(error => {
                console.error('Ошибка!', error);
                ElMessage({
                    message: 'Ошибка при создании!',
                    type: 'error',
                } as MessageParams)
            })
    }

    // Добавлен метод для сброса формы
    resetForm() {
        this.inputText = '';
        this.question.content.description = "";

        if (this.question.id_question_type === 1) {
            this.question.content.answers = [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
            ];
        } else if (this.question.id_question_type === 2) {
            this.matchingData = {
                qDescription: ['', '', '', ''],
                answersType2: [{ text: '', matches: '' }, { text: '', matches: '' }, { text: '', matches: '' }, { text: '', matches: '' }]
            };
        } else if (this.question.id_question_type === 3) {
            this.sequenceData = {
                answersType3: [
                    { text: '', correctPosition: 1 },
                    { text: '', correctPosition: 2 },
                    { text: '', correctPosition: 3 },
                    { text: '', correctPosition: 4 }
                ]
            };
        } else if (this.question.id_question_type === 4) {
            this.question.content.correctAnswer = '';
        } else if (this.question.id_question_type === 5) {
            this.question.content.correctAnswer = [];
        }
    }

parseText() {
    const lines = this.inputText.split('\n');

    if (this.question.id_question_type === 1) {
        this.question.content.description = lines[0]
        const answers: { text: string; isCorrect: boolean }[] = []

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (line.startsWith('Правильный ответ:')) {
                break
            }
            if (line !== '') {
                const parts = line.split(')')
                if (parts.length === 2) {
                    answers.push({ text: parts[1].trim(), isCorrect: false })
                }
            }
        }

        this.question.content.answers = answers

        const correctAnswerLine = lines.find(line => line.startsWith('Правильный ответ:'))
        if (correctAnswerLine) {
            const correctAnswerLetter = correctAnswerLine.split(':')[1].trim()

            this.question.content.answers.forEach((answer) => {
              const answerLine = lines.find(line => line.startsWith(correctAnswerLetter + ')'))
              if (answerLine && answerLine.split(')')[1].trim() === answer.text) {
                  answer.isCorrect = true
              }
            })
        }
    } else if (this.question.id_question_type === 2) {
    if (lines.length < 8) {
        ElMessage({
            message: 'Неверный формат входных данных для вопроса на соответствие! Минимум 8 строк требуется.',
            type: 'error',
        })
        return
    }

    this.question.content.description = lines[0].trim()

    this.matchingData.qDescription = []
    this.matchingData.answersType2 = []

    const terms: {letter: string, text: string}[] = []
    let i = 2

    while (i < lines.length) {
        const line = lines[i].trim()
        if (line !== "") {

            if (line.includes("Правильный ответ")) break

            const parts = line.split('\t')
            if (parts.length !== 2) {
                ElMessage({
                    message: 'Неверный формат строки таблицы! Ожидается 2 колонки, разделенные табом.',
                    type: 'error',
                })
                return
            }

            const formulation = parts[0].replace(/^\d+\)\s*/, '').trim()
            this.matchingData.qDescription.push(formulation)

            const termWithLetter = parts[1].trim()
            const letterMatch = termWithLetter.match(/^([А-Яа-я]+)\)\s*(.+)/)
            if (!letterMatch) {
                ElMessage({
                    message: 'Неверный формат термина с буквой! Ожидается формат "А) текст термина"',
                    type: 'error',
                })
                return
            }

            terms.push({
                letter: letterMatch[1],
                text: letterMatch[2].trim()
            })
        }
        i++
    }

    const pairCount = this.matchingData.qDescription.length
    if (pairCount !== terms.length || (pairCount !== 3 && pairCount !== 4)) {
        ElMessage({
            message: 'Некорректное количество пар! Должно быть 3 или 4 формулировки и столько же терминов.',
            type: 'error',
        });
        return
    }

    while (i < lines.length && !lines[i].includes("Правильный ответ")) {
        i++
    }

    if (i >= lines.length - 2) {
        ElMessage({
            message: 'Не найдена строка "Правильный ответ" или данные ответов!',
            type: 'error',
        });
        return
    }
    i++

    const formulationOrder = lines[i].split('\t').map(s => s.trim())
    i++
    const termLetters = lines[i].split('\t').map(s => s.trim())

    if (formulationOrder.length !== pairCount || termLetters.length !== pairCount) {
        ElMessage({
            message: `Неверный формат строки с правильными ответами! Ожидается ${pairCount} значений.`,
            type: 'error',
        });
        return
    }

    this.matchingData.answersType2 = terms.map(term => ({
        text: term.text,
        matches: ""
    }))

    for (let j = 0; j < pairCount; j++) {
        const termLetter = termLetters[j]
        const formulationIndex = parseInt(formulationOrder[j]) - 1

        if (isNaN(formulationIndex) || formulationIndex < 0 || formulationIndex >= pairCount) {
            ElMessage({
                message: `Неверный индекс формулировки: ${formulationOrder[j]}. Должно быть число от 1 до ${pairCount}.`,
                type: 'error',
            })
            return
        }

        const termIndex = terms.findIndex(t => t.letter === termLetter)
        if (termIndex === -1) {
            ElMessage({
                message: `Не найден термин с буквой ${termLetter}`,
                type: 'error',
            })
            return
        }

        this.matchingData.answersType2[termIndex].matches = this.matchingData.qDescription[formulationIndex]
    }

    if (this.matchingData.answersType2.some(item => !item.matches)) {
        ElMessage({
            message: 'Не все соответствия установлены!',
            type: 'error',
        })
        return
    }
} else if (this.question.id_question_type === 3) {
        if (lines.length < 3) {
            ElMessage({
                message: 'Неверный формат входных данных для вопроса на последовательность!',
                type: 'error',
            });
            return
        }

        this.question.content.description = lines[0]
        this.sequenceData.answersType3 = []

        const termToLetters: { text: string, letter: string}[] = []

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === "Правильный ответ:") {
                break;
            }
            if (line !== "") {
                const parts = line.split(')')
                if (parts.length === 2) {
                  termToLetters.push({text: parts[1].trim(), letter: parts[0].trim()})
                  this.sequenceData.answersType3.push({ text: parts[1].trim(), correctPosition: 1 })
                }
            }
        }

        const correctAnswerLine = lines.find(line => line === "Правильный ответ:")

        if (!correctAnswerLine) {
            ElMessage({
                message: 'Не найдена строка "Правильный ответ:"!',
                type: 'error',
            });
            return
        }

        const correctAnswerIndex = lines.indexOf(correctAnswerLine);
        if (correctAnswerIndex === -1) {
            ElMessage({
                message: 'Не найдена строка "Правильный ответ:"!',
                type: 'error',
            });
            return
        }

        const correctAnswerString = lines[correctAnswerIndex + 1];
        if (!correctAnswerString) {
            ElMessage({
                message: 'Отсутствует строка с ответами!',
                type: 'error',
            });
            return
        }
        const correctAnswers = correctAnswerString.split(',').map(s => s.trim())

        if (correctAnswers.length !== this.sequenceData.answersType3.length) {
            ElMessage({
                message: 'Количество правильных ответов не совпадает с количеством вариантов!',
                type: 'error',
            });
            return
        }

        for (let i = 0; i < correctAnswers.length; i++) {
            const answerLetter = correctAnswers[i]
            const answerIndex = termToLetters.findIndex(answer => answer.letter === answerLetter)
            if (answerIndex !== -1) {
                this.sequenceData.answersType3[answerIndex].correctPosition = i + 1
            } else {
                ElMessage({
                    message: `Не найден вариант ответа: "${answerLetter}"!`,
                    type: 'warning',
                });
            }
        }
      } else if (this.question.id_question_type === 4) {
          this.question.content.description = lines[0]?.split('_')[0]?.trim() || ""
          this.question.content.correctAnswer = lines[1]?.split(':')[1]?.trim() || ""
      } else if (this.question.id_question_type === 5) {

        const lines = this.inputText.split('\n')

        const correctAnswerLineIndex = lines.findIndex(line => line.startsWith('Правильный ответ:'))

        this.question.content.description = lines.slice(0, correctAnswerLineIndex === -1 ? lines.length : correctAnswerLineIndex).join('\n').trim() || ""

        if (correctAnswerLineIndex !== -1) {
            this.question.content.correctAnswer = lines
                .slice(correctAnswerLineIndex + 1)
                .map(answer => answer.trim())
                .filter(answer => answer !== "")
        } else {
            this.question.content.correctAnswer = [];
        }
    }
}

    setQuestionType(type: number) {
        this.question.id_question_type = type

        if (type !== 1) {
            this.question.content.answers = [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
            ];
        }
        if (type !== 2) {
            this.matchingData.qDescription = ['', '', '', ''];
            this.matchingData.answersType2 = [{ text: '', matches: '' }, { text: '', matches: '' }, { text: '', matches: '' }, { text: '', matches: '' }]
        }
        if (type !== 3) {
            this.sequenceData.answersType3 = [{ text: '', correctPosition: 1 }, { text: '', correctPosition: 2 }, { text: '', correctPosition: 3 }, { text: '', correctPosition: 4 }]
        }
        if (type !== 4) {
          this.question.content.correctAnswer = '';
        }
        if (type !== 5) {
          this.question.content.correctAnswer = []
        }
    }

}
export default QuestionParserComponent
</script>

<template>
    <div>
        <h2>Быстрый импорт вопроса</h2>

        <h3>Тип вопроса</h3>
        <el-radio-group v-model="question.id_question_type" @change="setQuestionType">
            <el-radio :label="1">Выбор одного ответа</el-radio>
            <el-radio :label="2">Соответствие</el-radio>
            <el-radio :label="3">Последовательность</el-radio>
            <el-radio :label="4">Один ответ</el-radio>
            <el-radio :label="5">Множественные ответы</el-radio>
        </el-radio-group>

        <h3>Выберите предмет</h3>
        <el-select v-model="question.id_subject" placeholder="Выберите предмет">
            <el-option v-for="subject in subjects" :key="subject.id" :label="subject.name_subject" :value="subject.id" />
        </el-select>
        <br><br>

        <el-input
            v-model="inputText"
            type="textarea"
            placeholder="Вставьте вопрос и ответы"
            style="width: 800px; height: 150px;"
        />
        <el-button type="primary" @click="parseText" class="text_copy">Разобрать</el-button>

        <el-input
            v-model="question.content.description"
            type="textarea"
            style="width: 1080px"
            placeholder="Введите описание вопроса"
        />
        <br><br>

        <!-- QuestionType1-->
        <div v-if="question.id_question_type === 1 && question.content.answers">
            <div v-for="(answer, index) in question.content.answers" :key="index">
                <el-input v-model="answer.text" placeholder="Введите вариант ответа">
                    <template #prepend>
                        <el-checkbox v-model="answer.isCorrect"></el-checkbox>
                    </template>
                    <template #append>
                        <el-button @click="removeAnswer(index)" type="danger" size="small">Удалить</el-button>
                    </template>
                </el-input>
            </div>

            <br>
            <el-button @click="addAnswer">Добавить ответ</el-button>
            <el-button @click="resetCorrectAnswers">Сбросить правильные ответы</el-button>
        </div>

        <!-- QuestionType2-->
        <div v-else-if="question.id_question_type === 2">
            <div v-for="(pair, index) in matchingData.answersType2" :key="index">
                <el-input v-model="matchingData.qDescription[index]" placeholder="Описание" style="width: 40%; margin-right: 10px;"></el-input>
                <el-input v-model="pair.text" placeholder="Текст" style="width: 25%; margin-right: 10px;"></el-input>
                <el-input v-model="pair.matches" placeholder="Соответствие" style="width: 25%; margin-right: 10px;"></el-input>
                <el-button @click="removeMatchingPair(index)" type="danger" size="small">Удалить</el-button>
            </div>
            <br>
            <el-button @click="addMatchingPair">Добавить пару</el-button>
            <el-button @click="resetMatchingPairs">Сбросить ответы</el-button>
        </div>

        <!-- QuestionType3-->
        <div v-else-if="question.id_question_type === 3">
            <div v-for="(answer, index) in sequenceData.answersType3" :key="index">
                <el-input v-model="answer.text" placeholder="Текст элемента" style="width: 60%; margin-right: 10px;"></el-input>
                <el-input-number
                  v-model="sequenceData.answersType3[index].correctPosition"
                  :min="1"
                  :max="sequenceData.answersType3.length"
                  placeholder="Позиция"
                  style="width: 20%; margin-right: 10px;">
                </el-input-number>
                <el-button @click="removeSequenceAnswer(index)" type="danger" size="small">Удалить</el-button>
            </div><br>
            <el-button @click="addSequenceAnswer">Добавить элемент</el-button>
            <el-button @click="resetSequenceAnswers">Сбросить порядок</el-button>
        </div>

        <!-- QuestionType4-->
        <div v-else-if="question.id_question_type === 4">
            <el-input
                v-model="question.content.correctAnswer"
                style="width: 1080px"
                placeholder="Введите правильный ответ"
            />
        </div>

        <!-- QuestionType5-->
        <div v-else-if="question.id_question_type === 5">
          <el-input
            v-model="question.content.correctAnswer"
            type="textarea"
            style="width: 1080px"
            placeholder="Введите варианты правильных ответов через строку"
          />
        </div>

        <el-button type="primary" @click="saveQuestion">Сохранить</el-button>
    </div>
</template>

<style>
.text_copy {
    position: absolute;
}

.el-textarea__inner {
  min-height: 90px !important;
}
</style>
