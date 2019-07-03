import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, ControlLabel, Glyphicon, Checkbox, Row, Grid, OverlayTrigger, Tooltip } from 'react-bootstrap';
import PubSub from 'pubsub-js';
import { FieldGroup, CrewSelectorCircles } from '../fields';
import cx from 'classnames';
import styles from './task-status.module.scss';
import moment from 'moment';
import { LocationMapV2 } from '../../components';
import SavingSpinner from '../saving-spinner/saving-spinner';
import { STATUS_DICT } from '../../helpers/status_dict';
import { STATUS_META_DATA } from '../../helpers/status_meta_data';
import TaskStatusButtons from '../task-status-buttons/task-status-buttons';
import RatingsView from '../ratings-view-v2/ratings-view-v2';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faClock, faTimesCircle} from '@fortawesome/fontawesome-free-regular';
import { faCalendar, faSync, faHourglass, faGlobe, faComment, faEnvelope, faMobile, faRoad, faMapMarker, faPlus, faPaperclip, faMapMarkerAlt } from '@fortawesome/fontawesome-free-solid';
import Dropzone from 'react-dropzone';
import TaskProducts from '../task-products/task-products';
import {
  getAttachmentUploadURL,
  uploadAttachment,
  deleteStatus,
  getPredictedArrival,
  getTaskSummary,
  getTaskItemsList, getAllTaskFiles
} from '../../actions';
import { getStatusDetails } from '../../helpers/status_dict_lookup';
import StatusMap from './status-map';
import { getCustomerName, getErrorMessage } from '../../helpers/task';
import CrewSelectorV2 from '../crew-selector/crew-selector';
import { toast } from 'react-toastify';

const errorMsg = (error) => {
  return getErrorMessage(error);
};

export default class TaskStatus extends Component {
  constructor(props) {
    super(props);
    this.refreshStatus = this.refreshStatus.bind(this);
    this.changeCustomStatus = this.changeCustomStatus.bind(this);
    this.setCustomStatus = this.setCustomStatus.bind(this);
    this.fetchNewData = this.fetchNewData.bind(this);
    this.updateTaskAssigneeOnServer = this.updateTaskAssigneeOnServer.bind(this);
    this.renderCustomerStatus = this.renderCustomerStatus.bind(this);
    this.renderStatusConfirmation = this.renderStatusConfirmation.bind(this);
    this.cancelCustomerStatus = this.cancelCustomerStatus.bind(this);
    this.addNewCustomerStatus = this.addNewCustomerStatus.bind(this);
    this.updateImageClick = this.updateImageClick.bind(this);
    this.closeImage = this.closeImage.bind(this);
    this.getPreview = this.getPreview.bind(this);
    this.uploadFilesOnServer = this.uploadFilesOnServer.bind(this);
    this.uploadFilesAndSendStatus = this.uploadFilesAndSendStatus.bind(this);
    this.uploadSingleFile = this.uploadSingleFile.bind(this);
    this.sendStatus = this.sendStatus.bind(this);
    this.uploadFilesAgain = this.uploadFilesAgain.bind(this);
    this.addNewInternalStatus = this.addNewInternalStatus.bind(this);
    this.startAsyncUpdate = this.startAsyncUpdate.bind(this);
    this.toggleStatusLocationMap = this.toggleStatusLocationMap.bind(this);
    this.deleteStatus = this.deleteStatus.bind(this);
    this.getPredictedEstiamate = this.getPredictedEstiamate.bind(this);
    this.renderFileUploadAreaForLowRes = this.renderFileUploadAreaForLowRes.bind(this);
    this.updateImagesDisplay = this.updateImagesDisplay.bind(this);
    this.getFilePreview = this.getFilePreview.bind(this);
    this.refreshSummary = this.refreshSummary.bind(this);
    this.fetchTaskItems = this.fetchTaskItems.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.showUploadedFiles = this.showUploadedFiles.bind(this);

    this.state = {
      latestStatus: 'NOTSTARTED',
      latestStatusTitle: 'NOTSTARTED',
      filteredEntities: [],
      gettingStatus: false,
      gettingEstimate: false,
      statusList: [],
      error: null,
      severActionType: '',
      serverActionPending: false,
      serverActionComplete: false,
      window_origin: window.location.origin,
      serverActionSendNotificationPending: false,
      gettingRatings: false,
      ratings: [],
      showCustomerStatusConfirmation: false,
      addCustomerStatus: false,
      files_to_upload: [],
      fileUploader: false,
      filesAllowed: 3,
      customer_note_confirmation_on_retry: false,
      uploadFailedFiles: [],
      completedFiles: [],
      newFilePlaced: false,
      timer: null,
      entitiesRoutes: this.props.task.routes,
      showMap: false,
      statusLocationIndex: null,
      gettingPredictedEstimate: false,
      predictedEstimate: null,
      showEstimate: false,
      travelTime: null,
      totalTime: null,
      mileage: null,
      taskTime: null,
      gettingSummary: false,
      taskItems: props.items,
      fetchingItems: false,
      itemsFetchError: null,
      sendingStatus: false,
      filesFound: null,
    };
  }


  componentWillMount() {
    PubSub.subscribe('activity-stream.task', (msg, data) => {
      if (data.entity_id == this.props.task.id) {
        this.fetchNewData();
      }
    });
    this.can_add_status = false;
    this.can_delete_status = false;
    this.can_add_team_member = false;
    if (this.props.profile && this.props.profile.permissions) {
      let permissions = this.props.profile.permissions;
      let is_company = false;
      if (permissions.includes('COMPANY')) is_company = true;
      if (is_company || permissions.includes('ADD_TASK_STATUS')) this.can_add_status = true;
      if (is_company || permissions.includes('DELETE_TASK_STATUS')) this.can_delete_status = true;
      if (is_company || permissions.includes('ADD_TEAM_MEMBER')) this.can_add_team_member = true;
    }
  }

  componentDidMount() {
    this.fetchNewData();
    this.startAsyncUpdate();
    this.showUploadedFiles();
  }

  componentWillReceiveProps(nextProps) {
    // TODO: Optimize here
    this.storeFilteredEntities(nextProps.entities, nextProps.task);
  }

  componentWillUnmount() {
    PubSub.unsubscribe('activity-stream');
    if(this.state.timer) {
      clearTimeout(this.state.timer);
    }
  }

  // upload items file


