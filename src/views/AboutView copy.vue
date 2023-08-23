<script setup>
import VueDatePicker from "@/components/DatePickerComponent.vue";
import { ref, onMounted } from "vue";
import { Modal } from "bootstrap";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { INITIAL_EVENTS, createEventId } from "@/event-utils";
import esLocale from "@fullcalendar/core/locales/zh-tw";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import "bootstrap-icons/font/bootstrap-icons.css";

const fullCalendarRef = ref(null);
let calendarApi;
const modalRef = ref(null);
let modal;

onMounted(() => {
  calendarApi = fullCalendarRef.value.getApi();
  modal = new Modal(modalRef.value);
});

const calendarOptions = ref({
  locale: esLocale,
  plugins: [bootstrap5Plugin, dayGridPlugin, timeGridPlugin, interactionPlugin],
  height: "100%",
  themeSystem: "bootstrap5",
  customButtons: {
    toggleWeekends: {
      text: "週末",
      click: () => {
        calendarOptions.value.weekends = !calendarOptions.value.weekends;
      },
    },
    clearButton: {
      text: "清空",
      click: () => {
        const events = calendarApi.getEvents();
        events.forEach((event) => event.remove());
      },
    },
    newEvent: {
      text: "+",
      click: () => {
        initData();
        openModal(true);
      },
    },
  },
  headerToolbar: {
    left: "title",
    center: "",
    right: "today prev,next",
  },
  footerToolbar: {
    left: "toggleWeekends clearButton",
    center: "newEvent",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  },

  initialView: "dayGridMonth",
  initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventsSet: handleEvents,
  dateClick: handleDateClick,
  /* you can update a remote database when these fire:
        eventAdd:
        eventChange:
        eventRemove:
        */
});

const currentEvents = ref([]);
function handleEvents(events) {
  currentEvents.value = events;
}

const hourArray = [];
for (let i = 0; i < 24; i++) {
  let formattedNumber = i.toString().padStart(2, "0");
  hourArray.push(formattedNumber);
}
const today = new Date().toISOString().replace(/T.*$/, "");
const title = ref("");
const allDay = ref();
const startTimeDetail = ref({
  startDate: "",
  startHour: "00",
  startMinute: "00",
});
const endTimeDetail = ref({
  endDate: "",
  endHour: "00",
  endMinute: "00",
});
const startDate = ref();
const startHour = ref("00");
const startMinute = ref("00");
const endDate = ref();
const endHour = ref("00");
const endTime = ref("00");
const titleInputRef = ref(null);

function getTimeDetail(data) {
  const regex = /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})/;
  const match = data.match(regex);

  const datePart = match[1];
  const hourPart = match[2];
  const minutePart = match[3];
  return { datePart, hourPart, minutePart };
}

let handleEvent;
function handleEventClick(clickInfo) {
  console.log(clickInfo.event.id);

  title.value = clickInfo.event.title;

  const startTime = clickInfo.event.start;
  const hours = startTime.getHours() + 8;
  startTime.setHours(hours);
  const startInfo = getTimeDetail(startTime.toISOString());
  const {
    datePart: startDatePart,
    hourPart: startHourPart,
    minutePart: startMinutePart,
  } = startInfo;
  allDay.value = clickInfo.event.allDay;
  startDate.value = startDatePart;
  startHour.value = startHourPart;
  startMinute.value = startMinutePart;
  if (clickInfo.event.end) {
    const endTime = clickInfo.event.end;
    const hours = endTime.getHours() + 8;
    endTime.setHours(hours);
    const endInfo = getTimeDetail(endTime.toISOString());
    const {
      datePart: endDatePart,
      hourPart: endHourPart,
      minutePart: endMinutePart,
    } = endInfo;
    endDate.value = endDatePart;
    endHour.value = endHourPart;
    endTime.value = endMinutePart;
  } else {
    endDate.value = startDatePart;
    endHour.value = startHourPart;
    endTime.value = startMinutePart;
  }

  handleEvent = clickInfo.event;
  openModal(false);
}

function removeEvent(event) {
  event.remove();
  modal.hide();
}

function editEvent(event) {
  event.remove();
  newEvent(event.id);
}

function handleDateSelect(selectInfo) {
  allDay.value = selectInfo.allDay;
  title.value = "";
  if (allDay.value) {
    startDate.value = selectInfo.startStr;
    endDate.value = selectInfo.endStr;
  }
  if (!allDay.value) {
    const startInfo = getTimeDetail(selectInfo.startStr);
    const endInfo = getTimeDetail(selectInfo.endStr);

    const {
      datePart: startDatePart,
      hourPart: startHourPart,
      minutePart: startMinutePart,
    } = startInfo;

    const {
      datePart: endDatePart,
      hourPart: endHourPart,
      minutePart: endMinutePart,
    } = endInfo;

    startDate.value = startDatePart;
    startHour.value = startHourPart;
    startMinute.value = startMinutePart;
    endDate.value = endDatePart;
    endHour.value = endHourPart;
    endTime.value = endMinutePart;
  }
  openModal(true);
}

