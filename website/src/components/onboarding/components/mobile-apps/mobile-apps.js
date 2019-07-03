import React, { Component } from 'react';
import styles from './mobile-apps.module.scss';
import cx from 'classnames';

export default class MobileApps extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div>
        <div className={cx(styles['title-bar'])}>
          <h2>Mobile Apps</h2>
        </div>
        <div className={cx(styles.inner)}>
          <div className={cx(styles.box)}>
            <div className={cx(styles['box-body'])}>
              <p>Arrivy's mobile apps give field crews the information they need and provide a customizable interface for reporting status Crew can capture photos, signatures and notes for the job record.</p>
              <div className="text-center">
                <img src="/images/onboarding/mobile-apps.png" alt="Mobile Apps" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
