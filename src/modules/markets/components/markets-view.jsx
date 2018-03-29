import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'

import MarketsHeader from 'modules/markets/components/markets-header/markets-header'
import MarketsList from 'modules/markets/components/markets-list'

// import getValue from 'utils/get-value'
import parseQuery from 'modules/routes/helpers/parse-query'
import isEqual from 'lodash/isEqual'

// import parsePath from 'modules/routes/helpers/parse-path'
// import makePath from 'modules/routes/helpers/make-path'

// import { FAVORITES, MARKETS } from 'modules/routes/constants/views'
import { CATEGORY_PARAM_NAME, FILTER_SEARCH_PARAM } from 'modules/filter-sort/constants/param-names'
import { TYPE_TRADE } from 'modules/market/constants/link-types'

export default class MarketsView extends Component {
  static propTypes = {
    isLogged: PropTypes.bool.isRequired,
    loginAccount: PropTypes.object.isRequired,
    markets: PropTypes.array.isRequired,
    filteredMarkets: PropTypes.array.isRequired,
    canLoadMarkets: PropTypes.bool.isRequired,
    hasLoadedMarkets: PropTypes.bool.isRequired,
    hasLoadedCategory: PropTypes.object.isRequired,
    loadMarkets: PropTypes.func.isRequired,
    loadMarketsByCategory: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    updateMarketsFilteredSorted: PropTypes.func.isRequired,
    clearMarketsFilteredSorted: PropTypes.func.isRequired,
    toggleFavorite: PropTypes.func.isRequired,
    loadMarketsInfo: PropTypes.func.isRequired,
    isMobile: PropTypes.bool,
  }

  componentWillMount() {
    const {
      canLoadMarkets,
      hasLoadedCategory,
      hasLoadedMarkets,
      loadMarkets,
      loadMarketsByCategory,
      location,
    } = this.props
    loadMarkets({
      canLoadMarkets,
      location,
      loadMarkets,
      loadMarketsByCategory,
      hasLoadedMarkets,
      hasLoadedCategory,
    })
  }

  componentWillReceiveProps(nextProps) {
    const {
      canLoadMarkets,
      hasLoadedCategory,
      hasLoadedMarkets,
      location,
    } = this.props
    if (
      (canLoadMarkets !== nextProps.canLoadMarkets && nextProps.canLoadMarkets) ||
      location !== nextProps.location ||
      !isEqual(hasLoadedCategory, nextProps.hasLoadedCategory) ||
      (hasLoadedMarkets !== nextProps.hasLoadedMarkets && !nextProps.hasLoadedMarkets)
    ) {
      loadMarkets({
        canLoadMarkets: nextProps.canLoadMarkets,
        location: nextProps.location,
        loadMarkets: nextProps.loadMarkets,
        loadMarketsByCategory: nextProps.loadMarketsByCategory,
        hasLoadedMarkets,
        hasLoadedCategory,
      })
    }
  }

  componentWillUpdate(nextProps, nextState) {
    // if (!isEqual(this.state.markets, nextState.markets)) {
    //   this.props.updateMarketsFilteredSorted(nextState.markets)
    //   checkFavoriteMarketsCount(nextState.markets, nextProps.location, nextProps.history)
    // }
  }

  componentWillUnmount() {
    const { clearMarketsFilteredSorted } = this.props
    clearMarketsFilteredSorted()
  }

  render() {
    const {
      filteredMarkets,
      history,
      isLogged,
      isMobile,
      loadMarketsInfo,
      location,
      markets,
      toggleFavorite,
    } = this.props
    return (
      <section id="markets_view">
        <Helmet>
          <title>Markets</title>
        </Helmet>
        <MarketsHeader
          isLogged={isLogged}
          location={location}
          markets={markets}
        />
        <MarketsList
          isLogged={isLogged}
          markets={markets}
          filteredMarkets={filteredMarkets}
          location={location}
          history={history}
          toggleFavorite={toggleFavorite}
          loadMarketsInfo={loadMarketsInfo}
          linkType={TYPE_TRADE}
          isMobile={isMobile}
        />
      </section>
    )
  }
}

function loadMarkets(options) {
  if (options.canLoadMarkets) {
    const category = parseQuery(options.location.search)[CATEGORY_PARAM_NAME]
    const search = parseQuery(options.location.search)[FILTER_SEARCH_PARAM]
    // Expected behavior is to load a specific category if one is present
    // else, if we aren't searching (which is a local market data search)
    // then load markets (loads all markets)
    if (category) {
      options.loadMarketsByCategory(category)
    } else if (!search) {
      options.loadMarkets()
    }
  }
}

// function checkFavoriteMarketsCount(filteredMarkets, location, history) {
//   const path = parsePath(location.pathname)[0]
//
//   if (path === FAVORITES && !filteredMarkets.length) {
//     history.push(makePath(MARKETS))
//   }
// }
