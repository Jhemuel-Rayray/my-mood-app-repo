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
        <label>👤 Identify Yourself</label>
        <input v-model="name" placeholder="Enter your name" :disabled="isSubmitting" />
      </div>
      
      <div class="field">
        <label>✨ Current Reflection</label>
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
              <div class="user-info">
                <span class="user-pill">{{ m.full_name }}</span>
                <span class="time-stamp">{{ formatTime(m.created_at) }}</span>
              </div>
              <button @click="deleteMood(m.id)" class="delete-btn" title="Remove">
                🗑️
              </button>
            </div>
            <p class="mood-content">{{ m.mood_text }}</p>
          </li>
        </transition-group>
        
        <div v-if="moods.length === 0" class="empty-state">
          No reflections yet. Be the first to share.
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
      
      try {
        // 1. Save to Database
        await api.post("/moods", { 
          name: this.name, 
          reflection: this.mood 
        });
        
        // 2. Get AI Response
        const reflectionText = this.mood;
        this.aiAdvice = await getAIResponse(reflectionText);
        
        // 3. Reset & Refresh
        this.name = "";
        this.mood = "";
        await this.loadMoods();
      } catch (err) {
        this.errorMessage = err.response?.data?.error || "Error saving reflection.";
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
    },
    async deleteMood(id) {
      if (!confirm("Remove this reflection?")) return;
      try {
        await api.delete(`/moods/${id}`);
        this.moods = this.moods.filter(m => m.id !== id);
      } catch (err) {
        alert("Could not delete.");
      }
    }
  },
  mounted() {
    this.loadMoods();
  }
};
</script>

<style scoped>
/* Full Page Centering */
.form-wrapper { 
  display: flex; 
  flex-direction: column; 
  gap: 1.5rem; 
  max-width: 500px;
  width: 90%; 
  margin: 40px auto; 
  padding-bottom: 40px;
}

/* Glassmorphism Input Card */
.input-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 28px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.field { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem; }

label { 
  color: #a5b4fc; 
  font-size: 0.75rem; 
  font-weight: 800; 
  text-transform: uppercase; 
  letter-spacing: 0.12em;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-left: 4px;
}

input, textarea { 
  background: rgba(0, 0, 0, 0.2); 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  border-radius: 16px; 
  padding: 16px; 
  color: #fff; 
  font-size: 1rem; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
}

input:focus, textarea:focus { 
  outline: none; 
  background: rgba(255, 255, 255, 0.05); 
  border-color: #818cf8; 
  box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.2); 
}

/* Submit Button & Loader */
.submit-btn { 
  width: 100%; 
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); 
  color: white; 
  border: none; 
  padding: 18px; 
  border-radius: 16px; 
  font-weight: 700; 
  font-size: 1rem;
  cursor: pointer; 
  transition: all 0.3s ease;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
  display: flex; justify-content: center;
}

.submit-btn:hover:not(:disabled) { 
  transform: translateY(-3px); 
  box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.4);
}

.loader {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* AI Insight Card */
.ai-card {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.4);
  padding: 1.5rem;
  border-radius: 20px;
  position: relative;
  color: #f3e8ff;
  font-style: italic;
  line-height: 1.6;
}

.ai-badge {
  background: #a855f7; color: #fff; font-size: 0.6rem;
  font-weight: 900; padding: 2px 8px; border-radius: 10px;
  width: fit-content; margin-bottom: 8px; font-style: normal;
}

.close-ai {
  position: absolute; top: 12px; right: 12px;
  background: none; border: none; color: #a855f7; cursor: pointer;
}

/* History List */
.section-header { display: flex; justify-content: space-between; align-items: center; margin: 1rem 0; }
.section-header h3 { color: #f8fafc; font-size: 1.25rem; font-weight: 600; }
.count-badge { background: rgba(129, 140, 248, 0.1); color: #818cf8; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; }

.mood-list { list-style: none; padding: 0; margin: 0; }

.mood-item { 
  background: rgba(255, 255, 255, 0.03); 
  border-radius: 18px; 
  padding: 16px; 
  margin-bottom: 12px; 
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 4px solid #6366f1;
}

.mood-header { display: flex; justify-content: space-between; align-items: flex-start; }
.user-info { display: flex; flex-direction: column; }
.user-pill { color: #818cf8; font-size: 0.85rem; font-weight: 700; }
.time-stamp { color: #64748b; font-size: 0.7rem; }

.delete-btn {
  background: none; border: none; cursor: pointer; font-size: 1rem;
  opacity: 0.4; transition: opacity 0.2s;
}
.mood-item:hover .delete-btn { opacity: 1; }

.mood-content { color: #cbd5e1; font-size: 0.95rem; margin-top: 8px; }

/* Custom Scrollbar */
.scroll-area { max-height: 400px; overflow-y: auto; }
.scroll-area::-webkit-scrollbar { width: 6px; }
.scroll-area::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from { opacity: 0; transform: translateY(20px); }
.list-leave-to { opacity: 0; transform: scale(0.9); }
</style>