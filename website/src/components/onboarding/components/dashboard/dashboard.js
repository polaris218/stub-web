import React, { Component } from 'react';
import styles from './dashboard.module.scss';
import cx from 'classnames';

export default class Dashboard extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className={cx(styles.step)}>
        <div className={cx(styles['title-bar'])}>
          <h2>The Dashboard</h2>
        </div>
        <div className={cx(styles.inner)}>
          <div className={cx(styles.box)}>
            <div className={cx(styles['box-body'])}>
              <p>The Dashboard is the control center for Dispatch in Arrivy. From the Dashboard, you can see all customer and crew members locations in real time. The Dashboard can be viewed as a set of flat Tasks or as groups of Routes.</p>
              <img src="/images/onboarding/dashboard.gif" alt="Dashboard"/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
