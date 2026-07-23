describe('Driver Standings Page E2E Tests', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/driver-standings')
    })

    it('Load season info', () => {
        cy.get('#driver-standings-header').should('be.visible').contains('Driver Standings')
        cy.get('#season-info').should('be.visible').contains('Live standings')
    })

    it('Display driver standings with correct headers', () => {
        cy.get('#drivers-standings').should('be.visible')
        cy.get('.standings-table').should('be.visible')

        cy.get('.standings-table thead tr').within(() => {
            cy.get('th').eq(0).contains('#')
            cy.get('th').eq(1).contains('Driver')
            cy.get('th').eq(2).contains('Team')
            cy.get('th').eq(3).contains('PTS')
        })
    })

    it('Display list of drivers', () => {

        cy.get('.standings-table tbody tr').should('have.length.greaterThan', 10)

        cy.get('.standings-table tbody tr').first().within(() => {
            cy.get('td').eq(0).should('not.be.empty')
            cy.get('.driver-name').should('be.visible')
            cy.get('.team-name').should('be.visible')
            cy.get('td').eq(3).should('not.be.empty')
        })
    })

    it('Navigate to driver profile when clicked', () => {
        cy.get('.standings-table tbody tr').first().within(() => {
            cy.get('.driver-link').click()
        })

        cy.url().should('include', '/driver/')

        cy.get('#driver-hero').should('be.visible')
    })
})
