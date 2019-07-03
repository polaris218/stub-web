import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './settings.module.scss';
import ErrorAlert from '../../components/error-alert/error-alert';
import { getServerOrigin } from '../../helpers/url';
import { AccountWrapperV2, UserHeaderV2, FooterComponent, FooterConfiguration, SlimFooterV2, ActivityStream, TrialExpiration } from '../../components';
import {
  getProfileInformation,
  getCompanyProfileInformation,
  getImageUrl,
  changePassword,
  updateCompanyProfileInformation,
  updateProfileImage,
  removeProfileImage,
  updatePlan,
  getEntities,
  getCustomCommunication,
  updateCustomCommunication,
  deleteSlackIntegration
} from '../../actions';
import { DefaultHelmet, isTrialExpire } from '../../helpers';

export default class Settings extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      profile: null,
      companyProfile: null,
      internetIssue: undefined,
    };
    this.slackOAuthFlow = this.slackOAuthFlow.bind(this);
    this.activityStreamStateChangeHandler = this.activityStreamStateChangeHandler.bind(this);
    this.activityStreamLogoutHandler = this.activityStreamLogoutHandler.bind(this);
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
      // if (!profile || !profile.permissions ||!(profile.permissions.includes('COMPANY') || profile.permissions.includes('VIEW_SETTING'))) {
      //   this.context.router.history.push('/dashboard');
      // }
    }).catch((error) => {
      if (error.status === 0) {
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

  slackOAuthFlow() {
    const redirectUrl = getServerOrigin() + this.props.match.url + '?slack-auth-complete';
    deleteSlackIntegration().then(() => {
      window.location.href = "/oauth/slack?next=" + redirectUrl;
    }).catch(() => {
      window.location.href = "/oauth/slack?next=" + redirectUrl;
    });


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
    const trialExpired = isTrialExpire(this.state.companyProfile);
    return (
        <div className={styles['full-height'] + ' activity-stream-right-space'}>
          <ErrorAlert errorText="No Internet Connection Available..." showError={this.state.internetIssue}/>
          <DefaultHelmet/>
          <ActivityStream showActivities={this.state.view_activity_stream} onStateChange={activityStreamStateHandler => { this.activityStreamStateChangeHandler(activityStreamStateHandler) }}/>
          <div className={styles['page-wrap']} style={trialExpired ? {paddingBottom: '0'} : {}}>
            <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler} router={this.context.router} profile={this.state.profile} companyProfile={this.state.companyProfile}/>
            {trialExpired ? <TrialExpiration companyProfile={this.state.companyProfile} profile={this.state.profile} /> :
            <AccountWrapperV2
              getUserProfileInformation={getProfileInformation}
              getProfileInformation={getCompanyProfileInformation}
              getImageUrl={getImageUrl}
              updateProfileInformation={updateCompanyProfileInformation}
              updateProfileImage={updateProfileImage}
              removeProfileImage={removeProfileImage}
              updatePlan={updatePlan}
              getCustomCommunication={getCustomCommunication}
              updateCustomCommunication={updateCustomCommunication}
              slackOAuthFlow={this.slackOAuthFlow}
              getEntities={getEntities}
              pageParams={this.props.match.params}
              profile={this.state.profile}
              companyProfile={this.state.companyProfile}
            />}
          </div>
          <div className={styles.footer}>
            <SlimFooterV2 links={FooterConfiguration}/>
          </div>
      </div>
    );
  }
}

Settings.contextTypes = {
  router: PropTypes.object.isRequired,
  params: PropTypes.object
};

Settings.propTypes = {
  params: PropTypes.object
};
