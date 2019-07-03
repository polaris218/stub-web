import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorAlert from '../../components/error-alert/error-alert';
import styles from './equipment.module.scss';
import {
    EquipmentManagerV2,
    FooterComponent,
    FooterConfiguration,
    UserHeaderV2,
    SlimFooterV2,
    ActivityStream,
    TrialExpiration,
    EntityManager
} from '../../components';
import {
  getEquipments, getProfileInformation, getCompanyProfileInformation,
  createEquipment, deleteEquipment, updateEquipment,
  getEquipmentImageUrl, updateEquipmentImage, removeEquipmentImage, getAllGroups
} from '../../actions';
import { DefaultHelmet, isTrialExpire } from '../../helpers';

export default class Crew extends Component {
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
      if (!profile || !profile.permissions || !(profile.permissions.includes('COMPANY') || profile.permissions.includes('VIEW_FULL_EQUIPMENT_DETAILS'))) {
        this.context.router.history.push('/dashboard');
      }
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

    Promise.all([getAllGroups(true), getAllGroups()]).then(([disabledGroups, enableGroups]) => {
      const disabled_groups = JSON.parse(disabledGroups);
      const groups = JSON.parse(enableGroups);
      groups.push.apply(groups, disabled_groups);
      this.setState({ groups });
    }).catch((error) => {
      console.log(error);
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
        <div className={styles['page-wrap']}  style={trialExpired ? {paddingBottom: '0'} : {}}>
          <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler} router={this.context.router} profile={this.state.profile} companyProfile={this.state.companyProfile}/>
          {trialExpired ? <TrialExpiration companyProfile={this.state.companyProfile} profile={this.state.profile} /> :
            <EquipmentManagerV2
              createEquipment={createEquipment}
              updateEquipments={getEquipments}
              deleteEquipment={deleteEquipment}
              updateEquipment={updateEquipment}
              getEquipmentImageUrl={getEquipmentImageUrl}
              updateEquipmentImage={updateEquipmentImage}
              removeEquipmentImage={removeEquipmentImage}
              profile={this.state.profile}
              groups={this.state.groups}
              activityStreamStateChangeHandler={this.activityStreamStateChangeHandler}
              activityStreamStateHandler={this.state.activityStreamStateHandler}
              view_activity_stream ={this.state.view_activity_stream}
            />
          }
        </div>
        <div className={styles.footer}>
          <SlimFooterV2 />
        </div>
      </div>
    );
  }
}

Crew.contextTypes = {
  router: PropTypes.object.isRequired
};
