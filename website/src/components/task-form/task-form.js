import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Row, Col, Grid, Checkbox, FormControl, FormGroup, Glyphicon } from 'react-bootstrap';
import DatePicker from 'react-bootstrap-date-picker';
import moment from 'moment-timezone';
import cx from 'classnames';
import NotificationManager from '../notification-manager/notification-manager';
import CustomerFormBody from '../customer-form/customer-body-form';
import ExtraFields from '../extra-fields/extra-fields';
import { FieldGroup, ColorField, CrewSelector, CrewSelectorCircles } from '../fields';
import { DEFAULT_COLORPICKER_COLOR } from '../fields/color-field';
import Notifications from '../notifications/notifications';
import SwitchButton from '../../helpers/switch_button';
import styles from './task-form.module.scss';
import SavingSpinner from '../saving-spinner/saving-spinner';
import TaskFormSeries from '../task-form-series/task-form-series';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/fontawesome-free-regular';
import { faCalendar, faSync, faPlus } from '@fortawesome/fontawesome-free-solid';
import Dropzone from 'react-dropzone';
import TimePickerV4 from '../timepicker/timepickerv4';
import CrewSelectorV2 from '../crew-selector/crew-selector';
import TaskProducts from '../task-products/task-products';
import {
  getTaskFileAttachmentUploadURL,
  uploadAttachment,
  getAllTaskFiles,
  removeTaskFile
} from '../../actions';
import {getCompanyProfileInformation} from "../../actions/profile";
import TimezoneSelector from '../timezone-selector/timezone-selector';
import $ from 'jquery';
import { getTimezoneOptions, isTimezonesOffsetEqual } from '../../helpers';
import { toast } from 'react-toastify';

const defaultValue = (value, byDefault = '') => {
  return value ? value : byDefault;
};

const browser = () => {
  // Opera 8.0+
  const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

  // Firefox 1.0+
  const isFirefox = typeof InstallTrigger !== 'undefined';

  // Safari 3.0+ "[object HTMLElementConstructor]"
  const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);

  // Internet Explorer 6-11
  const isIE = /* @cc_on!@*/false || !!document.documentMode;

  // Edge 20+
  const isEdge = !isIE && !!window.StyleMedia;

  // Chrome 1+
  const isChrome = !!window.chrome && !!window.chrome.webstore;

  // Blink engine detection
  const isBlink = (isChrome || isOpera) && !!window.CSS;

  return isOpera ? 'Opera' :
    isFirefox ? 'Firefox' :
    isSafari ? 'Safari' :
    isChrome ? 'Chrome' :
    isIE ? 'IE' :
    isEdge ? 'Edge' :
    false;
}

const MAX_ALLOWED_REPEAT_OCCURENCES = 48;
const MAX_ALLOWED_RECURRING_DURATION_IN_MONTHS = 12;


