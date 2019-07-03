import React, { Component } from 'react';
import styles from './task-wrapper-v2.module.scss';
import TaskForm from './components/task-form/task-form';
import TaskStatus from './components/task-status/task-status';
import {ActivityForm} from '../../components'
import cx from 'classnames';
import {ButtonToolbar, DropdownButton, MenuItem, Modal, ModalBody, Row} from 'react-bootstrap';
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import { faCircle, faEllipsisV } from "@fortawesome/fontawesome-free-solid";
import { getTaskFileAttachmentUploadURL, uploadAttachment, getTaskItemsList, getDocumentssNames }from '../../actions';
import moment from "moment-timezone";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../helpers/task";
import SavingSpinner from '../saving-spinner/saving-spinner';
import {STATUS_META_DATA} from "../../helpers/status_meta_data";
import {DEFAULT_COLORPICKER_COLOR} from "../fields/color-field";
import style from "./base-styling.module.scss";

const errorMsg = (error) => {
  return getErrorMessage(error);
};

export default class TaskWrapperV2 extends Component {
  constructor(props) {
    super(props);

    this.renderTabs = this.renderTabs.bind(this);
    this.fetchTaskItems = this.fetchTaskItems.bind(this);
    this.sendNotification = this.sendNotification.bind(this);
    this.generateLatestStatus = this.generateLatestStatus.bind(this);
    this.fileUploadingPending = this.fileUploadingPending.bind(this);
    this.fileUploadingComplete = this.fileUploadingComplete.bind(this);
    this.task_color = this.task_color.bind(this);
    this.deleteTaskOnServer = this.deleteTaskOnServer.bind(this);
    this.onSaveClickInternal = this.onSaveClickInternal.bind(this);
    this.updateTaskOnServer = this.updateTaskOnServer.bind(this);
    this.onDuplicateClickInternal = this.onDuplicateClickInternal.bind(this);
    this.getDocumentsNames = this.getDocumentsNames.bind(this);

    this.state = {
      activeTab : this.props.importing ? 'Details' : (this.props.selectedTask && this.props.selectedTask.status !== 'NOTSTARTED' ? 'Status' : 'Details'),
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
      items: null,
      serverActionSendNotificationPending: false,
      window_origin: window.location.origin,
      latestStatus: 'NOTSTARTED',
      latestStatusTitle: 'NOTSTARTED',
      gettingStatus: false,
      latestStatusColor: null,
      task_color: this.props.selectedTask && this.props.selectedTask.extra_fields && this.props.selectedTask.extra_fields.task_color ? this.props.selectedTask.extra_fields.task_color : DEFAULT_COLORPICKER_COLOR,
      showActivity: false
    }
  }

