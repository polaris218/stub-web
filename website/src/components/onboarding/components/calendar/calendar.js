import React, { Component } from 'react';
import styles from './calendar.module.scss';
import cx from 'classnames';

export default class Calendar extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className={cx(styles.step)}>
        <div className={cx(styles['title-bar'])}>
          <h2>Task Views</h2>
        </div>
        <div className={cx(styles.inner)}>
          <div className={cx(styles.box)}>
            <div className={cx(styles['box-body'])}>
              <p>Tasks can be viewed in a variety of different ways from traditional list and calendar view to the Team & Equipment view which shows booking thru a day.</p>
              <img src="/images/onboarding/task-views.gif" alt="Task views"/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
