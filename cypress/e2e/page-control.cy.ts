
describe('Page control', () => {
  it('Main page control', () => {
    cy.visit('http://localhost:3000')
    cy.get('#navbar-logo')
      .should('be.visible')
      .click()
  })

  it('Schedule page control', () => {
    cy.visit('http://localhost:3000/schedule')
    cy.get('#navbar-logo')
      .should('be.visible')
      .click()
  })

  it('Results page control', () => {
    cy.visit('http://localhost:3000/results')
    cy.get('#navbar-logo')
      .should('be.visible')
      .click()
  })

  it('Driver Standings page control', () => {
    cy.visit('http://localhost:3000/driver-standings')
    cy.get('#navbar-logo')
      .should('be.visible')
      .click()
  })

  it('Constructor Standings page control', () => {
    cy.visit('http://localhost:3000/constructor-standings')
    cy.get('#navbar-logo')
      .should('be.visible')
      .click()
  })

  it('Drivers page control', () => {
    cy.visit('http://localhost:3000/driver')
    cy.get('#navbar-logo')
      .should('be.visible')
      .click()
  })

  it('Compare page control', () => {
    cy.visit('http://localhost:3000/compare')
    cy.get('#navbar-logo')
      .should('be.visible')
      .click()
  })

  it('Packs page control', () => {
    cy.visit('http://localhost:3000/packs')
    cy.get('#navbar-logo')
      .should('be.visible')
      .click()
  })

})

