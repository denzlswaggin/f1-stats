describe('Schedule control', () => {
    it('Schedule page control', () => {
        cy.visit('http://localhost:3000/schedule')
        cy.get('#schedule-header')
            .should('be.visible')
            .click()
    })

})