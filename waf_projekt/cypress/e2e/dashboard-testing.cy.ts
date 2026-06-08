describe('Dashboard Page E2E Tests', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/')
    })

    it('Load dashboard header and season info', () => {
        cy.get('#dashboard-header').should('be.visible').contains('Dashboard – Season Overview')
        cy.get('#season-info').should('be.visible').contains('Live standings')
    })

    it('Display the next race card and countdown', () => {
        cy.get('#next-race-card').should('be.visible')

        cy.get('#next-race-card').within(() => {
            cy.get('.next-race-label').contains('Next Race')
            cy.get('#next-race-name').should('not.be.empty')
            cy.get('.next-race-circuit').should('not.be.empty')
            cy.get('.countdown').should('be.visible')
            cy.get('.countdown-unit').should('have.length', 4) // Days, Hours, Mins, Secs
            cy.get('.next-race-info').contains('Race start:')
        })
    })

    it('Display both drivers and constructors standings tables', () => {
        cy.get('.standings-grid').should('be.visible')

        cy.get('.standings-table').should('have.length', 2)

        cy.get('.standings-table').eq(0).within(() => {
            cy.get('thead th').eq(1).contains('Driver')
            cy.get('tbody tr').should('have.length.greaterThan', 4) // Show top 5 drivers
        })

        cy.get('.standings-table').eq(1).within(() => {
            cy.get('thead th').eq(1).contains('Team')
            cy.get('tbody tr').should('have.length.greaterThan', 4) // Show top 5 teams
        })
    })

    it('Navigate to full Driver Standings page when clicking the header', () => {
        cy.get('#drivers-standings .standings-header').click()
        cy.url().should('include', '/driver-standings')
        cy.get('#driver-standings-header').should('be.visible')
    })

    it('Navigate to full Constructor Standings page when clicking the header', () => {
        cy.get('#constructors-standings .standings-header').click()
        cy.url().should('include', '/constructor-standings')
        cy.get('#constructor-standings-header').should('be.visible')
    })
})
