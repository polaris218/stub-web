import React, { Component } from 'react';
import styles from './finish.module.scss';
import cx from 'classnames';

export default class Finish extends Component {
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
          <p>Arrivy provides many more features and customizations. Please dive in and <strong>make it yours.</strong> You can find product documentation at <a href="https://help.arrivy.com" target="_blank">https://help.arrivy.com</a>.</p>
        </div>
      </div>
    );
  }
}
