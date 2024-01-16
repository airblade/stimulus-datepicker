import { Datepicker } from '../../src/datepicker.js'
import IsoDate from '../../src/iso_date.js'

describe('Stimulus datepicker', () => {

  const controller = new Datepicker()

  beforeEach(() => {
    controller.localesValue = 'en-GB'
  })

  it('dayNames', () => {
    controller.firstDayOfWeekValue = 1
    assert.equal(controller.dayNames('long').length, 7)
    assert.equal(controller.dayNames('long')[0], 'Monday')
    assert.equal(controller.dayNames('long')[6], 'Sunday')

    controller.firstDayOfWeekValue = 5
    assert.equal(controller.dayNames('long')[0], 'Friday')
    assert.equal(controller.dayNames('long')[6], 'Thursday')

    controller.localesValue = 'de-DE'
    assert.equal(controller.dayNames('long')[0], 'Freitag')
    assert.equal(controller.dayNames('long')[6], 'Donnerstag')
  })

  it('monthNames', () => {
    assert.equal(controller.monthNames('long').length, 12)
    assert.equal(controller.monthNames('long')[0], 'January')
    assert.equal(controller.monthNames('long')[11], 'December')

    assert.equal(controller.monthNames('short').length, 12)
    assert.equal(controller.monthNames('short')[0], 'Jan')
    assert.equal(controller.monthNames('short')[11], 'Dec')

    controller.localesValue = 'de-DE'
    assert.equal(controller.monthNames('long').length, 12)
    assert.equal(controller.monthNames('long')[0], 'Januar')
    assert.equal(controller.monthNames('long')[11], 'Dezember')

    assert.equal(controller.monthNames('short').length, 12)
    assert.equal(controller.monthNames('short')[0], 'Jan')
    assert.equal(controller.monthNames('short')[11], 'Dez')
  })

  it('monthNumber', () => {
    assert.equal(controller.monthNumber('January', 'long'), 1)
    assert.equal(controller.monthNumber('x', 'long'), 0)
    assert.equal(controller.monthNumber('Jan', 'short'), 1)
    assert.equal(controller.monthNumber('x', 'short'), 0)
  })

  it('localisedMonth', () => {
    assert.equal(controller.localisedMonth(1, 'long'), 'January')
    assert.equal(controller.localisedMonth(1, 'short'), 'Jan')

    controller.localesValue = 'de-DE'
    assert.equal(controller.localisedMonth(1, 'long'), 'Januar')
    assert.equal(controller.localisedMonth(1, 'short'), 'Jan')
  })

  it('parse', () => {
    controller.formatValue = '%d %m %Y'
    assert.equal(controller.parse('05 03 2022'), '2022-03-05')

    controller.formatValue = '%-d %-m %y'
    assert.equal(controller.parse('5 3 22'), '2022-03-05')

    controller.formatValue = '%d %B %Y'
    assert.equal(controller.parse('05 March 2022'), '2022-03-05')

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

    controller.formatValue = '%d %B %Y'
    assert.equal(controller.format('2022-03-05'), '05 March 2022')

    controller.formatValue = '%d %b %Y'
    assert.equal(controller.format('2022-03-05'), '05 Mar 2022')

    controller.formatValue = '%d %m %Y'
    assert.equal(controller.format('20220305'), '')
    assert.equal(controller.format('2022-03-05T00:00:00Z'), '')
  })

  it('rangeUnderflow', () => {
    controller.hasMinValue = false  // This needs explicitly setting
    assert.isFalse(controller.rangeUnderflow(new IsoDate('2022-05-11')))

    controller.minValue = '2022-05-11'
    controller.hasMinValue = true  // This needs explicitly setting
    assert.isFalse(controller.rangeUnderflow(new IsoDate('2022-05-11')))
    assert.isTrue(controller.rangeUnderflow(new IsoDate('2022-05-10')))
  })

  it('rangeOverflow', () => {
    controller.hasMaxValue = false  // This needs explicitly setting
    assert.isFalse(controller.rangeOverflow(new IsoDate('2022-05-11')))

    controller.maxValue = '2022-05-11'
    controller.hasMaxValue = true  // This needs explicitly setting
    assert.isFalse(controller.rangeOverflow(new IsoDate('2022-05-11')))
    assert.isTrue(controller.rangeOverflow(new IsoDate('2022-05-12')))
  })

  it('clamp', () => {
    controller.hasMinValue = false  // This needs explicitly setting
    controller.hasMaxValue = false  // This needs explicitly setting
    assert.equal(controller.clamp(new IsoDate('2022-05-11')).toString(), '2022-05-11')

    controller.minValue = '2022-05-11'
    controller.hasMinValue = true  // This needs explicitly setting
    assert.equal(controller.clamp(new IsoDate('2022-05-11')).toString(), '2022-05-11')
    assert.equal(controller.clamp(new IsoDate('2022-05-10')).toString(), '2022-05-11')

    controller.maxValue = '2022-05-20'
    controller.hasMaxValue = true  // This needs explicitly setting
    assert.equal(controller.clamp(new IsoDate('2022-05-20')).toString(), '2022-05-20')
    assert.equal(controller.clamp(new IsoDate('2022-05-21')).toString(), '2022-05-20')
  })

  it('initialIsoDate', () => {
    controller.hasMinValue = false  // This needs explicitly setting
    controller.hasMaxValue = false  // This needs explicitly setting

    controller.dateValue = '2022-04-01'
    assert.equal(controller.initialIsoDate().toString(), '2022-04-01')

    controller.dateValue = ''
    const date = new Date()
    const todayStr = [
      date.getFullYear(),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0')
    ].join('-')
    assert.equal(controller.initialIsoDate().toString(), todayStr)
  })

  it('validationMessage', () => {
    controller.hasMinValue = false
    controller.hasMaxValue = false
    controller.textValue = {underflow: 'Date must be %s or later.', overflow: 'Date must be %s or earlier.'}
    controller.formatValue = '%d %m %Y'

    assert.equal(controller.validationMessage('2022-05-11'), '')

    controller.minValue = '2022-05-20'
    controller.hasMinValue = true  // This needs explicitly setting
    assert.equal(controller.validationMessage('2022-05-15'), 'Date must be 20 05 2022 or later.')
    controller.textValue = {underflow: '', overflow: 'Date must be %s or earlier.'}
    assert.equal(controller.validationMessage('2022-05-15'), '')

    controller.maxValue = '2022-05-25'
    controller.hasMaxValue = true  // This needs explicitly setting
    assert.equal(controller.validationMessage('2022-05-30'), 'Date must be 25 05 2022 or earlier.')
    controller.textValue = {overflow: ''}
    assert.equal(controller.validationMessage('2022-05-30'), '')
  })

  it('isDisabled', () => {
    controller.hasMinValue = false  // This needs explicitly setting
    controller.hasMaxValue = false  // This needs explicitly setting
    controller.allowWeekendsValue = true  // This needs explicitly setting
    controller.disallowValue = []  // This needs explicitly setting

    // Weekends
    assert.isFalse(controller.isDisabled(new IsoDate('2022-05-14')))  // Saturday

    controller.allowWeekendsValue = false
    assert.isTrue(controller.isDisabled(new IsoDate('2022-05-14')))  // Saturday

    // Min
    controller.minValue = '2022-05-12'
    controller.hasMinValue = true  // This needs explicitly setting
    assert.isFalse(controller.isDisabled(new IsoDate('2022-05-12')))  // Thursday
    assert.isTrue(controller.isDisabled(new IsoDate('2022-05-11')))

    // Max
    controller.maxValue = '2022-05-17'
    controller.hasMaxValue = true  // This needs explicitly setting
    assert.isFalse(controller.isDisabled(new IsoDate('2022-05-17')))  // Tuesday
    assert.isTrue(controller.isDisabled(new IsoDate('2022-05-18')))

    // Disallow
    assert.isFalse(controller.isDisabled(new IsoDate('2022-05-16')))
    controller.disallowValue = ['2022-05-16']
    assert.isTrue(controller.isDisabled(new IsoDate('2022-05-16')))
  })

  it('text', () => {
    // Defaults
    assert.equal(controller.text('underflow'),     '')
    assert.equal(controller.text('overflow'),      '')
    assert.equal(controller.text('previousMonth'), 'Previous month')
    assert.equal(controller.text('nextMonth'),     'Next month')
    assert.equal(controller.text('today'),         'Today')
    assert.equal(controller.text('chooseDate'),    'Choose Date')
    assert.equal(controller.text('changeDate'),    'Change Date')

    controller.textValue = {"underflow": 'Date must be %s or later'}
    // Configured value
    assert.equal(controller.text('underflow'), 'Date must be %s or later')
    // Other defaults preserved
    assert.equal(controller.text('today'), 'Today')
  })
})
