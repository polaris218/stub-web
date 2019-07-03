import React, { Component } from 'react';
import styles from './tabs.module.scss';
import cx from 'classnames';

export default class Tabs extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div>
        <div className={cx(styles['title-bar'])}>
          <h2>Elements of Arrivy</h2>
        </div>
        <div className={cx(styles.inner)}>
          <div className={cx(styles.box)}>
            <div className={cx(styles['box-body'])}>
              <p>In Arrivy, you work with: Tasks (Jobs), Team (Crew), and Customers. <br />Each has their own sections in Arrivy.</p>
              <div className={cx(styles.tabs, ['text-center'])}>
                <img src="/images/onboarding/tab-elements.png" alt="Tab Elements" />
              </div>
            </div>
          </div>
       </div>
      </div>
    );
  }
}