  uploadFiles() {
    let allBackup = this.state.files_to_upload;
    for (let i = 0; i < this.state.files_to_upload.length; i++) {
      allBackup[i].isInProcess = 'true';
    }
    this.setState({
      files_to_upload: allBackup,
    });

    let filesPromise = Promise.resolve([]);
    allBackup = [];
    const promises = this.state.files_to_upload.map((file, i) => {
      return this.uploadFilesOnServer(file).catch(err => {
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
          attachmentServerActionPending: false,
          attachmentserverActionComplete: false,
          attachmentSeverActionType: '',
          files_to_upload: allBackup,
        });
        this.showUploadedFiles();
      } else {
        this.setState({
          attachmentServerActionPending: false,
          attachmentServerActionComplete: true,
          attachmentSeverActionType: '',
          files_to_upload: [],
        });
        this.showUploadedFiles();
      }
    });
  }


  showUploadedFiles() {
        this.setState({
          filesFound: this.state.completedFiles,
        });
  }
  // end
  fetchNewData() {
    this.refreshStatus();
    this.refreshSummary();
    this.refreshRatings();
    this.storeFilteredEntities(this.props.entities, this.props.task);
    this.props.fetchTaskItems(this.props.task.id);
  }

  fetchTaskItems () { // Redundant
    const task_id = this.props.task.id;
    this.setState({
      fetchingItems: true
    });
    getTaskItemsList(task_id).then((result) => {
      this.setState({
        taskItems: JSON.parse(result),
        fetchingItems: false
      });
    }).catch((error) => {
      this.setState({
        itemsFetchError: error.response,
        fetchingItems: false
      })
    })
  }



  startAsyncUpdate() {
    this.fetchNewData();
    const timer = setTimeout(() => {
      this.startAsyncUpdate();
    }, 3e4);
    this.setState({
      timer: timer
    });
  }

  getPredictedEstiamate() {
    this.setState({
      gettingPredictedEstimate: true
    });
    getPredictedArrival(this.props.task.id).then((res) => {
      this.setState({
        gettingPredictedEstimate: false,
        predictedEstimate: JSON.parse(res)
      });
    }).catch((err) => {
      console.log(err);
      this.setState({
        gettingPredictedEstimate: false
      });
    });
  }

  storeFilteredEntities(entities, task) {
    const filteredEntities = [];
    if (entities && task.entity_ids) {
      for (let i = 0; i < task.entity_ids.length; i++) {
        for (let j = 0; j < entities.length; j++) {
          if (task.entity_ids[i] === entities[j].id) {
            filteredEntities.push(entities[j]);
            break;
          }
        }
      }
    }

    this.setState({
      filteredEntities
    });
  }




  renderFileUploadAreaForLowRes() {
    return (
      <div className={styles.fileUploaderMobile}>
        <div className={cx(['form-group'], styles.fileUploaderMobileBtn)}>
          <label>Select Files to Upload</label>
          <input type="file" onChange={(e) => this.updateImagesDisplay(e)} multiple className="form-control" />
        </div>
        <div className={styles.customFilePreview}>
          {this.state.files_to_upload.length === 0 &&
          <p>No files chosen.</p>
          }
          {this.state.files_to_upload.length > 0 &&
          <ul className={styles.uploadFilesPreviews}>
            {this.state.files_to_upload.map((file, index) => {
              const filePreviewURL = this.getFilePreview(file);
              return (
                <li key={index}>
                  <button onClick={(e) => this.closeImage(file.name, e)} className={styles.closeBtn}>
                    <FontAwesomeIcon icon={faTimesCircle} /></button>
                  <div className={styles.uploadCaption}><span>{file.name}</span></div>
                  <img src={filePreviewURL}/>
                  {file.isNew === 'false' &&
                  <button onClick={(e) => this.uploadFilesAgain(file, e)} className={styles.retryBtn}>
                    <FontAwesomeIcon icon={faSync} /></button>
                  }
                  {file.isInProcess === 'true' &&
                  <i className={cx('fa fa-spinner fa-spin ' + styles.uploadSpinner)}></i>
                  }
                </li>
              );
            })
            }
          </ul>
          }
        </div>
      </div>
    );
  }

  updateImagesDisplay(e) {
    // Convert file object to array prototype to match rest of our file upload structure
    const filesArray = Object.keys(e.target.files).map(function (key) {
      return e.target.files[key];
    });
    if (filesArray.length === 0) {
      // if no file is selected, do nothing
      return;
    } else {
      // only three files - first three will be selected, shown in the preview box and sent to the server
      filesArray.splice(3);
      // if files are selected, sent those files into the state so that our existing functions work as expected
      this.setState({
        files_to_upload: filesArray
      });
    }
  }

  getFilePreview(file) {
    switch (file.type) {
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/png':
      case 'image/gif':
      case 'image/bimp':
      case 'image/bmp':
        return window.URL.createObjectURL(file);
        break;
      default:
        return '/images/icon-file.png';
    }
  }

  uploadFilesOnServer(file) {
    let files = [];
    let file_id = '';
    const image = file;
    const promise = getAttachmentUploadURL(this.props.task.id)
    .then((imageUrlResponse) => {
      const data = new FormData();

      data.append('file-0', image);

      const { upload_url }  = JSON.parse(imageUrlResponse);

      return uploadAttachment(upload_url, data);
    }).catch((error) => {
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
    })
    .then((updateImageResponse) => {
      file_id = JSON.parse(updateImageResponse);

      files.push(file_id);

      return files;
    });

    return promise;
  }

uploadFilesAndSendStatus(type, title, id, notes, estimate, visibleToCustomer = null, color, custom_message_template, items, exception, customer_signature) {
  let allBackup = this.state.files_to_upload;
  for (let i = 0; i < this.state.files_to_upload.length; i++) {
    allBackup[i].isInProcess = 'true';
  }
  this.setState({
    files_to_upload: allBackup
  });

  let filesPromise = Promise.resolve([]);
  allBackup = [];
  const promises = this.state.files_to_upload.map((file, i) => {
    return this.uploadFilesOnServer(file).catch(err => {
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
      if (this.state.completedFiles.length > 0) {
        this.sendStatus(this.state.completedFiles, type, title, id, notes, estimate, visibleToCustomer, color, custom_message_template, null, items, exception, customer_signature);
      }
      this.setState({
        serverActionPending: false,
        serverActionComplete: false,
        files_to_upload: allBackup
      });
    } else {
      this.sendStatus(this.state.completedFiles, type, title, id, notes, estimate, visibleToCustomer, color, custom_message_template, null, items, exception, customer_signature);
    }
  });
}

uploadSingleFile(fileToBeUploaded, type, title, id, notes, estimate, visibleToCustomer = null, color, custom_message_template) {
  let filesPromise = Promise.resolve([]);
  let allBackup = this.state.files_to_upload;
  let failedBackup = this.state.uploadFailedFiles;

  const promises = fileToBeUploaded.map((file, i) => {
    return this.uploadFilesOnServer(file).catch(err => {
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
          if (this.state.files_to_upload[j].name == filesUrl[i].filename) {
            allBackup.splice(j, 1);
          }
        }
        for (let j = 0; j < this.state.uploadFailedFiles.length; j++) {
          if (this.state.uploadFailedFiles[j].name == filesUrl[i].filename) {
            failedBackup.splice(j, 1);
          }
        }
        this.sendStatus(this.state.completedFiles, type, title, id, notes, estimate, visibleToCustomer, color, custom_message_template);
      } else {
        for (let j = 0; j < this.state.files_to_upload.length; j++) {
          if (this.state.files_to_upload[j].name == filesUrl[i].failedFilename.name) {
            allBackup[j].isInProcess = 'false';
          }
        }
      }
    }
    this.setState({
      files_to_upload: allBackup,
      uploadFailedFiles: failedBackup
    });
  });
}

toggleStatusLocationMap(e, index) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.showMap && index !== this.state.statusLocationIndex) {
      this.setState({
        statusLocationIndex: index
      });
    } else if (this.state.showMap && index === this.state.statusLocationIndex) {
      this.setState({
        showMap: false
      });
      } else {
      this.setState({
        showMap: !this.state.showMap,
        statusLocationIndex: index
      });
    }
  }

