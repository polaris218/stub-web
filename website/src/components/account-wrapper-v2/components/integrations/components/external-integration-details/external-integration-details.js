import {Component} from 'react';
import cx from 'classnames';
import styles from './external-integration-details.module.scss';
import {
  Button,
  Col,
  ControlLabel,
  Dropdown,
  FormControl,
  FormGroup,
  Grid,
  MenuItem,
  Row,
  Modal,
  Tabs, Tab, Nav, NavItem, TabContent, TabPane, TabContainer, Badge, Checkbox
} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import React from 'react';
import SavingSpinner from '../../../../../saving-spinner/saving-spinner';
import {toast} from 'react-toastify';
import {
  addIntegration, deleteIntegration, fetchExternaldData, getIntegration,
  updateIntegration, verifyIntegrationKeys,
} from '../../../../../../actions/external-integrations';
import {getErrorMessage} from '../../../../../../helpers/task';
import {extractIntegrationInfo} from '../../../../../../helpers/external-integrations';
import Select from 'react-select';
import {getTimezoneOptions} from '../../../../../../helpers';
import moment from 'moment';
import TimePickerV4 from '../../../../../timepicker/timepickerv4';
import DatePicker from 'react-bootstrap-date-picker';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faCalendar, faAngleLeft} from '@fortawesome/fontawesome-free-solid';
import DurationPicker from '../../../../../duration-picker/duration-picker';
import {defaultFetchHourlyDurations} from '../../../../../../helpers/default-durations';
import style from '../../../../../task-wrapper-v2/base-styling.module.scss';
import ExtraFieldWithOptions from "./extra-field-with-options";

