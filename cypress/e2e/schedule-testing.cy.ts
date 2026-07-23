describe('Schedule Page E2E Tests', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/schedule')
    })

    it('Schedule header and season selector', () => {
        cy.get('#schedule-header').should('be.visible').contains('Schedule')
        cy.get('.schedule-season-selector').should('be.visible')
    })

    it('List of current season races', () => {
        cy.get('.schedule-race-list').should('be.visible')

        cy.get('.schedule-race-row').should('have.length.greaterThan', 10)

        cy.get('.schedule-race-row').first().within(() => {
            cy.get('.schedule-round').should('be.visible')
            cy.get('.schedule-race-name').should('be.visible')
            cy.get('.schedule-race-details').should('be.visible')
            cy.get('.schedule-status').should('be.visible')
        })
    })

    it('Changing season via. dropdown', () => {
        cy.wait(1000)

        cy.get('.schedule-season-btn').click({ force: true })
        cy.get('.schedule-season-dropdown').should('be.visible')

        cy.get('.schedule-season-dropdown-item').contains('2023').click()

        cy.url().should('include', '/schedule/2023')

        cy.get('.schedule-race-list').should('be.visible')

        cy.get('.schedule-race-count').should('contain.text', '2023')
    })

    it('Navigation to race result when clicked', () => {
        cy.get('.schedule-race-list').should('be.visible')

        cy.get('.schedule-race-row-link').first().click()

        cy.url().should('include', '/results/')

        cy.get('.results-label').contains('Results').should('be.visible')
    })

    it('Navigation to driver profile from race result', () => {
        cy.get('.schedule-race-list').should('be.visible')
        cy.get('.schedule-status-badge.completed').first().closest('.schedule-race-row-link').click()

        cy.url().should('include', '/results/')
        cy.get('.results-table').should('be.visible')

        cy.get('.results-driver-link').first().click()

        cy.url().should('include', '/driver/')
        cy.get('#driver-hero').should('be.visible')
    })
})