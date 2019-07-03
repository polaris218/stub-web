import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './tasks.module.scss';
import { FooterComponent, FooterConfiguration, UserHeaderV2, TaskForm, TaskStatus, TaskWrapper, TaskWrapperV2, SlimFooterV2, ActivityStream, TrialExpiration }  from '../../components';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import { Link } from 'react-router-dom';
import { DefaultHelmet, isTrialExpire } from '../../helpers';
import { getErrorMessage } from '../../helpers/task';
import {error_catch} from '../../helpers/error_catch';
import {
  postTask,
  updateTask, deleteTask, getCustomers, searchCustomers, createCustomer, getEntities,
  getProfileInformation, getStatus, setNewStatus,
  getEstimate, getTask, getRatings, getSchedule, getEquipments, taskSendNotification, getTaskSeriesSettings,
  getTemplates, getCompanyProfileInformation, getAllGroups, getMessages
} from '../../actions';
import extraFieldsOptions from '../../helpers/extra_fields_options';
import history from '../../configureHistory';
import { toast, ToastContainer } from 'react-toastify';
import $ from 'jquery';

const errorMsg = (error) => {
  return getErrorMessage(error);
};


export default class TaskPage extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      loadingTask: true,
      task: '',
      entities: [],
      equipments: [],
      taskDeleted: false,
      reporter_name: '',
      reporter_id: 0,
      company_id: 0,
      company_url: 0,
      statuses: [],
      companyProfile: null
    };

    this.taskDeletedCallback = this.taskDeletedCallback.bind(this);
    this.taskUpdatedCallback = this.taskUpdatedCallback.bind(this);
    this.taskAddedCallback = this.taskAddedCallback.bind(this);
    this.taskAssigneeUpdatedCallback = this.taskAssigneeUpdatedCallback.bind(this);
    this.taskEquipmentUpdatedCallback = this.taskEquipmentUpdatedCallback.bind(this);
    this.handleTaskTypeChange = this.handleTaskTypeChange.bind(this);
    this.getTemplateStatuses = this.getTemplateStatuses.bind(this);
    this.createToastAlert = this.createToastAlert.bind(this);
    this.activityStreamStateChangeHandler = this.activityStreamStateChangeHandler.bind(this);
    this.activityStreamLogoutHandler = this.activityStreamLogoutHandler.bind(this);
    this.getTaskState = this.getTaskState.bind(this);
    this.compare = this.compare.bind(this);
  }

  componentDidMount() {
    Promise.all([getProfileInformation(), getTask(this.props.match.params.task_id), getEntities(), getEquipments(),
      getTemplates(), getCompanyProfileInformation(), getAllGroups(true), getAllGroups()])
      .then(([profileRes, taskRes, entitiesRes, equipmentsRes, templatesRes, companyProfileRes, groupRes, disabledGroups]) => {
      const profile = JSON.parse(profileRes);
      const task = JSON.parse(taskRes);
      const entities = JSON.parse(entitiesRes);
      const equipments = JSON.parse(equipmentsRes);
      const templates = JSON.parse(templatesRes);
      const companyProfile = JSON.parse(companyProfileRes);
      const groups = JSON.parse(groupRes);
      const disabled_groups = JSON.parse(disabledGroups);
      groups.push.apply(groups, disabled_groups);
      const reporter_id = profile.owner;
      let company_id = profile.owned_company_id || profile.owner;
      let company_url = profile.owner_url || '';
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
      let statuses = this.props.statuses;
      if (task && task.template_type && task.template_type.toUpperCase() === 'ACTIVITY') {
        statuses = [{
          title: 'COMPLETE',
          type: 'COMPLETE',
          color: '#5fe23f',
          type_id: 1004,
        }];
      } else if (profile && profile.statuses) {
        statuses = profile.statuses
      }
      this.setState({
        reporter_name: profile.fullname,
        reporter_id,
        company_id,
        profile,
        task,
        company_url,
        statuses: task.template !== null ? this.getTemplateStatuses(task.template, templates) : statuses,
        entities,
        equipments,
        templates,
        companyProfile,
        loadingTask: false,
        groups,
        view_activity_stream,
        userProfile: profile
      });
    }).catch((error) => {
      console.log(error);
      if (error.status === 404) {
        this.setState({ task: '', loadingTask: false });
      } else if (error.status === 401) {
        error_catch(error);
      } else {
        this.setState({
          loadingTask: false
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
        message: messages,
        systemAndCustomMessages: systemMessages
      });
    }).catch((error)=>{
      console.log(error);
    });
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

  getTemplateStatuses(template_id, templates) {
    if(template_id !== "DEFAULT") {
      let selectedTemplate = null;
      templates.map((template) => {
        if (template_id == template.id) {
          selectedTemplate = template;
        }
      });
      if (selectedTemplate !== null) {
        return selectedTemplate.status_data;
      } else {
        return this.props.statuses;
      }
    } else {
      return this.props.statuses;
    }
  }

  getTaskState(taskId) {
    getTask(taskId).then((taskRes) => {
      const task = JSON.parse(taskRes);
      this.setState({task});
    });
  }

  handleTaskTypeChange(template_id) {
    if(template_id !== "DEFAULT") {
      let selectedTemplate = null;
      this.state.templates.map((template) => {
        if (template_id == template.id) {
          selectedTemplate = template;
        }
      });
      if (selectedTemplate !== null) {
        this.setState({
          statuses: selectedTemplate.status_data
        });
      } else {
        this.setState({
          statuses: this.props.statuses
        });
      }
    } else {
      this.setState({
        statuses: this.props.statuses
      })
    }
  }

  conformTaskToServerReturnedStructure(task) {
    if ($.type(task.entity_ids) === "string") {
      const array = task.entity_ids.split(',');
      const int_array = [];
      for (let i = 0; i < array.length; i++) {
        if (array[i] !== "") {
          int_array.push(parseInt(array[i], 10));
        }
      }

      task.entity_ids = int_array;
    }

    if ($.type(task.document_ids) === "string") {
      const array = task.document_ids.split(',');
      const int_array = [];
      for (let i = 0; i < array.length; i++) {
        if (array[i] !== "") {
          int_array.push(parseInt(array[i], 10));
        }
      }
      task.document_ids = int_array;
    }

    if ($.type(task.template_extra_fields) === 'string') {
      const template_extra_fields = JSON.parse(task.template_extra_fields);
      task.template_extra_fields = template_extra_fields;
    }

    if ($.type(task.resource_ids) === "string") {
      const array = task.resource_ids.split(',');
      const int_array = [];
      for (let i = 0; i < array.length; i++) {
        if (array[i] !== "") {
          int_array.push(parseInt(array[i], 10));
        }
      }

      task.resource_ids = int_array;
    }

    if ($.type(task.extra_fields) === "string") {
      const extra_fields = JSON.parse(task.extra_fields);
      task.extra_fields = extra_fields;
    }

    if( typeof task.customer_exact_location === "string" ) {
      const customer_exact_location = JSON.parse(task.customer_exact_location);
      task.customer_exact_location = customer_exact_location;
    }

    if( typeof task.notifications === "string" ) {
      const notifications = JSON.parse(task.notifications);
      task.notifications = notifications;
    }

    if($.type(task.additional_addresses) === "string") {
      const additional_addresses = JSON.parse(task.additional_addresses);
      task.additional_addresses = additional_addresses;
    }

    return task;
  }

  createNewTask(task){
    this.setState({
      task: '',
      loadingTask: true
    });
    postTask(task).then((res) => {
      const
        newTask = JSON.parse(res),
        taskProcessed = this.conformTaskToServerReturnedStructure(task);
      taskProcessed.id = newTask.id;
      taskProcessed.url_safe_id = newTask.url_safe_id;
      history.push('/tasks/' + taskProcessed.id);
      this.setState({
        loadingTask: false,
        task: taskProcessed
      });
    }).catch((error) => {
      console.log('Error occurred, details: ' + error);
      this.setState({
        loadingTask: false,
        task: ''
      });
    });
  }

  duplicateTask(task){
    const duplicatedTask = {};
    Object.assign(duplicatedTask, task);
    duplicatedTask.id = null;
    duplicatedTask.title = 'Copy of ' + duplicatedTask.title;
    duplicatedTask.series_id = null;
    duplicatedTask.url_safe_id = null;
    duplicatedTask.status = "NOTSTARTED";
    this.createNewTask(duplicatedTask);
  }

  taskUpdatedCallback(task, createDuplicate = false) {
    this.setState({
      task: this.conformTaskToServerReturnedStructure(task)
    });
    if(createDuplicate === true){
      this.duplicateTask(task);
    }
  }

  taskAddedCallback(task, createDuplicate = false) {
    this.setState({
      task: this.conformTaskToServerReturnedStructure(task)
    });
    if(createDuplicate === true){
      this.duplicateTask(task);
    }
  }

  taskDeletedCallback(task_id) {
    this.setState({
      taskDeleted: true,
      task: ''
    });
  }

  taskAssigneeUpdatedCallback(entity_ids) {
    this.state.task.entity_ids = entity_ids;
    this.forceUpdate();
  }

  taskEquipmentUpdatedCallback(resource_ids) {
    this.state.task.resource_ids = resource_ids;
    this.forceUpdate();
  }

	createToastAlert(alert) {
  	toast(alert.text, alert.options);
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
        <DefaultHelmet/>
	      <ToastContainer className={styles.toastContainer} toastClassName={styles.toast} autoClose={1}/>
        <ActivityStream showActivities={this.state.view_activity_stream} onStateChange={activityStreamStateHandler => { this.activityStreamStateChangeHandler(activityStreamStateHandler) }}/>
        <div className={styles['page-wrap']}>
          <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler} router={this.context.router} profile={this.state.profile} companyProfile={this.state.companyProfile}/>
          {trialExpired ? <TrialExpiration companyProfile={this.state.companyProfile} profile={this.state.profile} /> : <div>
            {this.state.loadingTask &&
              <div className={styles.loading}>
                <SavingSpinner title="Loading Task" borderStyle="none" />
              </div>
            }

            {(!this.state.loadingTask && !this.state.task && !this.state.taskDeleted) &&
              <div className={styles['no-task'] + ' text-danger'}>Task can't be found.</div>
            }

            {this.state.taskDeleted &&
              <div className={styles['no-task'] + ' text-success'}>
                Task Deleted. <Link to="/tasks">Click Here</Link> to go back.
              </div>
            }

            {(!this.state.loadingTask && this.state.task && !this.state.taskDeleted) &&
              <TaskWrapperV2
                selectedTask={this.state.task}
                company_id={this.state.company_id}
                reporter_name={this.state.reporter_name}
                reporter_id={this.state.reporter_id}
                company_url={this.state.company_url}
                getTaskStatus={getStatus}
                getTaskRatings={getRatings}
                updateTaskStatus={setNewStatus}
                getEstimate={getEstimate}
                getSchedule={getSchedule}
                getTaskSeriesSettings={getTaskSeriesSettings}
                statuses={this.state.statuses ? this.state.statuses : (this.state.profile.statuses)}
                entities={this.state.entities}
                equipments={this.state.equipments}
                pageView
                getCustomers={getCustomers}
                searchCustomers={searchCustomers}
                createCustomer={createCustomer}
                extraFieldsOptions={extraFieldsOptions}
                taskUpdatedCallback={this.taskUpdatedCallback}
                taskAddedCallback={this.taskAddedCallback}
                taskDeletedCallback={this.taskDeletedCallback}
                taskAssigneeUpdatedCallback={this.taskAssigneeUpdatedCallback}
                taskEquipmentUpdatedCallback={this.taskEquipmentUpdatedCallback}
                handleTaskTypeChange={this.handleTaskTypeChange}
                updateTask={updateTask}
                deleteTask={deleteTask}
                postTask={postTask}
                taskSendNotification={taskSendNotification}
                templates={this.state.templates}
                profile={this.state.profile}
                companyProfile={this.state.companyProfile ? this.state.companyProfile : this.state.profile}
                groups={this.state.groups}
                createToastNotification={this.createToastAlert}
                getTaskState={this.getTaskState}
                singleTask={true}
                userProfile={this.state.userProfile}
                systemAndCustomMessages={this.state.systemAndCustomMessages}
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

TaskPage.contextTypes = {
  router: PropTypes.object.isRequired,
  params: PropTypes.object
};

TaskPage.propTypes = {
  params: PropTypes.object
};
