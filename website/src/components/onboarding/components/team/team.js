import React, { Component } from 'react';
import styles from './team.module.scss';
import cx from 'classnames';

export default class Team extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className={cx(styles.step)}>
        <div className={cx(styles['title-bar'])}>
          <h2>The Team Tab</h2>
        </div>
        <div className={cx(styles.inner)}>
          <div className={cx(styles.box)}>
            <div className={cx(styles['box-body'])}>
              <p>The Team tab lets you designate crew members as Arrivy users. Crew members can have different roles:</p>
              <ul>
                <li><strong>Schedulers</strong> create and maintain the calendar</li>
                <li><strong>Field crew</strong> manage jobs</li>
                <li>The <strong>Limited access</strong> role is for helpers or part-time workers</li>
              </ul>
              <img src="/images/onboarding/team.gif" alt="Team" />
              <button className={cx(styles.btn, styles['btn-light'])} onClick={this.props.backToModal}>Back</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
