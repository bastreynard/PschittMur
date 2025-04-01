<template>
    <div class="star-rating">
      <div class="stars-container" :class="{ 'disabled': disabled }">
        <div
          v-for="n in 5"
          :key="n"
          class="star"
          :class="{ 'filled': n <= modelValue, 'hovered': n <= hoverRating }"
          @click="updateRating(n)"
          @mouseover="hoverRating = disabled ? 0 : n"
          @mouseleave="hoverRating = 0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      </div>
      <div v-if="showAverage && averageRating" class="average-rating">
        <span>{{ averageRating.toFixed(1) }} ({{ ratingCount }} {{ ratingCount === 1 ? 'rating' : 'ratings' }})</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    modelValue: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showAverage: {
      type: Boolean,
      default: true
    },
    averageRating: {
      type: Number,
      default: 3
    },
    ratingCount: {
      type: Number,
      default: 1
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const hoverRating = ref(0);
  
  function updateRating(value) {
    if (!props.disabled) {
      // If clicking the same star, toggle it off
      const newRating = props.modelValue === value ? 0 : value;
      emit('update:modelValue', newRating);
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .star-rating {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .stars-container {
      display: flex;
      flex-direction: row;
      cursor: pointer;
      
      &.disabled {
        cursor: default;
        opacity: 0.8;
      }
      
      .star {
        color: #ddd;
        margin: 0 2px;
        transition: color 0.2s, transform 0.1s;
        
        &:hover {
          transform: scale(1.1);
        }
        
        &.filled {
          color: #ffc107;
        }
        
        &.hovered {
          color: #ffeb3b;
        }
        
        svg {
          width: 24px;
          height: 24px;
          
          @media (max-width: 768px) {
            width: 20px;
            height: 20px;
          }
        }
      }
    }
    
    .average-rating {
      margin-top: 4px;
      font-size: 0.9rem;
      color: #666;
    }
  }
  </style>