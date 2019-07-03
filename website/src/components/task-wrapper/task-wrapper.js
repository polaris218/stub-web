import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TaskForm, TaskStatus, TaskReview } from '../index';
import { Grid, DropdownButton, MenuItem } from 'react-bootstrap';
import styles from './task-wrapper.module.scss';
import cx from 'classnames';
import { getTaskFileAttachmentUploadURL, uploadAttachment, getTaskItemsList }from '../../actions';
import moment from 'moment-timezone';
import SavingSpinner from '../saving-spinner/saving-spinner';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/fontawesome-free-solid';
import { getErrorMessage } from '../../helpers/task';
import { toast, ToastContainer } from 'react-toastify';

const errorMsg = (error) => {
  return getErrorMessage(error);
};


export default class TaskWrapper extends Component {
  constructor(props) {
    super(props);

    this.renderTabs = this.renderTabs.bind(this);
    this.updateTaskOnServer = this.updateTaskOnServer.bind(this);
    this.deleteTaskOnServer = this.deleteTaskOnServer.bind(this);
    this.updateTaskAssigneeOnServer = this.updateTaskAssigneeOnServer.bind(this);
    this.updateTaskEquipmentOnServer = this.updateTaskEquipmentOnServer.bind(this);
    this.uploadFilesOnServer = this.uploadFilesOnServer.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.failedUploadCallback = this.failedUploadCallback.bind(this);
    this.uploadSingleFile = this.uploadSingleFile.bind(this);
    this.onSaveClickInternal = this.onSaveClickInternal.bind(this);
    this.generateDatetime = this.generateDatetime.bind(this);
    this.onDeleteClickInternal = this.onDeleteClickInternal.bind(this);
    this.onDuplicateClickInternal = this.onDuplicateClickInternal.bind(this);
    this.fileUploadingComplete = this.fileUploadingComplete.bind(this);
    this.fileUploadingPending = this.fileUploadingPending.bind(this);
    this.fetchTaskItems = this.fetchTaskItems.bind(this);

    this.state = {
      activeTab : this.props.selectedTask && this.props.selectedTask.status !== 'NOTSTARTED' ? 'Status' : 'Details',
      taskFormError: null,
      severActionType: '',
      serverActionPending: false,
      serverActionComplete: false,
      file_upload_try_again: false,
      uploadFailedFiles: [],
      completedFiles: [],
      files_to_upload: [],
      localTask: null,
      TaskDuplicate: false,
      deletingTask: false,
      savingTask: false,
      items: []
    };
  }

  componentWillMount() {
    this.can_view_status = false;
    this.can_delete = false;
    if (this.props.profile && this.props.profile.permissions) {
      let permissions = this.props.profile.permissions;
      let is_company = false;
      if (permissions.includes('COMPANY'))is_company = true;
      if (is_company || permissions.includes('VIEW_TASK_STATUS'))this.can_view_status = true;
      if (is_company || permissions.includes('DELETE_TASK')) this.can_delete = true;
    }
    if (this.state.activeTab === 'Status' && !this.can_view_status) {
      this.setState({
        activeTab: 'Details'
      });
    }
    if (this.props.selectedTask && this.props.selectedTask.id ) {
      this.fetchTaskItems(this.props.selectedTask.id);
    }
  }

  fetchTaskItems(task_id) {
    getTaskItemsList(task_id).then((res) => {
      const items = JSON.parse(res);
      this.setState({
        items
      });
    })
  }

  generateDatetime({ start_date, end_date, start_time, end_time }) {
    // Do strict date & time validation and give error

    if (!start_date && !start_time && !end_date && !end_time) {
      let start_datetime = '';
      let end_datetime = '';

      return {start_datetime, end_datetime};
    }
    let start_datetime = Date.now();

    let start_datetime_moment_structure = null;
    if (start_time) {
      if (!start_date) {
        let format_startdate = moment(start_datetime).format();
        start_date = format_startdate;
        let new_startdate = this.getDate(format_startdate);
        start_datetime_moment_structure = this.setTimeInDate(new_startdate, start_time);
      } else {
        start_datetime_moment_structure = this.setTimeInDate(start_date, start_time);
      }

    } else {
      start_datetime_moment_structure = moment(start_date);
    }

    start_datetime = start_datetime_moment_structure.format();

    let end_datetime = Date.now();
    let end_datetime_moment_structure = null;
    if (end_time) {
      if (end_date) {
        end_datetime = this.setTimeInDate(end_date, end_time).format();
      } else {
        end_datetime = this.setTimeInDate(start_date, end_time).format();
      }
    } else {
      if (end_date) {
        end_datetime_moment_structure = moment(end_date);
        end_datetime = end_datetime_moment_structure.add(1, 'hours').format();
      } else {
        const new_end_datetime = start_datetime_moment_structure.add(1, 'hours');
        end_datetime = new_end_datetime.format();
      }
    }

    return { start_datetime, end_datetime };
  }

