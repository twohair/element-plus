<template>
  <div
    :id="inputId"
    ref="sliderWrapper"
    :class="sliderKls"
    role="group"
    :aria-label="!isLabeledByFormItem ? groupLabel : undefined"
    :aria-labelledby="isLabeledByFormItem ? elFormItem?.labelId : undefined"
  >
    <div
      ref="slider"
      :class="[ns.e('runway'), ns.is('disabled', sliderDisabled)]"
      :style="runwayStyle"
      @mousedown="onSliderDown"
      @touchstart.passive="onSliderDown"
    >
      <div :class="ns.e('bar')" :style="barStyle" />
      <div @click.stop @mousedown.stop>
        <slider-button
          v-for="(item, index) in buttonRefs"
          :key="index"
          :ref="item.ref"
          :model-value="item.value"
          :vertical="vertical"
          :tooltip-class="tooltipClass"
          :placement="placement"
          role="slider"
          :aria-label="!isLabeledByFormItem ? buttonLabel : undefined"
          :aria-valuemin="min"
          :aria-valuemax="max"
          :aria-valuenow="item.value"
          :aria-valuetext="getComputedText(item)"
          :aria-orientation="vertical ? 'vertical' : 'horizontal'"
          :aria-disabled="sliderDisabled"
          @update:model-value="(val) => setButtonValue(item, val)"
        />
      </div>
      <div v-if="showStops">
        <div
          v-for="(item, key) in stops"
          :key="key"
          :class="ns.e('stop')"
          :style="getStopStyle(item)"
        />
      </div>
      <template v-if="markList.length > 0">
        <div>
          <div
            v-for="(item, key) in markList"
            :key="key"
            :style="getStopStyle(item.position)"
            :class="[ns.e('stop'), ns.e('marks-stop')]"
          />
        </div>
        <div :class="ns.e('marks')">
          <slider-marker
            v-for="(item, key) in markList"
            :key="key"
            :mark="item.mark"
            :style="getStopStyle(item.position)"
            @mousedown.stop="onSliderMarkerDown(item.position)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, provide, reactive, toRefs } from 'vue'
import { useEventListener } from '@vueuse/core'
import { cloneDeep } from 'lodash-unified'
import { useFormItemInputId, useFormSize } from '@element-plus/components/form'
import { useLocale, useNamespace } from '@element-plus/hooks'
import { sliderContextKey } from './constants'
import { sliderEmits, sliderProps } from './multiSlider'
import SliderButton from './button.vue'
import SliderMarker from './marker'
import {
  useLifecycle,
  useMarks,
  useMultiSlide,
  useMultiWatch,
  useStops,
} from './composables'
import type { SliderInitData } from './multiSlider'

defineOptions({
  name: 'ElSlider',
})

const props = defineProps(sliderProps)
const emit = defineEmits(sliderEmits)

const ns = useNamespace('slider')
const { t } = useLocale()

const initData = reactive<SliderInitData>({
  firstValue: Math.min(...props.modelValue),
  secondValue: Math.max(...props.modelValue),
  oldValue: cloneDeep(props.modelValue),
  dragging: false,
  sliderSize: 1,
})

const {
  elFormItem,
  slider,
  buttonRefs,
  sliderDisabled,
  minValue,
  maxValue,
  runwayStyle,
  barStyle,
  resetSize,
  emitChange,
  onSliderWrapperPrevent,
  onSliderClick,
  onSliderDown,
  onSliderMarkerDown,
  setButtonValue,
} = useMultiSlide(props, initData, emit)

const { stops, getStopStyle } = useStops(props, initData, minValue, maxValue)

const { inputId, isLabeledByFormItem } = useFormItemInputId(props, {
  formItemContext: elFormItem,
})

const sliderWrapperSize = useFormSize()

const groupLabel = computed<string>(() => {
  return (
    props.ariaLabel ||
    t('el.slider.defaultLabel', {
      min: props.min,
      max: props.max,
    })
  )
})

const buttonLabel = computed<string>(() => {
  return props.rangeStartLabel || t('el.slider.defaultRangeStartLabel')
})

const getComputedText = (item: any) => {
  return computed(() => {
    return props.formatValueText
      ? props.formatValueText(item.value)
      : `${item.value}`
  })
}

const sliderKls = computed(() => [
  ns.b(),
  ns.m(sliderWrapperSize.value),
  ns.is('vertical', props.vertical),
  { [ns.m('with-input')]: props.showInput },
])

const markList = useMarks(props)

useMultiWatch(props, initData, minValue, maxValue, emit, elFormItem!)

const precision = computed(() => {
  const precisions = [props.min, props.max, props.step].map((item) => {
    const decimal = `${item}`.split('.')[1]
    return decimal ? decimal.length : 0
  })
  return Math.max.apply(null, precisions)
})

const { sliderWrapper } = useLifecycle(props, initData, resetSize)

const { sliderSize } = toRefs(initData)

const updateDragging = (val: boolean) => {
  initData.dragging = val
}

useEventListener(sliderWrapper, 'touchstart', onSliderWrapperPrevent, {
  passive: false,
})
useEventListener(sliderWrapper, 'touchmove', onSliderWrapperPrevent, {
  passive: false,
})

provide(sliderContextKey, {
  ...toRefs(props),
  sliderSize,
  disabled: sliderDisabled,
  precision,
  emitChange,
  resetSize,
  updateDragging,
})

defineExpose({
  onSliderClick,
})
</script>
