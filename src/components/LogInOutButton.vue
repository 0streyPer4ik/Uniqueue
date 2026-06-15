<template>
  <el-tag id="auth-name" v-if="isLoggedIn" :type="getTagType" size="large" effect="dark">{{ fio }}</el-tag>
  <button v-if="isLoggedIn" @click="removeAuthToken" class="auth-btn logout-btn">Выйти</button>
  <button v-else @click="goToLogin" class="auth-btn login-btn">Войти</button>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import { ElMessage } from "element-plus"
import type { MessageParams } from "element-plus"

@Options({})
export default class AuthButtons extends Vue {
  private isLoggedInState: boolean = !!localStorage.getItem("authToken")

  get isLoggedIn(): boolean {
    return this.isLoggedInState;
  }

  get fio(): string {
    const userData = localStorage.getItem("user")
    if (!userData) {
      return ""
    }

    let user
    try {
      user = JSON.parse(userData)
    } catch (error) {
      console.error("Ошибка парсинга данных:", error)
      return ""
    }
    return user.username
  }

  get getTagType(): string {
    const userData = localStorage.getItem("user")
    if (!userData) {
      return "info"
    }

    let user
    try {
      user = JSON.parse(userData)
    } catch (error) {
      console.error("Ошибка парсинга данных:", error)
      return "info"
    }
    if (user.role == "admin")
      return 'danger'
    return "info"
  }

  mounted() {
    window.addEventListener("storage", this.handleStorageChange)
  }

  beforeUnmount() {
    window.removeEventListener("storage", this.handleStorageChange)
  }

  handleStorageChange() {
    this.isLoggedInState = !!localStorage.getItem("authToken")
  }

  goToLogin(): void {
    this.$router.push("/enter")
  }

  removeAuthToken(): void {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")

    this.isLoggedInState = false
    ElMessage({
      message: "Выход выполнен!",
      type: "success",
    } as MessageParams)
    this.$router.push("/")
  }
}
</script>

<style scoped>
#auth-name {
  position: fixed;
  top: 20px;
  right: 100px;
  z-index: 1000;
  padding: 8px 16px;
  font-size: 14px;
  user-select: none;
}

.auth-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.login-btn {
  background: #4caf50;
  color: white;
}

.login-btn:hover {
  background: #388e3c;
}

.logout-btn {
  background: #ff4444;
  color: white;
}

.logout-btn:hover {
  background: #cc0000;
}
</style>
