describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  })
})

describe('Page control', () => {
  it('should navigate between pages', () => {
    cy.visit('http://localhost:3000')
    cy.get('#navbar-logo')
      .should('be.visible')
      .click()
      .url()
      .should('include', '/')
  })
})