export default class ExternalIntegrationDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      verified: false,
      verifying: false,
      deleting: false,
      updating: false,
      integrationInfo: null,
      interval: null,
      timezonesOptions: [],
      fetchTaskHourlyInterval: '5 hrs',
      fetchTasksAs: 'UNSCHEDULED',
      time: '12:00 AM',
      dataFetchRange: '0',
      isSyncNowRangeInit: false,
      tabSelected: 1,
      showLogDetail: false,
      logsListLoaded: false,
      logDetails: null,
      logsListCompleted: true,
      integrationLogsList: [],
      arrivy_group_id: null,
      arrivy_group_name: null,
      template_ids: [],
      enable_time_window_display: false,
      time_window_start: '30',

    };

    this.changeAccessToken = this.changeAccessToken.bind(this);
    this.verifyAccessToken = this.verifyAccessToken.bind(this);
    this.addUpdateIntegration = this.addUpdateIntegration.bind(this);
    this.deleteIntegration = this.deleteIntegration.bind(this);
    this.showToast = this.showToast.bind(this);
    this.onChangeFetchTriggerInterval = this.onChangeFetchTriggerInterval.bind(this);
    this.onChangeScheduledUnScheduled = this.onChangeScheduledUnScheduled.bind(this);
    this.onChangeFetchTimezone = this.onChangeFetchTimezone.bind(this);
    this.populateTimeZones = this.populateTimeZones.bind(this);
    this.initializeStateFromReceivedProps = this.initializeStateFromReceivedProps.bind(this);
    this.shouldDisableEditing = this.shouldDisableEditing.bind(this);
    this.inputTimeChange = this.inputTimeChange.bind(this);
    this.renderTimePicker = this.renderTimePicker.bind(this);
    this.renderModal = this.renderModal.bind(this);
    this.renderTokenMismatchModal = this.renderTokenMismatchModal.bind(this);
    this.saveIntegration = this.saveIntegration.bind(this);
    this.fetchNow = this.fetchNow.bind(this);
    this.renderInputFields = this.renderInputFields.bind(this);
    this.hasAuthKeys = this.hasAuthKeys.bind(this);
    this.renderDataFetchRangeDropDown = this.renderDataFetchRangeDropDown.bind(this);
    this.renderCreateScheduledUnScheduledDropDown = this.renderCreateScheduledUnScheduledDropDown.bind(this);
    this.renderFetchTriggerIntervalDropDown = this.renderFetchTriggerIntervalDropDown.bind(this);
    this.onChangeDataFetchRange = this.onChangeDataFetchRange.bind(this);
    this.getStartEndDate = this.getStartEndDate.bind(this);
    this.getLastSyncMessage = this.getLastSyncMessage.bind(this);
    this.renderSuccessLogItem = this.renderSuccessLogItem.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.selectGroup = this.selectGroup.bind(this);
    this.onTemplateChange = this.onTemplateChange.bind(this);
  }

  componentWillMount() {
    this.populateTimeZones();
  }

  componentDidMount() {
    this.logsListCompleted = true;
    let haveReceivedIntegrationInfo = false;
    if (typeof this.props.externalIntegrations !== 'undefined' && this.props.externalIntegrations !== null) {
      haveReceivedIntegrationInfo = true;
    }
    let info = this.props.externalIntegrations;
    this.initializeStateFromReceivedProps(info, haveReceivedIntegrationInfo);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    let haveReceivedIntegrationInfo = this.state.haveReceivedIntegrationInfo;
    if (typeof this.props.externalIntegrations !== 'undefined' && this.props.externalIntegrations !== null) {
      haveReceivedIntegrationInfo = true;
    }

    let info = nextProps.externalIntegrations;
    this.initializeStateFromReceivedProps(info, haveReceivedIntegrationInfo);
  }

  createTemplatesInfo(templatesInfo) {
    let newTemplatesInfo = [];
    for (let name in templatesInfo) {
      if (templatesInfo.hasOwnProperty(name)) {
        newTemplatesInfo.push({
          name: name,
          value: templatesInfo[name],
        });
      }
    }
    return newTemplatesInfo;
  }

  initializeStateFromReceivedProps(info, haveReceivedIntegrationInfo) {
    if (!this.state.integrationInfo && !info) {
      return;
    }
    let logsListCompleted = this.logsListCompleted;
    if (!this.state.logsListLoaded && this.logsListCompleted) {
      // need to load complete logs
      this.getIntegrationLogs(info.id);
      logsListCompleted = false;
      this.logsListCompleted = false;
    }

    let authKeys = this.state.authKeys ? this.state.authKeys : null;
    let verifiedAuthKeys = null;
    if (info && info.authentication_keys) {
      authKeys = $.extend(true, {}, info.authentication_keys);
      verifiedAuthKeys = $.extend(true, {}, info.authentication_keys);
    }

    let dataFetchRange = this.state.dataFetchRange;
    let shouldChangeRange = false;
    if (!this.state.isSyncNowRangeInit && info && typeof info.data_fetch_range !== 'undefined') {
      shouldChangeRange = true;
    }
    if (info && typeof info.data_fetch_range !== 'undefined') {
      dataFetchRange = info.data_fetch_range;
    }
    const fetchNowStartDate = this.state.fetchNowStartDate || moment().startOf('day').format();
    let fetchNowEndDate = this.state.fetchNowEndDate;
    if (shouldChangeRange || !fetchNowEndDate) {
      fetchNowEndDate = moment(fetchNowStartDate).endOf('day').add(dataFetchRange, 'hours').format();
    }
    let arrivy_group_id, arrivy_group_name;

    const primaryGroup = this.props.groups && this.props.groups.length > 0 && this.props.groups.filter((group) => group.is_implicit && group);

    arrivy_group_id = primaryGroup && primaryGroup.length > 0 && primaryGroup[0].id;
    arrivy_group_name = primaryGroup && primaryGroup.length > 0 && primaryGroup[0].name;

    if (this.showGroups() || this.props.integrationInfo.is_group_based) {
      arrivy_group_id = info && info.data_fetch_additional_settings && info.data_fetch_additional_settings.arrivy_group_id ? info.data_fetch_additional_settings.arrivy_group_id : primaryGroup && primaryGroup.length > 0 && primaryGroup[0].id;
      arrivy_group_name = info && info.data_fetch_additional_settings && info.data_fetch_additional_settings.arrivy_group_name ? info.data_fetch_additional_settings.arrivy_group_name : primaryGroup && primaryGroup.length > 0 && primaryGroup[0].name;

    }

    const enable_time_window_display = info && info.data_fetch_additional_settings && info.data_fetch_additional_settings.enable_time_window_display ? info.data_fetch_additional_settings.enable_time_window_display : false;
    const time_window_start = info && info.data_fetch_additional_settings && info.data_fetch_additional_settings.time_window_start ? info.data_fetch_additional_settings.time_window_start : '30';

    const template_ids = info && info.data_fetch_additional_settings && info.data_fetch_additional_settings.templates_info ? this.createTemplatesInfo(info.data_fetch_additional_settings.templates_info) : [];

    const newInfo = this.getFinalIntegrationInfoAndCurrentDetail(info);
    info = newInfo.newInfo;
    const logDetails = newInfo.logDetails;
    if (!this.state.haveReceivedIntegrationInfo && haveReceivedIntegrationInfo) {
      // first time data received, give props priority
      this.setState({
        integrationInfo: info,
        authKeys,
        verifiedAuthKeys,
        interval: info && info.data_fetch_trigger_interval ? info.data_fetch_trigger_interval : this.state.interval,
        dataFetchRange,
        timezone: (info && info.data_fetch_trigger_time_zone) ? info.data_fetch_trigger_time_zone : (this.props.profile && this.props.profile.timezone) ? this.props.profile.timezone : this.state.timezone,
        time: info && info.data_fetch_trigger_time ? moment(info.data_fetch_trigger_time, ['HH:mm:ss']).format('h:mm A') : this.state.time,
        verified: !!info,
        fetchNowStartDate,
        fetchNowEndDate,
        fetchTaskHourlyInterval: info && info.data_fetch_additional_settings && info.data_fetch_additional_settings.repeat_after_every ? info.data_fetch_additional_settings.repeat_after_every + ' hrs' : this.state.fetchTaskHourlyInterval,
        fetchTasksAs: info && info.data_fetch_additional_settings && info.data_fetch_additional_settings.fetch_tasks_as ? info.data_fetch_additional_settings.fetch_tasks_as : this.state.fetchTasksAs,
        isSyncNowRangeInit: true,
        haveReceivedIntegrationInfo,
        logsListCompleted,
        logDetails: logDetails,
        arrivy_group_id,
        arrivy_group_name,
        enable_time_window_display,
        time_window_start,
        template_ids
      });
    } else {
      // data already updated once, preserve state
      this.setState({
        integrationInfo: info,
        authKeys: this.state.authKeys || authKeys,
        verifiedAuthKeys: this.state.verifiedAuthKeys || verifiedAuthKeys,
        interval: info && info.data_fetch_trigger_interval ? info.data_fetch_trigger_interval : this.state.interval,
        dataFetchRange: this.state.dataFetchRange || dataFetchRange,
        timezone: this.state.timezone ? this.state.timezone : (info && info.data_fetch_trigger_time_zone) ? info.data_fetch_trigger_time_zone : (this.props.profile && this.props.profile.timezone) ? this.props.profile.timezone : null,
        time: this.state.time ? this.state.time : info && info.data_fetch_trigger_time ? moment(info.data_fetch_trigger_time, ['HH:mm:ss']).format('h:mm A') : '12:00 AM',
        verified: !!info,
        fetchNowStartDate: this.state.fetchNowStartDate || fetchNowStartDate,
        fetchNowEndDate: this.state.fetchNowEndDate || fetchNowEndDate,
        fetchTaskHourlyInterval: this.state.fetchTaskHourlyInterval ? this.state.fetchTaskHourlyInterval : info && info.data_fetch_additional_settings && info.data_fetch_additional_settings.repeat_after_every ? info.data_fetch_additional_settings.repeat_after_every + ' hrs' : '5 hrs',
        fetchTasksAs: this.state.fetchTasksAs ? this.state.fetchTasksAs : info && info.data_fetch_additional_settings && info.data_fetch_additional_settings.fetch_tasks_as ? info.data_fetch_additional_settings.fetch_tasks_as : 'UNSCHEDULED',
        isSyncNowRangeInit: true,
        logsListCompleted,
        logDetails: logDetails,
        arrivy_group_id: this.state.arrivy_group_id || arrivy_group_id,
        arrivy_group_name: this.state.arrivy_group_name || arrivy_group_name,
        enable_time_window_display: typeof this.state.enable_time_window_display !== 'undefined' ? this.state.enable_time_window_display : enable_time_window_display,
        time_window_start: this.state.time_window_start || time_window_start,
        template_ids: this.state.template_ids || template_ids
      },()=>{
        let logsListCompleted = this.logsListCompleted;
        if (logsListCompleted && this.shouldRefreshLogs()){
          this.logsListCompleted = false;
          this.getIntegrationLogs();
        }
      });
    }

  }

  populateTimeZones() {
    const timezonesOptions = getTimezoneOptions();
    this.setState({timezonesOptions});
  }

  changeAccessToken(e, key) {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value ? e.target.value.trim() : e.target.value;
    const authKeys = this.state.authKeys || {};
    authKeys[key] = value;
    this.setState({authKeys});
  }

  inputTimeChange(value) {
    this.setState({time: value});
  }

  onTemplateChange(extra_fields) {
    const template_ids = this.state.template_ids;
    this.setState({template_ids});
  }

  renderTimePicker() {
    return (
      <TimePickerV4
        value={this.state.time}
        updateValue={(value) => {
          this.inputTimeChange(value);
        }}
        disabled={this.shouldDisableEditing()}
        elId={Math.random().toString(36).substr(2, 16)}
        className={cx(styles.timeFiled)}
        placeholder="HH:MM AM"
      />
    );
  }

  selectGroup(e) {
    const selectedGroup = this.props.groups && this.props.groups.filter((group) => group.id == e.target.value);

    if (selectedGroup && selectedGroup.length > 0) {
      this.setState({
        arrivy_group_id: selectedGroup[0].id,
        arrivy_group_name: selectedGroup[0].name,
      });
    }
  }


  verifyAccessToken(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.hasAuthKeys()) {
      this.showToast('Please enter auth keys', toast.TYPE.ERROR);
      return;
    }

    let arrivy_group_id, arrivy_group_name;

    const primaryGroup = this.props.groups && this.props.groups.length > 0 && this.props.groups.filter((group) => group.is_implicit && group);
    arrivy_group_id = primaryGroup && primaryGroup.length > 0 && primaryGroup[0].id;
    arrivy_group_name = primaryGroup && primaryGroup.length > 0 && primaryGroup[0].name;

    this.setState({verifying: true, arrivy_group_id, arrivy_group_name});

    verifyIntegrationKeys({
      'authentication_keys': JSON.stringify(this.state.authKeys),
      'integration_type': this.props.integrationInfo.type,
    }).then((res) => {
      this.showToast('Auth keys Verified', toast.TYPE.SUCCESS);
      let verifiedAuthKeys = $.extend(true, {}, this.state.authKeys);
      this.setState({
        verifying: false,
        verified: true,
        interval: this.state.interval ? this.state.interval :
          (this.state.integrationInfo && this.state.integrationInfo.data_fetch_trigger_interval) ? this.state.integrationInfo.data_fetch_trigger_interval : 'DAILY',
        dataFetchRange: this.state.dataFetchRange ? this.state.dataFetchRange :
          (this.state.integrationInfo && this.state.integrationInfo.data_fetch_range) ? this.state.integrationInfo.data_fetch_range : '0',
        timezone: this.state.timezone ? this.state.timezone :
          (this.state.integrationInfo && this.state.integrationInfo.data_fetch_trigger_time_zone) ? this.state.integrationInfo.data_fetch_trigger_time_zone :
            (this.props.profile && this.props.profile.timezone) ? this.props.profile.timezone : null,
        time: this.state.time ? this.state.time :
          (this.state.integrationInfo && this.state.integrationInfo.data_fetch_trigger_time) ? this.state.integrationInfo.data_fetch_trigger_time : null,
        verifiedAuthKeys,
        fetchTasksAs: this.state.fetchTasksAs ? this.state.fetchTasksAs :
          (this.state.integrationInfo && this.state.integrationInfo.data_fetch_additional_settings && this.state.integrationInfo.data_fetch_additional_settings.fetch_tasks_as)
            ? this.state.integrationInfo.data_fetch_additional_settings.fetch_tasks_as : 'UNSCHEDULED',
        fetchNowStartDate: this.state.fetchNowStartDate || moment().startOf('day').format(),
        fetchNowEndDate: this.state.fetchNowEndDate || moment().endOf('day').format(),
      });
    }).catch((err) => {
      this.setState({verifying: false, verified: false});
      const response_error = JSON.parse(err.responseText);
      this.showToast(getErrorMessage(response_error), toast.TYPE.ERROR);
    });
  }

  hasAuthKeys() {
    let hasKeys = true;
    this.props.inputFieldsInfo.forEach((info, index) => {
      if (!this.state.authKeys || !this.state.authKeys[info.key]) {
        hasKeys = false;
      }
    });
    return hasKeys;
  }

  addUpdateIntegration(e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.hasAuthKeys()) {
      if (this.props.integrationInfo.show_template_picker) {
        const templates_info = [...this.state.template_ids];
        let hasDuplicateTemplate = false;
        let hasEmptyName = false;
        for (let i = 0; i < templates_info.length; i++) {
          if (!templates_info[i].name || templates_info[i].name.trim() === "") {
            hasEmptyName = true;
            break;
          }
          if (i === templates_info.length - 1)
            break;
          if (templates_info[i].name && templates_info[i + 1].name && templates_info[i].name.toUpperCase() === templates_info[i + 1].name.toUpperCase()) {
            hasDuplicateTemplate = true;
            break
          }
        }
        if (hasEmptyName) {
          this.showToast('Template name can not be empty', toast.TYPE.ERROR);
          return;
        }
        if (hasDuplicateTemplate) {
          this.showToast('Templates names must be unique', toast.TYPE.ERROR);
          return;
        }
      }
      if (this.state.authKeys && this.state.verifiedAuthKeys && !_.isEqual(this.state.authKeys, this.state.verifiedAuthKeys)) {
        //user must have changed auth keys after verification show popup
        this.setState({
          showTokenMismatchModal: true,
        });
        return;
      }
      this.saveIntegration();
    } else {
      this.showToast('Please enter auth keys', toast.TYPE.ERROR);
    }
  }

  showGroups = () => {
    return this.props.integrationInfo.is_group_based && this.props.groups && this.props.groups.length > 1;
  }

  deleteIntegration(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.integrationInfo && this.state.integrationInfo.authentication_keys) {
      this.setState({deleting: true});
      deleteIntegration(this.state.integrationInfo.id).then((res) => {
        this.props.onDeleteIntegration(this.state.integrationInfo.id);
        this.setState({
          authKeys: null,
          integrationInfo: null,
          deleting: false,
          isSyncNowRangeInit: false,
          haveReceivedIntegrationInfo: false,
          verified: false,
          verifying: false,
          updating: false,
          interval: null,
          fetchTaskHourlyInterval: '5 hrs',
          fetchTasksAs: 'UNSCHEDULED',
          time: '12:00 AM',
          dataFetchRange: '0',
          tabSelected: 1,
          showLogDetail: false,
          logsListLoaded: false,
          logDetails: null,
        });
        this.showToast('Integration deleted successfully', toast.TYPE.SUCCESS);
      }).catch((err) => {
        this.setState({deleting: false});
        const response_error = JSON.parse(err.responseText);
        this.showToast(getErrorMessage(response_error), toast.TYPE.ERROR);
      });
    }
  }

  saveIntegration() {
    this.setState({updating: true, allowMismatchToken: false});
    const data_fetch_additional_settings = {
      'fetch_tasks_as': this.state.fetchTasksAs,
    };
    let data_fetch_trigger_time = this.state.time ? moment(this.state.time, ['h:mm A']).format('HH:mm:ss') : null;
    if (this.state.interval && this.state.interval === 'HOURLY') {
      data_fetch_additional_settings['repeat_after_every'] = this.state.fetchTaskHourlyInterval ? parseInt(this.state.fetchTaskHourlyInterval) : null;
      data_fetch_trigger_time = null;
    }
    const authentication_keys = this.state.authKeys;
    if (this.showGroups() || this.props.integrationInfo.is_group_based) {

      data_fetch_additional_settings['arrivy_group_id'] = this.state.arrivy_group_id;
      data_fetch_additional_settings['arrivy_group_name'] = this.state.arrivy_group_name;

      this.props.inputFieldsInfo.map((field, index) => {
        if (field.external_integration_group_id) {
          data_fetch_additional_settings['external_integration_group_id'] = authentication_keys[field.key];
        }
        if (field.external_integration_group_name) {
          data_fetch_additional_settings['external_integration_group_name'] = authentication_keys[field.key];
        }
      });

    }

    if (this.props.integrationInfo.show_arrival_window) {

      data_fetch_additional_settings['enable_time_window_display'] = this.state.enable_time_window_display;
      data_fetch_additional_settings['time_window_start'] = this.state.time_window_start;
    }
    if (this.props.integrationInfo.show_template_picker) {
      const templates_info = [...this.state.template_ids];
      let templates_info_new = {};
      templates_info.map((template_info, index) => {
        templates_info_new[[template_info.name]] = template_info.value;
      });
      data_fetch_additional_settings['templates_info'] = templates_info_new;
    }

    let external_integration_payload = {
      'integration_type': this.props.integrationInfo.type,
      'authentication_mechanism': 'API-key',
      'authentication_keys': JSON.stringify(authentication_keys),
      'resource_type': 'TASK',
      'data_fetch_trigger_time': data_fetch_trigger_time,
      'data_fetch_trigger_time_zone': this.state.timezone,
      'data_fetch_trigger_interval': this.state.interval,
      'data_fetch_range': this.state.dataFetchRange,
      'data_fetch_additional_settings': JSON.stringify(data_fetch_additional_settings),
      'extra_fields': {},
      'is_group_based': this.props.integrationInfo.is_group_based ? this.props.integrationInfo.is_group_based : false,
    };
    if (this.state.integrationInfo && this.state.integrationInfo.authentication_keys && this.state.integrationInfo.authentication_keys) {
      updateIntegration(this.state.integrationInfo.id, external_integration_payload).then((res) => {
        const response = JSON.parse(res);
        external_integration_payload.authentication_keys = authentication_keys;
        external_integration_payload.id = response.id;
        external_integration_payload.data_fetch_additional_settings = data_fetch_additional_settings;
        if (this.state.integrationInfo && this.state.integrationInfo.data_fetch_history) {
          external_integration_payload.data_fetch_history = this.state.integrationInfo.data_fetch_history;
        }

        this.setState({
          updating: false,
        });
        this.showToast('Integration updated successfully', toast.TYPE.SUCCESS);
        this.props.onAddUpdateIntegration(external_integration_payload, 'updated');
        // this.props.getExternalIntegrations(true);
      }).catch((err) => {
        this.setState({
          updating: false,
        });
        const response_error = JSON.parse(err.responseText);
        this.showToast(getErrorMessage(response_error), toast.TYPE.ERROR);
      });
    } else {
      addIntegration(external_integration_payload).then((res) => {
        const response = JSON.parse(res);
        external_integration_payload.authentication_keys = authentication_keys;
        external_integration_payload.id = response.id;
        external_integration_payload.data_fetch_additional_settings = data_fetch_additional_settings;
        if (this.state.integrationInfo && this.state.integrationInfo.data_fetch_history) {
          external_integration_payload.data_fetch_history = this.state.integrationInfo.data_fetch_history;
        }

        this.setState({
          updating: false,
        }, () => this.props.showNewIntegrationForm && this.props.showNewIntegrationForm(false));
        this.showToast('Integration added successfully', toast.TYPE.SUCCESS);
        this.props.onAddUpdateIntegration(external_integration_payload);
        // this.props.getExternalIntegrations(true);
      }).catch((err) => {
        this.setState({
          updating: false,
        });
        const response_error = JSON.parse(err.responseText);
        this.showToast(getErrorMessage(response_error), toast.TYPE.ERROR);
      });
    }
  }

  fetchNow(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.state.fetchNowStartDate || !this.state.fetchNowEndDate) {
      this.showToast('Start and End date required', toast.TYPE.ERROR);
      return;
    }
    const startDate = this.state.fetchNowStartDate;
    const endDate = this.state.fetchNowEndDate;

    if (startDate > endDate) {
      this.showToast('Start date can not be greater than end date.', toast.TYPE.ERROR);
      return;
    }

    const payload = {
      'external_integration_id': this.props.externalIntegrations.id,
      'from': startDate,
      'to': endDate
    };
    this.setState({
      fetching: true,
    }, () => this.props.shouldDisableTabs && this.props.shouldDisableTabs(true));
    fetchExternaldData(payload).then((res) => {

      res = res && JSON.parse(res);
      if (res && typeof res.message !== 'undefined') {
        this.showToast(res.message, toast.TYPE.SUCCESS);
      }
      this.setState({
        fetching: false,
      }, () => this.props.shouldDisableTabs && this.props.shouldDisableTabs(false));
      this.props.getExternalIntegrations();
      if (this.shouldRefreshLogs()) {
        this.getIntegrationLogs()
      }
    }).catch((err) => {
      this.setState({
        fetching: false,
      }, () => this.props.shouldDisableTabs && this.props.shouldDisableTabs(false));
      const response_error = JSON.parse(err.responseText);
      this.showToast(getErrorMessage(response_error), toast.TYPE.ERROR);
    });


  }

  shouldRefreshLogs() {
    if (this.state.integrationInfo && this.state.integrationInfo.data_fetch_history) {
      for (let i = 0; i < this.state.integrationInfo.data_fetch_history.length; i++) {
        if (this.state.integrationInfo.data_fetch_history[i].status && (this.state.integrationInfo.data_fetch_history[i].status !== "COMPLETE" && this.state.integrationInfo.data_fetch_history[i].status !== "FAILED")) {
          return true;
        }
      }
    }
    return false;
  }

  getIntegrationLogs(id = null) {
    if (id || (this.state.integrationInfo && this.state.integrationInfo.id)) {
      getIntegration(id || this.state.integrationInfo.id, false, 10).then((res) => {
        const showLogDetail = this.state.showLogDetail;
        let logDetails = this.state.logDetails;
        const integrationInfo = JSON.parse(res);
        if (showLogDetail && logDetails) {
          // check which details is shown at the top and update that accordingly
          if (integrationInfo && integrationInfo.data_fetch_history && Array.isArray(integrationInfo.data_fetch_history)) {
            logDetails = integrationInfo.data_fetch_history.find((history) => {
              return history.id === logDetails.id;
            })
          }
        }

        this.setState({
          integrationInfo: integrationInfo, logsListLoaded: true, logDetails: logDetails
        });
        this.logsListCompleted = true;
      }).catch((err) => {
        console.log(err);
      });
    }
  }


  getFinalIntegrationInfoAndCurrentDetail(newInfo) {
    let newLogDetails = null;
    if (this.state.integrationInfo && newInfo) {
      // check if current integrations details has logs if so loop loop through it and update new info's logs accordingly
      if (newInfo.data_fetch_history && newInfo.data_fetch_history.length === 0) {
        //means there are no logs if there are some previous logs remove them
        return {newInfo, logDetails: newLogDetails};
      } else if (newInfo.data_fetch_history && newInfo.data_fetch_history.length >= 1) {
        // means an update was called from parent and limited info is fetched check if have more logs in state if so concat them with new one after removing same
        const newInfoLatestLog = newInfo.data_fetch_history[0];
        const currentLogDetails = this.state.logDetails;
        let currentLogs = this.state.integrationInfo.data_fetch_history;
        let newLogs = [];
        newLogs.push(newInfoLatestLog);
        currentLogs.forEach((currentLog, index) => {
          if (currentLog.id !== newInfoLatestLog.id) {
            newLogs.push(currentLog);
          }
          if (!newLogDetails) {
            if (currentLogDetails && currentLogDetails.id === newInfoLatestLog.id) {
              newLogDetails = newInfoLatestLog;
            } else if (currentLogDetails && currentLogDetails.id === currentLog.id) {
              newLogDetails = currentLog;
            }
          }
        });
        newInfo.data_fetch_history = newLogs;
      }
    }
    return {newInfo, logDetails: newLogDetails};
  }

  onChangeFetchTriggerInterval(value) {
    const dataFetchRange = value === 'HOURLY' ? '0' : this.state.dataFetchRange;
    const startEndDates = this.getStartEndDate(dataFetchRange);
    this.setState({
      interval: value,
      dataFetchRange,
      fetchNowStartDate: startEndDates.fetchNowStartDate,
      fetchNowEndDate: startEndDates.fetchNowEndDate,
    });
  }

  onChangeScheduledUnScheduled(value) {
    this.setState({fetchTasksAs: value});
  }

  onChangeDataFetchRange(value) {
    this.setState({dataFetchRange: value});
    const dataFetchRange = value;
    const startEndDates = this.getStartEndDate(dataFetchRange);
    const fetchNowStartDate = startEndDates.fetchNowStartDate;
    const fetchNowEndDate = startEndDates.fetchNowEndDate;
    this.setState({
      dataFetchRange,
      fetchNowStartDate,
      fetchNowEndDate,
    });
  }

  getStartEndDate(dataFetchRange) {
    const fetchNowStartDate = moment().startOf('day').format();
    const fetchNowEndDate = moment(fetchNowStartDate).add(dataFetchRange, 'hours').endOf('day').format();
    return {fetchNowStartDate: fetchNowStartDate, fetchNowEndDate: fetchNowEndDate};
  }

  onChangeFetchTimezone(timezone) {
    this.setState({timezone: timezone.value});
  }

  shouldDisableEditing() {
    return this.state.verifying || this.state.deleting || this.state.updating || this.state.fetching;
  }

  showToast(msg, type) {
    const message = {
      text: msg,
      options: {
        type: type,
        position: toast.POSITION.BOTTOM_LEFT,
        className: type === toast.TYPE.ERROR ? styles.toastErrorAlert : styles.toastSuccessAlert,
        autoClose: 8000
      }
    };
    this.props.createToastAlert(message);
  }

  toggleInput() {
    this.setState(
      Object.assign(this.state,
        {type: this.state.type === 'input' ? 'password' : 'input'})
    );
  }

  getLastSyncMessage(data_fetch_history) {
    const lastSyncTrigger = data_fetch_history.data_fetch_trigger_source;
    const lastSyncStatus = data_fetch_history.status;
    const detailedErrorMessage = (data_fetch_history.detailed_logs && data_fetch_history.detailed_logs.error_logs && data_fetch_history.detailed_logs.error_logs[0] && data_fetch_history.detailed_logs.error_logs[0].description) || '';
    const lastSyncDate = moment.utc(data_fetch_history.data_fetch_datetime).local().format('MM/DD/YYYY, hh:mm A');
    const dataFetchRangeStartDatetime = data_fetch_history.data_fetch_range_start_datetime ? moment.utc(data_fetch_history.data_fetch_range_start_datetime).local().format('MM/DD/YYYY') : null;
    const dataFetchRangeEndDatetime = data_fetch_history.data_fetch_range_end_datetime ? moment.utc(data_fetch_history.data_fetch_range_end_datetime).local().format('MM/DD/YYYY') : null;
    const lastSyncRange = (dataFetchRangeStartDatetime && dataFetchRangeEndDatetime) ? (' for the range ' + dataFetchRangeStartDatetime + ' - ' + dataFetchRangeEndDatetime) : '';
    let message = '';

    let detailedMessage = this.getLogsCountMessage(data_fetch_history);

    if (lastSyncTrigger && lastSyncTrigger.toLowerCase() === 'manual') {
      message = 'Sync was initiated manually at ' + lastSyncDate + lastSyncRange;
    } else {
      message = 'Automated sync was initiated at ' + lastSyncDate + lastSyncRange;
    }

    if (lastSyncStatus) {
      switch (lastSyncStatus) {
        case 'COMPLETE': {
          message += ' and was completed successfully.';
          if (detailedMessage) {
            message += ' ' + detailedMessage + ' below are the detailed logs.';
          } else {
            message += ' no task found';
          }
          break;
        }
        case 'FAILED': {
          message += ' and failed. ' + detailedErrorMessage;
          break;
        }
        default: {
          message += ' and is still in progress.';
          break;
        }
      }
    }
    return message;
  }

  getLogsCountMessage(data_fetch_history) {
    let createdTasksCount = 0, updatedTaskCount = 0;
    let errorCount = data_fetch_history.detailed_logs && data_fetch_history.detailed_logs.error_logs ? data_fetch_history.detailed_logs.error_logs.length : 0;
    if (data_fetch_history.detailed_logs && data_fetch_history.detailed_logs.success_logs && Array.isArray(data_fetch_history.detailed_logs.success_logs)) {
      data_fetch_history.detailed_logs.success_logs.forEach((successLog, index) => {
        if (successLog.data && successLog.data['Task Result'] && successLog.data['Task Result'].operation_performed) {
          switch (successLog.data['Task Result'].operation_performed) {
            case 'CREATE': {
              createdTasksCount++;
              break;
            }
            case 'UPDATE': {
              updatedTaskCount++;
              break;
            }
          }
        }
      });
    }
    let detailedMessage = '';
    if (createdTasksCount) {
      detailedMessage = createdTasksCount + ' Task(s) created';
    }
    if (updatedTaskCount) {
      if (detailedMessage) {
        detailedMessage += ', ';
      }
      detailedMessage += updatedTaskCount + ' Task(s) updated';
    }
    if (errorCount) {
      if (detailedMessage) {
        detailedMessage += ', ';
      }
      detailedMessage += errorCount + ' error(s) ';
    }
    return detailedMessage;
  }

  shouldShowLoaderOnLogs(data_fetch_history) {
    if (data_fetch_history.status) {
      switch (data_fetch_history.status) {
        case 'COMPLETE':
        case 'FAILED': {
          return false;
        }
        default : {
          return true;
        }
      }
    }
    return false;
  }

  handleSelect(eventKey) {
    this.setState({
      active_tab: eventKey
    });
  }

  renderTokenMismatchModal() {
    return this.renderModal(<div>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Token mismatch</h3>
        </div>
        <div className={styles.bodyInner}>
          <div className={styles.box}>
            <div className={styles.boxBody}>
              <div className={styles.boxBodyInner}>
                <p>Verified auth key(s) do not match with current auth key(s). Save anyways?</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <button onClick={() => {
              this.setState({showTokenMismatchModal: false});
            }} className={cx(styles.btn, styles['btn-light'])}>Cancel
            </button>
            <button onClick={() => {
              this.setState({showTokenMismatchModal: false, allowMismatchToken: true}, () => this.saveIntegration());
            }} className={cx(styles.btn, styles['btn-secondary'])} title="">Yes
            </button>
          </div>
        </div>
      </div>,
      () => {
        this.setState({showTokenMismatchModal: false});
      });
  }

  renderModal(contents, onCrossClick) {
    return (
      <Modal show={true} animation={false} dialogClassName={cx(styles.modalCustomerNote)}>
        <Modal.Body>
          <i className={cx(styles.close)} onClick={onCrossClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756">
              <g transform="translate(-1270.486 -30.485)">
                <path
                  d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z"
                  transform="translate(4126.197 -40.804)" fill="#8d959f"/>
              </g>
            </svg>
          </i>
          {contents}
        </Modal.Body>
      </Modal>
    );
  }

  renderInputFields() {

    const html = this.props.inputFieldsInfo.map((info, index) => {
      let autoComplete = info.type && info.type === 'password' ? 'new-password' : 'auto';
      return (
        <FormGroup>
          <ControlLabel componentClass={ControlLabel}>{info.title}</ControlLabel>

          <FormControl autoComplete={autoComplete} type={info.type ? info.type : 'text'} name={info.key}
                       value={(this.state.authKeys && this.state.authKeys[info.key]) || ''}
                       disabled={this.shouldDisableEditing()}
                       onChange={(e) => {
                         this.changeAccessToken(e, info.key);
                       }}/>
        </FormGroup>
      );
    });

    return html;
  }

  renderDropDown(list, selectedItem, isDisabled, onChange, id) {
    return (
      <Dropdown id={id} disabled={isDisabled} className={styles['user-plan']}
                onSelect={onChange}>
        <Dropdown.Toggle className={styles['user-plan-toggle']}>
          <div className={styles['user-plan-info']}>
            <span className={'text-uppercase ' + styles['user-plan-name']}>{selectedItem.label}</span>
            <small className={styles['user-plan-calls']}>{selectedItem.details}</small>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className={styles['user-plan-menu']}>
          {list.map((itemC) => {
            return (
              <MenuItem className={styles['user-plan-item']} key={itemC.value}
                        ref={itemC.value} eventKey={itemC.value} href="javascript:void(0)">
                <div className={styles['user-plan-info']}>
                  <span className={'text-uppercase ' + styles['user-plan-name']}>{itemC.label}</span>
                  <small className={styles['user-plan-calls']}>{itemC.details}</small>
                </div>
              </MenuItem>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    );

  }

  renderFetchTriggerIntervalDropDown() {
    let list = [
      {value: 'HOURLY', label: 'HOURLY', details: 'synchronize task(s) on hourly basis'},
      {value: 'DAILY', label: 'DAILY', details: 'synchronize task(s) on daily basis'},
    ];
    let item = list[1];
    let selectedItem = this.state.interval ? this.state.interval : (this.state.integrationInfo && this.state.integrationInfo.data_fetch_trigger_interval) ? this.state.integrationInfo.data_fetch_trigger_interval : null;
    if (selectedItem) {
      for (let i = 0; i < list.length; i++) {
        if (selectedItem === list[i].value) {
          item = list[i];
          break;
        }
      }
    }
    return this.renderDropDown(list, item, this.shouldDisableEditing(), this.onChangeFetchTriggerInterval, 'sync_interval');
  }

  renderDataFetchRangeDropDown() {
    let list = [
      {value: '0', label: 'Current date', details: 'synchronize tasks for current day per sync'}
    ];
    let item = list[0];
    let selectedItem = this.state.dataFetchRange;
    if (this.state.interval && this.state.interval !== 'HOURLY') {
      for (let i = 1; i <= 6; i++) {
        list.push({
          value: (i * 24).toString(),
          label: 'Current date + ' + i + ' day' + ((i !== 1) ? 's' : ''),
          details: 'synchronize tasks for ' + i + ' day' + ((i !== 1) ? 's' : '') + ' per sync'
        });

      }
      list.push({value: '168', label: 'Current date + 1 week', details: 'synchronize tasks for 1 week per sync'});
      list.push({value: '336', label: 'Current date + 2 weeks', details: 'synchronize tasks for 2 weeks per sync'});
    }
    if (selectedItem) {
      for (let i = 0; i < list.length; i++) {
        if (parseInt(selectedItem) === parseInt(list[i].value)) {
          item = list[i];
          break;
        }
      }
    }
    return this.renderDropDown(list, item, (this.shouldDisableEditing() || this.state.interval === 'HOURLY'), this.onChangeDataFetchRange, 'dataFetchRange');
  }

  renderCreateScheduledUnScheduledDropDown() {
    let list = [
      {value: 'UNSCHEDULED', label: 'UNSCHEDULED', details: 'create synchronized task(s) as un-scheduled'},
      {value: 'SCHEDULED', label: 'SCHEDULED', details: 'create synchronized task(s) as scheduled'},
    ];
    let item = list[0];
    let selectedItem = this.state.fetchTasksAs ? this.state.fetchTasksAs : (this.state.integrationInfo && this.state.integrationInfo.data_fetch_additional_settings &&
      this.state.integrationInfo.data_fetch_additional_settings.fetch_tasks_as) ? this.state.integrationInfo.data_fetch_additional_settings.fetch_tasks_as : null;
    if (selectedItem) {
      for (let i = 0; i < list.length; i++) {
        if (selectedItem === list[i].value) {
          item = list[i];
          break;
        }
      }
    }
    return this.renderDropDown(list, item, this.shouldDisableEditing(), this.onChangeScheduledUnScheduled, 'scheduled_un_scheduled');
  }

  renderSuccessLogItem(successLog, index) {
    const taskTitle = successLog.task_title;
    const taskId = successLog.data && successLog.data['Task Result'] && successLog.data['Task Result'].response && Array.isArray(successLog.data['Task Result'].response) && successLog.data['Task Result'].response[0] ? successLog.data['Task Result'].response[0].id : null;
    const taskExternalId = successLog.task_external_id;
    let isCreated = true;
    if (successLog.data && successLog.data['Task Result'] && successLog.data['Task Result'].operation_performed && successLog.data['Task Result'].operation_performed === 'UPDATE') {
      isCreated = false;
    }
    return (
      <li><strong>{taskTitle || 'Task'}</strong> {isCreated ? ' created' : ' updated'} with External ID: <strong>{taskExternalId}</strong> <a href={'/tasks/' + taskId} target="_blank"> view task</a>.</li>
    );
  }

  renderErrorLogItem(errorLog, index) {
    const taskTitle = errorLog.task_title;
    const taskExternalId = errorLog.task_external_id;

    if (taskExternalId) {
      return (
        <li>Task with title: <strong>{taskTitle}</strong> and External ID: <strong>{taskExternalId} </strong>.<br/> <strong> Error </strong>:{errorLog.description}</li>
      );
    } else if (errorLog.description) {
      return (<li>{errorLog.description}</li>);
    }
    return ('');
  }


  renderOrpahnLogItem(orphanLog, index) {
    const taskTitle = orphanLog.task_title;
    const taskId = orphanLog.task_id;
    const taskExternalId = orphanLog.task_external_id;

    return (
      <li><strong>{taskTitle}</strong> with External ID: <strong>{taskExternalId}</strong> not found in current sync.<a href={'/tasks/' + taskId} target="_blank"> view task</a>.</li>
    );
    return ('');
  }

  renderIntegrationDetailedLogs(data_fetch_history) {
    const detailedLogs = data_fetch_history && data_fetch_history.detailed_logs ? data_fetch_history.detailed_logs : null;
    return (
      <div>
        <p>{this.getLastSyncMessage(data_fetch_history)}</p>
        {/*todo save tab selected somehow*/}
        <TabContainer activeKey={this.state.active_tab || 1} className={styles.tabsPrimary}>
          <div>
            <Nav bsStyle="tabs">
              <NavItem eventKey={1} href="javascript:void (0)"
                       onSelect={(eventKey) => this.handleSelect(eventKey)}>Success &nbsp;
                {detailedLogs && detailedLogs.success_logs && detailedLogs.success_logs.length > 0 ?
                  <Badge
                    className={cx(styles['badge-success'])}>{detailedLogs.success_logs.length}</Badge> : ''}
              </NavItem>
              <NavItem eventKey={2} href="javascript:void (0)"
                       onSelect={(eventKey) => this.handleSelect(eventKey)}>Errors &nbsp;
                {detailedLogs && detailedLogs.error_logs && detailedLogs.error_logs.length > 0 ?
                  <Badge
                    className={cx(styles['badge-danger'])}>{detailedLogs.error_logs.length}</Badge> : ''}
              </NavItem>
              {detailedLogs && detailedLogs.orphan_tasks && Array.isArray(detailedLogs.orphan_tasks) && detailedLogs.orphan_tasks.length > 0 &&
              <NavItem eventKey={3} href="javascript:void (0)"
                       onSelect={(eventKey) => this.handleSelect(eventKey)}>Orphan &nbsp;
                {<Badge className={cx(styles['badge-warning'])}>{detailedLogs.orphan_tasks.length}</Badge>}
              </NavItem>}
            </Nav>
            <TabContent>
              <TabPane eventKey={1}>
                <div className={cx(styles.boxBody)}>
                  <div className={cx(styles.boxBodyInner)}>
                    {this.shouldShowLoaderOnLogs(data_fetch_history) ?
                      <SavingSpinner title="Syncing" borderStyle="none"/> :
                      (detailedLogs && detailedLogs.success_logs &&
                        Array.isArray(detailedLogs.success_logs)) ?
                        <ul className={styles.logs}>
                          {detailedLogs.success_logs.map((successLog, successLogIndex) => {
                            return this.renderSuccessLogItem(successLog, successLogIndex);
                          })}
                        </ul> : ''
                    }
                  </div>
                </div>
              </TabPane>
              <TabPane eventKey={2}>
                <div className={cx(styles.boxBody)}>
                  <div className={cx(styles.boxBodyInner)}>
                    {this.shouldShowLoaderOnLogs(data_fetch_history) ?
                      <SavingSpinner title="Syncing" borderStyle="none"/> :
                      (detailedLogs && detailedLogs.error_logs &&
                        Array.isArray(detailedLogs.error_logs))?
                        <ul className={styles.logs}>
                          {detailedLogs.error_logs.map((errorLog, errorLogIndex) => {
                            return this.renderErrorLogItem(errorLog, errorLogIndex);
                          })}
                        </ul> : <div className="text-center">No errors found</div>
                    }
                  </div>
                </div>
              </TabPane>
              {detailedLogs && detailedLogs.orphan_tasks && Array.isArray(detailedLogs.orphan_tasks) && detailedLogs.orphan_tasks.length > 0 &&
              <TabPane eventKey={3}>
                <div className={cx(styles.boxBody)}>
                  <div className={cx(styles.boxBodyInner)}>
                    {this.shouldShowLoaderOnLogs(data_fetch_history) ?
                      <SavingSpinner title="Syncing" borderStyle="none"/> :
                      <ul className={styles.logs}>
                        {detailedLogs.orphan_tasks.map((orphanLog, orphanLogIndex) => {
                          return this.renderOrpahnLogItem(orphanLog, orphanLogIndex);
                        })}
                      </ul>
                    }
                  </div>
                </div>
              </TabPane>}
            </TabContent>
          </div>
        </TabContainer>
      </div>);
  }

  renderIntegrationLogs(integrationLogs) {
    return (<Col md={12} lg={6}>
      <div className={cx(styles.boxBodyMask)}>
        <div className={cx(styles.boxBodyInner)}>
          <h3 className={cx(styles.boxTitle)}>Synchronization logs</h3>
          {this.state.showLogDetail && <i className={cx(styles.backToCard)} onClick={() => {
            this.setState({showLogDetail: false, logDetails: null, active_tab: 1});
          }}><FontAwesomeIcon icon={faAngleLeft}/></i>}
          <div className={cx(styles.cardToggleWrapper, this.state.showLogDetail ? styles.active : '')}>
            <div className={styles.cardWrapper}>
              {integrationLogs.map((integrationLog, index) => {
                let statusText = 'In Progress',
                  statusColorClass = 'pending';
                if (integrationLog.status) {
                  switch (integrationLog.status) {
                    case 'COMPLETE' : {
                      statusText = 'Completed';
                      statusColorClass = 'completed';
                      break;
                    }
                    case 'FAILED' : {
                      statusText = 'Failed';
                      statusColorClass = 'error';
                      break;
                    }
                  }
                }
                const lastSyncDate = moment.utc(integrationLog.data_fetch_datetime).local().format('MM/DD/YYYY, hh:mm A');
                const dataFetchRangeStartDatetime = integrationLog.data_fetch_range_start_datetime ? moment.utc(integrationLog.data_fetch_range_start_datetime).local().format('MM/DD/YYYY') : null;
                const dataFetchRangeEndDatetime = integrationLog.data_fetch_range_end_datetime ? moment.utc(integrationLog.data_fetch_range_end_datetime).local().format('MM/DD/YYYY') : null;
                const lastSyncRange = (dataFetchRangeStartDatetime && dataFetchRangeEndDatetime) ? (dataFetchRangeStartDatetime + ' - ' + dataFetchRangeEndDatetime) : '';
                return <div className={styles.card} key={index} onClick={() => {
                  this.setState({showLogDetail: true, logDetails: integrationLog});
                }}>
                  <ul>
                    <li><strong>Sync Date:</strong> {lastSyncDate}</li>
                    <li><strong>Sync Range:</strong> {lastSyncRange} </li>
                    <li><strong>Sync Status:</strong> <span
                      className={cx(styles.status, styles[statusColorClass])}>{statusText}</span></li>
                    <li><strong>Sync Summary:</strong> {this.getLogsCountMessage(integrationLog) || '--'}</li>
                  </ul>
                </div>
              })}
            </div>
            <div className={styles.cardDetailsWrapper}>{
              this.state.logDetails && this.renderIntegrationDetailedLogs(this.state.logDetails)
            }</div>
          </div>
        </div>
      </div>
    </Col>);
  }

  getIntegrationGroupName() {
    let groupName = "";
    if (this.state.integrationInfo && this.state.integrationInfo.data_fetch_additional_settings && this.state.integrationInfo.data_fetch_additional_settings.external_integration_group_name &&
      this.state.integrationInfo.data_fetch_additional_settings.arrivy_group_id && this.state.integrationInfo.data_fetch_additional_settings.external_integration_group_id) {
      groupName = this.state.integrationInfo.data_fetch_additional_settings.external_integration_group_name;
    }
    return groupName;
  }

  render() {
    const groupName = this.getIntegrationGroupName();
    const data_fetch_history = this.state.integrationInfo && this.state.integrationInfo.data_fetch_history && Array.isArray(this.state.integrationInfo.data_fetch_history) ? this.state.integrationInfo.data_fetch_history : null;
    // todo below is for testing purposes only, to test logs as puosub is not working on local
    // const data_fetch_history = temp[0].data_fetch_history;
    const fields = [];
    return (
      <div>
        {!this.state.allowMismatchToken && this.state.showTokenMismatchModal && this.renderTokenMismatchModal()}
        <Row>
          <Col md={12} lg={6}>
            <div className={cx(styles.boxBodyMask)}>
              <div className={cx(styles.boxBodyInner)}>
                <Row className={cx(styles['integration-name-section'])}>
                  <Col xs={6} sm={6} md={6} lg={6}>
                    <h3
                      className={cx(styles.boxTitle)}>{groupName && this.props.groups && this.props.groups.length > 1 ? this.props.integrationInfo.title + " - " + groupName : this.props.integrationInfo.title}</h3>
                  </Col>
                  <Col xs={6} sm={6} md={6} lg={6} className="text-right">
                    {this.state.integrationInfo && <Button type="button" disabled={this.shouldDisableEditing()}
                                                           className={cx(styles.btn, styles['btn-delete'])}
                                                           onClick={this.deleteIntegration}>
                      {this.state.deleting ? <SavingSpinner size={8} borderStyle="none"/> : 'Delete'}
                    </Button>}
                  </Col>
                </Row>
                {this.renderInputFields()}
              </div>
              <div className={cx(styles.boxBodyInner, styles.btnWrapper, ['text-right'])}>
                <Button type="button" disabled={this.shouldDisableEditing()}
                        className={cx(styles.btn, styles['btn-secondary'])} onClick={this.verifyAccessToken}>
                  {this.state.verifying ? <SavingSpinner size={8}
                                                         borderStyle="none"/> : this.state.verified || this.state.integrationInfo ? 'Refresh' : 'Verify'}
                </Button>
              </div>

              {(this.state.integrationInfo || this.state.verified) &&
              <div className={cx(styles.boxBodyInner)}>
                <div>
                  <FormGroup>
                    <ControlLabel componentClass={ControlLabel}>Synchronization Trigger Interval</ControlLabel>
                    {this.renderFetchTriggerIntervalDropDown()}
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel componentClass={ControlLabel}>Synchronization Date Range</ControlLabel>
                    {this.renderDataFetchRangeDropDown()}
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel componentClass={ControlLabel}>Synchronization Trigger Interval
                      Timezone</ControlLabel>
                    <Select
                      onChange={this.onChangeFetchTimezone}
                      id='timezones'
                      isMulti={false}
                      placeholder={'Select synchronize timezone...'}
                      options={this.state.timezonesOptions}
                      value={this.state.timezonesOptions.find((el) => {
                        return el.value === this.state.timezone;
                      })}
                      isDisabled={this.shouldDisableEditing()}
                      isSearchable
                      className={styles.timeZoneSelect}
                      classNamePrefix="selectInner"
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel componentClass={ControlLabel}>Create Tasks as</ControlLabel>
                    {this.renderCreateScheduledUnScheduledDropDown()}
                  </FormGroup>
                  <div className={styles['field-wrapper']}>
                    <Row className={cx(styles.taskFormRow)}>
                      {this.state.interval && this.state.interval === 'DAILY' && <Col xs={12} sm={6}>
                        <FormGroup className={cx(styles.fieldGroup)}>
                          <ControlLabel>Synchronization Time</ControlLabel>
                          <TimePickerV4
                            value={this.state.time}
                            updateValue={(value) => {
                              this.inputTimeChange(value);
                            }}
                            disabled={this.shouldDisableEditing()}
                            elId={Math.random().toString(36).substr(2, 16)}
                            className={cx(styles.timeFiled)}
                            placeholder="HH:MM AM"
                          />
                        </FormGroup>
                      </Col>}
                      {this.state.interval && this.state.interval === 'HOURLY' && <Col xs={12} sm={6}>
                        <FormGroup className={cx(styles.fieldGroup)}>
                          <ControlLabel>Synchronization Hourly Interval</ControlLabel>
                          <DurationPicker
                            durationList={defaultFetchHourlyDurations}
                            value={this.state.fetchTaskHourlyInterval}
                            updateValue={(value) => {
                              const fetchTaskHourlyInterval = this.state.fetchTaskHourlyInterval;
                              if (parseInt(value) <= 12) {
                                this.setState({fetchTaskHourlyInterval: value});
                              } else {
                                this.setState({fetchTaskHourlyInterval});
                              }
                            }}
                            disabled={this.shouldDisableEditing()}
                            elId={Math.random().toString(36).substr(2, 16)}
                            className={cx(styles.timeFiled)}
                            placeholder="5 hrs"
                            timeRegEx={/^((\d+\s(hrs|hr)))$/i}
                            hasMins={false}
                            option='duration'
                          />
                        </FormGroup>
                      </Col>}
                      {this.props.integrationInfo && this.props.integrationInfo.is_group_based && this.props.groups && this.props.groups.length > 1 &&
                      <Col xs={12} sm={6}>
                        <FormGroup className={cx(styles.fieldGroup)}>
                          <ControlLabel>Group</ControlLabel>
                          <div className={styles.selectBox}>
                            <FormControl onChange={(e) => this.selectGroup(e)} disabled={this.shouldDisableEditing()}
                                         componentClass="select" placeholder="select">
                              {this.props.groups && this.props.groups.map((group, key) => {
                                return (<option selected={group.id === this.state.arrivy_group_id} value={group.id}
                                                key={key}>{group.name}</option>)
                              })}
                            </FormControl>
                          </div>
                        </FormGroup>
                      </Col>}
                    </Row>
                  </div>
                  {this.props.integrationInfo && this.props.integrationInfo.show_template_picker &&
                  <div>
                    <ControlLabel>Templates ({this.props.integrationInfo.templateDescriptionText})</ControlLabel>
                    <ExtraFieldWithOptions fields={this.state.template_ids} onChange={this.onTemplateChange}
                                           templates={this.props.templates} addNewText={'Add Template'}
                                           fieldNamePlaceholer={this.props.integrationInfo.templateFieldNamePlaceholder}/>
                  </div>
                  }
                  {this.props.integrationInfo && this.props.integrationInfo.show_arrival_window &&
                  <div className={styles['time-window-group']}>
                    <Checkbox className={styles.checkBox} checked={this.state.enable_time_window_display}
                              onChange={() => this.setState({enable_time_window_display: !this.state.enable_time_window_display})}><span>Use arrival window of Task Start Time +</span></Checkbox>
                    <FormGroup controlId="formControlsSelect" className={styles.selectBox}>
                      <FormControl componentClass="select" value={this.state.time_window_start} placeholder="select"
                                   disabled={!this.state.enable_time_window_display}
                                   onChange={(e) => e.target.value && this.setState({time_window_start: e.target.value})}>
                        <option value="30">30 mins</option>
                        <option value="60">1 hr</option>
                        <option value="90">1 hr 30 mins</option>
                        <option value="120">2 hrs</option>
                        <option value="150">2 hrs 30 mins</option>
                        <option value="180">3 hrs</option>
                        <option value="210">3 hrs 30 mins</option>
                        <option value="240">4 hrs</option>
                        <option value="270">4 hrs 30 mins</option>
                        <option value="300">5 hrs</option>
                      </FormControl>
                    </FormGroup>
                  </div>}
                </div>
                <div className={cx(styles.btnWrapper, ['text-right'])}>
                  <Button type="button" disabled={this.shouldDisableEditing()}
                          className={cx(styles.btn, styles['btn-secondary'])} onClick={this.addUpdateIntegration}>
                    {this.state.updating ? <SavingSpinner size={8}
                                                          borderStyle="none"/> : this.state.integrationInfo ? 'Update' : 'Add'}
                  </Button>
                </div>
              </div>
              }
              {this.state.integrationInfo &&
              <div className={cx(styles.boxBodyInner)}>
                <div className={styles.syncNowSectionHeading}>
                  <ControlLabel className={cx(styles.boxTitle)}>Synchronize Now</ControlLabel>
                  <ControlLabel>Synchronize Tasks scheduled between these dates</ControlLabel>
                </div>
                <div className={styles['field-wrapper']}>
                  <Row className={cx(styles.taskFormRow)}>
                    <Col xs={12} sm={6}>
                      <FormGroup className={cx(styles.fieldGroup)}>
                        <ControlLabel>Start Date</ControlLabel>
                        <div className={cx(styles.inner, styles.datePicker)}>
                          <FormControl componentClass={DatePicker}
                                       onChange={(value) => {
                                         this.setState({fetchNowStartDate: moment(value).startOf('day').format()});
                                       }}
                                       minDate={moment().subtract(15, 'days').format("YYYY-MM-DD")}
                                       maxDate={moment().add(15, 'days').format("YYYY-MM-DD")}
                                       showClearButton={false} name="fetch_now_start_date"
                                       ref="fetch_now_start_date"
                                       disabled={this.shouldDisableEditing()}
                                       value={this.state.fetchNowStartDate}/>
                          <FontAwesomeIcon icon={faCalendar} className={styles['fa-icon']}/>
                        </div>
                      </FormGroup>
                    </Col>
                    <Col xs={12} sm={6}>
                      <FormGroup className={cx(styles.fieldGroup)}>
                        <ControlLabel>End Date</ControlLabel>
                        <div className={cx(styles.inner, styles.datePicker)}>
                          <FormControl componentClass={DatePicker}
                                       onChange={(value) => {
                                         this.setState({fetchNowEndDate: moment(value).endOf('day').format()});
                                       }}
                                       minDate={moment().subtract(15, 'days').format("YYYY-MM-DD")}
                                       maxDate={moment().add(15, 'days').format("YYYY-MM-DD")}
                                       showClearButton={false} name="fetch_now_end_date"
                                       ref="fetch_now_end_date"
                                       disabled={this.shouldDisableEditing()}
                                       value={this.state.fetchNowEndDate}/>
                          <FontAwesomeIcon icon={faCalendar} className={styles['fa-icon']}/>
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
                <div className={cx(styles.btnWrapper, ['text-right'])}>
                  <Button type="button" disabled={this.shouldDisableEditing()}
                          className={cx(styles.btn, styles['btn-secondary'])}
                          onClick={this.fetchNow}>
                    {this.state.fetching ? <SavingSpinner size={8} borderStyle="none"/> : 'Synchronize'}
                  </Button>
                </div>
              </div>
              }
            </div>
          </Col>
          {data_fetch_history && Array.isArray(data_fetch_history) && data_fetch_history.length > 0 ? this.renderIntegrationLogs(data_fetch_history) :
            this.state.integrationInfo && <Col md={12} lg={6}>
              <div className={cx(styles.boxBodyMask)}>
                <div className={cx(styles.boxBodyInner)}>
                  <h3 className={cx(styles.boxTitle)}>Synchronization logs will appear here</h3></div>
              </div>
            </Col>}
        </Row>
      </div>
    );
  }
}
