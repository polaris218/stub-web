import React, { Component } from 'react';
import styles from '../auth/signup.module.scss';
import { findDOMNode } from 'react-dom';
import { Link } from 'react-router-dom';
import { FormGroup, ControlLabel, FormControl, Alert, Modal } from 'react-bootstrap';
import Phone from 'react-phone-number-input';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import { getErrorMessage } from '../../helpers/task';
import config from '../../config/config';
import { login, getLoggedInUserSettings, acceptInvitation } from '../../actions';
const env = config(self).env;
import { Cookies } from 'react-cookie';
import cx from 'classnames';
import history from '../../configureHistory';

export default class Login extends Component {

  constructor(props, context) {
    super(props, context);

    this.login = this.login.bind(this);
    this.storageChange = this.storageChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handlePhone = this.handlePhone.bind(this);
    this.redirectLocation = this.redirectLocation.bind(this);

    this.state = {
      errorText: null,
      successText: null,
      serverActionIsPending: false,
      email: null,
      phone: false,
      phoneNumber: null,
      show_modal: false,
      redirectLocation: null,
      query: null,
    };

    this.cookies = new Cookies();
  }

  componentDidMount() {
    const result = this.props.result;
    let phone = false,
      email= null,
      phoneNumber= null;
    if (result.channel.toUpperCase() === 'EMAIL'){
      phone = false;
      email = result.channel_address;
      findDOMNode(this.refs.email) && findDOMNode(this.refs.email).focus();
    } else if(result.channel.toUpperCase() === 'SMS') {
      phone = true;
      phoneNumber = result.channel_address;
      findDOMNode(this.refs.phone) && findDOMNode(this.refs.phone).focus();
    }
    this.setState({
      phone,
      email,
      phoneNumber
    });
  }

  componentWillMount() {
    window.addEventListener('storage', this.storageChange);
    let cookies = new Cookies();
    if (cookies && cookies.get('auth')) {
      getLoggedInUserSettings().then(() => {
        acceptInvitation(this.props.query && this.props.query.invitation_id).then((res) => {
          this.setState({
            redirectLocation: '/dashboard',
            query: this.props.query,
            show_modal: true
          });
        }).catch((err) => {
          const error = JSON.parse(err.responseText);
        });
        //history.push('/dashboard');
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
      history.push('/dashboard');
    }
  }

  login(e) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      serverActionIsPending: true,
    });

    const query = this.props.query,
      email = findDOMNode(this.refs.email) && findDOMNode(this.refs.email).value.trim(),
      password = findDOMNode(this.refs.password).value.trim(),
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

    login({ email, password, phone }).then((res) => {
      let resp = JSON.parse(res);
      this.setState({
        successText: 'Login Successful',
        serverActionIsPending: false,
        show_modal: true
      });
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
      acceptInvitation(this.props.query && this.props.query.invitation_id).then((res) => {
        this.setState({
          redirectLocation,
          query,
          showModal: true
        });
      }).catch((err) => {
        const error = JSON.parse(err.responseText);
      });
    }).catch((err) => {
      const error = JSON.parse(err.responseText);
      this.setState({
        errorText: getErrorMessage(error, 'Incorrect Email or Password'),
        serverActionIsPending: false,
        show_modal: false
      });
    });
  }

  redirectLocation(redirectLocation, query) {
    this.cookies.set('cidx', this.props.result && this.props.result.owner);
    if (redirectLocation) {
      history.push(redirectLocation);
    } else {
      if (this.props.location && this.props.location.state) {
        history.push(this.props.location && this.props.location.state.nextPathname);
      } else {
        history.push('/dashboard' + (query && query.ref == 'signup' || query && query.ref == 'verification' ? '?source_context=signup' : ''));
      }
    }
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
        email:  value
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
    let alert = null;
    if (this.state.successText) {
      alert = <Alert bsStyle="success">
        <p>{this.state.successText}</p>
      </Alert>;
    } else if (this.state.errorText) {
      alert = <Alert bsStyle="danger">
        <p>{this.state.errorText}</p>
      </Alert>;
    } else if (this.props.query && this.props.query.ref === 'signup') {
      alert = <Alert bsStyle="success">
        <p>Signup was successful. An Activation Link has been sent to your email. Please click the link to activate your account.</p>
      </Alert>;
    } else if (this.props.query && this.props.query.ref === 'forgot_password') {
      alert = <Alert bsStyle="success">
        <p>An email is sent with instructions on how to reset your password.</p>
      </Alert>;
    } else if (this.props.query && this.props.query.ref === 'reset_password') {
      alert = <Alert bsStyle="success">
        <p>Password has been reset.</p>
      </Alert>;
    } else if (this.props.query && this.props.query.ref === 'verification') {
      alert = <Alert bsStyle="success">
        <p>Your account has been activated. Congratulations!</p>
      </Alert>;
    }
    const result = this.props.result;
    const { redirectLocation, query } = this.state;

    return (
      <div>
        <div className={cx(styles.authContent)}>
          <div className={cx(styles.title)}>
            <h1>You have been invited</h1>
            <p>To join <span>{result && result.company_name}</span> on Arrivy</p>
            <p>Use your existing Arrivy login to access <span>{result.company_name}</span></p>
          </div>
          <div className={cx(styles.authInner)}>
            {alert}
            <form id="login-form" onSubmit={this.login}>
              <FormGroup>
                <ControlLabel>Email or Mobile Number</ControlLabel>
                {!this.state.phone &&
                <FormControl onChange={(e) => this.handleChange(e)} value={this.state.email} autoComplete="email" type='text' ref='email' placeholder="E.g. email@company.com" />}
                {this.state.phone &&
                <Phone country="US" value={this.state.phoneNumber} autoComplete="phone" className={cx(styles['input-phone'])} placeholder="Mobile Phone Number" ref="phone" onChange={(phone) => this.handlePhone(phone)}/>}
              </FormGroup>
              <FormGroup>
                <ControlLabel>Password</ControlLabel>
                <FormControl type='password' autoComplete="new-password" ref='password' placeholder="Password" />
              </FormGroup>
              <button type='submit' id="login-form-btn" className={cx(styles.btn, styles['btn-secondary'])}>
                {this.state.serverActionIsPending ? <SavingSpinner borderStyle="none"/> : 'Log in' }
              </button>
            </form>
          </div>
          <div className={cx(styles['links'])}>
            <Link to='/forgot_password'>Forgot password?</Link>
            <Link to='/signup'>Sign up for a New Account</Link>
          </div>
        </div>
        <Modal show={this.state.show_modal} animation={false} className={cx(styles.modalNotification)}>
          <Modal.Body className={cx(styles.modalBody, ['text-center'])}>
            <h3>You are now a member of {result && result.company_name}.</h3>
            <button onClick={() => this.redirectLocation(redirectLocation, query)} className={cx(styles.btn, styles['btn-secondary'])}>Go to Dashboard</button>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
