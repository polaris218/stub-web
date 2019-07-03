import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './custom-messages.module.scss';
import {Grid, Row, Col, Alert, DropdownButton, MenuItem, Tabs, Tab} from 'react-bootstrap';
import { getMessages, createMessage, deleteMessage, updateMessage, getDefaultFields } from '../../../../actions/custom-messages';
import { getTemplates } from '../../../../actions/templates';
import CustomMessageForm from '../custom-message-form/custom-message-form';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import cx from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faEllipsisV} from '@fortawesome/fontawesome-free-solid';
import {getErrorMessage} from '../../../../helpers/task';
import {toast} from 'react-toastify';

export default class CustomMessages extends Component {

  constructor(props) {

    super(props);

    this.state = {
      messages: [],
      customMessages: [],
      systemMessages: [],
      templates_extraFields: [],
      serverActionPending: false,
      selectedMessage: null,
      showEditForm: false,
      successAlert: false,
      errorAlert: false,
      alertMessage: '',
      defaultFields: [],
      allDefaultFields: [],
      deletingMessage: false,
      duplicateActionIsPending: false,
      profile: null,
      workerRequestMessages: [],
    };

    this.getCustomMessages = this.getCustomMessages.bind(this);
    this.showEditModal = this.showEditModal.bind(this);
    this.renderCustomMessages = this.renderCustomMessages.bind(this);
    this.hideEditModal = this.hideEditModal.bind(this);
    this.hideAlertMessages = this.hideAlertMessages.bind(this);
    this.updateMessageCallback = this.updateMessageCallback.bind(this);
    this.saveMessageCallback = this.saveMessageCallback.bind(this);
    this.deleteMessageCallback = this.deleteMessageCallback.bind(this);
    this.duplicateMessage = this.duplicateMessage.bind(this);
    this.duplicateMessageCallback = this.duplicateMessageCallback.bind(this);
    this.deleteMessageFromList = this.deleteMessageFromList.bind(this);
    this.handleSelectedMessageFieldsChange = this.handleSelectedMessageFieldsChange.bind(this);
    this.renderWorkerRequestsMessages = this.renderWorkerRequestsMessages.bind(this);

  }

  componentDidMount() {
    this.setState({
      serverActionPending: true
    });
    Promise.all([getMessages(), getDefaultFields(), this.props.getProfileInformation(), getTemplates()]).then(([message, fields, profileInfo, templates]) => {
      const messages = JSON.parse(message);
      const systemMessages = [];
      const customMessages = [];
      let workerRequestMessages = [];
      messages.map((ccMessage) => {
        if (ccMessage.type === 'SYSTEM') {
          if (ccMessage.sub_type === "WORKER_REQUEST") {
            workerRequestMessages.push(ccMessage);
          } else {
            systemMessages.push(ccMessage);
          }
        } else if (ccMessage.type === 'CUSTOM') {
          customMessages.push(ccMessage);
        }
      });

       //9982 is default_id of Cancelled Worker Request message
      workerRequestMessages = workerRequestMessages.filter((message) => {
        return message.default_id !== 9982;
      });

      systemMessages.sort(this.compare);
      customMessages.sort(this.compare);
      templates = JSON.parse(templates);
      let templates_extraFields = [];

      templates.map((template) => {
        if( template.extra_fields && template.extra_fields.length > 0) {
          template.extra_fields.map(extra_fields=>{
            templates_extraFields.push({field_name : extra_fields.name, template_name: template.name})

          })
        }
      });


      this.setState({
        messages,
        templates_extraFields,
        customMessages,
        systemMessages,
        workerRequestMessages,
        allDefaultFields: JSON.parse(fields),
        serverActionPending: false,
        profile: JSON.parse(profileInfo)
      });
    }).catch(([errorA, errorB, errorC]) => {
      console.log(errorA);
      console.log(errorB);
      console.log(errorC);
    });
  }

