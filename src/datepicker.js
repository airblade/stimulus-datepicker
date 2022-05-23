import { Controller } from '@hotwired/stimulus'
import IsoDate from './iso_date.js'

// All dates are local, not UTC.
export default class Datepicker extends Controller {

  static targets = ['input', 'hidden', 'toggle', 'calendar',
    'month', 'year', 'prevMonth', 'today', 'nextMonth', 'days']

  static values = {
    date:              String,
    min:               String,
    max:               String,
    format:            {type: String, default: '%Y-%m-%d'},
    firstDayOfWeek:    {type: Number, default: 1},
    dayNameLength:     {type: Number, default: 2},
    allowWeekends:     {type: Boolean, default: true},
    jump:              {type: String, default: 'absolute'},
    underflowMessage:  String,
    overflowMessage:   String,
    disallow:          Array
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
    this.validate(value)
  }

  validate(dateStr) {
    const message = this.validationMessage(dateStr)
    this.inputTarget.setCustomValidity(message)
    if (message) this.inputTarget.reportValidity()
  }

  validationMessage(dateStr) {
    if (!dateStr) return ''
    const isoDate = new IsoDate(dateStr)
    return this.rangeUnderflow(isoDate) ? this.underflowMessage()
         : this.rangeOverflow(isoDate)  ? this.overflowMessage()
         : ''
  }

  underflowMessage() {
    return this.underflowMessageValue.replace('%s', this.format(this.minValue))
  }

