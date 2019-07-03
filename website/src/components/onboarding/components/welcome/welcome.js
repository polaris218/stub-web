import React, { Component } from 'react';
import styles from './welcome.module.scss';
import cx from 'classnames';

export default class Welcome extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div>
        <div className={cx(styles['title-bar'])}>
          <img src='/images/logo-dark.png' alt='Arrivy' />
        </div>
        <div className={cx(styles.inner)}>
          <p>Welcome to Arrivy, software for connecting businesses and their customers through the last mile. Arrivy is highly customizable-from customer messages to job templates. Let's collect some basic information on your business to get started.</p>
        </div>
      </div>
    );
  }
}
