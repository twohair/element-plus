<template>
  <div class="slider-demo">
    <el-slider
      v-model="sliderValues"
      :show-stops="true"
      range
      :step="1"
    ></el-slider>
    <MultiSlider v-model="sliderValues" :min="0" :max="100" />
    <div class="values">当前值: {{ sliderValues }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
// import MultiSlider from './MultiSlider.vue'
import MultiSlider from '@element-plus/components/slider/src/MultiSlider.vue'

const sliderValues = ref([60])
watch(sliderValues, (val) => {
  sliderValues.value = val.sort((a, b) => a - b)
})
</script>

<style scoped>
.slider-demo {
  width: 100%;
  padding: 20px;
}

.values {
  margin-top: 20px;
}
</style>
