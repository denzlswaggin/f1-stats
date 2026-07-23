describe('Constructor Standings Page E2E Tests', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/constructor-standings')
    })

    it('Load season info', () => {
        cy.get('#constructor-standings-header').should('be.visible').contains('Constructor Standings')
        cy.get('#season-info').should('be.visible').contains('Live standings')
    })

    it('Display constructor standings with correct headers', () => {
        cy.get('#constructors-standings').should('be.visible')
        cy.get('.standings-table').should('be.visible')

        cy.get('.standings-table thead tr').within(() => {
            cy.get('th').eq(0).contains('#')
            cy.get('th').eq(1).contains('Team')
            cy.get('th').eq(2).contains('PTS')
        })
    })

    it('Display list of constructors', () => {
        cy.get('.standings-table tbody tr').should('have.length.greaterThan', 5)

        cy.get('.standings-table tbody tr').first().within(() => {
            cy.get('td').eq(0).should('not.be.empty')
            cy.get('.driver-name').should('be.visible')
            cy.get('td').eq(2).should('not.be.empty')
        })
    })
})
