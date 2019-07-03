import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap';
import styles from './arrow.module.scss';

class Arrow extends Component {
  render() {
    return (
      <a className={styles.arrow} {...this.props}>
        <Glyphicon glyph="menu-down" />
      </a>
    );
  }
}

export default Arrow;
