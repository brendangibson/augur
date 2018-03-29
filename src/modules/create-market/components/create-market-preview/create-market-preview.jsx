/* eslint react/no-array-index-key: 0 */ // due to potential for dup orders

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { WrappedBigNumber } from 'utils/wrapped-big-number'

import { BINARY, CATEGORICAL, SCALAR } from 'modules/markets/constants/market-types'

import { CreateMarketEdit } from 'modules/common/components/icons'

import CreateMarketPreviewRange from 'modules/create-market/components/create-market-preview-range/create-market-preview-range'
import CreateMarketPreviewCategorical from 'modules/create-market/components/create-market-preview-categorical/create-market-preview-categorical'
import { dateHasPassed, formatDate } from 'utils/format-date'
import Styles from 'modules/create-market/components/create-market-preview/create-market-preview.styles'

export default class CreateMarketPreview extends Component {

  static propTypes = {
    newMarket: PropTypes.object.isRequired,
  }

  static getExpirationDate(p) {
    if (!Object.keys(p.newMarket.endDate).length) {
      return '-'
    }

    const endDate = moment(p.newMarket.endDate.timestamp * 1000)
    endDate.set({
      hour: p.newMarket.hour,
      minute: p.newMarket.minute,
    })

    if (p.newMarket.meridiem === 'AM' && endDate.hours() >= 12) {
      endDate.hours(endDate.hours() - 12)
    } else if (p.newMarket.meridiem === 'PM' && endDate.hours() < 12) {
      endDate.hours(endDate.hours() + 12)
    }
    p.newMarket.endDate = formatDate(endDate.toDate())
    return endDate.format('MMM D, YYYY h:mm a')
  }

  static calculateShares(orderBook) {
    let totalShares = WrappedBigNumber(0)
    if (Object.keys(orderBook).length) {
      Object.keys(orderBook).forEach((option) => {
        orderBook[option].forEach((order) => {
          totalShares = totalShares.plus(order.quantity)
        })
      })
      return `${totalShares} Shares`
    }
    return '- Shares'
  }

  constructor(props) {
    super(props)

    this.state = {
      expirationDate: CreateMarketPreview.getExpirationDate(props),
      shares: CreateMarketPreview.calculateShares(this.props.newMarket.orderBook),
    }

    CreateMarketPreview.getExpirationDate = CreateMarketPreview.getExpirationDate.bind(this)
    CreateMarketPreview.calculateShares = CreateMarketPreview.calculateShares.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    const { newMarket } = this.props
    if (newMarket.endDate !== nextProps.newMarket.endDate ||
        newMarket.hour !== nextProps.newMarket.hour ||
        newMarket.minute !== nextProps.newMarket.minute ||
        newMarket.meridiem !== nextProps.newMarket.meridiem) {
      this.setState({ expirationDate: CreateMarketPreview.getExpirationDate(nextProps) })
    }
    if (newMarket.orderBook !== nextProps.newMarket.orderBook) {
      this.setState({ shares: CreateMarketPreview.calculateShares(nextProps.newMarket.orderBook) })
    }
  }

  render() {
    const { newMarket } = this.props
    const s = this.state

    return (
      <article className={Styles.CreateMarketPreview}>
        <div className={Styles.CreateMarketPreview__header}>
          <div className={Styles['CreateMarketPreview__header-wrapper']}>
            <div className={Styles.CreateMarketPreview__tags}>
              <ul>
                <li>Categories</li>
                <li>{newMarket.category}</li>
              </ul>
              <ul>
                <li>Tags</li>
                <li>{newMarket.tag1}</li>
                <li>{newMarket.tag2}</li>
              </ul>
            </div>
            <h1 className={Styles.CreateMarketPreview__description}>{newMarket.description || 'New Market Question'}</h1>
            <div className={Styles.CreateMarketPreview__outcome}>
              { (newMarket.type === BINARY || newMarket.type === SCALAR) &&
                <CreateMarketPreviewRange
                  newMarket={newMarket}
                />
              }
              { newMarket.type === CATEGORICAL && newMarket.outcomes.length > 0 &&
                <CreateMarketPreviewCategorical
                  newMarket={newMarket}
                />
              }
              { (newMarket.type === '' || (newMarket.type === CATEGORICAL && newMarket.outcomes.length === 0)) && 'Outcome' }
            </div>
            <span className={Styles.CreateMarketPreview__icon}>
              {CreateMarketEdit}
            </span>
          </div>
        </div>
        <div className={Styles.CreateMarketPreview__footer}>
          <div className={Styles['CreateMarketPreview__footer-wrapper']}>
            <ul className={Styles.CreateMarketPreview__meta}>
              <li>
                <span>Volume</span>
                <span>{ s.shares }</span>
              </li>
              <li>
                <span>Fee</span>
                <span>{ newMarket.settlementFee ? newMarket.settlementFee : '0.0'}%</span>
              </li>
              <li>
                <span>{dateHasPassed(newMarket.endDate.timestamp) ? 'Expired' : 'Expires'}</span>
                <span>{ s.expirationDate }</span>
              </li>
            </ul>
          </div>
        </div>
      </article>
    )
  }
}
