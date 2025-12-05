<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'

// Определяем события компонента
const emit = defineEmits<{
  authSuccess: [userData: { login: string; firstName: string; lastName: string; token?: string }]
}>()

// Типы для данных формы
interface AuthFormData {
  firstName: string
  lastName: string
  school: string
  group: string
  age: string
  city: string
  login: string
  password: string
  confirmPassword: string
}

// Типы для пользователя
interface User {
  id: string
  firstName: string
  lastName: string
  school: string
  group: string
  age: string
  city: string
  login: string
  password: string
  createdAt: string
  lastLogin?: string
}

// Типы для токена
interface AuthToken {
  token: string
  userId: string
  login: string
  createdAt: string
  expiresAt: string
  signature: string
}

// Типы для JWT header
interface JWTHeader {
  alg: string
  typ: string
}

// Типы для JWT payload
interface JWTPayload {
  userId: string
  login: string
  firstName: string
  lastName: string
  iat: number
  exp: number
  random: string
}

// Типы для декодированного токена
interface DecodedToken {
  header: JWTHeader
  payload: JWTPayload
  signature: string
  isValid: boolean
}

// Реактивные переменные
const isLoginMode = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const currentUser = ref<User | null>(null)
const currentToken = ref<string>('')

// Ключи для localStorage
const STORAGE_KEYS = {
  USERS: 'auth_users_v3',
  TOKENS: 'auth_tokens_v3',
  CURRENT_TOKEN: 'current_auth_token_v3'
}

// Секретный ключ для подписи
const SECRET_KEY = 'my_secret_key_' + Date.now().toString(36)

// Реактивный объект с данными формы
const formData = reactive<AuthFormData>({
  firstName: '',
  lastName: '',
  school: '',
  group: '',
  age: '',
  city: '',
  login: '',
  password: '',
  confirmPassword: ''
})

// ==================== УТИЛИТЫ ДЛЯ РАБОТЫ С ХРАНИЛИЩЕМ ====================

const getUsers = (): User[] => {
  try {
    const users = localStorage.getItem(STORAGE_KEYS.USERS)
    return users ? JSON.parse(users) : []
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error)
    return []
  }
}

const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  } catch (error) {
    console.error('Ошибка при сохранении пользователей:', error)
  }
}

const getTokens = (): AuthToken[] => {
  try {
    const tokens = localStorage.getItem(STORAGE_KEYS.TOKENS)
    return tokens ? JSON.parse(tokens) : []
  } catch (error) {
    console.error('Ошибка при получении токенов:', error)
    return []
  }
}

const saveTokens = (tokens: AuthToken[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens))
  } catch (error) {
    console.error('Ошибка при сохранении токенов:', error)
  }
}

// ==================== УТИЛИТЫ ДЛЯ РАБОТЫ С ТОКЕНАМИ ====================

const generateSignature = (payload: string): string => {
  let hash = 0
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return (hash >>> 0).toString(36) + SECRET_KEY
}

const base64Encode = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)))
}

const base64Decode = (str: string): string => {
  return decodeURIComponent(escape(atob(str)))
}

const createJWToken = (user: User): string => {
  const header: JWTHeader = {
    alg: 'HS256',
    typ: 'JWT'
  }

  const now = Math.floor(Date.now() / 1000)
  const payload: JWTPayload = {
    userId: user.id,
    login: user.login,
    firstName: user.firstName,
    lastName: user.lastName,
    iat: now,
    exp: now + (7 * 24 * 60 * 60),
    random: Math.random().toString(36).substring(2, 15)
  }

  const encodedHeader = base64Encode(JSON.stringify(header))
  const encodedPayload = base64Encode(JSON.stringify(payload))
  const signatureData = `${encodedHeader}.${encodedPayload}`
  const signature = generateSignature(signatureData)

  const token = `${encodedHeader}.${encodedPayload}.${base64Encode(signature)}`

  return token
}

