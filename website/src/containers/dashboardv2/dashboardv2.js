import React, { Component } from 'react';
import styles from './dashboardv2.moduel.scss';
import ErrorAlert from '../../components/error-alert/error-alert';
import {
  TaskRoutesManagerV4,
  UserHeaderV2,
  SlimFooterV2,
  TaskManagerQuickV4,
  TrialExpiration,
  OnBoarding
} from '../../components';
import {
  getProfileInformation,
  updateCompanyProfileInformation,
  getTasks,
  updateTask,
  getStatus,
  setNewStatus,
  getEstimate,
  getRatings,
  postTask,
  deleteTask,
  getCustomers,
  searchCustomers,
  createCustomer,
  getEquipments,
  getSchedule,
  getTaskSeriesSettings,
  taskSendNotification,
  getCompanyProfileInformation,
  getIntegrationsList,
  getAllGroups,
  getMessages,
  getMessagesNames
} from '../../actions';
import config from '../../config/config';
import { extraFieldsOptions, DefaultHelmet, parseQueryParams, isTrialExpire } from '../../helpers';
import cx from 'classnames';
import { toast, ToastContainer } from 'react-toastify';
const env = config(self).env;
export default class DashboardV2 extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      reporter_name: '',
      reporter_id: 0,
      company_id: 0,
      company_url: '',
      statuses: [],
      equipments: [],
      internetIssue: undefined,
      profile: null,
      companyProfile: null,
      firstTimeUser: false,
      ready: false,
      date: null,
      dashboardType: window.dashboardType ? window.dashboardType : 'tasks',
      groups: null,
      is_enterprise: false,
      headerHeight: null,
      message: '',
      systemMessages:'',
      customMessage:'',
    };

    this.changeDashboard = this.changeDashboard.bind(this);
    this.onDateChanged = this.onDateChanged.bind(this);
    this.activityStreamStateChangeHandler = this.activityStreamStateChangeHandler.bind(this);
    this.activityStreamLogoutHandler = this.activityStreamLogoutHandler.bind(this);
    this.createToastNotification = this.createToastNotification.bind(this);
    this.headerHeight = this.headerHeight.bind(this);
    this.updateProfileData = this.updateProfileData.bind(this);
    this.getExternalIntegrations = this.getExternalIntegrations.bind(this);
    this.compare = this.compare.bind(this);
  }

  componentDidMount() {
    Promise.all([getProfileInformation(), getCompanyProfileInformation()]).then(([res, result]) => {
      const profile = JSON.parse(res);
      const reporter_id = profile.owner;
      let company_id = profile.owned_company_id || profile.owner;
      let company_url = profile.owner_url || '';

      const query = parseQueryParams(this.props.location.search);
      if (query.enterprise && query.enterprise === '1') {
        this.setState({ is_enterprise: true });
      }

      const firstTimeUser = query.source_context && query.source_context === 'signup' && profile;
      if (firstTimeUser && this.joyride) {
        this.joyride.start();
      }
      const companyProfile = JSON.parse(result);
      this.setState({
        reporter_name: profile.fullname,
        reporter_id,
        company_id,
        company_url,
        profile,
        firstTimeUser,
        companyProfile: companyProfile,
        ready: true,
        userProfile: profile,
      });
      if(env !== 'Dev'){
       window.Intercom('update', { 'name': profile.fullname, 'user_id': reporter_id, 'email': profile.support_email });
      }
      getEquipments().then((res) => {
        let equipments = JSON.parse(res);
        this.setState({
          equipments
        });
      }).catch((error) => {
        console.log(error);
      });
      Promise.all([getAllGroups(true), getAllGroups()]).then(([disabledGroups, enableGroups]) => {
        const disabled_groups = JSON.parse(disabledGroups);
        const groups = JSON.parse(enableGroups);
        groups.push.apply(groups, disabled_groups);
        this.setState({ groups });
      }).catch((error) => {
        console.log(error);
      });

      this.getExternalIntegrations();
    }).catch((err) => {
      if (err.status === 0) {
        this.setState({
          internetIssue: true,
        });
      }
    });
    getMessages().then((message)=>{
      const messages = JSON.parse(message);
      const systemMessages = [];
      const customMessages = [];
      messages.map((ccMessage) => {
        if (ccMessage.type === 'SYSTEM') {
          if (ccMessage.sub_type !== "WORKER_REQUEST") {
            systemMessages.push(ccMessage);
          }
        } else if (ccMessage.type === 'CUSTOM') {
          customMessages.push(ccMessage);
        }
      });
      systemMessages.sort(this.compare);
      customMessages.sort(this.compare);

      systemMessages.push.apply(systemMessages, customMessages);

      this.setState({
        message:messages,
        systemAndCustomMessages: systemMessages
      });
    }).catch((error)=>{
      console.log(error);
    });
    this.headerHeight();
    addEventListener('resize', this.headerHeight);
  }

  compare(a, b) {
    const titleA = a.name.toUpperCase();
    const titleB = b.name.toUpperCase();
    if (titleA > titleB) {
      return 1;
    } else if (titleA < titleB) {
      return -1;
    }
  }

  componentWillUnmount() {
    removeEventListener('resize', this.headerHeight);
  }

  onDateChanged(value) {
    this.setState({
      date: value
    });
  }

  changeDashboard() {
    if (this.state.dashboardType === 'tasks') {
      window.dashboardType = 'routes';
      this.setState({
        dashboardType: 'routes'
      });
    } else if (this.state.dashboardType === 'routes') {
      window.dashboardType = 'tasks';
      this.setState({
        dashboardType: 'tasks'
      });
    }
  }

  activityStreamStateChangeHandler(activityStreamStateHandler) {
    this.setState({
      activityStreamStateHandler
    });
  }

  activityStreamLogoutHandler() {
    this.state.activityStreamStateHandler.logout();
  }

  createToastNotification(notification) {
    toast(notification.text, notification.options);
  }

  headerHeight() {
    let { clientHeight } = this.refs.headerContainer;
    this.setState({
      headerHeight: clientHeight
    });
  }

  updateProfileData(profile) {
    this.setState({ companyProfile: profile });
  }

  getExternalIntegrations() {
    Promise.all([getIntegrationsList()]).then(([externalIntegrationsData]) => {
      const externalIntegrations = JSON.parse(externalIntegrationsData);
      this.setState({
        externalIntegrations
      })
    }).catch((error) => {
      console.log(error);
    });
  }
  render() {
    const trialExpired = isTrialExpire(this.state.companyProfile);
    return (
      <div className={cx(styles.dashboardContainer, ' activity-stream-right-space')}>
        <ErrorAlert errorText="No Internet Connection Available..." showError={this.state.internetIssue}/>
        <DefaultHelmet/>
        <ToastContainer className={styles.toastContainer} toastClassName={styles.toast} autoClose={1}/>
        {this.state.firstTimeUser &&
          <OnBoarding
            is_enterprise={this.state.is_enterprise}
            updateProfile={this.updateProfileData}
            updateProfileInformation={updateCompanyProfileInformation}
            profile={this.state.companyProfile}
            userProfile={this.state.profile}
            createToastNotification={this.createToastNotification}
          />
        }
        <div style={{ backgroundColor: '#DFF0FF' }}>
          <div ref="headerContainer">
            <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler} router={this.context.router} profile={this.state.profile} companyProfile={this.state.companyProfile}/>
          </div>
          {trialExpired ? <TrialExpiration companyProfile={this.state.companyProfile} profile={this.state.profile}/> :
            <div>
              {this.state.dashboardType === 'routes' &&
              <TaskRoutesManagerV4
                reporter_name={this.state.reporter_name} reporter_id={this.state.reporter_id}
                company_id={this.state.company_id} company_url={this.state.company_url}
                getEstimate={getEstimate}
                getTasks={getTasks} updateTask={updateTask}
                getRatings={getRatings}
                getStatus={getStatus} setNewStatus={setNewStatus}
                getSchedule={getSchedule}
                equipments={this.state.equipments}
                statuses={this.state.statuses}
                postTask={postTask}
                deleteTask={deleteTask}
                createCustomer={createCustomer}
                getCustomers={getCustomers}
                extraFieldsOptions={extraFieldsOptions}
                getTaskSeriesSettings={getTaskSeriesSettings}
                searchCustomers={searchCustomers}
                taskSendNotification={taskSendNotification}
                profile={this.state.profile}
                location={this.props.location}
                companyProfile={this.state.companyProfile !== null ? this.state.companyProfile : this.state.profile}
                contentLoaded={this.state.ready}
                changeDashboard={this.changeDashboard}
                dashboardType={this.state.dashboardType}
                onDateChanged={this.onDateChanged}
                date={this.state.date}
                groups={this.state.groups}
                match={this.props.match}
                activityStreamStateChangeHandler={this.activityStreamStateChangeHandler}
                activityStreamStateHandler={this.state.activityStreamStateHandler}
                createToastNotification={this.createToastNotification}
                headerHeight={this.state.headerHeight}
                userProfile={this.state.userProfile}
                externalIntegrations={this.state.externalIntegrations}
                getExternalIntegrations={this.getExternalIntegrations}
                systemAndCustomMessages={this.state.systemAndCustomMessages}
              />
              }
              {(this.state.dashboardType === 'tasks') &&
              <TaskManagerQuickV4
                reporter_name={this.state.reporter_name} reporter_id={this.state.reporter_id}
                company_id={this.state.company_id} company_url={this.state.company_url}
                getEstimate={getEstimate}
                getTasks={getTasks} updateTask={updateTask}
                getRatings={getRatings}
                getStatus={getStatus} setNewStatus={setNewStatus}
                getSchedule={getSchedule}
                equipments={this.state.equipments}
                statuses={this.state.statuses}
                postTask={postTask}
                deleteTask={deleteTask}
                createCustomer={createCustomer}
                getCustomers={getCustomers}
                extraFieldsOptions={extraFieldsOptions}
                getTaskSeriesSettings={getTaskSeriesSettings}
                searchCustomers={searchCustomers}
                taskSendNotification={taskSendNotification}
                profile={this.state.profile}
                location={this.props.location}
                companyProfile={this.state.companyProfile !== null ? this.state.companyProfile : this.state.profile}
                changeDashboard={this.changeDashboard}
                dashboardType={this.state.dashboardType}
                onDateChanged={this.onDateChanged}
                date={this.state.date}
                contentLoaded={this.state.ready}
                groups={this.state.groups}
                activityStreamStateChangeHandler={this.activityStreamStateChangeHandler}
                activityStreamStateHandler={this.state.activityStreamStateHandler}
                createToastNotification={this.createToastNotification}
                headerHeight={this.state.headerHeight}
                externalIntegrations={this.state.externalIntegrations}
                getExternalIntegrations={this.getExternalIntegrations}
                systemAndCustomMessages={this.state.systemAndCustomMessages}
              />}
            </div>}
        </div>
        <div className={styles.footer}>
          <SlimFooterV2/>
        </div>
      </div>
    );
  }
}
