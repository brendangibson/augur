import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'

import MarketHeader from 'modules/market/containers/market-header'
import MarketOutcomesChart from 'modules/market/containers/market-outcomes-chart'
import MarketOutcomeCharts from 'modules/market/containers/market-outcome-charts'
import MarketOutcomesAndPositions from 'modules/market/containers/market-outcomes-and-positions'
import MarketTrading from 'modules/trade/containers/trading'

import parseMarketTitle from 'modules/market/helpers/parse-market-title'

import { CATEGORICAL } from 'modules/markets/constants/market-types'
import { BUY } from 'modules/transactions/constants/types'

import Styles from 'modules/market/components/market-view/market-view.styles'

export default class MarketView extends Component {
  static propTypes = {
    marketId: PropTypes.string.isRequired,
    isConnected: PropTypes.bool.isRequired,
    loadFullMarket: PropTypes.func.isRequired,
    description: PropTypes.string.isRequired,
    marketType: PropTypes.string,
    loadingState: PropTypes.any,
  }

  constructor(props) {
    super(props)

    this.DEFAULT_ORDER_PROPERTIES = {
      orderPrice: '',
      orderQuantity: '',
      selectedNav: BUY,
    }

    this.state = {
      selectedOutcome: props.marketType === CATEGORICAL ? null : '1',
      selectedOrderProperties: this.DEFAULT_ORDER_PROPERTIES,
    }

    this.updateSelectedOutcome = this.updateSelectedOutcome.bind(this)
    this.updateSeletedOrderProperties = this.updateSeletedOrderProperties.bind(this)
    this.clearSelectedOutcome = this.clearSelectedOutcome.bind(this)
  }

  componentWillMount() {
    const {
      isConnected,
      loadFullMarket,
      loadingState,
      marketId,
    } = this.props
    if (
      isConnected &&
      loadingState === null &&
      !!marketId
    ) {
      loadFullMarket(marketId)
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const {
      isConnected,
      loadingState,
      marketId,
    } = this.props
    if (
      (
        isConnected !== nextProps.isConnected ||
        loadingState !== nextProps.loadingState
      ) &&
      (
        nextProps.isConnected &&
        nextProps.loadingState === null &&
        !!nextProps.marketId
      )
    ) {
      nextProps.loadFullMarket(marketId)
    }
  }

  updateSelectedOutcome(selectedOutcome) {
    const { marketType } = this.props
    this.setState({
      selectedOutcome: selectedOutcome === this.state.selectedOutcome && marketType === CATEGORICAL ?
        null :
        selectedOutcome,
    })
  }

  updateSeletedOrderProperties(selectedOrderProperties) {
    this.setState({
      selectedOrderProperties: {
        ...this.DEFAULT_ORDER_PROPERTIES,
        ...selectedOrderProperties,
      },
    })
  }

  clearSelectedOutcome() {
    this.setState({ selectedOutcome: null })
  }

  render() {
    const {
      description,
      marketId,
    } = this.props
    const s = this.state

    return (
      <section>
        <Helmet>
          <title>{parseMarketTitle(description)}</title>
        </Helmet>
        <div className={Styles.Market__upper}>
          <MarketHeader
            marketId={marketId}
            selectedOutcome={s.selectedOutcome}
            updateSelectedOutcome={this.updateSelectedOutcome}
            clearSelectedOutcome={this.clearSelectedOutcome}
          />
          {s.selectedOutcome === null &&
            <MarketOutcomesChart
              marketId={marketId}
              selectedOutcome={s.selectedOutcome}
              updateSelectedOutcome={this.updateSelectedOutcome}
            />
          }
          {s.selectedOutcome !== null &&
            <MarketOutcomeCharts
              marketId={marketId}
              selectedOutcome={s.selectedOutcome}
              updateSeletedOrderProperties={this.updateSeletedOrderProperties}
            />
          }
        </div>
        <section className={Styles.Market__details}>
          <div className={Styles['Market__details-outcomes']}>
            <MarketOutcomesAndPositions
              marketId={marketId}
              selectedOutcome={s.selectedOutcome}
              updateSelectedOutcome={this.updateSelectedOutcome}
            />
          </div>
          <div className={Styles['Market__details-trading']}>
            <MarketTrading
              marketId={marketId}
              selectedOutcome={s.selectedOutcome}
              selectedOrderProperties={s.selectedOrderProperties}
            />
          </div>
        </section>
      </section>
    )
  }
}
