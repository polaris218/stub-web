import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormControl, Alert, FormGroup, ControlLabel } from 'react-bootstrap';
import { findDOMNode } from 'react-dom';
import { UserHeader } from '../../components';
import { login, getLoggedInUserSettings } from '../../actions';
import { DefaultHelmet } from '../../helpers';
import { getErrorMessage } from '../../helpers/task';
import styles from './signup.module.scss';
import AuthFooter from './AuthFooter';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import { parseQueryParams } from '../../helpers';
import config from '../../config/config';

const env = config(self).env;
import { Cookies } from 'react-cookie';
import cx from 'classnames';
import Phone from 'react-phone-number-input';
import { is_valid_phone_number } from 'react-phone-number-input';

export default class LoginPage extends Component {

  constructor(props, context) {
    super(props, context);

    this.login = this.login.bind(this);
    this.storageChange = this.storageChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handlePhone = this.handlePhone.bind(this);

    this.state = {
      errorText: null,
      successText: null,
      serverActionIsPending: false,
      email: null,
      phone: false,
      phoneNumber: null,
    };
  }

  componentDidMount() {
    findDOMNode(this.refs.email).focus();
  }

  componentWillMount() {
    window.addEventListener('storage', this.storageChange);
    let cookies = new Cookies();
    if (cookies && cookies.get('auth')) {
      getLoggedInUserSettings().then(() => {
        const query = parseQueryParams(this.props.location.search);
        this.context.router.history.push('/dashboard' + (query.ref == 'signup' || query.ref == 'verification' ? '?source_context=signup' : ''));
      }).catch((error) => {
        if (error.status === 401) {
          cookies.remove('auth');
          localStorage.removeItem('logged_in');
          try {
            localStorage.setItem('logged_out', 'true');
          } catch (e) {
            console.log('LocalStorage Not Available');
            console.log(e);
          }
        }
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.storageChange);
  }

  storageChange(event) {
    if (event.key === 'logged_in' && event.newValue === 'true') {
      this.context.router.history.push('/dashboard');
    }
  }

  login(e) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      serverActionIsPending: true
    });

    const query = parseQueryParams(this.props.location.search),
      email = findDOMNode(this.refs.email) && findDOMNode(this.refs.email).value.trim(),
      password = findDOMNode(this.refs.password) && findDOMNode(this.refs.password).value.trim(),
      phone = this.state.phoneNumber && this.state.phoneNumber.trim();

    if (!email && !phone) {
      this.setState({
        errorText: 'No Email or Phone Number provided',
        serverActionIsPending: false
      });
      return;
    }

    let redirectLocation = null;
    if (query.state && query.state.nextPathname) {
      redirectLocation = query.state.nextPathname;
    } else if (query.redirect_url) {
      redirectLocation = query.redirect_url;
    }

    login({ email, phone, password }).then(resp => {
      resp = JSON.parse(resp);
      this.setState({
        successText: 'Login Successful',
        serverActionIsPending: false,
      });

      localStorage.removeItem('logged_out');
      try {
        localStorage.setItem('logged_in', 'true');
      } catch (e) {
        console.log('LocalStorage Not Available');
        console.log(e);
      }

      if (!window.DEBUG) {
        var dataLayer = window.dataLayer = window.dataLayer || [];
        dataLayer.push({
          'event': 'ChangeUserType',
          'ArrivyUserType': 'customer',
          'CustName': resp.userName ? resp.userName.toString() : '',
          'CustNumber': resp.userId ? resp.userId.toString() : '',
          'CustType': resp.company_type ? resp.company_type.toString() : ''
        });
      }

      if (redirectLocation) {
        this.context.router.history.push(redirectLocation);
      } else {
        if (this.props.location.state) {
          this.context.router.history.push(this.props.location.state.nextPathname + (window.query ? window.query : ''));
        }
        else {
          this.context.router.history.push('/dashboard' + (query.ref == 'signup' || query.ref == 'verification' ? '?source_context=signup' : ''));
        }
      }
    }).catch((err) => {

      const error = JSON.parse(err.responseText);
      if(err.status === 500 ){
        error.description = 'Something went wrong. This operation cannot be completed.'
      }
      this.setState({
        errorText: getErrorMessage(error, 'Incorrect Email or Password'),
        serverActionIsPending: false,
      });
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
        phoneNumber: phone,
        email: null
      });
    }
  }


  render() {
    const { location } = this.props;
    const query = parseQueryParams(location.search);
    let alert = null;
    if (this.state.successText) {
      alert = <Alert bsStyle="success">
        <p>{this.state.successText}</p>
      </Alert>;
    } else if (this.state.errorText) {
      alert = <Alert bsStyle="danger">
        <p>{this.state.errorText}</p>
      </Alert>;
    } else if (query && query.ref === 'signup') {
      alert = <Alert bsStyle="success">
        <p>Signup was successful. An Activation Link has been sent to your email. Please click the link to activate your account.</p>
      </Alert>;
    } else if (query && query.ref === 'forgot_password') {
      alert = <Alert bsStyle="success">
        <p>An message is sent with instructions on how to reset you password.</p>
      </Alert>;
    } else if (query && query.ref === 'reset_password') {
      alert = <Alert bsStyle="success">
        <p>Password has been reset.</p>
      </Alert>;
    } else if (query && query.ref === 'verification') {
      alert = <Alert bsStyle="success">
        <p>Your account has been activated. Congratulations!</p>
      </Alert>;
    }

    return (
      <div>
        <DefaultHelmet/>
        <UserHeader router={this.context.router} hideOptions/>
        <div className={cx(styles.authContainer)}>
          <div className={cx(styles.authContent)}>
            <div className={cx(styles.title)}>
              <h1>Glad to see you again!</h1>
              <p>Log into to your account.</p>
            </div>
            <div className={cx(styles.authInner)}>
              {alert}
              <form id="login-form" onSubmit={this.login}>
                <FormGroup>
                  <ControlLabel>Username (Email or Mobile Number)</ControlLabel>
                  {!this.state.phone &&
                  <FormControl autoComplete="email" value={this.state.email} onChange={(e) => this.handleChange(e)} type='email' ref='email' placeholder="E.g. email@company.com"/>}
                  {this.state.phone &&
                  <Phone country="US" autoComplete="phone" value={this.state.phoneNumber} className={cx(styles['input-phone'])} placeholder="Mobile Phone Number" ref="phone" onChange={(phone) => this.handlePhone(phone)}/>}
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Password</ControlLabel>
                  <FormControl autoComplete="new-password" type='password' ref='password' placeholder="Password"/>
                </FormGroup>
                <button type='submit' id="login-form-btn" disabled={this.state.serverActionIsPending} className={cx(styles.btn, styles['btn-secondary'])}>
                  {this.state.serverActionIsPending ? <SavingSpinner borderStyle="none" /> : 'Log in'}
                </button>
              </form>
            </div>
            <div className={cx(styles['links'])}>
              <Link to='/forgot_password'>Forgot password?</Link>
              <Link to='/signup'>Sign up for a New Account</Link>
            </div>
          </div>
        </div>
        <AuthFooter/>
      </div>
    );
  }
}

LoginPage.propTypes = {
  location: PropTypes.object
};
LoginPage.contextTypes = {
  router: PropTypes.object.isRequired
};
