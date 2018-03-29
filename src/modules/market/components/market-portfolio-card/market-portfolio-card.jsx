import React, { Component } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import getValue from 'utils/get-value'

import MarketPositionsListPosition from 'modules/market/components/market-positions-list--position/market-positions-list--position'
import MarketPositionsListOrder from 'modules/market/components/market-positions-list--order/market-positions-list--order'
import ChevronFlip from 'modules/common/components/chevron-flip/chevron-flip'
import MarketLink from 'modules/market/components/market-link/market-link'
import { TYPE_REPORT, TYPE_DISPUTE, TYPE_CLAIM_PROCEEDS, TYPE_MIGRATE_REP } from 'modules/market/constants/link-types'
import { dateHasPassed } from 'utils/format-date'
import CommonStyles from 'modules/market/components/common/market-common.styles'
import Styles from 'modules/market/components/market-portfolio-card/market-portfolio-card.styles'
import PositionStyles from 'modules/market/components/market-positions-list/market-positions-list.styles'

export default class MarketPortfolioCard extends Component {
  static propTypes = {
    buttonText: PropTypes.string,
    claimTradingProceeds: PropTypes.func,
    closePositionStatus: PropTypes.object.isRequired,
    isMobile: PropTypes.bool,
    linkType: PropTypes.string,
    market: PropTypes.object.isRequired,
    positionsDefault: PropTypes.bool,
  }

  static defaultProps = {
    positionsDefault: true,
  }

  constructor(props) {
    super(props)
    this.state = {
      tableOpen: {
        myPositions: this.props.positionsDefault,
        openOrders: false,
      },
    }
  }

  toggleTable(tableKey) {
    this.setState({ tableOpen: { ...this.state.tableOpen, [tableKey]: !this.state.tableOpen[tableKey] } })
  }