const decodeToken = (token: string): DecodedToken | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Неверный формат токена')
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const header: JWTHeader = JSON.parse(base64Decode(encodedHeader))
    const payload: JWTPayload = JSON.parse(base64Decode(encodedPayload))
    const signature = base64Decode(encodedSignature)

    const signatureData = `${encodedHeader}.${encodedPayload}`
    const expectedSignature = generateSignature(signatureData)
    const isValid = signature === expectedSignature

    return {
      header,
      payload,
      signature,
      isValid
    }
  } catch (error) {
    console.error('❌ Ошибка декодирования токена:', error)
    return null
  }
}

const isTokenValid = (token: string): boolean => {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.isValid) {
    return false
  }

  const now = Math.floor(Date.now() / 1000)
  return decoded.payload.exp > now
}

const createAuthToken = (user: User): AuthToken => {
  const tokenString = createJWToken(user)
  const decoded = decodeToken(tokenString)!

  return {
    token: tokenString,
    userId: user.id,
    login: user.login,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(decoded.payload.exp * 1000).toISOString(),
    signature: decoded.signature
  }
}

// ==================== ОСНОВНЫЕ ФУНКЦИИ АУТЕНТИФИКАЦИИ ====================

const findUserByToken = (tokenString: string): User | null => {
  try {
    if (!isTokenValid(tokenString)) {
      return null
    }

    const decoded = decodeToken(tokenString)!
    const users = getUsers()
    return users.find(user => user.id === decoded.payload.userId) || null
  } catch (error) {
    console.error('Ошибка при поиске пользователя по токену:', error)
    return null
  }
}

const checkExistingAuth = (): void => {
  try {
    const currentTokenString = localStorage.getItem(STORAGE_KEYS.CURRENT_TOKEN)

    if (currentTokenString) {
      const user = findUserByToken(currentTokenString)

      if (user) {
        currentUser.value = user
        currentToken.value = currentTokenString

        // Обновляем время последнего входа
        updateUserLastLogin(user.id)

        emit('authSuccess', {
          login: user.login,
          firstName: user.firstName,
          lastName: user.lastName,
          token: currentTokenString
        })
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_TOKEN)
      }
    }
  } catch (error) {
    console.error('Ошибка при проверке авторизации:', error)
  }
}

const updateUserLastLogin = (userId: string): void => {
  const users = getUsers()
  const userIndex = users.findIndex(user => user.id === userId)

  if (userIndex !== -1) {
    users[userIndex].lastLogin = new Date().toISOString()
    saveUsers(users)
  }
}

// ==================== UI ФУНКЦИИ ====================

const passwordMismatch = computed(() => {
  if (isLoginMode.value) return false
  return formData.password !== formData.confirmPassword && formData.confirmPassword !== ''
})

const switchToLogin = () => {
  isLoginMode.value = true
  resetMessages()
  clearForm()
}

const switchToRegister = () => {
  isLoginMode.value = false
  resetMessages()
  clearForm()
}

const resetMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const clearForm = () => {
  Object.assign(formData, {
    firstName: '',
    lastName: '',
    school: '',
    group: '',
    age: '',
    city: '',
    login: '',
    password: '',
    confirmPassword: ''
  })
}

// ==================== БИЗНЕС-ЛОГИКА ====================

const findUserByLogin = (login: string): User | null => {
  const users = getUsers()
  return users.find(user => user.login === login) || null
}

const verifyPassword = (user: User, password: string): boolean => {
  return user.password === password
}

const createUser = (): User => {
  const users = getUsers()

  if (findUserByLogin(formData.login)) {
    throw new Error('Пользователь с таким логином уже существует')
  }

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    firstName: formData.firstName,
    lastName: formData.lastName,
    school: formData.school,
    group: formData.group,
    age: formData.age,
    city: formData.city,
    login: formData.login,
    password: formData.password,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }

  users.push(newUser)
  saveUsers(users)

  return newUser
}

const authenticateUser = (): User => {
  const user = findUserByLogin(formData.login)

  if (!user) {
    throw new Error('Пользователь с таким логином не найден')
  }

  if (!verifyPassword(user, formData.password)) {
    throw new Error('Неверный пароль')
  }

  return user
}

const setupUserSession = (user: User): void => {
  const newToken = createAuthToken(user)

  const tokens = getTokens()
  tokens.push(newToken)
  saveTokens(tokens)

  localStorage.setItem(STORAGE_KEYS.CURRENT_TOKEN, newToken.token)

  currentUser.value = user
  currentToken.value = newToken.token

  // Обновляем время последнего входа
  updateUserLastLogin(user.id)
} -->

