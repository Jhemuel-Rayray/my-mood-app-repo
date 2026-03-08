<template>
  <div class="form-wrapper">
    <div class="input-group">
      <div class="field">
        <label>Identify Yourself</label>
        <input v-model="name" placeholder="Enter your name" />
      </div>
      
      <div class="field">
        <label>Current Reflection</label>
        <textarea v-model="mood" placeholder="How are you really feeling?" rows="3"></textarea>
      </div>

      <button @click="submitMood" class="submit-btn">
        Submit Reflection
      </button>
      
      <transition name="fade">
        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </transition>
    </div>

    <div class="history-section">
      <h3>Recent Reflections</h3>
      <div class="scroll-area">
        <ul class="mood-list">
          <li v-for="m in moods" :key="m.id" class="mood-item">
            <span class="user-pill">{{ m.full_name || m.user_id }}</span>
            <p class="mood-content">{{ m.mood_text }}</p>
          </li>
        </ul>
        <div v-if="moods.length === 0" class="empty-state">No reflections yet.</div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../services/api";

export default {
  data() {
    return {
      name: "",
      mood: "",
      moods: [],
      errorMessage: ""
    };
  },
  methods: {
    async submitMood() {
      if (!this.name || !this.mood) {
        this.errorMessage = "Please fill both fields";
        return;
      }
      try {
        /** * FIX 1: Send 'name' and 'reflection' 
         * This matches your backend: const username = req.body.username || req.body.name;
         */
        await api.post("/moods", { 
          name: this.name, 
          reflection: this.mood 
        });
        
        this.name = "";
        this.mood = "";
        this.errorMessage = "";
        
        // Refresh the list after a successful post
        await this.loadMoods();
      } catch (err) {
        console.error("Submit error details:", err.response?.data);
        this.errorMessage = err.response?.data?.error || "Error saving reflection.";
      }
    },
    async loadMoods() {
      try {
        const res = await api.get("/moods");
        /**
         * FIX 2: Data Structure
         * Since we saw a 500 error earlier, ensure the backend is returning an array.
         */
        this.moods = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Load error:", err.response?.data);
        this.errorMessage = "Could not load reflections.";
      }
    }
  },
  mounted() {
    this.loadMoods();
  }
};
</script>

<style scoped>
/* Styles remain the same as your original design */
.form-wrapper { display: flex; flex-direction: column; gap: 2rem; }
.field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.2rem; }
label { color: #818cf8; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
input, textarea { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 12px 16px; color: #fff; font-size: 1rem; transition: all 0.3s ease; }
input:focus, textarea:focus { outline: none; background: rgba(255, 255, 255, 0.1); border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2); }
.submit-btn { width: 100%; background: linear-gradient(90deg, #6366f1, #a855f7); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: transform 0.2s, opacity 0.2s; }
.submit-btn:hover { transform: translateY(-2px); opacity: 0.9; }
.error-msg { color: #f87171; font-size: 0.85rem; text-align: center; margin-top: 1rem; }
.history-section h3 { color: #f8fafc; font-size: 1.1rem; margin-bottom: 1rem; }
.scroll-area { max-height: 200px; overflow-y: auto; padding-right: 10px; }
.scroll-area::-webkit-scrollbar { width: 4px; }
.scroll-area::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
.mood-list { list-style: none; }
.mood-item { background: rgba(255, 255, 255, 0.03); border-radius: 10px; padding: 12px; margin-bottom: 8px; border-left: 3px solid #6366f1; }
.user-pill { color: #818cf8; font-size: 0.75rem; font-weight: bold; }
.mood-content { color: #cbd5e1; font-size: 0.9rem; margin-top: 4px; }
.empty-state { color: #64748b; text-align: center; font-size: 0.8rem; padding: 20px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter, .fade-leave-to { opacity: 0; }
</style>