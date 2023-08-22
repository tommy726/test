<script setup>
import VueDatePicker from "@/components/DatePickerComponent.vue";
import { ref, onMounted, computed } from "vue";
import { Modal } from "bootstrap";

const hourArray = [];
for (let i = 0; i < 24; i++) {
  let formattedNumber = i.toString().padStart(2, "0");
  hourArray.push(formattedNumber);
}
const props = defineProps({
  today: {
    type: String,
  },
});

const title = ref("");
const allDay = ref(true);
const startDate = computed(() => {
  return props.today;
});
const startHour = ref("00");
const startTime = ref("00");
const endHour = ref("00");
const endTime = ref("00");
const modalRef = ref(null);
let modal;
onMounted(() => {
  modal = new Modal(modalRef.value);
});

function openModal() {
  modal.show();
}
// eslint-disable-next-line no-undef
defineExpose({
  openModal,
});

const emit = defineEmits(["addEvent"]);
function addEvent() {
  modal.hide();
  const data = {
    title: title.value,
    allDay: allDay.value,
    startDate: startDate.value,
    startHour: startHour.value,
    startTime: startTime.value,
    endHour: endHour.value,
    endTime: endTime.value,
  };
  emit("addEvent", data);
}
</script>

<template>
  <!-- Modal -->
  <div
    class="modal fade"
    id="modal"
    tabindex="-1"
    aria-labelledby="modalLabel"
    aria-hidden="true"
    ref="modalRef"
  >
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="modalLabel">新增事件</h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body text-nowrap">
          <div class="d-flex align-items-center mb-1">
            <label for="title" class="col-form-label me-2">標題</label>
            <input
              v-model="title"
              type="text"
              id="title"
              class="form-control"
              aria-describedby="passwordHelpInline"
            />
          </div>
          <div class="d-flex align-items-center mb-1">
            <div class="d-flex">
              <label class="col-form-label me-2">日期</label>
              <VueDatePicker v-model="startDate" :format="startDate" />
            </div>

            <div class="form-check ms-2">
              <input
                v-model="allDay"
                class="form-check-input"
                type="checkbox"
                id="allDayCheck"
              />
              <label class="form-check-label" for="allDayCheck"> 整天 </label>
            </div>
          </div>
          <div v-if="!allDay">
            <div class="d-flex align-items-center mb-1">
              <label class="col-form-label me-2">開始時間</label>
              <div class="d-flex align-items-center">
                <select
                  v-model="startHour"
                  class="form-select"
                  aria-label="Default select example"
                >
                  <option
                    v-for="(item, index) in hourArray"
                    :key="index"
                    :value="item"
                  >
                    {{ item }}
                  </option>
                </select>
                ：
                <select
                  v-model="startTime"
                  class="form-select"
                  aria-label="Default select example"
                >
                  <option value="00">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
              </div>
            </div>
            <div class="d-flex align-items-center mb-1">
              <label class="col-form-label me-2">結束時間</label>
              <div class="d-flex align-items-center">
                <select
                  v-model="endHour"
                  class="form-select"
                  aria-label="Default select example"
                >
                  <option
                    v-for="(item, index) in hourArray"
                    :key="index"
                    :value="item"
                  >
                    {{ item }}
                  </option>
                </select>
                ：
                <select
                  v-model="endTime"
                  class="form-select"
                  aria-label="Default select example"
                >
                  <option value="00">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            關閉
          </button>
          <button @click="addEvent" type="button" class="btn btn-primary">
            新增
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
