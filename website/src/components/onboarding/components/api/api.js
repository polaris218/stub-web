import React, { Component } from 'react';
import styles from './api.module.scss';
import cx from 'classnames';

export default class API extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div>
        <div className={cx(styles['title-bar'])}>
          <h2>Integrating Arrivy</h2>
        </div>
        <div className={cx(styles.inner)}>
          <div className={cx(styles.box)}>
            <div className={cx(styles['box-body'])}>
              <p>Arrivy is built on a well-designed set of REST APIs which allows it to be easily integrated into existing systems within a week. It also supports a variety of out-of-the box CRMs and devices.</p>
              <div className="text-center">
                <img src="/images/onboarding/integration-2.png" alt="Arrivy integration" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
