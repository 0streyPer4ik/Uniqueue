<script lang="ts">
import axios from 'axios';

export default {
  data() {
    return {
      lastName: '',
      firstName: '',
      middleName: '',
      group: '',
      submissionSuccess: false,
      submissionError: false,
      errorMessage: '',
      id: null,
    };
  },
  methods: {
    async submitForm() {
      try {
        const formData = {
          lastName: this.lastName,
          firstName: this.firstName,
          middleName: this.middleName,
          group: this.group,
        };

        console.log('Отправка данных:', formData)

        const dataToSend = {
            name: `${this.lastName} ${this.firstName} ${this.middleName} `,
            group: this.group,
        };

        const response = await axios.post('http://test.local/students', dataToSend)

        console.log('Ответ от сервера:', response);

        this.$router.push(`/list`);

        this.submissionSuccess = true
        this.id = response.data.id
        this.submissionError = false

        this.lastName = ''
        this.firstName = ''
        this.middleName = ''
        this.group = ''

      } catch (error) {
        console.error('Ошибка при отправке данных:', error)
        console.log('Ошибка response:', error.response)

        this.submissionSuccess = false
        this.submissionError = true
        this.errorMessage = error.response?.data?.error || error.message || 'Неизвестная ошибка'
      }
    },
  },
};
</script>

<template>
  <div class="container">
    <h1>Вход в систему тестирования</h1>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="lastName">Фамилия:</label>
        <input
          type="text"
          id="lastName"
          v-model="lastName"
          class="form-control"
          required
        />
      </div>

      <div class="form-group">
        <label for="firstName">Имя:</label>
        <input
          type="text"
          id="firstName"
          v-model="firstName"
          class="form-control"
          required
        />
      </div>

      <div class="form-group">
        <label for="middleName">Отчество:</label>
        <input
          type="text"
          id="middleName"
          v-model="middleName"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="group">Группа:</label>
        <input
          type="text"
          id="group"
          v-model="group"
          class="form-control"
          required
        />
      </div>

      <button type="submit" class="btn btn-primary">Начать тестирование</button>
    </form>

    <div v-if="submissionSuccess" class="alert alert-success mt-3">
      Данные успешно отправлены!  ID: {{ id }}
    </div>

    <div v-if="submissionError" class="alert alert-danger mt-3">
      Ошибка при отправке данных: {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.alert {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