  setTimeInDate(date, timeObject) {
    // Do format regex and give error in case time format is wrong
    const date_object = new Date(date);
    let hours = parseInt(timeObject.hours);
    const mins = timeObject.mins;
    const meridian = timeObject.meridian;

    if (meridian === 'PM') {
      if (hours !== 12) {
        hours = hours + 12;
      }
    } else if (meridian === 'AM') {
      if (hours == 12) {
        hours = 0;
      }
    }

    date_object.setHours(hours, mins);
    return moment(date_object);
  }

  changeActiveTab(activeTab) {
    this.setState({
      activeTab
    });
  }

  uploadFilesOnServer(file, task_id) {
    let files = [];
    let file_id = '';
    const image = file;
    const promise = getTaskFileAttachmentUploadURL(task_id)
    .then((imageUrlResponse) => {
      const data = new FormData();

      data.append('file-0', image);

      const { upload_url }  = JSON.parse(imageUrlResponse);

      return uploadAttachment(upload_url, data);
    })
    .then((updateImageResponse) => {
      file_id = JSON.parse(updateImageResponse);

      files.push(file_id);

      return files;
    });

    return promise;
  }


  uploadFiles(task, duplicateFlag) {
    this.setState({
      severActionType: 'UPLOAD',
      serverActionPending: true,
      serverActionComplete: false
    });

    let allBackup = [];
    let filesPromise = Promise.resolve([]);
    const promises = this.state.files_to_upload.map((file, i) => {
      return this.uploadFilesOnServer(file, this.state.localTask.id).catch(err => {
        const e = new Error("upload failed");
        e.index = i;
        e.failedFilename = file;
        return e;
      });
    });

    filesPromise = Promise.all(promises).then((results) => {
      return [].concat(...results);
    }).catch((e1) => {
    });

    filesPromise.then((filesUrl) => {
      for (let i = 0; i < filesUrl.length; i++) {
        if (filesUrl[i].message) {
          filesUrl[i].failedFilename.isNew = 'false';
          filesUrl[i].failedFilename.isInProcess = 'false';
          this.state.uploadFailedFiles.push(filesUrl[i].failedFilename);
          allBackup.push(filesUrl[i].failedFilename);
        } else {
          this.state.completedFiles.push(filesUrl[i]);
        }
      }
      if (this.state.uploadFailedFiles.length > 0) {
        this.setState({
          severActionType: '',
          serverActionPending: false,
          serverActionComplete: false,
          files_to_upload: allBackup,
          file_upload_try_again: true
        });
      } else {
        this.setState({
          severActionType: '',
          serverActionPending: false,
          serverActionComplete: true,
          files_to_upload: []
        });

        const tasksFetchRecommended = task.unscheduled ? true : false;
        this.props.taskAddedCallback(task, duplicateFlag, tasksFetchRecommended);
      }
    });
  }

