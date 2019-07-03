import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorAlert from '../../components/error-alert/error-alert';
import styles from './Api_info.module.scss';
import {
  AccountSummary,
  ApiContentManager,
  FooterComponent,
  FooterConfiguration,
  UserHeaderV2,
  ActivityStream,
  SlimFooterV2,
  TrialExpiration
} from '../../components';
import { getProfileInformation, getCompanyProfileInformation, updateKeys } from '../../actions';
import {DefaultHelmet, isTrialExpire} from '../../helpers';
import history from '../../configureHistory';
import {error_catch} from '../../helpers/error_catch';

export default class Dashboard extends Component {
  constructor(props, context) {
    super(props, context);

    this.activityStreamStateChangeHandler = this.activityStreamStateChangeHandler.bind(this);
    this.activityStreamLogoutHandler = this.activityStreamLogoutHandler.bind(this);

    this.state = {
      profile: null,
      companyProfile: null,
      internetIssue: undefined,
    };
  }

  componentWillMount() {
    getCompanyProfileInformation().then((res) => {
      let companyProfile = JSON.parse(res);
      this.setState({ companyProfile });
    }).catch((err) => {
      if(err.status === 0) {
        this.setState({
          internetIssue: true,
        });
      }
    });

    getProfileInformation().then((res) => {
      const profile = JSON.parse(res);
      let permissions = null;
      let is_company = false;
      let view_activity_stream = false;
      if (profile) {
        if (profile && profile.permissions) {
          permissions = profile.permissions
        }
        if (permissions && permissions.includes('COMPANY')) {
          is_company = true
        }
        if (is_company || (permissions && (permissions.includes('SHOW_OWN_ACTIVITY_STREAM') || permissions.includes('SHOW_ALL_ACTIVITY_STREAM')))) {
          view_activity_stream = true;
        }
      }
      this.setState({ profile, view_activity_stream });
      if (!profile || !profile.permissions || !(profile.permissions.includes('COMPANY') || profile.permissions.includes('ACCESS_API'))) {
        history.push('/dashboard');
      }
    }).catch((error) => {
      if (error.status === 401) {
        error_catch(error);
      }else if (error.status === 0) {
        this.setState({
          internetIssue: true,
        });
      }
    });
    const timer = setTimeout(() => {
      this.startAsyncUpdate();
    }, 6e4);
    if (this.setTimer && !document.hidden) {
      this.setState({
        timer,
        internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
      });
    } else {
      clearTimeout(timer);
    }
  }

  activityStreamStateChangeHandler(activityStreamStateHandler) {
    this.setState({
      activityStreamStateHandler
    });
  }

  activityStreamLogoutHandler() {
    this.state.activityStreamStateHandler && this.state.activityStreamStateHandler.logout();
  }

  render() {
    const doc_id = this.props.match.params.doc_id || 'getting-started';
    const paths = this.props.match.path.split(':');
    let base_path = paths[0];
    const lastChar = base_path[base_path.length -1];
    if (lastChar !== '/') {
      base_path = base_path + '/';
    }
    const trialExpired = isTrialExpire(this.state.companyProfile);
    return (
      <div className={styles['full-height'] + ' activity-stream-right-space'}>
        <ErrorAlert errorText="No Internet Connection Available..." showError={this.state.internetIssue}/>
        <DefaultHelmet/>
        <ActivityStream showActivities={this.state.view_activity_stream} onStateChange={activityStreamStateHandler => { this.activityStreamStateChangeHandler(activityStreamStateHandler) }}/>
        <div className={styles['page-wrap']}  style={trialExpired ? {paddingBottom: '0'} : {}}>
          <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler} router={this.context.router} profile={this.state.profile} companyProfile={this.state.companyProfile}/>
          {trialExpired ? <TrialExpiration companyProfile={this.state.companyProfile} profile={this.state.profile} /> : <div className="container">
            <div className={styles.innerContainer}>
              <div className={styles.box}>
                <h3 className={styles.boxTitle}>Account Summary</h3>
                <div className={styles.boxBody}>
                  <div className={styles.boxBodyInner}>
                    <AccountSummary getProfileInformation={getProfileInformation} updateKeys={updateKeys} />
                    <ApiContentManager doc_id={doc_id} base_path={base_path} />
                  </div>
                </div>
              </div>
            </div>
          </div>}
        </div>
        <div className={styles.footer}>
          <SlimFooterV2 />
        </div>
      </div>
    );
  }
}

Dashboard.contextTypes = {
  router: PropTypes.object.isRequired
};
