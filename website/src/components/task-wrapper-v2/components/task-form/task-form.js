import React, { Component } from 'react';
import style from '../../base-styling.module.scss';
import styles from './task-form.module.scss';
import cx from 'classnames';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import Task from '../task/task';
import AssigneesEquipment from '../assignees-equipment/assignees-equipment';
import Recurrence from '../recurrence/recurrence';
import CustomerDetails from '../customer-details/customer-details';
import Address from '../address/address';
import Instructions from '../instructions/instructions';
import Equalizer from 'react-equalizer';
import moment from "moment-timezone";
import {DEFAULT_COLORPICKER_COLOR} from "../../../fields/color-field";
import $ from "jquery";
import {getErrorMessage} from "../../../../helpers/task";
import TaskProducts from "../../../task-products/task-products";
import {getAllTaskFiles, getTaskFileAttachmentUploadURL, removeTaskFile, uploadAttachment, getAllTaskDocuments} from "../../../../actions";
import {FieldGroup} from "../../../fields";
import CrewSelectorV2 from "../../../crew-selector/crew-selector";
import {getTimezoneOptions, isTimezonesOffsetEqual } from "../../../../helpers";
import {TASK_ATTRIBUTES } from "../../../../helpers/keys";
import {toast} from "react-toastify";
import SavingSpinner from '../../../saving-spinner/saving-spinner';

const defaultValue = (value, byDefault = '') => {
  return value ? value : byDefault;
};

const browser = () => {
  // Opera 8.0+
  const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

  // Firefox 1.0+
  const isFirefox = typeof InstallTrigger !== 'undefined';

  // Safari 3.0+ "[object HTMLElementConstructor]"
  const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) {
    return p.toString() === '[object SafariRemoteNotification]';
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
};
const MAX_ALLOWED_REPEAT_OCCURENCES = 48;
const MAX_ALLOWED_RECURRING_DURATION_IN_MONTHS = 12;