  getCustomMessages() {
    this.setState({
      serverActionPending: true
    });
    getMessages().then((res) => {
      const messages = JSON.parse(res);
      const systemMessages = [];
      const customMessages = [];
      let workerRequestMessages = [];
      messages.map((ccMessage) => {
        if (ccMessage.type === 'SYSTEM') {
          if (ccMessage.sub_type === 'WORKER_REQUEST') {
            workerRequestMessages.push(ccMessage);
          } else {
            systemMessages.push(ccMessage);
          }
        } else if (ccMessage.type === 'CUSTOM') {
          customMessages.push(ccMessage);
        }
      });

      //9982 is default_id of Cancelled Worker Request message
      workerRequestMessages = workerRequestMessages.filter((message) => {
        return message.default_id !== 9982;
      });

      systemMessages.sort(this.compare);
      customMessages.sort(this.compare);
      this.setState({
        messages,
        customMessages,
        systemMessages,
        workerRequestMessages,
        serverActionPending: false
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  handleSelectedMessageFieldsChange(updatedMessage) {
    if (this.state.selectedMessage !== null) {
      this.setState({
        selectedMessage: updatedMessage
      });
    } else {
      return;
    }
  }

  deleteMessageFromList(e, messageID) {
    this.setState({
      deletingMessage: true
    });
    deleteMessage(messageID).then((res) => {
      this.setState({
        deletingMessage: false
      });
      this.deleteMessageCallback(true);
    }).catch((err) => {
      this.deleteMessageCallback(false);
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

  updateMessageCallback(success = false) {
    if (success) {
      this.setState({
        serverActionPending: false,
        showEditForm: false
      });
      const updated = {
        text: 'Message updated successfully.',
        options: {
          type: toast.TYPE.SUCCESS,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastSuccessAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(updated);
      this.getCustomMessages();
    } else {
      this.setState({
        serverActionPending: false
      });
      const updateFailed = {
        text: 'Message could not be updated. Please try again.',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(updateFailed);
    }
  }

  saveMessageCallback(success = false) {
    if (success) {
      this.setState({
        editMessage: false,
        showEditForm: false,
        serverActionPending: false
      });
      const saved = {
        text: 'Message saved successfully.',
        options: {
          type: toast.TYPE.SUCCESS,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastSuccessAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(saved);
      this.getCustomMessages();
    } else {
      this.setState({
        serverActionPending: false
      });
      const savingFailed = {
        text: 'Message could not be saved right now. Please try again.',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(savingFailed);
    }
  }

  duplicateMessageCallback(success = false) {
    if (success) {
      this.setState({
        editMessage: false,
        showEditForm: false,
        serverActionPending: false
      });
      const duplicated = {
        text: 'Message duplicated successfully.',
        options: {
          type: toast.TYPE.SUCCESS,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastSuccessAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(duplicated);
      this.getCustomMessages();
    } else {
      this.setState({
        serverActionPending: false
      });
      const duplicationFailed = {
        text: 'Message could not be duplicated right now. Please try again.',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(duplicationFailed);
    }
  }

  deleteMessageCallback(success = false) {
    if (success) {
      this.setState({
        selectedMessage: null,
        showEditForm: false,
        deletingMessage: false
      });
      const deleted = {
        text: 'Message deleted successfully.',
        options: {
          type: toast.TYPE.SUCCESS,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastSuccessAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(deleted);
      this.getCustomMessages();
    } else {
      this.setState({
        deletingMessage: false
      });
      const deletionFailed = {
        text: 'Message could not be deleted. Please try again.',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(deletionFailed);
    }
  }

  showEditModal(message = null) {
    let selectedMessage = null;
    let defaultFields = this.state.allDefaultFields;
    if (message) {
      selectedMessage = message.content.sms ? {
        description: message.description,
        is_default: message.is_default,
        name: message.name,
        type: message.type,
        id: message.id ? message.id : null,
        default_id: message.default_id ? message.default_id : null,
        sub_type: message.sub_type,
        content: {
          email: {
            message: message.content.email && message.content.email.message,
            subject: message.content.email && message.content.email.subject
          },
          sms: {
            message: message.content.sms.message
          }
          }
        }
        :
        {
          description: message.description,
          is_default: message.is_default,
          name: message.name,
          type: message.type,
          id: message.id ? message.id : null,
          default_id: message.default_id ? message.default_id : null,
          sub_type: message.sub_type,
          content: {
            email: {
              message: message.content.email.message,
              subject: message.content.email.subject
            }
          }
        };

      if (message.sub_type === 'WORKER_REQUEST') {
        defaultFields = defaultFields.filter((field) => {
          return field.supported_message_types.indexOf(message.sub_type) >= 0;
        });
      } else {
        defaultFields = defaultFields.filter((field) => {
          return field.supported_message_types.indexOf('TASK') >= 0 || field.supported_message_types.indexOf('TASK_STATUS') >= 0;
        });
      }

    }


    this.setState({
      selectedMessage,
      showEditForm: true,
      defaultFields
    });
  }

  hideEditModal() {
    this.setState({
      selectedMessage: null,
      showEditForm: false,
      errorAlert: false
    });
  }

  hideAlertMessages() {
    this.setState({
      errorAlert: false,
      successAlert: false,
      alertMessage: ''
    });
  }

  duplicateMessage(e, message) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      duplicateActionIsPending: true
    });
    const messageType = 'CUSTOM';
    const messageDescription = message.description;
    const sub_type = message.sub_type;
    const messageName = 'Copy of ' + message.name;
    const messageContent = JSON.stringify(message.content);
    const default_id =  null;
    createMessage(messageName, messageType, messageContent, messageDescription, default_id, sub_type).then((res) => {
      this.setState({
        duplicateActionIsPending: false
      });
      this.duplicateMessageCallback(true);
    }).catch((err) => {
      const error = JSON.parse(err.responseText);
      this.setState({
        serverActionPending: false,
        duplicateActionIsPending: false
      });
      const alert = {
        text: getErrorMessage(error),
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

  renderCustomMessages() {
    if (this.state.customMessages.length === 0) {
      return (
        <div className="text-center">
          <p>No custom messages found. Start by creating a <a onClick={() => this.showEditModal()}
                                                              className={styles.singleMessageTitle}>new custom
            message</a>.</p>
        </div>
      );
    } else {
      const renderedMessages = this.state.customMessages.map((message, index) => {
        let disabledLinkClass = null;
        let disabledMessageRowClass = null;
        let disableAction = null;
        if (this.state.serverActionPending) {
          disabledLinkClass = styles.disabledLink;
          disabledMessageRowClass = styles.disabledRow;
          disableAction = styles.disableAction;
        } else {
          disabledLinkClass = '';
          disabledMessageRowClass = '';
          disableAction = '';
        }
        const messageDescription = message.description && (message.description.length < 250 ? message.description : message.description.substr(0, 250) + '...');
        if (message.type === 'CUSTOM') {
          return (
            <div className={cx(styles.singleMessageRow, disabledMessageRowClass)} key={index}>
              <div className={cx(styles.singleMessageInner)} onClick={() => this.showEditModal(message)}>
                <h4 className={cx(styles.singleMessageTitle, disabledLinkClass)}>{message.name}</h4>
                <div className={styles.messageDescriptionContainer}>{messageDescription}</div>
              </div>
              <div className={cx(styles.actionsBtnContainer, disableAction)}>
                <DropdownButton title={(<FontAwesomeIcon icon={faEllipsisV}/>)} noCaret pullRight
                                className={styles.actionsBtn} id="bg-nested-dropdown">
                  <MenuItem onClick={(e) => this.duplicateMessage(e, message)} eventKey="2">Duplicate Message</MenuItem>
                  <MenuItem onClick={(e) => this.deleteMessageFromList(e, message.id)} eventKey="2">Delete
                    Message</MenuItem>
                </DropdownButton>
              </div>
            </div>
          );
        }
      });
      return renderedMessages;
    }
  }

  renderWorkerRequestsMessages() {
    if (this.state.workerRequestMessages.length === 0) {
      return (
        <div className="text-center">
          <p>No worker request messages found.</p>
        </div>
      );
    } else {
      const renderedMessages = this.state.workerRequestMessages.map((message, index) => {
        let disabledLinkClass = null;
        let disabledMessageRowClass = null;
        let disableAction = null;
        if (this.state.serverActionPending) {
          disabledLinkClass = styles.disabledLink;
          disabledMessageRowClass = styles.disabledRow;
          disableAction = styles.disableAction;
        } else {
          disabledLinkClass = '';
          disabledMessageRowClass = '';
          disableAction = '';
        }

        return (
          <div className={cx(styles.singleMessageRow, disabledMessageRowClass)} key={index}>
            <div className={cx(styles.singleMessageInner)} onClick={() => this.showEditModal(message)}>
              <h4 className={cx(styles.singleMessageTitle, disabledLinkClass)}>{message.name}</h4>
              <div className={styles.messageDescriptionContainer}>{message.description}</div>
            </div>
            <div className={cx(styles.actionsBtnContainer, disableAction)}>
              {message.id && <DropdownButton title={(<FontAwesomeIcon icon={faEllipsisV}/>)} noCaret pullRight
                                             className={styles.actionsBtn} id="bg-nested-dropdown">

                <MenuItem onClick={(e) => this.deleteMessageFromList(e, message.id)} eventKey="2">Revert to
                  Default</MenuItem>
              </DropdownButton>}
            </div>
          </div>
        );
      });
      return renderedMessages;
    }
  }

  renderSystemMessages() {
    if (this.state.systemMessages.length === 0) {
      return (
        <div className="text-center">
          <p>No system messages found.</p>
        </div>
      );
    } else {
      const renderedMessages = this.state.systemMessages.map((message, index) => {
        let disabledLinkClass = null;
        let disabledMessageRowClass = null;
        let disableAction = null;
        if (this.state.serverActionPending) {
          disabledLinkClass = styles.disabledLink;
          disabledMessageRowClass = styles.disabledRow;
          disableAction = styles.disableAction;
        } else {
          disabledLinkClass = '';
          disabledMessageRowClass = '';
          disableAction = '';
        }

        return (
          <div className={cx(styles.singleMessageRow, disabledMessageRowClass)} key={index}>
            <div className={cx(styles.singleMessageInner)} onClick={() => this.showEditModal(message)}>
              <h4 className={cx(styles.singleMessageTitle, disabledLinkClass)}>{message.name}</h4>
              <div className={styles.messageDescriptionContainer}>{message.description}</div>
            </div>
            <div className={cx(styles.actionsBtnContainer, disableAction)}>
              <DropdownButton title={(<FontAwesomeIcon icon={faEllipsisV}/>)} noCaret pullRight
                              className={styles.actionsBtn} id="bg-nested-dropdown">
                <MenuItem onClick={(e) => this.duplicateMessage(e, message)} eventKey="2">Duplicate Message</MenuItem>
                {message.id &&
                <MenuItem onClick={(e) => this.deleteMessageFromList(e, message.id)} eventKey="2">Revert to
                  Default</MenuItem>}
              </DropdownButton>
            </div>
          </div>
        );
      });
      return renderedMessages;
    }
  }

  render() {
    return (
      <div className={styles.customMessageWrapper}>
        <div className={cx(styles.box)}>
          <Grid>
            <div className={cx(styles.boxTitleWrapper)}>
              <h3 className={cx(styles.boxTitle)}>Customer Messages</h3>
              <div className={styles.savingSpinnerPlaceholder}>
                {this.state.serverActionPending && <SavingSpinner title="Loading" borderStyle="none" size={8}/>}
                {this.state.duplicateActionIsPending &&
                <SavingSpinner title="Duplicating" borderStyle="none" size={8}/>}
                {this.state.deletingMessage && <SavingSpinner title="Deleting" borderStyle="none" size={8}/>}
              </div>
            </div>
            {this.state.successAlert && <Alert bsStyle="success">{this.state.alertMessage}</Alert>}
            {this.state.errorAlert && <Alert bsStyle="danger"> {this.state.alertMessage} </Alert>}
            <div className={styles.customerMessages}>
              <Tabs defaultActiveKey={1} id="customerMessagesTabs" className={styles.tabsPrimary}>
                <Tab title={'Customer Messages'} eventKey={1}>
                  <Row>
                    <Col md={12} lg={6}>
                      <div className={styles.boxBody}>
                        <div className={cx(styles.boxBodyInner, styles.contentBox)}>
                          <p>These messages are automatically sent out to the customer. Click on the message to edit the
                            content.</p>
                          <button disabled={this.state.serverActionPending}
                                  className={cx(styles.btn, styles['btn-secondary'])}
                                  onClick={() => this.showEditModal()}>Add New Message
                          </button>
                        </div>
                      </div>
                      <div className={styles.boxBody}>
                        <div className={styles.boxBodyInner}>
                          <div className={styles.messageGroup}>
                            <h3 className={styles.groupName}>Custom Messages</h3>
                            {this.renderCustomMessages()}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col md={12} lg={6}>
                      <div className={styles.boxBody}>
                        <div className={styles.boxBodyInner}>
                          <div className={styles.messageGroup}>
                            <h3 className={styles.groupName}>Default Messages</h3>
                            {this.renderSystemMessages()}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Tab>
                <Tab title={'Worker Request Messages'} eventKey={2}>
                  <div className={styles.boxBody}>
                    <div className={styles.boxBodyInner}>
                      <div className={styles.messageGroup}>
                        <h3 className={styles.groupName}>Worker Requests Messages</h3>
                        {this.renderWorkerRequestsMessages()}
                      </div>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </Grid>
        </div>
        <CustomMessageForm
          showEditForm={this.state.showEditForm}
          hideCreateForm={this.hideEditModal}
          templates_extraFields={this.state.templates_extraFields}
          message={this.state.selectedMessage}
          deleteMessage={deleteMessage}
          deleteMessageCallback={this.deleteMessageCallback}
          updateMessage={updateMessage}
          updateMessageCallback={this.updateMessageCallback}
          createMessage={createMessage}
          createMessageCallback={this.saveMessageCallback}
          defaultFields={this.state.defaultFields}
          onFieldsChange={this.handleSelectedMessageFieldsChange}
          profile={this.state.profile}
          createToastAlert={this.props.createToastAlert}
          sub_type={this.state.selectedMessage && this.state.selectedMessage.sub_type && this.state.selectedMessage.sub_type === 'WORKER_REQUEST' ? this.state.selectedMessage.sub_type : ''}
        />
      </div>
    );
  }

}

CustomMessages.propTypes = {
  getProfileInformation: PropTypes.func
};
