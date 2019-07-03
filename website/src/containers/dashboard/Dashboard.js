import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Joyride from 'react-joyride';
import styles from './dashboard.module.scss';
import ErrorAlert from '../../components/error-alert/error-alert';
import {
	AccountSummary,
	TasksManagerQuickV3,
  TasksManagerQuickV2,
	FooterComponent,
	FooterConfiguration,
	UserHeader,
	ModalSteps,
  SlimFooterV2
}  from '../../components';
import {
  getProfileInformation, updateKeys, updateCompanyProfileInformation,
  getTasks, updateTask, getStatus, setNewStatus, getEstimate, getRatings,
  postTask, deleteTask, getCustomers, searchCustomers, createCustomer,
  getEquipments, getSchedule, getTaskSeriesSettings, taskSendNotification,
  getCompanyProfileInformation, getAllGroups
} from '../../actions';
import { extraFieldsOptions, DefaultHelmet } from '../../helpers';
import { parseQueryParams } from '../../helpers';
import {error_catch} from '../../helpers/error_catch';

export default class Dashboard extends Component {
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
      joyrideOverlay: true,
      joyrideType: 'continuous',
      ready: false,
      date: null,
      dashboardType: window.dashboardType ? window.dashboardType : 'tasks',
      groups: null,
      steps: [{
        title: 'This is your daily dashboard',
        text: 'Check on the status of today\'s tasks and live location of your team members here',
        selector: '#sidebar-Dashboard',
        position: 'bottom',
        style: {
          backgroundColor: '#008BF8',
          color: '#fff',
          mainColor: '#00d494',
          beacon: {
            inner: '#c4ff9e',
            outer: '#c4ff9e'
          }
        }
      }, {
        title: 'Calendar is your detailed view of all tasks',
        text: 'Schedule work in advance for your team and check history of tasks, notes, attachments, customer reviews etc.',
        selector: '#sidebar-Calendar',
        position: 'bottom',
        style: {
          backgroundColor: '#008BF8',
          color: '#fff',
          mainColor: '#00d494',
          beacon: {
            inner: '#c4ff9e',
            outer: '#c4ff9e'
          }
        }
      }, {
        title: 'Find your team here',
        text: 'You can add team members here and check their latest location.',
        selector: '#sidebar-Team',
        position: 'bottom',
        style: {
          backgroundColor: '#008BF8',
          color: '#fff',
          mainColor: '#00d494',
          beacon: {
            inner: '#c4ff9e',
            outer: '#c4ff9e'
          }
        }
      }, {
        title: 'Setup your company\'s profile',
        text: 'Add your company logo, introduction and social links. This information will be visible to customers when they live track their orders and will be presented with your profile on task completion.',
        selector: '#sidebar-Settings',
        position: 'bottom',
        style: {
          backgroundColor: '#008BF8',
          color: '#fff',
          mainColor: '#00d494',
          beacon: {
            inner: '#c4ff9e',
            outer: '#c4ff9e'
          }
        }
      }, {
        title: 'Let\'s schedule your first task',
        text: '<div><p>Task is a customer appointment, order or delivery. Set task date and time, fill in customer\'s details and assign to a team member. Arrivy will take care of sending task confirmation, reminders and arrival notifications.</p><p>Once a task is created click on task\'s card to see it\'s status</p></div>',
        selector: '#create-new-task-button',
        position: 'bottom',
        style: {
          backgroundColor: '#008BF8',
          color: '#fff',
          mainColor: '#00d494',
          beacon: {
            inner: '#ffc548',
            outer: '#ffc548'
          }
        }
      }]
		};

    this.changeDashboard = this.changeDashboard.bind(this);
    this.onDateChanged = this.onDateChanged.bind(this);
	}

	componentDidMount() {

    window.Intercom("boot", {
      app_id: "vfdmrett"
    });

    Promise.all([getProfileInformation(), getCompanyProfileInformation()]).then(([res, result]) => {
      const profile = JSON.parse(res);
      const reporter_id = profile.owner;
      let company_id = profile.owned_company_id || profile.owner;
      let company_url = profile.owner_url || '';

      const query = parseQueryParams(this.props.location.search);

      const firstTimeUser = query.source_context && query.source_context === 'signup' && profile;
      if(firstTimeUser && this.joyride) {
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
        ready: true
      });

      window.Intercom('update', { 'name':  profile.fullname, 'user_id': reporter_id, 'email': profile.support_email });

      getEquipments().then((res) => {
        let equipments = JSON.parse(res);
        this.setState({
          equipments
        });
      }).catch((error) => {
        console.log(error);
      });
      getAllGroups(true).then((res) => {
        const groups = JSON.parse(res);
        this.setState({ groups });
      }).catch((error) => {
        console.log(error);
      });
    }).catch((err) => {
      if (err.status === 401) {
        error_catch(err);
      }else if (err.status === 0){
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

  render() {
		return (
			<div className={styles['full-height'] + ' activity-stream-right-space'}>
        <ErrorAlert errorText="No Internet Connection Available..." showError={this.state.internetIssue}/>
				<DefaultHelmet/>
        <Joyride
          ref={c => (this.joyride = c)}
          debug={false}
          steps={this.state.steps}
          type={this.state.joyrideType}
          locale={{
            back: (<span>Back</span>),
            close: (<span>Close</span>),
            last: (<span>Last</span>),
            next: (<span>Next</span>),
            skip: (<span>Skip</span>)
          }}
          showOverlay={this.state.joyrideOverlay}
          callback={this.callback} />

				{ this.state.firstTimeUser && <ModalSteps updateProfileInformation={ updateCompanyProfileInformation } profile={ this.state.profile }/> }
				<div className={styles['page-wrap']}>
					<UserHeader router={this.context.router} profile={this.state.profile}/>
          {this.state.dashboardType === 'routes' &&
          <TasksManagerQuickV3
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
          />
          }
          {(this.state.dashboardType === 'tasks') &&
          <TasksManagerQuickV2
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
          />}
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
