import React from 'react'
import WavesBackground from './WavesBackground'

describe('<WavesBackground />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<WavesBackground />)
  })
})