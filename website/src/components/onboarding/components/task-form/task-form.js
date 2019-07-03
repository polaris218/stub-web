import React, { Component } from 'react';
import styles from './task-form.module.scss';
import cx from 'classnames';

export default class TaskForm extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className={cx(styles.step)}>
        <div className={cx(styles['title-bar'])}>
          <h2>Arrivy Tasks</h2>
        </div>
        <div className={cx(styles.inner)}>
          <div className={cx(styles.box)}>
            <div className={cx(styles['box-body'])}>
              <p>Tasks are one of the fundamental building blocks of Arrivy. They contain all the essential information needed to run a job--date/time, customer information and contact details, team members and equipment assignments. They also provide tools for communicating to customers.</p>
              <img src="/images/onboarding/tasks.gif" alt="Tasks" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
