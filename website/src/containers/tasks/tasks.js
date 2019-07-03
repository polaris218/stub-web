import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorAlert from '../../components/error-alert/error-alert';
import styles from './tasks.module.scss';
import { TasksManager, FooterComponent, FooterConfiguration, UserHeaderV2, SlimFooterV2, TrialExpiration }  from '../../components';
import {
  getTasks, postTask,
  updateTask, deleteTask, getCustomers, searchCustomers, createCustomer, getEntities,
  getProfileInformation, getStatus, setNewStatus,
  getEstimate, googleEvents, getRatings,
  getEquipments, getSchedule, getTaskSeriesSettings, taskSendNotification, getCompanyProfileInformation, getAllGroups, getAllWorkerRequests, deleteWorkerRequest, updateWorkerRequest,
  postWorkerRequest, sendWorkerRequest,getIntegrationsList,
  getMessages
} from '../../actions';

import { getServerOrigin } from '../../helpers/url';
import extraFieldsOptions from '../../helpers/extra_fields_options';
import { DefaultHelmet, isTrialExpire } from '../../helpers';
import cx from 'classnames';
import TopBar from "../../components/task-manager-quick-v4/task-manager-quick-v4";

export default class Tasks extends Component {
	constructor(props, context) {
		super(props, context);
		this.googleOAuthFlow = this.googleOAuthFlow.bind(this);
    this.activityStreamStateChangeHandler = this.activityStreamStateChangeHandler.bind(this);
    this.activityStreamLogoutHandler = this.activityStreamLogoutHandler.bind(this);
    this.mediaPrint = this.mediaPrint.bind(this);
    this.getExternalIntegrations = this.getExternalIntegrations.bind(this);
    this.compare = this.compare.bind(this);

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
      print: false
		};
	}

	componentDidMount() {
    this.setTimer = true;
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

  componentWillMount() {

		Promise.all([getProfileInformation(), getCompanyProfileInformation()]).then(([res, result]) => {
      const profile = JSON.parse(res);
      const reporter_id = profile.owner;
      let company_id = profile.owned_company_id || profile.owner;
      let company_url = profile.owner_url || '';

      const companyProfile = JSON.parse(result);
      this.setState({ profile, reporter_name: profile.fullname, reporter_id, company_id, company_url, companyProfile: companyProfile, ready: true });
		}).catch((error) => {
      if (error.status === 0) {
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

    this.getExternalIntegrations();
	}

	googleOAuthFlow() {
		const redirectUrl = getServerOrigin() + this.props.match.path + '?google-calendar-auth-complete';
		window.location.href = "/oauth/google?next=" + redirectUrl;
	}

  activityStreamStateChangeHandler(activityStreamStateHandler) {
    this.setState({
      activityStreamStateHandler
    });
  }

  activityStreamLogoutHandler() {
    this.state.activityStreamStateHandler && this.state.activityStreamStateHandler.logout();
  }

  mediaPrint(print) {
	  this.setState({
      print
    });
  }

  getExternalIntegrations(){
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
			<div className={styles['full-height'] + ' activity-stream-right-space-mark'}>
        <style type="text/css">
          {'.' + styles.noPrint + '{ display:inherit}'}
        </style>
        <style type="text/css" media="print">
          {'.' + styles.noPrint + '{ display:none}'}
          {'.' + styles.footer + '{ display:none}'}
          {'header, footer { display:none}'}
          {'.' + styles.logoPrint + '{ display:block;margin-bottom: 10px}'}
          {'.' + styles.logoPrint + ' img{ max-width: 80px; height:auto; max-height: 27px;}'}
          {'.' + styles['page-wrap'] + '{ padding: 0px; min-height: inherit}'}
          {'@page { margin: 10mm; size: A4 landscape;}'}
          {'*, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; -webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;}'}
          {'html, body { font: 300 12px/16px Nunito,-apple-system,BlinkMacSystemFont,sans-serif;height: 99%;page-break-after: avoid;page-break-before: avoid}'}
        </style>
        <div className={cx(this.state.print && styles.noPrint)}>
          <ErrorAlert errorText="No Internet Connection Available..." showError={this.state.internetIssue}/>
        </div>
        <DefaultHelmet/>
				<div className={styles['page-wrap']} style={trialExpired ? {paddingBottom: '0'} : {}}>
          <div className={styles.logoPrint}><img src='/images/logo-dark.png' alt='Arrivy' width="80px" height="27px" /></div>
          <div className={cx(this.state.print && styles.noPrint)}>
            <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler} router={this.context.router} profile={this.state.profile} companyProfile={this.state.companyProfile}/>
          </div>
          {trialExpired ? <TrialExpiration companyProfile={this.state.companyProfile} profile={this.state.profile} /> : <div>
            {this.state.ready &&
            <TasksManager
              reporter_name={this.state.reporter_name} reporter_id={this.state.reporter_id} company_id={this.state.company_id} company_url={this.state.company_url}
              getEstimate={getEstimate}
              getTasks={getTasks} postTask={postTask} updateTask={updateTask} deleteTask={deleteTask}
              getRatings={getRatings}
              getEquipments={getEquipments}
              getSchedule={getSchedule}
              getStatus={getStatus} setNewStatus={setNewStatus}
              createCustomer={createCustomer} getCustomers={getCustomers} searchCustomers={searchCustomers}
              getEntities={getEntities} extraFieldsOptions={extraFieldsOptions}
              googleOAuthFlow={this.googleOAuthFlow}
              googleEvents={googleEvents}
              getTaskSeriesSettings={getTaskSeriesSettings}
              getWorkerRequests={getAllWorkerRequests}
              deleteWorkerRequest={deleteWorkerRequest}
              updateWorkerRequest={updateWorkerRequest}
              postWorkerRequest={postWorkerRequest}
              sendWorkerRequest={sendWorkerRequest}
              locationQuery={this.props.location.search}
              location={this.props.location}
              statuses={this.state.statuses}
              taskSendNotification={taskSendNotification}
              profile={this.state.profile}
              companyProfile={this.state.companyProfile !== null ? this.state.companyProfile : this.state.profile}
              groups={this.state.groups}
              match={this.props.match}
              activityStreamStateChangeHandler={this.activityStreamStateChangeHandler}
              activityStreamStateHandler={this.state.activityStreamStateHandler}
              mediaPrint={this.mediaPrint}
              externalIntegrations={this.state.externalIntegrations}
              getExternalIntegrations={this.getExternalIntegrations}
              systemAndCustomMessages={this.state.systemAndCustomMessages}
            />
            }
				  </div>}
				</div>
				<div className={cx(styles.footer, styles.noPrint)}>
          <SlimFooterV2 />
				</div>
			</div>
		);
	}
}

Tasks.contextTypes = {
	router: PropTypes.object.isRequired
};
