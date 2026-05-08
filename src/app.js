/* ================================================================
   CONSTANTS + Helpers
   ================================================================ */

const DAY_HEADERS = ['一', '二', '三', '四', '五', '六', '日'];
const WEEKEND_INDICES = new Set([5, 6]);

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ================================================================
   LunarCalendar
   ================================================================ */

const LunarCalendar = (() => {
  const LUNAR_INFO = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x16a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
    0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252,
    0x0d520
  ];

  const BASE_YEAR = 1900;
  const BASE_SOLAR_TS = Date.UTC(1900, 0, 31);

  function getInfo(year) { return LUNAR_INFO[year - BASE_YEAR]; }
  function leapMonth(year) { return getInfo(year) & 0xf; }
  function leapDays(year) { return getInfo(year) & 0x10000 ? 30 : 29; }
  function monthDays(year, month) { return getInfo(year) & (1 << (month + 3)) ? 30 : 29; }
  function yearDays(year) {
    let total = 0;
    for (let m = 1; m <= 12; m++) total += monthDays(year, m);
    const leap = leapMonth(year);
    if (leap) total += leapDays(year);
    return total;
  }

  return {
    solarToLunar(y, m, d) {
      const solarTs = Date.UTC(y, m - 1, d);
      let offset = Math.round((solarTs - BASE_SOLAR_TS) / 86400000);
      let lunarYear = BASE_YEAR, lunarMonth = 1, isLeap = false;
      while (offset >= yearDays(lunarYear)) { offset -= yearDays(lunarYear); lunarYear++; }
      const leap = leapMonth(lunarYear);
      for (let mo = 1; mo <= 12; mo++) {
        if (leap && mo === leap + 1 && !isLeap) mo--;
        const days = isLeap ? leapDays(lunarYear) : monthDays(lunarYear, mo);
        if (offset < days) { lunarMonth = mo; break; }
        offset -= days;
        if (leap && mo === leap && !isLeap) { isLeap = true; mo--; }
        else isLeap = false;
      }
      return { lunarYear, lunarMonth, lunarDay: offset + 1, isLeap };
    },
    getDayText(day) {
      const NAMES = [
        '', '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
        '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
        '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'
      ];
      return NAMES[day] || '';
    },
    getMonthText(month) {
      const NAMES = ['', '正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
      return NAMES[month] || '';
    },
  };
})();

/* ================================================================
   STATE
   ================================================================ */

const state = {
  viewYear: 0,
  viewMonth: 0,
  selectedDate: '',
  todayDate: '',
  events: [],
  pickerYear: 0,
  editingEventId: null,
  viewMode: 'calendar',
  eventFilter: 'before',
  currentWallpaper: null,
  randomWallpaper: false,
  wallpapers: [],
  holidayData: { holidays: {}, workdays: {} },
  periodDays: [],
  predictedDate: null,
  periodViewActive: false,
};

/* ================================================================
   DateUtils
   ================================================================ */

const DateUtils = {
  getTodayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },
  getDaysInMonth(year, month) { return new Date(year, month, 0).getDate(); },
  getFirstDayJSWday(year, month) { return new Date(year, month - 1, 1).getDay(); },
  toMonZero(jsDay) { return jsDay === 0 ? 6 : jsDay - 1; },
  formatYearMonth(year, month) { return `${year}/${String(month).padStart(2,'0')}`; },
  toISO(year, month, day) {
    return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  },
  isWeekend(dayIndex) { return WEEKEND_INDICES.has(dayIndex); },
  getHolidayName(dateISO) { return state.holidayData.holidays[dateISO] || null; },
  isHoliday(dateISO) { return !!state.holidayData.holidays[dateISO]; },
  isWorkday(dateISO) { return !!state.holidayData.workdays[dateISO]; },
  getLunarText(year, month, day) {
    const dateISO = DateUtils.toISO(year, month, day);
    const holiday = state.holidayData.holidays[dateISO];
    if (holiday) {
      const prev = new Date(year, month - 1, day - 1);
      const prevISO = `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}-${String(prev.getDate()).padStart(2,'0')}`;
      if (state.holidayData.holidays[prevISO] === holiday) {
        // continuation day, show lunar
      } else {
        return holiday;
      }
    }
    const lunar = LunarCalendar.solarToLunar(year, month, day);
    if (lunar.lunarDay === 1) return LunarCalendar.getMonthText(lunar.lunarMonth);
    return LunarCalendar.getDayText(lunar.lunarDay);
  },
  getDayDiff(dateISO) {
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(dateISO + 'T00:00:00');
    return Math.round((target - today) / 86400000);
  },
  getRelativeDays(ev) {
    const today = DateUtils.getTodayISO();
    const [ty, tm, td] = today.split('-').map(Number);
    const todayTs = Date.UTC(ty, tm - 1, td);

    if (ev.type === 'one-time') {
      const [y, m, d] = ev.dateISO.split('-').map(Number);
      return Math.round((Date.UTC(y, m - 1, d) - todayTs) / 86400000);
    }

    const thisYearTs = Date.UTC(ty, ev.month - 1, ev.day);
    const nextYearTs = Date.UTC(ty + 1, ev.month - 1, ev.day);
    if (thisYearTs > todayTs) return Math.round((thisYearTs - todayTs) / 86400000);
    return Math.round((nextYearTs - todayTs) / 86400000);
  },
};

/* ================================================================
   CalendarEngine
   ================================================================ */