  uploadSingleFile(fileToBeUploaded) {
    let filesPromise = Promise.resolve([]);
    let allBackup = this.state.files_to_upload;
    let failedBackup = this.state.uploadFailedFiles;

    const promises = fileToBeUploaded.map((file, i) => {
      return this.uploadFilesOnServer(file, this.state.localTask.id).catch(err => {
        const e = new Error("upload failed");
        e.index = i;
        e.failedFilename = file;
        return e;
      });
    });

    filesPromise = Promise.all(promises).then((results) => {

      return [].concat(...results);
    }).catch((e1) => {

    });

    filesPromise.then((filesUrl) => {
      for (let i = 0; i < filesUrl.length; i++) {
        if (!filesUrl[i].message) {
          this.state.completedFiles.push(filesUrl[i]);
          for (let j = 0; j < this.state.files_to_upload.length; j++) {
            if (this.state.files_to_upload[j].name==filesUrl[i].filename) {
              allBackup.splice(j, 1);
            }
          }
          for (let j = 0; j < this.state.uploadFailedFiles.length; j++) {
            if (this.state.uploadFailedFiles[j].name == filesUrl[i].filename) {
              failedBackup.splice(j, 1);
            }
          }
        } else {
          for (let j = 0; j < this.state.files_to_upload.length; j++) {
            if (this.state.files_to_upload[j].name == filesUrl[i].failedFilename.name) {
              allBackup[j].isInProcess = 'false';
            }
          }
        }
      }
      let changeFlag = true;
      if (failedBackup.length == 0) {
        changeFlag = false;
      }
      this.setState({
        files_to_upload: allBackup,
        uploadFailedFiles: failedBackup,
        file_upload_try_again: changeFlag
      });
      if (!changeFlag) {
        this.props.taskAddedCallback(this.state.localTask, this.state.TaskDuplicate);
      }
    });
  }

  failedUploadCallback(file) {
    let changeProgress = this.state.files_to_upload;
    for (let i = 0; i < this.state.files_to_upload.length; i++) {
      if (this.state.files_to_upload[i].name == file.name) {
        changeProgress[i].isInProcess = 'true';
      }
    }
    this.setState({
      files_to_upload: changeProgress
    });

    this.uploadSingleFile(file);
  }

  updateTaskOnServer(task, files, createDuplicate = false) {
    if (task.id) {

      this.setState({
        severActionType: 'UPDATE',
        serverActionPending: true,
        serverActionComplete: false,
        TaskDuplicate: createDuplicate,
        savingTask: true
      });

      this.props.updateTask(task).then((res) => {
        res = JSON.parse(res);
        let tasksFetchRecommended = false;
        if ('tasksFetchRecommended' in res) {
          tasksFetchRecommended = res['tasksFetchRecommended'];
        }

        if (this.props.pageView) {
          const notification = {
            text: 'Task successfully updated',
            options: {
              type: toast.TYPE.SUCCESS,
              position: toast.POSITION.BOTTOM_LEFT,
              className: styles.toastSuccessAlert,
              autoClose: 8000
            }
          };
          this.props.createToastNotification(notification);
          this.props.getTaskState(task.id);
        }
        this.setState({
          serverActionPending: false,
          serverActionComplete: true,
          taskFormError: null,
          savingTask: false
        });

        this.props.taskUpdatedCallback(task, createDuplicate, tasksFetchRecommended);
      }).catch((e) => {
        const error = JSON.parse(e.responseText);
	      const notification = {
		      text: errorMsg(error),
		      options: {
			      type: toast.TYPE.ERROR,
			      position: toast.POSITION.BOTTOM_LEFT,
			      className: styles.toastErrorAlert,
			      autoClose: 8000
		      }
	      };
	      this.props.createToastNotification(notification);
        this.setState({
          serverActionPending: false,
          serverActionComplete: false,
          savingTask: false,
          taskFormError: errorMsg(error)
        });
      });
    } else {

      this.setState({
        severActionType: 'ADD',
        serverActionPending: true,
        serverActionComplete: false,
        savingTask: true,
        TaskDuplicate: createDuplicate
      });

      this.props.postTask(task).then((response) => {
        const res = JSON.parse(response);

        task.status = 'NOTSTARTED';
        task.id = res.id;

        task.url_safe_id = res.url_safe_id;

        if (files.length > 0) {
          this.setState({
            localTask: task,
            files_to_upload: files
          });
          this.uploadFiles(task, createDuplicate);
        } else {
          this.setState({
            serverActionPending: false,
            serverActionComplete: true,
            savingTask: false,
            localTask: task,
            files_to_upload: files,
            taskFormError: null
          });

          const tasksFetchRecommended = task.unscheduled ? true : false;
          this.props.taskAddedCallback(task, createDuplicate, tasksFetchRecommended);
        }

      }).catch((e2) => {
        const error = JSON.parse(e2.responseText);
	      const notification = {
		      text: errorMsg(error),
		      options: {
			      type: toast.TYPE.ERROR,
			      position: toast.POSITION.BOTTOM_LEFT,
			      className: styles.toastErrorAlert,
			      autoClose: 8000
		      }
	      };
	      this.props.createToastNotification(notification);
        this.setState({
          serverActionPending: false,
          serverActionComplete: false,
          savingTask: false,
          taskFormError: errorMsg(error)
        });
      });
    }
  }

