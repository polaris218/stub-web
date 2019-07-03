import React, { Component } from 'react';
import styles from './activity.module.scss';
import cx from 'classnames';

export default class Activity extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className={cx(styles.step)}>
        <div className={cx(styles['title-bar'])}>
          <h2>The Activity Feed</h2>
        </div>
        <div className={cx(styles.inner)}>
          <div className={cx(styles.box)}>
            <div className={cx(styles['box-body'])}>
              <p>The Activity Feed gives Dispatch a real time readout of changes that are happening on all jobs.</p>
              <img src="/images/onboarding/activity-feed.gif" alt="Activity Feed"/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
