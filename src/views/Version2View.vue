<script setup>
import VueDatePicker from "@/components/DatePickerComponent.vue";
import { ref, onMounted } from "vue";
import { Modal } from "bootstrap";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import multiMonthPlugin from "@fullcalendar/multimonth";
import listPlugin from "@fullcalendar/list";
import { INITIAL_EVENTS, createEventId } from "@/event-utils";
import esLocale from "@fullcalendar/core/locales/zh-tw";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import "bootstrap-icons/font/bootstrap-icons.css";

const fullCalendarRef = ref(null);
let calendarApi;
const modalRef = ref(null);
let modal;
const titleInputRef = ref(null);

function saveEventsToLocalStorage() {
  localStorage.setItem(
    "calendarEvents",
    JSON.stringify(calendarApi.getEvents())
  );
}

function getEventsFromLocalStorage() {
  const eventData = localStorage.getItem("calendarEvents");
  if (eventData) {
    return JSON.parse(eventData);
  } else {
    return [];
  }
}

function inputFocus() {
  titleInputRef.value.focus();
  titleInputRef.value.click();
}

let debounceTimeout;
onMounted(() => {
  calendarApi = fullCalendarRef.value.getApi();
  const savedEvents = getEventsFromLocalStorage();
  calendarApi.addEventSource(savedEvents);
  modal = new Modal(modalRef.value);
  modalRef.value.addEventListener("shown.bs.modal", inputFocus);

  // 處理手機左右滑動
  const calendarEl = fullCalendarRef.value.$el;
  let startX, startY;

  calendarEl.addEventListener("touchstart", e => {
    startX = e.changedTouches[0].pageX;
    startY = e.changedTouches[0].pageY;
  });

  calendarEl.addEventListener("touchmove", e => {
    const deltaX = e.changedTouches[0].pageX - startX;
    const deltaY = e.changedTouches[0].pageY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        if (deltaX > 30) {
          calendarApi.prev();
        } else if (deltaX < -30) {
          calendarApi.next();
        }
      }, 200);
    }
  });
});

const calendarOptions = ref({
  locale: esLocale,
  plugins: [
    bootstrap5Plugin,
    listPlugin,
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin,
    multiMonthPlugin
  ],
  initialView: "dayGridMonth",
  height: "100%",
  themeSystem: "bootstrap5",
  customButtons: {
    toggleWeekends: {
      text: "週末",
      click: () => {
        calendarOptions.value.weekends = !calendarOptions.value.weekends;
      }
    },
    clearButton: {
      text: "清空",
      click: () => {
        const events = calendarApi.getEvents();
        events.forEach(event => event.remove());
      }
    },
    newEvent: {
      text: "+",
      click: () => {
        initData();
        openModal(true);
      }
    },
    multiMonthYear: {
      text: "年",
      click: () => {
        calendarApi.changeView("multiMonthYear");
      }
    },
    listWeekView: {
      text: "清單",
      click: () => {
        const { type } = calendarApi.view;
        if (type !== "listWeek") {
          calendarApi.changeView("listWeek");
        } else {
          calendarApi.changeView("dayGridMonth");
        }
      }
    }
  },
  headerToolbar: {
    left: "title",
    center: "",
    right: "clearButton listWeekView toggleWeekends"
  },
  footerToolbar: {
    left: "prev,today,next",
    center: "newEvent",
    right: "multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay"
  },
  // initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: false,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventsSet: handleEvents,
  dateClick: handleDateClick,
  eventAdd: saveEventsToLocalStorage,
  eventRemove: saveEventsToLocalStorage
  // eventChange: saveEventsToLocalStorage,
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
const startData = ref({
  date: "",
  hour: "00",
  minute: "00"
});
const endData = ref({
  date: "",
  hour: "00",
  minute: "00"
});

// 取得日期/小時/分鐘
function getTimeData(data) {
  const regex = /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})/;
  const match = data.match(regex);

  const date = match[1];
  const hour = match[2];
  const minute = match[3];
  return { date, hour, minute };
}

// 轉換時區
function convertTime(time) {
  const hours = time.getHours() + 8;
  time.setHours(hours);
  return getTimeData(time.toISOString());
}

