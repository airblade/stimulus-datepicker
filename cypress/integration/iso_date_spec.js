import IsoDate from '../../src/iso_date.js'

describe('IsoDate', () => {

  const SUNDAY = 0
  const MONDAY = 1
  const FRIDAY = 5
  const SATURDAY = 6

  it('constructor: empty', () => {
    const date = new Date()
    const yyyy = date.getFullYear().toString()
    const mm   = (date.getMonth() + 1).toString().padStart(2, '0')
    const dd   = date.getDate().toString().padStart(2, '0')
    let isoDate

    isoDate = new IsoDate()
    assert.equal(isoDate.yyyy, yyyy)
    assert.equal(isoDate.mm, mm)
    assert.equal(isoDate.dd, dd)

    isoDate = new IsoDate('')
    assert.equal(isoDate.yyyy, yyyy)
    assert.equal(isoDate.mm, mm)
    assert.equal(isoDate.dd, dd)

    isoDate = new IsoDate(undefined)
    assert.equal(isoDate.yyyy, yyyy)
    assert.equal(isoDate.mm, mm)
    assert.equal(isoDate.dd, dd)
  })

  it('constructor: date', () => {
    const date = new Date(2022, 4, 1)
    const isoDate = new IsoDate(date)
    assert.equal(isoDate.yyyy, '2022')
    assert.equal(isoDate.mm,     '05')
    assert.equal(isoDate.dd,     '01')
  })

  it('constructor: iso string', () => {
    const isoDate = new IsoDate('2022-05-01')
    assert.equal(isoDate.yyyy, '2022')
    assert.equal(isoDate.mm,     '05')
    assert.equal(isoDate.dd,     '01')
  })

  it('constructor: parts', () => {
    const isoDate = new IsoDate('2022', '05', '01')
    assert.equal(isoDate.yyyy, '2022')
    assert.equal(isoDate.mm,     '05')
    assert.equal(isoDate.dd,     '01')
  })

  it('toString()', () => {
    const isoDate = new IsoDate('2022', '05', '01')
    assert.equal(isoDate.toString(), '2022-05-01')
  })

  it('setDayOfMonth()', () => {
    const isoDate = new IsoDate('2022', '05', '20')
    const result = isoDate.setDayOfMonth(1)
    assert.equal(result.toString(), '2022-05-01')
    assert.equal(isoDate.toString(), '2022-05-20')
  })

  it('firstDayOfWeek()', () => {
    const isoDate = new IsoDate('2022', '05', '20')  // friday

    // argument value is before current day of week
    let result = isoDate.firstDayOfWeek(MONDAY)
    assert.equal(result.toString(), '2022-05-16')  // monday
    assert.equal(isoDate.toString(), '2022-05-20')

    // argument value is current day of week
    result = isoDate.firstDayOfWeek(FRIDAY)
    assert.equal(result.toString(), '2022-05-20')  // friday

    // argument value is after current day of week
    result = isoDate.firstDayOfWeek(SATURDAY)
    assert.equal(result.toString(), '2022-05-14')  // saturday
  })

  it('lastDayOfWeek()', () => {
    const isoDate = new IsoDate('2022', '05', '20')  // friday

    // argument value is before current day of week
    let result = isoDate.lastDayOfWeek(MONDAY)
    assert.equal(result.toString(), '2022-05-22')  // sunday
    assert.equal(isoDate.toString(), '2022-05-20')

    // argument value is current day of week
    result = isoDate.lastDayOfWeek(FRIDAY)
    assert.equal(result.toString(), '2022-05-26')  // thursday

    // argument value is after current day of week
    result = isoDate.lastDayOfWeek(SATURDAY)
    assert.equal(result.toString(), '2022-05-20')  // friday
  })

  it('previousMonthSameDayOfWeek', () => {
    assert.equal(new IsoDate('2022-04-14').previousMonthSameDayOfWeek().toString(), '2022-03-17')
    assert.equal(new IsoDate('2022-04-14').previousMonthSameDayOfWeek().toString(), '2022-03-17')
    assert.equal(new IsoDate('2022-03-31').previousMonthSameDayOfWeek().toString(), '2022-02-24')
    // 2022-02-28: 4th Monday of month
    // 2022-01-31: 5th Monday of month
    assert.equal(new IsoDate('2022-02-28').previousMonthSameDayOfWeek().toString(), '2022-01-31')
  })

  it('nextMonthSameDayOfWeek', () => {
    assert.equal(new IsoDate('2022-03-17').nextMonthSameDayOfWeek().toString(), '2022-04-14')
    assert.equal(new IsoDate('2022-02-24').nextMonthSameDayOfWeek().toString(), '2022-03-24')
    assert.equal(new IsoDate('2022-01-31').nextMonthSameDayOfWeek().toString(), '2022-02-28')
    assert.equal(new IsoDate('2022-03-01').nextMonthSameDayOfWeek().toString(), '2022-04-05')
  })

  it('previousDay()', () => {
    assert.equal(new IsoDate('2022-01-01').previousDay().toString(), '2021-12-31')
  })

  it('nextDay()', () => {
    assert.equal(new IsoDate('2021-12-31').nextDay().toString(), '2022-01-01')
  })

  it('previousWeek()', () => {
    assert.equal(new IsoDate('2022-01-01').previousWeek().toString(), '2021-12-25')
  })

  it('nextWeek()', () => {
    assert.equal(new IsoDate('2021-12-31').nextWeek().toString(), '2022-01-07')
  })

  it('previousMonth()', () => {
    assert.equal(new IsoDate('2022-04-14').previousMonth().toString(), '2022-03-14')
    assert.equal(new IsoDate('2022-03-31').previousMonth().toString(), '2022-02-28')
  })

  it('nextMonth()', () => {
    assert.equal(new IsoDate('2022-03-14').nextMonth().toString(), '2022-04-14')
    assert.equal(new IsoDate('2022-03-31').nextMonth().toString(), '2022-04-30')
  })

  it('previousYear()', () => {
    assert.equal(new IsoDate('2022-05-21').previousYear().toString(), '2021-05-21')
    assert.equal(new IsoDate('2020-02-29').previousYear().toString(), '2019-02-28')
  })

  it('nextYear()', () => {
    assert.equal(new IsoDate('2022-05-21').nextYear().toString(), '2023-05-21')
    assert.equal(new IsoDate('2020-02-29').nextYear().toString(), '2021-02-28')
  })

  it('isWeekend()', () => {
    assert.isFalse(new IsoDate('2022-05-16').isWeekend())
    assert.isFalse(new IsoDate('2022-05-17').isWeekend())
    assert.isFalse(new IsoDate('2022-05-18').isWeekend())
    assert.isFalse(new IsoDate('2022-05-19').isWeekend())
    assert.isFalse(new IsoDate('2022-05-20').isWeekend())
    assert.isTrue(new IsoDate('2022-05-21').isWeekend())
    assert.isTrue(new IsoDate('2022-05-22').isWeekend())
  })

  it('isToday()', () => {
    assert.isTrue(new IsoDate().isToday())
    assert.isFalse(new IsoDate('2022-01-01').isToday())
  })

  it('isFirstDayOfWeek()', () => {
    assert.isTrue(new IsoDate('2022-05-16').isFirstDayOfWeek(1))
    assert.isFalse(new IsoDate('2022-05-16').isFirstDayOfWeek(0))
  })

  it('equals()', () => {
    assert.isTrue(new IsoDate().equals(new IsoDate()))
    assert.isTrue(new IsoDate('2022-05-21').equals(new IsoDate('2022-05-21')))
    assert.isFalse(new IsoDate('2022-05-21').equals(new IsoDate('2022-05-20')))
  })

  it('before()', () => {
    assert.isFalse(new IsoDate().before(new IsoDate()))
    assert.isTrue(new IsoDate('2022-05-21').before(new IsoDate('2022-05-22')))
    assert.isFalse(new IsoDate('2022-05-21').before(new IsoDate('2022-05-19')))
  })

  it('after()', () => {
    assert.isFalse(new IsoDate().after(new IsoDate()))
    assert.isFalse(new IsoDate('2022-05-21').after(new IsoDate('2022-05-22')))
    assert.isTrue(new IsoDate('2022-05-21').after(new IsoDate('2022-05-19')))
  })

  it('increment()', () => {
    assert.equal(new IsoDate('2022-05-21').increment('dd',  1).toString(), '2022-05-22')
    assert.equal(new IsoDate('2022-05-21').increment('dd', -1).toString(), '2022-05-20')

    assert.equal(new IsoDate('2022-05-21').increment('mm',  1).toString(), '2022-06-21')
    assert.equal(new IsoDate('2022-05-21').increment('mm', -1).toString(), '2022-04-21')
    assert.equal(new IsoDate('2022-05-31').increment('mm',  1).toString(), '2022-06-30')
    assert.equal(new IsoDate('2022-05-31').increment('mm', -1).toString(), '2022-04-30')

    assert.equal(new IsoDate('2022-05-21').increment('yyyy',  1).toString(), '2023-05-21')
    assert.equal(new IsoDate('2022-05-21').increment('yyyy', -1).toString(), '2021-05-21')
    assert.equal(new IsoDate('2024-02-29').increment('yyyy',  1).toString(), '2025-02-28')
    assert.equal(new IsoDate('2024-02-29').increment('yyyy', -1).toString(), '2023-02-28')
  })

  it('isValidStr()', () => {
    assert.isTrue(IsoDate.isValidStr('2022-03-25'))
    assert.isTrue(IsoDate.isValidStr('2022-04-29'))
    assert.isFalse(IsoDate.isValidStr('2022-3-25'))
    assert.isFalse(IsoDate.isValidStr('20220325'))
    assert.isFalse(IsoDate.isValidStr('2022 03 25'))
    assert.isFalse(IsoDate.isValidStr('2022-03-25T00:00:00Z'))
  })

  it('isValidDate()', () => {
    // year
    assert.isTrue(IsoDate.isValidDate(2000, 1, 1))
    assert.isFalse(IsoDate.isValidDate(999, 1, 1))
    assert.isFalse(IsoDate.isValidDate(10000, 1, 1))

    // month
    assert.isFalse(IsoDate.isValidDate(2022, 0, 1))
    assert.isFalse(IsoDate.isValidDate(2022, 13, 1))

    // day
    assert.isFalse(IsoDate.isValidDate(2022,  1,  0))
    assert.isFalse(IsoDate.isValidDate(2022,  1, 32))
    assert.isFalse(IsoDate.isValidDate(2022,  2, 29))
    assert.isFalse(IsoDate.isValidDate(2022,  3, 32))
    assert.isFalse(IsoDate.isValidDate(2022,  4, 31))
    assert.isFalse(IsoDate.isValidDate(2022,  5, 32))
    assert.isFalse(IsoDate.isValidDate(2022,  6, 31))
    assert.isFalse(IsoDate.isValidDate(2022,  7, 32))
    assert.isFalse(IsoDate.isValidDate(2022,  8, 32))
    assert.isFalse(IsoDate.isValidDate(2022,  9, 31))
    assert.isFalse(IsoDate.isValidDate(2022, 10, 32))
    assert.isFalse(IsoDate.isValidDate(2022, 11, 31))
    assert.isFalse(IsoDate.isValidDate(2022, 12, 32))

    assert.isTrue(IsoDate.isValidDate(2022, 2, 28))
    assert.isFalse(IsoDate.isValidDate(2022, 2, 29))
    assert.isTrue(IsoDate.isValidDate(2024, 2, 29))
    assert.isFalse(IsoDate.isValidDate(2024, 2, 30))
  })

  it('isLeapYear()', () => {
    // assert.isFalse(IsoDate.isLeapYear(2022))
    // assert.isTrue(IsoDate.isLeapYear(2024))
    // assert.isTrue(IsoDate.isLeapYear(2000))
    // assert.isFalse(IsoDate.isLeapYear(2100))

    // Having made the leap year function private, we can only test it indirectly.
    assert.isFalse(IsoDate.isValidDate(2022, 2, 29))
    assert.isTrue(IsoDate.isValidDate(2024, 2, 29))
    assert.isTrue(IsoDate.isValidDate(2000, 2, 29))
    assert.isFalse(IsoDate.isValidDate(2100, 2, 29))

  })

})
