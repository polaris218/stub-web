import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './sentiments-graph.module.scss';
import Keen from 'keen-js';
import { Row, Col, FormControl } from 'react-bootstrap';

export default class SentimentsGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      profile: null,
      dailyInterval: 'this_24_hours',
      weeklyInterval: 'this_7_days',
      monthlyInterval: 'this_30_days',
    };

    this.generateSentimentsGraph = this.generateSentimentsGraph.bind(this);
  }

  componentDidMount() {
    this.generateSentimentsGraph();
  }

  generateSentimentsGraph() {
    const client = new Keen({
      projectId: '5a47257446e0fb00018e2cf7',
      readKey: '55FB4DAEB1012EF9273FC290916E6321BDD1B76A13D11BDEDB73766B3B8106612F5E98F9436BFAD669E26E60BABABA2FA2053F9B9211572AFF38F70DD2FECB7EB504A13AD1013C387781B58E0336BC64A0E12616C27F8333D3762B8BB15DF89A'
    });

    let timeFrame = this.state.monthlyInterval;
    if (this.state.viewType === 'daily') {
      timeFrame = this.state.dailyInterval;
    } else if (this.state.viewType === 'weekly') {
      timeFrame = this.state.weeklyInterval;
    } else {
      timeFrame = this.state.monthlyInterval;
    }
    Keen.ready(function () {
      const element = document.getElementById('sentimentsGraph');
      const chart = new Keen.Dataviz()
        .el(element)
        .height(400)
        .title('Customer Notes Sentiments')
        .type('linechart')
        .prepare();
      client
        .query('sum', {
          event_collection: 5629499534213120 + '',
          filters: [
            { 'operator':'eq', 'property_name':'owner', 'property_value':5629499534213120 },
            { 'operator':'exists', 'property_name':'customer_note_sentiment_original_value', 'property_value':true }],
          interval: 'daily',
          target_property: 'customer_note_sentiment_original_value',
          timeframe: timeFrame,
          timezone: 18000
        })
        .then(res => {
          chart
            .data(res)
            .title(null)
            .render();
        })
        .catch(err => {
          chart
            .message(err.message);
        });
    });
  }

  updateReportDuration(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      viewType: e.target.value
    }, () => { this.generateSentimentsGraph(); });
  }

  render() {
    return (
      <div className={styles.mileageGraphContainer}>
        <div className={styles.reportingBlockContainer}>
          <div className={styles.reportingBlockHeader}>
            <Row>
              <Col md={9} sm={6} xs={12}>
                <h3>
                  Customer Notes Sentiments
                </h3>
              </Col>
              <Col md={3} sm={6} xs={12} className={styles.customSelectElement}>
                <FormControl onChange={(e) => this.updateReportDuration(e)} defaultValue="monthly" componentClass="select">
                  <option value="monthly" selected={this.state.viewType === 'monthly'}>Last 30 Days</option>
                  <option value="weekly" selected={this.state.viewType === 'weekly'}>Last 7 Days</option>
                  <option value="daily" selected={this.state.viewType === 'daily'}>Last 24 Hours</option>
                </FormControl>
              </Col>
            </Row>
          </div>
          <div className={styles.reportingBlockBody}>
            <div id="sentimentsGraph"></div>
          </div>
        </div>
      </div>
    );
  }

}

SentimentsGraph.propTypes = {
  profile: PropTypes.object
};
