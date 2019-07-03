import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './oauthconsent.module.scss';
import { Button, Row, Col, FieldGroup } from 'react-bootstrap';
import TimezonePicker from 'react-bootstrap-timezone-picker';
import cx from 'classnames';

export default class OAuth2ConsentForm extends Component {
  constructor(props) {
    super(props);
    this.onSubmitForm = this.onSubmitForm.bind(this);
    this.onChangeTimezone = this.onChangeTimezone.bind(this);
    this.oncancel = this.oncancel.bind(this);
    this.state = { timezone: '' };
  }

  onSubmitForm(event) {
    event.preventDefault();
    event.stopPropagation();
    this.props.onAllowClick(this.state.timezone);
  }

  oncancel(event) {
    event.preventDefault();
    event.stopPropagation();
    this.props.onAuthCancelClick();

  }

  onChangeTimezone(timezone) {
    this.setState({ timezone: timezone });
  }

  render() {
    return (
      <div>
        {/*<center>You are asking access to our API with scopes</center>*/}
        <form onSubmit={this.onSubmitForm}>
          {/*<TimezonePicker*/}
          {/*placeholder   = "Select timezone..."*/}
          {/*onChange      = {this.onChangeTimezone}*/}
          {/*/>*/}
          <div className={cx(styles.btnWrapper)}>
            <Button type="button" className={cx(styles.btn, styles['btn-light'])} onClick={this.oncancel}>Deny</Button>
            <Button type="submit" className={cx(styles.btn, styles['btn-secondary'])}>Allow</Button>
          </div>
        </form>
      </div>
    );
  }
}

OAuth2ConsentForm.propTypes = {
  onAllowClick: PropTypes.func.isRequired,
  onAuthCancelClick: PropTypes.func.isRequired
};
