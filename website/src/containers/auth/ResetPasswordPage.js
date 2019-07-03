import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { FormControl, Alert, ControlLabel, FormGroup } from 'react-bootstrap';
import { findDOMNode } from 'react-dom';

import { resetPassword2 } from '../../actions';
import { UserHeader } from '../../components';
import { DefaultHelmet } from '../../helpers';
import { getErrorMessage } from '../../helpers/task';

import styles from './signup.module.scss';
import AuthFooter from './AuthFooter';

import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import history from '../../configureHistory';
import cx from 'classnames';

export default class ResetPasswordPage extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      errorText: null,
      serverActionPending: false
    };
  }

  componentDidMount() {
    findDOMNode(this.refs.password1).focus();
  }

  reset(e) {
    this.setState({
      serverActionPending: true
    });
    e.preventDefault();

    const password          = findDOMNode(this.refs.password1).value.trim();
    const confirm_password  = findDOMNode(this.refs.password2).value.trim();

    if (!password) {
      return this.setState({
        errorText: 'Password field should not be empty.'
      });
    }
    if (!confirm_password) {
      return this.setState({
        errorText: 'Confirm password field should not be empty.'
      });
    }
    if (password !== confirm_password) {
      return this.setState({
        errorText: 'Password and Confirm password fields do not match.'
      });
    }
    const { user_id, signup_token } = this.props.match.params;

    resetPassword2({ user_id, signup_token, password, confirm_password })
      .then(() => {
        history.push('/login?ref=reset_password');
      })
      .catch(err => {
        const error = JSON.parse(err.responseText);
        if (err.status === 500) {
          this.setState({
            errorText: 'Something went wrong. This opertaion cannot be completed.',
            serverActionPending: false
          });
        } else {
          this.setState({
            errorText: getErrorMessage(error, 'User not found.'),
            serverActionPending: false
          });
        }
      });
  }

  render() {
    let alert = null;
    if (this.state.errorText) {
      alert = (
        <Alert bsStyle='danger'>
          <p>{this.state.errorText}</p>
        </Alert>
      )
    }
    return (
      <div>
        <DefaultHelmet/>
        <UserHeader router={this.context.router} hideOptions/>
        <div className={cx(styles.authContainer)}>
          <div className={cx(styles.authContent)}>
            <div className={cx(styles.title)}>
              <h1>Reset Password</h1>
              <p>Please fill the fields below to reset your password.</p>
            </div>
            <div className={cx(styles.authInner)}>
                { alert }
                <form onSubmit={this.reset.bind(this)}>
                  <FormGroup>
                    <ControlLabel>Create Password</ControlLabel>
                    <FormControl className={styles['auth-item']} type='password' placeholder='Password' ref='password1'/>
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Confirm Password</ControlLabel>
                    <FormControl className={styles['auth-item']} type='password' placeholder='Password' ref='password2'/>
                  </FormGroup>
                  <button type='submit' className={cx(styles.btn, styles['btn-secondary'])} disabled={this.state.serverActionPending}>
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

ResetPasswordPage.propTypes = {
  params: PropTypes.object.isRequired
};
ResetPasswordPage.contextTypes = {
  router: PropTypes.object.isRequired
};
