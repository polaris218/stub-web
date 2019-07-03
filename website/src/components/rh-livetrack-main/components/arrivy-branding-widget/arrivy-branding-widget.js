import React, { Component } from 'react';
import styles from './arrivy-branding-widget.module.scss';

export default class ArrivyBrandingWidget extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles.arrivyBrandingWidgetContainer}>
        <p>
          Powered by <a href="https://arrivy.com" target="_blank"><img src="/images/logo-dark.png" /></a>
        </p>
      </div>
    );
  }

}
