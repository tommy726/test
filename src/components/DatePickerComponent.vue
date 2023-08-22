<script setup>
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
</script>

<template>
  <VueDatePicker
    hide-input-icon
    auto-close
    locale="zh-TW"
    week-start="0"
    auto-apply
    model-type="yyyy-MM-dd"
    :clearable="false"
    :enable-time-picker="false"
    :highlight-week-days="[0, 6]"
  >
    <!-- 可加text-input -->
    <template #calendar-header="{ index, day }">
      <div :class="index === 0 || index === 6 ? 'text-danger' : ''">
        {{ day }}
      </div>
    </template>
  </VueDatePicker>
</template>

<style>
/* .dp__input {
  max-width: 120px;
  text-align: center;
} */
</style>
