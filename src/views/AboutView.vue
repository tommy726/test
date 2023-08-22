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
      },
    },
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
    addEvent: {
      text: "+",
      click: () => {
        openModal();
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
    center: "addEvent",
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
const today = ref(new Date().toISOString().replace(/T.*$/, ""));

function handleDateSelect(selectInfo) {
  console.log(selectInfo);
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

function handleDateClick(clickInfo) {
  today.value = clickInfo.dateStr;
  modalRef.value.openModal();

  // let title = prompt("Please enter a new title for your event");
  // if (title) {
  //   calendarApi.addEvent({
  //     id: createEventId(),
  //     title,
  //     // start: clickInfo.dateStr,
  //     start: `${clickInfo.dateStr}T08:00:00`,
  //     end: `${clickInfo.dateStr}T16:00:00`,
  //     // allDay: true,
  //   });
  // }
}

function handleEvents(events) {
  currentEvents.value = events;
}

const modalRef = ref();
function openModal() {
  today.value = new Date().toISOString().replace(/T.*$/, "");
  modalRef.value.openModal();
}

function addEvent(data) {
  console.log(data);
}
</script>

<template>
  <Modal ref="modalRef" :today="today" @addEvent="addEvent" />
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
