<script setup>
import Modal from "@/components/ModalComponent.vue";
import { ref, onMounted } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { INITIAL_EVENTS, createEventId } from "@/event-utils";
import esLocale from "@fullcalendar/core/locales/zh-tw";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import "bootstrap-icons/font/bootstrap-icons.css";

const fullCalendarRef = ref();
let calendarApi;

onMounted(() => {
  calendarApi = fullCalendarRef.value.getApi();
});

const calendarOptions = ref({
  locale: esLocale,
  plugins: [bootstrap5Plugin, dayGridPlugin, timeGridPlugin, interactionPlugin],
  height: "100%",
  themeSystem: "bootstrap5",
  customButtons: {
    button: {
      text: "button",
      click: () => {
        console.log("Hello");
      }
    },
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
    addEvent: {
      text: "+",
      click: () => {
        openModal();
      }
    }
  },
  headerToolbar: {
    left: "title",
    center: "",
    right: "today prev,next"
  },
  footerToolbar: {
    left: "toggleWeekends clearButton",
    center: "addEvent",
    right: "dayGridMonth,timeGridWeek,timeGridDay"
  },

  initialView: "dayGridMonth",
  // initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  // select: handleDateSelect,
  eventClick: handleEventClick,
  eventsSet: handleEvents,
  dateClick: handleDateClick
  /* you can update a remote database when these fire:
        eventAdd:
        eventChange:
        eventRemove:
        */
});

const currentEvents = ref([]);
const today = ref(new Date().toISOString().replace(/T.*$/, ""));
const selectData = ref();

// function handleDateSelect(selectInfo) {
//   // selectData.value = {
//   //   start: selectInfo.startStr,
//   //   end: selectInfo.endStr,
//   //   allDay: selectInfo.allDay
//   // };
//   // modalRef.value.openModal();
//   console.log(selectInfo)
// }
function handleDateClick(clickInfo) {
  if (clickInfo.allDay) {
    selectData.value = {
      title: "",
      start: clickInfo.dateStr,
      end: clickInfo.dateStr,
      allDay: clickInfo.allDay
    };
  } else {
    // selectData.value = {
    //   title: "",
    //   start: "00",
    //   end: "00",
    //   allDay: true
    // };
    const regex = /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})/;
    const match = clickInfo.dateStr.match(regex);

    if (match) {
      const datePart = match[1]; // 提取日期部分，例如："2023-08-23"
      const hourPart = match[2]; // 提取小时部分，例如："09"
      const minutePart = match[3]; // 提取分钟部分，例如："30"

      console.log("日期部分:", datePart);
      console.log("小时部分:", hourPart);
      console.log("分钟部分:", minutePart);
      selectData.value = {
        title: "",
        start: clickInfo.dateStr,
        end: clickInfo.dateStr,
        allDay: clickInfo.allDay
      };
    }
  }
  today.value = clickInfo.dateStr;

  modalRef.value.openModal();
  console.log(clickInfo);
}

function handleEvents(events) {
  currentEvents.value = events;
}

const modalRef = ref();
function openModal() {
  today.value = new Date().toISOString().replace(/T.*$/, "");
  selectData.value = {
    startHour: "00",
    startTime: "00",
    endHour: "00",
    endTime: "00",
    allDay: true
  };
  modalRef.value.openModal();
}

function addEvent(data) {
  // console.log(data);
  let start;
  let end;
  if (!data.title) return;
  if (!data.allDay) {
    start = `${data.startDate}T${data.startHour}:${data.startTime}`;
    end = `${data.startDate}T${data.endHour}:${data.endTime}`;
  } else {
    start = data.startDate;
    end = data.startDate;
  }
  calendarApi.addEvent({
    id: createEventId(),
    title: data.title,
    start: start,
    end: end,
    allDay: data.allDay
  });
}

function handleEventClick(clickInfo) {
  if (
    confirm(
      `Are you sure you want to delete the event '${clickInfo.event.title}'`
    )
  ) {
    clickInfo.event.remove();
  }
}
</script>

<template>
  <Modal
    ref="modalRef"
    :today="today"
    :selectData="selectData"
    @addEvent="addEvent"
  />
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
    <div class="demo-app-sidebar">
      <div class="demo-app-sidebar-section">
        <h2>All Events ({{ currentEvents.length }})</h2>
        <ul>
          <li v-for="event in currentEvents" :key="event.id">
            <b>{{ event.startStr }}</b>
            <i>{{ event.title }}</i>
          </li>
        </ul>
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
