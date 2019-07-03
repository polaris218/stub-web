import React, { Component } from "react"
import PropTypes from 'prop-types';
import styles from './activity-stream.module.scss';

export default class ActivityStreamButton extends Component {

  render() {
    let { toggle, count } = (this.props.activityStreamStateHandler || {})
    return (
      <div className="activity-stream-button-hidden">
        <div className={styles['activity-button-container'] + ' ' + styles['activity-button-container-cursor']} onClick={toggle}>
          <div className={styles['drawer-title-container']}>
            <div><img src="/images/icons/speaker.png" /></div>
            <div className={styles['drawer-title']}>
              Activities
            </div>
          </div>
          <div className={styles['activity-count-container']}>
            <div className={styles['activity-count']}>{count}</div>
          </div>
          <div className={styles['activity-icon-container']}>
            <img src="/images/icons/round-down-arrow.png" />
          </div>
        </div>
      </div>
    );
  }
}

ActivityStreamButton.contextTypes = {
  activityStreamStateHandler: PropTypes.object
};
