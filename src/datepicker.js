import { Controller } from '@hotwired/stimulus'

export default class Datepicker extends Controller {

  static targets = ['input', 'hidden', 'toggle']

  static values  = {
    'date': String,  // ISO8601 or empty string
    'format': {type: String, default: '%Y-%m-%d'}
  }

  connect() {
    if (!this.hasHiddenTarget) this.addHiddenInput()
    this.addInputAction()
    this.dateValue = this.inputTarget.value
  }

  dateValueChanged(value, previousValue) {
    if (!this.hasHiddenTarget) return

    this.hiddenTarget.value = value
    this.inputTarget.value = this.format(value)
  }

  update() {
    const isoDate = this.parse(this.inputTarget.value)
    if (isoDate != '') this.dateValue = isoDate
  }

  addHiddenInput() {
    this.inputTarget.insertAdjacentHTML('afterend', `
      <input type="hidden"
             name="${this.inputTarget.getAttribute('name')}"
             data-datepicker-target="hidden"/>
    `)
  }

  addInputAction() {
    if ('action' in this.inputTarget.dataset) {
      this.inputTarget.dataset.action = `${this.inputTarget.dataset.action} datepicker#update`
    }
    else {
      this.inputTarget.dataset.action = 'datepicker#update'
    }
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

  // Returns a two-digit zero-padded string.
  twoDigit(num) {
    return num.toString().padStart(2, '0')
  }

  isValidISO8601Date(str) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false
    return this.isValidDate(...str.split('-'))
  }

  isValidDate(year, month, day) {
    if (year  < 2000 || year  > 2999) return false
    if (month <    1 || month >   12) return false
    if (day   <    1 || day   >   31) return false
    if ([4, 6, 9, 11].includes(month) && day > 30) return false
    if (month == 2 && day > (this.isLeapYear(year) ? 29 : 28)) return false
    return true
  }

  isLeapYear(year) {
    if ((year % 400) == 0) return true
    if ((year % 100) == 0) return false
    return year % 4 == 0
  }

}

export { Datepicker }
