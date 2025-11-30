<!-- <script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'

// Определяем события компонента
const emit = defineEmits<{
  authSuccess: [userData: { login: string; firstName: string; lastName: string; token?: string }]
}>()

// Типы для данных формы
interface AuthFormData {
  lastName: string
  firstName: string
  group: string
  login: string
  password: string
  confirmPassword: string
}

// Типы для пользователя
interface User {
  id: string
  lastName: string
  firstName: string
  group: string
  login: string
  password: string
  createdAt: string
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
const debugInfo = ref<string>('')

// Ключи для localStorage
const STORAGE_KEYS = {
  USERS: 'auth_users_v2',
  TOKENS: 'auth_tokens_v2',
  CURRENT_TOKEN: 'current_auth_token_v2'
}

// Секретный ключ для подписи
const SECRET_KEY = 'my_secret_key_123'

// Реактивный объект с данными формы
const formData = reactive<AuthFormData>({
  lastName: '',
  firstName: '',
  group: '',
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

const createJWToken = (userId: string, login: string): string => {
  const header: JWTHeader = {
    alg: 'HS256',
    typ: 'JWT'
  }

  const now = Math.floor(Date.now() / 1000)
  const payload: JWTPayload = {
    userId,
    login,
    iat: now,
    exp: now + (7 * 24 * 60 * 60),
    random: Math.random().toString(36).substring(2, 15)
  }

  const encodedHeader = base64Encode(JSON.stringify(header))
  const encodedPayload = base64Encode(JSON.stringify(payload))
  const signatureData = `${encodedHeader}.${encodedPayload}`
  const signature = generateSignature(signatureData)

  const token = `${encodedHeader}.${encodedPayload}.${base64Encode(signature)}`

  console.log('🔐 СГЕНЕРИРОВАН НОВЫЙ ТОКЕН:')
  console.log('📦 Полный токен:', token)
  console.log('📝 Header:', header)
  console.log('📄 Payload:', payload)
  console.log('🖊️ Signature:', signature)
  console.log('---')

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

    const decoded: DecodedToken = {
      header,
      payload,
      signature,
      isValid
    }

    console.log('🔍 ДЕКОДИРОВАНИЕ ТОКЕНА:')
    console.log('📦 Входной токен:', token)
    console.log('📝 Header:', header)
    console.log('📄 Payload:', payload)
    console.log('🖊️ Signature:', signature)
    console.log('✅ Валидность:', isValid)
    console.log('⏰ Срок действия:', new Date(payload.exp * 1000).toLocaleString())
    console.log('---')

    return decoded
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

const createAuthToken = (userId: string, login: string): AuthToken => {
  const tokenString = createJWToken(userId, login)
  const decoded = decodeToken(tokenString)!

  return {
    token: tokenString,
    userId,
    login,
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
      console.log('🔎 ПРОВЕРКА СУЩЕСТВУЮЩЕЙ АВТОРИЗАЦИИ:')
      const user = findUserByToken(currentTokenString)

      if (user) {
        currentUser.value = user
        currentToken.value = currentTokenString
        console.log('✅ Пользователь авторизован:', user.login)
        // АВТОМАТИЧЕСКИ ЭМИТИМ СОБЫТИЕ ПРИ НАЛИЧИИ ВАЛИДНОГО ТОКЕНА
        emit('authSuccess', {
          login: user.login,
          firstName: user.firstName,
          lastName: user.lastName,
          token: currentTokenString
        })
      } else {
        console.log('❌ Токен невалиден, удаляем')
        localStorage.removeItem(STORAGE_KEYS.CURRENT_TOKEN)
      }
      console.log('---')
    } else {
      console.log('🔎 АКТИВНЫХ СЕССИЙ НЕ НАЙДЕНО')
    }
  } catch (error) {
    console.error('Ошибка при проверке авторизации:', error)
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
  updateDebugInfo()
}

const switchToRegister = () => {
  isLoginMode.value = false
  resetMessages()
  clearForm()
  updateDebugInfo()
}

const resetMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const clearForm = () => {
  Object.assign(formData, {
    lastName: '',
    firstName: '',
    group: '',
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
    lastName: formData.lastName,
    firstName: formData.firstName,
    group: formData.group,
    login: formData.login,
    password: formData.password,
    createdAt: new Date().toISOString()
  }

  users.push(newUser)
  saveUsers(users)

  console.log('👤 СОЗДАН НОВЫЙ ПОЛЬЗОВАТЕЛЬ:')
  console.log('ID:', newUser.id)
  console.log('Логин:', newUser.login)
  console.log('Имя:', newUser.firstName, newUser.lastName)
  console.log('---')

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
  const newToken = createAuthToken(user.id, user.login)

  const tokens = getTokens()
  tokens.push(newToken)
  saveTokens(tokens)

  localStorage.setItem(STORAGE_KEYS.CURRENT_TOKEN, newToken.token)

  currentUser.value = user
  currentToken.value = newToken.token

  console.log('🔑 СЕССИЯ СОЗДАНА:')
  console.log('Пользователь:', user.login)
  console.log('Токен сохранен в localStorage')
  console.log('---')
}

const handleRegistration = (): void => {
  const newUser = createUser()
  setupUserSession(newUser)
  successMessage.value = 'Регистрация прошла успешно!'
}

const handleLogin = (): void => {
  const user = authenticateUser()
  setupUserSession(user)
  successMessage.value = 'Успешный вход!'
}

// ==================== ДЕБАГ ФУНКЦИИ ====================

const updateDebugInfo = () => {
  const users = getUsers()
  const tokens = getTokens()
  const currentTokenString = localStorage.getItem(STORAGE_KEYS.CURRENT_TOKEN)

  debugInfo.value = `
Режим: ${isLoginMode.value ? 'Вход' : 'Регистрация'}
Пользователей в системе: ${users.length}
Токенов создано: ${tokens.length}
Текущий токен: ${currentTokenString ? 'Есть' : 'Нет'}
${currentTokenString ? `Токен: ${currentTokenString.substring(0, 20)}...` : ''}
  `.trim()
}

// const showAllTokens = () => {
//   const tokens = getTokens()
//   console.log('📋 ВСЕ ТОКЕНЫ В СИСТЕМЕ:')
//   tokens.forEach((token, index) => {
//     console.log(`Токен ${index + 1}:`, token.token)
//     console.log(`  Пользователь: ${token.login} (${token.userId})`)
//     console.log(`  Создан: ${new Date(token.createdAt).toLocaleString()}`)
//     console.log(`  Истекает: ${new Date(token.expiresAt).toLocaleString()}`)
//     console.log(`  Валидность: ${isTokenValid(token.token) ? '✅' : '❌'}`)

//     const decoded = decodeToken(token.token)
//     if (decoded) {
//       console.log(`  Payload:`, decoded.payload)
//     }
//     console.log('---')
//   })
// }

// УДАЛЕНА НЕНУЖНАЯ ФУНКЦИЯ testTokenDecoding

// const clearAllData = () => {
//   localStorage.removeItem(STORAGE_KEYS.USERS)
//   localStorage.removeItem(STORAGE_KEYS.TOKENS)
//   localStorage.removeItem(STORAGE_KEYS.CURRENT_TOKEN)
//   currentUser.value = null
//   currentToken.value = ''
//   console.log('🗑️ Все данные очищены')
//   updateDebugInfo()
// }

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
    if (isLoginMode.value) {
      await handleLogin()
    } else {
      await handleRegistration()
    }

    // Эмитим событие успеха сразу после авторизации
    emit('authSuccess', {
      login: currentUser.value!.login,
      firstName: currentUser.value!.firstName,
      lastName: currentUser.value!.lastName,
      token: currentToken.value
    })

  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Произошла ошибка. Попробуйте еще раз.'
    console.error('Auth error:', error)
  } finally {
    isSubmitting.value = false
    updateDebugInfo()
  }
}

// Инициализация
onMounted(() => {
  console.log('🚀 СИСТЕМА АУТЕНТИФИКАЦИИ ЗАПУЩЕНА')
  console.log('🔑 Секретный ключ:', SECRET_KEY)
  console.log('---')
  checkExistingAuth()
  updateDebugInfo()
})
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Если пользователь авторизован (показываем только при автоматической авторизации) -->
      <!-- <div v-if="currentUser" class="user-welcome">
        <h2>✅ Автоматическая авторизация</h2>
        <p class="user-info">Добро пожаловать, {{ currentUser.firstName }} {{ currentUser.lastName }}!</p>
        <p class="user-login">Логин: {{ currentUser.login }}</p>
        <p class="user-group">Группа: {{ currentUser.group }}</p>

        <div class="auto-login-notice">
          <p>Вы были автоматически авторизованы с помощью токена.</p>
          <p>Переходите к тестированию!</p>
        </div>
      </div> -->

      <!-- Если пользователь не авторизован -->
      <!-- <div v-else>
        <h1 class="auth-title">{{ isLoginMode ? 'Вход' : 'Регистрация' }}</h1>

        <div class="mode-switcher">
          <button
            @click="switchToLogin"
            :class="{ active: isLoginMode }"
            class="mode-btn"
          >
            Войти
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
          <div v-if="!isLoginMode" class="form-group">
            <input
              v-model="formData.lastName"
              type="text"
              required
              placeholder="Фамилия"
              class="form-input"
            >
          </div>

          <div v-if="!isLoginMode" class="form-group">
            <input
              v-model="formData.firstName"
              type="text"
              required
              placeholder="Имя"
              class="form-input"
            >
          </div>

          <div v-if="!isLoginMode" class="form-group">
            <input
              v-model="formData.group"
              type="text"
              required
              placeholder="Группа"
              class="form-input"
            >
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
              placeholder="Повторите пароль"
              class="form-input"
            >
            <div v-if="passwordMismatch" class="error-message">
              Пароли не совпадают
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
        </div>
      </div>
    </div>
  </div>
</template> -->

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background: #1a1a1a;
  padding: 20px;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.auth-card {
  background: #2d2d2d;
  border-radius: 12px;
  padding: 40px 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
  border: 1px solid #404040;
}

.auth-title {
  text-align: center;
  margin-bottom: 30px;
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.user-welcome {
  text-align: center;
  color: #ffffff;
}

.user-welcome h2 {
  margin-bottom: 16px;
  color: #10b981;
}

.user-info {
  font-size: 18px;
  margin-bottom: 8px;
  font-weight: 500;
}

.user-login, .user-group {
  font-size: 14px;
  color: #b0b0b0;
  margin-bottom: 8px;
}

.auto-login-notice {
  margin: 20px 0;
  padding: 15px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #10b981;
}

.mode-switcher {
  display: flex;
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #404040;
  background: #363636;
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
  color: #b0b0b0;
}

.mode-btn.active {
  background: #6366f1;
  color: white;
}

.mode-btn:not(.active):hover {
  background: #404040;
  color: #ffffff;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-input {
  padding: 14px 16px;
  border: 1px solid #404040;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #363636;
  color: #ffffff;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  background: #404040;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder {
  color: #888;
}

.submit-btn {
  padding: 14px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  letter-spacing: 0.5px;
}

.submit-btn:hover:not(:disabled) {
  background: #5a5cf3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.submit-btn:disabled {
  background: #404040;
  color: #666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.debug-section {
  margin-top: 25px;
  padding: 15px;
  background: #363636;
  border-radius: 8px;
  border: 1px solid #404040;
}

.debug-section h4 {
  color: #f59e0b;
  margin-bottom: 10px;
  font-size: 14px;
}

.debug-info {
  font-size: 11px;
  color: #888;
  background: #2d2d2d;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.debug-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.debug-btn {
  padding: 8px 12px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  flex: 1;
}

.debug-btn:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.clear-btn {
  background: #ef4444;
}

.clear-btn:hover {
  background: #dc2626;
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
  margin-top: 20px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
}

.success-message {
  color: #10b981;
  font-size: 13px;
  text-align: center;
  margin-top: 20px;
  padding: 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
}
</style>
