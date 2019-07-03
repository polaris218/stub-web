import React, { Component } from 'react';
import styles from './alerts.module.scss';
import cx from 'classnames';

export default class Alerts extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div>
        <div className={cx(styles['title-bar'])}>
          <h2>Customer Experience</h2>
        </div>
        <div className={cx(styles.inner)}>
          <div className={cx(styles.box)}>
            <div className={cx(styles['box-body'])}>
              <p>Arrivy sends email/SMS messages to customers when crew are enroute and approaching customer locations. Customers can view crew route and approach on a map.</p>
              <div className="text-center">
                <img src="/images/onboarding/alerts.png" alt="Alerts" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