const CalendarEngine = {
  generateGrid(year, month, todayISO) {
    const daysInMonth = DateUtils.getDaysInMonth(year, month);
    const firstDayJSW = DateUtils.getFirstDayJSWday(year, month);
    const offset = DateUtils.toMonZero(firstDayJSW);
    const firstDate = 1 - offset;
    const totalCells = Math.ceil((daysInMonth + offset) / 7) * 7;
    const events = state.events || [];

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const daysInPrevMonth = DateUtils.getDaysInMonth(prevYear, prevMonth);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const grid = [];

    for (let i = 0; i < totalCells; i++) {
      const absoluteDay = firstDate + i;
      const dayIndex = i % 7;
      let day, cellMonth, cellYear, isCurrentMonth;

      if (absoluteDay < 1) {
        day = daysInPrevMonth + absoluteDay; cellMonth = prevMonth; cellYear = prevYear; isCurrentMonth = false;
      } else if (absoluteDay > daysInMonth) {
        day = absoluteDay - daysInMonth; cellMonth = nextMonth; cellYear = nextYear; isCurrentMonth = false;
      } else {
        day = absoluteDay; cellMonth = month; cellYear = year; isCurrentMonth = true;
      }

      const dateISO = DateUtils.toISO(cellYear, cellMonth, day);
      const annualEvent = events.find(e => e.type === 'annual' && e.month === cellMonth && e.day === day);
      const oneTimeEvent = events.find(e => e.type === 'one-time' && e.dateISO === dateISO);

      grid.push({
        day, dateISO, isCurrentMonth,
        isToday: dateISO === todayISO,
        isWeekend: DateUtils.isWeekend(dayIndex),
        isHoliday: DateUtils.isHoliday(dateISO),
        isWorkday: DateUtils.isWorkday(dateISO),
        holidayName: DateUtils.getHolidayName(dateISO),
        lunarText: DateUtils.getLunarText(cellYear, cellMonth, day),
        dayIndex,
        hasAnnual: !!annualEvent,
        hasOneTime: !!oneTimeEvent,
        isPeriod: state.periodDays.includes(dateISO),
        isPredicted: dateISO === state.predictedDate && !state.periodDays.includes(dateISO),
      });
    }
    return grid;
  },
};

/* ================================================================
   Renderer
   ================================================================ */

