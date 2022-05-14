const visibleInput = "input[type=text]"
const hiddenInput  = "input[type=hidden]"
const controller   = "[data-controller='datepicker']"
const toggle       = "[data-datepicker-target='toggle']"
const calendar     = "[data-datepicker-target='calendar']"
const monthSelect  = "[data-datepicker-target='month']"
const yearSelect   = "[data-datepicker-target='year']"
const prevMonth    = "[data-datepicker-target='prevMonth']"
const nextMonth    = "[data-datepicker-target='nextMonth']"
const today        = "[data-datepicker-target='today']"
const daysGrid     = "[data-datepicker-target='days']"

Cypress.Commands.add("setFormat", (format) => {
  cy.get(controller)
    // set the format
    .then(els => els[0].setAttribute('data-datepicker-format-value', format))
    // force an update
    .then(els => {
      const v = els[0].getAttribute('data-datepicker-date-value')
      els[0].setAttribute('data-datepicker-date-value', '')
      queueMicrotask(() => {
        els[0].setAttribute('data-datepicker-date-value', v)
      })
    })
})

Cypress.Commands.add("setControllerValue", (name, value) => {
  cy.get(controller)
    .then(el => el[0].setAttribute(`data-datepicker-${name}-value`, value))
})

Cypress.Commands.add("assertVisibleInput", (value) => {
  cy.get(visibleInput).should('have.value', value)
})

Cypress.Commands.add("assertHiddenInput", (value) => {
  cy.get(hiddenInput).should('have.value', value)
})

Cypress.Commands.add("typeDate", (value) => {
  // Not sure why we need to call clear() twice but evidently
  // it is necessary when Cypress runs on Firefox and Electron.
  cy.get(visibleInput).clear().clear().type(value)
})

Cypress.Commands.add("showCalendar", (value) => {
  cy.get(toggle).click()
})

Cypress.Commands.add("assertCalendar", (value) => {
  cy.get(calendar)
})

Cypress.Commands.add("assertNoCalendar", (value) => {
  cy.get(calendar).should('not.exist')
})

// value - YYYY-MM-DD
Cypress.Commands.add("assertSelectedDate", (value) => {
  cy.get(calendar).get(`.sdp-selected [datetime="${value}"]`)
})

// value - YYYY-MM-DD
Cypress.Commands.add("assertFocusedDate", (value) => {
  cy.get(calendar).get(`button[tabindex="0"] [datetime="${value}"]`)
})

Cypress.Commands.add("assertDisabledDate", (value) => {
  cy.get(calendar).get(`button[aria-disabled="true"] [datetime="${value}"]`)
})

Cypress.Commands.add("assertFocusedTarget", (target) => {
  cy.get(`[data-datepicker-target="${target}"]`).should('have.focus')
})

Cypress.Commands.add("focusDate", (value) => {
  cy.get(`[datetime="${value}"]`).parent().focus()
})

// https://github.com/cypress-io/cypress/issues/299#issuecomment-380197761
// https://github.com/cypress-io/cypress/issues/311
// https://github.com/kuceb/cypress-plugin-tab
// https://github.com/dmtrKovalenko/cypress-real-events
Cypress.Commands.add('typeTab', (shiftKey) => {
  cy.focused().trigger('keydown', {
    keyCode: 9,
    which: 9,
    key: 'Tab',
    shiftKey: shiftKey
  })
})

Cypress.Commands.add("selectMonth", (value) => {
  cy.get(monthSelect).select(value)
})

Cypress.Commands.add("selectYear", (value) => {
  cy.get(yearSelect).select(value)
})

Cypress.Commands.add("previousMonthButton", (value) => {
  cy.get(prevMonth)
})

Cypress.Commands.add("nextMonthButton", (value) => {
  cy.get(nextMonth)
})

Cypress.Commands.add("todayButton", (value) => {
  cy.get(today)
})

Cypress.Commands.add("assertFirstDate", (value) => {
  cy.get(daysGrid).children().first().get(`[datetime="${value}"]`)
})

Cypress.Commands.add("assertLastDate", (value) => {
  cy.get(daysGrid).children().last().get(`[datetime="${value}"]`)
})

Cypress.Commands.add("assertTargetAttribute", (target, name, value) => {
  cy.get(`[data-datepicker-target="${target}"]`).should('have.attr', name, value)
})

Cypress.Commands.add("listen", (target, eventName) => {
  cy.get(`[data-datepicker-target="${target}"]`).invoke('on', eventName, cy.stub().as(eventName))
})

Cypress.Commands.add("assertEvent", (eventName) => {
  cy.get(`@${eventName}`).should('have.been.calledOnce')
})

Cypress.Commands.add("assertValidationMessage", (message) => {
  cy.get(visibleInput).invoke('prop', 'validationMessage').should('equal', message)
})
