<template>
  <div
    :id="range ? SC.inputId : undefined"
    ref="sliderWrapper"
    :class="SC.sliderKls"
    :role="range ? 'group' : undefined"
    :aria-label="range && !SC.isLabeledByFormItem ? SC.groupLabel : undefined"
    :aria-labelledby="
      range && SC.isLabeledByFormItem ? SC.elFormItem?.labelId : undefined
    "
  >
    <div
      ref="slider"
      :class="[
        ns.e('runway'),
        { 'show-input': showInput && !range },
        ns.is('disabled', SC.sliderDisabled),
      ]"
      :style="SC.runwayStyle"
      @mousedown="SC.onSliderDown"
      @touchstart.passive="SC.onSliderDown"
    >
      <div :class="ns.e('bar')" :style="SC.barStyle" />
      <slider-button
        :id="!range ? SC.inputId : undefined"
        ref="firstButton"
        :model-value="SC.firstValue"
        :vertical="vertical"
        :tooltip-class="tooltipClass"
        :placement="placement"
        role="slider"
        :aria-label="
          range || !SC.isLabeledByFormItem ? SC.firstButtonLabel : undefined
        "
        :aria-labelledby="
          !range && SC.isLabeledByFormItem ? SC.elFormItem?.labelId : undefined
        "
        :aria-valuemin="min"
        :aria-valuemax="range ? SC.secondValue : max"
        :aria-valuenow="SC.firstValue"
        :aria-valuetext="SC.firstValueText"
        :aria-orientation="vertical ? 'vertical' : 'horizontal'"
        :aria-disabled="SC.sliderDisabled"
        @update:model-value="SC.setFirstValue"
      />
      <slider-button
        v-if="range"
        ref="secondButton"
        :model-value="SC.secondValue"
        :vertical="vertical"
        :tooltip-class="tooltipClass"
        :placement="placement"
        role="slider"
        :aria-label="SC.secondButtonLabel"
        :aria-valuemin="SC.firstValue"
        :aria-valuemax="max"
        :aria-valuenow="SC.secondValue"
        :aria-valuetext="SC.secondValueText"
        :aria-orientation="vertical ? 'vertical' : 'horizontal'"
        :aria-disabled="SC.sliderDisabled"
        @update:model-value="SC.setSecondValue"
      />
      <div v-if="showStops">
        <div
          v-for="(item, key) in SC.stops"
          :key="key"
          :class="ns.e('stop')"
          :style="SC.getStopStyle(item)"
        />
      </div>
      <template v-if="SC.markList.length > 0">
        <div>
          <div
            v-for="(item, key) in SC.markList"
            :key="key"
            :style="SC.getStopStyle(item.position)"
            :class="[ns.e('stop'), ns.e('marks-stop')]"
          />
        </div>
        <div :class="ns.e('marks')">
          <slider-marker
            v-for="(item, key) in SC.markList"
            :key="key"
            :mark="item.mark"
            :style="SC.getStopStyle(item.position)"
            @mousedown.stop="SC.onSliderMarkerDown(item.position)"
          />
        </div>
      </template>
    </div>
    <el-input-number
      v-if="showInput && !range"
      ref="input"
      :model-value="SC.firstValue"
      :class="ns.e('input')"
      :step="step"
      :disabled="SC.sliderDisabled"
      :controls="showInputControls"
      :min="min"
      :max="max"
      :precision="SC.precision"
      :debounce="debounce"
      :size="SC.sliderInputSize"
      @update:model-value="SC.setFirstValue"
      @change="SC.emitChange"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  computed,
  provide,
  useAttrs,
  useSlots,
  defineExpose,
  SetupContext,
  EmitsOptions,
  ObjectEmitsOptions,
} from 'vue'
import { useNamespace } from '@element-plus/hooks'
import ElSlider from '@element-plus/components/slider/src/slider.vue'
import SliderButton from '@element-plus/components/slider/src/button.vue'
import { sliderContextKey } from '@element-plus/components/slider/src/constants'
import type { SliderContext } from '@element-plus/components/slider/src/constants'
import { sliderEmits, SliderEmits, SliderProps } from '@element-plus/components'
import type { LooseRequired } from '@vue/shared'

const ns = useNamespace('slider')
defineOptions({
  extends: ElSlider,
})

declare type EmitsToProps<T extends EmitsOptions> = T extends string[]
  ? {
      [K in string & `on${Capitalize<T[number]>}`]?: (...args: any[]) => any
    }
  : T extends ObjectEmitsOptions
  ? {
      [K in string &
        `on${Capitalize<string & keyof T>}`]?: K extends `on${infer C}`
        ? T[Uncapitalize<C>] extends null
          ? (...args: any[]) => any
          : (
              ...args: T[Uncapitalize<C>] extends (...args: infer P) => any
                ? P
                : never
            ) => any
        : never
    }
  : {}

interface Props
  extends LooseRequired<SliderProps>,
    Required<EmitsToProps<SliderEmits>> {}
const props = defineProps<Props>()
const attrs = useAttrs()
const slots = useSlots()

