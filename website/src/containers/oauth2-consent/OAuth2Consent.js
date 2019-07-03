import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {routeToLogin} from '../../helpers/route';
import {encode} from 'querystring';
import styles from './oauth2consent.module.scss';
import {OAuth2ConsentForm} from '../../components';
import {getProfileInformation, validateAuthorizationRequest, createAuthorizationResponse} from '../../actions';
import {DefaultHelmet} from '../../helpers';
import {parseQueryParams} from '../../helpers';
import cx from 'classnames';
import { Radio } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';

export default class OAuth2Consent extends Component {
  constructor(props, context) {
    super(props, context);

    // const {location} = this.props;
    // Required
    // scope=task.lists
    // access_type=offline
    // redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth2%2Fcallback
    // response_type=code
    // client_id=Alexa

    let query = this.props.location.search;

    window.query = query;
    this.state = {
      showForm: false,
      oauth2Credential: "",
      query: query,
      profile: null,
      company_id: null
    };

    this.onAuthenticationAllowed = this.onAuthenticationAllowed.bind(this);
    this.onAuthCancel = this.onAuthCancel.bind(this);
    this.selectUserCompany = this.selectUserCompany.bind(this);
    this.createToastAlert = this.createToastAlert.bind(this);
  }

  onAuthCancel() {
    if (this.state.query)
      window.location = parseQueryParams(this.state.query).redirect_uri;
  }

  onAuthenticationAllowed(timezone) {
    let { profile, company_id } = this.state;
    if (profile && profile.user_companies && profile.user_companies.length > 1 && !company_id) {
      const userCompanyError = {
        text: 'Please select any company.',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.createToastAlert(userCompanyError);
      return;
    } else if (profile && !profile.user_companies && !company_id) {
      company_id = profile.owner;
      this.setState({company_id});
    }

    // TODO: timezone must be passed here in more js way
    // this.state.oauth2Credential.timezone = timezone;
    this.state.oauth2Credential.scope = parseQueryParams(this.state.query).scope;
    this.state.oauth2Credential.company_id = company_id;
    createAuthorizationResponse(this.state.oauth2Credential)
      .catch((error) => {
        console.log(error);
      }).then((response) => {
        window.location = JSON.parse(response).redirect
      });
  }

  componentWillMount() {
    getProfileInformation().then((res) => {
      const profile = JSON.parse(res);
      let company_id = null;

      if (profile && profile.user_companies && profile.user_companies.length === 1) {
        company_id = profile.user_companies[0].owned_company_id;
      }

      this.setState({profile, company_id});
      return validateAuthorizationRequest(this.state.query.replace('?', '')).catch((error) => {
        if (error.status == 400) {
          console.log(error);
        }
      })
        .then((response) => {
          if (JSON.parse(response)['oauth2_credential'] == undefined) {
            console.log(JSON.parse(response));
          } else {
            this.setState({
              showForm: true,
              oauth2Credential: JSON.parse(response)
            });
          }
        });
    }).catch((error) => {
      if (error.status === 401) {
        routeToLogin(this.props.location, this.context.router);
      }
    });
  }

  createToastAlert(alert) {
    toast(alert.text, alert.options);
  }

  selectUserCompany(e) {
    let company_id = e.target.value;
    this.setState({company_id});
  }


  render() {
    const profile = this.state.profile;
    return (
      <div className={styles['page-wrap']}>
        <DefaultHelmet/>
        <ToastContainer className={styles.toastContainer} toastClassName={styles.toast} autoClose={1}/>
        <div className={styles['auth-container']}>
          <div className="text-center">
            <Link to={'/'} className={styles.logo}>
              <img src='/images/logo-dark-larg.png' alt='Arrivy' />
            </Link>
            <h3>Allow Access?</h3>
          </div>
          <div className={styles['auth-content']}>
            <p><strong>Web Service</strong> is asking to:</p>
            <ul>
              <li>Access and manage your Arrivy Tasks</li>
              <li>Provide access to your data via web</li>
            </ul>
            {profile && profile.user_companies && profile.user_companies.length > 1 ?
            <div>
              <p>Do you want to allow access for {this.state.profile ? this.state.profile.email : ''}? Please select one of the below companies.</p>
              <ul className={cx(styles.radioList)}>
                {profile.user_companies.map((user_company) => {
                  return (
                    <li>
                      <Radio className={cx(styles.radioBtn)} name="company_name" onChange={(e) => {this.selectUserCompany(e)}} value={user_company.owned_company_id}>
                        <img src={user_company.company_image || '/images/user-default.svg'} alt={user_company.company_name} />
                        <span>{user_company.company_name}</span>
                      </Radio>
                    </li>
                  );
                })}
              </ul></div> : <p>Do you want to allow access for {this.state.profile ? this.state.profile.email : ''}?</p>}
            {this.state.showForm ? <OAuth2ConsentForm onAllowClick={this.onAuthenticationAllowed} onAuthCancelClick={this.onAuthCancel}/> : null}
            {/*<p>To revoke access at any time, go to your personal settings.</p>*/}
          </div>
        </div>
        <div className={styles.copyright}>
          <p>© Arrivy, Inc - All Rights Reserved</p>
        </div>
      </div>
    );
  }
}

OAuth2Consent.contextTypes = {
  router: PropTypes.object.isRequired
};
