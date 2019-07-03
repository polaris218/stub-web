import React, { Component } from 'react';
import styles from './api-content-manager.module.scss';
import cx from 'classnames';
import { Button } from 'react-bootstrap';
import history from '../../configureHistory';

export default class ApiContentManager extends Component {
  constructor(props) {
    super(props);
  }

  takeMeToDeveloperPortal() {
    history.push('/developer_portal');
  }

  render() {
    return (
      <div className={cx(styles.apiDoc)}>
        <p>The latest API documentation is available at our Developer Portal.</p>
        <Button className={cx(styles.btn, styles['btn-secondary'])} onClick={this.takeMeToDeveloperPortal}>Go to Developer Portal</Button>
      </div>
    );
  }
}
