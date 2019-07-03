import React, { Component } from 'react';
import styles from './signup.module.scss';

export default class AuthFooter extends Component {
  render() {
    return (
      <div className={styles['auth-footer']}>
        <div className={styles['first-row']}>
          <p className={styles['mail']}>info@arrivy.com</p>
          <p>
            <a className={styles['twitter']} href="https://twitter.com/arrivy_platform" title="twitter" />
            <a className={styles['facebook']} href="https://www.facebook.com/arrivy" title="facebook" />
            <a className={styles['linkedin']} href="https://www.linkedin.com/company/arrivy" title="linkedin" />
          </p>
        </div>
        <div>
          <p className={styles['copyr']}>© Arrivy, Inc - All Rights Reserved</p>
        </div>
      </div>
    );
  }
}