  onDuplicateClickInternal(e){
    e.preventDefault();
    e.stopPropagation();
    this.taskFormRef.updateTask(e,true);
  }

  fileUploadingPending() {
    this.setState({
      serverActionPending: true
    });
  }

  fileUploadingComplete() {
    this.setState({
      serverActionPending: false
    });
  }

  onSaveClickInternal(e) {
    e.preventDefault();
    e.stopPropagation();
    this.taskFormRef.updateTask(e,false);
  }

  updateTaskAssigneeOnServer(entity_ids) {
    const updatedTask = {
      id: this.props.selectedTask.id,
      entity_ids: entity_ids.join(',')
    };

    this.props.updateTask(updatedTask).then(() => {
      this.props.taskAssigneeUpdatedCallback(entity_ids, this.props.selectedTask.id);
    });
  }

  updateTaskEquipmentOnServer(resource_ids) {
    const updatedTask = {
      id: this.props.selectedTask.id,
      resource_ids: resource_ids.join(',')
    };

    this.props.updateTask(updatedTask).then(() => {
      this.props.taskEquipmentUpdatedCallback(resource_ids, this.props.selectedTask.id);
    });
  }


  deleteTaskOnServer(task_id, delete_series = false) {
    this.setState({
      severActionType: 'DELETE',
      serverActionPending: true,
      serverActionComplete: false,
      deletingTask: true,
    });

    this.props.deleteTask(task_id, delete_series).then(() => {
      this.props.taskDeletedCallback(task_id, delete_series);

      this.setState({
        serverActionPending: false,
        serverActionComplete: true,
        deletingTask: false,
      });

    }).catch((e) => {
      const error = JSON.parse(e.responseText);
	    const notification = {
		    text: errorMsg(error),
		    options: {
			    type: toast.TYPE.ERROR,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastErrorAlert,
			    autoClose: 8000
		    }
	    };
	    this.props.createToastNotification(notification);
      this.setState({
        serverActionPending: false,
        serverActionComplete: false,
        taskFormError: errorMsg(error),
        deletingTask: false,
      });
    });
  }

  onDeleteClickInternal(e) {
    e.preventDefault();
    e.stopPropagation();
    this.taskFormRef.onDelete();
  }