  overflowMessage() {
    return this.overflowMessageValue.replace('%s', this.format(this.maxValue))
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
    const dateStr = this.parse(this.inputTarget.value)
    if (dateStr != '') this.dateValue = dateStr
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

  open(animate, isoDate = this.initialIsoDate()) {
    this.render(isoDate)
    this.focusDate(isoDate)
  }

  // Returns the date to focus on initially.  This is `dateValue` if given
  // or today.  Whichever is used, it is clamped to `minValue` and/or `maxValue`
  // dates if given.
  initialIsoDate() {
    return this.clamp(new IsoDate(this.dateValue))
  }

  clamp(isoDate) {
    return this.rangeUnderflow(isoDate) ? new IsoDate(this.minValue)
         : this.rangeOverflow(isoDate)  ? new IsoDate(this.maxValue)
         : isoDate
  }

  rangeUnderflow(isoDate) {
    return this.hasMinValue && isoDate.before(new IsoDate(this.minValue))
  }

  rangeOverflow(isoDate) {
    return this.hasMaxValue && isoDate.after(new IsoDate(this.maxValue))
  }

  isOutOfRange(isoDate) {
    return this.rangeUnderflow(isoDate) || this.rangeOverflow(isoDate)
  }

  closeOnOutsideClick(event) {
    // `event.target` could already have been removed from the DOM
    // (e.g. if the previous-month button was clicked) so we cannot
    // use `this.calendarTarget.contains(event.target)`.
    if (event.target.closest('[data-datepicker-target="calendar"]')) return
    this.close(true)
  }

  redraw() {
    const isoDate = this.dateFromMonthYearSelectsAndDayGrid()
    this.close(false)
    this.open(false, isoDate)
  }

  prevMonth() {
    const isoDate = this.dateFromMonthYearSelectsAndDayGrid()
    this.close(false)
    this.open(false, this.correspondingDateInAdjacentMonth(isoDate, 'previous'))
    this.prevMonthTarget.focus()
  }

  nextMonth() {
    const isoDate = this.dateFromMonthYearSelectsAndDayGrid()
    this.close(false)
    this.open(false, this.correspondingDateInAdjacentMonth(isoDate, 'next'))
    this.nextMonthTarget.focus()
  }

  today() {
    this.close(false)
    this.open(false, new IsoDate())
    this.todayTarget.focus()
  }

  // Returns a date where the month and year come from the dropdowns
  // and the day of the month from the grid.
  // @return [IsoDate]
  dateFromMonthYearSelectsAndDayGrid() {
    const year  = this.yearTarget.value
    const month = this.monthTarget.value
    const day   = this.daysTarget.querySelector('button[tabindex="0"] time').textContent
    return new IsoDate(year, month, day)
  }

  // Generates the HTML for the calendar and inserts it into the DOM.
  //
  // Does not focus the given date.
  //
  // @param isoDate [IsoDate] the date of interest
  render(isoDate) {
    const cal = `
      <div class="sdp-cal" data-datepicker-target="calendar" data-action="click@window->datepicker#closeOnOutsideClick keydown->datepicker#key" role="dialog" aria-modal="true" aria-label="Choose Date">
        <div class="sdp-nav">
          <div class="sdp-nav-dropdowns">
            <div>
              <select class="sdp-month" data-datepicker-target="month" data-action="datepicker#redraw">
                ${this.monthOptions(+isoDate.mm)}
              </select>
            </div>
            <div>
              <select class="sdp-year" data-datepicker-target="year" data-action="datepicker#redraw">
                ${this.yearOptions(+isoDate.yyyy)}
              </select>
            </div>
          </div>
          <div class="sdp-nav-buttons">
            <button class="sdp-goto-prev" data-datepicker-target="prevMonth" data-action="datepicker#prevMonth" title="Previous month" aria-label="Previous month">
              <svg viewBox="0 0 10 10">
                <polyline points="7,1 3,5 7,9" />
              </svg>
            </button>
            <button class="sdp-goto-today" data-datepicker-target="today" data-action="datepicker#today" title="Today" aria-label="Today">
              <svg viewBox="0 0 10 10">
                <circle cx="5" cy="5" r="4" />
              </svg>
            </button>
            <button class="sdp-goto-next" data-datepicker-target="nextMonth" data-action="datepicker#nextMonth" title="Next month" aria-label="Next month">
              <svg viewBox="0 0 10 10">
                <polyline points="3,1 7,5 3,9" />
              </svg>
            </button>
          </div>
        </div>
        <div class="sdp-days-of-week">
          ${this.daysOfWeek()}
        </div>
        <div class="sdp-days" data-datepicker-target="days" data-action="click->datepicker#pick" role="grid">
          ${this.days(isoDate)}
        </div>
      </div>
    `
    this.element.insertAdjacentHTML('beforeend', cal)
  }

  monthTargetConnected() {
    this.autoSizeSelect(this.monthTarget)
  }

  yearTargetConnected() {
    this.autoSizeSelect(this.yearTarget)
  }

  // Set select's width to the width of the selected option.
  autoSizeSelect(select) {
    const tempSelect = document.createElement('select')
    const tempOption = document.createElement('option')
    tempOption.textContent = select.options[select.selectedIndex].text
    tempSelect.style.cssText += 'visibility: hidden; position: fixed;'
    tempSelect.appendChild(tempOption)
    select.after(tempSelect)
    const tempSelectWidth = tempSelect.getBoundingClientRect().width
    select.style.width = `${tempSelectWidth}px`
    tempSelect.remove()
  }

  pick(event) {
    event.preventDefault()
    const time = event.target
    if (time.parentElement.hasAttribute('aria-disabled')) return
    const dateStr = time.getAttribute('datetime')
    this.selectDate(new IsoDate(dateStr))
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

    const button = event.target
    if (!this.daysTarget.contains(button)) return

    const dateStr = button.querySelector('time').getAttribute('datetime')
    const isoDate = new IsoDate(dateStr)

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!button.hasAttribute('aria-disabled')) this.selectDate(isoDate)
        break
      case 'ArrowUp':
      case 'k':
        this.focusSameDayPreviousWeek(isoDate)
        break
      case 'ArrowDown':
      case 'j':
        this.focusSameDayNextWeek(isoDate)
        break
      case 'ArrowLeft':
      case 'h':
        this.focusPreviousDay(isoDate)
        break
      case 'ArrowRight':
      case 'l':
        this.focusNextDay(isoDate)
        break
      case 'Home':
      case '0':
      case '^':
        this.focusFirstDayOfWeek(isoDate)
        break
      case 'End':
      case '$':
        this.focusLastDayOfWeek(isoDate)
        break
      case 'PageUp':
        event.shiftKey ? this.focusPreviousYear(isoDate) : this.focusPreviousMonth(isoDate)
        break
      case 'PageDown':
        event.shiftKey ? this.focusNextYear(isoDate) : this.focusNextMonth(isoDate)
        break
      case 'b':
        this.focusPreviousMonth(isoDate)
        break
      case 'B':
        this.focusPreviousYear(isoDate)
        break
      case 'w':
        this.focusNextMonth(isoDate)
        break
      case 'W':
        this.focusNextYear(isoDate)
        break
    }
  }

  firstTabStop() {
    return this.monthTarget
  }

  lastTabStop() {
    return this.calendarTarget.querySelector('.sdp-days button[tabindex="0"]')
  }

  // @param isoDate [isoDate] the date to select
  selectDate(isoDate) {
    this.close(true)
    this.toggleTarget.focus()
    this.dateValue = isoDate.toString()
    // Trigger change event on input when user selects date from picker.
    // http://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
    this.inputTarget.dispatchEvent(new Event('change'))
  }

  // Focuses the given date in the calendar.
  // If the date is not visible because it is in the hidden part of the previous or
  // next month, the calendar is updated to show the corresponding month.
  //
  // @param isoDate [IsoDate] the date to focus on in the calendar
  focusDate(isoDate) {
    const time = this.daysTarget.querySelector(`time[datetime="${isoDate.toString()}"]`)

    if (!time) {
      const leadingDatetime = this.daysTarget.querySelector('time').getAttribute('datetime')
      if (isoDate.before(new IsoDate(leadingDatetime))) {
        this.prevMonth()
      } else {
        this.nextMonth()
      }
      this.focusDate(isoDate)
      return
    }

    const currentFocus = this.daysTarget.querySelector('button[tabindex="0"]')
    if (currentFocus) currentFocus.setAttribute('tabindex', -1)

    const button = time.parentElement
    button.setAttribute('tabindex', 0)
    button.focus()

    if (!button.hasAttribute('aria-disabled')) {
      this.setToggleAriaLabel(`Change Date, ${this.format(isoDate.toString())}`)
    }
  }

  focusSameDayPreviousWeek(isoDate) {
    this.focusDate(isoDate.increment('dd', -7))
  }

  focusSameDayNextWeek(isoDate) {
    this.focusDate(isoDate.increment('dd', 7))
  }

  focusPreviousDay(isoDate) {
    this.focusDate(isoDate.increment('dd', -1))
  }

  focusNextDay(isoDate) {
    this.focusDate(isoDate.increment('dd', 1))
  }

  focusFirstDayOfWeek(isoDate) {
    this.focusDate(isoDate.firstDayOfWeek(this.firstDayOfWeekValue))
  }

  focusLastDayOfWeek(isoDate) {
    this.focusDate(isoDate.lastDayOfWeek(this.firstDayOfWeekValue))
  }

  focusPreviousMonth(isoDate) {
    this.focusDate(this.correspondingDateInAdjacentMonth(isoDate, 'previous'))
  }

  focusNextMonth(isoDate) {
    this.focusDate(this.correspondingDateInAdjacentMonth(isoDate, 'next'))
  }

  focusPreviousYear(isoDate) {
    this.focusDate(isoDate.previousYear())
  }

  focusNextYear(isoDate) {
    this.focusDate(isoDate.nextYear())
  }

  correspondingDateInAdjacentMonth(isoDate, direction) {
    if (direction == 'previous') {
      return this.jumpValue == 'absolute'
        ? isoDate.previousMonthSameDayOfMonth()
        : isoDate.previousMonthSameDayOfWeek()
    } else {
      return this.jumpValue == 'absolute'
        ? isoDate.nextMonthSameDayOfMonth()
        : isoDate.nextMonthSameDayOfWeek()
    }
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
    const extent = 10
    for (let y = selected - extent; y <= selected + extent; y++) years.push(y)
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
  // @param isoDate [IsoDate] the month of interest
  // @return [String] HTML for the day grid
  days(isoDate) {
    const days = []
    const selected = new IsoDate(this.dateValue)
    let date = isoDate.setDayOfMonth(1).firstDayOfWeek(this.firstDayOfWeekValue)

    while (true) {
      const isPreviousMonth = date.mm != isoDate.mm && date.before(isoDate)
      const isNextMonth     = date.mm != isoDate.mm && date.after(isoDate)

      if (isNextMonth && date.isFirstDayOfWeek(this.firstDayOfWeekValue)) break

      const klass = this.classAttribute(
        isPreviousMonth       ? 'sdp-prev-month' : '',
        isNextMonth           ? 'sdp-next-month' : '',
        date.isToday()        ? 'sdp-today'      : '',
        date.isWeekend()      ? 'sdp-weekend'    : '',
        date.equals(selected) ? 'sdp-selected'   : ''
      )
      days.push(`
        <button type="button"
                tabindex="-1"
                ${klass}
                ${date.equals(selected) ? 'aria-selected="true"' : ''}
                ${this.isDisabled(date) ? 'aria-disabled="true"' : ''}
        >
          <time datetime="${date.toString()}">${+date.dd}</time>
        </button>
      `)

      date = date.increment('dd', 1)
    }

    return days.join('')
  }

  classAttribute(...classes) {
    const presentClasses = classes.filter(c => c.length > 1)
    if (presentClasses.length == 0) return ''
    return `class="${presentClasses.join(' ')}"`
  }

  isDisabled(isoDate) {
    return this.isOutOfRange(isoDate)
        || (isoDate.isWeekend() && !this.allowWeekendsValue)
        || (this.disallowValue.includes(isoDate.toString()))
  }

  // Formats an ISO8601 date, using the `format` value, for display to the user.
  // Returns an empty string if `str` cannot be formatted.
  //
  // @param str [String] a date in YYYY-MM-DD format
  // @return [String] the date in a user-facing format, or an empty string if the
  //   given date cannot be formatted
  format(str) {
    if (!IsoDate.isValidStr(str)) return ''

    const [yyyy, mm, dd] = str.split('-')

    return this.formatValue
      .replace('%d',  dd)
      .replace('%-d', +dd)
      .replace('%m',  this.zeroPad(mm))
      .replace('%-m', +mm)
      .replace('%B',  this.localisedMonth(mm, 'long'))
      .replace('%b',  this.localisedMonth(mm, 'short'))
      .replace('%Y',  yyyy)
      .replace('%y',  +yyyy % 100)
  }

  // Returns a two-digit zero-padded string.
  zeroPad(num) {
    return num.toString().padStart(2, '0')
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

    if (!IsoDate.isValidDate(parts.year, parts.month, parts.day)) return ''
    return new IsoDate(parts.year, parts.month, parts.day).toString()
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

}

export { Datepicker }
