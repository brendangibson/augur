/* eslint react/no-array-index-key: 0 */ // It's OK in this specific instance as order remains the same

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import CreateMarketDefine from 'modules/create-market/components/create-market-form-define/create-market-form-define'
import CreateMarketOutcome from 'modules/create-market/components/create-market-form-outcome/create-market-form-outcome'
import CreateMarketResolution from 'modules/create-market/components/create-market-form-resolution/create-market-form-resolution'
import CreateMarketLiquidity from 'modules/create-market/components/create-market-form-liquidity/create-market-form-liquidity'
import CreateMarketReview from 'modules/create-market/components/create-market-form-review/create-market-form-review'

import Styles from 'modules/create-market/components/create-market-form/create-market-form.styles'

export default class CreateMarketForm extends Component {

  static propTypes = {
    addOrderToNewMarket: PropTypes.func.isRequired,
    availableEth: PropTypes.string.isRequired,
    availableRep: PropTypes.string.isRequired,
    categories: PropTypes.array.isRequired,
    currentTimestamp: PropTypes.number.isRequired,
    history: PropTypes.object.isRequired,
    isBugBounty: PropTypes.bool.isRequired,
    isMobileSmall: PropTypes.bool.isRequired,
    meta: PropTypes.object,
    newMarket: PropTypes.object.isRequired,
    removeOrderFromNewMarket: PropTypes.func.isRequired,
    submitNewMarket: PropTypes.func.isRequired,
    universe: PropTypes.object.isRequired,
    updateNewMarket: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      pages: ['Define', 'Outcome', 'Resolution', 'Liquidity', 'Review'],
    }