let handleEvent;
function handleEventClick(clickInfo) {
  const { type } = calendarApi.view;
  if (type === "dayGridMonth" || type === "multiMonthYear") {
    calendarApi.changeView("timeGridDay", clickInfo.event.start);
    calendarApi.gotoDate(clickInfo.event.start);
  } else {
    title.value = clickInfo.event.title;
    allDay.value = clickInfo.event.allDay;
    handleEvent = clickInfo.event;

    const startTime = new Date(clickInfo.event.start);
    startData.value = convertTime(startTime);

    if (clickInfo.event.end) {
      const endTime = new Date(clickInfo.event.end);
      endData.value = convertTime(endTime);
    } else {
      endData.value = getTimeData(startTime.toISOString());
    }
    openModal(false);
  }
}

function handleDateSelect(selectInfo) {
  if (innerWidth < 992) return;

  allDay.value = selectInfo.allDay;
  title.value = "";
  if (allDay.value) {
    startData.value.date = selectInfo.startStr;
    endData.value.date = selectInfo.endStr;
  }
  if (!allDay.value) {
    startData.value = getTimeData(selectInfo.startStr);
    endData.value = getTimeData(selectInfo.endStr);
  }
  openModal(true);
}

function handleDateClick(clickInfo) {
  if (innerWidth >= 992) return;

  title.value = "";
  allDay.value = clickInfo.allDay;
  if (allDay.value) {
    initData();
    startData.value.date = clickInfo.dateStr;
    endData.value.date = clickInfo.dateStr;
  } else {
    startData.value = getTimeData(clickInfo.dateStr);
    endData.value.date = startData.value.date;
    if (startData.value.minute === "00") {
      endData.value.hour = startData.value.hour;
      endData.value.minute = "30";
    } else {
      endData.value.hour = (parseInt(startData.value.hour) + 1)
        .toString()
        .padStart(2, "0");
      if (endData.value.hour === "24") {
        endData.value.hour = "00";
      }
      endData.value.time = "00";
    }
  }
  openModal(true);
}

const modalTitle = ref("");
const modalEvent = ref("");

async function openModal(isNew = true) {
  if (isNew) {
    modalTitle.value = "新增事件";
    modalEvent.value = "new";
  } else {
    modalTitle.value = "編輯事件";
    modalEvent.value = "edit";
  }
  modal.show();
}

function initData() {
  title.value = "";
  allDay.value = true;
  const init = {
    date: today,
    hour: "00",
    minute: "00"
  };
  startData.value = { ...init };
  endData.value = { ...init };
}

function newEvent(eventId) {
  if (!title.value) return;
  if (!eventId) {
    eventId = createEventId();
  }

  let start;
  let end;
  if (allDay.value) {
    start = startData.value.date;
    end = endData.value.date;
  } else {
    start = `${startData.value.date}T${startData.value.hour}:${startData.value.minute}`;
    end = `${endData.value.date}T${endData.value.hour}:${endData.value.minute}`;
  }

  calendarApi.addEvent({
    id: eventId,
    title: title.value,
    start: start,
    end: end,
    allDay: allDay.value
  });

  modal.hide();
  initData();
}

function removeEvent() {
  if (handleEvent) {
    handleEvent.remove();
  }
  modal.hide();
}

function editEvent() {
  removeEvent();
  newEvent(handleEvent.id);
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
          <br v-if="arg.view.type === 'timeGridWeek'" />
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
            <label for="title" class="col-form-label me-2">代辦事項</label>
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
            <VueDatePicker v-model="startData.date" :format="startData.date" />
          </div>
          <div class="d-flex align-items-center mb-1">
            <div class="d-flex">
              <label class="col-form-label me-2">結束日期</label>
              <VueDatePicker v-model="endData.date" :format="endData.date" />
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
                  v-model="startData.hour"
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
                  v-model="startData.minute"
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
                  v-model="endData.hour"
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
                  v-model="endData.minute"
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
              @click="removeEvent"
              type="button"
              class="btn btn-danger me-auto"
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
            <button @click="editEvent" type="button" class="btn btn-primary">
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
  font-size: 16px;
}

.fc-daygrid-event-harness {
  overflow: hidden;
}

.fc .fc-popover {
  z-index: 100;
}

.dp__main {
  max-width: 134px;
}
.dp__input {
  padding: 6px 12px;
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
