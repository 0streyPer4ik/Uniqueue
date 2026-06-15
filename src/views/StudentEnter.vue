<template>
  <div class="enter-over">
    <div class="enter-container">
      <div class="enter-card">
        <h2 class="enter-title">Вход для студентов</h2>

        <form @submit.prevent="handleLogin" class="enter-form">
          <div class="form-group">
            <label for="studentId" class="form-label">ID студента</label>
            <input id="studentId" v-model="studentId" type="text" class="form-input" placeholder="Введите ваш ID" required />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Пароль</label>
            <input id="password" v-model="password" type="password" class="form-input" placeholder="Введите пароль" required />
          </div>

          <button type="submit" class="enter-btn" :disabled="isLoading">
            {{ isLoading ? "Вход..." : "Войти" }}
          </button>
        </form>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import axios from "axios";
import { ElMessage } from "element-plus";
import type { MessageParams } from "element-plus";

class StudentEnter extends Vue {
  studentId = "";
  password = "";
  isLoading = false;
  error = "";

  async handleLogin(): Promise<void> {
    this.isLoading = true;
    this.error = "";

    const loginData = {
      studentId: this.studentId,
      password: this.password,
    };
    axios
      .post("/login", loginData)
      .then((response) => {
        if (response.data.success) {
          ElMessage({
            message: "Успешно вошли",
            type: "success",
          } as MessageParams);
          localStorage.setItem("authToken", response.data.token)
          localStorage.setItem("user", JSON.stringify(response.data.user))
          // this.$router.push("/")
          window.location.replace('/')
        } else {
          ElMessage({
            message: response.data.message,
            type: "error",
          } as MessageParams);
        }
        this.isLoading = false;
      })
      .catch((error) => {
        console.error("Ошибка!", error);
        ElMessage({
          message: "Ошибка входа!",
          type: "error",
        } as MessageParams);
        this.isLoading = false;
      });
  }
}

export default StudentEnter;
</script>

<style scoped>
.enter-over {
  position: fixed;
  left: 0px;
  top: 0px;
  bottom: 0px;
  right: 0px;
}

.enter-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.enter-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.enter-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.enter-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.enter-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.enter-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  text-align: center;
}
</style>
