const visibleInput = "input[type=text]"
const hiddenInput = "input[type=hidden]"
const controller = "[data-controller='datepicker']"

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

Cypress.Commands.add("assertVisibleInput", (value) => {
  cy.get(visibleInput).should('have.value', value)
})

Cypress.Commands.add("assertHiddenInput", (value) => {
  cy.get(hiddenInput).should('have.value', value)
})

Cypress.Commands.add("typeDate", (value) => {
  cy.get(visibleInput).clear().type(value)
})
