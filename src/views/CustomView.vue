<template>
  <div>
    <FullCalendar
      ref="calendar"
      :plugins="calendarPlugins"
      :initialView="calendarView"
      :events="calendarEvents"
      @eventDrop="handleEventDrop"
    />
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction' // 导入交互插件

export default {
  components: {
    FullCalendar
  },
  data() {
    return {
      calendarPlugins: [dayGridPlugin, interactionPlugin],
      calendarView: 'dayGridMonth',
      calendarEvents: [
        // 你的日历事件数据
      ]
    }
  },
  methods: {
    handleEventDrop(info) {
      // 在事件被拖曳后的回调函数中处理事件
      console.log('Event dropped:', info)
      // 在这里你可以更新事件的日期等信息
    }
  }
}
</script>