const Renderer = {
  initHeaders() {
    const container = document.getElementById('day-headers');
    container.innerHTML = '';
    DAY_HEADERS.forEach(label => {
      const div = document.createElement('div');
      div.className = 'day-header';
      div.textContent = label;
      container.appendChild(div);
    });
  },

  renderHeader(year, month) {
    document.getElementById('month-year').textContent = DateUtils.formatYearMonth(year, month);
  },

  renderGrid(gridData) {
    const gridEl = document.getElementById('calendar-grid');
    gridEl.innerHTML = '';
    gridData.forEach(cell => {
      const div = document.createElement('div');
      div.className = 'day-cell';
      div.dataset.date = cell.dateISO;

      const classes = [];
      if (!cell.isCurrentMonth) classes.push('dimmed');
      if (cell.isWeekend) classes.push('weekend');
      if (cell.isHoliday) classes.push('holiday');
      if (cell.isToday) classes.push('today');
      if (cell.dateISO === state.selectedDate) classes.push('selected');
      if (classes.length) div.classList.add(...classes);

      const dayNum = document.createElement('span');
      dayNum.className = 'day-num';
      dayNum.textContent = cell.day;
      div.appendChild(dayNum);

      if (cell.lunarText) {
        const lunarSpan = document.createElement('span');
        lunarSpan.className = 'lunar-text';
        lunarSpan.textContent = cell.lunarText;
        div.appendChild(lunarSpan);
      }

      if (cell.isPeriod) {
        const heart = document.createElement('span');
        heart.className = 'period-heart period-heart-red';
        heart.textContent = '♥';
        div.appendChild(heart);
      } else if (cell.isPredicted) {
        const heart = document.createElement('span');
        heart.className = 'period-heart period-heart-gray';
        heart.textContent = '♥';
        div.appendChild(heart);
      }

      if (cell.isHoliday) {
        const badge = document.createElement('span');
        badge.className = 'holiday-badge rest-badge';
        badge.textContent = '休';
        div.appendChild(badge);
      } else if (cell.isWorkday) {
        const badge = document.createElement('span');
        badge.className = 'holiday-badge work-badge';
        badge.textContent = '补';
        div.appendChild(badge);
      }

      if (cell.hasAnnual) {
        const marker = document.createElement('span');
        marker.className = 'event-marker event-marker-annual';
        div.appendChild(marker);
      }
      if (cell.hasOneTime) {
        const marker = document.createElement('span');
        marker.className = 'event-marker event-marker-one-time';
        div.appendChild(marker);
      }

      if (cell.holidayName) div.title = cell.holidayName;
      div.addEventListener('click', () => Controller.onDateClick(cell.dateISO));
      gridEl.appendChild(div);
    });
  },

  updateSelection(newISO) {
    const prev = document.querySelector('.day-cell.selected');
    if (prev) prev.classList.remove('selected');
    const next = document.querySelector(`.day-cell[data-date="${newISO}"]`);
    if (next) next.classList.add('selected');
  },

  initPicker() {
    const grid = document.getElementById('picker-month-grid');
    ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'].forEach((label, i) => {
      const btn = document.createElement('button');
      btn.className = 'picker-month-btn';
      btn.textContent = label;
      btn.dataset.month = i + 1;
      btn.addEventListener('click', () => Controller.onPickerMonthClick(i + 1));
      grid.appendChild(btn);
    });
  },

  openPicker() { document.getElementById('picker-overlay').classList.remove('hidden'); this._updatePicker(); },
  closePicker() { document.getElementById('picker-overlay').classList.add('hidden'); },
  _updatePicker() {
    document.getElementById('picker-year-label').textContent = state.pickerYear;
    document.querySelectorAll('.picker-month-btn').forEach(btn => {
      btn.classList.remove('current');
      if (state.pickerYear === state.viewYear && Number(btn.dataset.month) === state.viewMonth) {
        btn.classList.add('current');
      }
    });
  },

  // --- Event modal ---

  initEventModal() {
    const yearSelect = document.getElementById('event-date-year');
    const cy = new Date().getFullYear();
    for (let y = cy - 10; y <= cy + 10; y++) {
      const opt = document.createElement('option'); opt.value = y; opt.textContent = `${y}年`; yearSelect.appendChild(opt);
    }
    const monthSelect = document.getElementById('event-date-month');
    for (let m = 1; m <= 12; m++) {
      const opt = document.createElement('option'); opt.value = m; opt.textContent = `${m}月`; monthSelect.appendChild(opt);
    }
    const daySelect = document.getElementById('event-date-day');
    for (let d = 1; d <= 31; d++) {
      const opt = document.createElement('option'); opt.value = d; opt.textContent = `${d}日`; daySelect.appendChild(opt);
    }
    document.querySelectorAll('input[name="event-type"]').forEach(el => {
      el.addEventListener('change', () => Controller.onEventTypeChange());
    });
  },

  openEventModal(existingEvent) {
    document.getElementById('event-overlay').classList.remove('hidden');
    document.getElementById('event-title').value = '';
    document.getElementById('event-reminder').value = '';
    document.getElementById('event-notes').value = '';
    document.getElementById('event-type-annual').checked = true;
    document.getElementById('event-date-year').classList.add('hidden');
    document.getElementById('event-memorial-row').classList.add('hidden');
    document.getElementById('event-memorial').checked = false;

    const [y, m, d] = state.selectedDate.split('-').map(Number);
    document.getElementById('event-date-year').value = y;
    document.getElementById('event-date-month').value = m;
    document.getElementById('event-date-day').value = d;

    if (existingEvent) {
      document.getElementById('event-modal-title').textContent = '编辑事项';
      state.editingEventId = existingEvent.id;
      document.getElementById('event-title').value = existingEvent.title;
      document.getElementById('event-notes').value = existingEvent.notes || '';
      document.getElementById('event-reminder').value = existingEvent.reminderTime || '';

      if (existingEvent.type === 'annual') {
        document.getElementById('event-type-annual').checked = true;
        document.getElementById('event-date-year').classList.add('hidden');
        document.getElementById('event-date-month').value = existingEvent.month;
        document.getElementById('event-date-day').value = existingEvent.day;
        document.getElementById('event-memorial-row').classList.add('hidden');
      } else {
        document.getElementById('event-type-one-time').checked = true;
        document.getElementById('event-date-year').classList.remove('hidden');
        const [ey, em, ed] = existingEvent.dateISO.split('-').map(Number);
        document.getElementById('event-date-year').value = ey;
        document.getElementById('event-date-month').value = em;
        document.getElementById('event-date-day').value = ed;
        document.getElementById('event-memorial').checked = existingEvent.isMemorial || false;
        document.getElementById('event-memorial-row').classList.remove('hidden');
      }
    } else {
      document.getElementById('event-modal-title').textContent = '添加事项';
      state.editingEventId = null;
    }

    document.getElementById('event-title').focus();
  },

  closeEventModal() {
    document.getElementById('event-overlay').classList.add('hidden');
    state.editingEventId = null;
  },

  getEventFormData() {
    const type = document.querySelector('input[name="event-type"]:checked').value;
    const title = document.getElementById('event-title').value.trim();
    if (!title) return null;
    const month = Number(document.getElementById('event-date-month').value);
    const day = Number(document.getElementById('event-date-day').value);
    const reminderTime = document.getElementById('event-reminder').value || null;
    const notes = document.getElementById('event-notes').value.trim() || null;
    if (type === 'annual') {
      return { type: 'annual', title, month, day, dateISO: null, isMemorial: false, reminderTime, notes };
    }
    const year = Number(document.getElementById('event-date-year').value);
    const dateISO = DateUtils.toISO(year, month, day);
    const isMemorial = document.getElementById('event-memorial').checked;
    return { type: 'one-time', title, month: null, day: null, dateISO, isMemorial, reminderTime, notes };
  },

  // --- Calendar event list panel ---

  renderEventList(dateISO) {
    const [y, m, d] = dateISO.split('-').map(Number);
    const matched = (state.events || []).filter(ev => {
      if (ev.type === 'annual') return ev.month === m && ev.day === d;
      return ev.dateISO === dateISO;
    });

    const titleEl = document.getElementById('event-list-title');
    const itemsEl = document.getElementById('event-list-items');
    itemsEl.innerHTML = '';

    if (matched.length === 0) {
      titleEl.textContent = '';
      const empty = document.createElement('span');
      empty.className = 'event-list-empty';
      empty.textContent = '无事项';
      itemsEl.appendChild(empty);
      return;
    }

    titleEl.textContent = `当日事项 (${matched.length})`;

    matched.forEach(ev => {
      const row = document.createElement('div');
      row.className = 'event-list-item';

      const marker = document.createElement('span');
      marker.className = `event-list-marker ${ev.type === 'annual' ? 'annual' : 'one-time'}`;
      row.appendChild(marker);

      const name = document.createElement('span');
      name.className = 'event-list-name';
      name.textContent = ev.title;
      row.appendChild(name);

      if (ev.notes) {
        const notesSpan = document.createElement('span');
        notesSpan.className = 'event-list-notes';
        notesSpan.textContent = ev.notes;
        row.appendChild(notesSpan);
      }

      const spacer = document.createElement('span');
      spacer.style.cssText = 'flex:1';
      row.appendChild(spacer);

      if (ev.reminderTime) {
        const time = document.createElement('span');
        time.className = 'event-list-time';
        time.textContent = ev.reminderTime;
        row.appendChild(time);
      }

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.textContent = '✏';
      editBtn.title = '修改';
      editBtn.addEventListener('click', (e) => { e.stopPropagation(); Controller.onEditEvent(ev.id); });
      row.appendChild(editBtn);

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn danger';
      delBtn.textContent = '🗑';
      delBtn.title = '删除';
      delBtn.addEventListener('click', (e) => { e.stopPropagation(); Controller.onDeleteEvent(ev.id); });
      row.appendChild(delBtn);

      itemsEl.appendChild(row);
    });
  },

  // --- Event view ---

  getEventViewRows(filter) {
    const today = DateUtils.getTodayISO();
    const [ty, tm, td] = today.split('-').map(Number);
    const todayTs = Date.UTC(ty, tm - 1, td);
    const rows = [];

    (state.events || []).forEach(ev => {
      if (ev.type === 'one-time') {
        const [ey, em, ed] = ev.dateISO.split('-').map(Number);
        const ts = Date.UTC(ey, em - 1, ed);
        const diff = Math.round((ts - todayTs) / 86400000);
        if (filter === 'before' && diff <= 0) rows.push({ ...ev, relativeDays: diff });
        if (filter === 'after' && diff >= 0) rows.push({ ...ev, relativeDays: diff });
      } else {
        const diff = DateUtils.getRelativeDays(ev);
        if (filter === 'before') {
          const pastDiff = diff > 0 ? diff - 365 : diff;
          rows.push({ ...ev, relativeDays: pastDiff });
        }
        if (filter === 'after') {
          rows.push({ ...ev, relativeDays: diff });
        }
      }
    });

    // Sort: pinned first (by pinnedAt), then by |relativeDays| asc
    rows.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (a.pinned && b.pinned) return (a.pinnedAt || 0) - (b.pinnedAt || 0);
      return Math.abs(a.relativeDays) - Math.abs(b.relativeDays);
    });

    return rows;
  },

  renderEventView() {
    const listEl = document.getElementById('event-view-list');
    listEl.innerHTML = '';
    const rows = this.getEventViewRows(state.eventFilter);

    if (rows.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'event-list-empty';
      empty.style.cssText = 'padding: 20px; text-align: center;';
      empty.textContent = '无事项';
      listEl.appendChild(empty);
      return;
    }

    rows.forEach(ev => {
      const row = document.createElement('div');
      row.className = 'ev-row';
      if (ev.pinned) row.classList.add('pinned');

      // Pin button
      const pinBtn = document.createElement('button');
      pinBtn.className = ev.pinned ? 'icon-btn pin active' : 'icon-btn pin';
      pinBtn.textContent = '📌';
      pinBtn.title = ev.pinned ? '取消置顶' : '置顶';
      pinBtn.addEventListener('click', () => Controller.onTogglePin(ev.id));
      row.appendChild(pinBtn);

      // Marker
      const marker = document.createElement('span');
      marker.className = `event-list-marker ${ev.type === 'annual' ? 'annual' : 'one-time'}`;
      row.appendChild(marker);

      // Title
      const name = document.createElement('span');
      name.className = 'event-list-name';
      name.textContent = ev.title;
      row.appendChild(name);

      // Notes (left-aligned, after title)
      if (ev.notes) {
        const notesSpan = document.createElement('span');
        notesSpan.className = 'event-list-notes';
        notesSpan.textContent = ev.notes;
        row.appendChild(notesSpan);
      }

      // Spacer pushes remaining items to the right
      const spacer = document.createElement('span');
      spacer.style.cssText = 'flex:1';
      row.appendChild(spacer);

      // Reminder
      if (ev.reminderTime) {
        const time = document.createElement('span');
        time.className = 'event-list-time';
        time.textContent = ev.reminderTime;
        row.appendChild(time);
      }

      // Relative days
      const diffSpan = document.createElement('span');
      diffSpan.className = 'event-list-time';
      const ad = Math.abs(ev.relativeDays);
      diffSpan.textContent = ev.relativeDays > 0 ? `${ad}天后` : (ev.relativeDays < 0 ? `${ad}天前` : '今天');
      row.appendChild(diffSpan);

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.textContent = '✏';
      editBtn.title = '修改';
      editBtn.addEventListener('click', () => Controller.onEditEvent(ev.id));
      row.appendChild(editBtn);

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn danger';
      delBtn.textContent = '🗑';
      delBtn.title = '删除';
      delBtn.addEventListener('click', () => Controller.onDeleteEvent(ev.id));
      row.appendChild(delBtn);

      listEl.appendChild(row);
    });
  },

  renderPeriodView() {
    const listEl = document.getElementById('event-view-list');
    listEl.innerHTML = '';
    const today = DateUtils.getTodayISO();
    const filter = state.eventFilter;

    if (filter === 'before') {
      const past = [...state.periodDays].filter(d => d <= today).sort().reverse().slice(0, 8);
      if (past.length === 0) {
        const empty = document.createElement('span');
        empty.className = 'event-list-empty';
        empty.style.cssText = 'padding:20px;text-align:center;';
        empty.textContent = '无历史记录';
        listEl.appendChild(empty);
        return;
      }
      past.forEach(dateISO => {
        const row = document.createElement('div');
        row.className = 'ev-row';
        const heart = document.createElement('span');
        heart.className = 'period-heart period-heart-red';
        heart.style.cssText = 'position:static;font-size:0.85rem;';
        heart.textContent = '♥';
        row.appendChild(heart);
        const label = document.createElement('span');
        label.className = 'event-list-name';
        label.textContent = dateISO;
        row.appendChild(label);
        const diff = DateUtils.getDayDiff(dateISO);
        const diffSpan = document.createElement('span');
        diffSpan.className = 'event-list-time';
        const ad = Math.abs(diff);
        diffSpan.textContent = diff < 0 ? `${ad}天前` : '今天';
        row.appendChild(diffSpan);

        const spacer = document.createElement('span');
        spacer.style.cssText = 'flex:1';
        row.appendChild(spacer);

        const delBtn = document.createElement('button');
        delBtn.className = 'icon-btn danger';
        delBtn.textContent = '🗑';
        delBtn.title = '删除';
        delBtn.addEventListener('click', () => Controller.onDeletePeriodDay(dateISO));
        row.appendChild(delBtn);

        listEl.appendChild(row);
      });
    } else {
      const future = state.predictedDate && state.predictedDate >= today && !state.periodDays.includes(state.predictedDate)
        ? [state.predictedDate] : [];
      if (future.length === 0) {
        const empty = document.createElement('span');
        empty.className = 'event-list-empty';
        empty.style.cssText = 'padding:20px;text-align:center;';
        empty.textContent = '暂无预测';
        listEl.appendChild(empty);
        return;
      }
      future.forEach(dateISO => {
        const row = document.createElement('div');
        row.className = 'ev-row';
        const heart = document.createElement('span');
        heart.className = 'period-heart period-heart-gray';
        heart.style.cssText = 'position:static;font-size:0.85rem;';
        heart.textContent = '♥';
        row.appendChild(heart);
        const label = document.createElement('span');
        label.className = 'event-list-name';
        label.textContent = dateISO + ' (预测)';
        row.appendChild(label);
        const diff = DateUtils.getDayDiff(dateISO);
        const diffSpan = document.createElement('span');
        diffSpan.className = 'event-list-time';
        diffSpan.textContent = diff > 0 ? `${diff}天后` : '今天';
        row.appendChild(diffSpan);
        listEl.appendChild(row);
      });
    }
  },

  renderDayDiff(dateISO) {
    const diffEl = document.getElementById('day-diff');
    const backBtn = document.getElementById('btn-back-today');
    if (dateISO === state.todayDate) {
      diffEl.textContent = ''; diffEl.style.display = 'none'; backBtn.style.display = 'none'; return;
    }
    const diff = DateUtils.getDayDiff(dateISO);
    const text = diff > 0 ? `${diff}天后` : `${Math.abs(diff)}天前`;
    diffEl.textContent = text; diffEl.style.display = ''; backBtn.style.display = '';
  },

  // --- View switching ---

  // --- Wallpaper ---

  applyWallpaper(filename) {
    if (filename) {
      const dir = state.wallpaperDir.replace(/\\/g, '/');
      document.body.style.backgroundImage = `url(file:///${dir}/${filename})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
    }
  },

  openWallpaperMenu() {
    document.getElementById('wallpaper-overlay').classList.remove('hidden');
    document.getElementById('wp-manage-panel').classList.add('hidden');
    document.getElementById('wp-random').checked = state.randomWallpaper;
  },

  closeWallpaperMenu() {
    document.getElementById('wallpaper-overlay').classList.add('hidden');
  },

  async renderWallpaperGrid() {
    const grid = document.getElementById('wp-grid');
    grid.innerHTML = '';
    if (state.wallpapers.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'event-list-empty';
      empty.style.cssText = 'grid-column:1/-1;text-align:center;padding:20px;';
      empty.textContent = '暂无壁纸，请先导入';
      grid.appendChild(empty);
      return;
    }
    const wpDir = state.wallpaperDir.replace(/\\/g, '/');
    state.wallpapers.forEach(fn => {
      const div = document.createElement('div');
      div.className = 'wp-thumb';
      if (fn === state.currentWallpaper) div.classList.add('active');

      const img = document.createElement('img');
      img.src = `file:///${wpDir}/${fn}`;
      div.appendChild(img);

      div.addEventListener('click', () => Controller.onSelectWallpaper(fn));

      const del = document.createElement('button');
      del.className = 'wp-del';
      del.textContent = '✕';
      del.addEventListener('click', (e) => { e.stopPropagation(); Controller.onDeleteWallpaper(fn); });
      div.appendChild(del);

      grid.appendChild(div);
    });
  },

  switchView(mode) {
    state.viewMode = mode;
    const calendarView = document.getElementById('calendar-container');
    const eventListPanel = document.getElementById('event-list-panel');
    const eventView = document.getElementById('event-view');
    const viewSwitcher = document.getElementById('view-switcher');
    const header = document.getElementById('calendar-header');

    const calBtn = document.getElementById('switch-calendar');
    const evtBtn = document.getElementById('switch-events');

    if (mode === 'calendar') {
      calendarView.classList.remove('hidden');
      eventListPanel.classList.remove('hidden');
      eventView.classList.add('hidden');
      header.querySelectorAll('button').forEach(b => b.style.display = '');
      document.getElementById('day-diff').style.display = state.selectedDate === state.todayDate ? 'none' : '';
      calBtn.classList.add('active');
      evtBtn.classList.remove('active');
    } else {
      calendarView.classList.add('hidden');
      eventListPanel.classList.add('hidden');
      eventView.classList.remove('hidden');
      document.getElementById('btn-prev').style.display = 'none';
      document.getElementById('btn-next').style.display = 'none';
      document.getElementById('day-diff').style.display = 'none';
      document.getElementById('btn-back-today').style.display = 'none';
      calBtn.classList.remove('active');
      evtBtn.classList.add('active');
    }
  },
};