    this.prevPage = this.prevPage.bind(this)
    this.nextPage = this.nextPage.bind(this)
    this.validateField = this.validateField.bind(this)
    this.validateNumber = this.validateNumber.bind(this)
    this.isValid = this.isValid.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    const {
      newMarket,
      updateNewMarket,
    } = this.props
    if (newMarket.currentStep !== nextProps.newMarket.currentStep && nextProps.newMarket.currentStep !== 4) {
      updateNewMarket({ isValid: this.isValid(nextProps.newMarket.currentStep) })
    }
  }

  prevPage() {
    const {
      newMarket,
      updateNewMarket,
    } = this.props
    const newStep = newMarket.currentStep <= 0 ? 0 : newMarket.currentStep - 1
    updateNewMarket({ currentStep: newStep })
  }

  nextPage() {
    const {
      newMarket,
      updateNewMarket,
    } = this.props
    const newStep = newMarket.currentStep >= (this.state.pages.length - 1) ? this.state.pages.length - 1 : newMarket.currentStep + 1
    updateNewMarket({ currentStep: newStep })
  }

  validateField(fieldName, value, maxLength) {
    const {
      newMarket,
      updateNewMarket,
    } = this.props
    const { currentStep } = newMarket

    const updatedMarket = { ...newMarket }

    switch (true) {
      case typeof value === 'string' && !value.length:
        updatedMarket.validations[currentStep][fieldName] = 'This field is required.'
        break
      case maxLength && value.length > maxLength:
        updatedMarket.validations[currentStep][fieldName] = `Maximum length is ${maxLength}.`
        break
      default:
        updatedMarket.validations[currentStep][fieldName] = true
    }

    updatedMarket[fieldName] = value
    updatedMarket.isValid = this.isValid(currentStep)

    updateNewMarket(updatedMarket)
  }

  validateNumber(
    fieldName,
    rawValue,
    humanName,
    min,
    max,
    decimals = 0,
    leadingZero = false,
  ) {
    const {
      newMarket,
      updateNewMarket,
    } = this.props
    const updatedMarket = { ...newMarket }
    const { currentStep } = newMarket

    let value = rawValue

    if (value !== '') {
      value = parseFloat(value)
      value = parseFloat(value.toFixed(decimals))
    }

    switch (true) {
      case value === '':
        updatedMarket.validations[currentStep][fieldName] = `The ${humanName} field is required.`
        break
      case (value > max || value < min):
        updatedMarket.validations[currentStep][fieldName] = `${humanName}`.charAt(0).toUpperCase()
        updatedMarket.validations[currentStep][fieldName] += `${humanName} must be between ${min} and ${max}.`.slice(1)
        break
      default:
        updatedMarket.validations[currentStep][fieldName] = true
        break
    }

    if (leadingZero && value < 10) {
      value = `0${value}`
    }

    updatedMarket[fieldName] = typeof value === 'number' ? value.toString() : value
    updatedMarket.isValid = this.isValid(currentStep)

    updateNewMarket(updatedMarket)
  }

  isValid(currentStep) {
    const { newMarket } = this.props
    const validations = newMarket.validations[currentStep]
    const validationsArray = Object.keys(validations)
    return validationsArray.every(key => validations[key] === true)
  }

  render() {
    const {
      addOrderToNewMarket,
      availableEth,
      availableRep,
      categories,
      currentTimestamp,
      history,
      isBugBounty,
      isMobileSmall,
      meta,
      newMarket,
      removeOrderFromNewMarket,
      submitNewMarket,
      universe,
      updateNewMarket,
    } = this.props
    const s = this.state

    return (
      <article className={Styles.CreateMarketForm}>
        <div className={Styles['CreateMarketForm__form-outer-wrapper']}>
          <div className={Styles['CreateMarketForm__form-inner-wrapper']}>
            { newMarket.currentStep === 0 &&
              <CreateMarketDefine
                newMarket={newMarket}
                updateNewMarket={updateNewMarket}
                validateField={this.validateField}
                categories={categories}
                isValid={this.isValid}
                isBugBounty={isBugBounty}
              />
            }
            { newMarket.currentStep === 1 &&
              <CreateMarketOutcome
                newMarket={newMarket}
                updateNewMarket={updateNewMarket}
                validateField={this.validateField}
                isValid={this.isValid}
                isMobileSmall={isMobileSmall}
              />
            }
            { newMarket.currentStep === 2 &&
              <CreateMarketResolution
                newMarket={newMarket}
                updateNewMarket={updateNewMarket}
                validateField={this.validateField}
                validateNumber={this.validateNumber}
                isValid={this.isValid}
                isMobileSmall={isMobileSmall}
                currentTimestamp={currentTimestamp}
              />
            }
            { newMarket.currentStep === 3 &&
              <CreateMarketLiquidity
                newMarket={newMarket}
                updateNewMarket={updateNewMarket}
                validateNumber={this.validateNumber}
                addOrderToNewMarket={addOrderToNewMarket}
                removeOrderFromNewMarket={removeOrderFromNewMarket}
                availableEth={availableEth}
                isMobileSmall={isMobileSmall}
              />
            }
            { newMarket.currentStep === 4 &&
              <CreateMarketReview
                meta={meta}
                newMarket={newMarket}
                availableEth={availableEth}
                availableRep={availableRep}
                universe={universe}
              />
            }
          </div>
          <div className={Styles['CreateMarketForm__button-outer-wrapper']}>
            <div className={Styles['CreateMarketForm__button-inner-wrapper']}>
              <div className={Styles.CreateMarketForm__navigation}>
                <button
                  className={classNames(Styles.CreateMarketForm__prev, { [`${Styles['hide-button']}`]: newMarket.currentStep === 0 })}
                  onClick={this.prevPage}
                >Previous: {s.pages[newMarket.currentStep - 1]}
                </button>
                { newMarket.currentStep < 4 &&
                  <button
                    className={classNames(Styles.CreateMarketForm__next, { [`${Styles['hide-button']}`]: newMarket.currentStep === s.pages.length - 1 })}
                    disabled={!newMarket.isValid}
                    onClick={newMarket.isValid ? this.nextPage : null}
                  >Next: {s.pages[newMarket.currentStep + 1]}
                  </button>
                }
                { newMarket.currentStep === 4 &&
                  <button
                    className={Styles.CreateMarketForm__submit}
                    disabled={isBugBounty}
                    onClick={e => submitNewMarket(newMarket, history)}
                  >Submit
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      </article>
    )
  }
}
