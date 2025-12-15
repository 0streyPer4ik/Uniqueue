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
        content: {
          description: null as string | null,
          qDescription: [] as string[],
          answersType2: [] as AnswerType2[]
        },
        answer: null as number[] | null,
        correctAnswers: [] as number[]
      }),
    },
  },
  components: {
    ArrowUp,
    ArrowDown
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
  movingIndices: Set<number> = new Set()
  shuffledData: MatchingData | null = null
  shuffledOrder: number[] = []
  hasUserInteracted = false

  animationStyle: {[key: number]: {transform: string, transition: string, zIndex: number}} = {}

  itemHeights: number[] = []

  created() {
    this.shuffleData()
  }

  mounted() {
    this.calculateItemHeights()
    window.addEventListener('resize', this.calculateItemHeights)
  }

  beforeUnmount() {
    window.removeEventListener('resize', this.calculateItemHeights)
  }

  shouldDisableDownButton(index: number): boolean {
    const shuffledLength = this.shuffledData?.content?.answersType2?.length || 0
    return index >= shuffledLength - 1 || this.isAnimating
  }

  shuffleArray<T>(array: T[]): T[] {
    const newArray: T[] = [...array];
    for (let i: number = newArray.length - 1; i > 0; i--) {
      const j: number = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  shuffleData() {
    if (!this.qData?.content?.answersType2 || !this.qData.content.qDescription) {
      return;
    }

    this.shuffledData = JSON.parse(JSON.stringify(this.qData));

    if (!this.shuffledData?.content) {
      return;
    }

    this.shuffledData.content.answersType2 = this.shuffleArray([...this.qData.content.answersType2]);

    const shuffledDescriptions = this.shuffleArray([...this.qData.content.qDescription]);

    this.shuffledOrder = shuffledDescriptions.map(desc =>
      this.qData.content!.qDescription.indexOf(desc)
    );

    this.shuffledData.content.qDescription = shuffledDescriptions;

    this.$nextTick(() => {
      this.calculateItemHeights()
    })
  }

  getOriginalIndex(shuffledIndex: number) {
    return this.shuffledOrder[shuffledIndex]
  }

  calculateItemHeights() {
    this.$nextTick(() => {
      const definitionItems = this.$el.querySelectorAll('.definition-item')
      const termItems = this.$el.querySelectorAll('.term-item')

      if (definitionItems.length === 0 || termItems.length === 0) return

      const heights: number[] = []
      const itemCount = Math.max(definitionItems.length, termItems.length)

      for (let i = 0; i < itemCount; i++) {
        let maxHeight = 80

        if (definitionItems[i]) {
          const defHeight = definitionItems[i].getBoundingClientRect().height
          maxHeight = Math.max(maxHeight, defHeight)
        }

        if (termItems[i]) {
          const termHeight = termItems[i].getBoundingClientRect().height
          maxHeight = Math.max(maxHeight, termHeight)
        }

        heights.push(maxHeight)
      }

      this.itemHeights = heights
    })
  }

  async moveItem(index: number, direction: number) {
    if (this.isAnimating || !this.shuffledData?.content) return

    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= this.shuffledData.content.answersType2.length) return

    this.hasUserInteracted = true
    this.isAnimating = true

    this.movingIndices = new Set([index, newIndex])

    const moveDistance = this.getItemMoveDistance(index, direction)

    this.animationStyle[index] = {
      transform: `translateY(${moveDistance}px)`,
      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 10
    }

    this.animationStyle[newIndex] = {
      transform: `translateY(${-moveDistance}px)`,
      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 10
    }

    setTimeout(() => {
      if (this.shuffledData?.content?.answersType2) {
        const newAnswers = [...this.shuffledData.content.answersType2]

        if (index >= 0 && index < newAnswers.length &&
            newIndex >= 0 && newIndex < newAnswers.length) {
          [newAnswers[index], newAnswers[newIndex]] = [
            newAnswers[newIndex],
            newAnswers[index],
          ]

          if (this.shuffledData.content) {
            this.shuffledData.content.answersType2 = newAnswers
          }
        }
      }

      this.resetAnimationStyles()

      setTimeout(() => {
        this.movingIndices.clear()
        this.isAnimating = false
        this.checkAnswer()
        this.$nextTick(() => {
          this.calculateItemHeights()
        })
      }, 50)
    }, 300)
  }

  getItemMoveDistance(index: number, direction: number): number {
    const itemHeight = this.itemHeights[index] || 80
    const margin = 16
    return (itemHeight + margin) * direction
  }

  resetAnimationStyles() {
    Object.keys(this.animationStyle).forEach(key => {
      const index = parseInt(key)
      this.animationStyle[index] = {
        transform: 'translateY(0)',
        transition: 'transform 0s',
        zIndex: 1
      }
    })
  }

  getTermItemStyle(index: number) {
    if (this.animationStyle[index]) {
      return this.animationStyle[index]
    }
    return {
      transform: 'translateY(0)',
      transition: 'transform 0s',
      zIndex: 1
    }
  }

  checkAnswer() {
    if (!this.shuffledData?.content || !this.qData?.content || !this.hasUserInteracted) {
      this.$emit('answer-submitted', null)
      return
    }

    let allCorrect = true
    for (let i = 0; i < this.shuffledData.content.qDescription.length; i++) {
      const originalIndex = this.getOriginalIndex(i)
      if (
        !this.qData.content.qDescription?.[originalIndex] ||
        !this.shuffledData.content.answersType2?.[i] ||
        this.qData.content.qDescription[originalIndex] !== this.shuffledData.content.answersType2[i].matches
      ) {
        allCorrect = false
        break
      }
    }

    this.$emit('answer-submitted', allCorrect)
  }
}
</script>

<template>
  <div class="question-container">
    <div class="description">
      {{ shuffledData?.content?.description || qData?.content?.description }}
    </div>

    <div class="matching-container">
      <div class="definitions-column">
        <div
          class="definition-item-wrapper"
          v-for="(description, index) in shuffledData?.content?.qDescription || qData?.content?.qDescription"
          :key="'def-' + index"
          :style="{
            height: itemHeights[index] ? `${itemHeights[index]}px` : 'auto',
            marginBottom: index < ((shuffledData?.content?.qDescription?.length || 0) - 1) ? '16px' : '0'
          }"
        >
          <div class="definition-item">
            <div class="definition-content">
              <div class="item-text">{{ description }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="terms-column">
        <div
          class="term-item-wrapper"
          v-for="(answer, index) in shuffledData?.content?.answersType2 || qData?.content?.answersType2"
          :key="'term-' + index"
          :style="{
            height: itemHeights[index] ? `${itemHeights[index]}px` : 'auto',
            marginBottom: index < ((shuffledData?.content?.answersType2?.length || 0) - 1) ? '16px' : '0'
          }"
        >
          <div
            class="term-item"
            :style="getTermItemStyle(index)"
          >
            <div class="term-content">
              <div class="item-text">{{ answer.text }}</div>
            </div>

            <div class="term-buttons">
              <el-button
                type="primary"
                size="small"
                @click="moveItem(index, -1)"
                :disabled="index === 0 || isAnimating"
                circle
                class="move-button"
              >
                <el-icon><ArrowUp /></el-icon>
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="moveItem(index, 1)"
                :disabled="shouldDisableDownButton(index)"
                circle
                class="move-button"
              >
                <el-icon><ArrowDown /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.question-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.description {
  margin-bottom: 30px;
  word-break: break-word;
  overflow-wrap: break-word;
}

