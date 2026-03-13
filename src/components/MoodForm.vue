<template>
  <div class="form-wrapper">
    <transition name="slide-down">
      <div v-if="aiAdvice" class="ai-card">
        <div class="ai-badge">AI INSIGHT</div>
        <p>{{ aiAdvice }}</p>
        <button @click="aiAdvice = ''" class="close-ai">✕</button>
      </div>
    </transition>

    <div class="input-card">
      <div class="field">
        <label><i class="icon">👤</i> Identify Yourself</label>
        <input v-model="name" placeholder="Enter your name" :disabled="isSubmitting" />
      </div>
      
      <div class="field">
        <label><i class="icon">✨</i> Current Reflection</label>
        <textarea 
          v-model="mood" 
          placeholder="How are you really feeling?" 
          rows="3" 
          :disabled="isSubmitting"
        ></textarea>
      </div>

      <button @click="submitMood" class="submit-btn" :disabled="isSubmitting">
        <span v-if="!isSubmitting">Submit Reflection</span>
        <span v-else class="loader"></span>
      </button>
      
      <transition name="fade">
        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </transition>
    </div>

    <div class="history-section">
      <div class="section-header">
        <h3>Recent Reflections</h3>
        <span class="count-badge">{{ moods.length }}</span>
      </div>
      
      <div class="scroll-area">
        <transition-group name="list" tag="ul" class="mood-list">
          <li v-for="m in moods" :key="m.id" class="mood-item">
            <div class="mood-header">
              <span class="user-pill">{{ m.full_name }}</span>
              <span class="time-stamp">{{ formatTime(m.created_at) }}</span>
            </div>
            <p class="mood-content">{{ m.mood_text }}</p>
          </li>
        </transition-group>
        
        <div v-if="moods.length === 0" class="empty-state">
          <p>No reflections yet. Be the first to share.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../services/api";
import { getAIResponse } from "../services/aiService";

export default {
  data() {
    return {
      name: "",
      mood: "",
      moods: [],
      errorMessage: "",
      aiAdvice: "",
      isSubmitting: false
    };
  },
  methods: {
    formatTime(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    async submitMood() {
      if (!this.name.trim() || !this.mood.trim()) {
        this.errorMessage = "Please fill both fields";
        return;
      }

      this.isSubmitting = true;
      this.errorMessage = "";
      this.aiAdvice = "";

      try {
        // 1. Save to Database
        await api.post("/moods", { 
          name: this.name, 
          reflection: this.mood 
        });
        
        // 2. Get AI Response
        const reflectionText = this.mood;
        this.aiAdvice = await getAIResponse(reflectionText);
        
        // 3. Reset Form & Refresh
        this.name = "";
        this.mood = "";
        await this.loadMoods();
      } catch (err) {
        this.errorMessage = err.response?.data?.error || "Connection error.";
      } finally {
        this.isSubmitting = false;
      }
    },
    async loadMoods() {
      try {
        const res = await api.get("/moods");
        this.moods = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Load error:", err);
      }
    }
  },
  mounted() {
    this.loadMoods();
  }
};
</script>

<style scoped>
.form-wrapper { 
  display: flex; 
  flex-direction: column; 
  gap: 1.5rem; 
  max-width: 500px;
  margin: 0 auto;
}

/* Glassmorphism Input Card */
.input-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.2rem; }

label { 
  color: #a5b4fc; 
  font-size: 0.7rem; 
  font-weight: 800; 
  text-transform: uppercase; 
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

input, textarea { 
  background: rgba(0, 0, 0, 0.2); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-radius: 12px; 
  padding: 14px; 
  color: #fff; 
  font-size: 1rem; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
}

input:focus, textarea:focus { 
  outline: none; 
  background: rgba(0, 0, 0, 0.3); 
  border-color: #818cf8; 
  box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.15); 
}

/* Submit Button & Loader */
.submit-btn { 
  width: 100%; 
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); 
  color: white; 
  border: none; 
  padding: 16px; 
  border-radius: 14px; 
  font-weight: 700; 
  cursor: pointer; 
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.submit-btn:hover:not(:disabled) { 
  transform: translateY(-2px); 
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}

.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

/* AI Advice Card */
.ai-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 1.2rem;
  border-radius: 18px;
  position: relative;
  color: #e9d5ff;
  font-style: italic;
  line-height: 1.5;
}

.ai-badge {
  background: #a855f7;
  color: white;
  font-size: 0.6rem;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 20px;
  width: fit-content;
  margin-bottom: 8px;
}

.close-ai {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #a855f7;
  cursor: pointer;
}

/* History List Styling */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.count-badge {
  background: rgba(255,255,255,0.1);
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #818cf8;
}

.mood-item { 
  background: rgba(255, 255, 255, 0.03); 
  border-radius: 16px; 
  padding: 14px; 
  margin-bottom: 12px; 
  border-left: 4px solid #6366f1;
  transition: transform 0.2s ease;
}

.mood-item:hover { transform: scale(1.02); background: rgba(255, 255, 255, 0.05); }

.mood-header { display: flex; justify-content: space-between; align-items: center; }

.user-pill { color: #818cf8; font-size: 0.8rem; font-weight: 700; }

.time-stamp { color: #64748b; font-size: 0.7rem; }

.mood-content { color: #cbd5e1; font-size: 0.95rem; margin-top: 6px; line-height: 1.4; }

/* Animations */
@keyframes spin { to { transform: rotate(360deg); } }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.4s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-20px); }

.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from { opacity: 0; transform: translateX(-30px); }
.list-leave-to { opacity: 0; transform: scale(0.5); }
</style>