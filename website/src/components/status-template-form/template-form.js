import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './template-form.module.scss';
import { Row, Col, Modal, FormGroup, ControlLabel, FormControl, Alert, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { getDefaultStatuses, postTemplate, updateTemplate, deleteTemplate } from '../../actions/templates';
import { getMessagesNames } from '../../actions/custom-messages';
import SavingSpinner from '../saving-spinner/saving-spinner';
import cx from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/fontawesome-free-solid';
import Status from '../status/status';
import DefaultStatus from '../status/default-status';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { DropTarget } from 'react-dnd';
import { toast } from 'react-toastify';


const cardTarget = {
  drop(props, monitor, component ) {
    const { id } = props;
    const sourceObj = monitor.getItem();
  }
};
@DragDropContext(HTML5Backend)
@DropTarget("CARD", cardTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))
export default class TemplateForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      template: this.props.templateData || {
        id: '',
        name: '',
        description: '',
        status_data: [],
        status_texts: [],
        statuses: [],
        is_default: false,
        custom_messages: {
          'task_create': 9999,
          'task_reminder': 9998,
          'task_scheduled': 9997,
          'task_rescheduled': 9996,
          'review_reminder': 9993
        },
        disable_auto_start_complete: false,
        auto_complete_delay_time: 90,
        auto_start_delay_time: 15,
        mark_enroute_after_complete: false,
        next_task_info: 'Marked COMPLETE. Set ENROUTE for next task.'
      },
      serverActionIsPending: false,
      errorAlert: false,
      errorMessage: '',
      defaultStatuses: [],
      customMessages: [],
      systemMessages: [],
      messages: [],
      deletionIsPending: false,
      editingTemplate: false,
    };

    this.closeModal = this.closeModal.bind(this);
    this.renderActiveStatuses = this.renderActiveStatuses.bind(this);
    this.getAvailableStatuses = this.getAvailableStatuses.bind(this);
    this.renderDefaultStatuses = this.renderDefaultStatuses.bind(this);
    this.handleTemplateNameChange = this.handleTemplateNameChange.bind(this);
    this.handleTemplateDescriptionChange = this.handleTemplateDescriptionChange.bind(this);
    this.onStatusUpdate = this.onStatusUpdate.bind(this);
    this.onSaveTemplate = this.onSaveTemplate.bind(this);
    this.moveCard = this.moveCard.bind(this);
    this.pushCard = this.pushCard.bind(this);
    this.getDefaultStatuses = this.getDefaultStatuses.bind(this);
    this.deleteStatus = this.deleteStatus.bind(this);
    this.onUpdateTemplate = this.onUpdateTemplate.bind(this);
    this.getCustomMessages = this.getCustomMessages.bind(this);
    this.handleTemplateMessageTypesChange = this.handleTemplateMessageTypesChange.bind(this);
    this.renderCustomMessages = this.renderCustomMessages.bind(this);
    this.deleteTemplate = this.deleteTemplate.bind(this);
    this.renderSystemMessages = this.renderSystemMessages.bind(this);
    this.handleAutoStartCompleteFeatureChange = this.handleAutoStartCompleteFeatureChange.bind(this);
    this.handleAutoStartDelayTimeChange = this.handleAutoStartDelayTimeChange.bind(this);
    this.handleAutoCompleteDelayTimeChange = this.handleAutoCompleteDelayTimeChange.bind(this);
    this.handleMarkEnrouteFeatureChange = this.handleMarkEnrouteFeatureChange.bind(this);
    this.handleNextTaskInfoChange = this.handleNextTaskInfoChange.bind(this);
  }

  componentDidMount() {
    this.getAvailableStatuses();
    this.getCustomMessages();
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.showTemplateForm) {
      this.setState({
        editingTemplate: false
      });
    } else {
      if (!this.state.editingTemplate && nextProps.templateData && nextProps.templateData.id) {
        const template = $.extend(true, {}, nextProps.templateData);
        this.setState({ template, editingTemplate: true });
      } else if (!this.state.editingTemplate)  {
        this.setState({
          template: {
            id: '',
            name: '',
            description: '',
            status_data: [],
            status_texts: [],
            statuses: [],
            is_default: false,
            custom_messages: {
              'task_create': 9999,
              'task_reminder': 9998,
              'task_scheduled': 9997,
              'task_rescheduled': 9996,
              'review_reminder': 9993
            },
            mark_enroute_after_complete: false,
            next_task_info: 'Marked COMPLETE. Set ENROUTE for next task.'
          },
          editingTemplate: true
        });
      }
    }
  }

  getCustomMessages() {
    getMessagesNames().then((res) => {
      const messages = JSON.parse(res);
      const systemMessages = [];
      const customMessages = [];
      messages.map((ccMessage) => {
        if (ccMessage.type === 'SYSTEM') {
          systemMessages.push(ccMessage);
        } else if (ccMessage.type === 'CUSTOM') {
          customMessages.push(ccMessage);
        }
      });
      systemMessages.sort(this.compare);
      customMessages.sort(this.compare);
      this.setState({
        messages,
        customMessages,
        systemMessages,
      });
    }).catch((err) => {
      console.log(err);
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

  moveCard(dragIndex, hoverIndex) {
    const { status_data } = this.state.template;
    status_data.splice(hoverIndex, 0, status_data.splice(dragIndex, 1)[0]);
    const template = this.state.template;
    template.status_data = status_data;
    this.setState({
      template
    }, () => {
      const updatedTemplate = { ...this.state.template };
      this.props.onFieldsChange(updatedTemplate);
    });
  }

  pushCard(item) {
    const itemToPush = {
      // Status must have an ID in order to work both with React DND
      // And the new status to be pushed on top of the array.
      // TODO: Find a better solution than using Math.Random()
      id: item.id || Math.random().toString(36).substr(2, 16),
      title : item.title || 'CUSTOM',
      description: item.description || '',
      type_id : item.type_id,
      color : item.color || '#000000',
      type: item.type,
      require_notes: item.require_notes || false,
      require_estimate: item.require_estimate || false,
      visible_to_customer: item.visible_to_customer || false,
      require_signature: item.require_signature || false
    };
    // Updated this part of the code to prevent mutation in state variables/props.
    this.setState({ template: Object.assign({}, this.state.template, { status_data: [itemToPush, ...this.state.template.status_data] }) }, () => {
      const updatedTemplate = { ...this.state.template };
      this.props.onFieldsChange(updatedTemplate);
    });
  }

  onStatusUpdate(status) {
    const tempStatusDataArray = this.state.template.status_data;
    for (let i = 0; i < tempStatusDataArray.length; i++) {
      if (tempStatusDataArray[i].id === status.id) {
        tempStatusDataArray[i] = { ...status };
        const template = this.state.template;
        template.status_data = tempStatusDataArray;
        this.setState({ template }, () => {
          const updatedTemplate = { ...this.state.template };
          this.props.onFieldsChange(updatedTemplate);
        });
      }
    }
  }

  deleteStatus(deletedStatus) {
    const status_data = this.state.template.status_data;
    status_data.splice(status_data.map((status) => { return status.id; }).indexOf(deletedStatus.id), 1);
    this.setState(Object.assign(this.state.template, status_data), () => {
      const updatedTemplate = { ...this.state.template };
      this.props.onFieldsChange(updatedTemplate);
    });
  }

  deleteTemplate() {
    this.setState({
      deletionIsPending: true
    });
    deleteTemplate(this.state.template.id).then((res) => {
      this.setState({
        deletionIsPending: false,
        errorAlert: false,
        editingTemplate: false
      });
      this.props.hideTemplateForm();
      this.props.templateDeletedCallback();
    }).catch((err) => {
      this.setState({
        errorAlert: true,
        errorMessage: '',
        deletionIsPending: false
      });
	    const alert = {
		    text: 'Something went wrong. Cannot delete template right now.',
		    options: {
			    type: toast.TYPE.ERROR,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastErrorAlert,
			    autoClose: 8000
		    }
	    };
	    this.props.createToastAlert(alert);
    });
  }

  getDefaultStatuses() {
    const status_data = [];
    const defaultStatuses = this.state.defaultStatuses;
    const defaultStatusTypes = [1002, 1003, 1004, 1005, 1006];
    defaultStatuses.map((status) => {
      for (let i = 0; i < defaultStatusTypes.length; i++) {
        if (status.type_id === defaultStatusTypes[i]) {
          status_data.push(status);
        }
      }
    });
    return status_data;
  }

  getAvailableStatuses() {
    getDefaultStatuses().then((statuses) => {
      const defaultStatuses = JSON.parse(statuses);
      const splicedStatuses = defaultStatuses.filter(function (el) {
        return el.type_id !== 1004;
      });
      this.setState({
        defaultStatuses: splicedStatuses
      });
    });
  }

  closeModal() {
    this.props.hideTemplateForm();
    this.setState({
      errorAlert: false,
      editingTemplate: false
    });
  }

  renderDefaultStatuses() {
    const statusButtons = this.state.defaultStatuses.map((status, i) => {
      return (
        <DefaultStatus pushCard={this.pushCard} status={status} index={i} id={status.type} key={i + 1} />
      );
    });
    return statusButtons;
  }

  renderActiveStatuses() {
    let renderedResult = '';
    if (this.state.template.status_data.length === 0) {
      const complete = {
        color: '#5fe23f',
        title: 'Complete',
        type: 'COMPLETE',
        type_id: 1004,
        visible_to_customer: true
      };
      this.pushCard(complete);
    } else {
      renderedResult = this.state.template.status_data.map((status, i) => {
        return (
          <Status systemMessages={this.state.systemMessages} customMessages={this.state.customMessages} deleteStatus={this.deleteStatus} handleStatusUpdate={this.onStatusUpdate} index={i} id={status.id} moveCard={this.moveCard} statusData={status} key={status.id} />
        );
      });
    }
    return renderedResult;
  }

  renderCustomMessages(fieldName) {
    const customMessagesRendered = this.state.customMessages.map((message) => {
      return (
        <option selected={(this.state.template.custom_messages !== null && parseInt(this.state.template.custom_messages[fieldName]) === parseInt(message.message_id ? message.message_id : message.default_id)) && 'selected' } key={message.name} value={message.message_id ? message.message_id : message.default_id}>{message.name}</option> // using message.name as key because this will always be unique
      );
    });

    return customMessagesRendered;
  }

  renderSystemMessages(fieldName) {
    const systemMessagesRendered = this.state.systemMessages.map((message) => {
      return (
        <option selected={(this.state.template.custom_messages !== null && parseInt(this.state.template.custom_messages[fieldName]) === parseInt(message.message_id ? message.message_id : message.default_id)) && 'selected' } key={message.name} value={message.message_id ? message.message_id : message.default_id }>{message.name}</option> // using message.name as key because this will always be unique
      );
    });

    return systemMessagesRendered;
  }

  handleTemplateNameChange(e) {
    const template = this.state.template;
    template.name = e.target.value;
    this.setState({ template }, () => {
      const updatedTemplate = { ...this.state.template };
      this.props.onFieldsChange(updatedTemplate);
    });
  }

  handleNextTaskInfoChange(e) {
    const template = this.state.template;
    template.next_task_info = e.target.value;
    this.setState({ template }, () => {
      const updatedTemplate = { ...this.state.template };
      this.props.onFieldsChange(updatedTemplate);
    });
  }

  handleTemplateDescriptionChange(e) {
    const template = this.state.template;
    template.description = e.target.value;
    this.setState({ template }, () => {
      const updatedTemplate = { ...this.state.template };
      this.props.onFieldsChange(updatedTemplate);
    });
  }

  handleTemplateMessageTypesChange(e, fieldName) {
    const template = {
      ...this.state.template,
      custom_messages: {
        ...this.state.template.custom_messages,
        [fieldName]: e.target.value !== 'NULL' ? e.target.value : 1111
      }
    };
    this.setState({
      template
    }, () => {
      const updatedTemplate = { ...this.state.template };
      this.props.onFieldsChange(updatedTemplate);
    });
  }

  onUpdateTemplate() {
    this.setState({ pendingServerAction: true });
    if (this.state.template.name === '') {
	    this.setState({
		    pendingServerAction: false
	    });
	    const alert = {
		    text: 'Template name is required.',
		    options: {
			    type: toast.TYPE.ERROR,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastErrorAlert,
			    autoClose: 8000
		    }
	    };
	    this.props.createToastAlert(alert);
      return;
    }
    const statuses = JSON.stringify(this.state.template.status_data);
    const custom_messages = JSON.stringify(this.state.template.custom_messages);
    const auto_complete_delay_time = this.state.template.auto_complete_delay_time;
    const auto_start_delay_time = this.state.template.auto_start_delay_time;
    const disable_auto_start_complete = this.state.template.disable_auto_start_complete;
    const mark_enroute_after_complete = this.state.template.mark_enroute_after_complete;
    const next_task_info = this.state.template.next_task_info;

    updateTemplate(this.state.template.id, this.state.template.name, this.state.template.description, statuses, custom_messages, this.props.templateData.is_default, disable_auto_start_complete, auto_start_delay_time, auto_complete_delay_time, mark_enroute_after_complete, next_task_info).then(() => {
      this.props.hideTemplateForm();
      this.setState({
        errorAlert: false,
        editingTemplate: false,
        pendingServerAction: false
      });
      this.props.templateUpdated(true);
    }).catch((err) => {
      this.setState({
        pendingServerAction: false
      });
    });
  }

  onSaveTemplate() {
    this.setState({ pendingServerAction: true });
    if (this.state.template.name === '') {
      this.setState({
	      pendingServerAction: false
      });
	    const alert = {
		    text: 'Template name is required.',
		    options: {
			    type: toast.TYPE.ERROR,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastErrorAlert,
			    autoClose: 8000
		    }
	    };
	    this.props.createToastAlert(alert);
      return;
    }
    let std = [];
    if (this.state.template.status_data.length > 0) {
      std = this.state.template.status_data;
    } else {
      std = this.getDefaultStatuses();
    }
    const template = {
      'name' : this.state.template.name,
      'description' : this.state.template.description,
      'enabled' : true,
      'statuses': JSON.stringify(std),
      'custom_messages': JSON.stringify(this.state.template.custom_messages),
      'disable_auto_start_complete': this.state.template.disable_auto_start_complete,
      'mark_enroute_after_complete': this.state.template.mark_enroute_after_complete,
      'auto_start_delay_time': this.state.template.auto_start_delay_time,
      'auto_complete_delay_time': this.state.template.auto_complete_delay_time,
      'next_task_info': this.state.template.next_task_info,
    };
    postTemplate(template).then((res) => {
      this.props.hideTemplateForm();
      this.props.templateUpdated();
      this.setState({
        pendingServerAction: false,
        // TO SET EVERYTHING BACK TO EMPTY
        template: {
          id: '',
          name: '',
          description: '',
          status_data: [],
          status_texts: [],
          statuses: [],
          errorAlert: false,
          editingTemplate: false,
          custom_messages: [],
          disable_auto_start_complete: false,
          auto_start_delay_time: 15,
          auto_complete_delay_time: 90,
          mark_enroute_after_complete: false,
          next_task_info: 'Marked COMPLETE. Set ENROUTE for next task.'
        }
      });
    }).catch((err) => {
      this.setState({
        pendingServerAction: false
      });
    });
  }

  handleAutoStartCompleteFeatureChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    const template = { ...this.state.template };
    if (value === 'true') {
      template.disable_auto_start_complete = true;
    } else if (value === 'false') {
      template.disable_auto_start_complete = false;
    }
    this.setState({
      template
    });
  }

  handleMarkEnrouteFeatureChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    const template = { ...this.state.template };
    if (value === 'true') {
      template.mark_enroute_after_complete = true;
    } else if (value === 'false') {
      template.mark_enroute_after_complete = false;
    }
    this.setState({
      template
    });
  }

  handleAutoStartDelayTimeChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    const template = { ...this.state.template };
    template.auto_start_delay_time = parseInt(value, 10);
    this.setState({
      template
    });
  }

  handleAutoCompleteDelayTimeChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    const template = { ...this.state.template };
    template.auto_complete_delay_time = parseInt(value, 10);
    this.setState({
      template
    });
  }

  render() {
    const autoStartTooltip = (
      <Tooltip id="tooltip">When first task assignee arrives at customer location, task will be marked Auto Start after this time delay</Tooltip>
    );
    const autoCompleteTooltip = (
      <Tooltip id="tooltip">When all task assignee's departs from customer's location, task will be marked Auto Complete after this time delay</Tooltip>
    );
    const { connectDropTarget } = this.props;
    return (
      <Modal
        show={this.props.showTemplateForm}
        onHide={this.closeModal}
        dialogClassName={styles.addTemplateModal}
        className={styles.modalContainer}
      >
        <Modal.Header closeButton={!this.state.serverActionIsPending ? true : false} className={styles.templateModalHeader}>
          <Modal.Title id="contained-modal-title-lg">
            <h2>
              {this.state.template.id ? 'Edit' : 'Add New'} Template
            </h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={12}>
              {this.state.errorAlert &&
              <Alert bsStyle="danger">{this.state.errorMessage}</Alert>
              }
            </Col>
            <Col md={12}>
              <Row>
                <Col md={6} sm={12}>
                  <FormGroup controlId="details">
                    <ControlLabel className={styles.formFieldsLabel}>
                      Template Name
                    </ControlLabel>
                    <FormControl
                      disabled={this.state.pendingServerAction}
                      type="text"
                      value={this.state.template.name}
                      onChange={this.handleTemplateNameChange}
                      className={styles.formFields}
                      placeholder="Name"
                    />
                  </FormGroup>
                </Col>
                <Col md={6} sm={12}>
                  <FormGroup controlId="details">
                    <ControlLabel className={styles.formFieldsLabel}>
                      Template Description
                    </ControlLabel>
                    <FormControl
                      disabled={this.state.pendingServerAction}
                      type="text"
                      value={this.state.template.description}
                      onChange={this.handleTemplateDescriptionChange}
                      className={styles.formFields}
                      placeholder="Description"
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Col>
            <Col md={12} >
              <h2 className={styles.header}>
                Customer Messages
              </h2>
              <p className={styles.infoNoPadding}><FontAwesomeIcon icon={faInfoCircle} /> Select custom messages for default statuses.</p>
              <div className={styles.sectionOutlined}>
                <Row>
                  <Col md={6} sm={12}>
                    <FormGroup controlId="details">
                      <ControlLabel className={styles.formFieldsLabel}>
                        Task Create
                      </ControlLabel>
                      <FormControl className={styles.formFields} componentClass="select" name="task_create" onChange={(e) => this.handleTemplateMessageTypesChange(e, 'task_create')} placeholder="Select a Custom Message">
                        <option value="" selected disabled hidden>Select a message</option>
                        <option value="NULL" selected={this.state.template.custom_messages !== null && this.state.template.custom_messages['task_create'] === 1111 && 'selected'}>NO MESSAGE</option>
                        <optgroup label="Default Messages">
                          {this.renderSystemMessages('task_create')}
                        </optgroup>
                        <optgroup label="Custom Messages">
                          {this.renderCustomMessages('task_create')}
                        </optgroup>
                      </FormControl>
                    </FormGroup>
                  </Col>
                  <Col md={6} sm={12}>
                    <FormGroup controlId="details">
                      <ControlLabel className={styles.formFieldsLabel}>
                        Task Reminder
                      </ControlLabel>
                      <FormControl className={styles.formFields} componentClass="select" name="task_reminder" onChange={(e) => this.handleTemplateMessageTypesChange(e, 'task_reminder')} placeholder="Select a Custom Message">
                        <option value="" selected disabled hidden>Select a message</option>
                        <option value="NULL" selected={this.state.template.custom_messages !== null && this.state.template.custom_messages['task_reminder'] === 1111 && 'selected'}>NO MESSAGE</option>
                        <optgroup label="Default Messages">
                          {this.renderSystemMessages('task_reminder')}
                        </optgroup>
                        <optgroup label="Custom Messages">
                          {this.renderCustomMessages('task_reminder')}
                        </optgroup>
                      </FormControl>
                    </FormGroup>
                  </Col>
                  <Col md={6} sm={12}>
                    <FormGroup controlId="details">
                      <ControlLabel className={styles.formFieldsLabel}>
                        Task Scheduled
                      </ControlLabel>
                      <FormControl className={styles.formFields} componentClass="select" name="task_scheduled" onChange={(e) => this.handleTemplateMessageTypesChange(e, 'task_scheduled')} placeholder="Select a Custom Message">
                        <option value="" selected disabled hidden>Select a message</option>
                        <option value="NULL" selected={this.state.template.custom_messages !== null && this.state.template.custom_messages['task_scheduled'] === 1111 && 'selected'}>NO MESSAGE</option>
                        <optgroup label="Default Messages">
                          {this.renderSystemMessages('task_scheduled')}
                        </optgroup>
                        <optgroup label="Custom Messages">
                          {this.renderCustomMessages('task_scheduled')}
                        </optgroup>
                      </FormControl>
                    </FormGroup>
                  </Col>
                  <Col md={6} sm={12}>
                    <FormGroup controlId="details">
                      <ControlLabel className={styles.formFieldsLabel}>
                        Task Rescheduled
                      </ControlLabel>
                      <FormControl className={styles.formFields} componentClass="select" name="task_rescheduled" onChange={(e) => this.handleTemplateMessageTypesChange(e, 'task_rescheduled')} placeholder="Select a Custom Message">
                        <option value="" selected disabled hidden>Select a message</option>
                        <option value="NULL" selected={this.state.template.custom_messages !== null && this.state.template.custom_messages['task_rescheduled'] === 1111 && 'selected'}>NO MESSAGE</option>
                        <optgroup label="Default Messages">
                          {this.renderSystemMessages('task_rescheduled')}
                        </optgroup>
                        <optgroup label="Custom Messages">
                          {this.renderCustomMessages('task_rescheduled')}
                        </optgroup>
                      </FormControl>
                    </FormGroup>
                  </Col>
                  <Col md={6} sm={12}>
                    <FormGroup controlId="details">
                      <ControlLabel className={styles.formFieldsLabel}>
                        Review Reminder
                      </ControlLabel>
                      <FormControl className={styles.formFields} componentClass="select" name="review_reminder" onChange={(e) => this.handleTemplateMessageTypesChange(e, 'review_reminder')} placeholder="Select a Custom Message">
                        <option value="" selected disabled hidden>Select a message</option>
                        <option value="NULL" selected={this.state.template.custom_messages !== null && this.state.template.custom_messages['review_reminder'] === 1111 && 'selected'}>NO MESSAGE</option>
                        <optgroup label="Default Messages">
                          {this.renderSystemMessages('review_reminder')}
                        </optgroup>
                        <optgroup label="Custom Messages">
                          {this.renderCustomMessages('review_reminder')}
                        </optgroup>
                      </FormControl>
                    </FormGroup>
                  </Col>
                  <Col md={6} sm={12}>
                    <div className="clearfix"></div>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col md={12} >
              <h2 className={styles.header}>
                Auto Start/Auto Complete Tasks
              </h2>
              <div className={styles.sectionOutlined}>
                <Row>
                  <Col md={6} sm={12}>
                    <FormGroup controlId="details">
                      <ControlLabel className={styles.formFieldsLabel}>
                        AUTO-START & AUTO-COMPLETE
                      </ControlLabel>
                      <FormControl onChange={(e) => this.handleAutoStartCompleteFeatureChange(e)} defaultValue={typeof this.state.template.disable_auto_start_complete !== 'undefined' ? this.state.template.disable_auto_start_complete.toString() : 'false'} className={styles.formFields} componentClass="select" name="auto_start_complete">
                        <option value="false">Enabled</option>
                        <option value="true">Disabled</option>
                      </FormControl>
                    </FormGroup>
                  </Col>
                  {!this.state.template.disable_auto_start_complete &&
                    <div>
                      <Col md={6} sm={12}>
                        <FormGroup controlId="details">
                          <OverlayTrigger placement="top" overlay={autoStartTooltip}>
                            <ControlLabel className={styles.formFieldsLabel}>
                              Mark Auto-start after
                            </ControlLabel>
                          </OverlayTrigger>
                          <FormControl onChange={(e) => this.handleAutoStartDelayTimeChange(e)} defaultValue={typeof this.state.template.auto_start_delay_time !== 'undefined' ? this.state.template.auto_start_delay_time.toString() : '15'} className={styles.formFields} componentClass="select" name="auto_start_time">
                            <option value="1">1 Minute</option>
                            <option value="5">5 Minutes</option>
                            <option value="15">15 Minutes</option>
                            <option value="30">30 Minutes</option>
                            <option value="45">45 Minutes</option>
                            <option value="60">1 Hour</option>
                            <option value="75">1 Hour 15 Minutes</option>
                            <option value="90">1 Hour 30 Minutes</option>
                            <option value="105">1 Hour 45 Minutes</option>
                            <option value="120">2 Hours</option>
                          </FormControl>
                        </FormGroup>
                      </Col>
                      <Col md={6} sm={12}>
                        <FormGroup controlId="details">
                          <OverlayTrigger placement="top" overlay={autoCompleteTooltip}>
                            <ControlLabel className={styles.formFieldsLabel}>
                              Mark Auto-complete after
                            </ControlLabel>
                          </OverlayTrigger>
                          <FormControl onChange={(e) => this.handleAutoCompleteDelayTimeChange(e)} defaultValue={typeof this.state.template.auto_complete_delay_time !== 'undefined' ? this.state.template.auto_complete_delay_time.toString() : '90'} className={styles.formFields} componentClass="select" name="auto_complete_time">
                            <option value="1">1 Minutes</option>
                            <option value="5">5 Minutes</option>
                            <option value="15">15 Minutes</option>
                            <option value="30">30 Minutes</option>
                            <option value="60">1 Hour</option>
                            <option value="90">1 Hour 30 Minutes</option>
                            <option value="120">2 Hours</option>
                            <option value="150">2 Hours 30 Minutes</option>
                            <option value="180">3 Hours</option>
                            <option value="210">3 Hours 30 Minutes</option>
                            <option value="240">4 Hours</option>
                          </FormControl>
                        </FormGroup>
                      </Col>
                    </div>
                  }
                  <Col md={6} sm={12}>
                    <div className="clearfix"></div>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col md={12} >
              <h2 className={styles.header}>
                Mark ENROUTE After COMPLETE
              </h2>
              <div className={styles.sectionOutlined}>
                <Row>
                  <Col md={6} sm={12}>
                    <FormGroup controlId="details">
                      <ControlLabel className={styles.formFieldsLabel}>
                        Mark ENROUTE for next task on COMPLETE
                      </ControlLabel>
                      <FormControl onChange={(e) => this.handleMarkEnrouteFeatureChange(e)} defaultValue={typeof this.state.template.mark_enroute_after_complete !== 'undefined' ? this.state.template.mark_enroute_after_complete.toString() : 'true'} className={styles.formFields} componentClass="select" name="mark_enroute_after_complete">
                        <option value="true">Enable</option>
                        <option value="false">Disable</option>
                      </FormControl>
                    </FormGroup>
                  </Col>
                  <Col md={6} sm={12}>
                    <FormGroup controlId="details">
                      <ControlLabel className={styles.formFieldsLabel}>
                        Next Task Info
                      </ControlLabel>
                      <FormControl
                        disabled={!this.state.template.mark_enroute_after_complete}
                        type="text"
                        value={(this.state.template.next_task_info !== null && typeof this.state.template.next_task_info !== 'undefined') ?this.state.template.next_task_info : 'Marked COMPLETE. Set ENROUTE for next task.' }
                        onChange={this.handleNextTaskInfoChange}
                        className={styles.formFields}
                        placeholder="Next Task Info"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </div>
            </Col>
            {
              connectDropTarget(
                <div>
                  <Col md={6} sm={12} xs={12}>
                    <h2 className={styles.header}>
                      Active Statuses
                    </h2>
                    <div className={styles.statusesListContainer}>
                      <p className={styles.info}>
                        <FontAwesomeIcon icon={faInfoCircle} /> Drag a status from the right panel to activate.
                      </p>
                      {this.renderActiveStatuses()}
                    </div>
                  </Col>
                </div>
              )
            }
            <Col md={6} sm={12} xs={12}>
              <h2 className={styles.header}>
                Available Statuses
              </h2>
              <div className={cx(styles.statusesListContainer, styles.rightPanel)}>
                <p className={styles.info}>
                  <FontAwesomeIcon icon={faInfoCircle} /> Drag a status to the left panel or double click it to make it active.
                </p>
                {this.renderDefaultStatuses()}
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className={styles.templateModalFooter}>
          <div className="text-center">
            {this.state.template.id === '' &&
            <Button onClick={() => this.onSaveTemplate()} type="submit" className={cx(['btn-submit'], styles.saveBtn)}>
              { this.state.pendingServerAction ? <SavingSpinner title={''} borderStyle="none" /> : 'Save Template' }
            </Button>
            }
            {this.state.template.id !== '' &&
            <Button onClick={() => this.onUpdateTemplate()} type="submit" className={cx(['btn-submit'], styles.saveBtn)}>
              { this.state.pendingServerAction ? <SavingSpinner title={''} borderStyle="none" /> : 'Update Template' }
            </Button>
            }
            <Button className={cx('btn-submit', styles.transparentButton)} onClick={() => this.closeModal()}>Close</Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

TemplateForm.propTypes = {
  showTemplateForm: PropTypes.bool.isRequired,
  hideTemplateForm: PropTypes.func.isRequired,
  templateData: PropTypes.object,
  templateUpdated: PropTypes.func.isRequired,
  onFieldsChange: PropTypes.func,
};
