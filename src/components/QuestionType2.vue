<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { ArrowUp, ArrowDown } from "@element-plus/icons-vue"

interface AnswerType2 {
  text: string
  matches: string
}

interface MatchingDataContent {
  description: string | null
  qDescription: string[]
  answersType2: AnswerType2[]
}

interface MatchingData {
  content: MatchingDataContent | null
  answer: number[] | null
  correctAnswers: number[]
}

@Options({
  props: {
    qData: {
      type: Object as () => MatchingData | undefined,
      required: false,
      default: () => ({
        content: { description: null, qDescription: [], answersType2: [] },
        answer: null,
        correctAnswers: [],
      }),
    },
  },
  components: {
    ArrowUp,
    ArrowDown,
  },
  emits: ['answer-submitted'],
  watch: {
    'shuffledData.content.answersType2': {
      handler: 'checkAnswer',
      deep: true
    }
  }
})
export default class QuestionType2Component extends Vue {
  qData!: MatchingData
  isAnimating = false
  movingItems: {index: number, direction: number, state: 'animating' | 'complete'}[] = []
  shuffledData: MatchingData | null = null
  shuffledOrder: number[] = []
  hasUserInteracted = false // Флаг, указывающий было ли взаимодействие с ответами

  created() {
    this.shuffleData()
  }

  shuffleArray(array: any[]) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  shuffleData() {
    if (!this.qData?.content) return

    this.shuffledData = JSON.parse(JSON.stringify(this.qData))
    this.shuffledData.content.answersType2 = this.shuffleArray(this.shuffledData.content.answersType2)

    const shuffledDescriptions = this.shuffleArray([...this.shuffledData.content.qDescription])
    this.shuffledOrder = shuffledDescriptions.map(desc =>
      this.shuffledData.content.qDescription.indexOf(desc)
    )
    this.shuffledData.content.qDescription = shuffledDescriptions
  }

  getOriginalIndex(shuffledIndex: number) {
    return this.shuffledOrder[shuffledIndex]
  }

  async moveItem(index: number, direction: number) {
    if (this.isAnimating || !this.shuffledData?.content) return

    this.hasUserInteracted = true // Пользователь взаимодействовал с ответами
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= this.shuffledData.content.answersType2.length) return

    this.isAnimating = true
    this.movingItems = [
      {index, direction: direction, state: 'animating'},
      {index: newIndex, direction: -direction, state: 'animating'}
    ]

    setTimeout(() => {
      const newAnswers = [...this.shuffledData.content.answersType2];
      [newAnswers[index], newAnswers[newIndex]] = [
        newAnswers[newIndex],
        newAnswers[index],
      ];
      this.shuffledData.content.answersType2 = newAnswers

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
    if (!this.shuffledData?.content || !this.hasUserInteracted) {
      // Если пользователь не взаимодействовал с ответами, не отправляем результат
      this.$emit('answer-submitted', null)
      return
    }

    let allCorrect = true
    for (let i = 0; i < this.shuffledData.content.qDescription.length; i++) {
      const originalIndex = this.getOriginalIndex(i)
      if (this.qData.content.qDescription[originalIndex] !== this.shuffledData.content.answersType2[i].matches) {
        allCorrect = false
        break
      }
    }

    this.$emit('answer-submitted', allCorrect)
  }
}
</script>

<template>
  <div class="description">
    {{ shuffledData?.content?.description || qData?.content?.description }}
  </div>
  <el-row>
    <el-col :lg="24">
      <div class="matching-container">
        <div class="definitions-column">
          <div
            class="definition-item"
            v-for="(description, index) in shuffledData?.content?.qDescription || qData?.content?.qDescription"
            :key="'def-' + index"
          >
            <el-alert
              type="info"
              :title="description"
              :closable="false"
              class="alert-content"
            />
          </div>
        </div>

        <div class="terms-column">
          <div
            class="term-item"
            v-for="(answer, index) in shuffledData?.content?.answersType2 || qData?.content?.answersType2"
            :key="'term-' + index"
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
            <div class="term-buttons">
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
                :disabled="index === (shuffledData?.content?.answersType2 || qData?.content?.answersType2).length - 1 || isAnimating"
                circle
                class="el-button_class"
              >
                <el-icon><ArrowDown /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped>
/* Стили остаются без изменений */
.matching-container {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.definitions-column,
.terms-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
  margin: 12px 0 0 10px;
}

.definition-item,
.term-item {
  display: flex;
  align-items: center;
  min-height: 80px;
  transition: transform 0.3s ease;
  position: relative;
}

.term-item.move-up {
  transform: translateY(-100%);
  z-index: 1;
}

.term-item.move-down {
  transform: translateY(100%);
  z-index: 1;
}

.term-item.move-complete {
  transform: translateY(0);
  transition: none;
}

.alert-content {
  flex-grow: 1;
  display: flex;
  align-items: center;
  height: 100%;
}

.term-buttons {
  position: absolute;
  right: -58px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.large-button {
  width: 44px !important;
  height: 44px !important;
  font-size: 18px;
}

.el-icon {
  font-size: 25px !important;
}

.term-item.move-up {
  transform: translateY(-100%);
  z-index: 1;
}

.term-item.move-down {
  transform: translateY(100%);
  z-index: 1;
}

.term-item.move-complete {
  transform: translateY(0);
  transition: none;
}

.el-button_class {
  width: 30px !important;
  height: 30px !important;
}


@media (min-width: 320px) and (max-width: 768px) {
  .term-buttons {
    position: static;
    margin-left: 10px;
  }

  .definitions-column {
    margin-left: 0;
  }

  .definition-item {
    width: 120px;
    height: 120px;
    font-size: 0.8em;
  }

  .term-item {
    width: 165px;
    height: 120px;
  }

  .description {
    font-size: 1.1em;
    margin: 5px 0;
  }
}
</style>
