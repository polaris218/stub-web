import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './template-form.module.scss';
import {
  Row,
  Col,
  Modal,
  FormGroup,
  ControlLabel,
  FormControl,
  Alert,
  Button,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import {getDefaultStatuses, postTemplate, updateTemplate, deleteTemplate} from '../../../../../../actions/templates';
import {getMessagesNames} from '../../../../../../actions/custom-messages';
import {getDocumentssNames} from '../../../../../../actions/document';
import SavingSpinner from '../../../../../saving-spinner/saving-spinner';
import cx from 'classnames';
import Status from '../status/status';
import DefaultStatus from '../status/default-status';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {DropTarget} from 'react-dnd';
import {toast} from 'react-toastify';
import SwitchButton from "../../../../../../helpers/switch_button";
import extraFieldsOptions from "../../../../../../helpers/extra_fields_options";
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/fontawesome-free-solid';
import ExtraFieldWithType from "../../../../../extra_field_with_type/extra_field_with_type";
import {ColorField} from "../../../../../fields";
import {colorPalette} from "../../../../../../helpers/color";

const FieldGroup = ({ id, label, staticField, fieldInfo, ...props }) => (
  <FormGroup controlId={id}>
    <ControlLabel componentClass={ControlLabel}>{label}</ControlLabel>
    {staticField ?
      (<FormControl.Static>
        {props.value}
      </FormControl.Static>) :
      (<FormControl {...props} />)
    }
    <i>{fieldInfo}</i>
  </FormGroup>
);

const cardTarget = {
  drop(props, monitor, component) {
    const {id} = props;
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
        next_task_info: 'Marked COMPLETE. Set ENROUTE for next task.',
        color: colorPalette()[Math.floor(Math.random()*colorPalette().length)],
        document_ids: [],
      },
      serverActionIsPending: false,
      errorAlert: false,
      errorMessage: '',
      defaultStatuses: [],
      customMessages: [],
      systemMessages: [],
      documents: [],
      messages: [],
      selectedDocuments: [],
      deletionIsPending: false,
      editingTemplate: false,
      showDocumentsModal: false,
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
    this.onExtraFieldsChange = this.onExtraFieldsChange.bind(this);
    this.getDocumentNames = this.getDocumentNames.bind(this);
    this.renderTemplateDocuments = this.renderTemplateDocuments.bind(this);
    this.renderDocumentsModal = this.renderDocumentsModal.bind(this);
    this.closeDocumentModal = this.closeDocumentModal.bind(this);
    this.handleAddDocumentClick = this.handleAddDocumentClick.bind(this);
    this.handleSelectDocument = this.handleSelectDocument.bind(this);
    this.handleDoneClick = this.handleDoneClick.bind(this);
    this.removeDocument = this.removeDocument.bind(this);
    this.checkUniqueExtraFields = this.checkUniqueExtraFields.bind(this);
    this.onTemplateColorChange = this.onTemplateColorChange.bind(this);
  }

  componentDidMount() {
    this.getAvailableStatuses();
    this.getCustomMessages();
    this.getDocumentNames();
  }

  componentWillReceiveProps(nextProps) {

    if (!nextProps.showTemplateForm) {
      this.setState({
        editingTemplate: false
      });
    } else {
      if (!this.state.editingTemplate && nextProps.templateData && nextProps.templateData.id) {
        const template = $.extend(true, {}, nextProps.templateData);
        this.setState({template, editingTemplate: true});
      } else if (!this.state.editingTemplate) {

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
            document_ids: [],
            mark_enroute_after_complete: false,
            next_task_info: 'Marked COMPLETE. Set ENROUTE for next task.',
            color: colorPalette()[Math.floor(Math.random()*colorPalette().length)],
          },
          editingTemplate: true,
          showDocumentsModal: false,
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

  getDocumentNames() {
    getDocumentssNames().then((res) => {
      const documents = JSON.parse(res);
      const systemDocuments = [];
      const customDocuments = [];
      documents.map((document) => {
        if (documents.type === 'SYSTEM') {
          systemDocuments.push(document);
        } else if (documents.type === 'CUSTOM') {
          customDocuments.push(document);
        }
      });
      systemDocuments.sort(this.compare);
      customDocuments.sort(this.compare);
      this.setState({
        documents,
        systemDocuments,
        customDocuments,
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
    const {status_data} = this.state.template;
    status_data.splice(hoverIndex, 0, status_data.splice(dragIndex, 1)[0]);
    const template = this.state.template;
    template.status_data = status_data;
    this.setState({
      template
    }, () => {
      const updatedTemplate = {...this.state.template};
      this.props.onFieldsChange(updatedTemplate);
    });
  }

  pushCard(item) {
    const itemToPush = {
      // Status must have an ID in order to work both with React DND
      // And the new status to be pushed on top of the array.
      // TODO: Find a better solution than using Math.Random()
      id: item.id || Math.random().toString(36).substr(2, 16),
      title: item.title || 'CUSTOM',
      description: item.description || '',
      type_id: item.type_id,
      color: item.color || '#000000',
      type: item.type,
      require_notes: item.require_notes || false,
      require_estimate: item.require_estimate || false,
      visible_to_customer: item.visible_to_customer || false,
      require_signature: item.require_signature || false
    };
    // Updated this part of the code to prevent mutation in state variables/props.
    this.setState({template: Object.assign({}, this.state.template, {status_data: [itemToPush, ...this.state.template.status_data]})}, () => {
      const updatedTemplate = {...this.state.template};
      this.props.onFieldsChange(updatedTemplate);
    });
  }

  onStatusUpdate(status) {
    const tempStatusDataArray = this.state.template.status_data;
    for (let i = 0; i < tempStatusDataArray.length; i++) {
      if (tempStatusDataArray[i].id === status.id) {
        tempStatusDataArray[i] = {...status};
        const template = this.state.template;
        template.status_data = tempStatusDataArray;
        this.setState({template}, () => {
          const updatedTemplate = {...this.state.template};
          this.props.onFieldsChange(updatedTemplate);
        });
      }
    }
  }

  deleteStatus(deletedStatus) {
    const status_data = this.state.template.status_data;
    status_data.splice(status_data.map((status) => {
      return status.id;
    }).indexOf(deletedStatus.id), 1);
    this.setState(Object.assign(this.state.template, status_data), () => {
      const updatedTemplate = {...this.state.template};
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

  handleAddDocumentClick() {
    const selectedDocuments = this.state.template.document_ids || [];
    this.setState({
      showDocumentsModal: true,
      selectedDocuments
    });
  }

  closeDocumentModal() {
    this.setState({
      showDocumentsModal: false,
      selectedDocuments: []
    });
  }

  renderDefaultStatuses() {
    const statusButtons = this.state.defaultStatuses.map((status, i) => {
      return (
        <DefaultStatus pushCard={this.pushCard} status={status} index={i} id={status.type} key={i + 1}/>
      );
    });
    return statusButtons;
  }

  onTemplateColorChange(color){
    const template = this.state.template;
    template.color = color;
    this.setState({
      template
    })
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
          <Status systemMessages={this.state.systemMessages} customMessages={this.state.customMessages}
                  deleteStatus={this.deleteStatus} handleStatusUpdate={this.onStatusUpdate} index={i} id={status.id}
                  moveCard={this.moveCard} statusData={status} key={status.id}/>
        );
      });
    }
    return renderedResult;
  }

  renderCustomMessages(fieldName) {
    const customMessagesRendered = this.state.customMessages.map((message) => {
      return (
        <option
          selected={(this.state.template.custom_messages !== null && parseInt(this.state.template.custom_messages[fieldName]) === parseInt(message.message_id ? message.message_id : message.default_id)) && 'selected'}
          key={message.name}
          value={message.message_id ? message.message_id : message.default_id}>{message.name}</option> // using message.name as key because this will always be unique
      );
    });

    return customMessagesRendered;
  }

  renderSystemMessages(fieldName) {
    const systemMessagesRendered = this.state.systemMessages.map((message) => {
      if (!message.sub_type || message.sub_type.toUpperCase() !== 'WORKER_REQUEST') {
        return (
          <option
            selected={(this.state.template.custom_messages !== null && parseInt(this.state.template.custom_messages[fieldName]) === parseInt(message.message_id ? message.message_id : message.default_id)) && 'selected'}
            key={message.name}
            value={message.message_id ? message.message_id : message.default_id}>{message.name}</option> // using message.name as key because this will always be unique
        );
      }
    });

    return systemMessagesRendered;
  }

  handleTemplateNameChange(e) {
    const template = this.state.template;
    template.name = e.target.value;
    this.setState({template}, () => {
      const updatedTemplate = {...this.state.template};
      this.props.onFieldsChange(updatedTemplate);
    });
  }

  handleNextTaskInfoChange(e) {
    const template = this.state.template;
    template.next_task_info = e.target.value;
    this.setState({template}, () => {
      const updatedTemplate = {...this.state.template};
      this.props.onFieldsChange(updatedTemplate);
    });
  }

  handleTemplateDescriptionChange(e) {
    const template = this.state.template;
    template.description = e.target.value;
    this.setState({template}, () => {
      const updatedTemplate = {...this.state.template};
      this.props.onFieldsChange(updatedTemplate);
    });
  }

  handleTemplateMessageTypesChange(e, fieldName) {
    const template = {
      ...this.state.template,
      custom_messages: {
        ...this.state.template.custom_messages,
        [fieldName]: e.target.value !== 'NULL' ? parseInt(e.target.value) : 1111
      }
    };
    this.setState({
      template
    }, () => {
      const updatedTemplate = {...this.state.template};
      this.props.onFieldsChange(updatedTemplate);
    });
  }

  onUpdateTemplate() {
    if (!this.checkUniqueExtraFields()) {
      const alert = {
        text: 'Duplicate Extra Field names not allowed',
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
    this.setState({pendingServerAction: true});
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
    const extra_fields = this.state.template.extra_fields ? JSON.stringify(this.state.template.extra_fields) : '';
    const color = this.state.template.color;
    const document_ids = this.state.template.document_ids.join(',');
    updateTemplate(this.state.template.id, this.state.template.name, this.state.template.description, statuses, custom_messages, this.props.templateData.is_default, disable_auto_start_complete, auto_start_delay_time, auto_complete_delay_time, mark_enroute_after_complete, next_task_info, extra_fields, document_ids, color).then(() => {
      this.props.hideTemplateForm();
      this.setState({
        errorAlert: false,
        editingTemplate: false,
        pendingServerAction: false
      });
      this.props.templateUpdated(true);
    }).catch((err) => {

       const alert = {
        text: JSON.parse(err.responseText).description,
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(alert);
      this.setState({
        pendingServerAction: false
      });
    });
  }

  onSaveTemplate() {
    if (!this.checkUniqueExtraFields()) {
      const alert = {
        text: 'Duplicate Extra Field names not allowed',
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
    this.setState({pendingServerAction: true});
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
      'name': this.state.template.name,
      'description': this.state.template.description,
      'enabled': true,
      'statuses': JSON.stringify(std),
      'custom_messages': JSON.stringify(this.state.template.custom_messages),
      'disable_auto_start_complete': this.state.template.disable_auto_start_complete,
      'mark_enroute_after_complete': this.state.template.mark_enroute_after_complete,
      'auto_start_delay_time': this.state.template.auto_start_delay_time,
      'auto_complete_delay_time': this.state.template.auto_complete_delay_time,
      'next_task_info': this.state.template.next_task_info,
      'extra_fields': this.state.template.extra_fields ? JSON.stringify(this.state.template.extra_fields) : '',
      'color': this.state.template.color,
      'document_ids': this.state.template.document_ids.join(','),

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
          next_task_info: 'Marked COMPLETE. Set ENROUTE for next task.',
          document_ids: [],
          color: colorPalette()[Math.floor(Math.random()*colorPalette().length)],
        }
      });
    }).catch((err) => {
       const alert = {
        text: JSON.parse(err.responseText).description,
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(alert);
      this.setState({
        pendingServerAction: false
      });
    });
  }

  handleAutoStartCompleteFeatureChange(value) {
    let template = this.state.template;
    template.disable_auto_start_complete = value;
    this.setState({
      template
    });
  }

  handleMarkEnrouteFeatureChange(value) {
    const template = this.state.template;
    template.mark_enroute_after_complete = value;
    this.setState({
      template
    });
  }

  onExtraFieldsChange(extra_fields) {
    const template = this.state.template;
    template.extra_fields = extra_fields;
    this.setState({ template });
  }

  checkUniqueExtraFields() {
    const extra_fields = this.state.template.extra_fields;
    if (!extra_fields) {
      return true;
    }
    for(let index = 0; index < extra_fields.length; index++) {
      for (let i = index + 1; i < extra_fields.length; i++) {
        if (extra_fields[index].name === extra_fields[i].name) {
          return false;
        }
      }
    }
    return true;
  }

  handleAutoStartDelayTimeChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    const template = {...this.state.template};
    template.auto_start_delay_time = parseInt(value, 10);
    this.setState({
      template
    });
  }

  handleAutoCompleteDelayTimeChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    const template = {...this.state.template};
    template.auto_complete_delay_time = parseInt(value, 10);
    this.setState({
      template
    });
  }

  renderTemplateDocuments() {
    let templateDocuments = this.state.template && this.state.template.document_ids && this.state.template.document_ids.map((document_id, idx) => {
      const document = this.state.documents && this.state.documents.find((doc) => {
        return doc.id ? doc.id === document_id : doc.default_id === document_id;
      });
      if (document) {
        return (
          <span>
            <FontAwesomeIcon icon={faFileAlt} className={styles.documentIcon}/>
            {document.name}
            {/*onClick=/!*onFieldRemove(idx)*!/*/}
            <span className={cx(styles.remove)} onClick={() => {this.removeDocument(idx)}}/>
          </span>
        )
      }
    });
    return templateDocuments;
  }

  handleSelectDocument(document_id) {
    const selectedDocuments = this.state.selectedDocuments;
    const index = selectedDocuments.indexOf(document_id);
    if (index >= 0) {
      selectedDocuments.splice(index, 1);
    } else if (index === -1) {
      selectedDocuments.push(document_id);
    }
    this.setState({
      selectedDocuments
    });
  }

  handleDoneClick() {
    const template = this.state.template;
    const selectedDocuments = this.state.selectedDocuments;
    template.document_ids = selectedDocuments;
    this.setState({
      selectedDocuments: [],
      template,
      showDocumentsModal: false
    });
  }

  removeDocument(idx) {
    const template = this.state.template;
    template.document_ids.splice(idx, 1);
    this.setState({
      template
    });
  }

  renderDocumentsModal(crossIcon) {
    return (
      <Modal
        show={this.state.showDocumentsModal}
        onHide={this.closeDocumentModal}
        dialogClassName={styles.addTemplateModal}
        className={styles.modalContainer}
      >
        <Modal.Header className={styles.templateModalHeader}>
          <Modal.Title className={cx(styles.modalTitle)}>
            Attach Documents
            <i className={styles.closeIcon} onClick={this.closeDocumentModal}>{crossIcon}</i>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={cx(styles.modalBody)}>
          <div className={cx(styles.box)}>
            <div className={cx(styles.boxBody)}>
              <div className={cx(styles.boxBodyInner)}>
                {this.state.documents && this.state.documents.map((document) => {
                  let activeClass = "";
                  if (document.id && this.state.selectedDocuments.indexOf(document.id) >= 0) {
                    activeClass = styles.activeDocument;
                  } else if (document.default_id && this.state.selectedDocuments.indexOf(document.default_id) >= 0) {
                    activeClass = styles.activeDocument;
                  }
                  return (
                    <span className={cx(styles.documentWraper, activeClass)} onClick={() => {this.handleSelectDocument(document.id || document.default_id)}}>
                      <FontAwesomeIcon icon={faFileAlt}/>
                      <span className={styles.documentName}>
                        {document.name}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="text-right">
            <Button className={cx(styles.btn, styles['btn-light'])} onClick={() => this.closeDocumentModal()}>Cancel</Button>
            <Button onClick={this.handleDoneClick} className={cx(styles.btn, styles['btn-secondary'])}>
              Done
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  render() {

    const autoStartTooltip = (
      <Tooltip id="tooltip">When first task assignee arrives at customer location, task will be marked Auto Start after
        this time delay</Tooltip>
    );
    const autoCompleteTooltip = (
      <Tooltip id="tooltip">When all task assignee's departs from customer's location, task will be marked Auto Complete
        after this time delay</Tooltip>
    );
    const {connectDropTarget} = this.props;
    const crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756"
                           viewBox="0 0 11.758 11.756">
      <g transform="translate(-1270.486 -30.485)">
        <path
          d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z"
          transform="translate(4126.197 -40.804)" fill="#8d959f"/>
      </g>
    </svg>;

    return (
      <Modal
        show={this.props.showTemplateForm}
        onHide={this.closeModal}
        dialogClassName={styles.addTemplateModal}
        className={styles.modalContainer}
        keyboard={false} backdrop={'static'}
      >
        <Modal.Header className={styles.templateModalHeader}>
          <Modal.Title className={cx(styles.modalTitle)}>
            {this.state.template.id ? 'Edit' : 'Add New'} Template
            <i className={styles.closeIcon} onClick={this.closeModal}>{crossIcon}</i>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={cx(styles.modalBody)}>
          {this.renderDocumentsModal(crossIcon)}
          {this.state.errorAlert && <Alert bsStyle="danger">{this.state.errorMessage}</Alert>}
          <Row className="clearfix">
            <Col md={6} sm={12}>
              <div className={cx(styles.box)}>
                <h3 className={cx(styles.boxTitle)}>Name & Description</h3>
                <div className={cx(styles.boxBody)}>
                  <div className={cx(styles.boxBodyInner)}>
                    <Row>
                    <Col md={6}>
                    <FormGroup controlId="details">
                      <ControlLabel>Template Name</ControlLabel>
                      <FormControl
                        disabled={this.state.pendingServerAction}
                        type="text"
                        value={this.state.template.name}
                        onChange={this.handleTemplateNameChange}
                        placeholder="Name"
                      />
                    </FormGroup>
                    </Col>
                      <Col md={6}>
                          <div className={styles.profileColorField}>
                            <FieldGroup
                              componentClass={ColorField}
                              onChange={this.onTemplateColorChange}
                              id="color"
                              value={this.state.template.color}
                              fieldInfo="Tasks using this template will have this default color."
                              showColorField={true}
                            />
                          </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12}>
                    <FormGroup controlId="details">
                      <ControlLabel>Template Description</ControlLabel>
                      <FormControl
                        disabled={this.state.pendingServerAction}
                        type="text"
                        value={this.state.template.description}
                        onChange={this.handleTemplateDescriptionChange}
                        placeholder="Description"
                      />
                    </FormGroup>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
              <div className={cx(styles.box)}>
                <h3 className={cx(styles.boxTitle)}>Customer Messages <small>Select custom messages for default
                  statuses.</small></h3>
                <div className={cx(styles.boxBody)}>
                  <div className={cx(styles.boxBodyInner)}>
                    <Row className="clearfix">
                      <Col sm={6} xs={12}>
                        <FormGroup controlId="details">
                          <ControlLabel>Task Create</ControlLabel>
                          <div className={cx(styles.selectBox)}>
                            <FormControl componentClass="select" name="task_create"
                                         onChange={(e) => this.handleTemplateMessageTypesChange(e, 'task_create')}
                                         placeholder="Select a Custom Message">
                              <option value="" selected disabled hidden>Select a message</option>
                              <option value="NULL"
                                      selected={this.state.template.custom_messages !== null && this.state.template.custom_messages['task_create'] === 1111 && 'selected'}>NO
                                MESSAGE
                              </option>
                              <optgroup label="Default Messages">
                                {this.renderSystemMessages('task_create')}
                              </optgroup>
                              <optgroup label="Custom Messages">
                                {this.renderCustomMessages('task_create')}
                              </optgroup>
                            </FormControl>
                          </div>
                        </FormGroup>
                      </Col>
                      <Col sm={6} xs={12}>
                        <FormGroup controlId="details">
                          <ControlLabel>Task Reminder</ControlLabel>
                          <div className={cx(styles.selectBox)}>
                            <FormControl componentClass="select" name="task_reminder"
                                         onChange={(e) => this.handleTemplateMessageTypesChange(e, 'task_reminder')}
                                         placeholder="Select a Custom Message">
                              <option value="" selected disabled hidden>Select a message</option>
                              <option value="NULL"
                                      selected={this.state.template.custom_messages !== null && this.state.template.custom_messages['task_reminder'] === 1111 && 'selected'}>NO
                                MESSAGE
                              </option>
                              <optgroup label="Default Messages">
                                {this.renderSystemMessages('task_reminder')}
                              </optgroup>
                              <optgroup label="Custom Messages">
                                {this.renderCustomMessages('task_reminder')}
                              </optgroup>
                            </FormControl>
                          </div>
                        </FormGroup>
                      </Col>
                      <Col sm={6} xs={12}>
                        <FormGroup controlId="details">
                          <ControlLabel>Task Scheduled</ControlLabel>
                          <div className={cx(styles.selectBox)}>
                            <FormControl componentClass="select" name="task_scheduled"
                                         onChange={(e) => this.handleTemplateMessageTypesChange(e, 'task_scheduled')}
                                         placeholder="Select a Custom Message">
                              <option value="" selected disabled hidden>Select a message</option>
                              <option value="NULL"
                                      selected={this.state.template.custom_messages !== null && this.state.template.custom_messages['task_scheduled'] === 1111 && 'selected'}>NO
                                MESSAGE
                              </option>
                              <optgroup label="Default Messages">
                                {this.renderSystemMessages('task_scheduled')}
                              </optgroup>
                              <optgroup label="Custom Messages">
                                {this.renderCustomMessages('task_scheduled')}
                              </optgroup>
                            </FormControl>
                          </div>
                        </FormGroup>
                      </Col>
                      <Col sm={6} xs={12}>
                        <FormGroup controlId="details">
                          <ControlLabel>Task Rescheduled</ControlLabel>
                          <div className={cx(styles.selectBox)}>
                            <FormControl componentClass="select" name="task_rescheduled"
                                         onChange={(e) => this.handleTemplateMessageTypesChange(e, 'task_rescheduled')}
                                         placeholder="Select a Custom Message">
                              <option value="" selected disabled hidden>Select a message</option>
                              <option value="NULL"
                                      selected={this.state.template.custom_messages !== null && this.state.template.custom_messages['task_rescheduled'] === 1111 && 'selected'}>NO
                                MESSAGE
                              </option>
                              <optgroup label="Default Messages">
                                {this.renderSystemMessages('task_rescheduled')}
                              </optgroup>
                              <optgroup label="Custom Messages">
                                {this.renderCustomMessages('task_rescheduled')}
                              </optgroup>
                            </FormControl>
                          </div>
                        </FormGroup>
                      </Col>
                      <Col sm={6} xs={12}>
                        <FormGroup controlId="details">
                          <ControlLabel>Review Reminder</ControlLabel>
                          <div className={cx(styles.selectBox)}>
                            <FormControl componentClass="select" name="review_reminder"
                                         onChange={(e) => this.handleTemplateMessageTypesChange(e, 'review_reminder')}
                                         placeholder="Select a Custom Message">
                              <option value="" selected disabled hidden>Select a message</option>
                              <option value="NULL"
                                      selected={this.state.template.custom_messages !== null && this.state.template.custom_messages['review_reminder'] === 1111 && 'selected'}>NO
                                MESSAGE
                              </option>
                              <optgroup label="Default Messages">
                                {this.renderSystemMessages('review_reminder')}
                              </optgroup>
                              <optgroup label="Custom Messages">
                                {this.renderCustomMessages('review_reminder')}
                              </optgroup>
                            </FormControl>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </Col>
            <Col md={6} sm={12}>
              <div className={cx(styles.box)}>
                <div className={cx(styles.boxBody, styles.autoStartBody)}>
                  <div className={cx(styles.boxBodyInner)}>
                    <FormGroup controlId="details" className={styles.autoCompleteField}>
                      <ControlLabel>Auto-Start & Auto-Complete</ControlLabel>
                      <div className={cx(styles.switch)}>
                        <SwitchButton onChange={(value) => this.handleAutoStartCompleteFeatureChange(!value)}
                                      name="disable_auto_start_complete"
                                      checked={!this.state.template.disable_auto_start_complete}/>
                      </div>
                    </FormGroup>
                  </div>
                  {!this.state.template.disable_auto_start_complete &&
                  <div className={cx(styles.boxBodyInner)}>
                    <FormGroup className={styles.autoMarkField} controlId="details">
                      <ControlLabel>
                        <OverlayTrigger placement="top" overlay={autoStartTooltip}>
                          <span>Mark Auto-Start After</span>
                        </OverlayTrigger>
                      </ControlLabel>
                      <div className={cx(styles.selectBox)}>
                        <FormControl onChange={(e) => this.handleAutoStartDelayTimeChange(e)}
                                     defaultValue={typeof this.state.template.auto_start_delay_time !== 'undefined' ? this.state.template.auto_start_delay_time.toString() : '15'}
                                     componentClass="select" name="auto_start_time">
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
                      </div>
                    </FormGroup>
                  </div>
                  }
                  {!this.state.template.disable_auto_start_complete &&
                  <div className={cx(styles.boxBodyInner)}>
                    <FormGroup className={styles.autoMarkField} controlId="details">
                      <ControlLabel>
                        <OverlayTrigger placement="top" overlay={autoCompleteTooltip}>
                          <span>Mark Auto-Complete After</span>
                        </OverlayTrigger>
                      </ControlLabel>
                      <div className={cx(styles.selectBox)}>
                        <FormControl onChange={(e) => this.handleAutoCompleteDelayTimeChange(e)}
                                     defaultValue={typeof this.state.template.auto_complete_delay_time !== 'undefined' ? this.state.template.auto_complete_delay_time.toString() : '90'}
                                     componentClass="select" name="auto_complete_time">
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
                      </div>
                    </FormGroup>
                  </div>
                  }
                  <div className={cx(styles.boxBodyInner)}>
                    <FormGroup controlId="details" className={styles.autoCompleteField}>
                      <ControlLabel>Mark Enroute after Complete</ControlLabel>
                      <div className={cx(styles.switch)}>
                        <SwitchButton onChange={(value) => this.handleMarkEnrouteFeatureChange(value)}
                                      name="mark_enroute_after_complete"
                                      checked={this.state.template.mark_enroute_after_complete}/>
                      </div>
                    </FormGroup>
                  </div>
                  <div className={cx(styles.boxBodyInner)}>
                    <FormGroup controlId="details">
                      <ControlLabel>Next Task Info</ControlLabel>
                      <FormControl
                        disabled={!this.state.template.mark_enroute_after_complete}
                        type="text"
                        value={(this.state.template.next_task_info !== null && typeof this.state.template.next_task_info !== 'undefined') ? this.state.template.next_task_info : 'Marked COMPLETE. Set ENROUTE for next task.'}
                        onChange={this.handleNextTaskInfoChange}
                        placeholder="Next Task Info"
                      />
                    </FormGroup>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6} sm={12}>
              <div className={cx(styles.box)}>
                <h3 className={cx(styles.boxTitle)}>Extra Field <small>These extra fields will be available to Tasks
                using this template.</small></h3>
                <div className={cx(styles.boxBody)}>
                  <div className={cx(styles.boxBodyInner)}>
                    <ExtraFieldWithType fields={this.state.template.extra_fields} onChange={this.onExtraFieldsChange}/>
                  </div>
                </div>
              </div>
            </Col>
            {(this.props.profile && this.props.profile.is_documents_disabled === false) && <Col md={6} sm={12}>
              <div className={cx(styles.box)}>
                <h3 className={cx(styles.boxTitle)}>Documents <small>These documents will be added to Tasks using
                  this template.</small></h3>
                <div className={cx(styles.boxBody)}>
                  <div className={cx(styles.boxBodyInner)}>
                    <Row>
                      <Col xs={6}>
                        {this.renderTemplateDocuments()}
                      </Col>
                      <Col xs={6} className={styles.btnWrapper}>
                       <button className={cx(styles.documentBtn, styles['btn-primary-outline'])} onClick={this.handleAddDocumentClick}>Add Document</button>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </Col>}
          </Row>
          <div className={cx(styles.box)}>
            <h3 className={cx(styles.boxTitle)}>Statuses</h3>
            <div className={cx(styles.boxBody)}>
              <Row className="clearfix">
                {connectDropTarget(
                  <div>
                    <Col md={6} sm={12}>
                      <div className={cx(styles.boxBodyInner)}>
                        <div>
                          <h5 className={styles.boxBodyTitle}>Active Statuses
                            <small className={styles.info}>Drag a status from the right panel or double click it to
                              activate.</small>
                          </h5>
                          <div className={styles.statusesListContainer}>
                            {this.renderActiveStatuses()}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </div>
                )}
                <Col md={6} sm={12}>
                  <div className={cx(styles.boxBodyInner)}>
                    <h5 className={styles.boxBodyTitle}>Available Statuses</h5>
                    <div className={cx(styles.statusesButtonsWrapper)}>
                      {this.renderDefaultStatuses()}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          <div className="text-right">
            <Button className={cx(styles.btn, styles['btn-light'])} onClick={() => this.closeModal()}>Cancel</Button>
            {this.state.template.id === '' &&
            <Button disabled={this.state.pendingServerAction} onClick={() => this.onSaveTemplate()} type="submit" className={cx(styles.btn, styles['btn-secondary'])}>
              { this.state.pendingServerAction ? <SavingSpinner title={''} borderStyle="none" /> : 'Save Template' }
            </Button>
            }
            {this.state.template.id !== '' &&
            <Button disabled={this.state.pendingServerAction} onClick={() => this.onUpdateTemplate()} type="submit" className={cx(styles.btn, styles['btn-secondary'])}>
              { this.state.pendingServerAction ? <SavingSpinner title={''} borderStyle="none" /> : 'Update Template' }
            </Button>
            }
          </div>
          {this.state.template && <div className={cx(styles.externalInfo)}>
            {this.state.template.id && <div><strong>ID</strong> : {this.state.template.id}</div>}
          </div>}
        </Modal.Body>
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
