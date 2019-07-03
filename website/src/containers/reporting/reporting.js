import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorAlert from '../../components/error-alert/error-alert';
import styles from './reporting.module.scss';
import {
  FooterComponent,
  FooterConfiguration,
  UserHeaderV2,
  ReportingMain,
  SlimFooterV2,
  TrialExpiration,
  AccountWrapperV2
} from '../../components';
import { getProfileInformation, getCompanyProfileInformation, getEntities, getEquipments, getAllGroups } from '../../actions';
import { DefaultHelmet, isTrialExpire } from '../../helpers';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import config from '../../config/config';
const env = config(self).env;
export default class Reporting extends Component {
  constructor(props, context) {
    super(props, context);

    this.activityStreamStateChangeHandler = this.activityStreamStateChangeHandler.bind(this);
    this.activityStreamLogoutHandler = this.activityStreamLogoutHandler.bind(this);

    this.state = {
      reporter_name: '',
      reporter_id: 0,
      statuses: [],
      equipments: [],
      // entities: [],
      profile: null,
      companyProfile: null,
      contentLoaded: false,
      groups: null,
      internetIssue: undefined,
    };
  }

  componentDidMount() {
  if(env !== 'Dev') {
    window.Intercom("boot", {
      app_id: "vfdmrett"
    });
  }
    this.setState({
      contentLoaded: false
    });

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
      const reporter_id = profile.owner;

      this.setState({
        reporter_name: profile.fullname,
        reporter_id,
        statuses: profile.statuses,
        profile,
        contentLoaded: true
      });
      if (!profile || !profile.permissions || !(profile.permissions.includes('COMPANY') || profile.permissions.includes('VIEW_REPORTING'))) {
        this.context.router.history.push('/dashboard');
      }
      window.Intercom('update', {"name":  profile.fullname, "user_id": reporter_id, "email": profile.support_email});
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
    // getEntities().then((res) => {
    //   this.setState({
    //     entities: JSON.parse(res),
    //     // contentLoaded: true
    //   });
    // }).catch((err) => {
    //   console.log(err);
    // });

    getAllGroups().then((res) => {
      const groups = JSON.parse(res);
      this.setState({ groups });
    }).catch((error) => {
      console.log(error);
    });

    // getEquipments().then((res) => {
    //   this.setState({
    //     equipments: JSON.parse(res),
    //     contentLoaded: true
    //   });
    // }).catch((err) => {
    //   console.log(err);
    // });
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
      <div className={styles['full-height'] + ' activity-stream-right-space-mark'}>
        <ErrorAlert errorText="No Internet Connection Available..." showError={this.state.internetIssue}/>
        <DefaultHelmet/>
        <div className={styles['page-wrap']} style={trialExpired ? {paddingBottom: '0'} : {}}>
          <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler}  router={this.context.router} profile={this.state.profile} companyProfile={this.state.companyProfile}/>
          {trialExpired ? <TrialExpiration companyProfile={this.state.companyProfile} profile={this.state.profile} /> : <div>
            {!this.state.contentLoaded &&
              <div className={styles.pageLoadingContainer}>
                <SavingSpinner title="" borderStyle="none" />
              </div>
            }
            {this.state.contentLoaded &&
              <ReportingMain
                // entities={this.state.entities}
                equipments={this.state.equipments}
                profile={this.state.profile}
                groups={this.state.groups}
                activityStreamStateChangeHandler={this.activityStreamStateChangeHandler}
                activityStreamStateHandler={this.state.activityStreamStateHandler}
                pageParams={this.props.match.params}
              />
            }
          </div>}
        </div>
        <div className={styles.footer}>
          <SlimFooterV2 />
        </div>
      </div>
    );
  }
}

Reporting.contextTypes = {
  router: PropTypes.object.isRequired
};
