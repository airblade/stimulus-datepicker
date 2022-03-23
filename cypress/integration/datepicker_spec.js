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

    cy.setFormat('%d %-d %m %-m %B %b %Y %y')
    cy.assertVisibleInput('01 1 04 4 April Apr 2022 22')
    cy.assertHiddenInput('2022-04-01')
  })


  it('parses the visible date', () => {
    // default format
    cy.typeDate('2021-04-06')
    cy.assertVisibleInput('2021-04-06')
    cy.assertHiddenInput('2021-04-06')

    cy.setFormat("%d %m %Y")
    cy.typeDate('06 05 2022')
    cy.assertVisibleInput('06 05 2022')
    cy.assertHiddenInput('2022-05-06')

    cy.setFormat("%-d %-m %y")
    cy.typeDate('2 7 22')
    cy.assertVisibleInput('2 7 22')
    cy.assertHiddenInput('2022-07-02')

    cy.setFormat("%d %B %Y")
    cy.typeDate('09 March 2022')
    cy.assertVisibleInput('09 March 2022')
    cy.assertHiddenInput('2022-03-09')

    cy.setFormat("%d %b %Y")
    cy.typeDate('07 Apr 2022')
    cy.assertVisibleInput('07 Apr 2022')
    cy.assertHiddenInput('2022-04-07')
  })


  it('ignores invalid date from user', () => {
    cy.typeDate('2022-04-0')
    cy.assertVisibleInput('2022-04-0')
    cy.assertHiddenInput('2022-04-01')
  })

})