sendStatus(filesURL, type, title, id, notes, estimate, visibleToCustomer = null, color, custom_message_template = null, address = null, items = null, exception, customer_signature) {
  const status = {
    type,
    title,
    status_id: id,
    time: moment().format(),
    reporter_name: this.props.reporter_name,
    reporter_id: this.props.reporter_id,
    color,
    custom_message_template,
    exception
  };

  let extra_fields = null;
  if (type === 'CUSTOM') {
    extra_fields = {
      'visible_to_customer': visibleToCustomer,
      'notes': notes || '',
    };
    if (filesURL.length > 0) {
      extra_fields.files = filesURL
    }
  } else {
    extra_fields = {
      'notes': notes || '',
      'visible_to_customer': visibleToCustomer,
    };
    if (estimate) {       // estimate is expected to be an integer and our mobile apps breaks if it is passed as null or empty string
      extra_fields['estimate'] = estimate;
    }
    if (customer_signature) {
      extra_fields['files'] = [customer_signature];
    }
  }

  if (address) {
    status.current_destination = address;
  }

  status.extra_fields = JSON.stringify(extra_fields);
  status.source = 'web';
  status.items = items;

  const task_id = this.props.task.id;
  this.props.updateTaskStatus({ task_id, status }).then(() => {
    if (this.state.uploadFailedFiles.length > 0) {
      this.setState({
        serverActionPending: false,
        serverActionComplete: true,
        completedFiles: [],
        sendingStatus: false
      });
    } else {
      let filesBackup = [];
      let changeFlag = false;
      if (this.state.newFilePlaced) {
        filesBackup = this.state.files_to_upload;
      }
      this.setState({
        serverActionPending: false,
        serverActionComplete: true,
        files_to_upload: filesBackup,
        completedFiles: [],
        newFilePlaced: changeFlag,
        error: null,
        sendingStatus: false
      });
    }

    if (type === 'CUSTOM') {
      this.textInput.value = '';
    }
    this.refreshStatus();
    if (this.props.taskStatusUpdateCallback) {
      this.props.taskStatusUpdateCallback(task_id, status);
    }
  }).catch((e2) => {
    this.setState({
      serverActionPending: false,
      serverActionComplete: false,
      sendingStatus: false
    });
	  const notification = {
		  text: errorMsg(e2),
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

  pushNewState(type, title, id, notes, estimate, visibleToCustomer = null, color, custom_message_template, address = null, items, exception, customer_signature) {
    this.setState({
      severActionType: 'ADD',
      serverActionPending: true,
      serverActionComplete: false,
      error: null,
      sendingStatus: true
    });
    if (this.state.files_to_upload.length > 0) {
      this.uploadFilesAndSendStatus(type, title, id, notes, estimate, visibleToCustomer, color, custom_message_template, items, exception, customer_signature);
    } else {
      const noURL = [];
      this.sendStatus(noURL, type, title, id, notes, estimate, visibleToCustomer, color, custom_message_template, address, items, exception, customer_signature);
    }
  }

  uploadFilesAgain(file, uploadEvent) {
    uploadEvent.stopPropagation();
    let userInput = this.textInput.value;
    let sendFile = [];
    sendFile.push(file);

    let changeProgress = this.state.files_to_upload;
    for (let i = 0; i < this.state.files_to_upload.length; i++) {
      if (this.state.files_to_upload[i].name == file.name) {
        changeProgress[i].isInProcess = 'true';
      }
    }
    this.setState({
      files_to_upload: changeProgress
    });

    if (this.state.customer_note_confirmation_on_retry) {
      this.uploadSingleFile(sendFile, 'CUSTOM', 'CUSTOM', null, userInput, null, true);
    } else {
      this.uploadSingleFile(sendFile, 'CUSTOM', 'CUSTOM', null, userInput, null, false);
    }
  }

  refreshRatings() {
    this.setState({ gettingRatings: true });
    this.props.getTaskRatings(this.props.task.id).then(res => {
      const ratings = JSON.parse(res);
      this.setState({
        gettingRatings: false,
        ratings: ratings || []
      });
    });
  }

  getTimeEstimation() {
    this.setState({ gettingEstimate: true });
    this.props.getEstimate(this.props.task.id).then((res) => {
      const estimateObject = JSON.parse(res);
      this.setState({ estimate: estimateObject.estimate, gettingEstimate: false });
    });
  }

  changeCustomStatus(event) {
    this.setState(Object.assign(this.state, { customStatus: event.target.value }));
  }


  setCustomStatus(visibleToCustomer = false) {
    if (!visibleToCustomer) {
      this.setState({
        customer_note_confirmation_on_retry: false
      });
    }
    let userInput = this.textInput.value;
    const color = "#999999";
    this.pushNewState('CUSTOM', 'CUSTOM', null, userInput, null, visibleToCustomer, color);
    if (this.state.showCustomerStatusConfirmation) {
      this.setState({
        showCustomerStatusConfirmation: false
      });
    }
  }

  renderCustomerStatus(status) {
    if (status !== '' && this.state.files_to_upload.length === 0) {
      return this.renderStatusConfirmation(<div>
        <h3>Adding a Customer Note</h3>
        <p className={styles['confirm-dialog-text']}>You wrote:</p>
        <div className={styles['confirm-dialog-text-note']}>{status}</div>
        <p className={styles['confirm-dialog-text']}>Are you sure you would like to send a note to customer with above text?</p>
        <div className={cx('pull-right', styles['tasks-confirm-buttons'])}>
          <Button className="green-btn" title="Customer will be able to view this status" onClick={() =>this.setCustomStatus(true)}>Yes</Button>
          <Button onClick={this.cancelCustomerStatus} className={cx('white-btn', styles['series-confirm-cancel'])}>Cancel</Button>
        </div>
      </div>);
    } else if (this.state.files_to_upload.length > 0 && status === '') {
      return this.renderStatusConfirmation(<div>
        <h3>Adding a Customer Note</h3>
        <p className={styles['confirm-dialog-text']}>Are you sure you would like to send attachments without a note?</p>
        <div className={cx('pull-right', styles['tasks-confirm-buttons'])}>
          <Button className="green-btn" title="Customer will be able to view this status" onClick={() =>this.setCustomStatus(true)}>Yes</Button>
          <Button onClick={this.cancelCustomerStatus} className={cx('white-btn', styles['series-confirm-cancel'])}>Cancel</Button>
        </div>
      </div>);
    } else if (this.state.files_to_upload.length > 0 && status !== '') {
      return this.renderStatusConfirmation(<div>
        <h3>Adding a Customer Note</h3>
        <p className={styles['confirm-dialog-text']}>You wrote:</p>
        <div className={styles['confirm-dialog-text-note']}>{status}</div>
        <p className={styles['confirm-dialog-text']}>Are you sure you would like to send a note to customer with above text and attached file(s)?</p>
        <div className={cx('pull-right', styles['tasks-confirm-buttons'])}>
          <Button className="green-btn" title="Customer will be able to view this status" onClick={() =>this.setCustomStatus(true)}>Yes</Button>
          <Button onClick={this.cancelCustomerStatus} className={cx('white-btn', styles['series-confirm-cancel'])}>Cancel</Button>
        </div>
      </div>);
    } else {
      return this.renderStatusConfirmation(
        <div>
          <h3>Adding a Note</h3>
          <p className={styles['confirm-dialog-text']}>Note can not be empty.</p>
          <div className={cx('pull-right', styles['tasks-confirm-buttons'])}>
            <Button onClick={this.cancelCustomerStatus} className={cx('white-btn', styles['series-confirm-cancel'])}>OK</Button>
          </div>
        </div>
      );
    }
  }

  addNewInternalStatus() {
    if (this.textInput.value !== '' ) {
      this.setCustomStatus(false);
    } else if (this.state.files_to_upload.length > 0) {
      this.setCustomStatus(false);
    } else {
      this.setState({
        showCustomerStatusConfirmation: true
      });
    }
  }

  renderStatusConfirmation(contents) {
    return (
        <div>
          <div className={styles['tasks-confirm-overlay']}/>
          <div className={styles['tasks-confirm-dialog-wrapper']}>
              {contents}
          </div>
        </div>
    );
  }

  cancelCustomerStatus() {
    this.setState({
      showCustomerStatusConfirmation: false,
    });
  }

  addNewCustomerStatus() {
    this.setState({
      showCustomerStatusConfirmation: true,
      customer_note_confirmation_on_retry: true
    });
  }

  updateStatus(type, title, id, notes, estimate, visibleToCustomer, color, custom_message_template, address = null, items = null, exception, customer_signature) {
    this.pushNewState(type, title, id, notes, estimate, visibleToCustomer, color, custom_message_template, address, items, exception, customer_signature);
  }

  updateTaskAssigneeOnServer(entity_ids) {
    const updatedTask = {
      id: this.props.task.id,
      entity_ids: entity_ids.join(',')
    };

    this.props.updateTask(updatedTask).then(() => {
      this.props.taskAssigneeUpdatedCallback(entity_ids, this.props.task.id);
      this.fetchNewData();
    });
  }

  generateLatestStatus(statusList) {
    let latestStatus = 'NOTSTARTED';
    let latestStatusTitle = 'NOTSTARTED';
    // Don't set internal_statuses as latest status on task
    for (let i = 0; i < statusList.length; i++) {
      if (typeof STATUS_META_DATA[statusList[i].type] !== 'undefined' && STATUS_META_DATA[statusList[i].type].isTaskLatestStatus && statusList[i].is_active) {
        latestStatus = statusList[i].type;
        if (typeof statusList[i].title !== 'undefined' && statusList[i].title && statusList[i].title !== '' && statusList[i].title !== null){
          latestStatusTitle = statusList[i].title;
        } else {
          latestStatusTitle = statusList[i].type;
        }
        break;
      }
    }
    return {
      latestStatus, latestStatusTitle
    };
  }

  sendNotification = () => {
    const { latestStatus, latestStatusTitle } = this.state;
    this.setState({ serverActionSendNotificationPending: true });
    this.props.taskSendNotification(this.props.task.id, {
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

  refreshStatus() {
    this.setState({ gettingStatus: true });
    this.props.getTaskStatus(this.props.task.id).then((res) => {
      const statusList = JSON.parse(res);
      const result = this.generateLatestStatus(statusList);
      if (typeof STATUS_META_DATA[result.latestStatus] === 'undefined' || !STATUS_META_DATA[result.latestStatus].isTerminal) {
        this.setState(
          Object.assign(
            this.state,
            { gettingStatus: false, statusList, latestStatus: result.latestStatus, latestStatusTitle: result.latestStatusTitle, showEstimate: true }),
            () => {
              this.getTimeEstimation();
              // Disabling this feature for now
              // this.getPredictedEstiamate();
            }
        );
      } else {
        this.setState(
          Object.assign(
            this.state,
            { gettingStatus: false, statusList, latestStatus: result.latestStatus, latestStatusTitle: result.latestStatusTitle, showEstimate: false })
        );
      }

    });
    this.props.fetchTaskItems(this.props.task.id);
  }

  refreshSummary() {
    this.setState({ gettingSummary: true });
    getTaskSummary(this.props.task.id).then((res) => {
      const taskSummary = JSON.parse(res);
      this.setState({
        mileage: taskSummary.mileage,
        totalTime: taskSummary.total_time,
        taskTime: taskSummary.task_time,
        travelTime: taskSummary.travel_time,
        gettingSummary: false,
      });
    }).catch(() => {
      this.setState({
        gettingSummary: false
      });
    });
  }

  renderStatusList() {
    const { statusList } = this.state;
    const length = statusList.length;

    if (length == 0) {
      return <div className={styles['status-feed-empty']}>No status or notes reported</div>;
    }

    const statusComponents = statusList.map((statusObj, i) => {
      if (typeof statusObj.is_active === 'undefined' || statusObj.is_active === null || statusObj.is_active) {
        let statusColor = statusObj.color;
        if (statusColor === '' || statusObj.color === null) {
          const status_object_local = getStatusDetails(statusObj.type);
          statusColor = status_object_local.color;
        } else {
          statusColor = statusObj.color;
        }
        let lastStyle = {
          width: '15px',
          height: '15px',
          marginTop: '10px',
          backgroundColor: 'white',
          border: "3px solid " + statusColor
        };


        let files = null;
        if (statusObj.extra_fields && statusObj.extra_fields.files && statusObj.extra_fields.files.length > 0) {
          files = statusObj.extra_fields.files.map((file) => {
            if ((!file) || (!file.filename) || (!file.file_path)) {
              return;
            } else {
              const fileExtension = file.filename.split('.').pop();
              let showPreview = false;
              if (fileExtension.includes('jpg') || fileExtension.includes('JPG') || fileExtension.includes('JPEG') || fileExtension.includes('jpeg') || fileExtension.includes('png') || fileExtension.includes('PNG') || fileExtension.includes('gif') || fileExtension.includes('GIF') || fileExtension.includes('bimp') || fileExtension.includes('BIMP') || fileExtension.includes('bmp') || fileExtension.includes('BMP')) {
                showPreview = true;
              }
              return (
                <div className={styles['file-preview-journal']}>
                  <a href={file.file_path} target="_blank">
                    {showPreview &&
                    <img src={file.file_path} className="img-responsive img-rounded full-width" style={{ maxHeight: '450px' }}/>}
                    {!showPreview &&
                    <FontAwesomeIcon icon={faPaperclip}/>}
                    {file.filename}
                  </a>
                </div>
              );
            }
          });
        }
        let exception_files = null;
        if (statusObj.exception && statusObj.exception.files && statusObj.exception.files.length > 0) {
          exception_files = statusObj.exception.files.map((file) => {
            if ((typeof file.filename === 'undefined' || file.filename === null || file.filename === '') || (typeof file.file_path === 'undefined' || file.file_path === null || file.file_path === '')) {
              return;
            } else {
              const fileExtension = file.filename.split('.').pop();
              let showPreview = false;
              if (fileExtension.includes('jpg') || fileExtension.includes('JPG') || fileExtension.includes('JPEG') || fileExtension.includes('jpeg') || fileExtension.includes('png') || fileExtension.includes('PNG') || fileExtension.includes('gif') || fileExtension.includes('GIF') || fileExtension.includes('bimp') || fileExtension.includes('BIMP') || fileExtension.includes('bmp') || fileExtension.includes('BMP')) {
                showPreview = true;
              }
              return (
                <div className={styles['file-preview-journal']}>
                  <a href={file.file_path} target="_blank">
                    {showPreview &&
                    <img src={file.file_path} className="img-responsive img-rounded full-width" style={{ maxHeight: '450px' }}/>}
                    {!showPreview &&
                    <FontAwesomeIcon icon={faPaperclip}/>}
                    {file.filename}
                  </a>
                </div>
              );
            }
          });
        }

        const isCustomStatus = statusObj.type === 'CUSTOM';
        const sourceTooltip = (
          <Tooltip id="tooltip">Posted via {statusObj.source}</Tooltip>
        );

        const locationToolTip = (
          <Tooltip id="tooltip">Click to toggle location map for this status</Tooltip>
        );

        const systemNotificationTooltip = (
          <Tooltip id="notificationTooltip">This is a system notification</Tooltip>
        );

        let taskStatusReporterName = statusObj.reporter_name;
        if (statusObj.from_customer && statusObj.reporter_name === '') {
          taskStatusReporterName = 'Customer';
        }

        const items = statusObj.type === 'ORDER' && statusObj.items && statusObj.items.length > 0 && statusObj.items;

        return (
          <div>
            { statusObj.reporter_id === 0 ?
              <article className={cx(styles['timeline-entry'], styles['system-notification'])}>
                <div className={styles["timeline-entry-inner"]}>
                  <div className={cx(styles["timeline-icon"], styles['notification'])} style={lastStyle}>
                    <OverlayTrigger placement="right" overlay={systemNotificationTooltip}>
                      <span><img src="/images/logo-icon.png" alt="" /></span>
                    </OverlayTrigger>
                  </div>
                  <div className={styles["timeline-label"]}>
                    <h2>{ statusObj.reporter_name } { isCustomStatus ? 'wrote' : 'reported'} { !isCustomStatus && (<span className={styles["item-status"]} style={{backgroundColor: statusColor}}>{statusObj.title ? statusObj.title.toUpperCase() : statusObj.type.toUpperCase()}</span>)}</h2>
                    { statusObj.extra_fields && statusObj.extra_fields.notes ?
                      <p>
                        { statusObj.extra_fields.notes }
                        { (statusObj.extra_fields.auto_start_time && statusObj.extra_fields.auto_start_time !== null && statusObj.extra_fields.auto_start_time !== '') && moment.utc(statusObj.extra_fields.auto_start_time).local().format('hh:mm A') }
                        { (statusObj.extra_fields.auto_complete_time && statusObj.extra_fields.auto_complete_time !== null && statusObj.extra_fields.auto_complete_time !== '') && moment.utc(statusObj.extra_fields.auto_complete_time).local().format('hh:mm A') }
                      </p>
                      :
                      null
                    }
                    <div className={styles['time-display']}>
                      { moment.utc(statusObj.time).local().format('MMM DD hh:mm a') }
                    </div>
                  </div>
                </div>
              </article>
              :
              <article key={'task-status-key-' + i} className={styles['timeline-entry']}>
                <div className={styles["timeline-entry-inner"]}>
                  <div className={styles["timeline-icon"]} style={lastStyle}>
                    <i className="entypo-feather"></i>
                  </div>
                  <div className={styles["timeline-label"]}>
                    <h2>{ taskStatusReporterName } { isCustomStatus ? 'wrote' : 'reported'} { !isCustomStatus && (<span className={styles["item-status"]} style={{backgroundColor: statusColor}}>{statusObj.title ? statusObj.title.toUpperCase() : statusObj.type.toUpperCase()}</span>)}</h2>
                    { (statusObj.exception) ?
                      <div className={styles.exceptionInStatus}>
                        <p>
                          { statusObj.exception.reason_title && <strong>{ statusObj.exception.reason_title }</strong> }
                          { statusObj.source && <OverlayTrigger placement="right" overlay={sourceTooltip}>
                                <span className={styles.sourceBadge}>
                                  { statusObj.source.toUpperCase() === 'WEB' && <FontAwesomeIcon icon={faGlobe} /> }
                                  { statusObj.source.toUpperCase() === 'SMS' && <FontAwesomeIcon icon={faComment} /> }
                                  { statusObj.source.toUpperCase() === 'EMAIL' && <FontAwesomeIcon icon={faEnvelope} /> }
                                  { statusObj.source.toUpperCase() === 'APP' && <FontAwesomeIcon icon={faMobile} /> }
                                </span>
                          </OverlayTrigger> }
                          { statusObj.extra_fields && statusObj.extra_fields.location && statusObj.extra_fields.location.lat !== null && statusObj.extra_fields.location.lng !== null &&
                          !isNaN(statusObj.extra_fields.location.lat) && !isNaN(statusObj.extra_fields.location.lng) && (statusObj.extra_fields.location.lng > -180) &&
                          (statusObj.extra_fields.location.lng < 180) && (statusObj.extra_fields.location.lat > -90) && (statusObj.extra_fields.location.lat < 90) &&
                          statusObj.extra_fields.location.lat !== '' && statusObj.extra_fields.location.lng !== '' ?
                            <OverlayTrigger placement="right" overlay={locationToolTip}>
                                <span onClick={(e) => this.toggleStatusLocationMap(e, i)} className={styles.locationBadge}>
                                  <FontAwesomeIcon icon={faMapMarker} />
                                </span>
                            </OverlayTrigger>
                            :
                            null
                          }
                        </p>
                      </div>
                      :
                      null
                    }

                    { statusObj.extra_fields && statusObj.extra_fields.notes ?
                      <p>
                        { statusObj.extra_fields.notes }
                        { statusObj.source && <OverlayTrigger placement="right" overlay={sourceTooltip}>
                      <span className={styles.sourceBadge}>
                        { statusObj.source.toUpperCase() === 'WEB' && <FontAwesomeIcon icon={faGlobe} /> }
                        { statusObj.source.toUpperCase() === 'SMS' && <FontAwesomeIcon icon={faComment} /> }
                        { statusObj.source.toUpperCase() === 'EMAIL' && <FontAwesomeIcon icon={faEnvelope} /> }
                        { statusObj.source.toUpperCase() === 'APP' && <FontAwesomeIcon icon={faMobile} /> }
                      </span>
                        </OverlayTrigger> }
                        { statusObj.extra_fields && statusObj.extra_fields.location && statusObj.extra_fields.location.lat !== null && statusObj.extra_fields.location.lng !== null &&
                        !isNaN(statusObj.extra_fields.location.lat) && !isNaN(statusObj.extra_fields.location.lng) && (statusObj.extra_fields.location.lng > -180) &&
                        (statusObj.extra_fields.location.lng < 180) && (statusObj.extra_fields.location.lat > -90) && (statusObj.extra_fields.location.lat < 90) &&
                        statusObj.extra_fields.location.lat !== '' && statusObj.extra_fields.location.lng !== '' ?
                          <OverlayTrigger placement="right" overlay={locationToolTip}>
                      <span onClick={(e) => this.toggleStatusLocationMap(e, i)} className={styles.locationBadge}>
                        <FontAwesomeIcon icon={faMapMarker} />
                      </span>
                          </OverlayTrigger>
                          :
                          null
                        }
                      </p>
                      :
                      null
                    }

                    { statusObj.extra_fields && statusObj.extra_fields.input_prompt ?
                      <p>
                        { statusObj.extra_fields.input_prompt }
                        { statusObj.source && <OverlayTrigger placement="right" overlay={sourceTooltip}>
                      <span className={styles.sourceBadge}>
                        { statusObj.source.toUpperCase() === 'WEB' && <FontAwesomeIcon icon={faGlobe} /> }
                        { statusObj.source.toUpperCase() === 'SMS' && <FontAwesomeIcon icon={faComment} /> }
                        { statusObj.source.toUpperCase() === 'EMAIL' && <FontAwesomeIcon icon={faEnvelope} /> }
                        { statusObj.source.toUpperCase() === 'APP' && <FontAwesomeIcon icon={faMobile} /> }
                      </span>
                        </OverlayTrigger> }
                        { statusObj.extra_fields && statusObj.extra_fields.location && statusObj.extra_fields.location.lat !== null && statusObj.extra_fields.location.lng !== null &&
                        !isNaN(statusObj.extra_fields.location.lat) && !isNaN(statusObj.extra_fields.location.lng) && (statusObj.extra_fields.location.lng > -180) &&
                        (statusObj.extra_fields.location.lng < 180) && (statusObj.extra_fields.location.lat > -90) && (statusObj.extra_fields.location.lat < 90) &&
                        statusObj.extra_fields.location.lat !== '' && statusObj.extra_fields.location.lng !== '' ?
                          <OverlayTrigger placement="right" overlay={locationToolTip}>
                      <span onClick={(e) => this.toggleStatusLocationMap(e, i)} className={styles.locationBadge}>
                        <FontAwesomeIcon icon={faMapMarker} />
                      </span>
                          </OverlayTrigger>
                          :
                          null
                        }
                      </p>
                      :
                      null
                    }

                    { (statusObj.current_destination && statusObj.current_destination.complete_address) ?
                      <p>
                        { statusObj.current_destination.complete_address }
                        { statusObj.source && <OverlayTrigger placement="right" overlay={sourceTooltip}>
                      <span className={styles.sourceBadge}>
                        { statusObj.source.toUpperCase() === 'WEB' && <FontAwesomeIcon icon={faGlobe} /> }
                        { statusObj.source.toUpperCase() === 'SMS' && <FontAwesomeIcon icon={faComment} /> }
                        { statusObj.source.toUpperCase() === 'EMAIL' && <FontAwesomeIcon icon={faEnvelope} /> }
                        { statusObj.source.toUpperCase() === 'APP' && <FontAwesomeIcon icon={faMobile} /> }
                      </span>
                        </OverlayTrigger> }
                        { statusObj.extra_fields && statusObj.extra_fields.location && statusObj.extra_fields.location.lat !== null && statusObj.extra_fields.location.lng !== null &&
                        !isNaN(statusObj.extra_fields.location.lat) && !isNaN(statusObj.extra_fields.location.lng) && (statusObj.extra_fields.location.lng > -180) &&
                        (statusObj.extra_fields.location.lng < 180) && (statusObj.extra_fields.location.lat > -90) && (statusObj.extra_fields.location.lat < 90) &&
                        statusObj.extra_fields.location.lat !== '' && statusObj.extra_fields.location.lng !== '' ?
                          <OverlayTrigger placement="right" overlay={locationToolTip}>
                      <span onClick={(e) => this.toggleStatusLocationMap(e, i)} className={styles.locationBadge}>
                        <FontAwesomeIcon icon={faMapMarker} />
                      </span>
                          </OverlayTrigger>
                          :
                          null
                        }
                      </p>
                      :
                      null
                    }


                    { statusObj.extra_fields && statusObj.extra_fields.estimate ?
                      <p>
                        { statusObj.extra_fields.estimate } mins
                        { statusObj.source && <OverlayTrigger placement="right" overlay={sourceTooltip}>
                      <span className={styles.sourceBadge}>
                        { statusObj.source.toUpperCase() === 'WEB' && <FontAwesomeIcon icon={faGlobe} /> }
                        { statusObj.source.toUpperCase() === 'SMS' && <FontAwesomeIcon icon={faComment} /> }
                        { statusObj.source.toUpperCase() === 'EMAIL' && <FontAwesomeIcon icon={faEnvelope} /> }
                        { statusObj.source.toUpperCase() === 'APP' && <FontAwesomeIcon icon={faMobile} /> }
                    </span>
                        </OverlayTrigger> }
                      </p>
                      :
                      null
                    }
{/*
                    { statusObj.current_destination.complete_address && statusObj.title.toUpperCase() === 'ENROUTE' ?
                      <p>
                        { statusObj.current_destination.complete_address } mins
                        { statusObj.source && <OverlayTrigger placement="right" overlay={sourceTooltip}>
                      <span className={styles.sourceBadge}>
                        { statusObj.source.toUpperCase() === 'WEB' && <FontAwesomeIcon icon={faGlobe} /> }
                        { statusObj.source.toUpperCase() === 'SMS' && <FontAwesomeIcon icon={faComment} /> }
                        { statusObj.source.toUpperCase() === 'EMAIL' && <FontAwesomeIcon icon={faEnvelope} /> }
                        { statusObj.source.toUpperCase() === 'APP' && <FontAwesomeIcon icon={faMobile} /> }
                    </span>
                        </OverlayTrigger> }
                      </p>
                      :
                      null
                    }*/}
                    { this.state.showMap && this.state.statusLocationIndex === i && statusObj.extra_fields && statusObj.extra_fields.location ?
                      <StatusMap position={ statusObj.extra_fields.location } />
                      :
                      null
                    }
                    {items &&
                          <Row className={styles.productContainer}>
                          <TaskProducts products={items} slidesToScroll={2} slidesToShow={2} showExceptions showProductsType showProductStatus page="taskStatus"/>
                          </Row>
                    }
                    { files }
                    { exception_files }

                    { /* <blockquote>Pianoforte principles our unaffected not for astonished travelling are particular.</blockquote>
              <img src="http://themes.laborator.co/neon/assets/images/timeline-image-3.png" className="img-responsive img-rounded full-width" />*/ }

                    <div className={styles['time-display']}>
                      { (typeof STATUS_META_DATA[statusObj.type] === 'undefined' || STATUS_META_DATA[statusObj.type].isDeletePossible) && this.can_delete_status &&
                      <button className={styles.deleteButton} onClick={() => this.deleteStatus(statusObj.id)}>&#10005;</button>
                      }
                      { statusObj.extra_fields && statusObj.extra_fields.visible_to_customer && <OverlayTrigger placement="bottom" overlay={<Tooltip id="visibilityIndicator">Visible to Customer</Tooltip>}><span className={styles.visibleToCustomerIndicator}>&#10003;</span></OverlayTrigger> }
                      { moment.utc(statusObj.time).local().format('MMM DD hh:mm a') }
                    </div>
                  </div>
                </div>
              </article>
            }
          </div>
        );
      }
    });

    return <div className={["timeline-centered", styles['timeline-override']].join(' ')}>{statusComponents}</div>;
  }

  getEmptyEntityText() {
    return <div className={styles['no-info']}>Location information not available</div>;
  }

  renderEntitiesToShowOnMap() {
    const { task } = this.props;
    const { filteredEntities } = this.state;
    let haveEntitiesLocation = false;

    if (!filteredEntities.length === 0 && !task.customer_exact_location) {
      return this.getEmptyEntityText();
    }

    const filteredData = [];
    for (let i = 0; i < filteredEntities.length; i++) {
      if (filteredEntities[i].lastreading) {
        haveEntitiesLocation = true;
        filteredData.push({
          location : filteredEntities[i].lastreading,
          name     : filteredEntities[i].name,
          id       : filteredEntities[i].id,
          time     : filteredEntities[i].lastreading.time,
          type     : filteredEntities[i].type,
        });
      }
    }

    let haveDestinationLocation = false;
    let location = null;
    let name = null;
    let address = null;
    if (task.customer_exact_location && task.customer_exact_location.lat) {
      location = task.customer_exact_location;
      name = getCustomerName(task.customer_first_name, task.customer_last_name);
      address = task.customer_address;
    }
    if (location) {
      haveDestinationLocation = true;
      filteredData.push({
        location : location,
        name     : name,
        address  : address,
        type     : 'customer',
        time     : task.start_datetime,
        color: task.extra_fields && task.extra_fields.task_color ? task.extra_fields.task_color : '#0693e3',
      });
    }

    if (task.additional_addresses && task.additional_addresses.length > 0) {
      task.additional_addresses.map((additionalAddress) => {
        filteredData.push({
          location : additionalAddress.exact_location,
          name     : additionalAddress.title,
          address  : additionalAddress.complete_address,
          type     : 'customer',
          time     : task.start_datetime,
          color    : task.extra_fields && task.extra_fields.task_color ? task.extra_fields.task_color : '#0693e3',
        });
      });
    }

    let showDirections = false;
    if (task.status === 'ENROUTE' && haveEntitiesLocation && haveDestinationLocation) {
      showDirections = true;
    }

    return (
      <div className={styles.map}>
        <LocationMapV2 height={654} entities={filteredData} entitiesRoutes={ this.state.entitiesRoutes } showDirections={false} showLocation />
      </div>
    );
  }

  renderTaskReport() {

    if (this.state.totalTime !==  null && this.state.taskTime !==  null && this.state.travelTime !==  null) {
      return (<div className={styles['timeTable']}>
      <div className={styles['containerTime']}>
      <div className={styles['itemTwo']}><span className={styles['right']}>{Math.floor((this.state.totalTime / 60)) + ' Hours '+ this.state.totalTime % 60 + ' Minutes'}</span></div>
      <div className={styles['itemOne']}>
      {<FontAwesomeIcon icon={faHourglass} className={styles.icon} />}<span> Total Time
      </span></div>
      </div>

      <div className={styles['containerTime']}>
      <div className={styles['itemFour']}><span className={styles['right']}>{Math.floor((this.state.travelTime / 60)) + ' Hours '+ this.state.travelTime % 60 + ' Minutes'}</span></div>
      <div className={styles['itemThree']}>
      {<img src="/images/task-summary-time.svg" className={cx(styles.icon, styles.iconImage)}/>}<span> Travel Time
      </span></div>
      </div>


      <div className={styles['containerTime']}>
      <div className={styles['itemSix']}><span className={styles['right']}>{Math.floor((this.state.taskTime / 60)) + ' Hours '+ this.state.taskTime % 60 + ' Minutes'}</span></div>
      <div className={styles['itemFive']}>
      {<FontAwesomeIcon icon={faClock} className={styles.icon} />}<span> Task Time
      </span></div>
      </div>

      {this.state.mileage !== null &&
      <div className={styles['containerTime']}>
        <div className={styles['itemSix']}><span className={styles['right']}>{this.state.mileage} miles</span></div>
        <div className={styles['itemFive']}>
          {<FontAwesomeIcon icon={faRoad} className={styles.icon} />}<span> Mileage
      </span></div>
      </div>
      }
      </div>);
    } else {
      return (<div className={ styles['list-empty'] }>No Summary</div>);
    }
  }

  updateImageClick() {
    if (!this.state.fileUploader) {
      this.setState({
        fileUploader: true,
      });
    } else {
      this.setState({
        fileUploader: false,
      });
    }
  }

  closeImage(filename, closeEvent) {
    closeEvent.preventDefault();
    closeEvent.stopPropagation();
    for (let i = 0; i < this.state.files_to_upload.length; i++) {
      if (this.state.files_to_upload[i].name == filename) {
        this.state.files_to_upload.splice(i, 1);
        this.forceUpdate();
      }
    }
  }

  onDrop(files) {
    let allBackup = this.state.files_to_upload;
    if (this.state.files_to_upload.length >= 0) {
      for (let i = 0; i < files.length; i++) {
        files[i].isNew = 'true';
        files[i].isInProcess = 'false';
        allBackup.push(files[i]);
      }
    }
    let fileCheck = false;
    let temp = allBackup;
    let localArr = [];
    if (this.state.uploadFailedFiles.length > 0) {
      fileCheck = true;
    }
    if (allBackup.length > this.state.filesAllowed) {
      for (let i = 0; i < this.state.filesAllowed; i++) {
        localArr[i] = allBackup[i];
      }
      this.setState({
        files_to_upload:localArr,
        newFilePlaced: fileCheck
      });
    } else {
      this.setState({
        files_to_upload: temp,
        newFilePlaced: fileCheck
      });
    }
  }

  getPreview(dropObj) {
    switch (dropObj.type) {
      case 'image/jpeg':
        return dropObj.preview;
        break;
      case 'image/jpg':
        return dropObj.preview;
        break;
      case 'image/png':
        return dropObj.preview;
        break;
      case 'image/gif':
        return dropObj.preview;
        break;
      case 'image/bimp':
        return dropObj.preview;
        break;
      case 'image/bmp':
        return dropObj.preview;
        break;
      case 'application/msword':
        return '/images/icon-doc.png';
        break;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return '/images/icon-excel.png';
        break;
      case 'application/pdf':
        return '/images/icon-pdf.png';
        break;
      case 'text/plain':
        return '/images/icon-txt.png';
        break;
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return '/images/icon-ppt.png';
        break;
      default:
        return '/images/icon-file.png';
    }
  }

  //Extra Function. Not Using anywhere
  renderMileage() {
    return this.state.mileage.length ? (
      <span>, Mileage: <span>{ Math.round(this.state.mileage.reduce((a, b) => a + b, 0) * 100) / 100 }</span> miles</span>
    ) : '';
  }

  deleteStatus(status_id) {
    this.setState({
      serverActionPending: true,
      serverActionComplete: false,
    });
    deleteStatus(this.props.task.id, status_id).then((res) => {
      this.setState({
        serverActionPending: false,
        serverActionComplete: true,
      });
      this.refreshStatus();
    }).catch((err) => {
      const error = JSON.parse(err.responseText);
      this.setState({
        serverActionPending: false,
        serverActionComplete: true
      });
	    const notification = {
		    text: getErrorMessage(error),
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

  formatPredictedEstimate(estimate) {
    if (estimate === null || estimate === 'Not Available') {
      return 'Not Available';
    }
    const start_time = moment.utc(estimate).subtract(5, 'm').local();
    const end_time = moment.utc(estimate).add(5, 'm').local();
    if (start_time.date() !== end_time.date()) {
      return start_time.format('MMM DD, hh:mm a') + end_time.format(' - MMM DD, hh:mm a');
    } else {
      return start_time.format('MMM DD, hh:mm a') + end_time.format(' - hh:mm a');
    }
  }

  render() {
    let completeObject = null;

    const { customStatus, latestStatus, latestStatusTitle, statusList, estimate } = this.state;

    const status_style = {
      backgroundColor: STATUS_DICT[latestStatus].color,
      borderColor: STATUS_DICT[latestStatus].color
    };

    for (let i = 0; i < statusList.length; i++) {
      if ((statusList[i].type === 'COMPLETE' || statusList[i].type === 'AUTO_COMPLETE') && statusList[i].is_active) {
        completeObject = statusList[i];
        break;
      }
    }

    let dropZoneOption = null;
    if (!this.state.fileUploader) {
      dropZoneOption = 'Attach a File';
    } else if (this.state.fileUploader) {
      dropZoneOption = 'Close Attaching Files';
    }

    const customerNoteTooltip = (
      <Tooltip id="customernote">Send a note to the customer. If sms and email notifications are enabled for the customer, Arrivy will send the note via sms and email. Also, the note will be visible on 'Customer View of the Task'</Tooltip>
    );

    const SimpleNoteTooltip = (
      <Tooltip id="simplenote">This is an internal note on the job. Only visible to you and your assigned team members.</Tooltip>
    );

    let primaryAddress = null;

    if (this.props.task.customer_address !== '') {
      primaryAddress = {
        title: (this.props.task.customer_name !== null && this.props.task.customer_name !== '') ? this.props.task.customer_name : 'Primary Address',
        address_line_1: this.props.task.customer_address_line_1,
        address_line_2: this.props.task.customer_address_line_2,
        city: this.props.task.customer_city,
        zipcode: this.props.task.customer_zipcode,
        state: this.props.task.customer_state,
        country: this.props.task.customer_country,
        exact_location: this.props.task.customer_exact_location,
        complete_address: this.props.task.customer_address
      };
    }
    return (
    <Grid>
      { this.state.showCustomerStatusConfirmation && this.renderCustomerStatus(this.textInput.value) }
      { statusList.length > 0  && completeObject != null && (
      <Row className={styles['top-area']}>
        <Col lg={6} md={6} sm={12}>
          {!this.state.gettingRatings &&
            <h3>Reviews</h3>
          }
          {this.state.gettingRatings &&
            <h3><SavingSpinner title="Loading Reviews" borderStyle="none" /></h3>
          }
          <div className={styles['reviews-block']}>
            <RatingsView overflow ratings={ this.state.ratings } task={ this.props.task } companyUrl={this.props.company_url} companyProfile={this.props.companyProfile}/>
          </div>
        </Col>
        <Col lg={6} md={6} sm={12}>
          {!this.state.gettingSummary &&
            <h3>Summary</h3>
          }
          {this.state.gettingSummary &&
            <h3><SavingSpinner title="Loading Summary" borderStyle="none" /></h3>
          }
          {this.renderTaskReport()}
        </Col>
      </Row>
      )}
      <Row className={styles['formset-block']}>
        <Col lg={8} md={8} sm={12}>
          { statusList != null && (
            <div className={styles['top-block']}>
              <div className={styles['latest-status']}>
                  <div className={styles['status']}>Latest Status:
                    {this.state.gettingStatus
                        ? (<SavingSpinner title="Loading Status" borderStyle="none" size={8} />)
                        : (<div style={{ borderColor: STATUS_DICT[latestStatus].color }} className={styles['statusBadge']}>{latestStatusTitle}</div>
                    )}
                  </div>
                { this.can_add_status &&
                  <div>
                    {this.props.statuses !== null && this.props.statuses.length > 0 ?
                      <TaskStatusButtons
                        primaryAddress={primaryAddress}
                        additionalAddresses={this.props.task.additional_addresses}
                        statuses={this.props.statuses}
                        sendTaskStatus={this.updateStatus.bind(this)}
                        items={this.props.items}
                        fetchItems={this.props.fetchTaskItems}
                        sendingStatus={this.state.sendingStatus}
                        profile={this.props.profile}
                        updateImagesDisplay = {this.updateImagesDisplay}
                        task = {this.props.task}
                        taskId = {this.props.task.id}
                        companyProfile={this.props.companyProfile}
                        uploadFilesOnServer={this.uploadFilesOnServer}
                      />
                      :
                      <p>The selected template has been removed. <br/> Please select another template.</p>
                    }
                  </div>
                }
              </div>
            </div>
          )}
        </Col>
        <Col lg={4} md={4} sm={12}>
          {this.can_add_team_member &&
            <div className={styles['assignees-block']}>
              <FieldGroup
                id="task-color"
                label="Assignee(s)"
                ref="crewSelector"
                name="crew-selector"
                updateEntities={this.updateTaskAssigneeOnServer}
                componentClass={CrewSelectorV2}
                allEntities={this.props.entities}
                entities={this.props.task.entity_ids}
                placeholder="Assign team member"
                startDate={this.props.task.start}
                endDate={this.props.task.end}
                getSchedule={this.props.getSchedule}
                entity_confirmation_statuses={this.props.task.entity_confirmation_statuses}
                profile={this.props.companyProfile}
                canEdit={false}
                elId={Math.random().toString(36).substr(2, 16)}
                placeholderImage={'/images/user.png'}
              />
            </div>
          }
        </Col>
      </Row>
      <Row className={styles['info-area']}>
        <Col lg={6} md={12} sm={12}>
          <div className={styles['notes-section']}>

            {(
                <div className={styles['task-info']}>
                  <div className={styles['refresh']}>
                    <h3>Journal</h3>
                    <FontAwesomeIcon icon={faSync} className={cx(styles.icon, styles.iconReload)} onClick={() => { this.fetchNewData(); }}/>
                  </div>
                  <div>
                    <div className={styles['status-feed']} style={ this.can_add_status ? { maxHeight: '450px' } : { maxHeight: '620px' } }>
                      {this.renderStatusList()}
                    </div>
                  </div>
                </div>
            )}
            { statusList != null && (
                <div className={styles['add-notes-container']}>
                  {this.can_add_status && <textarea className={styles['input-text']} placeholder="Type your note here ..." ref = {(input) => { this.textInput = input}}/>}
                  {this.state.fileUploader &&
                    <section className={cx("animated fadeIn", styles["dropzoneContainer"])}>
                      <div className="dropzone">
                        <Dropzone id="dropzone1" className={styles.actualDropZone} onDrop={this.onDrop.bind(this)}>
                          {this.state.files_to_upload.length === 0 &&
                            <div className={styles.dropMsg}>
                              <p> <strong>Drop</strong> files here to upload or <strong>Click</strong> here to browse files</p>
                            </div>
                          }
                          {this.state.files_to_upload.length !== 0 &&
                            <ul className={styles.uploadFilesPreviews}>
                              {this.state.files_to_upload.map(file =>
                                <li>
                                <button onClick={(e) => this.closeImage(file.name, e)} className={styles.closeBtn}><FontAwesomeIcon icon={faTimesCircle} /></button>
                                <div className={styles.uploadCaption}><span>{file.name}</span></div>
                                <img src={this.getPreview(file)} />
                                {file.isNew =='false' &&
                                  <button onClick={(e) => this.uploadFilesAgain(file,e)} className={styles.retryBtn}><FontAwesomeIcon icon={faSync} /></button>
                                }
                                {file.isInProcess == 'true' &&
                                  <i className={cx('fa fa-spinner fa-spin ' + styles.uploadSpinner)}></i>
                                }
                                </li>)
                              }
                                {this.state.files_to_upload.length > 0 && this.state.files_to_upload.length < this.state.filesAllowed &&
                                  <li className={styles.addAnotherImg}>
                                    <div><FontAwesomeIcon icon={faPlus} className={styles.addAnotherIcon} /></div>
                                  </li>
                                }
                            </ul>
                          }
                        </Dropzone>
                      </div>
                      <aside>
                        <ul>
                        </ul>
                      </aside>
                    </section>
                    }
                    {this.state.fileUploader && this.renderFileUploadAreaForLowRes()}
                  {this.can_add_status &&
                    <div className="text-right">
                        <div className={styles['status-area']}>
                            {/*{this.state.error !== null && !this.state.serverActionPending && (*/}
                                {/*<div className={styles.csErrorMsg}>*/}
                                    {/*{this.state.error}*/}
                                {/*</div>*/}
                            {/*)}*/}
                            {(this.state.serverActionPending) &&
                              <SavingSpinner title={'Saving '} borderStyle="none"/>
                            }
                            {(this.state.serverActionSendNotificationPending) &&
                              <SavingSpinner title={'Sending '} borderStyle="none"/>
                            }
                        </div>
                      <Button bsStyle="link" className={styles['file-upload-link']} onClick={this.updateImageClick}>
                        {dropZoneOption} <Glyphicon glyph="paperclip" />
                      </Button>
                        <OverlayTrigger placement="bottom" overlay={customerNoteTooltip}>
                          <Button className={cx(styles['add-note'], 'btn-submit', styles['visible-to-customer'])} onClick={() =>this.addNewCustomerStatus()}>
                              Add customer note
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="bottom" overlay={SimpleNoteTooltip}>
                          <Button className={cx(styles['add-note'], 'btn-submit')} onClick={() =>this.addNewInternalStatus()}>
                                Add note
                          </Button>
                        </OverlayTrigger>
                    </div>}
                </div>
            )}
          </div>
          {this.can_add_status &&
            <div className="text-right">
              <Button bsStyle="link" className={styles['add-note']} onClick={this.sendNotification}>
                Resend Task Confirmation
              </Button>
            </div>
            }


        </Col>
        <Col lg={6} md={12} sm={12}>
          <div className={styles['map-section']}>
            <div className={styles['map-top']}>

              <div>
                {this.state.showEstimate &&
                  <div className={styles.savingSpinnerInline}>
                    {this.state.gettingEstimate ?
                      <SavingSpinner title="Loading " borderStyle="none" size={8} />
                      : (
                        <div>
                          <span>Estimate: <span>{estimate}</span></span>
                          <div className={styles.predictedEstimate}>
                            {this.state.predictedEstimate !== null && this.state.predictedEstimate.estimate !== 'Not Available' &&
                              <OverlayTrigger placement="bottom" overlay={(<Tooltip id="predictedEstimateTooltip">This is an experimental feature, not visible to your customers.</Tooltip>)}>
                                <span>Predicted Arrival Time: <span>{this.formatPredictedEstimate(this.state.predictedEstimate.estimate)}</span></span>
                              </OverlayTrigger>
                            }
                          </div>
                        </div>
                      )
                    }
                  </div>
                }

                <div className={styles['customer-view-link']}>
                  {this.can_add_status &&
                    <a href={encodeURI(this.state.window_origin + '/live/track/' + this.props.reporter_name + '/' + this.props.task.url_safe_id + '?url=business')} target="_blank">Check Customer's view of the task</a>
                  }
                </div>
              </div>
            </div>
            { this.renderEntitiesToShowOnMap() }
          </div>
        </Col>
      </Row>
    </Grid>
    );
  }
}

TaskStatus.propTypes = {
  task: PropTypes.object.isRequired,
  entities: PropTypes.array.isRequired,
  getTaskStatus: PropTypes.func.isRequired,
  getTaskRatings: PropTypes.func.isRequired,
  getEstimate: PropTypes.func.isRequired,
  getSchedule: PropTypes.func.isRequired,
  updateTaskStatus: PropTypes.func,
  updateTask: PropTypes.func,
  statuses: PropTypes.array,
  company_id: PropTypes.number,
  company_url: PropTypes.string,
  reporter_id: PropTypes.number,
  reporter_name: PropTypes.string,
  taskStatusUpdateCallback: PropTypes.func,
  taskAssigneeUpdatedCallback: PropTypes.func
};
