import React, { Component } from 'react';
import style from "../../base-styling.module.scss";
import styles from './task-status.module.scss';
import cx from 'classnames';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import Reviews from "../reviews/reviews";
import Summary from "../summary/summary";
import Journal from "../journal/journal";
import Status from "../status/status";
import TimeMileage from "../time-mileage/time-mileage";
import Map from "../map/map";
import PubSub from "pubsub-js";
import {
  deleteStatus,
  getAttachmentUploadURL,
  getPredictedArrival,
  getTaskItemsList,
  getTaskSummary,
  uploadAttachment
} from "../../../../actions";
import {STATUS_META_DATA} from "../../../../helpers/status_meta_data";
import moment from "moment";
import {getCustomerName, getErrorMessage} from "../../../../helpers/task";
import {toast} from "react-toastify";

const errorMsg = (error) => {
  return getErrorMessage(error);
};

export default class TaskStatus extends Component {
  constructor(props) {
    super(props);

    this.refreshStatus = this.refreshStatus.bind(this);
    this.refreshSummary = this.refreshSummary.bind(this);
    this.fetchNewData = this.fetchNewData.bind(this);
    this.startAsyncUpdate = this.startAsyncUpdate.bind(this);
    this.getPredictedEstimate = this.getPredictedEstimate.bind(this);
    this.fetchTaskItems = this.fetchTaskItems.bind(this);
    this.updateImagesDisplay = this.updateImagesDisplay.bind(this);
    this.uploadFilesOnServer = this.uploadFilesOnServer.bind(this);
    this.sendStatus = this.sendStatus.bind(this);
    this.closeImage = this.closeImage.bind(this);
    this.getPreview = this.getPreview.bind(this);
    this.getFilePreview = this.getFilePreview.bind(this);
    this.uploadFilesAgain = this.uploadFilesAgain.bind(this);
    this.updateImageClick = this.updateImageClick.bind(this);
    this.addNewCustomerStatus = this.addNewCustomerStatus.bind(this);
    this.cancelCustomerStatus = this.cancelCustomerStatus.bind(this);
    this.addNewInternalStatus = this.addNewInternalStatus.bind(this);
    this.uploadFilesAndSendStatus = this.uploadFilesAndSendStatus.bind(this);
    this.uploadSingleFile = this.uploadSingleFile.bind(this);
    this.toggleStatusLocationMap = this.toggleStatusLocationMap.bind(this);
    this.deleteStatus = this.deleteStatus.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.showUploadedFiles = this.showUploadedFiles.bind(this);
    this.changeCustomStatus = this.changeCustomStatus.bind(this);
    this.setCustomStatus = this.setCustomStatus.bind(this);
    this.renderCustomerStatus = this.renderCustomerStatus.bind(this);
    this.renderStatusConfirmation = this.renderStatusConfirmation.bind(this);
    this.updateTaskAssigneeOnServer = this.updateTaskAssigneeOnServer.bind(this);
    this.closeFileAttach = this.closeFileAttach.bind(this);
    this.clearAsyncUpdate = this.clearAsyncUpdate.bind(this);
    this.visibilityChanged = this.visibilityChanged.bind(this);

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
      timeMileage: null
    }
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
    document.addEventListener('visibilitychange', this.visibilityChanged);
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
    this.clearAsyncUpdate();
    document.removeEventListener('visibilitychange', this.visibilityChanged);
  }

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

  visibilityChanged() {
    if (document.hidden) {
      this.clearAsyncUpdate();
    } else {
      this.clearAsyncUpdate();
      this.startAsyncUpdate();
    }
  }

  clearAsyncUpdate() {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
  }

  refreshStatus() {
    this.setState({ gettingStatus: true });
    this.props.getTaskStatus(this.props.task.id).then((res) => {
      const statusList = JSON.parse(res);
      const result = this.props.generateLatestStatus(statusList);
      if (!STATUS_META_DATA[result.latestStatus] || !STATUS_META_DATA[result.latestStatus].isTerminal) {
        this.setState(
          Object.assign(
            this.state,
            { gettingStatus: false, statusList, latestStatus: result.latestStatus, latestStatusTitle: result.latestStatusTitle, showEstimate: true }),
          () => {
            this.getTimeEstimation();
            // this.getPredictedEstimate();
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
        timeMileage: taskSummary.time_mileage,
        gettingSummary: false,
      });
    }).catch(() => {
      this.setState({
        gettingSummary: false
      });
    });
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

  getPredictedEstimate() {
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

  getEmptyEntityText() {
    return <div className={styles['no-info']}>Location information not available</div>;
  }

  renderEntitiesToShowOnMap() {
    const { task } = this.props;
    const { filteredEntities } = this.state;
    let haveEntitiesLocation = false;

    // This will never be true as first condition will false always
    // if (!filteredEntities.length === 0 && !task.customer_exact_location) {
    //   return this.getEmptyEntityText();
    // }

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
          image_path: filteredEntities[i].image_path
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
      <Map
        estimate={this.state.estimate}
        showEstimate={this.state.showEstimate}
        gettingEstimate={this.state.gettingEstimate}
        predictedEstimate={this.state.predictedEstimate}
        formatPredictedEstimate={this.state.predictedEstimate ? () => {this.formatPredictedEstimate(this.state.predictedEstimate.estimate)} : null}
        entities={filteredData}
        entitiesRoutes={ this.state.entitiesRoutes }
      />
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

  updateStatus(type, title, id, notes, estimate, visibleToCustomer, color, custom_message_template, address = null, items = null, exception, customer_signature) {
    this.pushNewState(type, title, id, notes, estimate, visibleToCustomer, color, custom_message_template, address, items, exception, customer_signature);
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

  addNewCustomerStatus() {
    this.setState({
      showCustomerStatusConfirmation: true,
      customer_note_confirmation_on_retry: true
    });
  }

  cancelCustomerStatus() {
    this.setState({
      showCustomerStatusConfirmation: false,
    });
  }

  addNewInternalStatus() {
    if (this.textInput.value ) {
      this.setCustomStatus(false);
    } else if (this.state.files_to_upload.length > 0) {
      this.setCustomStatus(false);
    } else {
      this.setState({
        showCustomerStatusConfirmation: true
      });
    }
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

  closeFileAttach(closeFileOption){
    if (!closeFileOption){
      this.setState({
        fileUploader:closeFileOption
      });
    }
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
    if (status && this.state.files_to_upload.length === 0) {
      return this.renderStatusConfirmation(<div>
        <div className={cx(styles.modalHeader)}>
          <h3 className={cx(styles.modalTitle)}>Adding a Customer Note</h3>
        </div>
        <div className={cx(styles.bodyInner)}>
          <div className={cx(styles.box)}>
            <p>You wrote:</p>
            <div className="text-center">
              <div className={cx(styles.note)}>{status}</div>
            </div>
            <p>Are you sure you would like to send a note to customer with above text?</p>
          </div>
          <div className="text-right">
            <button onClick={this.cancelCustomerStatus} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
            <button className={cx(styles.btn, styles['btn-secondary'])} title="Customer will be able to view this status" onClick={() =>this.setCustomStatus(true)}>Yes</button>
          </div>
        </div>
      </div>);
    } else if (this.state.files_to_upload.length > 0 && !status) {
      return this.renderStatusConfirmation(<div>
        <div className={cx(styles.modalHeader)}>
          <h3 className={cx(styles.modalTitle)}>Adding a Customer Note</h3>
        </div>
        <div className={cx(styles.bodyInner)}>
          <div className={cx(styles.box)}>
            <p>Are you sure you would like to send attachments without a note?</p>
          </div>
          <div className="text-right">
            <button onClick={this.cancelCustomerStatus} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
            <button className={cx(styles.btn, styles['btn-secondary'])} title="Customer will be able to view this status" onClick={() =>this.setCustomStatus(true)}>Yes</button>
          </div>
        </div>
      </div>);
    } else if (this.state.files_to_upload.length > 0 && status) {
      return this.renderStatusConfirmation(<div>
        <div className={cx(styles.modalHeader)}>
          <h3 className={cx(styles.modalTitle)}>Adding a Customer Note</h3>
        </div>
        <div className={cx(styles.bodyInner)}>
          <div className={cx(styles.box)}>
            <p>You wrote:</p>
            <div className="text-center">
              <div className={cx(styles.note)}>{status}</div>
            </div>
            <p>Are you sure you would like to send a note to customer with above text and attached file(s)?</p>
          </div>
          <div className="text-right">
            <button onClick={this.cancelCustomerStatus} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
            <button className={cx(styles.btn, styles['btn-secondary'])} title="Customer will be able to view this status" onClick={() =>this.setCustomStatus(true)}>Yes</button>
          </div>
        </div>
      </div>);
    } else {
      return this.renderStatusConfirmation(
        <div>
          <div className={cx(styles.modalHeader)}>
            <h3 className={cx(styles.modalTitle)}>Adding a Note</h3>
          </div>
          <div className={cx(styles.bodyInner)}>
            <div className={cx(styles.box, ["text-center"])}>
              <p>Note can not be empty.</p>
            </div>
            <div className="text-right">
              <button onClick={this.cancelCustomerStatus} className={cx(styles.btn, styles['btn-secondary'])}>OK</button>
            </div>
          </div>
        </div>
      );
    }
  }

  renderStatusConfirmation(contents) {
    return (
      <Modal show={true} animation={false} dialogClassName={cx(styles.modalCustomerNote)}>
        <Modal.Body>
          <i className={cx(styles.close)} onClick={this.cancelCustomerStatus}><svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756"><g transform="translate(-1270.486 -30.485)"><path d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z" transform="translate(4126.197 -40.804)" fill="#8d959f"></path></g></svg></i>
          {contents}
        </Modal.Body>
      </Modal>
    );
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

  render() {
    let completeObject = null;
    const { customStatus, latestStatus, latestStatusTitle, statusList, estimate } = this.state;

    for (let i = 0; i < statusList.length; i++) {
      if ((statusList[i].type === 'COMPLETE' || statusList[i].type === 'AUTO_COMPLETE') && statusList[i].is_active) {
        completeObject = statusList[i];
        break;
      }
    }

    let primaryAddress = null;

    if (this.props.task.customer_address) {
      primaryAddress = {
        title: this.props.task.customer_name ? this.props.task.customer_name : 'Primary Address',
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

    let dropZoneOption = null;
    if (!this.state.fileUploader) {
      dropZoneOption = 'Attach a File';
    } else if (this.state.fileUploader) {
      dropZoneOption = 'Close Attaching Files';
    }

    return (
      <div className={cx(styles.fullContainer)}>
        { this.state.showCustomerStatusConfirmation && this.renderCustomerStatus(this.textInput.value) }
        { statusList.length > 0  && completeObject &&
        <Row className={cx(style.taskFormRow)}>
          <Col xs={12} md={6}>
            <Reviews
              gettingRatings={this.state.gettingRatings}
              overflow
              ratings={ this.state.ratings }
              task={ this.props.task }
              companyUrl={this.props.company_url}
              companyProfile={this.props.companyProfile}
            />
          </Col>
          <Col xs={12} md={6}>
            <Summary
              gettingSummary={this.state.gettingSummary}
              mileage={this.state.mileage}
              totalTime={this.state.totalTime}
              taskTime={this.state.taskTime}
              travelTime={this.state.travelTime}
              userProfile={this.props.userProfile}
              profile={this.props.profile}
            />
          </Col>
        </Row>
        }
        { this.state && this.state.timeMileage && this.state.timeMileage.length > 0 &&
        <Row className={cx(style.taskFormRow)}>
          <Col xs={12} md={6} mdOffset={6}>
            <TimeMileage
              timeMileage = {this.state.timeMileage}
               profile={this.props.profile}
            />
          </Col>
        </Row>
        }
        <Row className={cx(style.taskFormRow)}>
          <Col xs={12} lg={6}>
            <Journal
              can_delete_status={this.can_delete_status}
              can_add_status={this.can_add_status}
              fetchNewData={this.fetchNewData}
              statusList={this.state.statusList}
              showMap={this.state.showMap}
              statusLocationIndex={this.state.statusLocationIndex}
              fileUploader={this.state.fileUploader}
              onDrop={this.onDrop.bind(this)}
              filesToUpload={this.state.files_to_upload}
              closeImage={this.closeImage}
              getPreview={this.getPreview}
              getFilePreview={this.getFilePreview}
              uploadFilesAgain={this.uploadFilesAgain}
              filesAllowed={this.state.filesAllowed}
              updateImagesDisplay = {this.updateImagesDisplay}
              serverActionPending={this.state.serverActionPending}
              serverActionSendNotificationPending={this.state.serverActionSendNotificationPending}
              updateImageClick={this.updateImageClick}
              sendTaskStatus={this.updateStatus.bind(this)}
              dropZoneOption={dropZoneOption}
              addNewCustomerStatus={this.addNewCustomerStatus}
              addNewInternalStatus={this.addNewInternalStatus}
              toggleStatusLocationMap={this.toggleStatusLocationMap}
              deleteStatus={this.deleteStatus}
              gettingStatus={this.state.gettingStatus}
              textInput={(input) => { this.textInput = input}}
              latestStatusColor={this.props.latestStatusColor}
              latestStatusTitle={this.props.latestStatusTitle}
              systemAndCustomMessages = {this.props.systemAndCustomMessages}
              profile={this.props.profile}
              task={this.props.task}
              closeFileAttach={this.closeFileAttach}
              createToastNotification={this.props.createToastNotification}
            />
          </Col>
          <Col xs={12} lg={6} className={cx(styles['pt-30'])}>
            <Status
              can_add_status={this.can_add_status}
              primaryAddress={primaryAddress}
              additionalAddresses={this.props.task.additional_addresses}
              statuses={this.props.statuses}
              sendTaskStatus={this.updateStatus.bind(this)}
              items={this.props.items}
              fetchItems={this.props.fetchTaskItems}
              sendingStatus={this.state.sendingStatus}
              profile={this.props.profile}
              updateImagesDisplay={this.updateImagesDisplay}
              task={this.props.task}
              taskId={this.props.task.id}
              companyProfile={this.props.companyProfile}
              uploadFilesOnServer={this.uploadFilesOnServer}
              can_add_team_member={this.can_add_team_member}
              entities={this.props.entities}
              getSchedule={this.props.getSchedule}
              updateTaskAssigneeOnServer={this.updateTaskAssigneeOnServer}
            />
            { this.renderEntitiesToShowOnMap() }
          </Col>
        </Row>
      </div>
    );
  }
}
