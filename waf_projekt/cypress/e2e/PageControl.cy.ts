
describe('Page control', () => {
  it('Main page control', () => {
    cy.visit('http://localhost:3000')
    cy.get('#navbar-logo')
      .should('be.visible')
      .click()
  })
  /*
  it('Schedule page control', () => {

  })
  */
})

