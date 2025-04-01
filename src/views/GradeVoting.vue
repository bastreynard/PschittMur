<template>
    <div class="grade-voting">
      <div v-if="showHistogram" class="grade-histogram">
        <h4>Difficulty Distribution</h4>
        <div class="histogram-container">
          <div 
            v-for="(count, grade) in gradeDistribution" 
            :key="grade"
            class="histogram-bar"
          >
            <div 
              class="bar" 
              :style="{ height: `${getBarHeight(count)}%` }"
              :class="{ 'user-vote': userVote === grade }"
            ></div>
            <div class="grade-label">{{ grade }}</div>
          </div>
        </div>
        <div class="vote-count">
          {{ totalVotes }} {{ totalVotes === 1 ? 'vote' : 'votes' }}
        </div>
      </div>
      
      <div class="grade-selector">
        <label for="grade-select">Your Grade:</label>
        <select 
          id="grade-select" 
          v-model="localGrade"
          :disabled="disabled"
          @change="updateGrade"
        >
          <option value="">Select Grade</option>
          <option v-for="grade in fontGrades" :key="grade" :value="grade">
            {{ grade }}
          </option>
        </select>
      </div>
      
      <div v-if="userVote" class="user-vote-display">
        Your vote: <strong>{{ userVote }}</strong>
        <button 
          v-if="!disabled" 
          class="remove-vote" 
          @click="removeVote"
          title="Remove your vote"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits, computed, watch } from 'vue';
  import { useRouteStore } from "../stores/routeStore";

  const routeStore = useRouteStore();
  // Get font grades from store
  const fontGrades = routeStore.fontGrades;
  
  const props = defineProps({
    modelValue: {
      type: String,
      default: ''
    },
    grades: {
      type: Array,
      required: true,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showHistogram: {
      type: Boolean,
      default: true
    },
    gradeVotes: {
      type: Array,
      default: () => []
    },
    userVote: {
      type: String,
      default: ''
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const localGrade = ref(props.modelValue);
  
  // Watch for external changes to modelValue
  watch(() => props.modelValue, (newValue) => {
    localGrade.value = newValue;
  });
  
  // Calculate grade distribution and total votes
  const gradeDistribution = computed(() => {
    const distribution = {};
    
    // Initialize all grades with 0 count
    props.grades.forEach(grade => {
      distribution[grade] = 0;
    });
    
    // Count votes for each grade
    props.gradeVotes.forEach(vote => {
      if (distribution[vote.grade] !== undefined) {
        distribution[vote.grade]++;
      }
    });
    
    return distribution;
  });
  
  const totalVotes = computed(() => props.gradeVotes.length);
  
  // Calculate bar height based on vote count (as percentage of max possible height)
  function getBarHeight(count) {
    if (totalVotes.value === 0) return 0;
    
    const maxCount = Math.max(...Object.values(gradeDistribution.value));
    return maxCount === 0 ? 0 : (count / maxCount) * 100;
  }
  
  function updateGrade() {
    if (!props.disabled && localGrade.value) {
      emit('update:modelValue', localGrade.value);
    }
  }
  
  function removeVote() {
    if (!props.disabled) {
      localGrade.value = '';
      emit('update:modelValue', '');
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .grade-voting {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 600px;
    
    .grade-histogram {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 12px;
      
      h4 {
        margin-top: 0;
        margin-bottom: 12px;
        font-size: 1rem;
        text-align: center;
      }
      
      .histogram-container {
        display: flex;
        align-items: flex-end;
        height: 120px;
        gap: 2px;
        
        .histogram-bar {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          
          .bar {
            width: 100%;
            background-color: #3498db;
            border-radius: 2px 2px 0 0;
            transition: height 0.3s ease;
            min-height: 0%;
            
            &.user-vote {
              background-color: #e74c3c;
            }
          }
          
          .grade-label {
            font-size: 0.7rem;
            margin-top: 4px;
            transform: rotate(-45deg);
            transform-origin: center;
            white-space: nowrap;
          }
        }
      }
      
      .vote-count {
        text-align: center;
        font-size: 0.8rem;
        color: #666;
        margin-top: 8px;
      }
    }
    
    .grade-selector {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      label {
        font-weight: bold;
      }
      
      select {
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #ccc;
        background-color: white;
        font-size: 1rem;
        
        &:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
      }
    }
    
    .user-vote-display {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      
      .remove-vote {
        background: none;
        border: none;
        color: #e74c3c;
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover {
          background-color: #f5f5f5;
          border-radius: 50%;
        }
      }
    }
  }
  
  // Mobile optimizations
  @media (max-width: 768px) {
    .grade-voting {
      .grade-histogram {
        .histogram-container {
          height: 100px;
          overflow-x: auto;
          padding-bottom: 16px;
          
          .histogram-bar {
            min-width: 24px;
            
            .grade-label {
              font-size: 0.65rem;
            }
          }
        }
      }
    }
  }
  </style>