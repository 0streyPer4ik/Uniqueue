<template>
  <el-button-group id="menu-btns" size="large">
    <el-button v-if="profileStore.isLoggedIn" @click="showProfile" :type="getTagType">
      <el-icon>
        <User />
      </el-icon>
      {{ profileStore.fio }}
    </el-button>
    <el-button v-if="profileStore.hasRoleAdmin" @click="showStatistics" type="warning">
      <el-icon>
        <TrendCharts />
      </el-icon>
    </el-button>
    <el-button v-if="profileStore.isLoggedIn" @click="logout" type="primary">Выйти</el-button>
    <el-button v-else @click="goToLogin" type="success">Войти</el-button>
  </el-button-group>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { MessageParams } from 'element-plus'
import { useRouter } from 'vue-router'
import { ProfileStore } from '@/stores'
import { computed } from 'vue'

const profileStore = ProfileStore()

const getTagType = computed(() => {
  if (profileStore.hasRoleAdmin) {
    return 'danger'
  }
  return 'info'
})

const router = useRouter()

const goToLogin = () => {
  router.push('/enter')
}

const showProfile = () => {
  router.push('/profile')
}

const showStatistics = () => {
  router.push({
    name: 'analytic-group',
    params: { id: 4 }
  })
}

const logout = () => {
  profileStore.logout()
  ElMessage({
    message: 'Выход выполнен!',
    type: 'success',
  } as MessageParams)
  router.push('/')
}
</script>

<style scoped>
#menu-btns {
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
</style>
