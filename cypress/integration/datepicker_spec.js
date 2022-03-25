describe('Stimulus datepicker', () => {

  beforeEach(() => {
    cy.visit('index.html')
  })


  it('adds a hidden input after the visible input with the same name', () => {
    cy.get('input').should('have.length', 2)

    cy.get('input:first').should('have.attr', 'type', 'text')
    cy.get('input:last').should('have.attr', 'type', 'hidden')

    cy.get('input:first').invoke('attr', 'name').then(name => {
      cy.get('input:last').should('have.attr', 'name', name)
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

})
