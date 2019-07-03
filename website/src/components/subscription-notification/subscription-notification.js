import React, { Component } from 'react';
import styles from './subscription-notification.module.scss';
import cx from 'classnames';

export default class SubscriptionNotification extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let subscribe = this.props.subscribe;
    let previous = subscribe ? 'subscribed' : 'unsubscribed';
    let next = subscribe ? 'un-subscribe' : 're-subscribe';
    return (
      <div className={styles.notification}>
        <p>You've been successfully {previous}. Follow <a href="javascript:void(0)" onClick={() => this.props.changeSubscribe()}>this link</a> to {next} to service updates.</p>
      </div>
    );
  }
}