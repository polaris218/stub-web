import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './custom-message-form.module.scss';
import { Row, Col, FormControl, Modal, Alert, Tooltip, OverlayTrigger, } from 'react-bootstrap';
import cx from 'classnames';
import SavingSpinner from '../saving-spinner/saving-spinner';
import { getPreview } from '../../actions';
import { getErrorMessage } from '../../helpers/task';
import { toast } from 'react-toastify';

export default class CustomMessageForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      message: null,
      smsMessage: '',
      emailSubject: '',
      emailMessage: '',
      description: '',
      interfaceMessage: '',
      name: '',
      cursorField: null,
      cursorPositionStart: null,
      errorAlert: false,
      errorMessage: '',
      serverActionIsPending: false,
      deletionIsPending: false,
      showEmailPreview: false,
      loadingMessagePreview: false,
      previewContent: null,
      previewError: false,
      showSMSPreview: false,
      previousMessage: null,
      errorText: null,
      editingMessage: false
    };

    this.editMessage = this.editMessage.bind(this);
    this.cancelEditing = this.cancelEditing.bind(this);
    this.saveMessage = this.saveMessage.bind(this);
    this.handleSmsMessageChange = this.handleSmsMessageChange.bind(this);
    this.handleEmailSubjectChange = this.handleEmailSubjectChange.bind(this);
    this.handleEmailMessageChange = this.handleEmailMessageChange.bind(this);
    this.handleContextChange = this.handleContextChange.bind(this);
    this.handleInterfaceMessageChange = this.handleInterfaceMessageChange.bind(this);
    this.handleMessageNameChange = this.handleMessageNameChange.bind(this);
    this.setInitialValuesInState = this.setInitialValuesInState.bind(this);
    this.insertFieldHandler = this.insertFieldHandler.bind(this);
    this.updateCursorPosition = this.updateCursorPosition.bind(this);
    this.deleteMessageHandler = this.deleteMessageHandler.bind(this);
    this.renderDefaultFields = this.renderDefaultFields.bind(this);
    this.hideAlert = this.hideAlert.bind(this);
    this.showEmailPreview = this.showEmailPreview.bind(this);
    this.hideEmailPreview = this.hideEmailPreview.bind(this);
    this.getEmailMessagePreview = this.getEmailMessagePreview.bind(this);
    this.showSMSPreview = this.showSMSPreview.bind(this);
    this.hideSMSPreview = this.hideSMSPreview.bind(this);
    this.generateSMSPreviewContent = this.generateSMSPreviewContent.bind(this);
    this.revertSMSContent = this.revertSMSContent.bind(this);
    this.revertEmailContent = this.revertEmailContent.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentWillMount() {
    this.setInitialValuesInState();
  }

  componentDidMount() {
    this.setInitialValuesInState();
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.showEditForm) {
      this.setState({
        editingMessage: false,
        previousMessage: null
      });
    }
    if (nextProps.showEditForm && !this.state.editingMessage) {
      if (this.state.previousMessage === null && nextProps.message !== null) {
        const message = {
          name: nextProps.message.name || '',
          smsMessage: nextProps.message.content.sms ? nextProps.message.content.sms.message : '',
          emailSubject: nextProps.message.content.email ? nextProps.message.content.email.subject : '',
          emailMessage: nextProps.message.content.email ? nextProps.message.content.email.message : '',
        };
        this.setState({
          previousMessage: message,
        });
      }
      this.setInitialValuesInState(nextProps);
      this.setState({
        editingMessage: true
      });
    }
  }

  setInitialValuesInState(properties = this.props) {
    if (properties.message !== null) {
      this.setState({
        message: properties.message,
        name: properties.message.name || '',
        smsMessage: properties.message.content.sms ? properties.message.content.sms.message : '',
        emailSubject: properties.message.content.email ? properties.message.content.email.subject : '',
        emailMessage: properties.message.content.email ? properties.message.content.email.message : '',
        description: properties.message.description || '',
        interfaceMessage: properties.message.content.interface ? properties.message.content.interface.text : ''
      });
    } else {
      const message = {
        type: 'CUSTOM',
        is_default: false,
        description: '',
        name: '',
        content: {
          email: {
            subject: '',
            message: ''
          },
          sms: {
            message: ''
          }
        }
      };
      this.setState({
        message,
        smsMessage: message.content.sms.message,
        emailSubject: message.content.email.subject,
        emailMessage: message.content.email.message,
        description: message.description,
        name: message.name,
        cursorField: null,
        cursorPositionStart: null
      });
    }
  }

  showEmailPreview() {
    this.setState({
      showEmailPreview: true
    });
    this.getEmailMessagePreview();
  }

  showSMSPreview() {
    this.setState({
      showSMSPreview: true
    });
    this.getEmailMessagePreview();
  }

  hideEmailPreview() {
    this.setState({
      showEmailPreview: false,
      previewError: false,
      previewContent: null,
      loadingMessagePreview: false
    });
  }

  revertSMSContent() {
    const previousSMSContent = this.state.previousMessage.smsMessage;
    this.setState({
      smsMessage: previousSMSContent
    }, () => {
      const updatedMessage = { ...this.state.message };
      updatedMessage.content.sms.message = this.state.smsMessage;
      this.props.onFieldsChange(updatedMessage);
    });
  }

  revertEmailContent() {
    const previousEmailMessage = this.state.previousMessage.emailMessage;
    const previousEmailSubject = this.state.previousMessage.emailSubject;
    this.setState({
      emailSubject: previousEmailSubject,
      emailMessage: previousEmailMessage
    }, () => {
      const updatedMessage = { ...this.state.message };
      updatedMessage.content.email.subject = this.state.emailSubject;
      updatedMessage.content.email.message = this.state.emailMessage;
      this.props.onFieldsChange(updatedMessage);
    });
  }

  closeModal() {
    this.props.hideCreateForm();
    this.setState({
      editingMessage: false
    });
  }

  hideSMSPreview() {
    this.setState({
      showSMSPreview: false,
      previewError: false,
      previewContent: null,
      loadingMessagePreview: false
    });
  }

  updateCursorPosition(e) {
    this.setState({
      cursorField: e.target.name,
      cursorPositionStart: e.target.selectionEnd
    });
  }

  getEmailMessagePreview() {

    this.setState({
      loadingMessagePreview: true
    });
    const emailContent = {
      email: {
        subject: this.state.emailSubject,
        message: this.state.emailMessage
      },
      sms: {
        message: this.state.smsMessage
      }
    };
    getPreview(JSON.stringify(emailContent)).then((res) => {
      this.setState({
        previewContent: JSON.parse(res),
        loadingMessagePreview: false
      });
    }).catch((err) => {
      const error = JSON.parse(err.responseText);
      this.setState({
        loadingMessagePreview: false
      }, () => {
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
    });
  }

  insertFieldHandler(newValue) {
    if (newValue.indexOf('safe') > -1 && this.state.cursorField === 'smsMessage') {
      alert('Fields marked as "SAFE" contain HTML and cannot be added into SMS message.');
      return;
    } else if (this.state.cursorField !== null) {
      const inputEl = this.state.cursorField;
      const tempString = this.state[inputEl];
      String.prototype.splice = function(idx, rem, str) {
        return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
      };
      const newString = tempString.splice(this.state.cursorPositionStart, 0, newValue);
      const updatedCursorPosition = this.state.cursorPositionStart + newValue.length;
      this.setState({
        [inputEl]: newString,
        cursorPositionStart: updatedCursorPosition
      });
    } else {
      return;
    }
  }

  editMessage() {
    this.props.enableEditingMode();
  }

  cancelEditing() {
    this.props.disableEditingMode();
  }

  handleMessageNameChange(e) {
    this.setState({
      name: e.target.value
    }, () => {
      const updatedMessage = { ...this.state.message };
      updatedMessage.name = this.state.name;
      this.props.onFieldsChange(updatedMessage);
    });
  }

  handleSmsMessageChange(e) {
    this.setState({
      smsMessage: e.target.value.substr(0, 600)
    }, () => {
      const updatedMessage = { ...this.state.message };
      if (typeof updatedMessage.content.sms !== 'undefined') {
        updatedMessage.content.sms.message = this.state.smsMessage;
      } else {
        updatedMessage.content = {
          ...updatedMessage.content,
          sms: {
            message: this.state.smsMessage
          }
        };
      }
      this.props.onFieldsChange(updatedMessage);
    });
  }

  handleEmailSubjectChange(e) {
    this.setState({
      emailSubject: e.target.value
    }, () => {
      const updatedMessage = { ...this.state.message };
      updatedMessage.content.email.subject = this.state.emailSubject;
      this.props.onFieldsChange(updatedMessage);
    });
  }

  handleEmailMessageChange(e) {
    this.setState({
      emailMessage: e.target.value
    }, () => {
      const updatedMessage = { ...this.state.message };
      updatedMessage.content.email.message = this.state.emailMessage;
      this.props.onFieldsChange(updatedMessage);
    });
  }

  handleContextChange(e) {
    this.setState({
      description: e.target.value
    }, () => {
      const updatedMessage = { ...this.state.message };
      updatedMessage.description = this.state.description;
      this.props.onFieldsChange(updatedMessage);
    });
  }

  handleInterfaceMessageChange(e) {
    this.setState({
      interfaceMessage: e.target.value
    });
  }

  hideAlert() {
    this.setState({
      errorAlert: false,
      errorMessage: false
    });
  }

  saveMessage() {
    this.setState({
      serverActionIsPending: true
    });
    let content = '';
    if (this.state.message.type === 'INTERFACE') {
      content = {
        'interface': {
          'text': this.state.interfaceMessage
        }
      };
    } else if (this.state.message.type === 'SYSTEM' || this.state.message.type === 'CUSTOM') {
      content = {
        'sms': {
          'message': this.state.smsMessage
        },
        'email': {
          'subject' : this.state.emailSubject,
          'message' : this.state.emailMessage
        }
      };
    }
    const messageType = this.state.message.type;
    const messageDescription = this.state.description;
    const messageName = this.state.name;
    const messageContent = JSON.stringify(content);
    const messageId = this.state.message.id;
    const default_id = this.state.message.default_id;
    if (this.state.message.id) {
      this.props.updateMessage(messageName, messageType, messageContent, messageDescription, messageId).then((res) => {
        this.props.updateMessageCallback(true);
        this.setState({
          serverActionIsPending: false,
          editingMessage: false
        });
        this.props.hideCreateForm();
      }).catch((err) => {
        const error = JSON.parse(err.responseText);
        this.setState({
          serverActionIsPending: false
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
    } else {
      this.props.createMessage(messageName, messageType, messageContent, messageDescription, default_id).then((res) => {
        this.setState({
          serverActionIsPending: false,
          editingMessage: false,
        });
        this.props.hideCreateForm();
        this.props.createMessageCallback(true);
      }).catch((err) => {
        const error = JSON.parse(err.responseText);
        this.setState({
          serverActionIsPending: false
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
  }

  deleteMessageHandler(id) {
    this.setState({
      deletionIsPending: true
    });
    this.props.deleteMessage(id).then((res) => {
      this.setState({
        deletionIsPending: false,
        editingMessage: false
      });
      this.props.hideCreateForm();
      this.props.deleteMessageCallback(true);
    }).catch((err) => {
      this.setState({
        deletionIsPending: false,
        editingMessage: false
      });
      this.props.hideCreateForm();
      this.props.deleteMessageCallback(false);
    });
  }

  renderDefaultFields() {
    const fields = this.props.defaultFields.map((field, index) => {
      const tooltip = (
        <Tooltip id={'tooltip_' + field.keyword}>{field.description}</Tooltip>
      );
      return (
        <OverlayTrigger placement="bottom" key={index} overlay={tooltip}>
          <Row className={styles.extraFieldsRow} onClick={() => this.insertFieldHandler('{{' + field.keyword + '}}')}>
            <Col md={6} sm={6} xs={12}>
              {field.title}
            </Col>
            <Col md={6} sm={6} xs={12}>
              {'{{' + field.keyword + '}}'}
            </Col>
          </Row>
        </OverlayTrigger>
      );
    });
    return fields;
  }

  generateSMSPreviewContent(SMSContent) {
    const SMSMessage = SMSContent.sms_message;
    const URL = SMSMessage.match(/\bhttps?:\/\/\S+/gi);
    const messageOnly = SMSMessage.replace(/\bhttps?:\/\/\S+/gi, '');
    return (
      <span>
        <span className={styles.SMSPreviewContent}>{messageOnly}</span>
        {URL !== null &&
        <a target="_blank" href={URL}>
          <span className={styles.SMSPreviewContent}>
            <img src={this.props.profile.image_path} alt=""/>
            <div><strong>{this.props.profile.fullname} : {this.props.profile.intro}</strong></div>
            <p>{URL}</p>
          </span>
        </a>
        }
      </span>
    );
  }

  render() {
    const message = this.state.message;
    const errorMessage = (typeof this.state.errorText !== 'undefined' && this.state.errorText !== null) ? this.state.errorText : 'Could not load preview. Please try again.';
    return (
      <div>
        <div id="customMessagesFormModalContainer">
          <Modal dialogClassName={styles.CMEditModal} show={this.props.showEditForm} onHide={this.closeModal}>
            <Modal.Header closeButton className={styles.CMEditModalHeader}>
              <h2 className={styles.messageTitle}>
                {message.name === '' ? 'Add New Custom Message' : 'Edit: ' + message.name}
              </h2>
            </Modal.Header>
            <Modal.Body className={styles.CMEditModalBody}>
              <Row>
                <Col md={7}>
                  <Row>
                    <Col md={12}>
                      {this.state.errorAlert &&
                      <Alert bsStyle="danger">
                        {this.state.errorMessage}
                      </Alert>
                      }
                    </Col>
                  </Row>
                  <Row className={styles.contentRowContainer}>
                    <Col md={3} sm={3}>
                      <label className={styles.contentLabel}>
                        Name
                      </label>
                    </Col>
                    {message.type === 'CUSTOM' ?
                      <Col md={9} sm={9}>
                        <FormControl name="name" onFocus={(e) => this.updateCursorPosition(e)}
                          onChange={(e) => this.handleMessageNameChange(e)} placeholder="Message Name"
                          className={cx(styles.inputControl)} type="text" value={this.state.name}/>
                      </Col>
                      :
                      <Col md={9} sm={9}>
                        <div className={styles.inputControl}>
                          {this.state.name}
                        </div>
                      </Col>
                    }
                  </Row>
                  { message.type === 'CUSTOM' ?
                    <Row className={styles.contentRowContainer}>
                      <Col md={3} sm={3}>
                        <span className={styles.contentLabel}>
                          Description
                        </span>
                      </Col>
                      <Col md={9} sm={9}>
                        <FormControl placeholder="Message description" name="description" onFocus={(e) => this.updateCursorPosition(e)} onKeyUp={(e) => this.updateCursorPosition(e)} onChange={(e) => this.handleContextChange(e)} className={cx(styles.inputControl)} type="text" value={this.state.description} />
                      </Col>
                    </Row>
                    :
                    <Row className={styles.contentRowContainer}>
                      <Col md={3} sm={3}>
                        <span className={styles.contentLabel}>
                          Description
                        </span>
                      </Col>
                      <Col md={9} sm={9}>
                        <div className={styles.inputControl}>
                          {this.state.description}
                        </div>
                      </Col>
                    </Row>
                  }
                  { (message.content.email || message.type === 'CUSTOM') &&
                  <Row className={styles.contentRowContainer}>
                    <Col md={12} className={styles.relativeContainer}>
                      <h2 className={styles.contentName}>
                        Email
                      </h2>
                      { message.type === 'SYSTEM' &&
                        <div>
                          <a className={styles.resetContentButtons} onClick={() => this.revertEmailContent()}>Reset</a>
                          <label>/</label>
                        </div>
                      }
                      <a onClick={() => this.showEmailPreview()} className={styles.emailMessagePreviewLink}>Preview Message</a>
                    </Col>
                    <Col md={3} sm={3}>
                      <label className={styles.contentLabel}>
                        Subject
                      </label>
                    </Col>
                    <Col md={9} sm={9}>
                      <FormControl onFocus={(e) => this.updateCursorPosition(e)} placeholder="Email Message Subject" name="emailSubject" onKeyUp={(e) => this.updateCursorPosition(e)} onChange={(e) => this.handleEmailSubjectChange(e)} className={cx(styles.inputControl)} type="text" value={this.state.emailSubject} />
                    </Col>
                    <Col md={3} sm={3} className={styles.mT10}>
                      <label className={styles.contentLabel}>
                        Message
                      </label>
                    </Col>
                    <Col md={9} sm={9} className={styles.mT10}>
                      <FormControl onFocus={(e) => this.updateCursorPosition(e)} placeholder="Email Message Content" name="emailMessage" onKeyUp={(e) => this.updateCursorPosition(e)} onChange={(e) => this.handleEmailMessageChange(e)} className={cx(styles.inputControl, styles.textareaField)} componentClass="textarea" value={this.state.emailMessage} />
                    </Col>
                  </Row>
                  }
                  { (message.content.sms || message.type === 'CUSTOM') &&
                  <Row className={styles.contentRowContainer}>
                    <Col md={12}>
                      <h2 className={styles.contentName}>
                        SMS
                      </h2>
                      { message.type === 'SYSTEM' &&
                        <div>
                          <a className={styles.resetContentButtons} onClick={() => this.revertSMSContent()}>Reset</a>
                          <label>/</label>
                        </div>
                      }
                      <a onClick={() => this.showSMSPreview()} className={styles.emailMessagePreviewLink}>Preview Message</a>
                    </Col>
                    <Col md={3} sm={3}>
                <span className={styles.contentLabel}>
                  Message
                </span>
                    </Col>
                    <Col md={9} sm={9}>
                      <FormControl onFocus={(e) => this.updateCursorPosition(e)} placeholder="SMS Content" name="smsMessage" onKeyUp={(e) => this.updateCursorPosition(e)} onChange={(e) => this.handleSmsMessageChange(e)} className={cx(styles.inputControl, styles.textareaField)} componentClass="textarea" value={this.state.smsMessage} />
                      <p className="text-right">{this.state.smsMessage.length} / 600</p>
                    </Col>
                  </Row>
                  }
                  { message.content.interface &&
                  <Row className={styles.contentRowContainer}>
                    <Col md={3} sm={3}>
                  <span className={styles.contentLabel}>
                    Message
                  </span>
                    </Col>
                    <Col md={9} sm={9}>
                      <FormControl onFocus={(e) => this.updateCursorPosition(e)} placeholder="Interface Message" name="interfaceMessage" onKeyUp={(e) => this.updateCursorPosition(e)} onChange={(e) => this.handleInterfaceMessageChange(e)} className={cx(styles.inputControl, styles.textareaField)} componentClass="textarea" value={this.state.interfaceMessage} />
                    </Col>
                  </Row>
                  }
                </Col>
                <Col md={5}>
                  <div className={styles.extraFields}>
                    <h2>Dynamic Fields</h2>
                    <p>Start typing and click on any field to insert at the cursor position.</p>
                    {this.renderDefaultFields()}
                  </div>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className={styles.CMEditModalFooter}>
              <button onClick={() => this.saveMessage()} className={cx(['btn-submit'], styles.saveBtn)}>
                {this.state.serverActionIsPending &&
                <SavingSpinner borderStyle="none" title='' />
                }
                {!this.state.serverActionIsPending &&
                <span>Save Message</span>
                }
              </button>
              <button onClick={this.closeModal} className={cx(styles.transparentBtn, ['btn-submit'])}>Close</button>
            </Modal.Footer>
          </Modal>
        </div>
        <div id="customMessagesEmailPreviewModalContainer">
          <Modal dialogClassName={styles.CMEditModal} show={this.state.showEmailPreview} onHide={() => this.hideEmailPreview()}>
            <Modal.Header closeButton className={styles.CMEditModalHeader}>
              <h2 className={styles.messageTitle}>
                Email Message Preview
              </h2>
            </Modal.Header>
            <Modal.Body className={styles.messagePreviewModalBody}>
              <Row>
                <Col md={12}>
                  {this.state.loadingMessagePreview &&
                    <div className={styles.previewLoadingContainer}>
                      <SavingSpinner title="Loading Preview" borderStyle="none" />
                    </div>
                  }
                  {!this.state.loadingMessagePreview &&
                    <div className={styles.previewMessageContainer}>
                      {this.state.previewError &&
                        <Alert bsStyle="danger">{ errorMessage }</Alert>
                      }
                      {this.state.previewContent && !this.state.previewError &&
                      <div className={styles.emailMessageContainer}>
                        <iframe srcDoc={this.state.previewContent.email_message}></iframe>
                      </div>
                      }
                    </div>
                  }
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className={styles.CMEditModalFooter}>
              <button onClick={() => this.hideEmailPreview()} className={cx(styles.transparentBtn, ['btn-submit'])}>Close</button>
            </Modal.Footer>
          </Modal>
        </div>
        <div id="customMessagesSMSPreviewModalContainer">
          <Modal dialogClassName={styles.CMEditModal} show={this.state.showSMSPreview} onHide={() => this.hideSMSPreview()}>
            <Modal.Header closeButton className={styles.CMEditModalHeader}>
              <h2 className={styles.messageTitle}>
                SMS Message Preview
              </h2>
            </Modal.Header>
            <Modal.Body className={styles.messagePreviewModalBody}>
              <Row>
                <Col md={12}>
                  {this.state.loadingMessagePreview &&
                  <div className={styles.previewLoadingContainer}>
                    <SavingSpinner title="Loading Preview" borderStyle="none" />
                  </div>
                  }
                  {!this.state.loadingMessagePreview &&
                  <div className={styles.previewMessageContainer}>
                    {this.state.previewError &&
                    <Alert bsStyle="danger">{ errorMessage }</Alert>
                    }
                    {this.state.previewContent && !this.state.previewError &&
                      <div className={styles.smsPreviewContainer}>
                        <img src="/images/mock.png" alt="SMS Preview" />
                        {this.generateSMSPreviewContent(this.state.previewContent)}
                      </div>
                    }
                  </div>
                  }
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className={styles.CMEditModalFooter}>
              <button onClick={() => this.hideSMSPreview()} className={cx(styles.transparentBtn, ['btn-submit'])}>Close</button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    );
  }
}

CustomMessageForm.propTypes = {
  onFieldsChange: PropTypes.func
};
