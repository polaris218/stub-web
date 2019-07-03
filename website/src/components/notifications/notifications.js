import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './notifications.module.scss';
import Switch from 'react-bootstrap-switch';
import { FieldGroup } from '../fields';
import SwitchButton from '../../helpers/switch_button';
import $ from 'jquery';

export default class Notifications extends Component {
  constructor(props) {
    super(props);

    this.onNotificationChange = this.onNotificationChange.bind(this);
  }

  onNotificationChange(name) {
    const notifications = this.props.notifications;
    notifications[name] = !notifications[name] ? true : false;
    this.props.onChange('notifications', notifications);
  }

  renderPredefined(notifications, onSwitchChange, className) {
    return (
      <div className={className}>
        <SwitchButton id="email-notification" groupClassName={styles.switcher} componentClass={Switch} checked={(!notifications || notifications.email === null || typeof notifications.email === 'undefined') ? true : notifications.email}
              offColor="warning" label="Email Notification" onChange={onSwitchChange('email')} name="email-notification" offText="OFF"/>
        <FieldGroup id="sms-notification" groupClassName={styles.switcher} componentClass={Switch} checked={(!notifications || notifications.sms === null || typeof notifications.sms === 'undefined') ? true : notifications.sms}
              offColor="warning" label="SMS Notification" onChange={onSwitchChange('sms')} name="sms-notification" offText="OFF"/>
        <FieldGroup id="facebook-message" groupClassName={styles.switcher} componentClass={Switch} checked={(!notifications || notifications.facebook === null || typeof notifications.facebook === 'undefined') ? true : notifications.facebook}
              offColor="warning" label="Facebook message" onChange={onSwitchChange('facebook')} name="facebook-message" offText="OFF"/>
      </div>);
  }

  render() {
    const onSwitchChange = (name) => {
      return (event) => {
        this.onNotificationChange(name);
      };
    };

    const { notifications, options} = this.props;
    if ($.isEmptyObject(notifications) || notifications === null) {
      options.map((option) => {
        notifications[option.type] = true
      });
    }
    if (options) {
      return (
        <div className={this.props.className}>
          {
            options.map((option) => {
              return (<FieldGroup key={'id' + option.type} groupClassName={[styles.switcher, styles[option.type + '-s']].join(' ')} componentClass={SwitchButton} checked={notifications ? !!notifications[option.type] : true} label={option.label} onChange={onSwitchChange(option.type)} name={option.label} disabled={typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false}/>);
            })
          }
        </div>
      );
    }
    return this.renderPredefined(notifications, onSwitchChange, this.props.className);
  }
}

Notifications.propTypes = {
  notifications: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array
};
