<script lang="ts">
import { Options, Vue } from "vue-class-component"

@Options({
  props: {
    val: String
  },
})
export default class QuestionComponent extends Vue {
  val!: string
}

</script>

<template>
  ++ {{ val }}
</template>
