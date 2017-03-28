import React, { PropTypes, Component } from 'react';
import Highcharts from 'highcharts';
import noData from 'highcharts/modules/no-data-to-display';

import { BIDS, ASKS } from 'modules/order-book/constants/order-book-order-types';

import debounce from 'utils/debounce';
import getValue from 'utils/get-value';

export default class OrderBookChart extends Component {
  static propTypes = {
    orderBookSeries: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.updateChart = debounce(this.updateChart.bind(this));
  }

  componentDidMount() {
    noData(Highcharts);

    this.orderBookChart = new Highcharts.Chart('order_book_chart', {
      title: {
        text: null
      },
      chart: {
        height: 300
      },
      lang: {
        noData: 'No orders to display'
      },
      yAxis: {
        title: {
          text: 'Shares'
        }
      },
      xAxis: {
        title: {
          text: 'Price'
        }
      },
      series: [
        {
          type: 'area',
          name: 'Bids',
          step: 'right',
          data: []
        },
        {
          type: 'area',
          name: 'Asks',
          step: 'left',
          data: []
        }
      ],
      credits: {
        enabled: false
      }
    });

    window.addEventListener('resize', this.updateChart);

    this.updateChart();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.orderBookSeries !== this.props.orderBookSeries) this.updateChart();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateChart);
  }

  updateChart() {
    console.log('### updateChart -- ', this.props.orderBookSeries, BIDS, ASKS);

    const bidSeries = getValue(this.props, `orderBookSeries.${BIDS}`) || [];
    const askSeries = getValue(this.props, `orderBookSeries.${ASKS}`) || [];

    this.orderBookChart.series[0].setData(bidSeries, false);
    this.orderBookChart.series[1].setData(askSeries, false);

    this.orderBookChart.redraw();
  }

  render() {
    return (
      <articles
        id="order_book_chart"
        className="order-book-chart"
      />
    );
  }
}