<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { ArrowUp, ArrowDown } from "@element-plus/icons-vue"

interface AnswerType3 {
  text: string
  correctPosition: number
}

interface QData {
  id: number
  id_question_type: number
  content: {
    description: string
    answersType3: AnswerType3[]
  };
  id_subject: number
}

@Options({
  props: {
    qData: {
      type: Object as () => QData,
      required: true,
    },
  },
  components: {
    ArrowUp,
    ArrowDown,
  },
  emits: ['answer-submitted'],
  watch: {
    'shuffledAnswers': {
      handler: 'checkAnswer',
      deep: true
    }
  }
})
export default class QuestionType3Component extends Vue {
  qData!: QData
  isAnimating = false
  movingItems: {index: number, direction: number, state: 'animating' | 'complete'}[] = []
  shuffledAnswers: AnswerType3[] = []
  hasUserInteracted = false // Флаг для отслеживания взаимодействия пользователя

  created() {
    this.shuffleAnswers()
  }

  shuffleAnswers() {
    this.shuffledAnswers = [...this.qData.content.answersType3]
    for (let i = this.shuffledAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledAnswers[i], this.shuffledAnswers[j]] =
        [this.shuffledAnswers[j], this.shuffledAnswers[i]]
    }
  }

  async moveItem(index: number, direction: number) {
    if (this.isAnimating) return

    this.hasUserInteracted = true // Пользователь взаимодействовал с ответами
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= this.shuffledAnswers.length) return

    this.isAnimating = true
    this.movingItems = [
      {index, direction: direction, state: 'animating'},
      {index: newIndex, direction: -direction, state: 'animating'}
    ]

    setTimeout(() => {
      const newAnswers = [...this.shuffledAnswers];
      [newAnswers[index], newAnswers[newIndex]] = [
        newAnswers[newIndex],
        newAnswers[index],
      ];
      this.shuffledAnswers = newAnswers

      this.movingItems = [
        {index, direction: direction, state: 'complete'},
        {index: newIndex, direction: -direction, state: 'complete'}
      ]

      setTimeout(() => {
        this.movingItems = []
        this.isAnimating = false
      }, 50)
    }, 300)
  }

  checkAnswer() {
    if (!this.hasUserInteracted) {
      // Если пользователь не взаимодействовал с ответами, не отправляем результат
      this.$emit('answer-submitted', null)
      return
    }

    let allCorrect = true;
    for (let i = 0; i < this.shuffledAnswers.length; i++) {
      if (i !== this.shuffledAnswers[i].correctPosition) {
        allCorrect = false;
        break
      }
    }

    this.$emit('answer-submitted', allCorrect)
  }
}
</script>

<template>
  <div>
    <div class="description">
      {{ qData.content.description }}
    </div>
    <el-row>
      <el-col :lg="24">
        <div class="answers-container">
          <div
            class="answer-item"
            v-for="(answer, index) in shuffledAnswers"
            :key="index"
            :class="{
              'move-up': movingItems.some(item => item.index === index && item.direction === -1),
              'move-down': movingItems.some(item => item.index === index && item.direction === 1),
              'move-complete': movingItems.some(item => item.index === index && item.state === 'complete')
            }"
          >
            <el-alert
              type="info"
              :title="answer.text"
              :closable="false"
              class="alert-content"
            />
            <div class="answer-buttons">
              <el-button
                type="primary"
                size="small"
                @click="moveItem(index, -1)"
                :disabled="index === 0 || isAnimating"
                circle
                class="el-button_class"
              >
                <el-icon><ArrowUp /></el-icon>
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="moveItem(index, 1)"
                :disabled="index === shuffledAnswers.length - 1 || isAnimating"
                circle
                class="el-button_class"
              >
                <el-icon><ArrowDown /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
  <br>
</template>

<style scoped>
.answers-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 10px 0 10px 0;
}

.answer-item {
  display: flex;
  align-items: center;
  min-height: 80px;
  transition: transform 0.3s ease;
  position: relative;
}

.answer-item.move-up {
  transform: translateY(-100%);
  z-index: 1;
}

.answer-item.move-down {
  transform: translateY(100%);
  z-index: 1;
}

.answer-item.move-complete {
  transform: translateY(0);
  transition: none;
}

.alert-content {
  flex-grow: 1;
  display: flex;
  align-items: center;
  height: 100%;
}

.answer-buttons {
  position: absolute;
  right: -58px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.el-button_class {
  width: 30px !important;
  height: 30px !important;
}

.el-icon {
  font-size: 18px !important;
}


/* Для мобильных устройств */
@media (min-width: 320px) and (max-width: 768px) {
  .answer-buttons {
    position: static;
    margin-left: 10px;
    flex-direction: row;
  }

  .answers-container {
      margin: 10px 0 0 0;
  }

  .answer-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .alert-content {
    width: 100%;
    margin-bottom: 8px;
  }

  .description {
    font-size: 1em;
    margin: 5px 0;
  }

  .answer-buttons {
    margin-bottom: 15px;
  }

  .answer-buttons {
    margin-left: 0;
  }

}
</style>
