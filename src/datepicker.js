import { Controller } from '@hotwired/stimulus'

export default class Datepicker extends Controller {

  static targets = ['input', 'hidden', 'toggle']

  static values  = {
    'date': String,  // ISO8601 or empty string
    'format': {type: String, default: '%Y-%m-%d'}
  }

  connect() {
    this.addHiddenInput()
    this.addInputAction()
    this.dateValue = this.inputTarget.value  // ISO8601
  }

  dateValueChanged(value, previousValue) {
    if (!this.hasHiddenTarget) return
    console.log(`callback: ${previousValue}->${value}`)

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
  // @param [String] ISO8601 date
  // @return [String] date for display to the user
  format(str) {
    const date = new Date(str)
    if (date.toString() == 'Invalid Date') return ''

    const day = date.getDate(),
      month = date.getMonth(),
      year = date.getFullYear()

    return this.formatValue
      .replace('%d',  this.twoDigit(day))
      .replace('%-d', day)
      .replace('%m',  this.twoDigit(month + 1))
      .replace('%-m', month + 1)
      .replace('%B',  date.toLocaleString('default', {month: 'long'}))
      .replace('%b',  date.toLocaleString('default', {month: 'short'}))
      .replace('%Y',  year)
      .replace('%y',  year % 100)
  }

  // Parses a date from the user, using the `format` value, into an ISO8601 date.
  //
  // @param [String] date displayed to the user, e.g. 19/03/2022
  // @return [String] ISO8601 date
  parse(str) {
    const directives = {
       'd': ['\\d{2}',   function(match) { this.day = +match }],
      '-d': ['\\d{1,2}', function(match) { this.day = +match }],
       'm': ['\\d{2}',   function(match) { this.month = +match - 1 }],
      '-m': ['\\d{1,2}', function(match) { this.month = +match - 1 }],
       'B': ['\\w+',     function(match, controller) { this.month = controller.monthIndex(match, 'long') }],
       'b': ['\\w{3}',   function(match, controller) { this.month = controller.monthIndex(match, 'short') }],
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

    // Construct a date instance to check validity of the parsed parts.
    if (new Date(parts.year, parts.month, parts.day).toString() == 'Invalid Date') return ''

    // Return an interpolated string to avoid local time zone vs UTC differences.
    return `${parts.year}-${this.twoDigit(parts.month + 1)}-${this.twoDigit(parts.day)}`
  }

  monthIndex(str, format) {
    return this.monthNames(format).findIndex(m => str.includes(m))
  }

  monthNames(format) {
    const formatter = new Intl.DateTimeFormat('default', {month: format})
    return ['01','02','03','04','05','06','07','08','09','10','11','12'].map(mm =>
      formatter.format(new Date(`2022-${mm}-01`))
    )
  }

  // Returns a two-digit zero-padded string.
  twoDigit(num) {
    return num.toString().padStart(2, '0')
  }

}

export { Datepicker }