// ==================== ФУНКЦИИ ДЛЯ СТАТИСТИКИ ====================

<!-- const logUserStatistics = (user: User): void => {
  console.log('📊 =========== СТАТИСТИКА ПОЛЬЗОВАТЕЛЯ ===========');
  console.log('👤 ОСНОВНАЯ ИНФОРМАЦИЯ:');
  console.log(`   ID пользователя: ${user.id}`);
  console.log(`   Логин: ${user.login}`);
  console.log(`   Фамилия: ${user.lastName}`);
  console.log(`   Имя: ${user.firstName}`);
  console.log(`   Школа/Университет: ${user.school}`);
  console.log(`   Класс/Курс: ${user.group}`);
  console.log(`   Возраст: ${user.age}`);
  console.log(`   Город: ${user.city}`);

  console.log('📅 ВРЕМЕННЫЕ МЕТКИ:');
  console.log(`   Дата регистрации: ${new Date(user.createdAt).toLocaleString('ru-RU')}`);
  if (user.lastLogin) {
    console.log(`   Последний вход: ${new Date(user.lastLogin).toLocaleString('ru-RU')}`);
  }

  console.log('🔐 ДАННЫЕ ДЛЯ СКВОЗНОГО АНАЛИЗА:');
  console.log('   // Скопируйте строку ниже для анализа в Excel/Google Sheets //');
  console.log(`   DATA_ROW: ${user.id}|${user.login}|${user.lastName}|${user.firstName}|${user.school}|${user.group}|${user.age}|${user.city}|${user.createdAt}|${user.lastLogin || ''}`);

  console.log('📋 ДЛЯ ТАБЛИЦЫ:');
  console.log(`   ${user.lastName}\t${user.firstName}\t${user.school}\t${user.group}\t${user.age}\t${user.city}\t${user.login}\t${new Date(user.createdAt).toLocaleDateString('ru-RU')}`);

  console.log('📈 JSON ФОРМАТ (для программистов):');
  console.log(JSON.stringify({
    userId: user.id,
    login: user.login,
    personal: {
      lastName: user.lastName,
      firstName: user.firstName,
      age: user.age,
      city: user.city
    },
    education: {
      school: user.school,
      group: user.group
    },
    timestamps: {
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      localTime: new Date().toLocaleString('ru-RU')
    }
  }, null, 2));

  console.log('=============================================\n');

  // Также сохраняем в localStorage для последующего экспорта
  const stats = localStorage.getItem('user_statistics_v1') || '[]'
  const statsArray = JSON.parse(stats)
  statsArray.push({
    timestamp: new Date().toISOString(),
    userId: user.id,
    login: user.login,
    action: isLoginMode.value ? 'login' : 'registration',
    userData: user
  })
  localStorage.setItem('user_statistics_v1', JSON.stringify(statsArray))
}

const exportStatistics = (): void => {
  const stats = localStorage.getItem('user_statistics_v1')
  if (stats) {
    const statsArray = JSON.parse(stats)
    console.log('📤 ЭКСПОРТ ВСЕХ СТАТИСТИЧЕСКИХ ДАННЫХ:');
    console.log(JSON.stringify(statsArray, null, 2));

    // Создаем CSV формат
    const csv = [
      ['ID', 'Логин', 'Фамилия', 'Имя', 'Школа', 'Курс', 'Возраст', 'Город', 'Дата регистрации', 'Последний вход', 'Тип действия', 'Временная метка']
    ];

    statsArray.forEach((stat: any) => {
      csv.push([
        stat.userData.id,
        stat.userData.login,
        stat.userData.lastName,
        stat.userData.firstName,
        stat.userData.school,
        stat.userData.group,
        stat.userData.age,
        stat.userData.city,
        new Date(stat.userData.createdAt).toLocaleString('ru-RU'),
        stat.userData.lastLogin ? new Date(stat.userData.lastLogin).toLocaleString('ru-RU') : '',
        stat.action === 'login' ? 'Вход' : 'Регистрация',
        new Date(stat.timestamp).toLocaleString('ru-RU')
      ]);
    });

    console.log('📊 CSV ФОРМАТ:');
    csv.forEach(row => {
      console.log(row.join('\t'));
    });
  }
}