/* ================================================================
   Controller
   ================================================================ */

const Controller = {
  onDateClick(dateISO) {
    if (dateISO === state.selectedDate) return;
    const [y, m] = dateISO.split('-').map(Number);
    if (y !== state.viewYear || m !== state.viewMonth) {
      state.viewYear = y; state.viewMonth = m; state.selectedDate = dateISO;
      this._rerenderGrid(); return;
    }
    state.selectedDate = dateISO;
    Renderer.updateSelection(dateISO);
    Renderer.renderDayDiff(dateISO);
    Renderer.renderEventList(dateISO);
  },

  onPrevMonth() {
    if (state.viewMonth === 1) { state.viewMonth = 12; state.viewYear--; }
    else state.viewMonth--;
    this._rerenderGrid();
  },

  onNextMonth() {
    if (state.viewMonth === 12) { state.viewMonth = 1; state.viewYear++; }
    else state.viewMonth++;
    this._rerenderGrid();
  },

  onMonthYearClick() {
    if (!document.getElementById('picker-overlay').classList.contains('hidden')) {
      Renderer.closePicker(); return;
    }
    state.pickerYear = state.viewYear;
    Renderer.openPicker();
  },

  onPickerYearPrev() { state.pickerYear--; Renderer._updatePicker(); },
  onPickerYearNext() { state.pickerYear++; Renderer._updatePicker(); },
  onPickerMonthClick(month) {
    state.viewYear = state.pickerYear; state.viewMonth = month;
    Renderer.closePicker(); this._rerenderGrid();
  },

  onAddEventClick() { Renderer.openEventModal(); },

  onEditEvent(id) {
    const ev = state.events.find(e => e.id === id);
    if (ev) Renderer.openEventModal(ev);
  },

  onEventTypeChange() {
    const type = document.querySelector('input[name="event-type"]:checked').value;
    const yearSelect = document.getElementById('event-date-year');
    const memorialRow = document.getElementById('event-memorial-row');
    if (type === 'annual') { yearSelect.classList.add('hidden'); memorialRow.classList.add('hidden'); }
    else { yearSelect.classList.remove('hidden'); memorialRow.classList.remove('hidden'); }
  },

  async onEventSave() {
    const data = Renderer.getEventFormData();
    if (!data) return;

    if (state.editingEventId) {
      const idx = state.events.findIndex(e => e.id === state.editingEventId);
      if (idx !== -1) {
        const existing = state.events[idx];
        Object.assign(existing, data);
      }
    } else {
      const event = { id: generateId(), pinned: false, pinnedAt: null, ...data };
      state.events.push(event);
    }

    await DataManager.saveEvents();
    Renderer.closeEventModal();
    this._refreshAll();
  },

  async onDeleteEvent(id) {
    state.events = state.events.filter(e => e.id !== id);
    await DataManager.saveEvents();
    this._refreshAll();
  },

  async onTogglePin(id) {
    const ev = state.events.find(e => e.id === id);
    if (!ev) return;
    if (ev.pinned) { ev.pinned = false; ev.pinnedAt = null; }
    else { ev.pinned = true; ev.pinnedAt = Date.now(); }
    await DataManager.saveEvents();
    Renderer.renderEventView();
    if (state.viewMode === 'calendar') {
      Renderer.renderEventList(state.selectedDate);
      this._rerenderGrid();
    }
  },

  onSwitchView(mode) {
    Renderer.switchView(mode);
    if (mode === 'events') {
      state.periodViewActive = false;
      document.getElementById('month-year').textContent = '事件列表';
      Renderer.renderEventView();
    } else {
      state.periodViewActive = false;
      Renderer.renderHeader(state.viewYear, state.viewMonth);
      this._rerenderGrid();
    }
  },

  onEventFilter(filter) {
    state.eventFilter = filter;
    document.getElementById('tab-before').classList.toggle('active', filter === 'before');
    document.getElementById('tab-after').classList.toggle('active', filter === 'after');
    if (state.periodViewActive) {
      Renderer.renderPeriodView();
    } else {
      Renderer.renderEventView();
    }
  },

  // --- Wallpaper ---

  onOpenWallpaperMenu() {
    Renderer.openWallpaperMenu();
  },

  async onImportWallpaper() {
    if (!window.calendarAPI) return;
    const filename = await window.calendarAPI.importWallpaper();
    if (!filename) return;
    state.wallpapers.push(filename);
    state.currentWallpaper = filename;
    Renderer.applyWallpaper(filename);
    await this._saveWallpaperSettings();
    Renderer.closeWallpaperMenu();
  },

  onManageWallpapers() {
    document.getElementById('wp-manage-panel').classList.remove('hidden');
    Renderer.renderWallpaperGrid();
  },

  onBackWallpaperMenu() {
    document.getElementById('wp-manage-panel').classList.add('hidden');
  },

  async onSelectWallpaper(filename) {
    state.currentWallpaper = filename;
    Renderer.applyWallpaper(filename);
    await this._saveWallpaperSettings();
    Renderer.renderWallpaperGrid();
  },

  async onDeleteWallpaper(filename) {
    if (window.calendarAPI) await window.calendarAPI.deleteWallpaper(filename);
    state.wallpapers = state.wallpapers.filter(f => f !== filename);
    if (state.currentWallpaper === filename) {
      state.currentWallpaper = state.wallpapers[0] || null;
      Renderer.applyWallpaper(state.currentWallpaper);
    }
    await this._saveWallpaperSettings();
    Renderer.renderWallpaperGrid();
  },

  async onToggleRandom() {
    state.randomWallpaper = document.getElementById('wp-random').checked;
    await this._saveWallpaperSettings();
  },

  async _saveWallpaperSettings() {
    if (!window.calendarAPI) return;
    await window.calendarAPI.saveWallpaperSettings({
      currentWallpaper: state.currentWallpaper,
      randomWallpaper: state.randomWallpaper,
    });
  },

  // --- Period day ---

  async onDeletePeriodDay(dateISO) {
    state.periodDays = state.periodDays.filter(d => d !== dateISO);
    state.predictedDate = this._predictPeriod();
    await DataManager.savePeriodData();
    Renderer.renderPeriodView();
    if (state.viewMode === 'calendar') this._rerenderGrid();
  },

  async onTogglePeriodDay() {
    if (state.viewMode === 'events') {
      state.periodViewActive = !state.periodViewActive;
      if (state.periodViewActive) {
        Renderer.renderPeriodView();
      } else {
        Renderer.renderEventView();
      }
      return;
    }

    const dateISO = state.selectedDate;
    const idx = state.periodDays.indexOf(dateISO);
    if (dateISO === state.predictedDate && idx === -1) {
      state.periodDays.push(dateISO);
      state.periodDays.sort();
    } else if (idx !== -1) {
      state.periodDays.splice(idx, 1);
    } else {
      state.periodDays.push(dateISO);
      state.periodDays.sort();
    }
    state.predictedDate = this._predictPeriod();
    await DataManager.savePeriodData();
    this._rerenderGrid();
  },

  _predictPeriod() {
    const days = [...state.periodDays].sort();
    if (days.length < 2) return null;

    const cycles = [];
    let start = days[0];
    for (let i = 1; i < days.length; i++) {
      const gap = Math.round((new Date(days[i]) - new Date(start)) / 86400000);
      if (gap >= 18) { cycles.push(gap); start = days[i]; }
    }
    if (cycles.length < 1) return null;

    const overallAvg = cycles.reduce((a, b) => a + b, 0) / cycles.length;
    if (cycles.length === 1) {
      const d = new Date(days[days.length - 1]); d.setDate(d.getDate() + Math.round(overallAvg));
      return d.toISOString().slice(0, 10);
    }

    const recent = cycles.slice(-3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const recentVar = recent.reduce((s, c) => s + (c - recentAvg) ** 2, 0) / recent.length;
    const overallVar = cycles.reduce((s, c) => s + (c - overallAvg) ** 2, 0) / cycles.length;
    const weight = Math.sqrt(overallVar) / (Math.sqrt(recentVar) + Math.sqrt(overallVar) + 0.01);
    const predicted = weight * recentAvg + (1 - weight) * overallAvg;

    const d = new Date(days[days.length - 1]); d.setDate(d.getDate() + Math.round(predicted));
    return d.toISOString().slice(0, 10);
  },

  onGoToday() {
    const [y, m] = state.todayDate.split('-').map(Number);
    state.viewYear = y; state.viewMonth = m; state.selectedDate = state.todayDate;
    this._rerenderGrid();
  },

  _rerenderGrid() {
    const gridData = CalendarEngine.generateGrid(state.viewYear, state.viewMonth, state.todayDate);
    Renderer.renderHeader(state.viewYear, state.viewMonth);
    Renderer.renderGrid(gridData);
    Renderer.renderDayDiff(state.selectedDate);
    Renderer.renderEventList(state.selectedDate);
  },

  _refreshAll() {
    if (state.viewMode === 'calendar') {
      this._rerenderGrid();
    } else if (state.periodViewActive) {
      Renderer.renderPeriodView();
    } else {
      Renderer.renderEventView();
    }
  },

  bindEvents() {
    document.getElementById('btn-prev').addEventListener('click', () => this.onPrevMonth());
    document.getElementById('btn-next').addEventListener('click', () => this.onNextMonth());
    document.getElementById('btn-back-today').addEventListener('click', () => this.onGoToday());
    document.getElementById('btn-period').addEventListener('click', () => this.onTogglePeriodDay());
    document.getElementById('btn-add-event').addEventListener('click', () => this.onAddEventClick());
    document.getElementById('btn-event-save').addEventListener('click', () => this.onEventSave());
    document.getElementById('btn-event-cancel').addEventListener('click', () => Renderer.closeEventModal());
    document.getElementById('event-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) Renderer.closeEventModal();
    });
    document.getElementById('month-year').addEventListener('click', () => this.onMonthYearClick());
    document.getElementById('picker-year-prev').addEventListener('click', () => this.onPickerYearPrev());
    document.getElementById('picker-year-next').addEventListener('click', () => this.onPickerYearNext());
    document.getElementById('picker-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) Renderer.closePicker();
    });

    document.getElementById('switch-calendar').addEventListener('click', () => this.onSwitchView('calendar'));
    document.getElementById('switch-events').addEventListener('click', () => this.onSwitchView('events'));
    document.getElementById('tab-before').addEventListener('click', () => this.onEventFilter('before'));
    document.getElementById('tab-after').addEventListener('click', () => this.onEventFilter('after'));

    document.getElementById('btn-wallpaper').addEventListener('click', () => this.onOpenWallpaperMenu());
    document.getElementById('wallpaper-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) Renderer.closeWallpaperMenu();
    });
    document.getElementById('wp-import').addEventListener('click', () => this.onImportWallpaper());
    document.getElementById('wp-manage').addEventListener('click', () => this.onManageWallpapers());
    document.getElementById('wp-back').addEventListener('click', () => this.onBackWallpaperMenu());
    document.getElementById('wp-random').addEventListener('change', () => this.onToggleRandom());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        Renderer.closePicker();
        Renderer.closeEventModal();
        Renderer.closeWallpaperMenu();
        return;
      }
      const pickerOpen = !document.getElementById('picker-overlay').classList.contains('hidden');
      const modalOpen = !document.getElementById('event-overlay').classList.contains('hidden');
      const wpOpen = !document.getElementById('wallpaper-overlay').classList.contains('hidden');
      if (pickerOpen || modalOpen || wpOpen || state.viewMode !== 'calendar') return;
      if (e.key === 'ArrowLeft') this.onPrevMonth();
      else if (e.key === 'ArrowRight') this.onNextMonth();
    });
  },
};

