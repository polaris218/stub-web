import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './custom-messages.module.scss';
import { Grid, Row, Col, Alert, DropdownButton, MenuItem } from 'react-bootstrap';
import { getMessages, createMessage, deleteMessage, updateMessage, getDefaultFields } from '../../actions/custom-messages';
import CustomMessageForm from '../custom-message-form/custom-message-form';
import SavingSpinner from '../saving-spinner/saving-spinner';
import cx from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/fontawesome-free-solid';
import { getErrorMessage } from '../../helpers/task';
import { toast } from 'react-toastify';

export default class CustomMessages extends Component {

  constructor(props) {

    super(props);

    this.state = {
      messages: [],
      customMessages: [],
      systemMessages: [],
      serverActionPending: false,
      selectedMessage: null,
      showEditForm: false,
      successAlert: false,
      errorAlert: false,
      alertMessage: '',
      defaultFields: [],
      deletingMessage: false,
      duplicateActionIsPending: false,
      profile: null
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

  }

  componentDidMount() {
    this.setState({
      serverActionPending: true
    });
    Promise.all([getMessages(), getDefaultFields(), this.props.getProfileInformation()]).then(([message, fields, profileInfo]) => {
      const messages = JSON.parse(message);
      console.log(messages);
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
        defaultFields: JSON.parse(fields),
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
    if (message) {
      selectedMessage = message.content.sms ? {
        description: message.description,
        is_default: message.is_default,
        name: message.name,
        type: message.type,
        id: message.id ? message.id : null,
        default_id: message.default_id ? message.default_id : null,
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
          content: {
            email: {
              message: message.content.email.message,
              subject: message.content.email.subject
            }
          }
        };
    }
    this.setState({
      selectedMessage,
      showEditForm: true
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
    const messageName = 'Copy of ' + message.name;
    const messageContent = JSON.stringify(message.content);
    const default_id =  message.id ? message.id : message.default_id;
    createMessage(messageName, messageType, messageContent, messageDescription, default_id).then((res) => {
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
        <Row className={styles.mT20}>
          <Col md={12} className="text-center">
            No custom messages found. Start by creating a <a onClick={() => this.showEditModal()} className={styles.singleMessageTitle}>new custom message</a>.
          </Col>
        </Row>
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
            <Row className={cx(styles.singleMessageRow, disabledMessageRowClass)} key={index}>
              <Col md={5}>
                <a disabled="disabled" className={cx(styles.singleMessageTitle, disabledLinkClass)} onClick={() => this.showEditModal(message)}>{message.name}</a>
              </Col>
              <Col md={7}>
                <div className={styles.messageDescriptionContainer}>
                  {messageDescription}
                </div>
                <div className={cx(styles.actionsBtnContainer, disableAction)}>
                  <DropdownButton title={(<FontAwesomeIcon icon={faEllipsisV} />)} noCaret pullRight className={styles.actionsBtn} id="bg-nested-dropdown">
                    <MenuItem onClick={(e) => this.duplicateMessage(e, message)} eventKey="2">Duplicate Message</MenuItem>
                    <MenuItem onClick={(e) => this.deleteMessageFromList(e, message.id)} eventKey="2">Delete Message</MenuItem>
                  </DropdownButton>
                </div>
              </Col>
            </Row>
          );
        }
      });
      return renderedMessages;
    }
  }

  renderSystemMessages() {
    if (this.state.systemMessages.length === 0) {
      return (
        <Row>
          <Col md={12} className="text-center">
            No system messages found.
          </Col>
        </Row>
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
          <Row className={cx(styles.singleMessageRow, disabledMessageRowClass)} key={index}>
            <Col md={5}>
              <a className={cx(styles.singleMessageTitle, disabledLinkClass)} onClick={() => this.showEditModal(message)}>{message.name}</a>
            </Col>
            <Col md={7}>
              <div className={styles.messageDescriptionContainer}>
                {message.description}
              </div>
              <div className={cx(styles.actionsBtnContainer, disableAction)}>
                <DropdownButton title={(<FontAwesomeIcon icon={faEllipsisV} />)} noCaret pullRight className={styles.actionsBtn} id="bg-nested-dropdown">
                  <MenuItem onClick={(e) => this.duplicateMessage(e, message)} eventKey="2">Duplicate Message</MenuItem>
                  {message.id && <MenuItem onClick={(e) => this.deleteMessageFromList(e, message.id)} eventKey="2">Revert to Default</MenuItem>}
                </DropdownButton>
              </div>
            </Col>
          </Row>
        );
      });
      return renderedMessages;
    }
  }

  render() {
    return (
      <div className={styles.customMessageWrapper}>
        <Grid>
          <Row>
            <Col md={8} >
              <h1 className={styles.header}>
                Customer Messages
              </h1>
              <p className={styles.infoMessage}>
                These messages are automatically sent out to the customer. Click on the message to edit the content.
              </p>
            </Col>
            <Col md={4}>
              <div className={cx(styles.actions)}>
                <button disabled={this.state.serverActionPending} className={cx(styles.createBtn, styles.mT25)} onClick={() => this.showEditModal()}>Add New Message</button>
              </div>
            </Col>
            {this.state.successAlert &&
              <Col md={12}>
                <Alert bsStyle="success">
                  {this.state.alertMessage}
                </Alert>
              </Col>
            }
            {this.state.errorAlert &&
            <Col md={12}>
              <Alert bsStyle="danger">
                {this.state.alertMessage}
              </Alert>
            </Col>
            }
            <Col md={12}>
              <div className={styles.leftPanel}>
                <Row>
                  <Col md={12}>
                    <div className={styles.savingSpinnerPlaceholder}>
                      {this.state.serverActionPending &&
                        <SavingSpinner title="Loading" borderStyle="none" size={8} />
                      }
                      {this.state.duplicateActionIsPending &&
                        <SavingSpinner title="Duplicating" borderStyle="none" size={8} />
                      }
                      {this.state.deletingMessage &&
                        <SavingSpinner title="Deleting" borderStyle="none" size={8} />
                      }
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <div className={styles.messageGroup}>
                      <h1 className={styles.groupName}>Default Messages</h1>
                      {this.renderSystemMessages()}
                    </div>
                  </Col>
                </Row>
                <Row className={styles.mT20}>
                  <Col md={12}>
                    <div className={styles.messageGroup}>
                      <h1 className={styles.groupName}>Custom Messages</h1>
                      {this.renderCustomMessages()}
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Grid>
        <CustomMessageForm
          showEditForm={this.state.showEditForm}
          hideCreateForm={this.hideEditModal}
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
        />
      </div>
    );
  }

}

CustomMessages.propTypes = {
  getProfileInformation: PropTypes.func
};