export default class TaskForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      event: {
        additional_addresses: null,
        customer_address: '',
        customer_address_line_1: null,
        customer_address_line_2: null,
        customer_city: null,
        customer_company_name: null,
        customer_country: null,
        customer_email: null,
        customer_exact_location: null,
        customer_first_name: null,
        customer_id: null,
        customer_last_name: '',
        customer_mobile_number: null,
        customer_name: '',
        customer_notes: '',
        customer_phone: null,
        customer_state: null,
        customer_timezone: null,
        customer_zipcode: null,
        details: null,
        enable_time_window_display: false,
        end_datetime: null,
        end_datetime_timezone: null,
        entity_ids: [],
        extra_fields: {},
        file_ids: [],
        group_id: -1,
        notifications: { email: true, sms: true },
        resource_ids: [],
        start_datetime: null,
        start_datetime_timezone: null,
        task_time: null,
        template: null,
        time_window_start: 0,
        title: '',
        unscheduled: false,
        use_assignee_color: false,
        duration: '01 hr',
        document_ids: []
      },
      number_of_workers_required: 0,
      customers: [],
      error: null,
      sendingCustomer: false,
      emptyLabel: 'Please enter at least 3 characters',
      task_group_id: null,
      prev_startDate: null,
      prev_endDate: null
    };
    this.getNodes = this.getNodes.bind(this);
    this.InitializeDateTime = this.InitializeDateTime.bind(this);
    this.extractTime = this.extractTime.bind(this);
    this.formatTime = this.formatTime.bind(this);
    this.setEventState = this.setEventState.bind(this);
    this.setTaskFormState = this.setTaskFormState.bind(this);
    this.getFirstAssigneeColor = this.getFirstAssigneeColor.bind(this);
    this.clearDateTimeFields = this.clearDateTimeFields.bind(this);
    this.onStartDateChange = this.onStartDateChange.bind(this);
    this.onEndDateChange = this.onEndDateChange.bind(this);
    this.setTime = this.setTime.bind(this);
    this.inputTimeStartChange = this.inputTimeStartChange.bind(this);
    this.inputTimeEndChange = this.inputTimeEndChange.bind(this);
    this.setTimezones = this.setTimezones.bind(this);
    this.onEnableTimeWindow = this.onEnableTimeWindow.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onMultipleChange = this.onMultipleChange.bind(this);
    this.additionalAddressesUpdateCallback = this.additionalAddressesUpdateCallback.bind(this);
    this.createCustomer = this.createCustomer.bind(this);
    this.updateCustomer = this.updateCustomer.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.updateImageClick = this.updateImageClick.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.showUploadedFiles = this.showUploadedFiles.bind(this);
    this.uploadTaskAttachments = this.uploadTaskAttachments.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.uploadFilesOnServer = this.uploadFilesOnServer.bind(this);
    this.closeImage = this.closeImage.bind(this);
    this.getPreview = this.getPreview.bind(this);
    this.uploadFilesAgain = this.uploadFilesAgain.bind(this);
    this.uploadSingleFile = this.uploadSingleFile.bind(this);
    this.updateImagesDisplay = this.updateImagesDisplay.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.getFilePreview = this.getFilePreview.bind(this);
    this.getTaskSeriesSettings = this.getTaskSeriesSettings.bind(this);
    this.onSeriesEndsOnFocus = this.onSeriesEndsOnFocus.bind(this);
    this.setSeriesState = this.setSeriesState.bind(this);
    this.handleGroupChange = this.handleGroupChange.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.cancelSeriesAction = this.cancelSeriesAction.bind(this);
    this.updateTask = this.updateTask.bind(this);
    this.runValidations = this.runValidations.bind(this);
    this.onDurationChange = this.onDurationChange.bind(this);
    this.convertToMoment = this.convertToMoment.bind(this);
    this.handleTimeZoneForDuration = this.handleTimeZoneForDuration.bind(this);
    this.updateDuration = this.updateDuration.bind(this);
    this.changeWorkersRequired = this.changeWorkersRequired.bind(this);
    this.updateTemplateExtraFields = this.updateTemplateExtraFields.bind(this);
    this.getTemplateDocuments = this.getTemplateDocuments.bind(this);
    this.showAttchedDocuments = this.showAttchedDocuments.bind(this);
    this.formatDuration = this.formatDuration.bind(this);
    this.getTemplateDuration = this.getTemplateDuration.bind(this);
  }

  componentDidMount() {
    this.getCustomers(true);
  }

  updateTemplateExtraFields(selectedTemplate, event = this.state.event) {
    let templateFields = [];
    if (selectedTemplate) {
      templateFields = $.extend(true, [], selectedTemplate.extra_fields);
    }
    if (event && event.template_extra_fields && templateFields) {
      templateFields.map((extra_field) => {
        const indexInOldTemplateFields = event.template_extra_fields && event.template_extra_fields.findIndex((old_extra_field) => {
          return (old_extra_field.name === extra_field.name && old_extra_field.type.toUpperCase() === extra_field.type.toUpperCase());
        });
        if (indexInOldTemplateFields > -1) {
          extra_field.value = event.template_extra_fields[indexInOldTemplateFields].value;
        } else {
          extra_field.value = '';
        }
      })
    }
    return templateFields;
  }

  getTemplateDocuments(selectedTemplate) {
    if (this.props.companyProfile && this.props.companyProfile.is_documents_disabled === false) {
      let templateDocumentIds = [];
      if (selectedTemplate) {
        templateDocumentIds = $.extend(true, [], selectedTemplate.document_ids);
      }
      return templateDocumentIds;
    }
    return [];
  }

  formatDuration(duration) {
    let hrs;
    let mins;
    let formatedDuration = '';

    hrs = Math.floor((duration / 60));
    mins = duration % 60;

    if (hrs && mins) {
      formatedDuration = this.formatDoubleDigitDate(hrs) + (hrs > 1 ? ' hrs ' : ' hr ') + this.formatDoubleDigitDate(mins) + (mins > 1 ? ' mins' : ' min');
    } else if (mins) {
      formatedDuration = this.formatDoubleDigitDate(mins) + (mins > 1 ? ' mins' : ' min');
    } else if (hrs) {
      formatedDuration = this.formatDoubleDigitDate(hrs) + (hrs > 1 ? ' hrs ' : ' hr ');
    }
    return formatedDuration.trim();
  }

  getTemplateDuration(selectedTemplate) {
    let duration = '01 hr';
    if (selectedTemplate && selectedTemplate.duration) {
      duration = selectedTemplate.duration;
      duration = this.formatDuration(duration);
    }
    return duration;
  }

  componentWillMount() {
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
    const selectedGroup = this.props.groups && this.props.groups.find((group) => {
      return event && (event.group_id ? (event.group_id === group.id) : (group.is_implicit));
    });

    let task_group_id = event && event.group_id;

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
          if (!selectedGroupEquipments.find((equipment) => {
            return equipment.id === taskEquipment.id;
          })) {
            taskResources.push(taskEquipment);
          }
        }
      });
    }
    let time_duration = '01 hr';
    if (event && event.duration) {
      time_duration = this.formatDuration(event.duration);
    }
    const email = (!this.props.companyProfile || !this.props.companyProfile.task_notifications_settings ||
      typeof this.props.companyProfile.task_notifications_settings.email === 'undefined' ||
      this.props.companyProfile.task_notifications_settings.email === null)
      ? true : this.props.companyProfile.task_notifications_settings.email;
    const sms = (!this.props.companyProfile || !this.props.companyProfile.task_notifications_settings ||
      typeof this.props.companyProfile.task_notifications_settings.sms === 'undefined' ||
      this.props.companyProfile.task_notifications_settings.sms === null)
      ? true : this.props.companyProfile.task_notifications_settings.sms;
    const selectedEvent = this.props.selectedEvent ? $.extend(true, {}, this.props.selectedEvent) : null;

    const templateId = selectedEvent && selectedEvent.template;
    const selectedTemplate = this.props.templates && this.props.templates.find((template) => {
      return (templateId) ? template.id === templateId : template.is_default;
    });

    let number_of_workers_required = 0;
    const templateFields = this.updateTemplateExtraFields(selectedTemplate, selectedEvent);
    const templateDocumentIds = this.getTemplateDocuments(selectedTemplate);
    let default_color = DEFAULT_COLORPICKER_COLOR;
    if (selectedTemplate && selectedTemplate.color) {
      default_color = selectedTemplate.color;
    }
    if (selectedEvent) {
      selectedEvent.duration = time_duration;
      number_of_workers_required = selectedEvent.number_of_workers_required;
      selectedEvent.template_extra_fields = templateFields;
    }
    let durationInTemplate = this.getTemplateDuration(selectedTemplate);
    let duration = '01 hr';
    if (selectedEvent && selectedEvent.duration) {
      duration = selectedEvent.duration;
    } else if (durationInTemplate) {
      duration = durationInTemplate;
    } else if (this.props.duration) {
      duration = this.props.duration;
    }
    this.setState({
      event: selectedEvent || {
        additional_addresses: null,
        customer_address: '',
        customer_address_line_1: null,
        customer_address_line_2: null,
        customer_city: null,
        customer_company_name: null,
        customer_country: null,
        customer_email: null,
        customer_exact_location: null,
        customer_first_name: null,
        customer_id: null,
        customer_last_name: '',
        customer_mobile_number: null,
        customer_name: '',
        customer_notes: '',
        customer_phone: null,
        customer_state: null,
        customer_timezone: null,
        customer_zipcode: null,
        details: null,
        enable_time_window_display: (selectedTemplate && selectedTemplate.enable_time_window_display !== null && typeof selectedTemplate.enable_time_window_display !== 'undefined') ? selectedTemplate.enable_time_window_display : false,
        end_datetime: null,
        end_datetime_timezone: null,
        entity_ids: [],
        extra_fields: {},
        file_ids: [],
        group_id: -1,
        notifications: { email, sms },
        resource_ids: [],
        start_datetime: null,
        start_datetime_timezone: null,
        task_time: null,
        template: null,
        time_window_start: (selectedTemplate && selectedTemplate.time_window_start) ? selectedTemplate.time_window_start : 0,
        title: '',
        unscheduled: this.props.unscheduled ? this.props.unscheduled : false,
        use_assignee_color: false,
        duration: duration,
        template_extra_fields: templateFields,
        document_ids: templateDocumentIds
      },
      number_of_workers_required,
      fields: this.props.selectedEvent ? Object.keys(extra_fields).filter((key) => {
        return key !== 'task_color';
      }).map((key) => {
        return {
          name: key,
          value: extra_fields[key]
        };
      }) : [],
      task_color: this.props.selectedEvent && extra_fields.task_color ? extra_fields.task_color : default_color,
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
        monthly_day_in_week: 0,
        maximum_occurrences: null
      },
      showTaskDuplicateConfirmation: false,
      showEditSeriesConfirmation: false,
      showDeleteSeriesConfirmation: false,
      showDeleteTaskConfirmation: false,
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
      taskDocuments: [],
      selectedGroupEntities,
      selectedGroupEquipments,
      taskEntities,
      taskResources,
      task_group_id,
      template_id: null,
    }, () => {
      this.showUploadedFiles();
      this.showAttchedDocuments();
      this.onDurationChange(duration);

    });

    if (this.timeoutID) {
      clearTimeout(this.timeoutID);
    }
    if (this.customerTimeoutID) {
      clearTimeout(this.timeoutID);
    }
  }

  changeWorkersRequired(e, remove = false) {
    e.preventDefault();
    e.stopPropagation();
    let number_of_workers_required = this.state.number_of_workers_required;

    if (!remove) {
      number_of_workers_required = number_of_workers_required + 1;
    } else if (remove) {
      number_of_workers_required = number_of_workers_required - 1;
    }
    this.setState({
      number_of_workers_required
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.serverActionPending && nextProps.serverActionComplete) {
      this.setState({ notifications: [{ message: 'Task successfully updated' }] });
    }

    let files_to_upload = this.state.files_to_upload;

    if (nextProps.filesFail) {
      files_to_upload = nextProps.actualFailedFiles;
      this.setState({
        files_to_upload,
        displayNotification: false
      });
    }

    if (nextProps.importing && nextProps.currentEvent !== this.props.currentEvent) {
      files_to_upload = [];
      let extra_fields = {};
      if (nextProps.selectedEvent) {
        extra_fields = nextProps.selectedEvent.extra_fields ? nextProps.selectedEvent.extra_fields : {};
      }

      let event = nextProps.selectedEvent && $.extend(true, {}, nextProps.selectedEvent);
      if (this.props.groups && !this.props.groups.find((singleGroup) => {
        return singleGroup.id === event.group_id;
      })) {
        event.group_id = null;
      }

      this.setState({
        files_to_upload,
        notifications: [],
        displayNotification: false,
        event,
        task_color: DEFAULT_COLORPICKER_COLOR,
        start_date: nextProps.selectedEvent.start_datetime,
        end_date: nextProps.selectedEvent.end_datetime,
        start_time: this.extractTime(nextProps.selectedEvent.start_datetime),
        end_time: this.extractTime(nextProps.selectedEvent.end_datetime),
        index: nextProps.selectedEvent.index,
        fields: Object.keys(extra_fields).filter((key) => {
          return key !== 'task_color';
        }).map((key) => {
          return {
            name: key,
            value: extra_fields[key]
          };
        }),
      });
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


    if (parseInt(h) === 0) {
      h = 12;
    }
    m = m < 10 ? '0' + m : m;

    s = s < 10 ? '0' + s : s;

    /* if you want 2 digit hours:*/
    h = h < 10 ? '0' + h : h;

    return {
      hours: h,
      mins: m,
      meridian
    };
  }

  extractTime(datetime, timezone) {
    if (datetime) {
      return this.formatTime(datetime, timezone);
    }

    return { hours: '09', mins: '00', meridian: 'AM' };
  }

  InitializeDateTime(type, newEventEndDate, newEventStartDate, event, timezone) {
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
    } else if (type === 'EndDate') {
      if (event) {
        if (!event.end_datetime) {
          return '';
        } else {
          const end_datetime = moment.tz(event.end_datetime, 'YYYY-MM-DDTHH:mm:ss').format();
          return moment.tz(end_datetime, timezone).format('YYYY-MM-DD');
        }
      } else {
        return moment.tz(newEventEndDate, moment.tz.guess()).format('YYYY-MM-DD');
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
    } else if (type === 'EndTime') {
      if (event) {
        if (!event.end_datetime) {
          return '';
        } else {
          const end_datetime = moment.tz(event.end_datetime, 'YYYY-MM-DDTHH:mm:ss').format();
          return this.extractTime(end_datetime, timezone);
        }
      } else {
        return this.extractTime(newEventEndDate, moment.tz.guess());
      }
    }
  }

  setEventState(key, value, workerAdded = false) {
    const event = this.state.event;
    let task_color = this.state.task_color;
    let template_id = value ;
    if (key === 'group_id') {
      this.handleGroupChange(value);
    } else if (key === 'entity_ids' && event.use_assignee_color) {
      if (!value.length) {
        event.use_assignee_color = false;
      } else {
        task_color = this.getFirstAssigneeColor(task_color, value[0]);
      }
      this.props.task_color(task_color);
      this.setState({ event, task_color });
    } else if (key === 'use_assignee_color' && value) {
      event.use_assignee_color = value;
      task_color = this.getFirstAssigneeColor(task_color);
      this.props.task_color(task_color);
      this.setState({event, task_color});
    } else if (key === 'template') {
      const selectedTemplate = this.props.templates && this.props.templates.find((template) => {
        return (value) ? template.id === value : template.is_default;
      });
      const templateFields = this.updateTemplateExtraFields(selectedTemplate);
      const templateDocuments = this.getTemplateDocuments(selectedTemplate);
      const templateDuration = this.getTemplateDuration(selectedTemplate);
      event[key] = value;
      event['template_extra_fields'] = templateFields;
      event['document_ids'] = templateDocuments;
      event['duration'] = templateDuration;
      event['time_window_start'] = (selectedTemplate && selectedTemplate.time_window_start) ? selectedTemplate.time_window_start : event.time_window_start;
      event['enable_time_window_display'] = (selectedTemplate && selectedTemplate.enable_time_window_display !== null && typeof selectedTemplate.enable_time_window_display !== 'undefined') ? selectedTemplate.enable_time_window_display : event.enable_time_window_display;
      this.setState({ event }, () => {
        this.onDurationChange(templateDuration.trim());
      });
    } else {
      event[key] = value;
      this.setState({ event });
    }
    this.props.templates.map((key)=>{
      if (key.id === template_id){
        this.setState({
          task_color:key.color
        });
      } else if(template_id == -1) {
        this.setState({
          task_color: '#0693e3'
        })
      }
    })
  }

  setSeriesState(key, value) {
    const series_settings = this.state.series_settings;
    series_settings[key] = value;

    if (key === 'monthly_day_in_week' || key === 'monthly_week_in_month' || key === 'maximum_occurrences' || key === 'repeat') {
      series_settings[key] = parseInt(value);
    }

    this.setState({ series_settings });
  }

  setTaskFormState(key, value) {
    if (key === 'task_color') {
      const event = this.state.event;
      event['use_assignee_color'] = false;

      this.props.task_color(value);
      this.setState({ [key]: value, event });
    } else {
      this.setState({ [key]: value });
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
      return item.id === firstId;
    });

    if (firstAssignee) {
      return firstAssignee.color ? firstAssignee.color : DEFAULT_COLORPICKER_COLOR;
    }
    return oldColor;
  }

  getNodes(equalizerComponent, equalizerElement) {
    this.node1 = this.refs.taskRef && this.refs.taskRef.getRef();
    this.node2 = this.refs.taskRef2;
    if (this.node1 && this.node2) {
      return [
        this.node1,
        this.node2,
      ];
    }
    return [];
  }

  clearDateTimeFields() {
    const event = this.state.event;
    event.duration = '01 hr';
    if ((this.state.event.series_id && this.state.event.unscheduled) || (this.state.series_settings && this.state.series_settings.edit_series)) {
      this.setState({
        start_time: '',
        end_time: '',
        displayNotification: false,
        event
      });
    } else {
      event.enable_time_window_display = false;
      event.start_datetime_timezone = null;
      event.end_datetime_timezone = null;
      this.setState({
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        event,
        displayNotification: false,
      });
    }
  }

  onStartDateChange(value) {
    if (value) {
      const start_date = new Date(value);

      let end_date = null;
      if (this.state.end_date) {
        end_date = new Date(this.state.end_date);
        let previousStartDate = moment().format();

        if (this.state.start_date) {
          previousStartDate = this.state.start_date;
        }

        let diffDays = moment(end_date).diff(moment(previousStartDate), 'd');
        end_date = moment(start_date).add(diffDays, 'd');
        this.setState({
          start_date: moment(start_date).format('YYYY-MM-DD'),
          end_date: moment(end_date).format('YYYY-MM-DD'),
          displayNotification: false
        });
        return;
      }
    } else if (value === null) {
      const event = this.state.event;
      event.enable_time_window_display = false;
      this.setState({
        start_date: value,
        event,
        displayNotification: false
      });
      return;
    } else {
      value = new Date();
    }
    if (!this.state.end_date) {
      this.setState({
        start_date: value, notifications: [],
        end_date: value,
        displayNotification: false
      });
    } else {
      this.setState({
        start_date: value, notifications: [],
        displayNotification: false
      });
    }
  }

  updateDuration() {
    if (this.state.start_date, this.state.end_date, this.state.start_time && this.state.end_time) {
      const start_datetime = this.convertToMoment(this.state.start_date, this.state.start_time);
      const end_datetime = this.convertToMoment(this.state.end_date, this.state.end_time);

      const timeZones = this.handleTimeZoneForDuration();

      const start_dt_tm_with_timezone = moment.tz(start_datetime, 'YYYY-MM-DDTHH:mm:ss', timeZones.startTimeZone).format();
      const start_datetime_in_utc = moment.utc(start_dt_tm_with_timezone);

      const end_dt_tm_with_timezone = moment.tz(end_datetime, 'YYYY-MM-DDTHH:mm:ss', timeZones.endTimeZone).format();
      const end_datetime_in_utc = moment.utc(end_dt_tm_with_timezone);

      const differnce_in_mins = end_datetime_in_utc.diff(start_datetime_in_utc, 'minutes');

      const diff = Math.abs(differnce_in_mins);

      const hrsForEndDateChage = Math.floor(diff / 60);
      const minsForEndDateChage = (diff % 60);
      const duration = ((hrsForEndDateChage !== 0 ? (hrsForEndDateChage + (hrsForEndDateChage > 1 ? ' hrs ' : ' hr ')) : '') + (minsForEndDateChage !== 0 ? (minsForEndDateChage + (minsForEndDateChage > 1 ? ' mins' : ' min')) : '')).trim();
      const event = this.state.event;
      event.duration = duration;
      this.setState({ event });
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
            start_date: moment(end_date).format('YYYY-MM-DD'),
            end_date: moment(end_date).format('YYYY-MM-DD'),
            displayNotification: false
          }, this.updateDuration);

          return;
        }
      }
    } else if (value === null) {
      const event = this.state.event;
      event.enable_time_window_display = false;
      this.setState({
        end_date: value,
        event,
        displayNotification: false
      });
      return;
    } else {
      value = new Date();
    }

    if (!this.state.start_date) {
      this.setState({
        end_date: value, notifications: [],
        start_date: value,
        displayNotification: false
      }, this.updateDuration);
    } else {
      this.setState({
        end_date: value, notifications: [],
        displayNotification: false
      }, this.updateDuration);
    }
  }

  formatDoubleDigitDate(value) {
    return value.toString().length === 1 ? '0' + value : value;
  }

  setTime(startTimeHours, startTimeMinutes, startTimeMeridian, endTimeHours, endTimeMinutes, endTimeMeridian) {
    let endDate = this.state.end_date;
    const startDate = this.state.start_date;
    const endTime = {
      hours: endTimeHours,
      mins: endTimeMinutes,
      meridian: endTimeMeridian,
    };
    let dateFromEndTimeString = this.convertToMoment(startDate, endTime);
    let incrementedEndTime = null;
    let difference = 0;
    if (this.state.event.duration) {
      let timeRegEx = /^(((\d+)\s(hrs|hr))\s(([0-5][0-9]|[0-9]))\s(mins|min))|^((\d+\s(hrs|hr)))$|^((([0-5][0-9]|[0-9]))\s(mins|min))$/i;
      const matchedGroups = timeRegEx.exec(this.state.event.duration);
      let durationHours = 0;
      let durationMins = 0;
      if (!matchedGroups) {
        incrementedEndTime = moment(dateFromEndTimeString, 'YYYY-MM-DDTHH:mm:ss').add(1, 'hours');
      } else {
        if (matchedGroups[3] || matchedGroups[9]) {
          durationHours = matchedGroups[3] ? parseInt(matchedGroups[3]) : parseInt(matchedGroups[9]);
        }
        if (matchedGroups[6] || matchedGroups[12]) {
          durationMins = matchedGroups[6] ? parseInt(matchedGroups[6]) : parseInt(matchedGroups[12]);
        }
        difference = (durationHours * 60) + durationMins;
        incrementedEndTime = moment(dateFromEndTimeString, 'YYYY-MM-DDTHH:mm:ss').add(difference, 'minutes');
      }
    }
    else if (this.state.end_time && this.state.start_time && startDate && endDate) {
      const start_datetime = this.convertToMoment(startDate, this.state.start_time);
      const end_datetime = this.convertToMoment(endDate, this.state.end_time);
      difference = moment(end_datetime, 'YYYY-MM-DDTHH:mm:ss').diff(moment(start_datetime, 'YYYY-MM-DDTHH:mm:ss'));
      incrementedEndTime = moment(dateFromEndTimeString, 'YYYY-MM-DDTHH:mm:ss').add(difference, 'ms');
    }
    if (incrementedEndTime) {
      endDate = moment(incrementedEndTime.format('DD-MM-YYYY'), 'DD-MM-YYYY').format('YYYY-MM-DDTHH:mm:ss');
    }
    if (!incrementedEndTime) {
      incrementedEndTime = moment(dateFromEndTimeString, 'YYYY-MM-DDTHH:mm:ss').add(1, 'hours');
    }
    incrementedEndTime = incrementedEndTime.format('hh:mm A');
    const timeRegEx = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ?([aApP][mM])$/;
    const matchedGrups = timeRegEx.exec(incrementedEndTime);
    const endHrs = matchedGrups[1];
    const endMins = matchedGrups[2];
    const endMerd = matchedGrups[3];

    this.setState({
      start_time: {
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

  convertToMoment(dateToConvert, timeToConvert) {
    let time = '';
    if (!dateToConvert && !timeToConvert) {
      return moment().format('YYYY-MM-DDTHH:mm:ss');
    }
    if (!timeToConvert) {
      time = moment().format('hh:mm A');
    } else if (typeof timeToConvert !== 'object') {
      time = moment().format('hh:mm A');
    } else if (timeToConvert.hours !== null && typeof timeToConvert.hours !== 'undefined' && timeToConvert.mins !== null
      && typeof timeToConvert.mins !== 'undefined' && timeToConvert.meridian) {
      // Here hours or mins can be 0 which is valid value. So added null and undefined checks.
      time = timeToConvert.hours + ':' + timeToConvert.mins + ' ' + timeToConvert.meridian;
      time = moment(time, 'hh:mm A');
    } else {
      time = moment().format('hh:mm A');
    }
    const date = dateToConvert ? moment(dateToConvert).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    return date + 'T' + this.formatDoubleDigitDate(time.hours()) + ':' + this.formatDoubleDigitDate(time.minutes()) + ':' + '00';
  }

  handleTimeZoneForDuration() {
    let event = this.state.event;
    if (event.start_datetime_timezone && event.end_datetime_timezone) {
      return {
        'startTimeZone': event.start_datetime_timezone,
        'endTimeZone': event.end_datetime_timezone
      };
    }

    let startTimeZone = moment.tz.guess();
    // If group_id in event is null then get default group of company else get selected group
    const selectedGroup = this.props.groups && this.props.groups.find((group) => {
      return event && event.group_id ? (event.group_id === group.id) : (group.is_implicit);
    });

    if (selectedGroup && selectedGroup.timezone) {
      startTimeZone = selectedGroup.timezone;
    } else if (this.props.profile && this.props.profile.timezone) {
      startTimeZone = this.props.profile.timezone;
    } else if (this.props.profile && this.props.profile.group_timezone) {
      startTimeZone = this.props.profile.group_timezone;
    }

    let endTimeZone = startTimeZone;
    return {
      'startTimeZone': startTimeZone,
      'endTimeZone': endTimeZone
    };
  }

  onDurationChange(value) {
    const event = this.state.event;
    if (this.state.start_time && this.state.start_date) {
      let timeRegEx = /^(((\d+)\s(hrs|hr))\s(([0-5][0-9]|[0-9]))\s(mins|min))|^((\d+\s(hrs|hr)))$|^((([0-5][0-9]|[0-9]))\s(mins|min))$/i;
      const matchedGroups = timeRegEx.exec(value);
      let hrs = 0;
      let min = 0;
      const timeZones = this.handleTimeZoneForDuration();
      if (!matchedGroups) {
        return;
      }
      const start_datetime = this.convertToMoment(this.state.start_date, this.state.start_time);
      const start_dt_tm_with_timezone = moment.tz(start_datetime, 'YYYY-MM-DDTHH:mm:ss', timeZones.startTimeZone).format();
      const start_datetime_in_utc = moment.utc(start_dt_tm_with_timezone);
      if (matchedGroups[3] || matchedGroups[9]) {
        hrs = matchedGroups[3] ? parseInt(matchedGroups[3]) : parseInt(matchedGroups[9]);
      }
      if (matchedGroups[6] || matchedGroups[12]) {
        min = matchedGroups[6] ? parseInt(matchedGroups[6]) : parseInt(matchedGroups[12]);
      }
      const minsToAdd = (hrs * 60) + min;
      const end_datetime_in_utc = start_datetime_in_utc.add(minsToAdd, 'minutes').format();
      const end_dt_tm_with_timezone = moment.tz(end_datetime_in_utc, 'YYYY-MM-DDTHH:mm:ssZ', timeZones.endTimeZone);
      let timeRegExEndTime = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ?([aApP][mM])$/;
      const matchedGroupsTime = timeRegExEndTime.exec(end_dt_tm_with_timezone.format('hh:mm A'));
      event.duration = value;
      this.setState({
        end_time: {
          hours: this.formatDoubleDigitDate(matchedGroupsTime[1]),
          mins: this.formatDoubleDigitDate(matchedGroupsTime[2]),
          meridian: matchedGroupsTime[3] || this.state.end_time.meridian,
          notifications: this.state.end_time.notifications
        }, event, end_date: end_dt_tm_with_timezone.format('YYYY-MM-DDTHH:mm:ss')
      });
    } else {
      event.duration = value;
      this.setState({
        event
      });
    }
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
    let endTime_hrs;
    let endTime_mins;
    let endTime_meridian;

    endTime_hrs = hrs;
    endTime_mins = min;
    endTime_meridian = meridian;
    this.setTime(hrs, min, meridian, endTime_hrs, endTime_mins, endTime_meridian);
  }

  inputTimeEndChange(value) {
    const timeRegEx = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ?([aApP][mM])$/;
    const matchedGrups = timeRegEx.exec(value);
    if (!matchedGrups) {
      return;
    }
    let hours = matchedGrups[1];
    let mins = matchedGrups[2];
    let meridian = matchedGrups[3];
    const end_time = {
      hours: this.formatDoubleDigitDate(hours),
      mins: this.formatDoubleDigitDate(mins),
      meridian,
      notifications: []
    };
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

    const start_time = {
      hours: this.formatDoubleDigitDate(startTime_hrs),
      mins: this.formatDoubleDigitDate(startTime_mins),
      meridian: startTime_meridian,
      notifications: []
    };

    // set updated time values in the state.
    this.setState({
      end_time,
      start_time,
      displayNotification: false,
    }, this.updateDuration);

  }

  setTimezones(timezones) {
    const event = $.extend(true, {}, this.state.event);
    event.start_datetime_timezone = timezones.start_timezone;
    event.end_datetime_timezone = timezones.end_timezone;
    this.setState({
      event
    }, this.updateDuration);
  }

  onEnableTimeWindow(e) {
    const event = this.state.event;
    event.enable_time_window_display = e.target.checked;

    if (!event.time_window_start) {
      event.time_window_start = 60;
    }

    this.setState(Object.assign(this.state, { event, displayNotification: false }));
  }

  onChange(name, value) {
    const event = this.state.event;

    if (name === 'fields') {
      this.setState(Object.assign(this.state, { fields: value, notifications: [], displayNotification: false }));
    } else if (name === 'task_color') {
      event.use_assignee_color = false;
      this.setState(Object.assign(this.state, {
        task_color: value,
        notifications: [],
        event,
        displayNotification: false
      }));
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

  generateDatetime({ start_date, end_date, start_time, end_time }) {
    if (!start_date && !start_time && !end_date && !end_time) {
      let start_datetime = '';
      let end_datetime = '';

      return { start_datetime, end_datetime };
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

    return { start_datetime, end_datetime };
  }

  onMultipleChange(object) {
    for (const propt in object) {
      if (object.hasOwnProperty(propt)) {
        this.onChange(propt, object[propt]);
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

  getCustomers(resetTimeout) {
    if (resetTimeout && this.timeoutID) {
      clearTimeout(this.timeoutID);
    }
    this.props.getCustomers().then((res) => {
      this.setState({ customers: JSON.parse(res) });
      this.timeoutID = setTimeout(() => {
        this.getCustomers();
      }, 6e6);
    });
  }

  createCustomer() {
    this.setState({ sendingCustomer: true });
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
      this.setState({ sendingCustomer: false });
      this.getCustomers(true);
    }).catch((e) => {
      const error = JSON.parse(e.responseText);
      let errorMsg = getErrorMessage(error);

      this.setState({ error: errorMsg, sendingCustomer: false });
    });
  }

  updateCustomer(customer) {
    if (this.customerTimeoutID) {
      clearTimeout(this.timeoutID);
    }

    const event = this.state.event;
    event['customer_first_name'] = customer.first_name || '';
    event['customer_last_name'] = customer.last_name || '';
    event['customer_email'] = customer.email || '';
    event['customer_company_name'] = customer.company_name || '';
    event['customer_address_line_1'] = customer.address_line_1 || '';
    event['customer_address_line_2'] = customer.address_line_2 || '';
    event['customer_city'] = customer.city || '';
    event['customer_state'] = customer.state || '';
    event['customer_country'] = customer.country || '';
    event['customer_zipcode'] = customer.zipcode || '';
    event['customer_phone'] = customer.phone || '';
    event['customer_mobile_number'] = customer.mobile_number || '';
    event['customer_id'] = customer.id || '';
    event['customer_exact_location'] = customer.exact_location || '';

    this.setState({ event });
  }

  handleChange(items) {
    const customer = items[0];
    const foundCustomer = this.state.customers.find((c) => {
      return customer && customer.id === c.id;
    });
    if (typeof foundCustomer !== 'undefined') {
      this.updateCustomer(foundCustomer);
    }
  }

  handleInputChange(inputValue) {
    if (inputValue.length >= 3) {
      this.setState({ emptyLabel: 'Searching...' });
      this.props.searchCustomers(inputValue).then((res) => {
        this.setState({ customers: JSON.parse(res), emptyLabel: 'No matches found' });
      });
    } else if (inputValue.length < 3) {
      this.setState({ emptyLabel: 'Please enter at least 3 characters' });
    } else {
      this.props.getCustomers().then((res) => this.setState({ customers: JSON.parse(res) }));
    }
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
    const r = confirm('Are you sure that you want to delete \'' + file_name + '\'?');
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

  showAttchedDocuments() {
    if (this.props.companyProfile && this.props.companyProfile.is_documents_disabled === false && this.state.event.id) {
      getAllTaskDocuments(this.state.event.id).then((allDocs) => {
        const taskDocuments = JSON.parse(allDocs);
        this.setState({taskDocuments});
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
        const e = new Error('upload failed');
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
      } else {
        this.setState({
          attachmentServerActionPending: false,
          attachmentServerActionComplete: true,
          attachmentSeverActionType: '',
          files_to_upload: [],
          displayNotification: false
        });
      }
      this.showUploadedFiles();
      this.props.fileUploadingComplete();
    });
  }

  uploadFilesOnServer(file) {
    let files = [];
    let file_id = '';
    const image = file;
    const promise = getTaskFileAttachmentUploadURL(this.state.event.id)
      .then((imageUrlResponse) => {
        const data = new FormData();

        data.append('file-0', image);

        const { upload_url } = JSON.parse(imageUrlResponse);

        return uploadAttachment(upload_url, data);
      })
      .then((updateImageResponse) => {
        file_id = JSON.parse(updateImageResponse);

        files.push(file_id);

        return files;
      });

    return promise;
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

  uploadSingleFile(fileToBeUploaded) {
    let filesPromise = Promise.resolve([]);
    let allBackup = this.state.files_to_upload;
    let failedBackup = this.state.uploadFailedFiles;

    const promises = fileToBeUploaded.map((file, i) => {
      return this.uploadFilesOnServer(file).catch(err => {
        const e = new Error('upload failed');
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

  onSeriesEndsOnFocus(field_name) {
    const series_settings = this.state.series_settings;

    if (field_name === 'ends_on') {
      series_settings.ends_condition = 'date';
    } else {
      series_settings.ends_condition = 'maximum_occurrences';
    }

    this.setState(Object.assign(this.state, { series_settings, displayNotification: false }));
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
    const selectedGroup = this.props.groups && this.props.groups.find((group) => {
      return (group_id) ? group.id === group_id : group.is_implicit;
    });
    let selectedGroupTimezone = null;
    if (selectedGroup) {
      selectedGroupTimezone = selectedGroup.timezone;
    }

    const event = this.state.event;
    event.group_id = value;

    if (selectedGroupTimezone) {
      event.start_datetime_timezone = selectedGroupTimezone;
      event.end_datetime_timezone = selectedGroupTimezone;
    }
    this.setState({
      event,
      selectedGroupEntities,
      selectedGroupEquipments,
      taskEntities,
      taskResources
    });
  }

  runValidations(event) {
    let errors = false;
    let notification = null;
    if (this.state.series_settings && this.state.series_settings.edit_series) {
      if (!this.state.start_date || !this.state.end_date) {
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
    if (this.state.event.template === -1) {
      notification = {
        text: 'Template is required. Please select a template for task.',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      errors = true;
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

  updateTask(event, createDuplicate = false) {
    event.preventDefault();
    event.stopPropagation();

    let unscheduledSaveCheck = false;

    let allBackup = this.state.files_to_upload;
    if (this.state.files_to_upload.length > 0 && !this.props.filesFail) {
      for (let i = 0; i < this.state.files_to_upload.length; i++) {
        allBackup[i].isInProcess = 'true';
      }
    }
    const task = this.state.event;
    let group_id = this.state.event.group_id;
    if (!this.props.can_add_group && this.props.profile && typeof this.props.profile.group_id !== 'undefined' && parseInt(group_id) === -1) {
      group_id = this.props.profile.group_id;
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

    let notifications = { email: true, sms: true };
    let customer_exact_location = null;

    if (this.state.event.notifications) {
      notifications = Object.assign(this.state.event.notifications, {});
    }

    if (this.state.event.customer_exact_location) {
      customer_exact_location = Object.assign(this.state.event.customer_exact_location, {});
    }

    let event_clone = $.extend(true, {}, this.state.event);

    const updatedEvent = $.extend(true, event_clone, {
      extra_fields: extra_fields,
      notifications: notifications,
      entity_ids: this.state.event.entity_ids,
      resource_ids: this.state.event.resource_ids,
      customer_exact_location: customer_exact_location,
      entity_confirmation_statuses: null
    });

    let startTimeZone = moment.tz.guess();
    let endTimeZone = moment.tz.guess();

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

    if (updatedEvent.end_datetime_timezone) {
      endTimeZone = updatedEvent.end_datetime_timezone;
    } else if (!updatedEvent.end_datetime_timezone && updatedEvent.start_datetime_timezone) {
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

    updatedEvent.start_datetime_timezone = startTimeZone;
    updatedEvent.end_datetime_timezone = endTimeZone;


    updatedEvent.start_datetime = startDate ? moment.utc(startDate).format('YYYY-MM-DDTHH:mm:ss') : '';
    updatedEvent.end_datetime = endDate ? moment.utc(endDate).format('YYYY-MM-DDTHH:mm:ss') : '';


    if (this.props.selectedEvent && updatedEvent.unscheduled && this.props.selectedEvent.unscheduled && _.isEqual(updatedEvent, this.props.selectedEvent)) {
      unscheduledSaveCheck = true;
    }
    updatedEvent.start_datetime = startDate ? moment.tz(startDate.format('YYYY-MM-DDTHH:mm:ss'), 'YYYY-MM-DDTHH:mm:ss', startTimeZone).format() : '';
    updatedEvent.end_datetime = endDate ? moment.tz(endDate.format('YYYY-MM-DDTHH:mm:ss'), 'YYYY-MM-DDTHH:mm:ss', endTimeZone).format() : '';
    if (!customer_exact_location) {
      customer_exact_location = {};
    }


    if (this.state.event.id && this.state.series_settings.edit_series && !this.state.showEditSeriesConfirmation && createDuplicate === false && !this.state.shownSeriesEditConfirmation) {
      this.setState(Object.assign(this.state, {
        showEditSeriesConfirmation: true,
        shownSeriesEditConfirmation: true,
        displayNotification: false
      }));
      return;
    } else if (this.state.event.series_id && !this.state.series_settings.edit_series &&
      !this.state.showEditSeriesIndividualConfirmation && createDuplicate === false && !this.state.shownIndividualEditConfirmation) {
      this.setState(Object.assign(this.state, {
        showEditSeriesIndividualConfirmation: true,
        shownIndividualEditConfirmation: true,
        displayNotification: false
      }));
      return;
    } else if (createDuplicate === true && !this.state.showTaskDuplicateConfirmation && !this.state.shownTaskDuplicateConfirmation) {
      this.setState(Object.assign(this.state, {
        showTaskDuplicateConfirmation: true,
        shownTaskDuplicateConfirmation: true,
        displayNotification: false
      }));
      return;
    } else if (unscheduledSaveCheck === false && createDuplicate === false && this.state.event.unscheduled && !this.state.showUnscheduledTaskConfirmation && !this.state.showTaskDuplicateConfirmation && !this.state.shownUnscheduledConfirmation) {
      this.setState(Object.assign(this.state, {
        showUnscheduledTaskConfirmation: true,
        shownUnscheduledConfirmation: true,
        displayNotification: false
      }));
      return;
    }

    updatedEvent.extra_fields = JSON.stringify(extra_fields);
    updatedEvent.template_extra_fields = this.state.event.template_extra_fields ? JSON.stringify(this.state.event.template_extra_fields) : null;
    updatedEvent.notifications = JSON.stringify(notifications);
    updatedEvent.entity_ids = this.state.event.entity_ids.join(',');
    updatedEvent.document_ids = this.state.event.document_ids && this.state.event.document_ids.join(',');
    updatedEvent.resource_ids = this.state.event.resource_ids.join(',');
    updatedEvent.customer_exact_location = JSON.stringify(customer_exact_location);
    updatedEvent.customer_address = '';
    if (updatedEvent.additional_addresses) {
      updatedEvent.additional_addresses.map((address) => {
        address.complete_address = '';
      });
    }
    let duration = updatedEvent.duration.trim();
    let hrs;
    let min;
    let totalTime;
    // The following regular expression will validate the edited duration string, It will only accept the strings that have
    // the required pattern matched.
    let timeRegEx = /^(((\d+)\s(hrs|hr))\s(([0-5][0-9]|[0-9]))\s(mins|min))|^((\d+\s(hrs|hr)))$|^((([0-5][0-9]|[0-9]))\s(mins|min))$/i;
    const matchedGroups = timeRegEx.exec(duration);
    if (!matchedGroups) {
      return;
    }
    if (matchedGroups[3] || matchedGroups[9]) {
      hrs = matchedGroups[3] ? parseInt(matchedGroups[3]) : parseInt(matchedGroups[9]);
    } else {
      hrs = 0;
    }
    if (matchedGroups[6] || matchedGroups[12]) {
      min = matchedGroups[6] ? parseInt(matchedGroups[6]) : parseInt(matchedGroups[12]);
    } else {
      min = 0;
    }

    totalTime = ((hrs * 60) + min);
    updatedEvent.duration = totalTime;

    let { edit_series, ...series_settings } = this.state.series_settings;
    series_settings = $.extend(true, {}, series_settings);

    series_settings.start_date = moment(series_settings.start_date).format();

    if (series_settings.ends_on) {
      series_settings.ends_on = moment(series_settings.ends_on).format();
    }

    if (edit_series) {
      updatedEvent.series_settings = JSON.stringify(series_settings);
    }

    updatedEvent.additional_addresses = this.state.event.additional_addresses ? JSON.stringify(this.state.event.additional_addresses) : null;

    if (this.props.items) {
      updatedEvent.items = JSON.stringify(this.props.items);
    }

    if (updatedEvent.entities_data) {
      delete updatedEvent.entities_data;
    }

    updatedEvent['template_type'] = 'TASK';

    for (let key in updatedEvent) {
      if (TASK_ATTRIBUTES.indexOf(key.toString()) === -1) {
        delete updatedEvent[key];
      }
    }

    updatedEvent['manipulate_route'] = true;
    updatedEvent['start_datetime_original_iso_str'] = updatedEvent.start_datetime;
    updatedEvent['end_datetime_original_iso_str'] = updatedEvent.end_datetime;

    updatedEvent['number_of_workers_required'] = this.state.number_of_workers_required;

    this.setState(Object.assign(this.state, {
      showEditSeriesConfirmation: false,
      showDeleteSeriesConfirmation: false,
      showDeleteTaskConfirmation: false,
      showEditSeriesIndividualConfirmation: false,
      showTaskDuplicateConfirmation: false,
      validationErrors: null,
      displayNotification: true
    }));


    this.props.onSaveClick(updatedEvent, this.state.files_to_upload, createDuplicate);

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

  renderTasksConfirmation(contents) {
    return (
      <Modal show={true} animation={false} dialogClassName={cx(styles.modalTasksConfirmation)}>
        <Modal.Body>
          <i className={cx(styles.close)} onClick={this.cancelSeriesAction}>
            <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756">
              <g transform="translate(-1270.486 -30.485)">
                <path
                  d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z"
                  transform="translate(4126.197 -40.804)" fill="#8d959f"></path>
              </g>
            </svg>
          </i>
          {contents}
        </Modal.Body>
      </Modal>
    );
  }

  renderTaskDuplicateConfirmation() {
    const contents = (
      <div>
        <div className={cx(styles.modalHeader)}>
          <h3 className={cx(styles.modalTitle)}>Duplicate Task</h3>
        </div>
        <div className={cx(styles.bodyInner)}>
          <div className={cx(styles.box)}>
            <p>Please save your current changes by clicking the "Save and Duplicate" button below. Cancel if you would
              like to make further changes.</p>
          </div>
          <div className="text-right">
            <button onClick={this.cancelSeriesAction} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
            <button onClick={(event) => this.updateTask(event, true)}
                    className={cx(styles.btn, styles['btn-secondary'])} type="submit">{this.props.serverActionPending ?
              <SavingSpinner className={styles.whiteLoader} size={8}
                             borderStyle="none"/> : 'Save and Duplicate current task'}</button>
          </div>
        </div>
      </div>
    );
    return this.renderTasksConfirmation(contents);
  }

  renderEditSeriesConfirmation() {
    const contents = (
      <div>
        <div className={cx(styles.modalHeader)}>
          <h3 className={cx(styles.modalTitle)}>Change Repeating Task Series</h3>
        </div>
        <div className={cx(styles.bodyInner)}>
          <div className={cx(styles.box)}>
            <p>You have edited the series for this repeating task. Any edits will apply to instances occurring today and
              future instances in the series.<br/>
              &mdash; Instances occurring in the past will not be changed<br/>
              &mdash; Any edits made to individual future instances will be lost<br/>
              &mdash; To change individual event, exit this dialog and turn the <strong>Edit Series</strong> switch off,
              make changes then click <strong>Save</strong>
            </p>
          </div>
          <div className="text-right">
            <button onClick={this.cancelSeriesAction} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
            <button className={cx(styles.btn, styles['btn-secondary'])}
                    onClick={this.updateTask}>{this.props.serverActionPending ?
              <SavingSpinner className={styles.whiteLoader} size={8}
                             borderStyle="none"/> : 'Change Repeating Task Series'}</button>
          </div>
        </div>
      </div>
    );
    return this.renderTasksConfirmation(contents);
  }

  renderDeleteSeriesConfirmation() {
    const contents = (
      <div>
        <div className={cx(styles.modalHeader)}>
          <h3 className={cx(styles.modalTitle)}>Delete Repeating Task Series</h3>
        </div>
        <div className={cx(styles.bodyInner)}>
          <div className={cx(styles.box)}>
            <p>Would you like to delete only this task or this and all following?</p>
            <div className={styles.deleteLoader}>{this.props.serverActionPending &&
            <SavingSpinner title="Deleting" borderStyle="none"/>}</div>
          </div>
          <div className="text-right">
            <button onClick={this.cancelSeriesAction} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
            <button className={cx(styles.btn, styles['btn-secondary'])}
                    title="All other tasks in series will remain the same"
                    onClick={() => this.props.onDeleteClick(this.state.event.id)}>Only this task
            </button>
            <Button className={cx(styles.btn, styles['btn-primary'])}
                    title="This and all the following tasks will be deleted"
                    onClick={() => this.props.onDeleteClick(this.state.event.id, true)}>Following tasks</Button>
          </div>
        </div>
      </div>
    );
    return this.renderTasksConfirmation(contents);
  }

  renderEditSeriesIndividualConfirmation() {
    const contents = (
      <div>
        <div className={cx(styles.modalHeader)}>
          <h3 className={cx(styles.modalTitle)}>Change Task Instance</h3>
        </div>
        <div className={cx(styles.bodyInner)}>
          <div className={cx(styles.box)}>
            <p>You have edited an individual repeating task instance. Any edits will apply to this one instance.</p>
            <p>To change series, exit this dialog and turn the <strong>Edit Series</strong> switch on, make changes then
              click <strong>Save</strong></p>
          </div>
          <div className="text-right">
            <button onClick={this.cancelSeriesAction} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
            <button className={cx(styles.btn, styles['btn-secondary'])}
                    onClick={this.updateTask}>{this.props.serverActionPending ?
              <SavingSpinner className={styles.whiteLoader} size={8} borderStyle="none"/> : 'Change task'}</button>
          </div>
        </div>
      </div>
    );
    return this.renderTasksConfirmation(contents);
  }

  renderDeleteTaskConfirmation() {
    const contents = (
      <div>
        <div className={cx(styles.modalHeader)}>
          <h3 className={cx(styles.modalTitle)}>Delete Task</h3>
        </div>
        <div className={cx(styles.bodyInner)}>
          <div className={cx(styles.box)}>
            <p>Would you like to delete this task?</p>
          </div>
          <div className="text-right">
            <button onClick={this.cancelSeriesAction} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
            <button className={cx(styles.btn, styles['btn-secondary'])} title="This task will be deleted"
                    onClick={() => this.props.onDeleteClick(this.state.event.id)}>{this.props.serverActionPending ?
              <SavingSpinner className={styles.whiteLoader} size={8} borderStyle="none"/> : 'Delete'}</button>
          </div>
        </div>
      </div>
    );
    return this.renderTasksConfirmation(contents);
  }

  renderUnscheduledTaskConfirmation() {
    const contents = (
      <div>
        <div className={cx(styles.modalHeader)}>
          <h3 className={cx(styles.modalTitle)}>Unscheduled Task</h3>
        </div>
        <div className={cx(styles.bodyInner)}>
          <div className={cx(styles.box)}>
            <p>Are you sure that you would like to mark this Task as Unscheduled?</p>
          </div>
          <div className="text-right">
            <button onClick={this.cancelSeriesAction} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
            <button className={cx(styles.btn, styles['btn-secondary'])} title="This task will be deleted"
                    onClick={(event) => this.updateTask(event, false)}>{this.props.serverActionPending ?
              <SavingSpinner className={styles.whiteLoader} size={8} borderStyle="none"/> : 'Yes'}</button>
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


  render() {
    const { entity_ids, resource_ids, unscheduled, entity_confirmation_statuses } = this.state.event;
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

    const newDateTime = this.generateDatetime(this.state);
    const showSeriesEdit = this.props.newEventIsRecurring || this.state.event.series_id != null;

    let selectedGroup = null;
    if (typeof this.props.groups !== 'undefined' && this.props.groups !== null && this.props.groups.length > 0) {
      selectedGroup = this.props.groups.find((el) => {
        return (this.state.event && this.state.event.group_id) ? el.id === Number(this.state.event.group_id) : el.is_implicit;
      });
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
      const startDateTZ = timezones.find(el => {
        return el.value === this.state.event.start_datetime_timezone;
      });
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
          const groupTZ = timezones.find(el => {
            return el.value === groupTimezone;
          });
          showStarTimezone = true;
          start_time_zone = typeof groupTZ !== 'undefined' ? groupTZ.label : groupTimezone;
        }
      } else if (groupTimezone === null && companyTimezone !== null) {
        if (!isTimezonesOffsetEqual(companyTimezone, moment.tz.guess())) {
          const companyTZ = timezones.find(el => {
            return el.value === companyTimezone;
          });
          showStarTimezone = true;
          start_time_zone = typeof companyTZ !== 'undefined' ? companyTZ.label : companyTimezone;
        }
      } else if (groupTimezone === null && companyTimezone === null && entityGroupTimezone !== null) {
        if (!isTimezonesOffsetEqual(entityGroupTimezone, moment.tz.guess())) {
          const entityGroupTZ = timezones.find(el => {
            return el.value === entityGroupTimezone;
          });
          showStarTimezone = true;
          start_time_zone = typeof entityGroupTZ !== 'undefined' ? entityGroupTZ.label : entityGroupTimezone;
        }
      }
    }

    if (this.state.event.end_datetime_timezone !== null) {
      const endDateTZ = timezones.find(el => {
        return el.value === this.state.event.end_datetime_timezone;
      });
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
    if (this.props.groups && (this.props.groups.find((group) => {
      return group.is_implicit;
    })) && this.props.groups.length > 1 && this.props.groups.find((group) => {
      return !group.is_disabled && !group.is_implicit;
    })) {
      showGroupDropdown = true;
    } else if (this.props.groups && !(this.props.groups.find((group) => {
      return group.is_implicit;
    })) && this.props.groups.length > 0 && this.props.groups.find((group) => {
      return !group.is_disabled;
    })) {
      showGroupDropdown = true;
    }

    let group_id = this.state.event.group_id;
    if (!this.props.can_add_group && this.props.profile && this.props.profile.group_id) {
      group_id = this.props.profile.group_id;
    }
    const selectedEntityIds = this.state.event.entity_ids;
    const selectedEntities = this.props.entities && selectedEntityIds && this.props.entities.filter((entity) => {
      return selectedEntityIds.find((entityId) => {
        return entity.id === entityId;
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

    const selectedEquipmentIds = this.state.event.resource_ids;
    const selectedEquipments = this.props.equipments && selectedEquipmentIds && this.props.equipments.filter((equipment) => {
      return selectedEquipmentIds.find((equipmentId) => {
        return equipment.id === equipmentId;
      });
    });
    const showEquipmentGroupError = selectedEquipments.find((equipment) => {
      if (!this.props.can_add_group || (group_id && group_id.toString() === '-1')) {
        return false;
      } else if ((group_id === '' || group_id === null) && equipment.group_id !== null) {
        return true;
      } else if (group_id !== '' && group_id !== null && equipment.group_id !== Number(group_id)) {
        return true;
      }
      return false;
    });
    return (
      <div className={cx(styles.fullContainer)}>
        {this.state.showTaskDuplicateConfirmation && this.renderTaskDuplicateConfirmation()}
        {this.state.showEditSeriesConfirmation && this.renderEditSeriesConfirmation()}
        {this.state.showDeleteSeriesConfirmation && this.renderDeleteSeriesConfirmation()}
        {this.state.showEditSeriesIndividualConfirmation && this.renderEditSeriesIndividualConfirmation()}
        {this.state.showDeleteTaskConfirmation && this.renderDeleteTaskConfirmation()}
        {this.state.showUnscheduledTaskConfirmation && this.renderUnscheduledTaskConfirmation()}
        <Row className={cx(style.taskFormRow)}>
          <Equalizer enabled={() => window.matchMedia('(min-width: 992px)').matches} nodes={this.getNodes}>
            <Col xs={12} sm={12} md={6}>
              <Task
                ref="taskRef"
                event={this.state.event}
                onChangeEventState={this.setEventState}
                templates={this.props.templates}
                groups={this.props.groups}
                setTaskFormState={this.setTaskFormState}
                task_color={this.state.task_color}
                can_edit={this.props.can_edit}
                clearDateTimeFields={this.clearDateTimeFields}
                start_date={this.state.start_date}
                end_date={this.state.end_date}
                start_time={this.state.start_time}
                end_time={this.state.end_time}
                showSeriesEdit={showSeriesEdit}
                onStartDateChange={this.onStartDateChange}
                onEndDateChange={this.onEndDateChange}
                browser={browser}
                inputTimeStartChange={this.inputTimeStartChange}
                inputTimeEndChange={this.inputTimeEndChange}
                setTimezones={this.setTimezones}
                profile={this.props.profile}
                onEnableTimeWindow={this.onEnableTimeWindow}
                onChange={this.onChange}
                generateDatetime={this.generateDatetime}
                newDateTime={newDateTime}
                editing_series={this.state.series_settings && this.state.series_settings.edit_series}
                can_add_group={this.props.can_add_group}
                can_view_task_full_details={this.props.can_view_task_full_details}
                task_group_id={this.state.task_group_id}
                DurationChange={this.onDurationChange}
                duration={this.state.event.duration}
              />
            </Col>
            <Col xs={12} sm={12} md={6}>
              {/*<AssigneesEquipment ref="taskRef2" />*/}
              <div className={cx(style.box)}>
                <h3 className={cx(style.boxTitle)}>Assignees & Equipment</h3>
                <div className={cx(style.boxBody)} ref="taskRef2">
                  <div className={cx(style.boxBodyInner)}>
                    <div className={styles['assignees-block']}>
                      <FieldGroup
                        label="Assignee(s)"
                        ref="crewSelector"
                        name="crew-selector"
                        event={this.state.event}
                        updateEntities={(entities, workerAdded = false) => {
                          this.setEventState('entity_ids', entities, workerAdded);
                        }}
                        componentClass={CrewSelectorV2}
                        allEntities={this.state.selectedGroupEntities}
                        entitiesSelected={this.state.taskEntities}
                        entities={entity_ids}
                        type={'TASK'}
                        placeholder={this.state.number_of_workers_required ? '' : 'Assign team member'}
                        startDate={newDateTime.start_datetime}
                        endDate={newDateTime.end_datetime}
                        getSchedule={this.props.getSchedule}
                        unscheduled={unscheduled}
                        entity_confirmation_statuses={entity_confirmation_statuses}
                        profile={this.props.companyProfile}
                        canEdit={this.props.can_edit}
                        canViewTeamConfirmation={(this.props.selectedEvent && typeof this.props.selectedEvent.id !== 'undefined') ? this.props.can_view_team_confirmation : false}
                        elId={Math.random().toString(36).substr(2, 16)}
                        placeholderImage={'/images/user-default.svg'}
                        group_id={group_id}
                        groups={this.props.groups}
                        showGroup={showGroupDropdown}
                        changeWorkersRequired={this.changeWorkersRequired}
                        number_of_workers_required={this.state.number_of_workers_required}
                      />
                    </div>
                    {showEntityGroupError &&
                    <div className={styles.groupErrorText}>
                      <p>Some assignees do not belong to the selected Group</p>
                    </div>
                    }
                  </div>
                  <div className={cx(style.boxBodyInner)}>
                    <strong className={cx(styles.title)}>Equipment(s)</strong>
                    <FieldGroup
                      ref="equipmentSelector"
                      name="equipment-selector"
                      updateEntities={(resources) => {
                        this.setEventState('resource_ids', resources);
                      }}
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
                      canEdit={this.props.can_edit}
                      elId={Math.random().toString(36).substr(2, 16)}
                      placeholderImage={'/images/equipment.png'}
                      group_id={group_id}
                      groups={this.props.groups}
                      showGroup={showGroupDropdown}
                    />
                    {showEquipmentGroupError &&
                    <div className={styles.groupErrorText}>
                      <p>Some equipment do not belong to the selected Group</p>
                    </div>
                    }
                  </div>
                </div>
              </div>
            </Col>
          </Equalizer>
        </Row>
        {this.props.can_view_task_full_details && showSeriesEdit === true &&
        <Recurrence
          onChangeSeriesState={this.setSeriesState}
          seriesSettings={this.state.series_settings}
          recurringEnable={this.props.newEventIsRecurring}
          getTaskSeriesSettings={this.getTaskSeriesSettings}
          onSeriesEndsOnFocus={this.onSeriesEndsOnFocus}
          can_edit={this.props.can_edit}
        />
        }
        <Row className={cx(style.taskFormRow)}>
          <Col xs={12} sm={12} md={6}>
            <CustomerDetails
              event={this.state.event}
              onChangeEventState={this.setEventState}
              canViewTaskFullDetails={this.props.can_view_task_full_details}
              can_edit={this.props.can_edit}
              can_view_customer_details={this.props.can_view_customer_details}
              customers={this.state.customers}
              error={this.state.error}
              sendingCustomer={this.state.sendingCustomer}
              handleChange={this.handleChange}
              handleInputChange={this.handleInputChange}
              emptyLabel={this.state.emptyLabel}
              importing={this.props.importing}
              currentEvent={this.props.currentEvent}
              isActivity={false}
              companyProfile={this.props.companyProfile}
            />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Address
              event={this.state.event}
              onChangeEventState={this.setEventState}
              onCustomerChange={this.onMultipleChange}
              additionalAddressesUpdateCallback={this.additionalAddressesUpdateCallback}
              canViewTaskFullDetails={this.props.can_view_task_full_details}
              can_edit={this.props.can_edit}
              updateCustomer={this.updateCustomer}
            />
          </Col>
        </Row>
        <Instructions
          event={this.state.event}
          onChangeEventState={this.setEventState}
          canViewTaskFullDetails={this.props.can_view_task_full_details}
          can_create={this.props.can_create}
          can_edit={this.props.can_edit}
          extraFieldsOptions={this.props.extraFieldsOptions}
          fields={this.state.fields}
          setTaskFormState={this.setTaskFormState}
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
          serverActionPending={this.props.serverActionPending}
          attachmentServerActionPending={this.state.attachmentServerActionPending}
          savingSpinnerTitle={savingSpinnerTitle}
          isActivity={false}
          documents={this.props.documents}
          taskDocuments={this.state.taskDocuments}
          companyProfile={this.props.companyProfile}
        />
        {this.props.selectedEvent && this.props.selectedEvent.id && this.props.items && this.props.items.length > 0 &&
        <div className={cx(style.box)}>
          <h3 className={cx(style.boxTitle)}>Products</h3>
          <div className={cx(style.boxBody)}>
            <div className={cx(style.boxBodyInner)}>
              <Row className={cx(style.taskFormRow, styles.taskItemsList)}>
                <TaskProducts products={this.props.items} slidesToShow={3} slidesToScroll={3} showProductStatus
                              showProductsType showFullDetails/>
              </Row>
            </div>
          </div>
        </div>}
      </div>
    );
  }
}
