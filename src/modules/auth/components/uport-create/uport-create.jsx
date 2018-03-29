import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Connect } from 'uport-connect'
import QRCode from 'qrcode.react'

import { AppleAppStore, GooglePlayStore } from 'modules/common/components/icons'

import debounce from 'utils/debounce'
import getValue from 'utils/get-value'

import { decode } from 'mnid'

import Styles from 'modules/auth/components/uport-create/uport-create.styles'

export default class UportCreate extends Component {
  static propTypes = {
    isMobile: PropTypes.bool.isRequired,
    login: PropTypes.func.isRequired,
  }

  constructor() {
    super()

    this.uPort = new Connect(
      'AUGUR -- DEV',
      {
        clientId: '2ofGiHuZhhpDMAQeDxjoDhEsUQd1MayECgd',
      },
    )

    this.state = {
      uri: '',
      qrSize: 0,
    }

    this.uPortURIHandler = this.uPortURIHandler.bind(this)
    this.setQRSize = this.setQRSize.bind(this)
    this.debouncedSetQRSize = debounce(this.setQRSize.bind(this))
  }

  componentWillMount() {
    const { login } = this.props
    this.uPort.requestCredentials(
      {
        notifcations: true,
      },
      this.uPortURIHandler,
    )
      .then((account) => {
        login(decode(account.address), this.uPort.sendTransaction)
      })
  }

  componentDidMount() {
    this.setQRSize()

    window.addEventListener('resize', this.debouncedSetQRSize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedSetQRSize)
  }

  setQRSize() {
    const { isMobile } = this.props
    const width = getValue(this, 'uPortCreateQR.clientWidth')
    const height = getValue(this, 'uPortCreateQR.clientHeight')

    if (width > height) { // Height is the constraining value
      this.setState({ qrSize: isMobile ? height / 1.2 : height / 1.2 })
    } else { // Width is the constraining value
      this.setState({ qrSize: isMobile ? width / 1.2 : width / 3 })
    }
  }

  uPortURIHandler(uri) {
    this.setState({ uri })
  }

  render() {
    const s = this.state

    return (
      <section
        className={Styles.Uport__create}
      >
        <h3>Create a uPort Account</h3>
        <h4>1. Download the uPort App + Create Account</h4>
        <div
          className={Styles.Uport__apps}
        >
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://play.google.com/store/apps/details?id=com.uportMobile"
          >
            <GooglePlayStore />
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://itunes.apple.com/us/app/uport-id/id1123434510"
          >
            <AppleAppStore />
          </a>
        </div>
        <h4>2. Scan the QR Code</h4>
        <div
          ref={(uPortCreateQR) => { this.uPortCreateQR = uPortCreateQR }}
          className={Styles.Uport__qr}
        >
          <QRCode
            value={s.uri}
            size={s.qrSize}
          />
        </div>
      </section>
    )
  }
}
