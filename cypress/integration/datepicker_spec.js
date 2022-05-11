describe('Stimulus datepicker', () => {

  beforeEach(() => {
    cy.visit('index.html')
    cy.waitForResources('es-module-shims-1.5.4.js', 'stimulus-3.0.1.js')
  })


  it('adds a hidden input after the visible input with the same name', () => {
    cy.get('[data-controller="datepicker"]').within(() => {
      cy.get('input').should('have.length', 2)

      cy.get('input:first').should('have.attr', 'type', 'text')
      cy.get('input:last').should('have.attr', 'type', 'hidden')

      cy.get('input:first').invoke('attr', 'name').then(name => {
        cy.get('input:last').should('have.attr', 'name', name)
      })
    })
  })


  it('formats the ISO8601 date for the visible input', () => {
    // default format
    cy.assertVisibleInput('2022-04-01')
    cy.assertHiddenInput('2022-04-01')

    cy.setFormat('%d %m %Y')
    cy.assertVisibleInput('01 04 2022')
    cy.assertHiddenInput('2022-04-01')
  })


  it('parses the visible date and updates the hidden date', () => {
    // default format
    cy.typeDate('2021-04-06')
    cy.assertVisibleInput('2021-04-06')
    cy.assertHiddenInput('2021-04-06')

    cy.setFormat("%d %m %Y")
    cy.typeDate('06 05 2022')
    cy.assertVisibleInput('06 05 2022')
    cy.assertHiddenInput('2022-05-06')

    cy.typeDate('02 01 202')
    cy.assertVisibleInput('02 01 202')
    cy.assertHiddenInput('2022-05-06')
  })


  it('renders the date grid', () => {
    cy.showCalendar()

    cy.selectYear('2023')
    cy.assertFirstDate('2023-03-27')
    cy.assertLastDate('2023-04-30')  // no next month

    cy.selectMonth('May')
    cy.assertFirstDate('2023-05-01')  // no previous month
    cy.assertLastDate('2023-06-04')
  })


  it('toggles the calendar when the toggle target is clicked', () => {
    cy.showCalendar()
    cy.assertCalendar()

    cy.get("[data-datepicker-target='toggle']").click()
    cy.assertNoCalendar()
  })


  it('closes the calendar on outside click', () => {
    cy.showCalendar()
    cy.get('h1').click()
    cy.assertNoCalendar()
  })


  it('does not close the calendar on inside click', () => {
    cy.showCalendar()
    cy.get('[data-datepicker-target="prevMonth"]').click()
    cy.assertCalendar()
  })


  it('closes the calendar on escape', () => {
    cy.showCalendar()
    cy.focused().type('{esc}')
    cy.assertNoCalendar()
  })


  it('updates the input, closes the calendar, and does not submit the form when a date is chosen', () => {
    cy.showCalendar()
    cy.listen('input', 'change')
    cy.contains(/^14$/).click()
    cy.assertNoCalendar()
    cy.assertVisibleInput('2022-04-14')
    cy.assertHiddenInput('2022-04-14')
    cy.assertEvent('change')
  })


  it('traps focus', () => {
    cy.showCalendar()
    cy.assertFocusedDate('2022-04-01')

    cy.typeTab()
    cy.assertFocusedTarget("month")

    cy.typeTab(true)
    cy.assertFocusedDate('2022-04-01')
  })


  //      April 2022
  // Mo Tu We Th Fr Sa Su
  // 28 29 30 31  1  2  3
  //  4  5  6  7  8  9 10
  // 11 12 13 14 15 16 17
  // 18 19 20 21 22 23 24
  // 25 26 27 28 29 30  1
  it('navigates the date grid', () => {
    cy.showCalendar()
    cy.assertFocusedDate('2022-04-01')

    cy.focused().type('{downArrow}')
    cy.focused().type('j')
    cy.assertFocusedDate('2022-04-15')

    cy.focused().type('{upArrow}')
    cy.focused().type('k')
    cy.assertFocusedDate('2022-04-01')

    cy.focused().type('{leftArrow}')
    cy.focused().type('h')
    cy.assertFocusedDate('2022-03-30')

    cy.focused().type('{rightArrow}')
    cy.focused().type('l')
    cy.assertFocusedDate('2022-04-01')

    cy.focused().type('{home}')
    cy.assertFocusedDate('2022-03-28')

    cy.focused().type('{end}')
    cy.assertFocusedDate('2022-04-03')

    cy.focused().type('0')
    cy.assertFocusedDate('2022-03-28')

    cy.focused().type('$')
    cy.assertFocusedDate('2022-04-03')

    cy.focused().type('^')
    cy.assertFocusedDate('2022-03-28')

    cy.focusDate('2022-04-17')

    cy.focused().type('{pageUp}')
    cy.assertFocusedDate('2022-03-17')

    cy.focused().type('{pageDown}')
    cy.assertFocusedDate('2022-04-17')

    cy.focused().type('{shift+pageUp}')
    cy.assertFocusedDate('2021-04-17')

    cy.focused().type('{shift+pageDown}')
    cy.assertFocusedDate('2022-04-17')

    cy.focused().type('b')
    cy.assertFocusedDate('2022-03-17')

    cy.focused().type('w')
    cy.assertFocusedDate('2022-04-17')

    cy.focused().type('B')
    cy.assertFocusedDate('2021-04-17')

    cy.focused().type('W')
    cy.assertFocusedDate('2022-04-17')
  })


  it('month dropdown', () => {
    cy.showCalendar()
    cy.selectMonth('October')
    cy.assertFocusedDate('2022-10-01')
  })


  it('year dropdown', () => {
    cy.showCalendar()
    cy.selectYear('2024')
    cy.assertFocusedDate('2024-04-01')
  })


  it('previous-month button', () => {
    cy.showCalendar()
    cy.previousMonthButton().click()
    cy.assertFocusedDate('2022-03-01')
  })


  it('next-month button', () => {
    cy.showCalendar()
    cy.nextMonthButton().click()
    cy.assertFocusedDate('2022-05-01')
  })


  it('today button', () => {
    cy.showCalendar()
    cy.todayButton().click()
    const today = new Date()
    const todayStr = [
      today.getFullYear(),
      (today.getMonth() + 1).toString().padStart(2, '0'),
      today.getDate().toString().padStart(2, '0')
    ].join('-')
    cy.assertFocusedDate(todayStr)
  })


  it('does not move other elements when the calendar opens', () => {
    const getRectangle = el => el[0].getBoundingClientRect()

    cy.get('p').then(getRectangle).then(rect => {
      cy.showCalendar()
      cy.get('p').then(getRectangle).then(_rect => {
        assert.equal(rect.top, _rect.top)
        assert.equal(rect.left, _rect.left)
      })
    })
  })


  it('is accessible', () => {
    cy.assertTargetAttribute('toggle', 'aria-label', 'Choose Date')

    cy.showCalendar()
    cy.assertTargetAttribute('calendar',  'role',       'dialog')
    cy.assertTargetAttribute('calendar',  'aria-modal', 'true')
    cy.assertTargetAttribute('calendar',  'aria-label', 'Choose Date')
    cy.assertTargetAttribute('days',      'role',       'grid')
    cy.assertTargetAttribute('prevMonth', 'aria-label', 'Previous month')
    cy.assertTargetAttribute('today',     'aria-label', 'Today')
    cy.assertTargetAttribute('nextMonth', 'aria-label', 'Next month')

    cy.focused().should('have.attr', 'aria-selected', 'true')

    cy.focused().type('j')
    cy.focused().should('not.have.attr', 'aria-selected', 'true')
    cy.assertTargetAttribute('toggle', 'aria-label', 'Change Date, 2022-04-08')
  })


  it('supports min and max dates', () => {
    cy.setRange('2022-03-30', '2022-04-10')
    cy.showCalendar()

    cy.focusDate('2022-03-31')
    cy.focused().type('{leftArrow}')
    cy.assertFocusedDate('2022-03-30')
    cy.focused().type('{leftArrow}')
    cy.assertFocusedDate('2022-03-30')

    cy.focusDate('2022-04-09')
    cy.focused().type('{rightArrow}')
    cy.assertFocusedDate('2022-04-10')
    cy.focused().type('{rightArrow}')
    cy.assertFocusedDate('2022-04-10')
  })
})
