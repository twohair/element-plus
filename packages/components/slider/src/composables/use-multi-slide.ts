import { computed, nextTick, reactive, ref, shallowRef } from 'vue'
import { CHANGE_EVENT, UPDATE_MODEL_EVENT } from '@element-plus/constants'
import { useFormItem } from '@element-plus/components/form'
import type { CSSProperties, Ref, SetupContext, VNodeRef } from 'vue'
import type { Arrayable } from '@element-plus/utils'
import type { SliderEmits, SliderInitData, SliderProps } from '../multiSlider'
import type { SliderButtonInstance } from '../button'
interface Item {
  value: number
  instance?: SliderButtonInstance
  ref: VNodeRef
}
export const useMultiSlide = (
  props: SliderProps,
  initData: Partial<SliderInitData>,
  emit: SetupContext<SliderEmits>['emit']
) => {
  const { form: elForm, formItem: elFormItem } = useFormItem()

  const slider = shallowRef<HTMLElement>()

  const buttonRefs = ref<Item[]>(
    props.modelValue.map((value) => {
      const res: Item = {
        value,
        ref: (el) => (res.instance = (el as SliderButtonInstance)!),
      }
      return res
    })
  )

  const sliderDisabled = computed(() => {
    return props.disabled || elForm?.disabled || false
  })

  const minValue = computed(() => {
    return Math.min(...props.modelValue)
  })

  const maxValue = computed(() => {
    return Math.max(...props.modelValue)
  })

  const barSize = computed(() => {
    return props.modelValue.length > 1
      ? `${
          (100 * (maxValue.value - minValue.value)) / (props.max - props.min)
        }%`
      : `${
          (100 * (props.modelValue[0] - props.min)) / (props.max - props.min)
        }%`
  })

  const barStart = computed(() => {
    return props.modelValue.length > 1
      ? `${(100 * (minValue.value - props.min)) / (props.max - props.min)}%`
      : '0%'
  })

  const runwayStyle = computed<CSSProperties>(() => {
    return props.vertical ? { height: props.height } : {}
  })

  const barStyle = computed<CSSProperties>(() => {
    return props.vertical
      ? {
          height: barSize.value,
          bottom: barStart.value,
        }
      : {
          width: barSize.value,
          left: barStart.value,
        }
  })

  const resetSize = () => {
    if (slider.value) {
      initData.sliderSize =
        slider.value[`client${props.vertical ? 'Height' : 'Width'}`]
    }
  }

  const setPosition = async (
    percent: number,
    instance: Ref<SliderButtonInstance | undefined>
  ) => {
    await nextTick()
    instance.value!.setPosition(percent)
    return instance
  }

  const _emit = (val: Arrayable<number>) => {
    emit(UPDATE_MODEL_EVENT, val)
  }

  const emitChange = async () => {
    await nextTick()
    emit(
      CHANGE_EVENT,
      Array.isArray(props.modelValue)
        ? [minValue.value, maxValue.value]
        : props.modelValue
    )
  }

  const handleSliderPointerEvent = (
    event: MouseEvent | TouchEvent,
    instance: Ref<SliderButtonInstance | undefined>
  ) => {
    if (sliderDisabled.value || initData.dragging) return
    resetSize()
    let newPercent = 0
    if (props.vertical) {
      const clientY =
        (event as TouchEvent).touches?.item(0)?.clientY ??
        (event as MouseEvent).clientY
      const sliderOffsetBottom = slider.value!.getBoundingClientRect().bottom
      newPercent = ((sliderOffsetBottom - clientY) / initData.sliderSize!) * 100
    } else {
      const clientX =
        (event as TouchEvent).touches?.item(0)?.clientX ??
        (event as MouseEvent).clientX
      const sliderOffsetLeft = slider.value!.getBoundingClientRect().left
      newPercent = ((clientX - sliderOffsetLeft) / initData.sliderSize!) * 100
    }
    if (newPercent < 0 || newPercent > 100) return
    return setPosition(newPercent, instance)
  }

  const onSliderWrapperPrevent = (event: TouchEvent) => {
    if (
      buttonRefs.value.some(
        (item) => (item.instance as SliderButtonInstance)?.dragging
      )
    ) {
      event.preventDefault()
    }
  }

  const onSliderDown = async (event: MouseEvent | TouchEvent) => {
    const instance = ref<SliderButtonInstance>()
    buttonRefs.value.push(
      reactive<Item>({
        value: 0,
        instance: instance.value,
        ref: (el) => (instance.value = (el as SliderButtonInstance)!),
      })
    )
    await handleSliderPointerEvent(event, instance)
    // emit('update:modelActive', instance.value!.value)
    if (instance.value) {
      instance.value!.onButtonDown(event)
    }
  }

  const onSliderClick = async (event: MouseEvent | TouchEvent) => {
    const instance = ref<SliderButtonInstance>()
    buttonRefs.value.push(
      reactive<Item>({
        value: 0,
        instance: instance.value,
        ref: (el) => (instance.value = (el as SliderButtonInstance)!),
      })
    )
    await handleSliderPointerEvent(event, instance)
    if (instance.value) {
      emitChange()
    }
  }

  const onSliderMarkerDown = (position: number) => {
    if (sliderDisabled.value || initData.dragging) return
    const instance = ref<SliderButtonInstance>()
    buttonRefs.value.push(
      reactive<Item>({
        value: position,
        instance: instance.value,
        ref: (el) => (instance.value = (el as SliderButtonInstance)!),
      })
    )
  }

  const setButtonValue = (buttonOpt: Item, value: number) => {
    buttonOpt.value = value
    _emit(buttonRefs.value.map((item) => item.value))
  }
  return {
    elFormItem,
    slider,
    buttonRefs,
    sliderDisabled,
    minValue,
    maxValue,
    runwayStyle,
    barStyle,
    resetSize,
    setPosition,
    emitChange,
    onSliderWrapperPrevent,
    onSliderClick,
    onSliderDown,
    onSliderMarkerDown,
    setButtonValue,
  }
}
