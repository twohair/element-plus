import { computed, watch } from 'vue'
import { UPDATE_MODEL_EVENT } from '@element-plus/constants'
import { debugWarn, throwError } from '@element-plus/utils'
import type { ComputedRef, SetupContext } from 'vue'
import type { Arrayable } from '@element-plus/utils'
import type { FormItemContext } from '@element-plus/components/form'
import type { SliderEmits, SliderInitData, SliderProps } from '../multiSlider'

export const useMultiWatch = (
  props: SliderProps,
  initData: SliderInitData,
  minValue: ComputedRef<number>,
  maxValue: ComputedRef<number>,
  emit: SetupContext<SliderEmits>['emit'],
  elFormItem: FormItemContext
) => {
  const _emit = (val: Arrayable<number>) => {
    emit(UPDATE_MODEL_EVENT, val)
  }
  const minValueIndex = computed(() => props.modelValue.indexOf(minValue.value))
  const maxValueIndex = computed(() => props.modelValue.indexOf(maxValue.value))

  const valueChanged = () => {
    return !props.modelValue.every(
      (item, index) => item === initData.oldValue![index]
    )
  }
  const setValues = () => {
    if (props.min > props.max) {
      throwError('Slider', 'min should not be greater than max.')
    }
    const val = props.modelValue
    if (val[maxValueIndex.value] < props.min) {
      _emit(val.map(() => props.min))
    } else if (val[minValueIndex.value] > props.max) {
      _emit(val.map(() => props.max))
    } else if (val.some((i) => i < props.min)) {
      _emit(val.map((i) => (i < props.min ? props.min : i)))
    } else if (val.some((i) => i > props.max)) {
      _emit(val.map((i) => (i > props.max ? props.max : i)))
    } else {
      initData.firstValue = val[minValueIndex.value]
      initData.secondValue = val[maxValueIndex.value]
      if (valueChanged()) {
        if (props.validateEvent) {
          elFormItem?.validate?.('change').catch((err) => debugWarn(err))
        }
        initData.oldValue = val.slice()
      }
    }
  }

  setValues()

  watch(
    () => initData.dragging,
    (val) => {
      if (!val) {
        setValues()
      }
    }
  )

  watch(
    () => props.modelValue,
    (val, oldVal) => {
      if (
        initData.dragging ||
        (val.every((item, index) => item === oldVal[index]) &&
          initData.firstValue === val[minValueIndex.value] &&
          initData.secondValue === val[maxValueIndex.value])
      ) {
        return
      }
      setValues()
    },
    {
      deep: true,
    }
  )

  watch(
    () => [props.min, props.max],
    () => {
      setValues()
    }
  )
}