  renderTabs() {
    let tabs = [{
      title: 'Details'
    }];

    if (this.props.selectedTask && this.props.selectedTask.id && this.can_view_status) {
      tabs = [{
        title: 'Details'
      }, {
        title: 'Status'
      }];
    }

    let disableLink = '';
    if (this.state.serverActionPending) {
      disableLink = styles.navbarBtnLinkServerActionPending;
    }

    const dropDownButtonIcon = (<FontAwesomeIcon icon={faEllipsisV} />);

    return (
      <Grid>
        <ul className={styles['tabs-container'] + ' list-inline'}>
            {tabs.map((tab, idx) => {
              return (<li className={(this.state.activeTab === (tab.title) ? styles['active'] : '') + ' ' + styles['task-tab']} key={'tab' + idx} onClick={this.changeActiveTab.bind(this, tab.title)}>
                        <a>{tab.title}</a>
                      </li>);
            })}
          {this.state.activeTab !== 'Status' &&
            <li className={cx('pull-right', styles.navbarBtn, styles.responsiveNavbarBtn)}>
              <DropdownButton pullRight title={dropDownButtonIcon}>
                {this.state.activeTab === 'Details' &&
                  <div>
                    {(this.props.profile.permissions.indexOf('ADD_TASK') !== -1 || this.props.profile.permissions.indexOf('EDIT_TASK') !== -1 || this.props.profile.permissions.indexOf('COMPANY') !== -1) &&
                      <MenuItem className={disableLink} disabled={this.state.serverActionPending} onClick={(e) => this.onSaveClickInternal(e)}>Save Changes</MenuItem>
                    }
                    {(this.props.selectedTask && !this.props.importing && typeof this.props.selectedTask.id !== 'undefined' && this.props.selectedTask.id !== null &&  this.can_delete && this.state.activeTab === 'Details') &&
                      <MenuItem className={disableLink} disabled={this.state.serverActionPending} onClick={(e) => this.onDeleteClickInternal(e)}>Delete Task</MenuItem>
                    }
                    {((this.props.profile.permissions.indexOf('ADD_TASK') !== -1 || this.props.profile.permissions.indexOf('EDIT_TASK') !== -1 || this.props.profile.permissions.indexOf('COMPANY') !== -1) && (this.props.selectedTask && !this.props.importing && typeof this.props.selectedTask.id !== 'undefined' && this.props.selectedTask.id !== null)) &&
                      <MenuItem className={disableLink} disabled={this.state.serverActionPending} onClick={(e) => this.onDuplicateClickInternal(e)}>Duplicate Task</MenuItem>
                    }
                    {!this.props.pageView &&
                      <MenuItem divider/>
                    }
                  </div>
                }
                {!this.props.pageView &&
                  <MenuItem className={disableLink} disabled={this.state.serverActionPending} onClick={this.props.onCloseTask}>Cancel</MenuItem>
                }
              </DropdownButton>
            </li>
          }
          {((this.props.profile.permissions.indexOf('ADD_TASK') !== -1 || this.props.profile.permissions.indexOf('EDIT_TASK') !== -1 || this.props.profile.permissions.indexOf('COMPANY') !== -1) && this.state.activeTab === 'Details') &&
            <li className={cx('pull-right', styles.navbarBtn, styles.navbarHiddenOnSmallRes)}>
              <a onClick={(e) => this.onSaveClickInternal(e)} className={cx(styles.navbarBtnLink, styles.navbarBtnLinkSave, disableLink)}>
                {this.state.savingTask
                  ?
                  <SavingSpinner borderStyle="none" title="" />
                  :
                  <span>Save Changes</span>
                }
              </a>
            </li>
          }
          {this.state.activeTab !== 'Status' && !this.props.pageView &&
            <li className={cx('pull-right', styles.navbarBtn, styles.navbarHiddenOnSmallRes)}>
              <a onClick={this.props.onCloseTask} className={cx(styles.navbarBtnLink, disableLink)}>Cancel</a>
            </li>
          }
          {(this.props.selectedTask && !this.props.importing && typeof this.props.selectedTask.id !== 'undefined' && this.props.selectedTask.id !== null &&  this.can_delete && this.state.activeTab === 'Details') &&
            <li className={cx('pull-right', styles.navbarBtn, styles.navbarHiddenOnSmallRes)}>
              <a onClick={(e) => this.onDeleteClickInternal(e)} className={cx(styles.navbarBtnLink, disableLink)}>
                <span>&#10005; Delete</span>
              </a>
            </li>
          }
          {((this.props.profile.permissions.indexOf('ADD_TASK') !== -1 || this.props.profile.permissions.indexOf('EDIT_TASK') !== -1 || this.props.profile.permissions.indexOf('COMPANY') !== -1) && (this.props.selectedTask && typeof this.props.selectedTask.id !== 'undefined' && this.state.activeTab === 'Details')) &&
          <li className={cx('pull-right', styles.navbarBtn, styles.navbarHiddenOnSmallRes)}>
            <a onClick={(e) => this.onDuplicateClickInternal(e)} className={cx(styles.navbarBtnLink, disableLink)}>
              <span>Duplicate task</span>
            </a>
          </li>
          }
        </ul>
      </Grid>
    );
  }