export default class TaskForm extends Component {
  constructor(props) {
    super(props);
    let extra_fields = {};
    if (this.props.selectedEvent) {
      extra_fields = this.props.selectedEvent.extra_fields ?
        this.props.selectedEvent.extra_fields : {};
    }

    const edit_series = this.props.newEventIsRecurring;

    // Set appropriate end date and time
    let newEventEndDate = null;
    let newEventStartDate = null;
    if (!this.props.selectedEvent) {
      if (this.props.newEventEndDate) {
        newEventEndDate = moment(this.props.newEventEndDate);
      } else {
        newEventEndDate = this.props.newEventDate ? moment(this.props.newEventDate).add(1, 'hours')
            : this.buildDate(true);
      }
      if (this.props.newEventDate) {
        newEventStartDate = moment(this.props.newEventDate);
      } else {
        newEventStartDate = this.buildDate();
      }
    }

    let event = this.props.selectedEvent;
    let startTimeZone = moment.tz.guess();
    // If group_id in event is null then get default group of company else get selected group
    const selectedGroup = this.props.groups  && this.props.groups.find((group) => {
      return event && event.group_id ? (event.group_id === group.id) : (group.is_implicit);
    });

    if (selectedGroup && selectedGroup !== null && selectedGroup.timezone) {
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
    if (event && event.end_datetime_timezone) {
      endTimeZone = event.end_datetime_timezone;
    } else if (event && !event.end_datetime_timezone && event.start_datetime_timezone) {
      endTimeZone = event.start_datetime_timezone;
    }

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

    const taskEntities = [];
    const taskResources = [];
    if (event && event.entity_ids.length > 0) {
      event.entity_ids.map((entity_id) => {
        let taskEntity = this.props.entities.find((entity) => {
          return entity.id === entity_id;
        });
        if (taskEntity) {
          if (!selectedGroupEntities.find((entity) => {
            return entity.id === taskEntity.id;
          })) {
            taskEntities.push(taskEntity);
          }
        }
      });
    }

    if (event && event.resource_ids.length > 0) {
      event.resource_ids.map((resource_id) => {
        let taskEquipment = this.props.equipments.find((equipment) => {
          return equipment.id === resource_id;
        });
        if (taskEquipment) {
          if (!selectedGroupEquipments.find((equipmet) => {
            return equipmet.id === taskEquipment.id;
          })) {
            taskResources.push(taskEquipment);
          }
        }
      });
    }

    const email = (!this.props.companyProfile || !this.props.companyProfile.task_notifications_settings ||
      typeof this.props.companyProfile.task_notifications_settings.email === 'undefined' ||
      this.props.companyProfile.task_notifications_settings.email === null)
      ? true : this.props.companyProfile.task_notifications_settings.email;
    const sms = (!this.props.companyProfile || !this.props.companyProfile.task_notifications_settings ||
      typeof this.props.companyProfile.task_notifications_settings.sms === 'undefined' ||
      this.props.companyProfile.task_notifications_settings.sms === null)
      ? true : this.props.companyProfile.task_notifications_settings.sms;

    // Fixed: Fix end_date setting to appropriate value by default
    // e.g. when start time is X date at 11:30 PM then end time should be X+1 00:30 AM
    this.state = {
      event: event || {
        title: '',
        extra_fields: {},
        entity_ids: [],
        resource_ids: [],
        notifications: { email, sms },
        series_id: null,
        unscheduled: this.props.viewType === 'unscheduled' ? true : false,
        additional_addresses: null,
        template: this.props.defaultTemplate ? this.props.defaultTemplate.id : null,
        // external_url: '',
        group_id: '-1',
        end_datetime_timezone: null,
        start_datetime_timezone: null
      },
      fields: this.props.selectedEvent ? Object.keys(extra_fields).filter((key) => { return key !== 'task_color'; }).map((key) => {
        return {
          name: key,
          value: extra_fields[key]
        };
      }) : [],
      task_color: this.props.selectedEvent && extra_fields.task_color ? extra_fields.task_color : DEFAULT_COLORPICKER_COLOR,
      start_date: this.InitializeDateTime('StartDate', newEventEndDate, newEventStartDate, event, startTimeZone),
      end_date: this.InitializeDateTime('EndDate', newEventEndDate, newEventStartDate, event, endTimeZone),
      start_time: this.InitializeDateTime('StartTime', newEventEndDate, newEventStartDate, event, startTimeZone),
      end_time: this.InitializeDateTime('EndTime', newEventEndDate, newEventStartDate, event, endTimeZone),
      index: this.props.importing ? this.props.selectedEvent.index : null,
      // BADLY named. These are the alerts that show up.
      notifications: [],
      series_settings: {
        edit_series,
        interval: 'month',
        weekdays: [false, false, false, false, false, false, false],
        start_date: new Date(),
        ends_condition: 'date',
        ends_on: moment().add(1, 'months'),
        repeat: 1,
        monthly_week_in_month: 1,
        monthly_day_in_week: 0
      },
      showTaskDuplicateConfirmation: false,
      showEditSeriesConfirmation: false,
      showDeleteSeriesConfirmation: false,
      showDeleteTaskConfirmation:false,
      validationErrors: null,
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
      showUnscheduledTaskConfirmation: false,

      shownUnscheduledConfirmation: false,
      shownTaskDuplicateConfirmation: false,
      shownIndividualEditConfirmation: false,
      shownSeriesEditConfirmation: false,
      displayNotification: false,
      client_timezone: moment.tz.guess(),
      selectedGroupEntities,
      selectedGroupEquipments,
      taskEntities,
      taskResources,
  };

    this.updateTask = this.updateTask.bind(this);
    this.onMultipleChange = this.onMultipleChange.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onStartDateChange = this.onStartDateChange.bind(this);
    this.onEndDateChange = this.onEndDateChange.bind(this);
    this.onEnableTimeWindow = this.onEnableTimeWindow.bind(this);
    this.onUseAssigneeColorChange = this.onUseAssigneeColorChange.bind(this);
    this.onSeriesSettingsChange = this.onSeriesSettingsChange.bind(this);
    this.cancelSeriesAction = this.cancelSeriesAction.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.getTaskSeriesSettings = this.getTaskSeriesSettings.bind(this);
    this.onSeriesEndsOnFocus = this.onSeriesEndsOnFocus.bind(this);
    this.setTime = this.setTime.bind(this);
    this.inputTimeEndChange = this.inputTimeEndChange.bind(this);
    this.runValidations = this.runValidations.bind(this);
    this.renderValidationErrors = this.renderValidationErrors.bind(this);
    this.updateImageClick = this.updateImageClick.bind(this);
    this.closeImage = this.closeImage.bind(this);
    this.getPreview = this.getPreview.bind(this);
    this.uploadFilesOnServer = this.uploadFilesOnServer.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.uploadTaskAttachments = this.uploadTaskAttachments.bind(this);
    this.showUploadedFiles = this.showUploadedFiles.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.uploadFilesAgain = this.uploadFilesAgain.bind(this);
    this.uploadSingleFile = this.uploadSingleFile.bind(this);
    this.onUnscheduledTaskSelectionChange = this.onUnscheduledTaskSelectionChange.bind(this);
    this.clearDateTimeFields = this.clearDateTimeFields.bind(this);
    this.getDate = this.getDate.bind(this);
    this.renderUnscheduledTaskConfirmation = this.renderUnscheduledTaskConfirmation.bind(this);
    this.renderTasksTemplates = this.renderTasksTemplates.bind(this);
    this.handleTaskTemplateChange = this.handleTaskTemplateChange.bind(this);
    this.additionalAddressesUpdateCallback = this.additionalAddressesUpdateCallback.bind(this);
    this.renderFileUploadAreaForLowRes = this.renderFileUploadAreaForLowRes.bind(this);
    this.updateImagesDisplay = this.updateImagesDisplay.bind(this);
    this.getFilePreview = this.getFilePreview.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.renderGroups = this.renderGroups.bind(this);
    this.handleGroupChange = this.handleGroupChange.bind(this);
    this.setTimezones = this.setTimezones.bind(this);
  }

  componentWillMount() {
    this.can_create = false;
    this.can_edit = false;
    this.can_delete = false;
    this.can_view_task_full_details = false;
    this.can_add_group = false;
    if (this.props.profile && this.props.profile.permissions) {
      const permissions = this.props.profile.permissions;
      let is_company = false;
      if (permissions.includes('COMPANY')) is_company = true;
      if (is_company || this.props.profile.permissions.includes('VIEW_TEAM_CONFIRMATION_DATA')) this.can_view_team_confirmation = true;
      if (is_company || permissions.includes('ADD_TASK')) this.can_create = true;
      if (is_company || permissions.includes('EDIT_TASK')) this.can_edit = true;
      if (is_company || permissions.includes('DELETE_TASK')) this.can_delete = true;
      if (is_company || permissions.includes('ASSIGN_GROUPS')) this.can_add_group = true;
      if (is_company || permissions.includes('VIEW_TASK_FULL_DETAILS')) {
        this.can_view_task_full_details = true;
      } else if (permissions.includes('VIEW_TASK_LIMITED_DETAILS')) {
        this.can_view_task_full_details = false;
      }
    }
  }
  additionalAddressesUpdateCallback(additionalAddresses) {
    this.setState({
      event: {
        ...this.state.event,
        additional_addresses: additionalAddresses
      },
      displayNotification: false
    });
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

  renderFileUploadAreaForLowRes() {
    return (
      <div id="uploadFile">
        <div className={styles.fileUploaderMobile}>
          <div className={cx(['form-group'], styles.fileUploaderMobileBtn)}>
            <label>Select Files to Upload</label>
            <input type="file" onChange={(e) => this.updateImagesDisplay(e)} multiple className="form-control" />
          </div>
          <div className={styles.customFilePreview}>
            {this.state.files_to_upload.length === 0 &&
            <p>No files chosen.</p>
            }
            {this.state.files_to_upload.length !== 0 &&
            <ul className={styles.uploadFilesPreviews}>
              {this.state.files_to_upload.map(file =>
                <li>
                  <button onClick={(e) => this.closeImage(file.name, e)} className={styles.closeBtn}><FontAwesomeIcon icon={faTimesCircle} /></button>
                  <div className={styles.uploadCaption}><span>{file.name}</span></div>
                  <img src={this.getFilePreview(file)} />
                  {file.isNew =='false' &&
                  <button onClick={(e) => this.uploadFilesAgain(file, e)} className={styles.retryBtn}><FontAwesomeIcon icon={faSync} /></button>
                  }
                  {file.isInProcess == 'true' &&
                  <i className={cx('fa fa-spinner fa-spin ' + styles.uploadSpinner)}></i>
                  }
                </li>)
              }
              {this.state.files_to_upload.length > 0 && this.state.files_to_upload.length < this.state.filesAllowed &&
              <li className={styles.addAnotherImgMobile}>
                <div className={cx(['form-group'], styles.extraFileUploaderMobileBtn)}>
                  <FontAwesomeIcon icon={faPlus} className={styles.addAnotherIcon} />
                  <input type="file" onChange={(e) => this.updateImagesDisplay(e)} multiple className="form-control" />
                </div>
              </li>
              }
            </ul>
            }
          </div>
        </div>
      </div>
    );
  }

  InitializeDateTime (type, newEventEndDate, newEventStartDate, event, timezone) {
    if (type === 'StartDate') {
      if (event) {
        if (!event.start_datetime_original_iso_str) {
          return '';
        } else {
          return moment.tz(event.start_datetime_original_iso_str, timezone).format('YYYY-MM-DD');
        }
      } else {
        return moment.tz(newEventStartDate, timezone).format('YYYY-MM-DD');
      }
    } else if (type === 'EndDate') {
      if (event) {
        if (!event.end_datetime_original_iso_str) {
          return '';
        } else {
          return moment.tz(event.end_datetime_original_iso_str, timezone).format('YYYY-MM-DD');
        }
      } else {
        return moment.tz(newEventEndDate, timezone).format('YYYY-MM-DD');
      }
    } else if (type === 'StartTime') {
      if (event) {
        if (!event.start_datetime) {
          return '';
        } else {
          return this.extractTime(event.start_datetime_original_iso_str, timezone);
        }
      } else {
        return this.extractTime(newEventStartDate, timezone);
      }
    } else if (type === 'EndTime') {
      if (event) {
        if (!event.end_datetime) {
          return '';
        } else {
          return this.extractTime(event.end_datetime_original_iso_str, timezone);
        }
      } else {
        return this.extractTime(newEventEndDate, timezone);
      }
    }
  }

  buildDate(end = false) {
    let currentDate = moment();
    if (currentDate.get('minute') < 30) {
      currentDate.set('minute', 30);
    } else {
      currentDate.set('hour', currentDate.get('hour') + 1).set('minute', 0);
    }
    return end ? currentDate.set('minute', currentDate.get('minute') + 60) : currentDate;
  }

  convertUtcToLocal(dateString) {
    return moment.utc(dateString);
  }

  componentDidMount() {
    this.showUploadedFiles();
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.serverActionPending && nextProps.serverActionComplete) {
      this.setState({ notifications: [{ message: 'Task successfully updated' }] });
    }

    if (nextProps.filesFail) {
      this.setState({
        files_to_upload: nextProps.actualFailedFiles,
        displayNotification: false
      });
    }

    if (nextProps.importing) {
      let extra_fields = {};
      if (nextProps.selectedEvent) {
        extra_fields = nextProps.selectedEvent.extra_fields ?
          nextProps.selectedEvent.extra_fields : {};
      }

      let event = nextProps.selectedEvent;
      if (this.props.groups && !this.props.groups.find((singleGroup) => { return singleGroup.id === event.group_id; })) {
        event.group_id = null;
      }
      this.setState({
        notifications: [],
        displayNotification: false,
        event,
        task_color: extra_fields.task_color ? extra_fields.task_color : DEFAULT_COLORPICKER_COLOR,
        start_date: nextProps.selectedEvent.start_datetime,
        end_date: nextProps.selectedEvent.end_datetime,
        start_time: this.extractTime(nextProps.selectedEvent.start_datetime),
        end_time: this.extractTime(nextProps.selectedEvent.end_datetime),
        index: nextProps.selectedEvent.index,
        fields: Object.keys(extra_fields).filter((key) => { return key !== 'task_color'; }).map((key) => {
          return {
            name: key,
            value: extra_fields[key]
          };
        })
      });
    }
  }


  uploadFilesOnServer(file) {
    let files = [];
    let file_id = '';
    const image = file;
    const promise = getTaskFileAttachmentUploadURL(this.state.event.id)
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
      }, () => {
        window.location.hash = '#uploadFile';
      });
    } else {
      this.setState({
        fileUploader: false,
        displayNotification: false
      }, () => {
        window.location.hash = '';
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
    let temp=allBackup;
    let localArr=[];
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

  removeFile(task_id, file_id, file_name) {
    const r = confirm("Are you sure that you want to delete '" + file_name + "'?");
    if (r) {
      removeTaskFile(task_id, file_id).then((msg) => {
        this.showUploadedFiles();
      });
    }
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

    if (h == 0) {
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

  extractTime(datetime, timezone) {
    if (datetime) {
      return this.formatTime(datetime, timezone);
    }

    return { hours: '09', mins: '00', meridian: 'AM' };
  }

  onMultipleChange(object) {
    for (const propt in object) {
      if (object.hasOwnProperty(propt)) {
        this.onChange(propt, object[propt]);
      }
    }
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
      return item.id == firstId;
    });

    if (firstAssignee) {
      return firstAssignee.color ? firstAssignee.color : DEFAULT_COLORPICKER_COLOR;
    }

    return oldColor;
  }

  onChange(name, value) {
    const event = this.state.event;

    if (name === 'fields') {
      this.setState(Object.assign(this.state, { fields: value, notifications: [], displayNotification: false }));
    } else if (name === 'task_color') {
      event.use_assignee_color = false;
      this.setState(Object.assign(this.state, { task_color: value, notifications: [], event, displayNotification: false }));
    } else if (name === 'time_window_start') {
      event[name] = parseInt(value);
      this.setState(Object.assign(this.state, { event, notifications: [], displayNotification: false }));
    } else {
      event[name] = value;
      let task_color = this.state.task_color;

      if (name == 'entity_ids' && event.use_assignee_color) {
        if (!value.length) {
          event.use_assignee_color = false;
        } else {
          task_color = this.getFirstAssigneeColor(task_color, value[0]);
        }
      }

      this.setState(Object.assign(this.state, { event, task_color, notifications: [], displayNotification: false }));
    }
  }

  onStartDateChange(value) {
    if (value && value !== '') {
      const start_date = new Date(value);
      let end_date = null;
      if (this.state.end_date) {
        end_date = new Date(this.state.end_date);
        if (start_date.getTime() > end_date.getTime()) {
          this.setState({
            start_date: moment(start_date).format(),
            end_date: moment(start_date).format(),
            displayNotification: false
          });
          return;
        }
      }
    } else if (value === null) {
      this.setState({
        start_date: value,
        displayNotification: false
      });
      return;
    } else {
      value = new Date();
    }
    if (!this.state.end_date) {
      this.setState({
        start_date : value, notifications: [],
        end_date: value,
        displayNotification: false
      });
    } else {
      this.setState({
        start_date : value, notifications: [],
        displayNotification: false
      });
    }
  }

  onEndDateChange(value) {
    if (value) {
      const end_date = new Date(value);
      let start_date = null;
      if (this.state.start_date) {
        start_date = new Date(this.state.start_date);
        if (start_date.getTime() > end_date.getTime()) {
          this.setState({
            start_date: moment(end_date).format(),
            end_date: moment(end_date).format(),
            displayNotification: false
          });

          return;
        }
      }
    } else if (value === null) {
      this.setState({
        end_date: value,
        displayNotification: false
      });
      return;
    } else {
      value = new Date();
    }

    if (!this.state.start_date) {
      this.setState({
        end_date : value, notifications: [],
        start_date : value,
        displayNotification: false
      });
    } else {
      this.setState({
        end_date : value, notifications: [],
        displayNotification: false
      });
    }
  }

  setTime(startTimeHours, startTimeMinutes, startTimeMeridian, endTimeHours, endTimeMinutes, endTimeMeridian) {
    const startTimeString = startTimeHours + ':' + startTimeMinutes + ' ' + startTimeMeridian;
    const endTimeString = endTimeHours + ':' + endTimeMinutes + ' ' + endTimeMeridian;
    const dateFromEndTimeString = moment(endTimeString, 'hh:mm A');
    const incrementedEndTime = moment(dateFromEndTimeString).add(1, 'hours').format('hh:mm A');
    const timeRegEx = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ?([aApP][mM])$/;
    const matchedGrups = timeRegEx.exec(incrementedEndTime);
    const endHrs = matchedGrups[1];
    const endMins = matchedGrups[2];
    const endMerd = matchedGrups[3];
    let endDate = this.state.end_date;
    const startDate = this.state.start_date;

    if (startDate && endDate && startTimeMeridian.toUpperCase() === 'PM' && endMerd.toUpperCase() === 'AM' &&
        (moment(startDate).format('dd-mm-yyyy') === moment(endDate).format('dd-mm-yyyy'))) {
      endDate = moment(endDate).add(1, 'day').format();
    }

    this.setState({
      start_time : {
        hours: this.formatDoubleDigitDate(startTimeHours),
        mins: this.formatDoubleDigitDate(startTimeMinutes),
        meridian: startTimeMeridian,
        notifications: []
      },
      end_time: {
        hours: this.formatDoubleDigitDate(endHrs),
        mins: this.formatDoubleDigitDate(endMins),
        meridian: endMerd || this.state.end_time.meridian,
        notifications: this.state.end_time.notifications
      },
      end_date: endDate,
      displayNotification: false
    });
  }

  onEnableTimeWindow(e) {
    const event = this.state.event;
    event.enable_time_window_display = e.target.checked;

    if (!event.time_window_start) {
      event.time_window_start = 60;
    }

    this.setState(Object.assign(this.state, { event, displayNotification: false }));
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

  getDate(dateString) {
    return moment.utc(dateString).format('YYYY-MM-DD');
  }

  generateDatetime({ start_date, end_date, start_time, end_time }) {
	if (!start_date && !start_time && !end_date && !end_time) {
      let start_datetime = '';
      let end_datetime = '';

      return {start_datetime, end_datetime};
    }
    let start_datetime = null;
    let end_datetime = null;
    if (start_date && start_time) {
      start_datetime = moment(start_date);
      let start_hour = 0;
      if (start_time.meridian === 'PM' && Number(start_time.hours) < 12) {
        start_hour = Number(start_time.hours) + 12;
      } else if ((start_time.meridian === 'AM' && Number(start_time.hours) < 12) || (start_time.meridian === 'PM' && Number(start_time.hours) === 12)) {
        start_hour = Number(start_time.hours);
      }
      start_datetime.set({ 'h': start_hour, 'm': Number(start_time.mins) });
    } else if (start_date) {
      start_datetime = moment(start_date);
    } else {
      start_datetime = '';
    }
    if (end_date && end_time) {
      end_datetime = moment(end_date);
      let end_hour = 0;
      if (end_time.meridian === 'PM' && Number(end_time.hours) < 12) {
        end_hour = Number(end_time.hours) + 12;
      } else if ((end_time.meridian === 'AM' && Number(end_time.hours) < 12) || (end_time.meridian === 'PM' && Number(end_time.hours) === 12)) {
        end_hour = Number(end_time.hours);
      }
      end_datetime.set({ 'h': end_hour, 'm': Number(end_time.mins) });
    } else if (end_date) {
      end_datetime = moment(end_date);
    } else {
      end_datetime = '';
    }

    return {start_datetime, end_datetime};
  }

  runValidations(event) {
    let errors = false;
    let notification = null;
    if (this.state.series_settings && this.state.series_settings.edit_series) {
      if (!this.state.start_date || !this.state.end_date || !this.state.start_time || !this.state.end_time) {
	      notification = {
		      text: 'Date or Time is missing. Please enter valid Date and Time for repeating tasks.',
		      options: {
			      type: toast.TYPE.ERROR,
			      position: toast.POSITION.BOTTOM_LEFT,
			      className: styles.toastErrorAlert,
			      autoClose: 8000
		      }
	      };
	      errors = true;
      }
      if (this.state.series_settings.ends_condition === 'maximum_occurrences') {
        if (this.state.series_settings.maximum_occurrences > MAX_ALLOWED_REPEAT_OCCURENCES) {
	        notification = {
		        text: `Number of occurences of a repeating task cannot be more than ${MAX_ALLOWED_REPEAT_OCCURENCES}`,
		        options: {
			        type: toast.TYPE.ERROR,
			        position: toast.POSITION.BOTTOM_LEFT,
			        className: styles.toastErrorAlert,
			        autoClose: 8000
		        }
	        };
	        errors = true;
        }
      } else if (this.state.series_settings.ends_condition === 'date') {
        const diff = moment(this.state.series_settings.ends_on).diff(moment(this.state.series_settings.start_date), 'months');
        if (diff > MAX_ALLOWED_RECURRING_DURATION_IN_MONTHS) {
	        notification = {
		        text: `Duration of a repeating task cannot be more than ${MAX_ALLOWED_RECURRING_DURATION_IN_MONTHS} months`,
		        options: {
			        type: toast.TYPE.ERROR,
			        position: toast.POSITION.BOTTOM_LEFT,
			        className: styles.toastErrorAlert,
			        autoClose: 8000
		        }
	        };
	        errors = true;
        }

      }
    }

    if (!this.state.event.unscheduled) {
      if (!this.state.start_date || !this.state.end_date || !this.state.start_time || !this.state.end_time) {
	      notification = {
		      text: 'Date or Time is missing. Please enter valid Date and Time for scheduled task.',
		      options: {
			      type: toast.TYPE.ERROR,
			      position: toast.POSITION.BOTTOM_LEFT,
			      className: styles.toastErrorAlert,
			      autoClose: 8000
		      }
	      };
	      errors = true;
      }
    }

    let hasGroups = false;
    if (this.props.groups && (this.props.groups.find((group) => { return group.is_implicit; })) && this.props.groups.length > 1 && this.props.groups.find((group) => { return !group.is_disabled && !group.is_implicit; })) {
      hasGroups = true;
    } else if (this.props.groups && !(this.props.groups.find((group) => { return group.is_implicit; })) && this.props.groups.length > 0 && this.props.groups.find((group) => { return !group.is_disabled; })) {
      hasGroups = true;
    }


    if (this.state.event.group_id === '-1' && hasGroups) {
    	notification = {
    		text: 'Group is required. Please select a group for task.',
		    options: {
    			type: toast.TYPE.ERROR,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastErrorAlert,
			    autoClose: 8000
		    }
	    };
	    errors = true;
    }

    let selectedEvent = this.state.event;
    if (selectedEvent.group_id === '-1' && !hasGroups) {
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

  updateTask(event, createDuplicate = false) {
    event.preventDefault();
    event.stopPropagation();

    let allBackup = this.state.files_to_upload;
    if (this.state.files_to_upload.length > 0 && !this.props.filesFail) {
      for (let i = 0; i < this.state.files_to_upload.length; i++) {
        allBackup[i].isInProcess = 'true';
      }
    }
    const task = this.state.event;
    let group_id = this.state.event.group_id;
    // null is valid value for this.props.profile.group_id, as it points to primary group
    if (!this.can_add_group && this.props.profile && typeof this.props.profile.group_id !== 'undefined' && group_id === '-1') {
      group_id = this.props.profile.group_id || '';
    }
    task.group_id = group_id;
    this.setState({
      files_to_upload: allBackup,
      displayNotification: false,
      event: task
    });
    this.cancelSeriesAction(event);
    const errors = this.runValidations(event);
    if (errors) {
      this.setState({
        validationErrors: errors,
        displayNotification: false
      });
      return;
    }
    
    if (this.state.event.id && this.state.series_settings.edit_series && !this.state.showEditSeriesConfirmation && createDuplicate === false && !this.state.shownSeriesEditConfirmation) {
      this.setState(Object.assign(this.state, { showEditSeriesConfirmation: true, shownSeriesEditConfirmation: true, displayNotification: false }));
      return;
    } else if (this.state.event.series_id && !this.state.series_settings.edit_series &&
      !this.state.showEditSeriesIndividualConfirmation && createDuplicate === false && !this.state.shownIndividualEditConfirmation) {
      this.setState(Object.assign(this.state, { showEditSeriesIndividualConfirmation: true, shownIndividualEditConfirmation: true, displayNotification: false }));
      return;
    } else if (createDuplicate === true && !this.state.showTaskDuplicateConfirmation && !this.state.shownTaskDuplicateConfirmation) {
      this.setState(Object.assign(this.state, { showTaskDuplicateConfirmation: true, shownTaskDuplicateConfirmation: true, displayNotification: false }));
      return;
    } else if (createDuplicate === false && this.state.event.unscheduled && !this.state.showUnscheduledTaskConfirmation && !this.state.showTaskDuplicateConfirmation && !this.state.shownUnscheduledConfirmation) {
      this.setState(Object.assign(this.state, { showUnscheduledTaskConfirmation: true, shownUnscheduledConfirmation: true, displayNotification: false }));
      return;
    }

    const fields = this.state.fields.filter((item) => {
      return item.name !== '' || item.value !== '';
    });
    const extra_fields = {};

    //Object.assign(this.state.event, this.generateDatetime(this.state));

    const { start_datetime, end_datetime } = this.generateDatetime(this.state);

    fields.forEach((field) => {
      extra_fields[field.name] = field.value;
    });
    extra_fields.task_color = this.state.task_color;

    let notifications = null;
    let customer_exact_location = {};

    if (this.state.event.notifications) {
      notifications = Object.assign(this.state.event.notifications, {});
    }

    if (this.state.event.customer_exact_location) {
      customer_exact_location = Object.assign(this.state.event.customer_exact_location, {});
    }

    let event_clone = $.extend(true, {}, this.state.event);

    const updatedEvent = $.extend(true, event_clone, {
      extra_fields: JSON.stringify(extra_fields),
      notifications: notifications ? JSON.stringify(notifications) : null,
      entity_ids: this.state.event.entity_ids.join(','),
      resource_ids: this.state.event.resource_ids.join(','),
      customer_exact_location: JSON.stringify(customer_exact_location),
      entity_confirmation_statuses: null
    });

    let { edit_series, ...series_settings } = this.state.series_settings;
    series_settings = $.extend(true, {}, series_settings);

    series_settings.start_date = moment(series_settings.start_date).format();

    if (series_settings.ends_on) {
      series_settings.ends_on = moment(series_settings.ends_on).format();
    }

    if (edit_series) {
      updatedEvent.series_settings = JSON.stringify(series_settings);
    }

    updatedEvent.additional_addresses = JSON.stringify(this.state.event.additional_addresses);

    if (this.props.items) {
      updatedEvent.items = JSON.stringify(this.props.items);
    }

    if (updatedEvent.entities_data) {
      delete updatedEvent.entities_data
    }

    updatedEvent['manipulate_route'] = true;
    updatedEvent['customer_address'] = '';

    this.setState(Object.assign(this.state, {
      showEditSeriesConfirmation: false,
      showDeleteSeriesConfirmation: false,
      showDeleteTaskConfirmation: false,
      showEditSeriesIndividualConfirmation: false,
      showTaskDuplicateConfirmation:false,
      validationErrors: null,
      displayNotification: true
    }));

    let startTimeZone = moment.tz.guess();
    let endTimeZone = moment.tz.guess();

    let selectedGroup = null;
    if (typeof this.props.groups !== 'undefined' && this.props.groups !== null && this.props.groups.length > 0) {
      selectedGroup = this.props.groups.find((el) => { return (this.state.event && this.state.event.group_id) ? el.id === Number(this.state.event.group_id) : el.is_implicit; })
    }
    const groupTimezone = (typeof selectedGroup !== 'undefined' && selectedGroup !== null) ? selectedGroup.timezone : null;
    const companyTimezone = typeof this.props.profile !== 'undefined' ? this.props.profile.timezone : null;
    const entityGroupTimezone = typeof this.props.profile !== 'undefined' ? this.props.profile.group_timezone : null;

    if (updatedEvent.start_datetime_timezone !== null && updatedEvent.start_datetime_timezone !== '') {
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

    if (updatedEvent.end_datetime_timezone !== null && updatedEvent.end_datetime_timezone !== '') {
      endTimeZone = updatedEvent.end_datetime_timezone;
    } else if ((updatedEvent.end_datetime_timezone === null || updatedEvent.end_datetime_timezone === '') &&
        (updatedEvent.start_datetime_timezone !== null && updatedEvent.start_datetime_timezone !== '')) {
      endTimeZone = updatedEvent.start_datetime_timezone;
    } else {
      if (groupTimezone) {
        endTimeZone = groupTimezone;
      } else if (companyTimezone) {
        endTimeZone = companyTimezone;
      } else if (entityGroupTimezone) {
        endTimeZone = entityGroupTimezone;
      }
    }
    const startDate = start_datetime && moment(start_datetime);
    const endDate = end_datetime && moment(end_datetime);

    if (updatedEvent.current_destination) {
      updatedEvent.current_destination = null;
    }

    updatedEvent.start_datetime = startDate ? moment.tz(startDate.format('YYYY-MM-DDTHH:mm:ss'), 'YYYY-MM-DDTHH:mm:ss', startTimeZone).format() : '';
    updatedEvent.end_datetime = endDate ? moment.tz(endDate.format('YYYY-MM-DDTHH:mm:ss'), 'YYYY-MM-DDTHH:mm:ss', endTimeZone).format() : '';
    updatedEvent.start_datetime_timezone = startTimeZone;
    updatedEvent.end_datetime_timezone = endTimeZone;

    this.props.onSaveClick(updatedEvent, this.state.files_to_upload, createDuplicate);

  }

  renderDropDown(enabled, time_window_start, onChange) {

    let selectedValue = "60";
    if (time_window_start) {
      selectedValue = time_window_start;
    }

    return (<FormGroup controlId="formControlsSelect" className={styles['time-window-group']}>
      <FormControl onChange={onChange('time_window_start')} disabled={!enabled} value={selectedValue} componentClass="select" placeholder="select" className={styles['time-window-select']}>
        <option value="30">30 mins</option>
        <option value="60">1 hr</option>
        <option value="90">1 hr 30 mins</option>
        <option value="120">2 hrs</option>
        <option value="150">2 hrs 30 mins</option>
        <option value="180">3 hrs</option>
        <option value="210">3 hrs 30 mins</option>
        <option value="240">4 hrs</option>
      </FormControl>
    </FormGroup>
      );
  }

  renderTimeWindowIfNeeded(enable_time_window_display, start_datetime, time_window_start, end_datetime) {
    if (!enable_time_window_display) {
      return null;
    }

    // TODO: Show duration in UI
    /* let durationMessage = null;
    if (end_datetime) {
      const duration = moment.duration(moment(end_datetime).diff(moment(start_datetime)));
      const hours = duration.asHours();
      durationMessage = " and approximate duration is " + hours + " hours";
    }*/

    const window_time = moment(start_datetime).add(time_window_start, 'minutes');
    return <span>
      e.g. We will arrive between <span className={styles['default_time']}>{moment(start_datetime).format('hh:mm A')} and {window_time.format('hh:mm A')}</span>
    </span>;

  }

  renderTasksTemplates() {
    const templatesList = this.props.templates.map((template) => {
      return (
        <option value={template.id} title={template.description}>{template.name}</option>
      );
    });
    return templatesList;
  }

  handleTaskTemplateChange(e) {
    let value = e.target.value;
    if ( value !== 'DEFAULT') {
      value = parseInt(value);
    } else {
      value = null;
    }
    this.setState((state) => {
      return {
        ...state,
        event: {
          ...state.event,
          template: value
        },
        displayNotification: false
      };
    });
    this.props.handleTaskTypeChange(value);
  }

  onUseAssigneeColorChange(e) {
    const event = this.state.event;
    event.use_assignee_color = e.target.checked;

    let task_color = this.state.task_color;
    if (event.use_assignee_color) {
      task_color = this.getFirstAssigneeColor(task_color);
    }

    this.setState(Object.assign(this.state, { event, task_color, displayNotification: false }));
  }

  onUnscheduledTaskSelectionChange(e) {
    const event = this.state.event;
    event.unscheduled = e.target.checked;
    let unscheduled = false;
    if (event.unscheduled) {
      unscheduled = false;
    }
    this.setState(Object.assign(this.state, { event, unscheduled, displayNotification: false }));
  }

  onSeriesSettingsChange(field_name, value) {
    const series_settings = this.state.series_settings;

    let new_value = value;
    if (['start_date', 'ends_on'].indexOf(field_name) !== -1) {
      if (new_value) {
        new_value = new Date(value);
      } else {
        new_value = new Date();
      }
    }

    if (field_name === 'maximum_occurrences' || field_name === 'repeat') {
      series_settings[field_name] = parseInt(value);
    } else {
      series_settings[field_name] = new_value;
    }

    this.setState(Object.assign(this.state, { series_settings, displayNotification: false }));
  }

  onSeriesEndsOnFocus(field_name) {
    const series_settings = this.state.series_settings;

    if (field_name === 'ends_on') {
      series_settings.ends_condition = 'date';
    } else {
      series_settings.ends_condition = 'maximum_occurrences';
    }

    this.setState(Object.assign(this.state, { series_settings, displayNotification: false }));
  }

  getTaskSeriesSettings() {
    // if we are creating new event just tell TaskFormSeries that we have loaded data
    if (!this.state.event.series_id) {
      return new Promise((resolve) => {
        resolve();
      });
    }

    return this.props.getTaskSeriesSettings(this.state.event.id).then((data) => {
      const series_settings = JSON.parse(data);
      this.setState(Object.assign(this.state, { series_settings, displayNotification: false }));
    });
  }

  renderTasksConfirmation(contents) {
    return (
      <div>
        <div className={styles['tasks-confirm-overlay']}/>
        <div className={styles['tasks-confirm-dialog-wrapper']}>
          {contents}
        </div>
      </div>
    );
  }

  renderTaskDuplicateConfirmation() {
    const contents = (
      <div>
        <h3>Duplicate Task</h3>
        <p className={styles['confirm-dialog-text']}>
          Please save your current changes by clicking the "Save and Duplicate" button below. Cancel if you would like to make further changes.
        </p>
        <div className={cx('pull-right', styles['tasks-confirm-buttons'])}>
          <Button onClick={(event) => this.updateTask(event, true)} className="green-btn" type="submit">Save and Duplicate current task</Button>
          <Button onClick={this.cancelSeriesAction} className={cx('white-btn', styles['series-confirm-cancel'])}>Cancel</Button>
        </div>
      </div>
    );

    return this.renderTasksConfirmation(contents);
  }

  renderEditSeriesConfirmation() {
    const contents = (
      <div>
        <h3>Change Repeating Task Series</h3>
        <p className={styles['confirm-dialog-text']}>
          You have edited the series for this repeating task.
          Any edits will apply to instances occurring today and future instances in the series.<br/>
          &mdash; Instances occurring in the past will not be changed<br/>
          &mdash; Any edits made to individual future instances will be lost<br/>
          &mdash; To change individual event, exit this dialog and turn the <strong>Edit Series</strong> switch off, make changes
          then click <strong>Save</strong>
        </p>
        <div className={cx('pull-right', styles['tasks-confirm-buttons'])}>
          <Button type="submit" className="green-btn">Change Repeating Task Series</Button>
          <Button onClick={this.cancelSeriesAction} className={cx('white-btn', styles['series-confirm-cancel'])}>Cancel</Button>
        </div>
      </div>
    );

    return this.renderTasksConfirmation(contents);
  }

  renderDeleteSeriesConfirmation() {
    const contents = (
      <div>
        <h3>Delete Repeating Task Series</h3>
        <p className={styles['confirm-dialog-text']}>Would you like to delete only this task or this and all following?</p>

        <div className={cx('pull-right', styles['tasks-confirm-buttons'])}>
          <Button className="blue-btn" title="This and all the following tasks will be deleted" onClick={() => this.props.onDeleteClick(this.state.event.id, true)}>Following tasks</Button>
          <Button className="green-btn" title="All other tasks in series will remain the same" onClick={() => this.props.onDeleteClick(this.state.event.id)}>Only this task</Button>
          <Button onClick={this.cancelSeriesAction} className={cx('white-btn', styles['series-confirm-cancel'])}>Cancel</Button>
        </div>
      </div>
    );

    return this.renderTasksConfirmation(contents);
  }

  renderEditSeriesIndividualConfirmation() {
    const contents = (
      <div>
        <h3>Change Task Instance</h3>
        <p className={styles['confirm-dialog-text']}>You have edited an individual repeating task instance. Any edits will apply to this one instance.</p>
        <p className={styles['confirm-dialog-text']}>
          To change series, exit this dialog and turn the <strong>Edit Series</strong> switch on, make changes
          then click <strong>Save</strong>
        </p>

        <div className={cx('pull-right', styles['tasks-confirm-buttons'])}>
          <Button className="green-btn" type="submit">Change task</Button>
          <Button onClick={this.cancelSeriesAction} className={cx('white-btn', styles['series-confirm-cancel'])}>Cancel</Button>
        </div>
      </div>
    );

    return this.renderTasksConfirmation(contents);
  }

  renderDeleteTaskConfirmation() {
    const contents = (
          <div>
            <h3>Delete Task</h3>
            <p className={styles['confirm-dialog-text']}>Would you like to delete this task?</p>

            <div className={cx('pull-right', styles['tasks-confirm-buttons'])}>
              <Button className="green-btn" title="This task will be deleted" onClick={() => this.props.onDeleteClick(this.state.event.id)}>Delete</Button>
              <Button onClick={this.cancelSeriesAction} className={cx('white-btn', styles['series-confirm-cancel'])}>Cancel</Button>
            </div>
          </div>
      );
    return this.renderTasksConfirmation(contents);
  }

  renderUnscheduledTaskConfirmation() {
    const contents = (
      <div>
        <h3>Unscheduled Task</h3>
        <p className={styles['confirm-dialog-text']}>Are you sure that you would like to mark this Task as Unscheduled?</p>

        <div className={cx('pull-right', styles['tasks-confirm-buttons'])}>
          <Button className="green-btn" title="This task will be deleted" onClick={(event) => this.updateTask(event, false)}>Yes</Button>
          <Button onClick={this.cancelSeriesAction} className={cx('white-btn', styles['series-confirm-cancel'])}>Cancel</Button>
        </div>
      </div>
    );

    return this.renderTasksConfirmation(contents);
  }

  cancelSeriesAction(event) {
    event.preventDefault();
    event.stopPropagation();

    this.setState(Object.assign(this.state, {
      showTaskDuplicateConfirmation: false,
      showEditSeriesConfirmation: false,
      showDeleteSeriesConfirmation: false,
      showDeleteTaskConfirmation: false,
      showEditSeriesIndividualConfirmation: false,
      showUnscheduledTaskConfirmation: false,
      displayNotification: false
    }));
  }

  onDelete() {
    if (this.state.event.series_id) {
      this.setState(Object.assign(this.state, { showDeleteSeriesConfirmation: true, displayNotification: true }));
    } else {
      this.setState(Object.assign(this.state, { showDeleteTaskConfirmation: true, displayNotification: true }));
    }
  }

  formatDoubleDigitDate(value) {
    return value.toString().length === 1 ? '0'+value : value;
  }

  inputTimeStartChange(value) {
    const timeRegEx = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ?([aApP][mM])$/;
    const matchedGrups = timeRegEx.exec(value);
    if (matchedGrups) {
      let hrs = parseInt(matchedGrups[1]);
      let min = parseInt(matchedGrups[2]);
      let meridian = matchedGrups[3];

      let endTime_hrs;
      let endTime_mins;
      let endTime_meridian;
      endTime_hrs = hrs;
      endTime_mins = min;
      endTime_meridian = meridian;
      this.setTime(hrs, min, meridian, endTime_hrs, endTime_mins, endTime_meridian);
    }
  }

  inputTimeEndChange(value) {
    const timeRegEx = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ?([aApP][mM])$/;
    const matchedGrups = timeRegEx.exec(value);
    if (matchedGrups) {
      let hours = matchedGrups[1];
      let mins = matchedGrups[2];
      let meridian = matchedGrups[3];

      let startTime_hrs;
      let startTime_mins;
      let startTime_meridian;

      // If start time is not present set it to 1 hour less than end time.
      if (!this.state.start_time) {
        startTime_hrs = hours - 1;
        startTime_mins = mins;
        startTime_meridian = meridian;
      } else {
        startTime_hrs = this.state.start_time.hours;
        startTime_mins = this.state.start_time.mins;
        startTime_meridian = this.state.start_time.meridian;
      }

      //TODO: Fix this logic. We have put our customers in an infinite loop of fixing start time and end time
      /*const startDate = new Date(this.state.start_date);
      const endDate = new Date(this.state.end_date);
      // Make sure end time is less than start time and end time is not equal to start time.
      // If start and end date is present make sure start date is less than or equal to end date.
      if ((startDate.getTime() <= endDate.getTime()) || (!this.state.start_date && !this.state.end_date)) {
        let endTime = null;
        let startTime = null;
        let new_hours = null;

        // Convert 12 hour's time format to 24 hour's time format.
        if (startTime_meridian === 'PM') {
          new_hours = Number(startTime_hrs);
          startTime = new_hours + 12;
        } else {
          startTime = Number(startTime_hrs);
        }

        if (meridian === 'PM') {
          new_hours = Number(hours);
          endTime = new_hours + 12;
        } else {
          endTime = Number(hours);
        }

        // if start time found to be greater than or equal to end time, make it 1 hour less than end time.
        if (startTime >= endTime) {
          if (endTime === 0) {
            startTime = 11;
            startTime_hrs = 11;
          } else if (startTime === 0) {
            startTime = 11;
            startTime_hrs = 11;
          } else {
            startTime = hours - 1;
            startTime_hrs = hours - 1;
          }

          // Convert 24 hour's time format to 12 hour's time format and append respective merdian with it (for both start and end time).
          if (startTime_hrs > 12) {
            startTime_hrs -= 12;
            startTime_meridian = 'PM';
          } else if (startTime_hrs === 12) {
            startTime_meridian = 'PM';
          } else {
            startTime_meridian = 'AM';
          }

          if (hours >= 12) {
            hours = hours === 12 ? hours : hours - 12;
            meridian = 'PM';
          } else if (hours === 0) {
            meridian = 'AM';
          } else {
            meridian = 'AM';
          }

        }
      }*/

      // set updated time values in the state.
      this.setState({
        end_time: {
          hours: this.formatDoubleDigitDate(hours),
          mins: this.formatDoubleDigitDate(mins),
          meridian,
          notifications: []
        },
        start_time: {
          hours: this.formatDoubleDigitDate(startTime_hrs),
          mins: this.formatDoubleDigitDate(startTime_mins),
          meridian: startTime_meridian,
          notifications: []
        },
        displayNotification: false
      });
    }
  }

  renderValidationErrors() {
    if (!this.state.validationErrors || this.state.validationErrors.length == 0) {
      return null;
    }

    return <div className="alert alert-danger">
      {this.state.validationErrors.map((item) => <div>{item}</div>)}
    </div>
  }

  clearDateTimeFields() {
    if ((this.state.event.series_id && this.state.event.unscheduled) || (this.state.series_settings && this.state.series_settings.edit_series)) {
      this.setState({
        start_time: '',
        end_time: '',
        displayNotification: false,
      });
    } else {
      this.setState({
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        displayNotification: false
      });
    }
  }
  renderGroups() {
    let disableGroupClass = '';
    const renderedGroups = this.props.groups &&  this.props.groups.map((group) => {
      if (group.is_disabled && group.id === this.state.event.group_id) {
        disableGroupClass = styles.disableGroup;
      } else {
        disableGroupClass = '';
      }
      if (group.is_disabled && group.id !== this.state.event.group_id) {
        return null;
      }
      return (
        <option disabled={disableGroupClass}
                value={group.is_implicit ? '' : group.id}
                selected={(this.state.event.group_id !== null && typeof this.state.event.group_id !== 'undefined') ?
                    (group.id === this.state.event.group_id) :
                    (this.state.event.group_id === null) && group.is_implicit}
                className={disableGroupClass}>
            {group.name}
            </option>
      );
    });
    return renderedGroups;
  }

  handleGroupChange(e) {
    const value = e.target.value;

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

    const taskEntities = [];
    const taskResources = [];
    if (this.state.event && this.state.event.entity_ids.length > 0) {
      this.state.event.entity_ids.map((entity_id) => {
        let taskEntity = this.props.entities.find((entity) => {
          return entity.id === entity_id;
        });
        if (taskEntity) {
          if (!selectedGroupEntities.find((entity) => {
            return entity.id === taskEntity.id;
          })) {
            taskEntities.push(taskEntity);
          }
        }
      });
    }

    if (this.state.event && this.state.event.resource_ids.length > 0) {
      this.state.event.resource_ids.map((resource_id) => {
        let taskEquipment = this.props.equipments.find((equipment) => {
          return equipment.id === resource_id;
        });
        if (taskEquipment) {
          if (!selectedGroupEquipments.find((equipmet) => {
            return equipmet.id === taskEquipment.id;
          })) {
            taskResources.push(taskEquipment);
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
        selectedGroupEquipments,
        taskEntities,
        taskResources
      };
    });
  }

  setTimezones(timezones) {
    const event = $.extend(true, {}, this.state.event);
    event.start_datetime_timezone = timezones.start_timezone;
    event.end_datetime_timezone = timezones.end_timezone;
    this.setState({
      event
    });
  }

  render() {
    let startTimeElement;
    let endTimeElement;
    let doneFiles = null;
    let dropZoneOption = null;

    if (!this.state.fileUploader) {
      dropZoneOption = 'Attach a File';
    } else if (this.state.fileUploader) {
      dropZoneOption = 'Close Attaching Files';
    }

    if (this.state.filesFound) {
      doneFiles = this.state.filesFound.map((singleFile) => {
        const fileRemove = () => this.removeFile(this.state.event.id, singleFile.file_id, singleFile.filename);
        return (
          <div className={styles.attachmentBox}>
            <a href={singleFile.file_path} target="_blank">{singleFile.filename}</a>
            {(this.can_edit || this.can_create || (this.props.profile && this.props.profile.permissions.indexOf('COMPANY') !== -1)) &&
              <Button onClick={fileRemove} className={styles.closeBtn}><FontAwesomeIcon icon={faTimesCircle} /></Button>
            }
          </div>
          );
      });
    }


    if (browser() === 'Chrome' || browser() === 'Edge' || browser() === 'Opera') {

      let start = this.state.start_time.hours + ':' + this.state.start_time.mins + ' ' + this.state.start_time.meridian;
      let end = this.state.end_time.hours + ':' + this.state.end_time.mins + ' ' + this.state.end_time.meridian;

      if (this.state.start_time === '') {
        start = 'HH:MM AM';
      }

      if (this.state.end_time === '') {
        end = 'HH:MM AM';
      }

      startTimeElement = (
        <div className={styles['field-wrapper']}>
          <label>Start Time</label> <br />
          <TimePickerV4
            value={start}
            updateValue={(value) => {
              this.inputTimeStartChange(value)
            }}
            disabled={!this.can_edit}
            elId={Math.random().toString(36).substr(2, 16)}
          />
        </div>
      );
      endTimeElement = (
        <div className={styles['field-wrapper']}>
          <label>End Time</label> <br />
          <TimePickerV4
            value={end}
            updateValue={(value) => {
              this.inputTimeEndChange(value)
            }}
            disabled={!this.can_edit}
            elId={Math.random().toString(36).substr(2, 16)}
          />
        </div>);
    } else {

      let start = this.state.start_time.hours + ':' + this.state.start_time.mins + ' ' + this.state.start_time.meridian;
      let end = this.state.end_time.hours + ':' + this.state.end_time.mins + ' ' + this.state.end_time.meridian;

      if (this.state.start_time === '') {
        start = 'HH:MM AM';
      }

      if (this.state.end_time === '') {
        end = 'HH:MM AM';
      }

      startTimeElement = (
        <div className={styles['field-wrapper']}>
          <label>Start Time</label>
          <TimePickerV4
            value={start}
            updateValue={(value) => {
              this.inputTimeStartChange(value)
            }}
            disabled={!this.can_edit}
            elId={Math.random().toString(36).substr(2, 16)}
          />
        </div>);
      endTimeElement = (
        <div className={styles['field-wrapper']}>
          <label>End Time</label>
          <TimePickerV4
            value={end}
            updateValue={(value) => {
              this.inputTimeEndChange(value)
            }}
            disabled={!this.can_edit}
            elId={Math.random().toString(36).substr(2, 16)}
          />
        </div>);

    }

    const { title, details, entity_ids, resource_ids,
        customer_first_name, customer_last_name, customer_email, customer_company_name, customer_address_line_1,
        customer_address_line_2, customer_city, customer_state, customer_country, customer_zipcode, customer_phone,
        customer_mobile_number, customer_id, notifications, enable_time_window_display, time_window_start,
        use_assignee_color, unscheduled, template, additional_addresses, entity_confirmation_statuses, route_id } = this.state.event,
      onChange = (name) => {
        return (event) => {
          let value = event;
          if (event.target) {
            value = event.target.value;
          }
          this.onChange(name, value);
        };
      };

    const { start_date, end_date, start_time, end_time, task_color } = this.state;
    let savingSpinnerTitle = '';

    if (this.props.severActionType === 'ADD' || this.props.severActionType === 'UPDATE' ) {
      savingSpinnerTitle = 'Saving';
    } else if (this.props.severActionType === 'DELETE') {
      savingSpinnerTitle = 'Deleting';
    } else if (this.props.severActionType === 'UPLOAD') {
      savingSpinnerTitle = 'Uploading Files';
    } else if (this.state.attachmentSeverActionType === 'UPLOADING') {
      savingSpinnerTitle = 'Uploading Files';
    }

    const taskDetailsSectionWidth = this.can_view_task_full_details ? 7 : 12;
    const taskTitleWidth = this.can_view_task_full_details ? 8 : 6;
    const taskTitleWidthIfRouteID = this.can_view_task_full_details ? 12 : 6;
    const RouteIDWidth = this.can_view_task_full_details ? 4 : 6;
    const newDateTime = this.generateDatetime(this.state);

    const showSeriesEdit = this.props.newEventIsRecurring || this.state.event.series_id != null;

    let selectedGroup = null;
    if (typeof this.props.groups !== 'undefined' && this.props.groups !== null && this.props.groups.length > 0) {
        selectedGroup = this.props.groups.find((el) => { return (this.state.event && this.state.event.group_id) ? el.id === Number(this.state.event.group_id) : el.is_implicit; })
    }
    let showStarTimezone = false;
    let showEndTimezone = false;
    let start_time_zone = null;
    let end_time_zone = null;
    const groupTimezone = (typeof selectedGroup !== 'undefined' && selectedGroup !== null) ? selectedGroup.timezone : null;
    const companyTimezone = typeof this.props.profile !== 'undefined' ? this.props.profile.timezone : null;
    const entityGroupTimezone = typeof this.props.profile !== 'undefined' ? this.props.profile.group_timezone : null;
    const timezones = getTimezoneOptions();
    if (this.state.event.start_datetime_timezone !== null) {
      const startDateTZ = timezones.find(el => { return el.value === this.state.event.start_datetime_timezone });
      start_time_zone = typeof startDateTZ !== 'undefined' ? startDateTZ.label : this.state.event.start_datetime_timezone;
      if (((groupTimezone && this.state.event.start_datetime_timezone === groupTimezone) ||
        (companyTimezone && this.state.event.start_datetime_timezone === companyTimezone) ||
        (entityGroupTimezone && this.state.event.start_datetime_timezone === entityGroupTimezone)) &&
        !isTimezonesOffsetEqual(this.state.event.start_datetime_timezone, moment.tz.guess())) {
        showStarTimezone = true;
      } else if (this.state.event.start_datetime_timezone !== groupTimezone && this.state.event.start_datetime_timezone !== companyTimezone
        && this.state.event.start_datetime_timezone !== entityGroupTimezone) {
        showEndTimezone = true;
      }
    } else if (this.state.event.start_datetime_timezone === null) {
      if (groupTimezone !== null) {
        if (!isTimezonesOffsetEqual(groupTimezone, moment.tz.guess())) {
          const groupTZ = timezones.find(el => { return el.value === groupTimezone });
          showStarTimezone = true;
          start_time_zone = typeof groupTZ !== 'undefined' ? groupTZ.label : groupTimezone;
        }
      } else if (groupTimezone === null && companyTimezone !== null) {
        if (!isTimezonesOffsetEqual(companyTimezone, moment.tz.guess())) {
          const companyTZ = timezones.find(el => { return el.value === companyTimezone });
          showStarTimezone = true;
          start_time_zone = typeof companyTZ !== 'undefined' ? companyTZ.label : companyTimezone;
        }
      } else if (groupTimezone === null && companyTimezone === null && entityGroupTimezone !== null) {
        if (!isTimezonesOffsetEqual(entityGroupTimezone, moment.tz.guess())) {
          const entityGroupTZ = timezones.find(el => { return el.value === entityGroupTimezone });
          showStarTimezone = true;
          start_time_zone = typeof entityGroupTZ !== 'undefined' ? entityGroupTZ.label : entityGroupTimezone;
        }
      }
    }

    if (this.state.event.end_datetime_timezone !== null) {
      const endDateTZ = timezones.find(el => { return el.value === this.state.event.end_datetime_timezone });
      end_time_zone = typeof endDateTZ !== 'undefined' ? endDateTZ.label : this.state.event.end_datetime_timezone;
      if (((groupTimezone && this.state.event.end_datetime_timezone === groupTimezone) ||
        (companyTimezone && this.state.event.end_datetime_timezone === companyTimezone) ||
        (entityGroupTimezone && this.state.event.end_datetime_timezone === entityGroupTimezone)) &&
        !isTimezonesOffsetEqual(this.state.event.end_datetime_timezone, moment.tz.guess())) {
        showEndTimezone = true;
      } else if (this.state.event.end_datetime_timezone !== groupTimezone && this.state.event.end_datetime_timezone !== companyTimezone
        && this.state.event.end_datetime_timezone !== entityGroupTimezone) {
        showEndTimezone = true;
      }
    } else if (this.state.event.end_datetime_timezone === null && start_time_zone !== null) {
      end_time_zone = start_time_zone;
      showEndTimezone = true;
    }

    if (showStarTimezone || showEndTimezone) {
      showStarTimezone = true;
      showEndTimezone = true;
    }

    let showGroupDropdown = false;
    if (this.props.groups && (this.props.groups.find((group) => { return group.is_implicit; })) && this.props.groups.length > 1 && this.props.groups.find((group) => { return !group.is_disabled && !group.is_implicit; })) {
      showGroupDropdown = true;
    } else if (this.props.groups && !(this.props.groups.find((group) => { return group.is_implicit; })) && this.props.groups.length > 0 && this.props.groups.find((group) => { return !group.is_disabled; })) {
      showGroupDropdown = true;
    }

    let group_id = this.state.event.group_id;
    if (!this.can_add_group && this.props.profile && this.props.profile.group_id) {
      group_id = this.props.profile.group_id;
    }

    const selectedEntityIds = this.state.event.entity_ids;
    const selectedEntities = this.props.entities && selectedEntityIds && this.props.entities.filter((entity) => {
      return selectedEntityIds.find((entityId) => { return entity.id === entityId; });
    });
    const showEntityGroupError = selectedEntities.find((entity) => {
      if (!this.can_add_group || group_id === '-1') {
        return false;
      } else if ((group_id === '' || group_id === null) && entity.group_id !== null) {
        return true;
      } else if (group_id !== '' && group_id !== null && entity.group_id !== Number(group_id)) {
        return true;
      }
      return false;
    });

    const selectedEquipmentIds = this.state.event.resource_ids;
    const selectedEquipments = this.props.equipments && selectedEquipmentIds && this.props.equipments.filter((equipment) => {
      return selectedEquipmentIds.find((equipmentId) => { return equipment.id === equipmentId; });
    });
    const showEquipmentGroupError = selectedEquipments.find((equipment) => {
      if (!this.can_add_group || group_id === '-1') {
        return false;
      } else if ((group_id === '' || group_id === null) && equipment.group_id !== null) {
        return true;
      } else if (group_id !== '' && group_id !== null && equipment.group_id !== Number(group_id)) {
        return true;
      }
      return false;
    });

    return (
      <form onSubmit={this.updateTask} className={styles.form}>
        {this.state.showTaskDuplicateConfirmation && this.renderTaskDuplicateConfirmation()}
        {this.state.showEditSeriesConfirmation && this.renderEditSeriesConfirmation()}
        {this.state.showDeleteSeriesConfirmation && this.renderDeleteSeriesConfirmation()}
        {this.state.showEditSeriesIndividualConfirmation && this.renderEditSeriesIndividualConfirmation()}
        {this.state.showDeleteTaskConfirmation && this.renderDeleteTaskConfirmation()}
        {this.state.showUnscheduledTaskConfirmation && this.renderUnscheduledTaskConfirmation()}
        <Grid>
          <fieldset className={styles['formset-block']}>
            <Row className={styles['task-details']}>
              <Col lg={taskDetailsSectionWidth} md={taskDetailsSectionWidth} sm={12}>
                <Row className={styles['left-part']}>

                  <Col md={route_id ? taskTitleWidth:taskTitleWidthIfRouteID} sm={route_id ? taskTitleWidth:taskTitleWidthIfRouteID} xs={12}>
                    <FieldGroup id="task-title" label="Task Title"
                                onChange={onChange('title')} name="taks-title" value={title} placeholder='Customer Appointment Title' disabled={!this.can_edit}/>
                  </Col>
                    { route_id &&
                    <Col md={RouteIDWidth} sm={RouteIDWidth} xs={12}>
                      <FieldGroup id="Route-ID" label="Route ID"
                                  onChange={onChange('route_id')} name="Route-ID" value={route_id} placeholder='Route ID' disabled/>
                    </Col>
                    }
                  {this.can_add_group && showGroupDropdown &&
                  <Col md={12} sm={12} xs={12}>
                    <div className={styles["task-type-block"]}>
                      <h5 className={styles.groupsHeading}>Group</h5>
                      <FormGroup controlId="formControlsSelect">
                        <FormControl onChange={(e) => this.handleGroupChange(e)}
                                     componentClass="select" placeholder="select" disabled={!this.can_edit}>
                            {(this.state.event && this.state.event.group_id === '-1') && <option value={-1}>Select a Group</option>}
                          {this.renderGroups()}
                        </FormControl>
                      </FormGroup>
                    </div>
                  </Col>}
                  {!this.can_view_task_full_details && <Col md={6} sm={6} xs={12}>
                    <FieldGroup id="task-color" label="Task Color" componentClass={ColorField}
                                onChange={onChange('task_color')} value={task_color} name="task-color"
                                groupClassName={styles['task-color-group']} canChangeColor={false}/>
                  </Col>
                  }
                  {this.can_view_task_full_details &&
                  <Col md={12} sm={12} xs={12}>

                    <Checkbox className={styles['use-assignee-color-checkbox']}
                              onChange={this.onUnscheduledTaskSelectionChange} checked={unscheduled} disabled={!this.can_edit}>
                      Unscheduled Task
                    </Checkbox>

                    {unscheduled &&
                      <p>When a task is marked as unscheduled Arrivy only shares the day of the task with the customer via email & sms if provided. If date isn't provided we will send a confirmation email without a date or time of the task.
                        {this.can_edit && <Button className={styles.clearFieldsButton} onClick= {() => this.clearDateTimeFields()}>Clear Date/Time Fields</Button>}
                      </p>
                    }
                  </Col>
                  }
                  <Col md={12} sm={12} xs={12}>
                    <Row className={styles['date-time-block']}>
                      <Col lg={5} md={7} sm={7} xs={12}>
                        <Row className={styles.datetimeClass}>
                          <Col lg={6} md={6} xs={6}>
                            <div className={styles['field-wrapper']}>
                              <FieldGroup id="start-date" label="Start Date" componentClass={DatePicker} disabled={((this.state.series_settings && this.state.series_settings.edit_series) || !this.can_edit) ? true : false}
                                          onChange={this.onStartDateChange} showClearButton={false} ref="start_date" name="start-date" value={this.state.start_date}/>
                              <FontAwesomeIcon icon={faCalendar} className={styles['fa-icon']}/>
                            </div>
                          </Col>
                          <Col lg={6} md={6} xs={6}>
                            <div className={styles['field-wrapper']}>
                              <FieldGroup id="end-date" label="End Date" componentClass={DatePicker} disabled={!this.can_edit ? true : false}
                                          onChange={this.onEndDateChange} showClearButton={false} name="end-date" ref="end_date" value={this.state.end_date}/>
                              <FontAwesomeIcon icon={faCalendar} className={styles['fa-icon']}/>
                            </div>
                          </Col>
                        </Row>
                      </Col>
                      <Col lg={5} md={5} sm={5} xs={12}>
                        <Row className={styles.datetimeClass}>
                          <Col lg={6} md={6} xs={6}>
                            <Row>
                              <Col md={12}>
                                {startTimeElement}
                              </Col>
                            </Row>
                            <Row>
                              <Col md={12}>
                                { showStarTimezone && <p className={styles.timezoneString}>{start_time_zone}</p> }
                              </Col>
                            </Row>
                          </Col>
                          <Col lg={6} md={6} xs={6}>
                            <Row>
                              <Col md={12}>
                                {endTimeElement}
                              </Col>
                            </Row>
                            <Row>
                              <Col md={12}>
                                { showEndTimezone && <p className={styles.timezoneString}>{end_time_zone}</p> }
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Col>
                      <Col lg={2} md={12} xs={12}>
                        <TimezoneSelector
                          setTimezoneValues={(values) => { this.setTimezones(values); }}
                          event={this.state.event}
                          profile={this.props.profile}
                          group={this.props.groups  && this.props.groups.find((group) => {
                            return this.state.event && this.state.event.group_id ? (Number(this.state.event.group_id) === group.id) : (group.is_implicit);
                          })}
                          disabled={!this.can_edit}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md={12} sm={12} xs={12}>
                    <Row>
                      <Col md={6} sm={12}>
                        <div className={styles['assignees-block']}>
                          <FieldGroup
                            label="Assignee(s)"
                            ref="crewSelector"
                            name="crew-selector"
                            updateEntities={onChange('entity_ids')}
                            componentClass={CrewSelectorV2}
                            allEntities={this.state.selectedGroupEntities}
                            entitiesSelected={this.state.taskEntities}
                            entities={entity_ids}
                            placeholder="Assign team member"
                            startDate={newDateTime.start_datetime}
                            endDate={newDateTime.end_datetime}
                            getSchedule={this.props.getSchedule}
                            unscheduled={unscheduled}
                            entity_confirmation_statuses={entity_confirmation_statuses}
                            profile={this.props.companyProfile}
                            canEdit={this.can_edit}
                            canViewTeamConfirmation={(this.props.selectedEvent && typeof this.props.selectedEvent.id !== 'undefined') ? this.can_view_team_confirmation : false}
                            elId={Math.random().toString(36).substr(2, 16)}
                            placeholderImage={'/images/user.png'}
                            group_id={group_id}
                            groups={this.props.groups}
                            showGroup={showGroupDropdown}
                          />
                        </div>
                        {showEntityGroupError &&
                        <div className={styles.groupErrorText}>
                          <p>Some Assignees do not belong to selected Group</p>
                        </div>}
                      </Col>
                      <Col md={6} sm={12}>
                        <div>
                          <FieldGroup
                            label="Equipment(s)"
                            ref="equipmentSelector"
                            name="equipment-selector"
                            updateEntities={onChange('resource_ids')}
                            componentClass={CrewSelectorV2}
                            allEntities={this.state.selectedGroupEquipments}
                            entitiesSelected={this.state.taskResources}
                            entities={resource_ids}
                            placeholder="Assign equipment"
                            startDate={newDateTime.start_datetime}
                            endDate={newDateTime.end_datetime}
                            idsPath='resource_ids'
                            getSchedule={this.props.getSchedule}
                            disableColors={true}
                            unscheduled={unscheduled}
                            canEdit={this.can_edit}
                            elId={Math.random().toString(36).substr(2, 16)}
                            placeholderImage={'/images/equipment.png'}
                            group_id={group_id}
                            groups={this.props.groups}
                            showGroup={showGroupDropdown}
                          />
                        </div>
                        {showEquipmentGroupError &&
                        <div className={styles.groupErrorText}>
                          <p>Some Equipments do not belong to selected Group</p>
                        </div>}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
              {this.can_view_task_full_details &&
              <Col lg={5} md={5} sm={12}>
                <label className={styles['task-options-label']}>Task options</label>
                <div className={styles['task-options']}>
                  <div className={styles['task-options-wrapper']}>
                    <div className={styles['task-color-block']}>
                      <FieldGroup id="task-color" label="Task Color" componentClass={ColorField}
                                  onChange={onChange('task_color')} value={task_color} name="task-color"
                                  groupClassName={styles['task-color-group']} canChangeColor={this.can_edit}/>
                      <Checkbox className={styles['use-assignee-color-checkbox']}
                                onChange={this.onUseAssigneeColorChange} checked={use_assignee_color} disabled={!this.can_edit}>
                        Use assignee color
                      </Checkbox>
                    </div>
                    <div className={styles["time-window-block"]}>
                      <h5>Arrival window</h5>
                      <div className={styles['time-window-group']}>
                        <Checkbox inline className={styles['time-window-checkbox']} onChange={this.onEnableTimeWindow}
                                  checked={enable_time_window_display} disabled={!this.can_edit}>
                          Use arrival window of Start Time +
                        </Checkbox>
                        {this.renderDropDown((enable_time_window_display && this.can_edit), time_window_start, onChange)}
                        <span className={styles['time-window-text']}>
                          for customer communications
                        </span>
                        {this.renderTimeWindowIfNeeded((enable_time_window_display && this.can_edit), newDateTime.start_datetime, time_window_start, newDateTime.end_datetime)}
                      </div>
                    </div>
                    <div className={styles["task-type-block"]}>
                      <h5>Task Type</h5>
                      <FormGroup controlId="formControlsSelect">
                        <FormControl defaultValue={template} onChange={(e) => this.handleTaskTemplateChange(e)}
                                     componentClass="select" placeholder="select" disabled={!this.can_edit}>
                          <option value="DEFAULT">Select a template</option>
                          {this.renderTasksTemplates()}
                        </FormControl>
                      </FormGroup>
                    </div>
                    {/*<div>
                      <h5>Source URL</h5>
                      <FieldGroup id="source-url"
                                  onChange={onChange('external_url')} name="source-url" value={external_url}
                                  placeholder="Source URL" disabled={!this.can_edit}/>
                    </div>*/}
                  </div>
                </div>
              </Col>
              }
            </Row>
          </fieldset>

          {this.can_view_task_full_details && showSeriesEdit == true &&(
            <div className={[styles['inverse-color'], styles['formset-block'], styles['edit-service']].join(' ')}>
              <Row>
                <Col md={12} sm={12}>
                  <TaskFormSeries
                    onChange={this.onSeriesSettingsChange}
                    seriesSettings={this.state.series_settings}
                    recurringEnable = {this.props.newEventIsRecurring}
                    getTaskSeriesSettings={this.getTaskSeriesSettings}
                    onSeriesEndsOnFocus={this.onSeriesEndsOnFocus}
                    canEdit={this.can_edit}
                  />
                </Col>
              </Row>
            </div>
          )}

        <div className={[styles['formset-block'], styles['customer-details']].join(' ')}>
          <CustomerFormBody ref="customer"
            customer_first_name={defaultValue(customer_first_name)} customer_last_name={defaultValue(customer_last_name)}
            customer_email={defaultValue(customer_email)} customer_company_name={defaultValue(customer_company_name)}
            customer_address_line_1={defaultValue(customer_address_line_1)} customer_address_line_2={defaultValue(customer_address_line_2)}
            customer_city={defaultValue(customer_city)} customer_state={defaultValue(customer_state)} customer_country={defaultValue(customer_country)}
            customer_zipcode={defaultValue(customer_zipcode)} customer_phone={defaultValue(customer_phone)}
            customer_mobile_number={defaultValue(customer_mobile_number)} customer_id={customer_id}
            additional_addresses={additional_addresses} additionalAddressesUpdateCallback={this.additionalAddressesUpdateCallback}
            getCustomers={this.props.getCustomers} searchCustomers={this.props.searchCustomers}  createCustomer={this.props.createCustomer} onCustomerChange={this.onMultipleChange} onSinglePropertyChange={this.onChange}
            canViewTaskFullDetails={this.can_view_task_full_details} canEdit={this.can_edit}/>
          {this.can_view_task_full_details && <Notifications
            canEdit={this.can_edit}
            notifications={notifications ? notifications : {}}
            onChange={this.onChange}
            className={styles['notifications']}
            companyProfile={ this.props.companyProfile}
            options = {[
                  { type : 'email', label: 'Email notification', fieldInfo:'Email notifications will be sent on task creation, when task assignee is on way and task completion to leave the review' },
                  { type : 'sms', label: 'SMS notification', fieldInfo:'SMS notifications will be sent on task creation, when task assignee is on way and task completion to leave the review' }
            ]}
          />}
        </div>

        <fieldset className={[styles['inverse-color'], styles['formset-block'], styles['instructions']].join(' ')}>
          <Row>
            <Col md={6} sm={12}>
              <FieldGroup id="instructions" componentClass="textarea" label="Instructions"
                          onChange={onChange('details')} name="instructions" rows={12} value={defaultValue(details)} disabled={!this.can_edit}/>
            </Col>
            <Col md={6} sm={12}>
                <ExtraFields canEdit={this.can_edit} canViewTaskFullDetails={this.can_view_task_full_details} className={[styles['formset-block'], styles['add-fields-block']].join(' ')} fields={this.state.fields} onChange={onChange('fields')} restrictOptions options={this.props.extraFieldsOptions}/>
            </Col>
          </Row>
        </fieldset>
          {this.props.selectedEvent && this.props.selectedEvent.id && this.props.items && this.props.items.length > 0 &&
            <section>
              <Row>
                <Col md={6} sm={12} xs={12}>
                  <h3 className={styles.taskAttachments}>Products</h3>
                </Col>
              </Row>
              <Row className={styles.taskItemsList}>
                <TaskProducts products={this.props.items} slidesToShow={3} slidesToScroll={3} showProductStatus showProductsType showFullDetails/>
              </Row>
            </section>
          }

          <section className={cx("animated fadeIn", styles["filesSection"])}>
            <Row>
              <Col md={6} sm={12} xs={12}>
                <h3 className={styles.taskAttachments}>Files</h3>
                {(this.can_edit || this.can_create || (this.props.profile && this.props.profile.permissions.indexOf('COMPANY') !== -1)) &&
                <Button bsStyle="link" className={styles['file-upload-link']}  onClick={this.updateImageClick}>
                  <Glyphicon glyph="paperclip" /> {dropZoneOption}
                </Button>
                }
              </Col>
              <Col md={12} sm={12} xs={12}>
                {doneFiles}
              </Col>
            </Row>
          </section>
        {this.state.fileUploader &&
          <div id="uploadFile">
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
                          <button onClick={(e) => this.uploadFilesAgain(file, e)} className={styles.retryBtn}><FontAwesomeIcon icon={faSync} /></button>
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
          </div>

        }
        {this.state.fileUploader && this.renderFileUploadAreaForLowRes()}
        <Row className={[styles['formset-block'], styles['buttons-block']].join(' ')}>
          <Col md={this.props.pageView ? 3 : 4} sm={12} xs={12} className="text-right">
            <div className={styles.formAlerts}>
              {(this.props.serverActionPending || this.state.attachmentServerActionPending) &&
                <SavingSpinner title={savingSpinnerTitle} borderStyle="none" />
              }
            </div>
          </Col>
          <Col md={this.props.pageView ? 9 : 8} sm={12} xs={12} className={this.state.displayNotification ? cx(['text-right'], styles.taskFromButtons) : "text-right"}>
            { (this.props.selectedEvent && typeof this.props.selectedEvent.id !== 'undefined' &&  this.can_create && this.can_edit) && (
              <Button
                className={styles['duplicate-button']}
                onClick={(event) => this.updateTask(event, true)}
                disabled={this.props.serverActionPending || this.state.attachmentServerActionPending}
              >
                Duplicate task
              </Button>
            )}
            { (this.props.selectedEvent && !this.props.importing  && typeof this.props.selectedEvent.id !== 'undefined' && this.props.selectedEvent.id !== null && this.can_delete)
              ?
              <Button
                className={styles['delete-button']}
                onClick={this.onDelete}
                disabled={this.props.serverActionPending || this.state.attachmentServerActionPending}
              >
                Delete
              </Button>
              :
              null
            }
            {this.props.importing && (
              <Button bsStyle="link" onClick={() => this.props.skipEvent(this.state.event.index)}>
                Skip
              </Button>
            )}
            {(!this.props.importing && !this.props.pageView) && (
              <Button
                className={styles['cancel-button']}
                bsStyle="link" onClick={this.props.onCancelClick}
                disabled={this.props.serverActionPending || this.state.attachmentServerActionPending}
              >
                Cancel
              </Button>
            )}
            { (((this.props.selectedEvent) && (this.can_edit)) || (this.can_create) || (this.props.importing)) && (
              <Button
                disabled={this.props.serverActionPending || this.state.attachmentServerActionPending}
                className="btn-submit"
                onClick={this.updateTask}
              >
                Save Changes
              </Button>
            )}
          </Col>
        </Row>
      </Grid>
    </form>);
  }
}

TaskForm.propTypes = {
  createCustomer: PropTypes.func.isRequired,
  entities: PropTypes.array.isRequired,
  equipments: PropTypes.array.isRequired,
  error: PropTypes.string,
  extraFieldsOptions: PropTypes.array.isRequired,
  getCustomers: PropTypes.func.isRequired,
  searchCustomers: PropTypes.func.isRequired,
  getSchedule: PropTypes.func.isRequired,
  importing: PropTypes.bool,
  onCancelClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onSaveClick: PropTypes.func.isRequired,
  pageView: PropTypes.bool,
  selectedEvent: PropTypes.object,
  serverActionComplete: PropTypes.bool,
  serverActionPending: PropTypes.bool,
  severActionType: PropTypes.string,
  skipEvent: PropTypes.func,
  newEventDate: PropTypes.object,
  newEventEndDate: PropTypes.object,
  newEventIsRecurring: PropTypes.bool,
  getTaskSeriesSettings: PropTypes.func.isRequired,
  filesFail: PropTypes.bool,
  actulaFailedFiles: PropTypes.array,
  failedUploadCallback: PropTypes.func,
  unscheduled: PropTypes.bool,
  templates: PropTypes.array,
  handleTaskTypeChange: PropTypes.func,
//   createEntity: PropTypes.func.isRequired
  defaultTemplate: PropTypes.object,
  companyProfile: PropTypes.object,
  fileUploadingPending: PropTypes.func,
  fileUploadingComplete: PropTypes.func,
  items: PropTypes.array
};
