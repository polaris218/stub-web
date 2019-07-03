import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorAlert from '../../components/error-alert/error-alert';
import styles from './worker-request.module.scss';
import { RequestsManager, UserHeaderV2, SlimFooterV2, TrialExpiration }  from '../../components';
import { getTasks,
  getEntities,
  getProfileInformation, getCompanyProfileInformation, getAllGroups, getAllWorkerRequests, deleteWorkerRequest, updateWorkerRequest,getWorkerRequest,
  postWorkerRequest, sendWorkerRequest
  } from '../../actions';
import { DefaultHelmet, isTrialExpire } from '../../helpers';
import history from "../../configureHistory";

export default class WorkerRequest extends Component {
  constructor(props, context) {
    super(props, context);

    this.activityStreamStateChangeHandler = this.activityStreamStateChangeHandler.bind(this);
    this.activityStreamLogoutHandler = this.activityStreamLogoutHandler.bind(this);

    this.state = {
      reporter_name: '',
      reporter_id: 0,
      profile: null,
      company_id: 0,
      company_url: '',
      statuses: [],
      companyProfile: null,
      ready: false,
      groups: null,
      internetIssue: undefined,
      activityStreamStateHandler: null,
    };
  }

  componentDidMount() {
    this.setTimer = true;
  }

  componentWillMount() {

    Promise.all([getProfileInformation(), getCompanyProfileInformation()]).then(([res, result]) => {
      const profile = JSON.parse(res);
      const reporter_id = profile.owner;
      let company_id = profile.owned_company_id || profile.owner;
      let company_url = profile.owner_url || '';

      const companyProfile = JSON.parse(result);
      this.setState({ profile, reporter_name: profile.fullname, reporter_id, company_id, company_url, companyProfile: companyProfile, ready: true });
      const can_view_settings = profile && profile.permissions && (profile.permissions.includes('COMPANY') || profile.permissions.includes('VIEW_WORKER_REQUEST'));
      if (!can_view_settings) {
        history.push('/dashboard');
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
      <div className={styles['full-height'] + ' activity-stream-right-space-mark'}>
        <ErrorAlert errorText="No Internet Connection Available..." showError={this.state.internetIssue}/>
        <DefaultHelmet/>
        <div className={styles['page-wrap']} style={trialExpired ? {paddingBottom: '0'} : {}}>
          <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler} router={this.context.router} profile={this.state.profile} companyProfile={this.state.companyProfile}/>
          {trialExpired ? <TrialExpiration companyProfile={this.state.companyProfile} profile={this.state.profile} /> : <div>
            {this.state.ready &&
            <RequestsManager
              reporter_name={this.state.reporter_name} reporter_id={this.state.reporter_id} company_id={this.state.company_id} company_url={this.state.company_url}
              getTasks={getTasks}
              getEntities={getEntities}
              getWorkerRequests={getAllWorkerRequests}
              deleteWorkerRequest={deleteWorkerRequest}
              updateWorkerRequest={updateWorkerRequest}
              postWorkerRequest={postWorkerRequest}
              sendWorkerRequest={sendWorkerRequest}
              getWorkerRequest={getWorkerRequest}
              locationQuery={this.props.location.search}
              location={this.props.location}
              statuses={this.state.statuses}
              profile={this.state.profile}
              companyProfile={this.state.companyProfile !== null ? this.state.companyProfile : this.state.profile}
              groups={this.state.groups}
              match={this.props.match}
              activityStreamStateChangeHandler={this.activityStreamStateChangeHandler}
              activityStreamStateHandler={this.state.activityStreamStateHandler}
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

WorkerRequest.contextTypes = {
	router: PropTypes.object.isRequired
};