.matching-container {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  position: relative;
}

.definitions-column,
.terms-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  position: relative;
}

.definition-item-wrapper,
.term-item-wrapper {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.definition-item {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  min-height: 80px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.definition-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.15);
}

.term-item {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px 20px 16px 20px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  min-height: 80px;
  box-sizing: border-box;
  will-change: transform;
}

.term-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.15);
}

.definition-content,
.term-content {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 15px;
  flex: 1;
}

.item-text {
  flex: 1;
  font-size: 1rem;
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: break-word;
  min-height: 0;
  color: black;
}

.term-buttons {
  position: absolute;
  right: -55px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 5;
}

.move-button {
  width: 36px !important;
  height: 36px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #409eff, #66b1ff) !important;
  border: none !important;
  padding: 0 !important;
  box-shadow: 0 3px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.move-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #66b1ff, #409eff) !important;
  transform: scale(1.1) !important;
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.4) !important;
}

.move-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #c0c4cc !important;
  box-shadow: none !important;
}

.el-icon {
  font-size: 18px !important;
  width: 18px;
  height: 18px;
}

@media (max-width: 1200px) {
  .matching-container {
    gap: 50px;
  }

  .term-buttons {
    right: -50px;
  }
}

@media (max-width: 992px) {
  .matching-container {
    gap: 40px;
  }

  .term-buttons {
    right: -45px;
  }
}

@media (max-width: 768px) {
  .question-container {
    padding: 15px;
  }

  .matching-container {
    gap: 15px;
    flex-direction: row;
  }

  .description {
    font-size: 1.1rem;
    padding: 12px;
    margin-bottom: 20px;
  }

  .definition-item,
  .term-item {
    padding: 12px;
    min-height: 70px;
  }

  .item-text {
    font-size: 0.9rem;
  }

  .term-buttons {
    position: absolute;
    right: -40px;
    gap: 8px;
  }

  .move-button {
    width: 32px !important;
    height: 32px !important;
  }

  .el-icon {
    font-size: 16px !important;
  }

  .definitions-column,
  .terms-column {
    min-width: calc(50% - 8px);
  }
}

@media (max-width: 600px) {
  .matching-container {
    gap: 10px;
  }

  .definition-item,
  .term-item {
    padding: 10px;
    min-height: 60px;
  }

  .item-text {
    font-size: 0.85rem;
    line-height: 1.4;
  }

  .term-buttons {
    right: -35px;
  }

  .move-button {
    width: 28px !important;
    height: 28px !important;
  }

  .el-icon {
    font-size: 14px !important;
  }
}

@media (max-width: 480px) {
  .question-container {
    padding: 10px;
  }

  .description {
    font-size: 1rem;
    padding: 10px;
  }

  .matching-container {
    gap: 8px;
  }

  .definition-item,
  .term-item {
    padding: 8px;
    min-height: 55px;
    border-radius: 8px;
  }

  .item-text {
    font-size: 0.8rem;
  }

  .term-buttons {
    right: -30px;
    gap: 6px;
  }

  .move-button {
    width: 26px !important;
    height: 26px !important;
  }

  .el-icon {
    font-size: 12px !important;
  }
}

@media (max-width: 360px) {
  .definition-item,
  .term-item {
    padding: 6px;
    min-height: 50px;
  }

  .item-text {
    font-size: 0.75rem;
  }

  .term-buttons {
    right: -28px;
  }

  .move-button {
    width: 24px !important;
    height: 24px !important;
  }
}
</style>
