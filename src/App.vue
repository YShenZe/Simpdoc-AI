<template>
  <v-container class="chat-container">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="3" class="rounded-lg">
          <v-card-title class="bg-primary">
            <span class="text-h5 text-white">AI 知识助手</span>
          </v-card-title>

          <v-card-text class="pa-4 message-box" ref="messagesContainer">
            <v-list class="py-0" v-if="history.length">
              <template v-for="(item, index) in history" :key="index">
                <v-list-item :class="['message-bubble', item.type]">
                  <v-card
                    :color="item.type === 'question' ? 'primary' : 'grey lighten-4'"
                    class="pa-3 rounded-lg"
                    elevation="1"
                  >
                    <div class="d-flex align-center">
                      <v-icon
                        v-if="item.type === 'question'"
                        color="white"
                        class="mr-2"
                      >mdi-account</v-icon>
                      <v-icon
                        v-else
                        color="primary"
                        class="mr-2"
                      >mdi-robot</v-icon>
                      <div :class="['text-body-1', item.type === 'question' ? 'white--text' : 'black--text']">
                        {{ item.content }}
                      </div>
                    </div>
                  </v-card>
                </v-list-item>
                <v-divider v-if="index < history.length - 1" :key="`divider-${index}`"/>
              </template>
            </v-list>
            
            <v-alert
              v-if="error"
              type="error"
              class="mt-4"
            >
              {{ error }}
            </v-alert>
            
            <div v-if="loading" class="text-center mt-4">
              <v-progress-circular
                indeterminate
                color="primary"
              />
              <div class="text-caption mt-2">AI 正在思考中...</div>
            </div>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-form @submit.prevent="submitQuestion" class="w-100">
              <v-textarea
                v-model="question"
                label="输入您的问题"
                auto-grow
                rows="1"
                outlined
                :disabled="loading"
                hide-details
                append-icon="mdi-send"
                @click:append="submitQuestion"
                @keydown.enter.exact.prevent="submitQuestion"
              />
            </v-form>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'

const question = ref('')
const loading = ref(false)
const error = ref(null)
const history = ref([])
const messagesContainer = ref(null)

// 从本地存储加载历史记录
onMounted(() => {
  const savedHistory = localStorage.getItem('aiChatHistory')
  if (savedHistory) {
    history.value = JSON.parse(savedHistory)
  }
})

const submitQuestion = async () => {
  if (!question.value.trim() || loading.value) return

  try {
    loading.value = true
    error.value = null
    
    // 添加用户问题到历史
    history.value.push({
      type: 'question',
      content: question.value.trim(),
      timestamp: new Date().toISOString()
    })

    const response = await axios.post('/.netlify/functions/ask', {
      question: question.value.trim()
    })

    // 添加AI回答到历史
    history.value.push({
      type: 'answer',
      content: response.data.answer,
      timestamp: new Date().toISOString()
    })

    // 保存到本地存储
    localStorage.setItem('aiChatHistory', JSON.stringify(history.value))
    
    question.value = ''
    scrollToBottom()
  } catch (err) {
    console.error('API请求失败:', err)
    error.value = '请求失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}
</script>

<style scoped>
.chat-container {
  height: 100vh;
  padding-top: 2rem;
}

.message-box {
  height: 60vh;
  overflow-y: auto;
}

.message-bubble {
  display: flex;
  margin: 0.5rem 0;
}

.message-bubble.question {
  justify-content: flex-end;
}

.message-bubble.answer {
  justify-content: flex-start;
}

@media (max-width: 600px) {
  .chat-container {
    padding: 0;
    height: auto;
    min-height: 100vh;
  }
  
  .message-box {
    height: 70vh;
  }
}
</style>