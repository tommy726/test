document.addEventListener("DOMContentLoaded", () => {
  const containerEl = document.getElementById("external-events-list");
  new FullCalendar.Draggable(containerEl, {
    itemSelector: ".fc-event",
    eventData: function (eventEl) {
      return {
        title: eventEl.innerText.trim(),
      };
    },
  });

  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "zh-tw",
    selectable: true,
    droppable: true,
    editable: true,
    dayMaxEventRows: 3,
    eventMaxStack: 3,
    customButtons: {
      myCustomButton: {
        text: "custom",
        click: () => {
          console.log("clicked the custom button");
        },
      },
      button: {
        text: "button",
        click: () => {
          console.log("Hello");
        },
      },
      resetButton: {
        text: "reset",
        click: () => {
          calendar.removeAllEventSources();
          const events = calendar.getEvents();
          events.forEach((event) => {
            if (!event.id.includes("default")) {
              event.remove();
            }
          });
          localStorage.removeItem("calendarEvents");
          // 加回預設選項
          calendar.addEventSource(defaultEvents);
        },
      },
      clearButton: {
        text: "clear",
        click: () => {
          const events = calendar.getEvents();
          events.forEach((event) => event.remove());
          localStorage.removeItem("calendarEvents");
        },
      },
    },
    headerToolbar: {
      left: "prevYear prev,next nextYear today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    footerToolbar: {
      left: "myCustomButton button",
      right: "clearButton resetButton",
    },
    businessHours: {
      // days of week. an array of zero-based day of week integers (0=Sunday)
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: "00:00", // a start time (10am in this example)
      endTime: "24:00", // an end time (6pm in this example)
    },
    drop: function (arg) {
      // is the "remove after drop" checkbox checked?
      if (document.getElementById("drop-remove").checked) {
        // if so, remove the element from the "Draggable Events" list
        arg.draggedEl.parentNode.removeChild(arg.draggedEl);
      }
    },
    eventResize: (info) => {
      alert(info.event.title + " end is now " + info.event.end.toISOString());

      if (!confirm("is this okay?")) {
        info.revert();
      }
    },
    // dateClick: (info) => {
    // 	console.log("Clicked on: " + info.dateStr);
    // 	console.log(
    // 		"Coordinates: " + info.jsEvent.pageX + "," + info.jsEvent.pageY,
    // 	);
    // 	console.log("Current view: " + info.view.type);
    // 	// change the day's background color just for fun
    // 	info.dayEl.style.backgroundColor = 'red';
    // },
    eventClick: (info) => {
      console.log(info.event.id);
      info.jsEvent.preventDefault();
      if (confirm("Are you sure you want to delete this event?")) {
        // 點擊刪除事件
        info.event.remove();
        // 點擊更改標題
        // info.event.setProp("title", "更改標題");
      }
      if (info.event.url) {
        window.open(info.event.url);
      }
    },
    select: (info) => {
      const title = prompt("Event Title:");
      if (title) {
        calendar.addEvent({
          id: `${title} + ${info.start}`,
          title: title,
          start: info.start,
          end: info.end,
          allDay: info.allDay,
          editable: true,
        });
      }
      calendar.unselect();
    },
    // eventAdd: (info) => {
    // 	saveEventsToLocalStorage(calendar.getEvents());
    // },
    // eventChange: () => {
    // 	saveEventsToLocalStorage(calendar.getEvents());
    // },
    // eventRemove: () => {
    // 	saveEventsToLocalStorage(calendar.getEvents());
    // },
    // eventReceive: () => {
    // 	saveEventsToLocalStorage(calendar.getEvents());
    // },
  });

  const defaultEvents = [
    {
      id: "yellow default",
      title: "yellowEvent",
      start: "20230821",
      allDay: true,
      // color: "yellow",
      // textColor: "black",
      classNames: ["eventClass"],
    },
    {
      id: "google default",
      title: "to Google",
      start: "20230828",
      url: "https://www.google.com",
    },
    // red areas where no events can be dropped
    {
      id: "default",
      start: "2023-08-24",
      end: "2023-08-28",
      overlap: false,
      display: "background",
      color: "#ff9f89",
    },
  ];

  const savedEvents = getEventsFromLocalStorage();
  if (savedEvents.length === 0) {
    calendar.addEventSource(defaultEvents);
  } else {
    calendar.addEventSource(savedEvents);
  }

  calendar.render();
  calendar.setOption("height", 600);

  window.addEventListener("beforeunload", function () {
    saveEventsToLocalStorage(calendar.getEvents());
  });

  const dateSelect = document.getElementById("dateSelect");
  function goDate(e) {
    calendar.gotoDate(e.target.value);
  }
  dateSelect.addEventListener("change", goDate);
});

function saveEventsToLocalStorage(events) {
  const eventData = events.map(function (event) {
    const eventData = {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      editable: event.editable,
      overlap: event.overlap,
      display: event.display,
      color: event.backgroundColor,
      textColor: event.textColor,
      classNames: event.classNames,
      // 其他
    };
    return eventData;
  });
  localStorage.setItem("calendarEvents", JSON.stringify(eventData));
}

function getEventsFromLocalStorage() {
  const eventData = localStorage.getItem("calendarEvents");
  if (eventData) {
    return JSON.parse(eventData);
  } else {
    return [];
  }
}
