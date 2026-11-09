<script lang="ts">
import { Vue } from "vue-class-component"

class HomeComponent extends Vue {
  handleSetEducationLevel(educationLevelId: number) {
    this.$router.push({
      name: "show-education-level",
      params: { id: educationLevelId }
    })
  }
}
export default HomeComponent;
</script>

<template>
  <div @click="handleSetEducationLevel(1)" class="educationTypeSelect">
    <img src="/img/mb.png" /><br />
    Бакалавриат
  </div>
  <div @click="handleSetEducationLevel(2)" class="educationTypeSelect">
    <img src="/img/mm.png" /><br />
    Магистратура
  </div>
</template>

<style scoped>
.educationTypeSelect {
  text-align: center;
  cursor: pointer;
  margin-top: 50px;

  img {
    max-height: 250px;
    border: 2px solid #2b2b2b;
    border-radius: 10%;
  }
}

@media (min-width: 1024px) {
  .educationTypeSelect {
    justify-self: end;
    margin: 100px 50px;

    &+.educationTypeSelect {
      justify-self: start;
    }
  }

}
</style>