const emit = defineEmits(sliderEmits)
const exposed = ref()
defineExpose(exposed)
const SC: any = ElSlider?.setup?.(props, {
  attrs,
  slots,
  emit,
  expose: (_exposed) => {
    exposed.value = _exposed
  },
})
console.log(SC, ElSlider)

// const values = ref<number[]>([])
// const sliderWrapper = ref()
// const slider = ref()
// const disabled = ref(false)

// const precision = computed(() => {
//   const precisions = [props.min, props.max, props.step].map((item) => {
//     const decimal = `${item}`.split('.')[1]
//     return decimal ? decimal.length : 0
//   })
//   return Math.max.apply(null, precisions)
// })

// const sliderSize = ref(1)
// const resetSize = () => {
//   if (slider.value) {
//     sliderSize.value =
//       slider.value[props.vertical ? 'offsetHeight' : 'offsetWidth']
//   }
// }

// const emitChange = async () => {
//   emit('update:modelValue', values.value)
//   emit('change', values.value)
//   emit('input', values.value)
// }

// const updateDragging = (val: boolean) => {
//   /* handle dragging state */
// }

// provide(sliderContextKey, {
//   disabled,
//   min: computed(() => props.min),
//   max: computed(() => props.max),
//   step: computed(() => props.step),
//   showTooltip: computed(() => true),
//   precision,
//   sliderSize,
//   formatTooltip: computed(() => undefined),
//   emitChange,
//   resetSize,
//   updateDragging,
// } as unknown as SliderContext)

// const stops = computed(() => {
//   if (!props.showStops || props.step === 0) {
//     return []
//   }
//   const stopCount = (props.max - props.min) / props.step
//   const result: number[] = []
//   for (let i = 1; i < stopCount; i++) {
//     result.push(props.min + i * props.step)
//   }
//   return result
// })

// const sortedValues = computed(() => {
//   return [...values.value]
// })

// const runwayStyle = computed(() => {
//   return props.vertical ? { height: '100%' } : {}
// })

// const barStyle = computed(() => {
//   const style: Record<string, string> = {}
//   if (values.value.length >= 2) {
//     const min = Math.min(...values.value)
//     const max = Math.max(...values.value)
//     const percentage = ((max - min) / (props.max - props.min)) * 100
//     const start = ((min - props.min) / (props.max - props.min)) * 100

//     if (props.vertical) {
//       style.height = `${percentage}%`
//       style.bottom = `${start}%`
//     } else {
//       style.width = `${percentage}%`
//       style.left = `${start}%`
//     }
//   }
//   return style
// })

// const getStopStyle = (position: number) => {
//   return props.vertical ? { bottom: `${position}%` } : { left: `${position}%` }
// }

// const getButtonStyle = (value: number) => {
//   const position = ((value - props.min) / (props.max - props.min)) * 100
//   return props.vertical ? { bottom: `${position}%` } : { left: `${position}%` }
// }

// const handleSliderClick = (event: MouseEvent) => {
//   if (sliderWrapper.value && slider.value) {
//     const sliderRect = slider.value.getBoundingClientRect()
//     let percentage = 0

//     if (props.vertical) {
//       const bottom = sliderRect.bottom
//       percentage = ((bottom - event.clientY) / sliderRect.height) * 100
//     } else {
//       const left = sliderRect.left
//       percentage = ((event.clientX - left) / sliderRect.width) * 100
//     }

//     const newValue = Math.round(
//       (percentage * (props.max - props.min)) / 100 + props.min
//     )

//     const threshold = 5
//     const hasNearbyButton = values.value.some((value) => {
//       const buttonPosition =
//         ((value - props.min) / (props.max - props.min)) * 100
//       const clickPosition = percentage
//       const distance = Math.abs(buttonPosition - clickPosition)
//       return distance < threshold
//     })

//     if (!hasNearbyButton) {
//       values.value.push(newValue)
//       emit('update:modelValue', values.value)
//       emit('input', values.value)
//     }
//   }
// }

// const updateValue = (index: number, newValue: number) => {
//   const newValues = [...values.value]
//   newValues[index] = newValue
//   values.value = newValues
//   emit('update:modelValue', newValues)
//   emit('input', newValues)
// }
</script>

<style scoped>
.el-slider {
  position: relative;
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  user-select: none;
}

.el-slider.is-vertical {
  height: 100%;
  width: 32px;
}

.el-slider__runway {
  flex: 1;
  height: 6px;
  background-color: #e4e7ed;
  border-radius: 3px;
  position: relative;
  cursor: pointer;
}

.el-slider__bar {
  position: absolute;
  background-color: #409eff;
  height: 6px;
  border-radius: 3px;
}

.el-slider__stop {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #fff;
  transform: translateX(-50%);
}

:deep(.el-slider__button-wrapper) {
  position: absolute;
  height: 36px;
  width: 36px;
  transform: translateX(-50%);
  background-color: transparent;
  text-align: center;
  user-select: none;
  line-height: normal;
  top: -15px;
}

:deep(.el-slider__button) {
  width: 100%;
  height: 100%;
  border: 2px solid #409eff;
  background-color: #fff;
  border-radius: 50%;
  transition: 0.2s;
  user-select: none;
}
</style>