  componentWillMount() {
    this.can_create = false;
    this.can_add_status = false;
    this.can_view_status = false;
    this.can_delete = false;
    this.can_edit = false;
    this.can_view_task_full_details = false;
    this.can_add_group = false;
    if (this.props.profile && this.props.profile.permissions) {
      let permissions = this.props.profile.permissions;
      let is_company = false;
      if (permissions.includes('COMPANY'))is_company = true;
      if (is_company || permissions.includes('VIEW_TEAM_CONFIRMATION_DATA')) this.can_view_team_confirmation = true;
      if (is_company || permissions.includes('ADD_TASK')) this.can_create = true;
      if (is_company || permissions.includes('ADD_TASK_STATUS')) this.can_add_status = true;
      if (is_company || permissions.includes('VIEW_TASK_STATUS'))this.can_view_status = true;
      if (is_company || permissions.includes('DELETE_TASK')) this.can_delete = true;
      if (is_company || permissions.includes('EDIT_TASK')) this.can_edit = true;
      if (is_company || permissions.includes('ASSIGN_GROUPS')) this.can_add_group = true;
      if (is_company || permissions.includes('VIEW_FULL_CUSTOMER_DETAILS')) this.can_view_customer_details = true;
      if (is_company || permissions.includes('VIEW_TASK_FULL_DETAILS')) {
        this.can_view_task_full_details = true;
      } else if (permissions.includes('VIEW_TASK_LIMITED_DETAILS')) {
        this.can_view_task_full_details = false;
      }
    }
    const isActivity = (this.props.selectedTask && this.props.selectedTask.template_type && this.props.selectedTask.template_type.toUpperCase() === 'ACTIVITY') || this.props.creatingActivity;
    if (this.state.activeTab === 'Status' && !this.can_view_status && !isActivity) {
      this.setState({
        activeTab: 'Details'
      });
    }
    if (isActivity) {
      this.setState({ showActivity: true });
    }
    if (this.props.selectedTask && this.props.selectedTask.id && !isActivity) {
      this.fetchTaskItems(this.props.selectedTask.id);
    }
    this.getDocumentsNames()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.importing) {
      this.setState({
        task_color: DEFAULT_COLORPICKER_COLOR
      })
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

  getDocumentsNames() {
    getDocumentssNames().then((res) => {
      const documents = JSON.parse(res);
      this.setState({
        documents,
      });
    }).catch((err) => {
      console.log(err);
    });
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
      const completedFiles = this.state.completedFiles;
      const uploadFailedFiles = this.state.uploadFailedFiles;
      for (let i = 0; i < filesUrl.length; i++) {
        if (filesUrl[i].message) {
          filesUrl[i].failedFilename.isNew = 'false';
          filesUrl[i].failedFilename.isInProcess = 'false';
          uploadFailedFiles.push(filesUrl[i].failedFilename);
          allBackup.push(filesUrl[i].failedFilename);
        } else {
          completedFiles.push(filesUrl[i]);
        }
      }
      if (uploadFailedFiles.length > 0) {
        this.setState({
          severActionType: '',
          serverActionPending: false,
          serverActionComplete: false,
          files_to_upload: allBackup,
          file_upload_try_again: true,
          completedFiles,
          uploadFailedFiles
        });
      } else {
        this.setState({
          severActionType: '',
          serverActionPending: false,
          serverActionComplete: true,
          files_to_upload: [],
          savingTask: false,
          completedFiles,
          uploadFailedFiles
        });

        const tasksFetchRecommended = task.unscheduled ? true : false;
        this.props.taskAddedCallback(task, duplicateFlag, tasksFetchRecommended);
        this.props.updateEventCallback && this.props.updateEventCallback();
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
          }, () => {
            this.props.updateEventCallback && this.props.updateEventCallback();
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

  sendNotification() {
    this.setState({ serverActionSendNotificationPending: true });
    this.props.taskSendNotification(this.props.selectedTask.id, {
      type: 'NEW'
    }).then(() => {
      this.setState({ serverActionSendNotificationPending: false });
    }).catch(e => {
      this.setState({ serverActionSendNotificationPending: false });

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
    });
  }

  changeActiveTab(activeTab) {
    this.setState({
      activeTab
    });
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

    return (
      <ul className={cx(styles.headerNav)}>
        {tabs.map((tab, idx) => {
          return (<li key={'tab' + idx} onClick={this.changeActiveTab.bind(this, tab.title)}>
            <a href="javascript:void (0)" className={cx(this.state.activeTab === (tab.title) ? styles['active'] : '')}>{tab.title}</a>
          </li>);
        })}
      </ul>
    );
  }

  generateLatestStatus(statusList) {
    this.setState({gettingStatus: true});
    let latestStatus = 'NOTSTARTED';
    let latestStatusTitle = 'NOTSTARTED';
    let latestStatusColor = null;
    // Don't set internal_statuses as latest status on task
    for (let i = 0; i < statusList.length; i++) {
      if (STATUS_META_DATA[statusList[i].type] && STATUS_META_DATA[statusList[i].type].isTaskLatestStatus && statusList[i].is_active) {
        latestStatus = statusList[i].type;
        latestStatusColor = statusList[i].color;
        if (statusList[i].title && statusList[i].title){
          latestStatusTitle = statusList[i].title;
        } else {
          latestStatusTitle = statusList[i].type;
        }
        this.setState({latestStatus, latestStatusTitle, gettingStatus: false, latestStatusColor});
        break;
      }
    }
    return {
      latestStatus, latestStatusTitle
    };
  }

  task_color(task_color){
    this.setState({task_color});
  }


  render() {
    let disableLink = '';

    if (this.state.serverActionPending) {
      disableLink = styles.linkServerActionPending;
    }
    const dropDownButtonIcon = (<FontAwesomeIcon icon={faEllipsisV} />),
          showDuplicateTaskButton = (this.props.profile.permissions.indexOf('ADD_TASK') !== -1 || this.props.profile.permissions.indexOf('EDIT_TASK') !== -1 || this.props.profile.permissions.indexOf('COMPANY') !== -1) && (this.props.selectedTask && !this.props.importing),
          showDeleteButton = this.props.selectedTask && !this.props.importing && this.props.selectedTask.id &&  this.can_delete && this.state.activeTab === 'Details',
          showSaveChangesButton = this.props.profile.permissions.indexOf('ADD_TASK') !== -1 || this.props.profile.permissions.indexOf('EDIT_TASK') !== -1 || this.props.profile.permissions.indexOf('COMPANY') !== -1;
    return (
      <div className={cx(styles.taskWrapper)}>
        {!this.state.showActivity &&
        <header className={cx(styles.taskHeader)}>
          <div className={cx(styles.headerTop)}>
            <div className={cx(styles.fullContainer)}>
              <strong className={cx(styles.taskName)}>
                <span className={cx(styles.taskColor)} style={{backgroundColor: this.state.task_color}}/>
                {this.props.taskImport ? 'Task Import ' : (this.props.selectedTask && this.props.selectedTask.id) ? this.props.selectedTask.title : 'New Task'}
                {this.props.editingTasks && <span>({this.props.currentEvent + 1}/{this.props.events.length})</span>}
              </strong>
              {this.props.singleTask ? null :
                <a href="javascript:void (0)" onClick={this.props.onCloseTask} className={cx(styles.close)}>&nbsp;</a>}
            </div>
          </div>
          <div className={cx(styles.headerBottom)}>
            <div className={cx(styles.fullContainer)}>
              <div className={cx(styles.inner)}>
                {this.renderTabs()}
                {this.state.activeTab === 'Details' &&
                <div>
                  <ul className={cx(styles.headerNav, styles.right)}>
                    {showDuplicateTaskButton &&
                    <li><a href="javascript:void (0)" className={disableLink}
                           onClick={(e) => this.onDuplicateClickInternal(e)}>Duplicate Task</a></li>
                    }
                    {showDeleteButton &&
                    <li>
                      <button type="button" onClick={(e) => this.onDeleteClickInternal(e)}
                              className={cx(styles.btn, styles['btn-light'], styles.delete, disableLink)}>Delete
                      </button>
                    </li>
                    }
                    {this.props.importing &&
                    <li><a href="javascript:void (0)"
                           onClick={() => this.props.skipEvent(this.props.selectedTask.index)}
                           className={cx(disableLink)}>Skip</a></li>
                    }
                    {!this.props.pageView &&
                    <li><a href="javascript:void (0)" onClick={this.props.onCloseTask}
                           className={disableLink}>Cancel</a></li>
                    }
                    {showSaveChangesButton &&
                    <li>
                      <button onClick={(e) => this.onSaveClickInternal(e)} type="button"
                              className={cx(styles.btn, styles['btn-secondary'], disableLink)}>
                        {this.state.savingTask ? <SavingSpinner borderStyle="none" title=""/> : 'Save Changes'}
                      </button>
                    </li>
                    }
                  </ul>
                  <ButtonToolbar className={cx(styles.taskDropDown)}>
                    <DropdownButton title={dropDownButtonIcon} noCaret pullRight>
                      {showSaveChangesButton &&
                      <MenuItem className={disableLink} onClick={(e) => this.onSaveClickInternal(e)}>Save
                        Changes</MenuItem>
                      }
                      {showDeleteButton &&
                      <MenuItem className={disableLink} onClick={(e) => this.onDeleteClickInternal(e)}>Delete</MenuItem>
                      }
                      {showDuplicateTaskButton &&
                      <MenuItem className={disableLink} onClick={(e) => this.onDuplicateClickInternal(e)}>Duplicate
                        Task</MenuItem>
                      }
                      {this.props.importing &&
                      <MenuItem className={disableLink}
                                onClick={() => this.props.skipEvent(this.props.selectedTask.index)}>Skip</MenuItem>
                      }
                      {!this.props.pageView &&
                      <MenuItem className={disableLink} onClick={this.props.onCloseTask}>Cancel</MenuItem>
                      }
                    </DropdownButton>
                  </ButtonToolbar>
                </div>
                }
                {this.state.activeTab === 'Status' && this.can_add_status &&
                <div>
                  <ul className={cx(styles.headerNav, styles.right)}>
                    <li>
                      <a href="javascript:void (0)"
                         className={cx(styles.btn, styles['btn-outline-light'], styles['btn-resend-confirmation'])}
                         onClick={this.sendNotification}>
                        {this.state.serverActionSendNotificationPending ?
                          <SavingSpinner title="Sending" className={cx(styles.loaderWhite)}
                                         borderStyle="none"/> : 'Resend Task Confirmation'}
                      </a>
                    </li>
                    {this.props.selectedTask && <li>
                      <a
                        href={encodeURI(this.state.window_origin + '/live/track/' + ((this.props.companyProfile && this.props.companyProfile.fullname) || this.props.reporter_name) + '/' + this.props.selectedTask.url_safe_id + '?url=business')}
                        target="_blank" className={cx(styles.btn, styles['btn-outline-light'])}>Check Customer's View of
                        the Task</a>
                    </li>}
                  </ul>
                  <ButtonToolbar className={cx(styles.taskDropDown)}>
                    <DropdownButton title={dropDownButtonIcon} noCaret pullRight>
                      <MenuItem href="javascript:void (0)" onClick={this.sendNotification}>Resend Task
                        Confirmation</MenuItem>
                      {this.props.selectedTask && <MenuItem
                        href={encodeURI(this.state.window_origin + '/live/track/' + this.props.reporter_name + '/' + this.props.selectedTask.url_safe_id + '?url=business')}
                        target="_blank">Check Customer's View of the Task</MenuItem>}
                    </DropdownButton>
                  </ButtonToolbar>
                </div>
                }
              </div>
            </div>
          </div>
        </header>
        }
        {!this.state.showActivity &&
        <div className={cx(styles.taskBody)}>
          {this.state.activeTab === 'Details' &&
          <TaskForm
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
            duration={this.props.duration}
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
            ref={(taskFormRef) => {
              this.taskFormRef = taskFormRef;
            }}
            companyProfile={this.props.companyProfile}
            fileUploadingPending={this.fileUploadingPending}
            fileUploadingComplete={this.fileUploadingComplete}
            groups={this.props.groups}
            items={this.state.items}
            createToastNotification={this.props.createToastNotification}
            can_add_group={this.can_add_group}
            can_create={this.can_create}
            can_edit={this.can_edit}
            can_view_team_confirmation={this.can_view_team_confirmation}
            can_view_task_full_details={this.can_view_task_full_details}
            can_view_customer_details={this.can_view_customer_details}
            task_color={this.task_color}
            importing={this.props.importing}
            currentEvent={this.props.currentEvent}
            documents={this.state.documents}
          />}
          {this.state.activeTab === 'Status' && this.props.selectedTask && this.can_view_status &&
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
            generateLatestStatus={this.generateLatestStatus}
            latestStatusColor={this.state.latestStatusColor}
            latestStatusTitle={this.state.latestStatusTitle}
            serverActionComplete={this.state.serverActionComplete}
            serverActionPending={this.state.serverActionPending}
            severActionType={this.state.severActionType}
            userProfile={this.props.userProfile}
            systemAndCustomMessages = {this.props.systemAndCustomMessages}
          />
          }
        </div>
        }
        { this.state.activeTab === 'Details' && !this.state.showActivity &&
          <footer className={cx(styles.taskFooter)}>
            <div className={cx(styles.fullContainer)}>
              <div className={cx(styles.inner)}>
                <div className={cx(styles.btnWrapper)}>
                  {showDuplicateTaskButton &&
                    <button type="button" className={cx(styles.btn, styles['btn-light'], disableLink)} onClick={(e) => this.onDuplicateClickInternal(e)}>Duplicate Task</button>
                  }
                  {showDeleteButton &&
                    <button type="button" className={cx(styles.btn, styles['btn-light'], styles.delete, disableLink)} onClick={(e) => this.onDeleteClickInternal(e)}>Delete</button>
                  }
                  {this.props.importing &&
                    <button type="button" className={cx(styles.btn, styles['btn-light'], disableLink)} onClick={() => this.props.skipEvent(this.props.selectedTask.index)}>Skip</button>
                  }
                  {!this.props.pageView &&
                    <button type="button" className={cx(styles.btn, styles['btn-light'], disableLink)} onClick={this.props.onCloseTask}>Cancel</button>
                  }
                </div>
                {showSaveChangesButton &&
                  <div>
                    <button type="button" onClick={(e) => this.onSaveClickInternal(e)} className={cx(styles.btn, styles['btn-secondary'], disableLink)}>
                      {this.state.savingTask ? <SavingSpinner borderStyle="none" title="" /> : 'Save Changes'}
                    </button>
                  </div>
                }
              </div>
            </div>
          </footer>
        }
        {this.state.showActivity &&
        <ActivityForm
          getCustomers={this.props.getCustomers}
          createCustomer={this.props.createCustomer}
          searchCustomers={this.props.searchCustomers}
          closeActivityModal={this.props.onCloseTask}
          profile={this.props.profile}
          equipments={this.props.equipments}
          entities={this.props.entities}
          groups={this.props.groups}
          getSchedule={this.props.getSchedule}
          companyProfile={this.props.companyProfile}
          statuses={this.props.statuses}
          start_date={this.state.start_date}
          serverActionComplete={this.state.serverActionComplete}
          serverActionPending={this.state.serverActionPending}
          fileUploadingPending={this.fileUploadingPending}
          fileUploadingComplete={this.fileUploadingComplete}
          filesFail={this.state.file_upload_try_again}
          actualFailedFiles={this.state.uploadFailedFiles}
          failedUploadCallback={this.failedUploadCallback}
          onDeleteClick={this.deleteTaskOnServer}
          onSaveClick={this.updateTaskOnServer}
          severActionType={this.state.severActionType}
          can_add_group={this.can_add_group}
          can_create={this.can_create}
          can_edit={this.can_edit}
          can_view_team_confirmation={this.can_view_team_confirmation}
          can_view_task_full_details={this.can_view_task_full_details}
          selectedActivity={this.props.selectedTask}
          can_delete={this.can_delete}
          taskAssigneeUpdatedCallback={this.props.taskAssigneeUpdatedCallback}
          createToastNotification={this.props.createToastNotification}
          pageView={this.props.pageView}
          updateActivityStatus={this.props.updateTaskStatus}
          reporter_name={this.props.reporter_name}
          reporter_id={this.props.reporter_id}
          generateLatestStatus={this.generateLatestStatus}
          allDay={this.props.allDay}
        />
        }
        {this.state.activeTab === 'Details' && this.props.selectedTask &&
        <div className={cx(styles.fullContainer)}>
          <div className={cx(styles.externalInfo)}>
            {this.props.selectedTask.id && <div><strong>ID</strong> : {this.props.selectedTask.id}</div>}
            {this.props.selectedTask.external_id && <div><strong>External ID</strong> : {this.props.selectedTask.external_id}</div>}
            {this.props.selectedTask.external_url && <div><strong>External URL</strong> : {this.props.selectedTask.external_url.toLowerCase().startsWith('http') ? <a target="_blank" href={this.props.selectedTask.external_url}>{this.props.selectedTask.external_url}</a> :this.props.selectedTask.external_url} </div>}
            {this.props.selectedTask.external_type && <div><strong>External TYPE</strong> : {this.props.selectedTask.external_type}</div>}
          </div>
        </div>}
      </div>
    );
  }
}
