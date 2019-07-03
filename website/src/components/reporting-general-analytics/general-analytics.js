import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './general-analytics.module.scss';
import cx from 'classnames';
import { Grid, Row, Col } from 'react-bootstrap';

export default class GeneralAnalytics extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'task_rating'
    };

    this.tabChangeHandler = this.tabChangeHandler.bind(this);

  }

  tabChangeHandler(newTab) {
    this.setState({
      activeTab: newTab
    });
  }

  render() {
    return (
      <div>
        <div className={styles.generalAnalyticsNavigator}>
          <ul className={styles.generalAnalyticsNavigation}>
            <li onClick={() => this.tabChangeHandler('task_rating')} className={this.state.activeTab === 'task_rating' && styles.active}>
              <div>
                Task Rating
              </div>
            </li>
            <li onClick={() => this.tabChangeHandler('start_delay')} className={this.state.activeTab === 'start_delay' && styles.active}>
              <div>
                Start Delay
              </div>
            </li>
            <li onClick={() => this.tabChangeHandler('end_delay')} className={this.state.activeTab === 'end_delay' && styles.active}>
              <div>
                End Delay
              </div>
            </li>
            <li onClick={() => this.tabChangeHandler('task_mileage')} className={this.state.activeTab === 'task_mileage' && styles.active}>
              <div>
                Mileage for Tasks
              </div>
            </li>
            <li onClick={() => this.tabChangeHandler('customer_sentiments')} className={this.state.activeTab === 'customer_sentiments' && styles.active}>
              <div>
                Customer Sentiments
              </div>
            </li>
          </ul>
        </div>
        <div className={styles.reportingBlock}>
          <div className={cx(styles.reportingBlockBody)}>
            <div id="keen-stacked-column-chart">

            </div>
          </div>
        </div>
      </div>
    );
  }

}
