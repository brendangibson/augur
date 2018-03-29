import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'

import MarketsList from 'modules/markets/components/markets-list'

import { TYPE_CLOSED } from 'modules/market/constants/link-types'

import Styles from 'modules/reporting/components/reporting-closed/reporting-closed.styles'

export default class ReportingClosed extends Component {
  static propTypes = {
    markets: PropTypes.array.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    toggleFavorite: PropTypes.func.isRequired,
    loadMarketsInfo: PropTypes.func.isRequired,
    isLogged: PropTypes.bool.isRequired,
    isMobile: PropTypes.bool,
  }

  constructor(props) {
    super(props)

    this.state = {
      filteredMarketsClosed: [0, 1],
    }
  }

  render() {
    const {
      history,
      isLogged,
      loadMarketsInfo,
      location,
      markets,
      toggleFavorite,
    } = this.props
    const s = this.state

    return (
      <section>
        <Helmet>
          <title>Reporting: Closed</title>
        </Helmet>
        <h1 className={Styles.ReportingClosed__heading}>
          Reporting: Closed
        </h1>
        <MarketsList
          isLogged={isLogged}
          markets={markets}
          filteredMarkets={s.filteredMarketsClosed}
          location={location}
          history={history}
          toggleFavorite={toggleFavorite}
          loadMarketsInfo={loadMarketsInfo}
          linkType={TYPE_CLOSED}
          paginationPageParam="reporting-closed-page"
        />
      </section>
    )
  }
}
