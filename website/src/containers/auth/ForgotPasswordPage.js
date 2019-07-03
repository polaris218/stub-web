import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormGroup, ControlLabel, FormControl, Alert } from 'react-bootstrap';
import { findDOMNode } from 'react-dom';
import { resetPassword1 } from '../../actions';
import { UserHeader } from '../../components';
import { DefaultHelmet } from '../../helpers';
import { getErrorMessage } from '../../helpers/task';
import AuthFooter from './AuthFooter';
import styles from './signup.module.scss';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import history from '../../configureHistory';
import cx from 'classnames';
import Phone  from 'react-phone-number-input';

export default class ForgotPasswordPage extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      errorText: null,
      serverActionPending: false,
      email: null,
      phone: false,
      phoneNumber: null,
    };
  }

  componentDidMount() {
    findDOMNode(this.refs.email).focus();
  }

  reset(e) {
    this.setState({
      serverActionPending: true,
    });
    e.preventDefault();

    const email = findDOMNode(this.refs.email) && findDOMNode(this.refs.email).value.trim(),
      phone = this.state.phoneNumber && this.state.phoneNumber.trim();


    if (!email && !phone) {
      this.setState({
        errorText: 'No Email or Phone Number provided',
        serverActionPending: false,
      });
      return;
    }

    resetPassword1({ email, phone }).then(() => {
      history.push('/login?ref=forgot_password');
    }).catch(err => {
      const error = JSON.parse(err.responseText);
      if (err.status === 400) {
        this.setState({
          errorText: getErrorMessage(error, 'Email address or Phone number not found'),
          serverActionPending: false,
        });
      } else if(err.status === 401) {
        localStorage.removeItem('logged_in');
        try {
          localStorage.setItem('logged_out', 'true');
        } catch (e) {
          console.log('LocalStorage Not Available');
          console.log(e);
        }
        this.setState({
          errorText: getErrorMessage(error, 'Email address or Phone number not found'),
          serverActionPending: false,
        });
      } else {
        this.setState({
          errorText: 'Unable to complete the operation at this time.',
          serverActionPending: false
        });
      }
    });
  }

  handleChange(e) {
    const value = e.target.value;
    if (parseInt(value) || parseInt(value) === 0) {
      this.setState({
        phone: true,
        email: null
      }, () => {
        if (this.refs.phone) {
          this.refs.phone.focus();
          this.handlePhone(value);
        }
      });
    } else {
      this.setState({
        phone: false,
        email: value
      }, () => {
        findDOMNode(this.refs.email) && findDOMNode(this.refs.email).focus();
      });
    }
  }

  handlePhone(phone) {
    if (typeof phone !== 'undefined' && (!phone || phone.trim() === '')) {
      this.setState({
        phone: false,
        phoneNumber: null,
        email: ''
      }, () => {
        findDOMNode(this.refs.email) && findDOMNode(this.refs.email).focus();
      });
    } else {
      this.setState({
        email: null,
        phoneNumber: phone
      });
    }
  }

  render() {
    let alert = null;
    if (this.state.errorText) {
      alert = (
        <Alert bsStyle='danger'>
          <p>{this.state.errorText}</p>
        </Alert>
      );
    }
    return (
      <div>
        <DefaultHelmet/>
        <UserHeader router={this.context.router} hideOptions/>
        <div className={cx(styles.authContainer)}>
          <div className={cx(styles.authContent)}>
            <div className={cx(styles.title)}>
              <h1>Forgot Password</h1>
              <p>Please enter your email or phone number to get reset password instructions.</p>
            </div>
            <div className={cx(styles.authInner)}>
              { alert }
              <form onSubmit={this.reset.bind(this)}>
                <FormGroup>
                  <ControlLabel>Email or Mobile Number</ControlLabel>
                  {!this.state.phone &&
                  <FormControl type="email" ref="email" value={this.state.email} onChange={(e) => this.handleChange(e)} autoComplete="email" placeholder="E.g. email@company.com"/>}
                  {this.state.phone &&
                  <Phone country="US" autoComplete="phone" value={this.state.phoneNumber} className={cx(styles['input-phone'])} placeholder="Mobile Phone Number" ref="phone" onChange={(phone) => this.handlePhone(phone)}/>}
                </FormGroup>
                <button type="submit" className={cx(styles.btn, styles['btn-secondary'])} disabled={this.state.serverActionPending}>
                  {this.state.serverActionPending ? <SavingSpinner borderStyle="none" /> : 'Reset'}
                </button>
              </form>
            </div>
            <div className={cx(styles['links'])}>
              <Link to='/login'>Log into an Existing Account</Link>
              <Link to='/signup'>Sign up for a New Account</Link>
            </div>
          </div>
        </div>
        <AuthFooter />
      </div>
    );
  }
}

ForgotPasswordPage.contextTypes = {
  router: PropTypes.object.isRequired
};
