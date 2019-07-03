import React, {Component} from 'react';
import { Row, Col, Button, ButtonToolbar, DropdownButton, MenuItem, Modal } from 'react-bootstrap';
import moment from "moment-timezone";
import {toast} from "react-toastify";
import cx from "classnames";
import {FieldGroup} from "../fields";
import style from "./activity-form.module.scss"
import CustomerDetails from "../task-wrapper-v2/components/customer-details/customer-details";
import {getErrorMessage} from "../../helpers/task";
import SavingSpinner from "../saving-spinner/saving-spinner";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
} from "@fortawesome/fontawesome-free-solid";
import {activityTypes} from "../../helpers/activity-types-icons";
import {DEFAULT_COLORPICKER_COLOR} from "../fields/color-field";
import Instructions from "../task-wrapper-v2/components/instructions/instructions";
import {getAllTaskFiles, getTaskFileAttachmentUploadURL, removeTaskFile, uploadAttachment} from "../../actions";
import Equalizer from "react-equalizer";
import CrewSelectorV2 from "../crew-selector/crew-selector";
import Activity from "./components/activity"
import styles from "../task-wrapper-v2/components/status/status.module.scss";
import $ from "jquery";
import { ACTIVITY_ATTRIBUTES } from "../../helpers/keys";

const errorMsg = (error) => {
  return getErrorMessage(error);
};

const browser = () => {
  // Opera 8.0+
  const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

  // Firefox 1.0+
  const isFirefox = typeof InstallTrigger !== 'undefined';

  // Safari 3.0+ "[object HTMLElementConstructor]"
  const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) {
    return p.toString() === "[object SafariRemoteNotification]";
  })(!window['safari'] || safari.pushNotification);

  // Internet Explorer 6-11
  const isIE = /* @cc_on!@*/false || !!document.documentMode;

  // Edge 20+
  const isEdge = !isIE && !!window.StyleMedia;

  // Chrome 1+
  const isChrome = !!window.chrome && !!window.chrome.webstore;

  // Blink engine detection
  const isBlink = (isChrome || isOpera) && !!window.CSS;

  return isOpera ? 'Opera' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : isChrome ? 'Chrome' : isIE ? 'IE' : isEdge ? 'Edge' : false;
}

