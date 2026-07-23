describe('Driver Profile E2E Tests', () => {

    it('Search for a driver from the main page', () => {
        cy.visit('http://localhost:3000/driver')
        cy.wait(1000)
        cy.get('.driver-search-input').type('lance stroll')

        cy.get('.driver-search-results').should('be.visible')
        cy.get('.driver-search-item').contains('Lance Stroll', { matchCase: false }).click()

        cy.url().should('include', '/driver/')
        cy.get('#driver-hero').should('be.visible')
        cy.get('.driver-hero-name').contains('Stroll', { matchCase: false }).should('be.visible')
    })

    describe('Profile interactions', () => {
        beforeEach(() => {
            cy.visit('http://localhost:3000/driver/stroll')
        })

        it('Display driver statistics properly fetched from API', () => {
            cy.get('.driver-stats-grid').should('be.visible')

            cy.get('.driver-stat-card').eq(0).find('.driver-stat-value', { timeout: 15000 }).should('not.have.text', '--')
            cy.get('.driver-stat-card').eq(1).find('.driver-stat-value', { timeout: 15000 }).should('not.have.text', '--')
            cy.get('.driver-stat-card').eq(2).find('.driver-stat-value', { timeout: 15000 }).should('not.have.text', '--')
            cy.get('.driver-stat-card').eq(3).find('.driver-stat-value', { timeout: 15000 }).should('not.have.text', '--')
        })

        it('Filter past race results by season and navigate to race details', () => {
            cy.wait(1000)
            cy.get('.season-selector-btn').click({ force: true })
            cy.get('.season-dropdown').should('be.visible')

            cy.get('.season-dropdown-item').contains('2024').click()

            cy.get('.results-loading', { timeout: 15000 }).should('not.exist')
            cy.get('.results-table-flat', { timeout: 15000 }).should('be.visible')

            cy.get('.driver-gp-link').first().click()

            cy.url().should('include', '/results/2024/')
            cy.get('.results-label').contains('Results').should('be.visible')
        })
    })
})