function handleDateClick(clickInfo) {
  allDay.value = clickInfo.allDay;

  if (allDay.value) {
    initData();
    startDate.value = clickInfo.dateStr;
    endDate.value = clickInfo.dateStr;
  } else {
    const { datePart, hourPart, minutePart } = getTimeDetail(clickInfo.dateStr);
    startDate.value = datePart;
    startHour.value = hourPart;
    startMinute.value = minutePart;
    endDate.value = datePart;
    if (minutePart === "00") {
      endHour.value = hourPart;
      endTime.value = "30";
    } else {
      endHour.value = (parseInt(hourPart) + 1).toString().padStart(2, "0");
      if (endHour.value === "24") {
        endHour.value = "00";
      }
      endTime.value = "00";
    }
  }
  title.value = "";
  openModal(true);
}

const modalTitle = ref("");
const modalEvent = ref("");
function openModal(isNew = true) {
  if (isNew) {
    modalTitle.value = "新增事件";
    modalEvent.value = "new";
  } else {
    modalTitle.value = "編輯事件";
    modalEvent.value = "edit";
  }
  modal.show();
  // titleInputRef.value.focus();
}

function initData() {
  title.value = "";
  allDay.value = true;
  startDate.value = today;
  startHour.value = "00";
  startMinute.value = "00";
  endDate.value = today;
  endHour.value = "00";
  endTime.value = "00";
}

function newEvent(eventId) {
  if (!title.value) return;

  if (!eventId) {
    eventId = createEventId();
  }
  let start;
  let end;
  if (allDay.value) {
    start = startDate.value;
    end = endDate.value;
  } else {
    start = `${startDate.value}T${startHour.value}:${startMinute.value}`;
    end = `${endDate.value}T${endHour.value}:${endTime.value}`;
  }
  calendarApi.addEvent({
    id: eventId,
    title: title.value,
    start: start,
    end: end,
    allDay: allDay.value,
  });
  modal.hide();
  initData();
}
</script>

<template>
  <div class="demo-app container">
    <div class="demo-app-main">
      <FullCalendar
        class="demo-app-calendar"
        :options="calendarOptions"
        ref="fullCalendarRef"
      >
        <template v-slot:eventContent="arg">
          <b>{{ arg.timeText }}</b>
          <i>{{ arg.event.title }}</i>
        </template>
      </FullCalendar>
    </div>
    <!-- <div class="demo-app-sidebar">
      <div class="demo-app-sidebar-section">
        <h2>All Events ({{ currentEvents.length }})</h2>
        <ul>
          <li v-for="event in currentEvents" :key="event.id">
            <b>{{ event.startStr }}</b>
            <i>{{ event.title }}</i>
          </li>
        </ul>
      </div>
    </div> -->
  </div>

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
          <h1 class="modal-title fs-5" id="modalLabel">{{ modalTitle }}</h1>
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
              ref="titleInputRef"
              v-model="title"
              type="text"
              id="title"
              class="form-control"
              aria-describedby="passwordHelpInline"
            />
          </div>
          <div class="d-flex align-items-center mb-1">
            <label class="col-form-label me-2">開始日期</label>
            <VueDatePicker v-model="startDate" :format="startDate" />
          </div>
          <div class="d-flex align-items-center mb-1">
            <div class="d-flex">
              <label class="col-form-label me-2">結束日期</label>
              <VueDatePicker v-model="endDate" :format="endDate" />
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
                  v-model="startMinute"
                  class="form-select"
                  aria-label="Default select example"
                >
                  <option value="00">00</option>
                  <option value="30">30</option>
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
                  <option value="30">30</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <template v-if="modalEvent === 'new'">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              關閉
            </button>
            <button @click="newEvent()" type="button" class="btn btn-primary">
              新增
            </button>
          </template>
          <template v-else>
            <button
              @click="removeEvent(handleEvent)"
              type="button"
              class="btn btn-danger me-auto"
              data-bs-dismiss="modal"
            >
              刪除
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              關閉
            </button>
            <button
              @click="editEvent(handleEvent)"
              type="button"
              class="btn btn-primary"
            >
              編輯
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css">
h2 {
  margin: 0;
  font-size: 16px;
}

ul {
  margin: 0;
  padding: 0 0 0 1.5em;
}

li {
  margin: 1.5em 0;
  padding: 0;
}

b {
  /* used for event dates/times */
  margin-right: 3px;
}

.demo-app {
  /* display: flex; */
  min-height: 100%;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}

.demo-app-sidebar {
  margin: 10px auto;
  width: 300px;
  line-height: 1.5;
  background: #eaf9ff;
  border-right: 1px solid #d3e2e8;
}

.demo-app-sidebar-section {
  padding: 2em;
}

.demo-app-main {
  flex-grow: 1;
  height: 70vh;
}

.fc {
  max-width: 1100px;
  margin: 0 auto;
}

.fc .fc-toolbar-title {
  font-size: 18px;
}

.fc-daygrid-event-harness {
  overflow: hidden;
}

.fc .fc-popover {
  z-index: 100;
}

.dp__main {
  width: 130px;
}
/* 
.fc-toolbar {
  background-color: #f0f0f0;
  border: none;
  padding: 10px;
  text-align: center;
}

.fc-toolbar button {
  background-color: #d8d8d8;
  border: none;
  padding: 5px 10px;
  margin: 0 5px;
  color: #333;
  cursor: pointer;
}

.fc-toolbar .fc-center h2 {
  font-size: 1.5rem;
  margin: 0;
  color: #333;
} */
</style>