export default class ActivityForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      event: {
        activity_type: 'NOTE',
        title: '',
        entity_ids: [],
        customer_first_name: null,
        customer_last_name: '',
        customer_company_name: null,
        customer_email: null,
        customer_mobile_number: null,
        customer_phone: null,
        file_ids: [],
        use_assignee_color: false,
        group_id: -1,
        details: '',
        resource_ids: [],
        all_day: this.props.allDay || false,
      },
      customers: [],
      sendingCustomer: false,
      error: null,
      emptyLabel: 'Please enter at least 3 characters',
      serverActionPending: false,
      files_to_upload: [],
      fileUploader: false,
      filesAllowed: 3,
      attachmentSeverActionType: '',
      attachmentServerActionPending: false,
      attachmentServerActionComplete: false,
      filesFound: null,
      uploadFailedFiles: [],
      completedFiles: [],
      newFilePlaced: false,
      activity_group_id: null,
      start_time: '',
      start_date: '',
      showActivityDeleteConfirmation: false,
      activity_selected: null,
      sendingStatus: false,

    }
    this.getNodes = this.getNodes.bind(this);
    this.setEventState = this.setEventState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getCustomers = this.getCustomers.bind(this);
    this.createCustomer = this.createCustomer.bind(this);
    this.updateCustomer = this.updateCustomer.bind(this);
    this.updateImageClick = this.updateImageClick.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.updateImageClick = this.updateImageClick.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.closeImage = this.closeImage.bind(this);
    this.getPreview = this.getPreview.bind(this);
    this.uploadFilesAgain = this.uploadFilesAgain.bind(this);
    this.updateImagesDisplay = this.updateImagesDisplay.bind(this);
    this.getFilePreview = this.getFilePreview.bind(this);
    this.handleGroupChange = this.handleGroupChange.bind(this);
    this.getFirstAssigneeColor = this.getFirstAssigneeColor.bind(this);
    this.inputTimeStartChange = this.inputTimeStartChange.bind(this);
    this.setTime = this.setTime.bind(this);
    this.formatDoubleDigitDate = this.formatDoubleDigitDate.bind(this);
    this.onStartDateChange = this.onStartDateChange.bind(this);
    this.uploadSingleFile = this.uploadSingleFile.bind(this);
    this.uploadTaskAttachments = this.uploadTaskAttachments.bind(this);
    this.updateActivity = this.updateActivity.bind(this);
    this.generateDatetime = this.generateDatetime.bind(this);
    this.setTimeInDate = this.setTimeInDate.bind(this);
    this.runValidations = this.runValidations.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.uploadFilesOnServer = this.uploadFilesOnServer.bind(this);
    this.InitializeDateTime = this.InitializeDateTime.bind(this);
    this.extractTime = this.extractTime.bind(this);
    this.formatTime = this.formatTime.bind(this);
    this.onDelete = this.onDelete.bind(this)
    this.renderDeleteTaskConfirmation = this.renderDeleteTaskConfirmation.bind(this);
    this.renderTasksConfirmation = this.renderTasksConfirmation.bind(this);
    this.cancelSeriesAction = this.cancelSeriesAction.bind(this);
    this.buildDate = this.buildDate.bind(this);
    this.renderActivityDuplicateConfirmation = this.renderActivityDuplicateConfirmation.bind(this);
    this.updateActivityStatus = this.updateActivityStatus.bind(this);
    this.getEventInitialState = this.getEventInitialState.bind(this);
  };

  componentDidMount() {

    this.getCustomers(true);
    this.showUploadedFiles();

  }

  componentWillMount() {

    let newEventStartDate = null;
    let event = this.props.selectedActivity;
    let activity_selected = null;
    if (!this.props.selectedActivity) {
      newEventStartDate = this.buildDate();
    }

    let activity_group_id = event && event.group_id;
    let selectedGroupEntities = this.props.entities;
    let selectedGroupEquipments = this.props.equipments;
    if (event && typeof event.group_id !== 'undefined') {
      selectedGroupEntities = this.props.entities.filter((entity) => {
        if (event.group_id === null || event.group_id === '') {
          return entity.group_id === null;
        } else if (event.group_id !== '-1') {
          return entity.group_id === Number(event.group_id);
        }
      });

      selectedGroupEquipments = this.props.equipments.filter((equipment) => {
        if (event.group_id === null || event.group_id === '') {
          return equipment.group_id === null;
        } else if (event.group_id !== '-1') {
          return equipment.group_id === Number(event.group_id);
        }
      });
    }

    let startTimeZone = moment.tz.guess();
    // If group_id in event is null then get default group of company else get selected group
    const selectedGroup = this.props.groups && this.props.groups.find((group) => {
      return event && (event.group_id ? (event.group_id === group.id) : (group.is_implicit));
    });

    if (selectedGroup && selectedGroup.timezone) {
      startTimeZone = selectedGroup.timezone;
    } else if (this.props.profile && this.props.profile.timezone) {
      startTimeZone = this.props.profile.timezone;
    } else if (this.props.profile && this.props.profile.group_timezone) {
      startTimeZone = this.props.profile.group_timezone;
    }

    let endTimeZone = startTimeZone;
    if (event && event.start_datetime_timezone) {
      startTimeZone = event.start_datetime_timezone;
    }

    const activityEntities = [];
    const activityResources = [];

    if (event && event.entity_ids.length > 0) {
      event.entity_ids.map((entity_id) => {
        let activityEntity = this.props.entities.find((entity) => {
          return entity.id === entity_id;
        });
        if (activityEntity) {
          if (!selectedGroupEntities.find((entity) => {
            return entity.id === activityEntity.id;
          })) {
            activityEntities.push(activityEntity);
          }
        }
      });
    }

    if (event && event.resource_ids && event.resource_ids.length > 0) {
      event.resource_ids.map((resource_id) => {
        let activityEquipment = this.props.equipments.find((equipment) => {
          return equipment.id === resource_id;
        });
        if (activityEquipment) {
          if (!selectedGroupEquipments.find((equipment) => {
            return equipment.id === activityEquipment.id;
          })) {
            activityResources.push(activityEquipment);
          }
        }
      });
    }

    if (event) {
      activity_selected = event.activity_type;
    } else {
      activity_selected = 'NOTE'
    }

    this.setState({
      event: this.getEventInitialState(),
      selectedGroupEntities,
      activityEntities,
      activityResources,
      activity_group_id,
      selectedGroupEquipments,
      start_date: this.InitializeDateTime('StartDate', newEventStartDate, event, startTimeZone),
      start_time: this.InitializeDateTime('StartTime', newEventStartDate, event, startTimeZone),
      showTaskDuplicateConfirmation: false,
      shownActivityDuplicateConfirmation: false,
      activity_selected,
    });


  }

  getEventInitialState() {
    return {
      activity_type: this.props.selectedActivity && this.props.selectedActivity.activity_type || 'NOTE',
      title: this.props.selectedActivity && this.props.selectedActivity.title || '',
      entity_ids: this.props.selectedActivity && this.props.selectedActivity.entity_ids || [],
      resource_ids : this.props.selectedActivity && this.props.selectedActivity.resource_ids || [],
      customer_first_name: this.props.selectedActivity && this.props.selectedActivity.customer_first_name || null,
      customer_last_name: this.props.selectedActivity && this.props.selectedActivity.customer_last_name || '',
      customer_company_name: this.props.selectedActivity && this.props.selectedActivity.customer_company_name || null,
      customer_email: this.props.selectedActivity && this.props.selectedActivity.customer_email || null,
      customer_mobile_number: this.props.selectedActivity && this.props.selectedActivity.customer_mobile_number || null,
      customer_phone: this.props.selectedActivity && this.props.selectedActivity.customer_phone || null,
      file_ids: this.props.selectedActivity && this.props.selectedActivity.file_ids || [],
      use_assignee_color: this.props.selectedActivity && this.props.selectedActivity.use_assignee_color || false,
      group_id: (this.props.selectedActivity && typeof this.props.selectedActivity.group_id !== 'undefined') ? this.props.selectedActivity.group_id : -1,
      details: this.props.selectedActivity && this.props.selectedActivity.details || '',
      id: this.props.selectedActivity && this.props.selectedActivity.id || null,
      all_day: this.props.selectedActivity && this.props.selectedActivity.all_day || this.props.allDay || false,
      status: this.props.selectedActivity && this.props.selectedActivity.status || 'NOTSTARTED',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.serverActionPending && nextProps.serverActionComplete) {
      this.setState({notifications: [{message: 'Activity successfully updated'}]});
    }

    let files_to_upload = this.state.files_to_upload;

    if (nextProps.filesFail) {
      files_to_upload = nextProps.actualFailedFiles;
      this.setState({
        files_to_upload,
        displayNotification: false
      });
    }
  }

  buildDate() {
    let currentDate = moment();
    if (currentDate.get('minute') < 30) {
      currentDate.set('minute', 30);
    } else {
      currentDate.set('hour', currentDate.get('hour') + 1).set('minute', 0);
    }
    return currentDate;
  }

  renderTasksConfirmation(contents) {
    return (
      <Modal show={true} animation={false} dialogClassName={cx(style.modalActivityConfirmation)}>
        <Modal.Body>
          <i className={cx(style.close)} onClick={this.cancelSeriesAction}><svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756"><g transform="translate(-1270.486 -30.485)"><path d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z" transform="translate(4126.197 -40.804)" fill="#8d959f"></path></g></svg></i>
          {contents}
        </Modal.Body>
      </Modal>
    );
  }

  renderDeleteTaskConfirmation() {
    const contents = (
      <div>
        <div className={cx(style.modalHeader)}>
          <h3 className={cx(style.modalTitle)}>Delete Activity</h3>
        </div>
        <div className={cx(style.bodyInner)}>
          <div className={cx(style.box)}>
            <div className={cx(style.boxBody)}>
              <div className={cx(style.boxBodyInner)}><p>Would you like to delete this activity?</p></div>
            </div>
          </div>
          <div className={cx(style.btnWrapper)}>
            <button onClick={this.cancelSeriesAction} className={cx(style.btn, style['btn-light'])}>Cancel</button>
            <button className={cx(style.btn, style['btn-secondary'])} title="This Activity will be deleted" disabled={this.props.serverActionPending} onClick={() => this.props.onDeleteClick(this.state.event.id)}>{this.props.serverActionPending ? <SavingSpinner className={style.whiteLoader} size={8} borderStyle="none" /> : 'Delete'}</button>
          </div>
        </div>
      </div>
    );
    return this.renderTasksConfirmation(contents);
  }

  renderActivityDuplicateConfirmation() {
    const contents = (
      <div>
        <div className={cx(style.modalHeader)}>
          <h3 className={cx(style.modalTitle)}>Duplicate Activity</h3>
        </div>
        <div className={cx(style.bodyInner)}>
          <div className={cx(style.box)}>
            <div className={cx(style.boxBody)}>
              <div className={cx(style.boxBodyInner)}>
                <p>Please save your current changes by clicking the "Save and Duplicate" button below. Cancel if you would like to make further changes.</p>
              </div>
            </div>
          </div>
          <div className={cx(style.btnWrapper)}>
            <Button onClick={this.cancelSeriesAction} className={cx(style.btn, style['btn-light'])}>Cancel</Button>
            <Button onClick={(event) => this.updateActivity(event, true)} className={cx(style.btn, style['btn-secondary'])} type="submit">Save and Duplicate current activity</Button>
          </div>
        </div>
      </div>
    );
    return this.renderTasksConfirmation(contents);
  }

  cancelSeriesAction(event) {
    event.preventDefault();
    event.stopPropagation();

    this.setState(Object.assign(this.state, {
      showDeleteActivityConfirmation: false,
      showActivityDuplicateConfirmation: false,
      validationErrors: null,
      displayNotification: true

    }));
  }

  InitializeDateTime(type, newEventStartDate, event, timezone) {
    if (type === 'StartDate') {
      if (event) {
        if (!event.start_datetime) {
            return '';
        } else {
          const start_datetime = moment.tz(event.start_datetime, 'YYYY-MM-DDTHH:mm:ss').format();
          return moment.tz(start_datetime, timezone).format('YYYY-MM-DD');
        }
      } else {
        return moment.tz(newEventStartDate, moment.tz.guess()).format('YYYY-MM-DD');
      }
    } else if (type === 'StartTime') {
      if (event) {
        if (!event.start_datetime) {
         return '';
        } else {
          const start_datetime = moment.tz(event.start_datetime, 'YYYY-MM-DDTHH:mm:ss').format();
          return this.extractTime(start_datetime, timezone);
        }
      } else {
        return this.extractTime(newEventStartDate, moment.tz.guess());
      }
    }
  }

  extractTime(datetime, timezone) {
    if (datetime) {
      return this.formatTime(datetime, timezone);
    }

    return {hours: '09', mins: '00', meridian: 'AM'};
  }

  formatTime(date, timezone) {
    const d = date;
    const hh = moment.tz(d, timezone).format('H');
    let m = moment.tz(d, timezone).format('m');
    let s = moment.tz(d, timezone).format('s');
    let meridian = 'AM';
    let h = hh;
    if (h >= 12) {
      h = hh - 12;
      meridian = 'PM';
    }

    if (parseInt(h) === 0) {
      h = 12;
    }
    m = m < 10 ? '0' + m : m;

    s = s < 10 ? '0' + s : s;

    /* if you want 2 digit hours:*/
    h = h < 10 ? '0' + h : h;

    let replacement = {
      hours: h,
      mins: m,
      meridian
    };

    return replacement;
  }

  uploadFilesOnServer(file) {
    let files = [];
    let file_id = '';
    const image = file;
    const promise = getTaskFileAttachmentUploadURL(this.state.event.id)
      .then((imageUrlResponse) => {
        const data = new FormData();

        data.append('file-0', image);

        const {upload_url} = JSON.parse(imageUrlResponse);

        return uploadAttachment(upload_url, data);
      })
      .then((updateImageResponse) => {
        file_id = JSON.parse(updateImageResponse);

        files.push(file_id);

        return files;
      });

    return promise;
  }

  uploadFiles() {
    let allBackup = this.state.files_to_upload;
    for (let i = 0; i < this.state.files_to_upload.length; i++) {
      allBackup[i].isInProcess = 'true';
    }
    this.setState({
      files_to_upload: allBackup,
      displayNotification: false
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
          displayNotification: false
        });
        this.showUploadedFiles();
        this.props.fileUploadingComplete();
      } else {
        this.setState({
          attachmentServerActionPending: false,
          attachmentServerActionComplete: true,
          attachmentSeverActionType: '',
          files_to_upload: [],
          displayNotification: false
        });
        this.showUploadedFiles();
        this.props.fileUploadingComplete();
      }
    });
  }

  formatDoubleDigitDate(value) {
    return value.toString().length === 1 ? '0' + value : value;
  }

  getFirstAssigneeColor(oldColor, firstId = null) {
    if (!firstId) {
      // if we don't have assignees just return old value
      if (!this.state.event.entity_ids) {
        return oldColor;
      }
      firstId = this.state.event.entity_ids[0];
    }

    const firstAssignee = this.props.entities.find((item) => {
      return item.id === firstId;
    });

    if (firstAssignee) {
      return firstAssignee.color ? firstAssignee.color : DEFAULT_COLORPICKER_COLOR;
    }
    return oldColor;
  }

  handleChange(items) {
    const customer = items[0];
    const foundCustomer = this.state.customers.find((c) => {
      return customer && customer.id === c.id;
    });
    if (typeof foundCustomer !== "undefined") {
      this.updateCustomer(foundCustomer);
    }
  }

  setTime(startTimeHours, startTimeMinutes, startTimeMeridian) {
    let allDay = this.state.event
    allDay['all_day'] = false;
    this.setState({
      start_time: {
        hours: this.formatDoubleDigitDate(startTimeHours),
        mins: this.formatDoubleDigitDate(startTimeMinutes),
        meridian: startTimeMeridian,
        notifications: []
      },
      allDay,
      displayNotification: false
    });
  }


  updateCustomer(customer) {
    if (this.customerTimeoutID) {
      clearTimeout(this.timeoutID);
    }

    const event = this.state.event;
    event['customer_first_name'] = customer.first_name;
    event['customer_last_name'] = customer.last_name;
    event['customer_email'] = customer.email;
    event['customer_company_name'] = customer.company_name;
    event['customer_phone'] = customer.phone;
    event['customer_mobile_number'] = customer.mobile_number;
    event['customer_id'] = customer.id;


    this.setState({event});
  }


  updateActivityStatus(status) {
    this.setState({
      severActionType: 'ADD',
      serverActionPending: true,
      serverActionComplete: false,
      error: null,
      sendingStatus: true
    });
    const statusPayload = {
      type: status.type,
      title: status.title,
      status_id: status.id,
      time: moment().format(),
      reporter_name: this.props.reporter_name,
      reporter_id: this.props.reporter_id,
      color: status.color,
      custom_message_template: status.custom_message_template,
      exception: null,
    };

    let extra_fields = null;
    statusPayload.extra_fields = JSON.stringify(extra_fields);
    statusPayload.source = 'web';
    statusPayload.items = null;

    const activity_id = this.props.selectedActivity.id;
    this.props.updateActivityStatus({task_id: activity_id, status: statusPayload}).then(() => {
      const event = this.state.event;
      event.status = status.type;
      this.setState({
        serverActionPending: false,
        serverActionComplete: true,
        error: null,
        sendingStatus: false,
        event
      });
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

  createCustomer() {
    this.setState({sendingCustomer: true});
    const updated_customer = {
      'first_name': this.state.event.customer_first_name,
      'last_name': this.state.event.customer_last_name,
      'email': this.state.event.customer_email,
      'company_name': this.state.event.customer_company_name,
      'address_line_1': this.state.event.customer_address_line_1,
      'address_line_2': this.state.event.customer_address_line_2,
      'city': this.state.event.customer_city,
      'state': this.state.event.customer_state,
      'country': this.state.event.customer_country,
      'zipcode': this.state.event.customer_zipcode,
      'phone': this.state.event.customer_phone,
      'customer_mobile_number': this.state.event.customer_mobile_number
    };

    this.props.createCustomer(updated_customer).then(() => {
      this.setState({sendingCustomer: false});
      this.getCustomers(true);
    }).catch((e) => {
      const error = JSON.parse(e.responseText);
      let errorMsg = getErrorMessage(error);

      this.setState({error: errorMsg, sendingCustomer: false});
    });
  }

  handleInputChange(inputValue) {
    if (inputValue.length >= 3) {
      this.setState({emptyLabel: 'Searching...'});
      this.props.searchCustomers(inputValue).then((res) => {
        this.setState({customers: JSON.parse(res), emptyLabel: 'No matches found'});
      });
    } else if (inputValue.length < 3) {
      this.setState({emptyLabel: 'Please enter at least 3 characters'});
    } else {
      this.props.getCustomers().then((res) => this.setState({customers: JSON.parse(res)}));
    }
  }

  uploadSingleFile(fileToBeUploaded) {
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
          this.showUploadedFiles();
        } else {
          for (let j = 0; j < this.state.files_to_upload.length; j++) {
            if (this.state.files_to_upload[j].name == filesUrl[i].failedFilename.name) {
              allBackup[j].isInProcess = 'false';
            }
          }
          this.showUploadedFiles();
        }
      }
      this.setState({
        files_to_upload: allBackup,
        uploadFailedFiles: failedBackup,
        displayNotification: false
      });
    });
  }

  updateImageClick() {
    if (!this.state.fileUploader) {
      this.setState({
        fileUploader: true,
        displayNotification: false
      });
    } else {
      this.setState({
        fileUploader: false,
        displayNotification: false
      });
    }
  }

  removeFile(task_id, file_id, file_name) {
    const r = confirm("Are you sure that you want to delete '" + file_name + "'?");
    if (r) {
      this.props.fileUploadingPending();
      this.setState({
        attachmentSeverActionType: 'DELETE',
      });
      removeTaskFile(task_id, file_id).then((msg) => {
        this.props.fileUploadingComplete();
        this.setState({
          attachmentSeverActionType: '',
        });
        this.showUploadedFiles();
      });
    }
  }

  showUploadedFiles() {
    if (this.state.event.id) {
      const page = 1;
      const items_per_page = 100;
      getAllTaskFiles(this.state.event.id, page, items_per_page).then((allFiles) => {
        this.setState({
          filesFound: JSON.parse(allFiles),
          displayNotification: false
        });
      });
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
      if (this.state.event.id) {
        this.setState({
          files_to_upload: localArr,
          newFilePlaced: fileCheck,
          displayNotification: false
        }, this.uploadTaskAttachments);
      } else {
        this.setState({
          files_to_upload: localArr,
          newFilePlaced: fileCheck,
          displayNotification: false
        });
      }
    } else {
      if (this.state.event.id) {
        this.setState({
          files_to_upload: temp,
          newFilePlaced: fileCheck,
          displayNotification: false
        }, this.uploadTaskAttachments);
      } else {
        this.setState({
          files_to_upload: temp,
          newFilePlaced: fileCheck,
          displayNotification: false
        });
      }
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

  handleGroupChange(group_id) {
    const value = group_id;

    const selectedGroupEntities = this.props.entities.filter((entity) => {
      if (value === null || value === '') {
        return entity.group_id === null;
      } else if (value !== '-1') {
        return entity.group_id === Number(value);
      }
    });

     const selectedGroupEquipments = this.props.equipments.filter((equipment) => {
      if (value === null || value === '') {
        return equipment.group_id === null;
      } else if (value !== '-1') {
        return equipment.group_id === Number(value);
      }
    });


    const activityEntities = [];
    const activityResources = [];
    if (this.state.event && this.state.event.entity_ids.length > 0) {
      this.state.event.entity_ids.map((entity_id) => {
        let activityEntity = this.props.entities.find((entity) => {
          return entity.id === entity_id;
        });
        if (activityEntity) {
          if (!selectedGroupEntities.find((entity) => {
            return entity.id === activityEntity.id;
          })) {
            activityEntities.push(activityEntity);
          }
        }
      });
    }

     if (this.state.event && this.state.event.resource_ids.length > 0) {
      this.state.event.resource_ids.map((resource_id) => {
        let activityEquipment = this.props.equipments.find((equipment) => {
          return equipment.id === resource_id;
        });
        if (activityEquipment) {
          if (!selectedGroupEquipments.find((equipmet) => {
            return equipmet.id === activityEquipment.id;
          })) {
            activityResources.push(activityEquipment);
          }
        }
      });
    }

    this.setState((state) => {
      return {
        event: {
          ...state.event,
          group_id: value
        },
        selectedGroupEntities,
        activityEntities,
        activityResources,
        selectedGroupEquipments
      };
    });
  }


  inputTimeStartChange(value) {
    const timeRegEx = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ?([aApP][mM])$/;
    const matchedGrups = timeRegEx.exec(value);
    if (!matchedGrups) {
      return;
    }
    let hrs = parseInt(matchedGrups[1]);
    let min = parseInt(matchedGrups[2]);
    let meridian = matchedGrups[3];

    this.setTime(hrs, min, meridian);
  }

  setEventState(key, value) {
    if (key === 'activity_type') {
      this.setState({activity_selected: value});
    }
    const event = this.state.event;
    let task_color = this.state.task_color;
    if (key === 'group_id') {
      this.handleGroupChange(value);
    } else if (key === 'entity_ids' && event.use_assignee_color) {
      if (!value.length) {
        event.use_assignee_color = false;
      } else {
        task_color = this.getFirstAssigneeColor(task_color, value[0]);
      }
      this.props.task_color(task_color);
      this.setState({event, task_color});
    } else if (key === 'use_assignee_color' && value) {
      event.use_assignee_color = value;
      task_color = this.getFirstAssigneeColor(task_color);
      this.props.task_color(task_color);
      this.setState({event, task_color});
    } else {
      event[key] = value;
      this.setState({event});
    }
  }

  getCustomers(resetTimeout) {
    if (resetTimeout && this.timeoutID) {
      clearTimeout(this.timeoutID);
    }
    this.props.getCustomers().then((res) => {
      this.setState({customers: JSON.parse(res)});
      this.timeoutID = setTimeout(() => {
        this.getCustomers();
      }, 6e6);
    });
  }

  onStartDateChange(value) {
    if (value) {
      const start_date = new Date(value);
      this.setState({
        start_date: moment(start_date).format(),
      })
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

  uploadTaskAttachments() {
    this.props.fileUploadingPending();
    this.setState({
      attachmentSeverActionType: 'UPLOADING',
      attachmentServerActionPending: true,
      attachmentServerActionComplete: false,
      displayNotification: false
    });
    this.uploadFiles();
  }

  uploadFilesAgain(file, uploadEvent) {
    uploadEvent.preventDefault();
    uploadEvent.stopPropagation();
    let sendFile = [];
    sendFile.push(file);

    let changeProgress = this.state.files_to_upload;
    for (let i = 0; i < this.state.files_to_upload.length; i++) {
      if (this.state.files_to_upload[i].name == file.name) {
        changeProgress[i].isInProcess = 'true';
      }
    }
    this.setState({
      files_to_upload: changeProgress,
      displayNotification: false
    });

    if (this.state.event.id) {
      this.uploadSingleFile(sendFile);
    } else if (this.props.filesFail) {
      this.props.failedUploadCallback(sendFile);
    }

  }

  generateDatetime({start_date, start_time}) {
    if (!start_date && !start_time) {
      let start_datetime = '';
      return {start_datetime};
    }
    let start_datetime = null;
    if (start_date && start_time) {
      start_datetime = moment(start_date);
      let start_hour = 0;
      if (start_time.meridian === 'PM' && Number(start_time.hours) < 12) {
        start_hour = Number(start_time.hours) + 12;
      } else if ((start_time.meridian === 'AM' && Number(start_time.hours) < 12) || (start_time.meridian === 'PM' && Number(start_time.hours) === 12)) {
        start_hour = Number(start_time.hours);
      }
      start_datetime.set({'h': start_hour, 'm': Number(start_time.mins)});
    } else if (start_date) {
      start_datetime = moment(start_date);
    } else {
      start_datetime = '';
    }
    return start_datetime;
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
        files_to_upload: filesArray,
        displayNotification: false
      });
    }
    this.onDrop(e.target.files);
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

  runValidations(event) {
    let errors = false;
    let notification = null;
    if (!this.state.event.activity_type) {
      notification = {
        text: 'Please Select Activity Type',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: style.toastErrorAlert,
          autoClose: 8000
        }
      };
      errors = true;
    }

    if (!this.state.start_date || !this.state.start_time) {
      notification = {
        text: 'Date or Time is missing. Please enter valid Date and Time for repeating activities.',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: style.toastErrorAlert,
          autoClose: 8000
        }
      };
      errors = true;
    }


    let hasGroups = false;
    if (this.props.groups && (this.props.groups.find((group) => {
      return group.is_implicit;
    })) && this.props.groups.length > 1 && this.props.groups.find((group) => {
      return !group.is_disabled && !group.is_implicit;
    })) {
      hasGroups = true;
    } else if (this.props.groups && !(this.props.groups.find((group) => {
      return group.is_implicit;
    })) && this.props.groups.length > 0 && this.props.groups.find((group) => {
      return !group.is_disabled;
    })) {
      hasGroups = true;
    }

    if (this.state.event.group_id && this.state.event.group_id.toString() === '-1' && hasGroups) {
      notification = {
        text: 'Group is required. Please select a group for activity.',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: style.toastErrorAlert,
          autoClose: 8000
        }
      };
      errors = true;
    }

    let selectedEvent = this.state.event;
    if (selectedEvent.group_id && parseInt(selectedEvent.group_id) === -1 && !hasGroups) {
      selectedEvent.group_id = '';
      this.setState({
        event: selectedEvent
      });
    }
    if (notification !== null) {
      this.props.createToastNotification(notification);
    }
    return errors;
  }

  onDelete() {
    this.setState(Object.assign(this.state, {showDeleteActivityConfirmation: true, displayNotification: true}));

  }

  updateActivity(event, createDuplicate = false) {
    event.preventDefault();
    event.stopPropagation();
    const errors = this.runValidations(event);
    if (errors) {
      this.setState({
        validationErrors: errors,
        displayNotification: false
      });
      return;
    }

    if (createDuplicate === true && !this.state.showActivityDuplicateConfirmation && !this.state.shownActivityDuplicateConfirmation) {
      this.setState(Object.assign(this.state, {
        showActivityDuplicateConfirmation: true,
        shownActivityDuplicateConfirmation: true,
        displayNotification: false
      }));
      return;
    }

    let updatedEvent = $.extend(true, {}, this.state.event);

    let startTimeZone = moment.tz.guess();

    let selectedGroup = null;
    if (this.props.groups && this.props.groups.length > 0) {
      selectedGroup = this.props.groups.find((el) => {
        return (this.state.event && this.state.event.group_id) ? el.id === Number(this.state.event.group_id) : el.is_implicit;
      });
    }
    const groupTimezone = selectedGroup && selectedGroup.timezone ? selectedGroup.timezone : null;
    const companyTimezone = this.props.profile ? this.props.profile.timezone : null;
    const entityGroupTimezone = this.props.profile ? this.props.profile.group_timezone : null;

    if (updatedEvent.start_datetime_timezone) {
      startTimeZone = updatedEvent.start_datetime_timezone;
    } else {
      if (groupTimezone) {
        startTimeZone = groupTimezone;
      } else if (companyTimezone) {
        startTimeZone = companyTimezone;
      } else if (entityGroupTimezone) {
        startTimeZone = entityGroupTimezone;
      }
    }

    updatedEvent['start_datetime_timezone'] = startTimeZone;

    let start_datetime;
    if (updatedEvent.all_day) {
      start_datetime = this.generateDatetime({start_date: this.state.start_date, start_time: '12:00 AM'});
      const startDate = start_datetime && moment(start_datetime);
      updatedEvent.start_datetime = startDate ? moment.tz(startDate.format('YYYY-MM-DDTHH:mm:ss'), 'YYYY-MM-DDTHH:mm:ss', startTimeZone).format() : '';
      updatedEvent.start_datetime_original_iso_str = startDate ? moment.tz(startDate.format('YYYY-MM-DDTHH:mm:ss'), 'YYYY-MM-DDTHH:mm:ss', startTimeZone).format() : '';
    } else {
      start_datetime = this.generateDatetime(this.state);
      const startDate = start_datetime && moment(start_datetime);
      updatedEvent.start_datetime = startDate ? moment.tz(startDate.format('YYYY-MM-DDTHH:mm:ss'), 'YYYY-MM-DDTHH:mm:ss', startTimeZone).format() : '';
      updatedEvent.start_datetime_original_iso_str = startDate ? moment.tz(startDate.format('YYYY-MM-DDTHH:mm:ss'), 'YYYY-MM-DDTHH:mm:ss', startTimeZone).format() : '';
    }

    updatedEvent.end_datetime = null;
    updatedEvent['activity_type'] = updatedEvent.activity_type.toUpperCase();
    updatedEvent.template_type = 'ACTIVITY';
    updatedEvent.entity_ids = updatedEvent.entity_ids.join(',');
    updatedEvent.resource_ids = updatedEvent.resource_ids.join(',');

    for (let key in updatedEvent) {
      if (ACTIVITY_ATTRIBUTES.indexOf(key.toString()) === -1) {
        delete updatedEvent[key];
      }
    }

    this.setState(Object.assign(this.state, {
      showDeleteActivityConfirmation: false,
      showActivityDuplicateConfirmation: false,
      validationErrors: null,
      displayNotification: true
    }));

    this.props.onSaveClick(updatedEvent, this.state.files_to_upload, createDuplicate);

  }

  getNodes(equalizerComponent, equalizerElement) {
    this.node1 = this.refs.activityRef1;
    this.node2 = this.refs.taskRef;
    if (this.node1 && this.node2) {
      return [
        this.node1,
        this.node2,
      ]
    }
    return [];
  }


  render() {
    let group_id = this.state.event.group_id;
    let entity_ids = this.state.event.entity_ids;
    let resource_ids = this.state.event.resource_ids;
    const selectedEntityIds = this.state.event.entity_ids;
    const selectedEntities = this.props.entities && selectedEntityIds && this.props.entities.filter((entity) => {
      return selectedEntityIds.find((entityId) => {
        return entity.id === entityId;
      });
    });
    const selectedEquipmentIds = this.state.event.resource_ids;
    const selectedEquipments = this.props.equipments && selectedEquipmentIds && this.props.equipments.filter((equipment) => {
      return selectedEquipmentIds.find((equipmentId) => {
        return equipment.id === equipmentId;
      });
    });

    const showEntityGroupError = selectedEntities.find((entity) => {
      if (!this.props.can_add_group || (group_id && group_id.toString() === '-1')) {
        return false;
      } else if ((group_id === '' || group_id === null) && entity.group_id !== null) {
        return true;
      } else if (group_id !== '' && group_id !== null && entity.group_id !== Number(group_id)) {
        return true;
      }
      return false;
    });
     const showEquipmentGroupError = selectedEquipments && selectedEquipments.find((equipment) => {
      if (!this.props.can_add_group || (group_id && group_id.toString() === '-1')) {
        return false;
      } else if ((group_id === '' || group_id === null) && equipment.group_id !== null) {
        return true;
      } else if (group_id !== '' && group_id !== null && equipment.group_id !== Number(group_id)) {
        return true;
      }
      return false;
    });
    let savingSpinnerTitle = '';
    if (this.props.severActionType === 'ADD' || this.props.severActionType === 'UPDATE') {
      savingSpinnerTitle = 'Saving';
    } else if (this.state.attachmentSeverActionType === 'DELETE') {
      savingSpinnerTitle = 'Deleting';
    } else if (this.props.severActionType === 'UPLOAD') {
      savingSpinnerTitle = 'Uploading Files';
    } else if (this.state.attachmentSeverActionType === 'UPLOADING') {
      savingSpinnerTitle = 'Uploading Files';
    }
    let showGroupDropdown = false;
    let showSaveChangesButton = this.props.profile && this.props.profile.permissions && (this.props.profile.permissions.indexOf('ADD_TASK') !== -1 || this.props.profile.permissions.indexOf('EDIT_TASK') !== -1 || this.props.profile.permissions.indexOf('COMPANY') !== -1);
    let showDeleteButton = this.props.profile && this.props.profile.permissions && this.props.selectedActivity && this.props.selectedActivity.id && this.props.can_delete;
    let showDuplicateActivityButton = this.props.profile && this.props.profile.permissions && (this.props.profile.permissions.indexOf('ADD_TASK') !== -1 || this.props.profile.permissions.indexOf('EDIT_TASK') !== -1 || this.props.profile.permissions.indexOf('COMPANY') !== -1) && this.props.selectedActivity;
    let enableStatusButtons = this.props.profile && this.props.profile.permissions && (this.props.profile.permissions.indexOf('ADD_TASK_STATUS') !== -1 || this.props.profile.permissions.indexOf('COMPANY') !== -1) && this.props.selectedActivity;
    const dropDownButtonIcon = (<FontAwesomeIcon icon={faEllipsisV}/>);
    let disableLink = '';
    if (this.props.serverActionPending) {
      disableLink = styles.linkServerActionPending;
    }
    return (
      <div className={cx(style.taskWrapper)}>
        <header className={cx(style.taskHeader)}>
          <div className={cx(style.headerTop)}>
            <div className={cx(style.fullContainer)}>
              {this.state.showDeleteActivityConfirmation && this.renderDeleteTaskConfirmation()}
              {this.state.showActivityDuplicateConfirmation && this.renderActivityDuplicateConfirmation()}
              <strong className={cx(style.taskName)}>
                <span
                  className={cx(style.taskColor)}>{this.state.event.activity_type ? activityTypes.find((activity) => activity.type === this.state.event.activity_type) && activityTypes.find((activity) => activity.type === this.state.event.activity_type).icon : activityTypes[0].icon}</span>
                {this.props.selectedActivity ? this.state.event.title : 'New Activity'}
              </strong>
              <a href="javascript:void (0)" onClick={this.props.closeActivityModal}
                 className={cx(style.close)}>&nbsp;</a>
            </div>
          </div>
          <div className={cx(style.headerBottom)}>
            <div className={cx(style.fullContainer)}>
              <div className={cx(style.inner)}>
                <ul className={cx(style.headerNav)}>
                  <li key={'tab' + 1}>
                    <a href="javascript:void (0)" className={cx(style['active'])}>Details</a>
                  </li>
                </ul>
                <div>
                  <ul className={cx(style.headerNav, style.right)}>
                    {showDuplicateActivityButton &&
                    <li><a href="javascript:void (0)" onClick={(e) => this.updateActivity(e, true)}
                           className={disableLink}>Duplicate Activity</a></li>
                    }
                    {showDeleteButton &&
                    <li>
                      <button type="button" onClick={this.onDelete}
                              className={cx(style.btn, style['btn-light'], style.delete, disableLink)}>Delete
                      </button>
                    </li>
                    }
                    {!this.props.pageView &&
                      <li><a href="javascript:void (0)" onClick={this.props.closeActivityModal}
                             className={disableLink}>Cancel</a></li>
                    }
                    {showSaveChangesButton &&
                    <li>
                      <button type="button" onClick={(e) => this.updateActivity(e)}
                              className={cx(style.btn, style['btn-secondary'], disableLink)}>
                        {this.props.serverActionPending ?
                          <SavingSpinner borderStyle="none" title=""/> : 'Save Changes'}
                      </button>
                    </li>
                    }
                  </ul>
                  <ButtonToolbar className={cx(style.taskDropDown)}>
                    <DropdownButton title={dropDownButtonIcon} noCaret pullRight>
                      {showSaveChangesButton &&
                      <MenuItem className={disableLink} onClick={(e) => this.updateActivity(e)}>
                        {this.props.serverActionPending ?
                        <SavingSpinner borderStyle="none" title=""/> : 'Save Changes'}</MenuItem>
                      }
                      {showDeleteButton &&
                      <MenuItem onClick={this.onDelete} className={disableLink}>Delete</MenuItem>
                      }
                      {showDuplicateActivityButton &&
                      <MenuItem className={disableLink} onClick={(e) => this.updateActivity(e, true)}>Duplicate
                        Activity</MenuItem>
                      }
                      {
                        <MenuItem className={disableLink} onClick={this.props.closeActivityModal}>Cancel</MenuItem>
                      }
                    </DropdownButton>
                  </ButtonToolbar>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className={cx(style.fullContainer)}>
          <Row className={cx(style.taskFormRow)}>
            <Equalizer enabled={() => window.matchMedia('(min-width: 992px)').matches} nodes={this.getNodes}>
              <Col xs={12} sm={12} md={6} className={style.activityBoxWrapper}>
                <div className={cx(style.box)} ref="activityRef1">
                  <h3 className={cx(style.boxTitle)}>Activity</h3>
                  <div className={cx(style.boxBody)}>
                    <div className={style['assignees-block']}>
                      <Activity
                        browser={browser}
                        event={this.state.event}
                        onChangeEventState={this.setEventState}
                        can_edit={this.props.can_edit}
                        can_add_group={this.props.can_add_group}
                        groups={this.props.groups}
                        start_time={this.state.start_time}
                        inputTimeStartChange={this.inputTimeStartChange}
                        start_date={this.state.start_date}
                        onStartDateChange={this.onStartDateChange}
                        activityTypes={activityTypes}
                        allday={this.state.event.all_day}
                        activitySelected={this.state.activity_selected}
                        profile={this.props.profile}
                      />
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={12} md={6}>
                <div ref="taskRef">
                  {this.props.selectedActivity && this.props.selectedActivity.id && <div className={cx(style.box)}>
                    <h3 className={cx(style.boxTitle)}>Status
                      <span className={styles.statusSpinner}>
                        {this.state.sendingStatus && <SavingSpinner borderStyle="none" title="Saving"/>}
                      </span></h3>
                    <div className={cx(style.boxBody)} >
                      <div className={cx(style.boxBodyInner)}>
                        <div className={style['assignees-block']}>
                          {this.props.statuses && this.props.statuses.map(status => {
                            const btnStyles = {background: status.color, borderColor: status.color};
                            const markedStatus = this.state.event && this.state.event.status && this.state.event.status.toUpperCase() === status.type.toUpperCase();
                            const btnClass = markedStatus ? style['btn-selected'] : style['btn-notselected'];
                            return (<Button onClick={() => this.updateActivityStatus(status)} className={cx(style['btn-status'], btnClass)}
                                    style={btnStyles} disabled={!enableStatusButtons || this.state.sendingStatus}>{status.title || status.type}</Button>)
                          })}
                        </div>
                      </div>
                    </div>
                  </div>}

                  <div className={cx(style.box)}>
                    <h3 className={cx(style.boxTitle)}>Assignees</h3>
                    <div className={cx(style.boxBody)}>
                      <div className={cx(style.boxBodyInner)} >
                        <div className={style['assignees-block']}>
                          <FieldGroup
                            label="Assignee(s)"
                            ref="crewSelector"
                            name="crew-selector"
                            event={this.state.event}
                            updateEntities={(entities) => {
                              this.setEventState('entity_ids', entities);
                            }}
                            componentClass={CrewSelectorV2}
                            allEntities={this.state.selectedGroupEntities}
                            entitiesSelected={this.state.activityEntities}
                            entities={entity_ids}
                            placeholder="Assign team member"
                            getSchedule={this.props.getSchedule}
                            entity_confirmation_statuses={null}
                            profile={this.props.companyProfile}
                            canEdit={this.props.can_edit}
                            canViewTeamConfirmation={false}
                            elId={Math.random().toString(36).substr(2, 16)}
                            placeholderImage={'/images/user.png'}
                            group_id={group_id}
                            groups={this.props.groups}
                            showGroup={showGroupDropdown}
                          />
                        </div>
                        {showEntityGroupError &&
                        <div className={style.groupErrorText}>
                          <p>Some assignees do not belong to the selected Group</p>
                        </div>
                        }
                      </div>
                      <div className={cx(style.boxBodyInner)}>
                        <strong className={cx(style.title)}>Equipment(s)</strong>
                        <FieldGroup
                          ref="equipmentSelector"
                          name="equipment-selector"
                          updateEntities={(resources) => {
                            this.setEventState('resource_ids', resources);
                          }}
                          componentClass={CrewSelectorV2}
                          allEntities={this.state.selectedGroupEquipments}
                          entitiesSelected={this.state.activityResources}
                          entities={resource_ids}
                          placeholder="Assign equipment"
                          idsPath='resource_ids'
                          getSchedule={this.props.getSchedule}
                          disableColors={true}
                          canEdit={this.props.can_edit}
                          elId={Math.random().toString(36).substr(2, 16)}
                          placeholderImage={'/images/equipment.png'}
                          group_id={group_id}
                          groups={this.props.groups}
                          showGroup={showGroupDropdown}
                        />
                        {showEquipmentGroupError &&
                        <div className={style.groupErrorText}>
                          <p>Some equipment do not belong to the selected Group</p>
                        </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Equalizer>
          </Row>
          <Row className={cx(style.taskFormRow)}>
            <Col md={6}>
              <CustomerDetails
                event={this.state.event}
                onChangeEventState={this.setEventState}
                canViewTaskFullDetails={this.props.can_view_task_full_details}
                can_edit={this.props.can_edit}
                customers={this.state.customers}
                error={this.state.error}
                sendingCustomer={this.state.sendingCustomer}
                handleChange={this.handleChange}
                handleInputChange={this.handleInputChange}
                emptyLabel={this.state.emptyLabel}
                isActivity={true}
                companyProfile={this.props.companyProfile}
              />
            </Col>
            <Col md={6}>
              <Instructions
                event={this.state.event}
                onChangeEventState={this.setEventState}
                canViewTaskFullDetails={this.props.can_view_task_full_details}
                can_create={this.props.can_create}
                can_edit={this.props.can_edit}
                fileUploader={this.state.fileUploader}
                filesFound={this.state.filesFound}
                profile={this.props.profile}
                updateImageClick={this.updateImageClick}
                removeFile={this.removeFile}
                files_to_upload={this.state.files_to_upload}
                filesAllowed={this.state.filesAllowed}
                onDrop={this.onDrop}
                closeImage={this.closeImage}
                getPreview={this.getPreview}
                uploadFilesAgain={this.uploadFilesAgain}
                updateImagesDisplay={this.updateImagesDisplay}
                getFilePreview={this.getFilePreview}
                isActivity={true}
                serverActionPending={this.props.serverActionPending}
                attachmentServerActionPending={this.state.attachmentServerActionPending}
                savingSpinnerTitle={savingSpinnerTitle}
              />
            </Col>
          </Row>
          <Row>
            {(this.props.serverActionPending || this.state.attachmentServerActionPending) &&
            <div>
              <SavingSpinner title={savingSpinnerTitle} borderStyle="none"/>
            </div>
            }
          </Row>
        </div>
        <footer className={cx(style.taskFooter)}>
          <div className={cx(style.fullContainer)}>
            <div className={cx(style.inner)}>
              <div className={cx(style.btnWrapper)}>
                {showDuplicateActivityButton &&
                <button type="button" onClick={(e) => this.updateActivity(e, true)}
                        className={cx(style.btn, style['btn-light'], disableLink)}>Duplicate Activity</button>
                }
                {showDeleteButton &&
                <button type="button" onClick={this.onDelete}
                        className={cx(style.btn, style['btn-light'], style.delete, disableLink)}>Delete</button>
                }
                {!this.props.pageView &&
                  <button type="button" className={cx(style.btn, style['btn-light'], disableLink)}
                          onClick={this.props.closeActivityModal}>Cancel</button>
                }
              </div>
              {showSaveChangesButton &&
              <div>
                <button type="button" onClick={(e) => this.updateActivity(e)}
                        className={cx(style.btn, style['btn-secondary'], disableLink)}>
                  {this.props.serverActionPending ?
                    <SavingSpinner borderStyle="none" title=""/> : 'Save Changes'}
                </button>
              </div>
              }
            </div>
          </div>
        </footer>
      </div>
    );
  }
};