  render() {
    const {
      buttonText,
      isMobile,
      linkType,
      market,
    } = this.props
    const myPositionsSummary = getValue(this.props, 'market.myPositionsSummary')
    const myPositionOutcomes = getValue(this.props, 'market.outcomes')
    let localButtonText

    switch (linkType) {
      case TYPE_REPORT:
        localButtonText = 'Report'
        break
      case TYPE_DISPUTE:
        localButtonText = 'Dispute'
        break
      case TYPE_CLAIM_PROCEEDS:
        localButtonText = 'Claim Proceeds'
        break
      case TYPE_MIGRATE_REP:
        localButtonText = 'Migrate REP'
        break
      default:
        localButtonText = 'View'
    }

    return (
      <article className={CommonStyles.MarketCommon__container}>
        <section
          className={classNames(
            CommonStyles.MarketCommon__topcontent,
            Styles.MarketCard__topcontent,
          )}
        >
          <div
            className={classNames(
              CommonStyles.MarketCommon__header,
              Styles.MarketCard__header,
            )}
          >
            <div className={Styles.MarketCard__headertext}>
              <span className={Styles['MarketCard__expiration--mobile']}>
                {dateHasPassed(market.endDate.timestamp) ? 'Expired ' : 'Expires '}
                { isMobile ? market.endDate.formattedShort : market.endDate.formatted }
              </span>
              <h1 className={CommonStyles.MarketCommon__description}>
                <MarketLink
                  id={market.id}
                  formattedDescription={market.description}
                >
                  {market.description}
                </MarketLink>
              </h1>
            </div>
          </div>
          <div className={Styles.MarketCard__topstats}>
            <div className={Styles.MarketCard__leftstats}>
              <div className={Styles.MarketCard__stat}>
                <span className={Styles.MarketCard__statlabel}>
                  Realized P/L
                </span>
                <span className={Styles.MarketCard__statvalue}>
                  {getValue(myPositionsSummary, 'realizedNet.formatted')}
                </span>
                <span className={Styles.MarketCard__statunit}>
                  ETH
                </span>
              </div>
              <div className={Styles.MarketCard__stat}>
                <span className={Styles.MarketCard__statlabel}>
                  Unrealized P/L
                </span>
                <span className={Styles.MarketCard__statvalue}>
                  {getValue(myPositionsSummary, 'unrealizedNet.formatted')}
                </span>
                <span className={Styles.MarketCard__statunit}>
                  ETH
                </span>
              </div>
              <div className={Styles.MarketCard__stat}>
                <span className={Styles.MarketCard__statlabel}>
                  Total P/L
                </span>
                <span className={Styles.MarketCard__statvalue}>
                  {getValue(myPositionsSummary, 'totalNet.formatted')}
                </span>
                <span className={Styles.MarketCard__statunit}>
                  ETH
                </span>
              </div>
            </div>
            <span className={Styles.MarketCard__expiration}>
              <span className={Styles.MarketCard__expirationlabel}>
                {market.endDateLabel}
              </span>
              <span className={Styles.MarketCard__expirationvalue}>
                {getValue(market, 'endDate.formatted')}
              </span>
            </span>
          </div>
        </section>
        <section className={Styles.MarketCard__tablesection}>
          {(myPositionOutcomes || []).filter(outcome => outcome.position).length !== 0 &&
            <button
              className={Styles.MarketCard__headingcontainer}
              onClick={() => this.toggleTable('myPositions')}
            >
              <h1 className={Styles.MarketCard__tableheading}>
                My Positions
              </h1>
              <div
                className={Styles.MarketCard__tabletoggle}
              >
                <ChevronFlip pointDown={this.state.tableOpen.myPositions} />
              </div>
            </button>
          }
          <div className={PositionStyles.MarketPositionsList__table}>
            { this.state.tableOpen.myPositions && (myPositionOutcomes || []).filter(outcome => outcome.position).length > 0 &&
              <ul className={PositionStyles['MarketPositionsList__table-header']}>
                <li>Outcome</li>
                { isMobile ? <li><span>Qty</span></li> : <li><span>Quantity</span></li>}
                { isMobile ? <li><span>Avg</span></li> : <li><span>Avg Price</span></li>}
                { !isMobile && <li><span>Last Price</span></li> }
                { !isMobile && <li><span>Realized <span />P/L</span></li>}
                { !isMobile && <li><span>Unrealized <span />P/L</span></li>}
                <li><span>Total <span />P/L</span></li>
                <li><span>Action</span></li>
              </ul>
            }
            <div className={PositionStyles['MarketPositionsList__table-body']}>
              { this.state.tableOpen.myPositions && (myPositionOutcomes || []).filter(outcome => outcome.position).map(outcome => (
                <MarketPositionsListPosition
                  key={outcome.id + outcome.marketId}
                  name={outcome.name}
                  position={outcome.position}
                  openOrders={outcome.userOpenOrders ? outcome.userOpenOrders.filter(order => order.id === outcome.position.id && order.pending === true) : []}
                  isExtendedDisplay
                  isMobile={isMobile}
                />
              ))}
            </div>
          </div>
        </section>
        <section className={Styles.MarketCard__tablesection}>
          <div className={PositionStyles.MarketPositionsList__table}>
            {market.outcomes[0] && market.outcomes[0].userOpenOrders && market.outcomes[0].userOpenOrders.length !== 0 &&
              <button
                className={Styles.MarketCard__headingcontainer}
                onClick={() => this.toggleTable('openOrders')}
              >
                <h1 className={Styles.MarketCard__tableheading}>
                  Open Orders
                </h1>
                <div
                  className={Styles.MarketCard__tabletoggle}
                >
                  <ChevronFlip pointDown={this.state.tableOpen.openOrders} />
                </div>
              </button>
            }
            <div className={PositionStyles.MarketPositionsList__table}>
              { this.state.tableOpen.openOrders &&
              <ul className={PositionStyles['MarketPositionsList__table-header']}>
                <li>Outcome</li>
                { isMobile ? <li><span>Qty</span></li> : <li><span>Quantity</span></li>}
                { isMobile ? <li><span>Avg</span></li> : <li><span>Avg Price</span></li>}
                { !isMobile && <li><span>Last Price</span></li> }
                { !isMobile && <li><span>Realized <span />P/L</span></li>}
                { !isMobile && <li><span>Unrealized <span />P/L</span></li>}
                <li><span>Total <span />P/L</span></li>
                <li><span>Action</span></li>
              </ul>
              }
              <div className={PositionStyles['MarketPositionsList__table-body']}>
                { this.state.tableOpen.openOrders && (myPositionOutcomes || []).filter(outcome => outcome.userOpenOrders).map(outcome => (
                  outcome.userOpenOrders.map((order, i) => (
                    <MarketPositionsListOrder
                      key={order.id}
                      name={outcome.name}
                      order={order}
                      pending={order.pending}
                      isExtendedDisplay
                      isMobile={isMobile}
                    />
                  ))
                ))
                }
              </div>
            </div>
          </div>
        </section>
        {linkType &&
          <section className={Styles['MarketCard__tablesection-mobile']}>
            <div className={Styles['MarketCard__headingcontainer-mobile']}>
              <MarketLink
                className={Styles['MarketCard__action-mobile']}
                id={market.id}
                formattedDescription={market.description}
                linkType={linkType}
              >
                { buttonText || localButtonText }
              </MarketLink>
            </div>
          </section>
        }
      </article>
    )
  }
}