// ==================== ОСНОВНАЯ ФУНКЦИЯ ====================

const handleSubmit = async () => {
  if (isSubmitting.value) return

  if (!isLoginMode.value && passwordMismatch.value) {
    errorMessage.value = 'Пароли не совпадают'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    let user: User

    if (isLoginMode.value) {
      user = await authenticateUser()
      successMessage.value = 'Успешный вход в систему!'
    } else {
      user = await createUser()
      successMessage.value = 'Регистрация прошла успешно!'
    }

    // Настраиваем сессию
    setupUserSession(user)

    // Логируем статистику пользователя
    logUserStatistics(user)

    // Эмитим событие успеха
    emit('authSuccess', {
      login: user.login,
      firstName: user.firstName,
      lastName: user.lastName,
      token: currentToken.value
    })

  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Произошла ошибка. Попробуйте еще раз.'
    console.error('Auth error:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Инициализация
onMounted(() => {
  console.log('🚀 СИСТЕМА АУТЕНТИФИКАЦИИ ЗАПУЩЕНА');
  console.log('📊 Для получения статистики используйте команду: exportStatistics()');
  console.log('---');
  checkExistingAuth()

  // Добавляем глобальную функцию для экспорта статистики
  ;(window as any).exportStatistics = exportStatistics
})
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div v-if="currentUser" class="user-welcome">
        <h2>✅ Автоматическая авторизация</h2>
        <p class="user-info">Добро пожаловать, {{ currentUser.firstName }} {{ currentUser.lastName }}!</p>
        <div class="user-details">
          <div class="detail-row">
            <span class="detail-label">Логин:</span>
            <span class="detail-value">{{ currentUser.login }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Школа/Университет:</span>
            <span class="detail-value">{{ currentUser.school }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Класс/Курс:</span>
            <span class="detail-value">{{ currentUser.group }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Возраст:</span>
            <span class="detail-value">{{ currentUser.age }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Город:</span>
            <span class="detail-value">{{ currentUser.city }}</span>
          </div>
        </div>

        <div class="auto-login-notice">
          <p>Вы были автоматически авторизованы с помощью токена.</p>
          <p>Переходите к тестированию!</p>
        </div>

        <div class="debug-info">
          <p><small>ℹ️ Статистика пользователя выведена в консоль браузера (F12)</small></p>
          <button @click="exportStatistics" class="stats-btn">
            Экспорт статистики
          </button>
        </div>
      </div>

      <!-- Если пользователь не авторизован -->
      <div v-else>
        <h1 class="auth-title">{{ isLoginMode ? 'Вход в систему' : 'Пройти тестирование знаний по ИТ' }}</h1>

        <div class="mode-switcher">
          <button
            @click="switchToLogin"
            :class="{ active: isLoginMode }"
            class="mode-btn"
          >
            Вход
          </button>
          <button
            @click="switchToRegister"
            :class="{ active: !isLoginMode }"
            class="mode-btn"
          >
            Регистрация
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div v-if="!isLoginMode" class="compact-form">
            <div class="form-row">
              <div class="form-group compact">
                <input
                  v-model="formData.firstName"
                  type="text"
                  required
                  placeholder="Имя"
                  class="form-input"
                >
              </div>

              <div class="form-group compact">
                <input
                  v-model="formData.lastName"
                  type="text"
                  required
                  placeholder="Фамилия"
                  class="form-input"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group compact">
                <input
                  v-model="formData.school"
                  type="text"
                  required
                  placeholder="Школа/Университет"
                  class="form-input"
                >
              </div>

              <div class="form-group compact">
                <input
                  v-model="formData.group"
                  type="text"
                  required
                  placeholder="Класс/Курс"
                  class="form-input"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group compact">
                <input
                  v-model="formData.age"
                  type="number"
                  min="7"
                  max="99"
                  required
                  placeholder="Возраст"
                  class="form-input"
                >
              </div>

              <div class="form-group compact">
                <input
                  v-model="formData.city"
                  type="text"
                  required
                  placeholder="Город"
                  class="form-input"
                >
              </div>
            </div>
          </div>
          <div class="form-group">
            <input
              v-model="formData.login"
              type="text"
              required
              placeholder="Логин"
              class="form-input"
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <input
                v-model="formData.password"
                type="password"
                required
                :placeholder="isLoginMode ? 'Пароль' : 'Придумайте пароль'"
                class="form-input"
              >
            </div>

            <div v-if="!isLoginMode" class="form-group">
              <input
                v-model="formData.confirmPassword"
                type="password"
                required
                placeholder="Подтвердите пароль"
                class="form-input"
              >
              <div v-if="passwordMismatch" class="error-message">
                Пароли не совпадают
              </div>
            </div>
          </div>

          <button
            type="submit"
            class="submit-btn"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Загрузка...' : (isLoginMode ? 'Войти' : 'Зарегистрироваться') }}
          </button>
        </form>

        <div v-if="errorMessage" class="error-message global-error">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
          <p v-if="!isLoginMode" class="success-hint">
            Данные пользователя сохранены. Информация для статистики выведена в консоль браузера.
          </p>
        </div>

        <div class="stats-notice">
          <p>ℹ️ Информация о пользователе выводится в консоль браузера для статистики. Все права защищены.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 700px;
  min-width: 500px;
  border: 1px solid #e0e0e0;
}

.auth-title {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.user-welcome {
  text-align: center;
  color: #333;
}

.user-welcome h2 {
  margin-bottom: 16px;
  color: #10b981;
  font-size: 20px;
}

.user-info {
  font-size: 16px;
  margin-bottom: 16px;
  font-weight: 500;
  color: #444;
}

.user-details {
  text-align: left;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  border-left: 4px solid #6366f1;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
  padding: 6px 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #555;
  font-size: 13px;
  min-width: 160px;
}

.detail-value {
  color: #333;
  font-size: 14px;
  text-align: right;
  flex: 1;
  font-weight: 500;
}

.auto-login-notice {
  margin: 20px 0;
  padding: 12px 15px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #10b981;
  font-size: 14px;
}

.debug-info {
  margin-top: 20px;
  padding: 12px 15px;
  background: #f0f0f0;
  border-radius: 8px;
  font-size: 13px;
}

.stats-btn {
  margin-top: 10px;
  padding: 8px 15px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
  width: 100%;
}

.stats-btn:hover {
  background: #5a5cf3;
  transform: translateY(-1px);
}

.mode-switcher {
  display: flex;
  margin-bottom: 25px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.mode-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 14px;
  color: #666;
}

.mode-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.mode-btn:not(.active):hover {
  background: #e9ecef;
  color: #333;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.compact-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.compact {
  margin-bottom: 0;
}

.form-input {
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #333;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder {
  color: #999;
  font-size: 13px;
}

.submit-btn {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 5px;
  letter-spacing: 0.5px;
  width: 100%;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
}

.global-error {
  text-align: center;
  font-size: 13px;
  margin-top: 15px;
  padding: 10px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
}

.success-message {
  color: #10b981;
  font-size: 13px;
  text-align: center;
  margin-top: 15px;
  padding: 10px 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
}

.success-hint {
  font-size: 11px;
  color: #0a8;
  margin-top: 8px;
  font-style: italic;
}

.stats-notice {
  margin-top: 15px;
  padding: 10px 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  font-size: 11px;
  color: #0369a1;
  text-align: center;
}

@media (max-width: 768px) {
  .auth-card {
    min-width: unset;
    max-width: 95%;
    padding: 20px;
    margin: 10px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .auth-title {
    font-size: 20px;
  }

  .user-welcome h2 {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .auth-container {
    padding: 10px;
  }

  .auth-card {
    padding: 15px;
  }

  .auth-title {
    font-size: 18px;
    margin-bottom: 20px;
  }

  .mode-switcher {
    margin-bottom: 20px;
  }

  .mode-btn {
    padding: 10px;
    font-size: 13px;
  }

  .form-input {
    padding: 10px 12px;
    font-size: 13px;
  }

  .submit-btn {
    padding: 12px;
    font-size: 14px;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .detail-label {
    min-width: unset;
    font-size: 12px;
  }

  .detail-value {
    text-align: left;
    font-size: 13px;
  }
}
</style>
