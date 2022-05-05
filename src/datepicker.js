import { Controller } from '@hotwired/stimulus'

// All dates are local, not UTC.
export default class Datepicker extends Controller {

  static targets = ['input', 'hidden', 'toggle', 'calendar',
    'month', 'year', 'prevMonth', 'today', 'nextMonth', 'days']

  static values = {
    date:              String,
    format:            {type: String, default: '%Y-%m-%d'},
    firstDayOfWeek:    {type: Number, default: 1},
    dayNameLength:     {type: Number, default: 2},
    jump:              {type: String, default: 'absolute'}
  }

  connect() {
    if (!this.hasHiddenTarget) this.addHiddenInput()
    this.addInputAction()
    this.addToggleAction()
    this.setToggleAriaLabel()
    this.dateValue = this.inputTarget.value
  }

  dateValueChanged(value, previousValue) {
    if (!this.hasHiddenTarget) return
    this.hiddenTarget.value = value
    this.inputTarget.value = this.format(value)
  }

  addHiddenInput() {
    this.inputTarget.insertAdjacentHTML('afterend', `
      <input type="hidden"
             name="${this.inputTarget.getAttribute('name')}"
             data-datepicker-target="hidden"/>
    `)
  }

  addInputAction() {
    this.addAction(this.inputTarget, 'datepicker#update')
  }

  addToggleAction() {
    if (!this.hasToggleTarget) return

    let action = 'click->datepicker#toggle'
    if (!(this.toggleTarget instanceof HTMLButtonElement)) action += ' keydown->datepicker#toggle'

    this.addAction(this.toggleTarget, action)
  }

  addAction(element, action) {
    if (('action') in element.dataset) {
      element.dataset.action += ` ${action}`
    } else {
      element.dataset.action = action
    }
  }

  setToggleAriaLabel(value = 'Choose Date') {
    if (!this.hasToggleTarget) return
    this.toggleTarget.setAttribute('aria-label', value);
  }

  update() {
    const isoDate = this.parse(this.inputTarget.value)
    if (isoDate != '') this.dateValue = isoDate
  }

  toggle(event) {
    event.preventDefault()
    event.stopPropagation()
    if (event.type == 'keydown' && ![' ', 'Enter'].includes(event.key)) return
    this.hasCalendarTarget ? this.close(true) : this.open(true)
  }

  close(animate) {
    if (animate) {
      this.calendarTarget.onanimationend = e => e.target.remove()
      this.calendarTarget.classList.add('fade-out')
    } else {
      this.calendarTarget.remove()
    }

    this.toggleTarget.focus()
  }

  // @param dateStr [String] (YYYY-MM-DD) the date to focus on.
  //   If not given, the date from the input is used.
  //   If that's empty, today is used.
  open(animate, dateStr) {
    const d = dateStr || (this.dateValue != '' ? this.dateValue : this.todayStr())
    this.render(d)
    this.focusDate(d)
  }

  closeOnOutsideClick(event) {
    // `event.target` could already have been removed from the DOM
    // (e.g. if the previous-month button was clicked) so we cannot
    // use `this.calendarTarget.contains(event.target)`.
    if (event.target.closest('[data-datepicker-target="calendar"]')) return
    this.close(true)
  }

  redraw() {
    const dateStr = this.dateFromMonthYearSelectsAndDayGrid()
    this.close(false)
    this.open(false, dateStr)
  }

  prevMonth() {
    const dateStr = this.dateFromMonthYearSelectsAndDayGrid()
    this.close(false)
    this.open(false, this.correspondingDateInAdjacentMonth(dateStr, 'previous'))
    this.prevMonthTarget.focus()
  }

  nextMonth() {
    const dateStr = this.dateFromMonthYearSelectsAndDayGrid()
    this.close(false)
    this.open(false, this.correspondingDateInAdjacentMonth(dateStr, 'next'))
    this.nextMonthTarget.focus()
  }

  today() {
    this.close(false)
    this.open(false, this.toLocalISOString(new Date()))
    this.todayTarget.focus()
  }

