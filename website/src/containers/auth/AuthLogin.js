import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import { authBasedLogin } from '../../actions';
import { UserHeader } from '../../components';
import moment from 'moment';
import styles from './signup.module.scss';
import AuthFooter from './AuthFooter';
import { getErrorMessage } from '../../helpers/task';
import { parseQueryParams } from '../../helpers';
import $ from 'jquery';
import config from "../../config/config";
import cx from 'classnames';
const env = config(self).env;

export default class AuthLogin extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      loaded: false,
      errorText : null
    };
  }

  componentDidMount() {
    const query = parseQueryParams(this.props.location.search);
    const auth_key = query.auth_key;
    const auth_token = query.auth_token;
    const entity_id = query.entity_id;
    const redirect_URL = query.ru;
    const date = query.date;
    if (localStorage.getItem('logged_in') && localStorage.getItem('logged_in') === 'true') {
      this.context.router.history.push('/dashboard');
      return;
    }
    if (auth_key && auth_token) {
      this.verify(auth_key, auth_token, entity_id, redirect_URL, date);
    } else {
      this.setState({
        loaded: true,
        errorText: 'Unable to login using provided credentials. Incorrect auth_key or auth_token.'
      });
    }
  }

  verify(auth_key, auth_token, entity_id, redirect_URL, date) {
    const $verification = this;

    authBasedLogin({ auth_key, auth_token, entity_id }).then( resp => {
       resp = JSON.parse(resp);

      localStorage.removeItem('logged_out');
      try {
        localStorage.setItem('logged_in', 'true');
      } catch (e) {
        console.log('LocalStorage Not Available');
        console.log(e);
      }

      let redirect_to = '/dashboard';
      let router_query_param =  {
        ref: 'AuthLogin'
      };
      if(!window.DEBUG) {
              var dataLayer = window.dataLayer = window.dataLayer || [];
              dataLayer.push({
                  'event': 'ChangeUserType',
                  'ArrivyUserType': 'customer',
                  'CustName': resp.userName ? resp.userName.toString() : '',
                  'CustNumber': resp.userId ? resp.userId.toString() : '',
                  'CustType': resp.company_type ? resp.company_type.toString() : ''
              });
      }
      if (redirect_URL) {
        redirect_to = redirect_URL;
      }
      let date_query_param = null;
      if (date && date !== '' && date !== null) {
        const dateObject = moment(date);
        if (dateObject.isValid()) {
          date_query_param = dateObject.format('YYYY-MM-DD');
        }
      }
      if (date_query_param) {
        router_query_param = {
          ...router_query_param,
          date: date_query_param
        };
      }

      $verification.context.router.history.push({
        pathname: redirect_to,
        search: '?' + $.param(router_query_param)
      });
    }).catch(err => {
      const error = JSON.parse(err.responseText);
      if (err.status === 500) {
        error.description = 'Something went wrong. This operation cannot be completed.';
      }
      if (err.status) {
        this.setState({
          loaded: true,
          errorText: getErrorMessage(error, 'Unable to login using provided credentials. Incorrect auth_key or auth_token.')
        });
      }
    });
  }

  render() {
    let alert = null;
    if (this.state.errorText) {
      alert = <Alert bsStyle="danger">
        <p>{this.state.errorText}</p>
      </Alert>;
    }

    return (
      <div>
        <UserHeader router={this.context.router} hideOptions/>
        <div className={cx(styles.authContainer)}>
          <div className={cx(styles.authContent)}>
            <div className={cx(styles.title)}>
              <h1>Logging in</h1>
            </div>
            <div className={cx(styles.authInner)}>
              {(this.state.loaded === false) && <div><SavingSpinner title="Logging in" borderStyle="none" fontSize={16} size={8}/></div>}
              { alert }
            </div>
          </div>
        </div>
        <AuthFooter />
      </div>
    );
  }
}

AuthLogin.propTypes = {
  location: PropTypes.object
};

AuthLogin.contextTypes = {
  router: PropTypes.object.isRequired
};
