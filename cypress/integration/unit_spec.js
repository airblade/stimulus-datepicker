import { Datepicker } from '../../src/datepicker.js'

describe('Stimulus datepicker', () => {

  const controller = new Datepicker()

  it('isLeapYear', () => {
    assert.isFalse(controller.isLeapYear(2022))
    assert.isTrue(controller.isLeapYear(2024))
    assert.isTrue(controller.isLeapYear(2000))
    assert.isFalse(controller.isLeapYear(2100))
  })

  it('isValidDate', () => {
    // year
    assert.isTrue(controller.isValidDate(2000, 1, 1))
    assert.isFalse(controller.isValidDate(999, 1, 1))
    assert.isFalse(controller.isValidDate(10000, 1, 1))

    // month
    assert.isFalse(controller.isValidDate(2022, 0, 1))
    assert.isFalse(controller.isValidDate(2022, 13, 1))

    // day
    assert.isFalse(controller.isValidDate(2022,  1,  0))
    assert.isFalse(controller.isValidDate(2022,  1, 32))
    assert.isFalse(controller.isValidDate(2022,  2, 29))
    assert.isFalse(controller.isValidDate(2022,  3, 32))
    assert.isFalse(controller.isValidDate(2022,  4, 31))
    assert.isFalse(controller.isValidDate(2022,  5, 32))
    assert.isFalse(controller.isValidDate(2022,  6, 31))
    assert.isFalse(controller.isValidDate(2022,  7, 32))
    assert.isFalse(controller.isValidDate(2022,  8, 32))
    assert.isFalse(controller.isValidDate(2022,  9, 31))
    assert.isFalse(controller.isValidDate(2022, 10, 32))
    assert.isFalse(controller.isValidDate(2022, 11, 31))
    assert.isFalse(controller.isValidDate(2022, 12, 32))

    assert.isTrue(controller.isValidDate(2022, 2, 28))
    assert.isFalse(controller.isValidDate(2022, 2, 29))
    assert.isTrue(controller.isValidDate(2024, 2, 29))
    assert.isFalse(controller.isValidDate(2024, 2, 30))
  })

  it('isValidISO8601Date', () => {
    assert.isTrue(controller.isValidISO8601Date('2022-03-25'))
    assert.isTrue(controller.isValidISO8601Date('2022-04-29'))
    assert.isFalse(controller.isValidISO8601Date('2022-3-25'))
    assert.isFalse(controller.isValidISO8601Date('20220325'))
    assert.isFalse(controller.isValidISO8601Date('2022 03 25'))
    assert.isFalse(controller.isValidISO8601Date('2022-03-25T00:00:00Z'))
  })

  it('fromLocalISOString', () => {
    const actual = controller.fromLocalISOString('2022-04-20')
    const expected = new Date(2022, 3, 20)

    assert.equal(actual.getFullYear(),       expected.getFullYear())
    assert.equal(actual.getMonth(),          expected.getMonth())
    assert.equal(actual.getDate(),           expected.getDate())
    assert.equal(actual.getTimezoneOffset(), expected.getTimezoneOffset())
    assert.equal(actual.getHours(),          expected.getHours())
  })

  it('toLocalISOString', () => {
    assert.equal(controller.toLocalISOString(new Date(2022, 3, 20)), '2022-04-20')
  })

  it('dayNames', () => {
    // assume locale is en
    controller.firstDayOfWeekValue = 1
    assert.equal(controller.dayNames('long').length, 7)
    assert.equal(controller.dayNames('long')[0], 'Monday')
    assert.equal(controller.dayNames('long')[6], 'Sunday')

    controller.firstDayOfWeekValue = 5
    assert.equal(controller.dayNames('long')[0], 'Friday')
    assert.equal(controller.dayNames('long')[6], 'Thursday')
  })

  it('monthNames', () => {
    // assume locale is en
    assert.equal(controller.monthNames('long').length, 12)
    assert.equal(controller.monthNames('long')[0], 'January')
    assert.equal(controller.monthNames('long')[11], 'December')

    assert.equal(controller.monthNames('short').length, 12)
    assert.equal(controller.monthNames('short')[0], 'Jan')
    assert.equal(controller.monthNames('short')[11], 'Dec')
  })

  it('monthNumber', () => {
    // assume locale is en
    assert.equal(controller.monthNumber('January', 'long'), 1)
    assert.equal(controller.monthNumber('x', 'long'), 0)
    assert.equal(controller.monthNumber('Jan', 'short'), 1)
    assert.equal(controller.monthNumber('x', 'short'), 0)
  })

  it('localisedMonth', () => {
    // assume locale is en
    assert.equal(controller.localisedMonth(1, 'long'), 'January')
    assert.equal(controller.localisedMonth(1, 'short'), 'Jan')
  })

  it('parse', () => {
    controller.formatValue = '%d %m %Y'
    assert.equal(controller.parse('05 03 2022'), '2022-03-05')

    controller.formatValue = '%-d %-m %y'
    assert.equal(controller.parse('5 3 22'), '2022-03-05')

    // assume locale is en
    controller.formatValue = '%d %B %Y'
    assert.equal(controller.parse('05 March 2022'), '2022-03-05')

    // assume locale is en
    controller.formatValue = '%d %b %Y'
    assert.equal(controller.parse('05 Mar 2022'), '2022-03-05')

    controller.formatValue = '%d %m %Y'
    assert.equal(controller.parse('05 Mar 2022'), '')
    assert.equal(controller.parse('05-03-2022'), '')
    assert.equal(controller.parse('05 03 202'), '')
    assert.equal(controller.parse('05 3 2022'), '')
  })

  it('format', () => {
    controller.formatValue = '%d %m %Y'
    assert.equal(controller.format('2022-03-05'), '05 03 2022')

    controller.formatValue = '%-d %-m %y'
    assert.equal(controller.format('2022-03-05'), '5 3 22')

    // assume locale is en
    controller.formatValue = '%d %B %Y'
    assert.equal(controller.format('2022-03-05'), '05 March 2022')

    // assume locale is en
    controller.formatValue = '%d %b %Y'
    assert.equal(controller.format('2022-03-05'), '05 Mar 2022')

    controller.formatValue = '%d %m %Y'
    assert.equal(controller.format('20220305'), '')
    assert.equal(controller.format('2022-03-05T00:00:00Z'), '')
  })

  it('previousMonthRelative', () => {
    assert.equal(controller.previousMonthRelative('2022-04-14'), '2022-03-17')
    assert.equal(controller.previousMonthRelative('2022-03-31'), '2022-02-24')
    // 2022-02-28: 4th Monday of month
    // 2022-01-31: 5th Monday of month
    assert.equal(controller.previousMonthRelative('2022-02-28'), '2022-01-31')
  })

  it('nextMonthRelative', () => {
    assert.equal(controller.nextMonthRelative('2022-03-17'), '2022-04-14')
    assert.equal(controller.nextMonthRelative('2022-02-24'), '2022-03-24')
    assert.equal(controller.nextMonthRelative('2022-01-31'), '2022-02-28')
    assert.equal(controller.nextMonthRelative('2022-03-01'), '2022-04-05')
  })

  it('previousMonthAbsolute', () => {
    assert.equal(controller.previousMonthAbsolute('2022-04-14'), '2022-03-14')
    assert.equal(controller.previousMonthAbsolute('2022-03-31'), '2022-02-28')
  })

  it('nextMonthAbsolute', () => {
    assert.equal(controller.nextMonthAbsolute('2022-03-14'), '2022-04-14')
    assert.equal(controller.nextMonthAbsolute('2022-03-31'), '2022-04-30')
  })

  it('rangeUnderflow', () => {
    controller.hasMinValue = false  // This needs explicitly setting
    assert.isFalse(controller.rangeUnderflow('2022-05-11'))

    controller.minValue = '2022-05-11'
    controller.hasMinValue = true  // This needs explicitly setting
    assert.isFalse(controller.rangeUnderflow('2022-05-11'))
    assert.isTrue(controller.rangeUnderflow('2022-05-10'))
  })

  it('rangeOverflow', () => {
    controller.hasMaxValue = false  // This needs explicitly setting
    assert.isFalse(controller.rangeOverflow('2022-05-11'))

    controller.maxValue = '2022-05-11'
    controller.hasMaxValue = true  // This needs explicitly setting
    assert.isFalse(controller.rangeOverflow('2022-05-11'))
    assert.isTrue(controller.rangeOverflow('2022-05-12'))
  })

  it('clamp', () => {
    controller.hasMinValue = false  // This needs explicitly setting
    controller.hasMaxValue = false  // This needs explicitly setting
    assert.equal(controller.clamp('2022-05-11'), '2022-05-11')

    controller.minValue = '2022-05-11'
    controller.hasMinValue = true  // This needs explicitly setting
    assert.equal(controller.clamp('2022-05-11'), '2022-05-11')
    assert.equal(controller.clamp('2022-05-10'), '2022-05-11')

    controller.maxValue = '2022-05-20'
    controller.hasMaxValue = true  // This needs explicitly setting
    assert.equal(controller.clamp('2022-05-20'), '2022-05-20')
    assert.equal(controller.clamp('2022-05-21'), '2022-05-20')
  })

  it('initialDateStr', () => {
    controller.hasMinValue = false  // This needs explicitly setting
    controller.hasMaxValue = false  // This needs explicitly setting

    controller.dateValue = '2022-04-01'
    assert.equal(controller.initialDateStr(), '2022-04-01')

    controller.dateValue = undefined
    const date = new Date()
    const todayStr = [
      date.getFullYear(),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0')
    ].join('-')
    assert.equal(controller.initialDateStr(), todayStr)
  })

  it('validationMessage', () => {
    controller.hasMinValue = false
    controller.hasMaxValue = false
    controller.underflowMessageValue = 'Date must be %s or later.'
    controller.overflowMessageValue = 'Date must be %s or earlier.'
    controller.formatValue = '%d %m %Y'

    assert.equal(controller.validationMessage('2022-05-11'), '')

    controller.minValue = '2022-05-20'
    controller.hasMinValue = true  // This needs explicitly setting
    assert.equal(controller.validationMessage('2022-05-15'), 'Date must be 20 05 2022 or later.')
    controller.underflowMessageValue = ''
    assert.equal(controller.validationMessage('2022-05-15'), '')

    controller.maxValue = '2022-05-25'
    controller.hasMaxValue = true  // This needs explicitly setting
    assert.equal(controller.validationMessage('2022-05-30'), 'Date must be 25 05 2022 or earlier.')
    controller.overflowMessageValue = ''
    assert.equal(controller.validationMessage('2022-05-30'), '')
  })

  it('isDisabled', () => {
    controller.hasMinValue = false  // This needs explicitly setting
    controller.hasMaxValue = false  // This needs explicitly setting
    controller.allowWeekendsValue = true  // This needs explicitly setting
    controller.disallowValue = []  // This needs explicitly setting

    // Weekends
    assert.isFalse(controller.isDisabled('2022-05-14'))  // Saturday

    controller.allowWeekendsValue = false
    assert.isTrue(controller.isDisabled('2022-05-14'))  // Saturday

    // Min
    controller.minValue = '2022-05-12'
    controller.hasMinValue = true  // This needs explicitly setting
    assert.isFalse(controller.isDisabled('2022-05-12'))  // Thursday
    assert.isTrue(controller.isDisabled('2022-05-11'))

    // Max
    controller.maxValue = '2022-05-17'
    controller.hasMaxValue = true  // This needs explicitly setting
    assert.isFalse(controller.isDisabled('2022-05-17'))  // Tuesday
    assert.isTrue(controller.isDisabled('2022-05-18'))

    // Disallow
    assert.isFalse(controller.isDisabled('2022-05-16'))
    controller.disallowValue = ['2022-05-16']
    assert.isTrue(controller.isDisabled('2022-05-16'))
  })
})