  // Returns a date where the month and year come from the dropdowns
  // and the day of the month from the grid.
  // @return [String]
  dateFromMonthYearSelectsAndDayGrid() {
    const year  = this.yearTarget.value
    const month = this.monthTarget.value
    const day   = this.daysTarget.querySelector('button[tabindex="0"] time').textContent
    return this.toLocalISO(year, month, day)
  }

  // Generates the HTML for the calendar and inserts it into the DOM.
  //
  // Does not focus the given date.
  //
  // @param date [String] the date of interest
  render(dateStr) {
    const [yyyy, mm, dd] = dateStr.split('-')
    const cal = `
      <div class="sdp-cal" data-datepicker-target="calendar" data-action="click@window->datepicker#closeOnOutsideClick keydown->datepicker#key" role="dialog" aria-modal="true" aria-label="Choose Date">
        <div class="sdp-nav">
          <div class="sdp-nav-dropdowns">
            <div>
              <select class="sdp-month" data-datepicker-target="month" data-action="datepicker#redraw">
                ${this.monthOptions(+mm)}
              </select>
            </div>
            <div>
              <select class="sdp-year" data-datepicker-target="year" data-action="datepicker#redraw">
                ${this.yearOptions(+yyyy)}
              </select>
            </div>
          </div>
          <div class="sdp-nav-buttons">
            <button class="sdp-goto-prev"  data-datepicker-target="prevMonth" data-action="datepicker#prevMonth" title="Previous month" aria-label="Previous month"></button>
            <button class="sdp-goto-today" data-datepicker-target="today"     data-action="datepicker#today"     title="Today"          aria-label="Today"></button>
            <button class="sdp-goto-next"  data-datepicker-target="nextMonth" data-action="datepicker#nextMonth" title="Next month"     aria-label="Next month"></button>
          </div>
        </div>
        <div class="sdp-days-of-week">
          ${this.daysOfWeek()}
        </div>
        <div class="sdp-days" data-datepicker-target="days" data-action="click->datepicker#pick" role="grid">
          ${this.days(dateStr)}
        </div>
      </div>
    `
    this.element.insertAdjacentHTML('beforeend', cal)
  }

  pick(event) {
    event.preventDefault()
    const dateStr = event.target.hasAttribute('datetime')
      ? event.target.getAttribute('datetime')
      : event.target.querySelector('time').getAttribute('datetime')
    this.selectDate(dateStr)
  }