/* ================================================================
   DataManager
   ================================================================ */

const DataManager = {
  async loadEvents() {
    try {
      if (window.calendarAPI) {
        const events = await window.calendarAPI.getEvents();
        state.events = events || [];
      }
    } catch (err) { state.events = []; }
  },
  async saveEvents() {
    if (window.calendarAPI) await window.calendarAPI.saveEvents(state.events);
  },
  async resolveConflicts() {
    if (window.calendarAPI) await window.calendarAPI.resolveConflicts();
  },
  async savePeriodData() {
    if (window.calendarAPI) await window.calendarAPI.savePeriodData({
      periodDays: state.periodDays,
      predictedDate: state.predictedDate,
    });
  },
  async loadPeriodData() {
    if (window.calendarAPI) {
      const data = await window.calendarAPI.loadPeriodData();
      if (data) {
        state.periodDays = data.periodDays || [];
        state.predictedDate = data.predictedDate || null;
      }
    }
  },
  async init() {
    await this.resolveConflicts();
    await this.loadEvents();
    await this.loadPeriodData();
  },
};

/* ================================================================
   BOOT
   ================================================================ */

function initApp() {
  state.todayDate = DateUtils.getTodayISO();
  state.selectedDate = state.todayDate;
  const [y, m] = state.todayDate.split('-').map(Number);
  state.viewYear = y; state.viewMonth = m; state.pickerYear = y;

  Renderer.initHeaders();
  Renderer.initPicker();
  Renderer.initEventModal();

  const gridData = CalendarEngine.generateGrid(y, m, state.todayDate);
  Renderer.renderHeader(y, m);
  Renderer.renderGrid(gridData);
  Renderer.renderDayDiff(state.selectedDate);
  Renderer.renderEventList(state.selectedDate);

  Controller.bindEvents();

  DataManager.init().then(() => {
    state.predictedDate = Controller._predictPeriod();
    Controller._rerenderGrid();
  });

  if (window.calendarAPI) {
    window.calendarAPI.getSyncFolder().then(path => {
      document.getElementById('status-bar').textContent = `数据目录: ${path}`;
    });
    window.calendarAPI.getHolidays().then(data => {
      state.holidayData = data || { holidays: {}, workdays: {} };
      Controller._rerenderGrid();
    });
    initWallpapers();
  }
}

async function initWallpapers() {
  state.wallpaperDir = await window.calendarAPI.getWallpaperDir();
  const settings = await window.calendarAPI.loadWallpaperSettings();
  if (settings) {
    state.currentWallpaper = settings.currentWallpaper || null;
    state.randomWallpaper = settings.randomWallpaper || false;
  }
  state.wallpapers = await window.calendarAPI.getWallpapers();
  if (state.randomWallpaper && state.wallpapers.length) {
    state.currentWallpaper = state.wallpapers[Math.floor(Math.random() * state.wallpapers.length)];
    await window.calendarAPI.saveWallpaperSettings({
      currentWallpaper: state.currentWallpaper,
      randomWallpaper: true,
    });
  }
  if (state.currentWallpaper && state.wallpapers.includes(state.currentWallpaper)) {
    Renderer.applyWallpaper(state.currentWallpaper);
  }
}

document.addEventListener('DOMContentLoaded', initApp);
