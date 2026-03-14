<template>
  <div class="form-wrapper">
    <transition name="slide-down">
      <div v-if="aiAdvice" class="ai-card">
        <div class="ai-badge">✨ AI REFLECTION</div>
        <p>"{{ aiAdvice }}"</p>
        <button @click="aiAdvice = ''" class="close-ai" aria-label="Close">✕</button>
      </div>
    </transition>

    <div class="input-card">
      <div class="field">
        <label>👤 Name</label>
        <input 
          v-model="form.name" 
          placeholder="Who is reflecting today?" 
          :disabled="isSubmitting"
          @input="saveName"
        />
      </div>
      
      <div class="field">
        <label>
          <span>✨ Your Thought</span>
          <span :class="['char-count', { 'limit': moodCharCount > 200 }]">
            {{ moodCharCount }}/280
          </span>
        </label>
        <textarea 
          v-model="form.mood" 
          placeholder="What's on your mind?" 
          rows="3" 
          :disabled="isSubmitting"
          maxlength="280"
        ></textarea>
      </div>

      <button @click="submitMood" class="submit-btn" :disabled="isSubmitting || !isFormValid">
        <span v-if="!isSubmitting">Share Reflection</span>
        <span v-else class="loader"></span>
      </button>
      
      <transition name="fade">
        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </transition>
    </div>

    <div class="history-section">
      <div class="section-header">
        <h3>Recent Timeline</h3>
        <span class="count-badge">{{ moods.length }} entries</span>
      </div>
      
      <div class="scroll-area">
        <transition-group name="list" tag="div" class="mood-list">
          <div v-for="m in sortedMoods" :key="m.id" class="mood-item">
            <div class="mood-header">
              <div class="user-info">
                <span class="user-pill">{{ m.full_name }}</span>
                <span class="time-stamp">{{ formatTime(m.created_at) }}</span>
              </div>
              <button @click="deleteMood(m.id)" class="delete-btn">🗑️</button>
            </div>
            <p class="mood-content">{{ m.mood_text }}</p>
          </div>
        </transition-group>
        
        <div v-if="moods.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <p>The timeline is quiet. Start the conversation.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from "../services/api";
import { getAIResponse } from "../services/aiService";

// --- State ---
const form = reactive({
  name: localStorage.getItem('user-name') || "",
  mood: ""
});
const moods = ref([]);
const aiAdvice = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);

// --- Computed ---
const moodCharCount = computed(() => form.mood.length);
const isFormValid = computed(() => form.name.trim() && form.mood.trim());
const sortedMoods = computed(() => [...moods.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

// --- Methods ---
const saveName = () => localStorage.setItem('user-name', form.name);

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const loadMoods = async () => {
  try {
    const res = await api.get("/moods");
    moods.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Load error:", err);
  }
};

const submitMood = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;
  errorMessage.value = "";
  
  try {
    // 1. Save to Database
    await api.post("/moods", { 
      name: form.name, 
      reflection: form.mood 
    });
    
    // 2. Refresh List Optimistically
    const reflectionText = form.mood;
    form.mood = ""; // Clear input immediately for better UX
    await loadMoods();

    // 3. Get AI Response
    aiAdvice.value = await getAIResponse(reflectionText);
    
  } catch (err) {
    errorMessage.value = err.response?.data?.error || "Connection lost. Try again?";
  } finally {
    isSubmitting.value = false;
  }
};

const deleteMood = async (id) => {
  if (!confirm("Remove this memory?")) return;
  try {
    await api.delete(`/moods/${id}`);
    moods.value = moods.value.filter(m => m.id !== id);
  } catch (err) {
    errorMessage.value = "Failed to delete.";
  }
};

onMounted(loadMoods);
</script>

<style scoped>
/* Keeping your excellent styles and adding these tweaks: */
.char-count { font-size: 0.65rem; color: #64748b; }
.char-count.limit { color: #f87171; }

.ai-card {
  animation: slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
  border: 2px dashed rgba(255,255,255,0.05);
  border-radius: 20px;
}
.empty-icon { font-size: 2rem; margin-bottom: 1rem; opacity: 0.5; }

.error-msg {
  color: #f87171;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 1rem;
}

/* Inherit your existing layout & glassmorphism styles below... */
</style>