  key(event) {
    switch (event.key) {
      case 'Escape':
        this.close(true)
        return
      case 'Tab':
        if (event.shiftKey) {
          if (document.activeElement == this.firstTabStop()) {
            event.preventDefault()
            this.lastTabStop().focus()
          }
        } else {
          if (document.activeElement == this.lastTabStop()) {
            event.preventDefault()
            this.firstTabStop().focus()
          }
        }
        return
    }

    if (!this.daysTarget.contains(event.target)) return

    const dateStr = event.target.querySelector('time').getAttribute('datetime')

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        this.selectDate(dateStr)
        break
      case 'ArrowUp':
      case 'k':
        this.focusSameDayPreviousWeek(dateStr)
        break
      case 'ArrowDown':
      case 'j':
        this.focusSameDayNextWeek(dateStr)
        break
      case 'ArrowLeft':
      case 'h':
        this.focusPreviousDay(dateStr)
        break
      case 'ArrowRight':
      case 'l':
        this.focusNextDay(dateStr)
        break
      case 'Home':
      case '0':
      case '^':
        this.focusFirstDayOfWeek(dateStr)
        break
      case 'End':
      case '$':
        this.focusLastDayOfWeek(dateStr)
        break
      case 'PageUp':
        event.shiftKey ? this.focusPreviousYear(dateStr) : this.focusPreviousMonth(dateStr)
        break
      case 'PageDown':
        event.shiftKey ? this.focusNextYear(dateStr) : this.focusNextMonth(dateStr)
        break
      case 'b':
        this.focusPreviousMonth(dateStr)
        break
      case 'B':
        this.focusPreviousYear(dateStr)
        break
      case 'w':
        this.focusNextMonth(dateStr)
        break
      case 'W':
        this.focusNextYear(dateStr)
        break
    }
  }

  firstTabStop() {
    return this.monthTarget
  }

  lastTabStop() {
    return this.calendarTarget.querySelector('.sdp-days button[tabindex="0"]')
  }

  // @param date [String] (YYYY-MM-DD) the date to select
  selectDate(dateStr) {
    this.close(true)
    this.toggleTarget.focus()
    this.dateValue = dateStr
  }

  // Focuses the given date in the calendar.
  // If the date is not visible because it is in the hidden part of the previous or
  // next month, the calendar is updated to show the corresponding month.
  //
  // @param date [String] (YYYY-MM-DD) the date to focus on in the calendar
  focusDate(dateStr) {
    const time = this.daysTarget.querySelector(`time[datetime="${dateStr}"]`)

    if (!time) {
      if (dateStr < this.daysTarget.querySelector('time').getAttribute('datetime')) {
        this.prevMonth()
      } else {
        this.nextMonth()
      }
      this.focusDate(dateStr)
      return
    }

    const currentFocus = this.daysTarget.querySelector('button[tabindex="0"]')
    if (currentFocus) currentFocus.setAttribute('tabindex', -1)

    const button = time.closest('button')
    button.setAttribute('tabindex', 0)
    button.focus()

    this.setToggleAriaLabel(`Change Date, ${this.format(dateStr)}`)
  }

  adjustAndFocus(dateStr, offset) {
    const date = this.fromLocalISOString(dateStr)
    date.setDate(date.getDate() + offset)
    this.focusDate(this.toLocalISOString(date))
  }

  focusSameDayPreviousWeek(dateStr) {
    this.adjustAndFocus(dateStr, -7)
  }

  focusSameDayNextWeek(dateStr) {
    this.adjustAndFocus(dateStr, 7)
  }

  focusPreviousDay(dateStr) {
    this.adjustAndFocus(dateStr, -1)
  }

  focusNextDay(dateStr) {
    this.adjustAndFocus(dateStr, 1)
  }

  focusFirstDayOfWeek(dateStr) {
    const date = this.fromLocalISOString(dateStr)
    date.setDate(date.getDate() - (7 + date.getDay() - this.firstDayOfWeekValue) % 7)
    this.focusDate(this.toLocalISOString(date))
  }

  focusLastDayOfWeek(dateStr) {
    const date = this.fromLocalISOString(dateStr)
    date.setDate(date.getDate() + this.firstDayOfWeekValue + 6 - date.getDay())
    this.focusDate(this.toLocalISOString(date))
  }

  focusPreviousMonth(dateStr) {
    this.focusDate(this.correspondingDateInAdjacentMonth(dateStr, 'previous'))
  }

  focusNextMonth(dateStr) {
    this.focusDate(this.correspondingDateInAdjacentMonth(dateStr, 'next'))
  }

  focusPreviousYear(dateStr) {
    // absolute
    const [yyyy, mm, dd] = dateStr.split('-')
    const date = new Date(+yyyy - 1, +mm - 1)
    const endOfMonth = this.daysInMonth(date.getMonth() + 1, date.getYear())
    date.setDate(+dd > endOfMonth ? endOfMonth : +dd)
    this.focusDate(this.toLocalISOString(date))
  }

  focusNextYear(dateStr) {
    // absolute
    const [yyyy, mm, dd] = dateStr.split('-')
    const date = new Date(+yyyy + 1, +mm - 1)
    const endOfMonth = this.daysInMonth(date.getMonth() + 1, date.getYear())
    date.setDate(+dd > endOfMonth ? endOfMonth : +dd)
    this.focusDate(this.toLocalISOString(date))
  }

  correspondingDateInAdjacentMonth(dateStr, direction) {
    if (direction == 'previous') {
      return this.jumpValue == 'absolute'
        ? this.previousMonthAbsolute(dateStr)
        : this.previousMonthRelative(dateStr)
    } else {
      return this.jumpValue == 'absolute'
        ? this.nextMonthAbsolute(dateStr)
        : this.nextMonthRelative(dateStr)
    }
  }

  // Returns the same day of the month in the previous month, e.g. 30th,
  // if it exists, or the last day of the previous month otherwise.
  //
  // @param dateStr [String] the starting date
  // @return [String] the corresponding date in the previous month
  previousMonthAbsolute(dateStr) {
    const [yyyy, mm, dd] = dateStr.split('-')
    const date = new Date(+yyyy, +mm - 2)
    const endOfMonth = this.daysInMonth(date.getMonth() + 1, date.getYear())
    date.setDate(+dd > endOfMonth ? endOfMonth : +dd)
    return this.toLocalISOString(date)
  }

  // Returns the same day of the month in the next month, e.g. 30th,
  // if it exists, or the last day of the next month otherwise.
  //
  // @param dateStr [String] the starting date
  // @return [String] the corresponding date in the next month
  nextMonthAbsolute(dateStr) {
    const [yyyy, mm, dd] = dateStr.split('-')
    const date = new Date(+yyyy, +mm)
    const endOfMonth = this.daysInMonth(date.getMonth() + 1, date.getYear())
    date.setDate(+dd > endOfMonth ? endOfMonth : +dd)
    return this.toLocalISOString(date)
  }

  // Returns the same day of the week 4 weeks earlier in the previous month,
  // if it exists, or a week prior otherwise.
  //
  // @param dateStr [String] the starting date
  // @return [String] the corresponding date in the previous month
  previousMonthRelative(dateStr) {
    const date = this.fromLocalISOString(dateStr)
    const month = date.getMonth()
    date.setDate(date.getDate() - 28)
    if (date.getMonth() == month) date.setDate(date.getDate() - 7)
    return this.toLocalISOString(date)
  }

  // Returns the same day of the week 4 weeks later in the next month,
  // if it exists, or a week later otherwise.
  //
  // @param dateStr [String] the starting date
  // @return [String] the corresponding date in the next month
  nextMonthRelative(dateStr) {
    const date = this.fromLocalISOString(dateStr)
    const month = date.getMonth()
    date.setDate(date.getDate() + 28)
    if (date.getMonth() == month) date.setDate(date.getDate() + 7)
    return this.toLocalISOString(date)
  }

  // @param selected [Number] the selected month (January is 1)
  monthOptions(selected) {
    return this.monthNames('long')
      .map((name, i) => `<option value="${i + 1}" ${i + 1 == selected ? 'selected' : ''}>${name}</option>`)
      .join('')
  }

  // @param selected [Number] the selected year
  yearOptions(selected) {
    const years = []
    for (let y = selected - 10; y <= selected + 10; y++) years.push(y)
    return years
      .map(year => `<option ${year == selected ? 'selected' : ''}>${year}</option>`)
      .join('')
  }

  daysOfWeek() {
    return this.dayNames('long')
      .map(name => `<div title="${name}">${name.slice(0, this.dayNameLengthValue)}</div>`)
      .join('')
  }

  // Generates the day grid for the given date's month.
  // The end of the previous month and the start of the next month
  // are shown if there is space in the grid.
  //
  // Does not focus on the given date.
  //
  // @param date [String] (YYYY-MM-DD) the month of interest
  // @return [String] HTML for the day grid
  days(dateStr) {
    const days = []
    const date = this.fromLocalISOString(dateStr)

    // Render previous month
    date.setDate(1)
    const dayOfWeekOffset = (date.getDay() - this.firstDayOfWeekValue + 7) % 7  // always positive
    if (dayOfWeekOffset > 0) {
      date.setDate(1 - dayOfWeekOffset)
      for (let month = date.getMonth(); date.getMonth() == month; date.setDate(date.getDate() + 1)) {
        const klass = this.classAttribute('sdp-prev-month', (this.isToday(date) ? 'sdp-today' : ''))
        days.push(`
          <button ${klass} tabindex="-1">
            <time datetime="${this.toLocalISOString(date)}">${date.getDate()}</time>
          </button>
        `)
      }
    }

    // Current month
    for (let month = date.getMonth(); date.getMonth() == month; date.setDate(date.getDate() + 1)) {
      const ds = this.toLocalISOString(date)
      const klass = this.classAttribute(
        this.isToday(date)   ? 'sdp-today'    : '',
        ds == this.dateValue ? 'sdp-selected' : ''
      )
      days.push(`
        <button ${klass} tabindex="-1" ${ds == this.dateValue ? 'aria-selected="true"' : ''}>
          <time datetime="${ds}">${date.getDate()}</time>
        </button>
      `)
    }

    // Next month
    for (let unfilled = (7 - (days.length % 7)) % 7; date.getDate() <= unfilled; date.setDate(date.getDate() + 1)) {
      const klass = this.classAttribute('sdp-next-month', (this.isToday(date) ? 'sdp-today' : ''))
      days.push(`
        <button ${klass} tabindex="-1">
          <time datetime="${this.toLocalISOString(date)}">${date.getDate()}</time>
        </button>
      `)
    }

    return days.join('')
  }

  classAttribute(...classes) {
    const presentClasses = classes.filter(c => c.length > 1)
    if (presentClasses.length == 0) return ''
    return `class="${presentClasses.join(' ')}"`
  }

  // @param date [Date]
  isToday(date) {
    return this.toLocalISOString(date) == this.todayStr()
  }

  todayStr() {
    return this.toLocalISOString(new Date())
  }

  // @param year [String]
  // @param month [String] month number (January is 1)
  // @param day [String] day of month
  // @return [String]
  toLocalISO(year, month, day) {
    return `${year}-${this.twoDigit(month)}-${this.twoDigit(day)}`
  }

  // @param date [Date] a date instance
  // @return [String] (YYYY-MM-DD) a local date
  toLocalISOString(date) {
    return this.toLocalISO(date.getFullYear(), date.getMonth() + 1, date.getDate())
  }

  // @param dateStr [String] (YYYY-MM-DD) a local date
  // @return [Date] a date instance
  fromLocalISOString(dateStr) {
    // Cannot use `new Date('YYYY-MM-DD')`: it is treated as UTC, not local.
    const [yyyy, mm, dd] = dateStr.split('-')
    return new Date(+yyyy, +mm - 1, +dd)
  }

  // Formats an ISO8601 date, using the `format` value, for display to the user.
  // Returns an empty string if `str` cannot be formatted.
  //
  // @param str [String] a date in YYYY-MM-DD format
  // @return [String] the date in a user-facing format, or an empty string if the
  //   given date cannot be formatted
  format(str) {
    if (!this.isValidISO8601Date(str)) return ''

    const [yyyy, mm, dd] = str.split('-')

    return this.formatValue
      .replace('%d',  dd)
      .replace('%-d', +dd)
      .replace('%m',  this.twoDigit(mm))
      .replace('%-m', +mm)
      .replace('%B',  this.localisedMonth(mm, 'long'))
      .replace('%b',  this.localisedMonth(mm, 'short'))
      .replace('%Y',  yyyy)
      .replace('%y',  +yyyy % 100)
  }

  // Parses a date from the user, using the `format` value, into an ISO8601 date.
  // Returns an empty string if `str` cannot be parsed.
  //
  // @param str [String] a user-facing date, e.g. 19/03/2022
  // @return [String] the date in ISO8601 format, e.g. 2022-03-19; or an empty string
  //   if the given date cannot be parsed
  parse(str) {
    const directives = {
       'd': ['\\d{2}',   function(match) { this.day = +match }],
      '-d': ['\\d{1,2}', function(match) { this.day = +match }],
       'm': ['\\d{2}',   function(match) { this.month = +match }],
      '-m': ['\\d{1,2}', function(match) { this.month = +match }],
       'B': ['\\w+',     function(match, controller) { this.month = controller.monthNumber(match, 'long') }],
       'b': ['\\w{3}',   function(match, controller) { this.month = controller.monthNumber(match, 'short') }],
       'Y': ['\\d{4}',   function(match) { this.year = +match }],
       'y': ['\\d{2}',   function(match) { this.year = 2000 + +match }]
    }
    const funcs = []
    const re = new RegExp(
      this.formatValue.replace(/%(d|-d|m|-m|B|b|Y|y)/g, function(_, p) {
        const directive = directives[p]
        funcs.push(directive[1])
        return `(${directive[0]})`
      }))
    const matches = str.match(re)
    if (!matches) return ''

    const parts = {}
    for (let i = 0, len = funcs.length; i < len; i++) {
      funcs[i].call(parts, matches[i + 1], this)
    }

    if (!this.isValidDate(parts.year, parts.month, parts.day)) return ''
    return `${parts.year}-${this.twoDigit(parts.month)}-${this.twoDigit(parts.day)}`
  }

  // Returns the name of the month in the current locale.
  //
  // @param month [Number] the month number (January is 1)
  // @param monthFormat [String] "long" (January) | "short" (Jan)
  // @return [String] the localised month name
  localisedMonth(month, monthFormat) {
    // Use the middle of the month to avoid timezone edge cases
    return new Date(`2022-${month}-15`).toLocaleString('default', {month: monthFormat})
  }

  // Returns the number of the month (January is 1).
  //
  // @param name [String] the name of the month in the current locale (e.g. January or Jan)
  // @param monthFormat [String] "long" (January) | "short" (Jan)
  // @return [Number] the number of the month, or 0 if name is not recognised
  monthNumber(name, monthFormat) {
    return this.monthNames(monthFormat).findIndex(m => name.includes(m)) + 1
  }

  // Returns the month names in the the current locale.
  //
  // @param format [String] "long" (January) | "short" (Jan)
  // @return [Array] localised month names
  monthNames(format) {
    const formatter = new Intl.DateTimeFormat('default', {month: format})
    return ['01','02','03','04','05','06','07','08','09','10','11','12'].map(mm =>
      // Use the middle of the month to avoid timezone edge cases
      formatter.format(new Date(`2022-${mm}-15`))
    )
  }

  // Returns the day names in the current locale, starting with the
  // firstDayOfTheWeekValue.
  //
  // @param format [String] "long" (Monday) | "short" (Mon) | "narrow" (M)
  // @return [Array] localised day names
  dayNames(format) {
    const formatter = new Intl.DateTimeFormat('default', {weekday: format})
    const names = []
    // Ensure date in month is two digits. 2022-04-10 is a Sunday
    for (let i = this.firstDayOfWeekValue + 10, n = i + 7; i < n; i++) {
      names.push(formatter.format(new Date(`2022-04-${i}T00:00:00+00:00`)))
    }
    return names
  }

  isValidISO8601Date(str) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false
    return this.isValidDate(...str.split('-').map(s => +s))
  }

  // @param year [Number] four-digit year
  // @param month [Number] month number (January is 1)
  // @param day [Number] day in month
  isValidDate(year, month, day) {
    if (year  < 2000 || year  > 2999) return false
    if (month <    1 || month >   12) return false
    if (day   <    1 || day   > this.daysInMonth(month, year)) return false
    return true
  }

  // Returns the number of days in the month.
  //
  // @param month [Number] the month (1 is January)
  // @param year [Number] the year (e.g. 2022)
  // @return [Number] the number of days
  daysInMonth(month, year) {
    if ([1, 3, 5, 7, 8, 10, 12].includes(month)) return 31
    if ([4, 6, 9, 11].includes(month)) return 30
    return this.isLeapYear(year) ? 29 : 28
  }

  isLeapYear(year) {
    if ((year % 400) == 0) return true
    if ((year % 100) == 0) return false
    return year % 4 == 0
  }

  // Returns a two-digit zero-padded string.
  twoDigit(num) {
    return num.toString().padStart(2, '0')
  }

}

export { Datepicker }