  render() {
    return (
      <div>
        { this.renderTabs()}

        {this.state.activeTab === 'Details' && <TaskForm
          createCustomer={this.props.createCustomer}
          entities={this.props.entities}
          equipments={this.props.equipments}
          error={this.state.taskFormError}
          extraFieldsOptions={this.props.extraFieldsOptions}
          getCustomers={this.props.getCustomers}
          searchCustomers={this.props.searchCustomers}
          getSchedule={this.props.getSchedule}
          newEventDate={this.props.newEventDate}
          newEventEndDate={this.props.newEventEndDate}
          newEventIsRecurring={this.props.newEventIsRecurring}
          onCancelClick={this.props.onCloseTask}
          onDeleteClick={this.deleteTaskOnServer}
          onSaveClick={this.updateTaskOnServer}
          pageView={this.props.pageView}
          selectedEvent={this.props.selectedTask}
          serverActionComplete={this.state.serverActionComplete}
          serverActionPending={this.state.serverActionPending}
          severActionType={this.state.severActionType}
          getTaskSeriesSettings={this.props.getTaskSeriesSettings}
          filesFail={this.state.file_upload_try_again}
          actualFailedFiles={this.state.uploadFailedFiles}
          failedUploadCallback={this.failedUploadCallback}
          profile={this.props.profile}
          unscheduled={this.props.unscheduled}
          viewType={this.props.viewType}
          templates={this.props.templates}
          handleTaskTypeChange={this.props.handleTaskTypeChange}
          defaultTemplate={this.props.defaultTemplate}
          ref={(taskFormRef) => {this.taskFormRef = taskFormRef;}}
          companyProfile={this.props.companyProfile}
          fileUploadingPending={this.fileUploadingPending}
          fileUploadingComplete={this.fileUploadingComplete}
          groups={this.props.groups}
          items={this.state.items}
          createToastNotification={this.props.createToastNotification}
          />}

        {this.state.activeTab === 'Status' && this.props.selectedTask && this.can_view_status && <div>
          <TaskStatus
            company_id={this.props.company_id}
            company_url={this.props.company_url}
            reporter_name={this.props.reporter_name}
            reporter_id={this.props.reporter_id}
            task={this.props.selectedTask}
            getTaskStatus={this.props.getTaskStatus}
            getTaskRatings={this.props.getTaskRatings}
            updateTaskStatus={this.props.updateTaskStatus}
            updateTask={this.props.updateTask}
            getEstimate={this.props.getEstimate}
            statuses={this.props.statuses}
            entities={this.props.entities}
            fileUploadingComplete={this.fileUploadingComplete}
            taskStatusUpdateCallback={this.props.taskStatusUpdateCallback}
            taskAssigneeUpdatedCallback={this.props.taskAssigneeUpdatedCallback}
            taskSendNotification={this.props.taskSendNotification}
            getSchedule={this.props.getSchedule}
            profile={this.props.profile}
            companyProfile={this.props.companyProfile}
            items={this.state.items}
            fetchTaskItems={this.fetchTaskItems}
            createToastNotification={this.props.createToastNotification}
          />
          </div> }

        {this.state.activeTab === 'Reviews' && this.props.selectedTask && <div>
          <TaskReview
            company_url={this.props.company_url}
            task={this.props.selectedTask}
            getTaskRatings={this.props.getTaskRatings}
          />
        </div>}

      </div>);
  }
}

TaskWrapper.propTypes = {
  selectedTask: PropTypes.object,
  entities: PropTypes.array,
  equipments: PropTypes.array,
  company_id: PropTypes.number.isRequired,
  company_url: PropTypes.string.isRequired,
  reporter_id: PropTypes.number.isRequired,
  reporter_name: PropTypes.string.isRequired,
  getTaskStatus: PropTypes.func.isRequired,
  getTaskRatings: PropTypes.func.isRequired,
  getTaskSeriesSettings: PropTypes.func,
  updateTaskStatus: PropTypes.func.isRequired,
  getEstimate: PropTypes.func.isRequired,
  getSchedule: PropTypes.func.isRequired,
  createCustomer: PropTypes.func.isRequired,
  getCustomers: PropTypes.func.isRequired,
  searchCustomers: PropTypes.func.isRequired,
  extraFieldsOptions: PropTypes.array.isRequired,
  statuses: PropTypes.array.isRequired,
  onCloseTask: PropTypes.func,
  pageView: PropTypes.bool,
  newEventDate: PropTypes.object,
  newEventEndDate: PropTypes.object,

  updateTask: PropTypes.func,
  postTask: PropTypes.func,
  deleteTask: PropTypes.func,

  onDeleteTask: PropTypes.func,

  taskUpdatedCallback: PropTypes.func,
  taskAddedCallback: PropTypes.func,
  taskDeletedCallback: PropTypes.func,
  taskAssigneeUpdatedCallback: PropTypes.func,
  taskEquipmentUpdatedCallback: PropTypes.func,
  taskStatusUpdateCallback: PropTypes.func,
  taskSendNotification: PropTypes.func,

  unscheduled: PropTypes.bool,
  viewType: PropTypes.string,
  templates: PropTypes.array,
  handleTaskTypeChange: PropTypes.func,
  defaultTemplate: PropTypes.object,
  companyProfile: PropTypes.object
};
