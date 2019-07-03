import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './custom-message-form.module.scss';
import { Row, Col, FormControl, Modal, Alert, Tooltip, OverlayTrigger, FormGroup } from 'react-bootstrap';
import cx from 'classnames';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import { getPreview } from '../../../../actions';
import { getErrorMessage } from '../../../../helpers/task';
import { toast } from 'react-toastify';
import ActivityStream from '../../../activity-stream/activity-stream';

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
    this.renderExtraFields = this.renderExtraFields.bind(this);
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
    let sub_type = '';


    if(this.props.sub_type && this.props.sub_type === 'WORKER_REQUEST') {
      sub_type = this.props.sub_type;
    }

    getPreview(JSON.stringify(emailContent), sub_type).then((res) => {
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
    if (this.state.cursorField !== null) {
      const inputEl = this.state.cursorField;
      const tempString = this.state[inputEl];
      String.prototype.splice = function (idx, rem, str) {
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
          'subject': this.state.emailSubject,
          'message': this.state.emailMessage
        }
      };
    }
    const sub_type = this.state.message.sub_type;
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
      this.props.createMessage(messageName, messageType, messageContent, messageDescription, default_id, sub_type).then((res) => {
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

  renderExtraFields() {
    const fields = this.props.templates_extraFields.map((field, index) => {
    const field_name = field.field_name;
    const template_name = field.template_name;
      const tooltip = (
        <Tooltip id={'tooltip_' + index}>{"Extra field from template : " + template_name}</Tooltip>
      );

      let regex = /[^\w\s]/g;
      let name = field_name;
      name = name.replace(regex, '');
      name = name.replace(/\s+/g,'_').toLowerCase();

      return (
        <OverlayTrigger placement="bottom" key={index} overlay={tooltip}>
          <Row className={styles.extraFieldsRow} onClick={() => this.insertFieldHandler('{{' + name + '|extra}}')}>
            <Col md={6} sm={6} xs={12}>
              {field_name}
            </Col>
            <Col md={6} sm={6} xs={12}>
              {'{{' + name + '|extra}}'}
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
      <div className={styles.mask}>
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
      </div>
    );
  }

  render() {
    const message = this.state.message,
      errorMessage = (typeof this.state.errorText !== 'undefined' && this.state.errorText !== null) ? this.state.errorText : 'Could not load preview. Please try again.',
      crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756">
        <g transform="translate(-1270.486 -30.485)">
          <path
            d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z"
            transform="translate(4126.197 -40.804)" fill="#8d959f"/>
        </g>
      </svg>;
    return (
      <div>
        <div id="customMessagesFormModalContainer">
          <Modal dialogClassName={styles.CMEditModal} show={this.props.showEditForm} keyboard={false} backdrop={'static'} onHide={this.closeModal}>
            <Modal.Header className={styles.CMEditModalHeader}>
              <h2 className={styles.messageTitle}>{message.name === '' ? 'Add New Custom Message' : 'Edit: ' + message.name}</h2>
              <i className={styles.closeIcon} onClick={this.closeModal}>{crossIcon}</i>
            </Modal.Header>
            <Modal.Body className={styles.CMEditModalBody}>
              <Row>
                <Col md={6}>
                  {this.state.errorAlert && <Alert bsStyle="danger">{this.state.errorMessage}</Alert>}
                  <div className={cx(styles.box)}>
                    <h3 className={cx(styles.boxTitle)}>Name & Description</h3>
                    <div className={cx(styles.boxBody)}>
                      <div className={cx(styles.boxBodyInner, styles.descriptionBox)}>
                        <FormGroup>
                          {message.type === 'CUSTOM' ?
                            <FormControl
                              name="name"
                              onFocus={(e) => this.updateCursorPosition(e)}
                              onChange={(e) => this.handleMessageNameChange(e)}
                              placeholder="Message Name"
                              className={cx(styles.inputControl)}
                              type="text"
                              value={this.state.name}
                            />
                            :
                            <div className={styles.inputControl}>{this.state.name}</div>
                          }
                        </FormGroup>
                        <FormGroup>
                          {message.type === 'CUSTOM' ?
                            <FormControl
                              placeholder="Message Description"
                              name="description" onFocus={(e) => this.updateCursorPosition(e)}
                              onKeyUp={(e) => this.updateCursorPosition(e)}
                              onChange={(e) => this.handleContextChange(e)}
                              className={cx(styles.inputControl, styles.description)}
                              componentClass="textarea"
                              value={this.state.description}
                            />
                            :
                            <div className={styles.inputControl}>{this.state.description}</div>
                          }
                        </FormGroup>
                      </div>
                    </div>
                  </div>
                  {(message.content.email || message.type === 'CUSTOM') &&
                    <div className={cx(styles.box)}>
                      <h3 className={cx(styles.boxTitle)}>Email</h3>
                      <div className={cx(styles.boxBody)}>
                        <div className={cx(styles.boxBodyInner)}>
                          <FormGroup>
                            <div className={cx(styles.fieldLabelWrapper)}>
                              <strong>Subject</strong>
                              <div className={styles.linksWrapper}>
                                {message.type === 'SYSTEM' &&
                                <span>
                                  <a onClick={() => this.revertEmailContent()}>Reset</a>
                                  <label>&nbsp;/&nbsp;</label>
                                </span>
                                }
                                <a onClick={() => this.showEmailPreview()}>Preview  Message</a>
                              </div>
                            </div>
                            <FormControl
                              onFocus={(e) => this.updateCursorPosition(e)}
                              placeholder="Email Message Subject"
                              name="emailSubject"
                              onKeyUp={(e) => this.updateCursorPosition(e)}
                              onChange={(e) => this.handleEmailSubjectChange(e)}
                              className={cx(styles.inputControl)}
                              type="text"
                              value={this.state.emailSubject}
                            />
                          </FormGroup>
                          <FormGroup>
                            <div className={cx(styles.fieldLabelWrapper)}>
                              <strong>Message</strong>
                            </div>
                            <FormControl
                              onFocus={(e) => this.updateCursorPosition(e)}
                              placeholder="Email Message Content"
                              name="emailMessage"
                              onKeyUp={(e) => this.updateCursorPosition(e)}
                              onChange={(e) => this.handleEmailMessageChange(e)}
                              className={cx(styles.inputControl, styles.textareaField)}
                              componentClass="textarea"
                              value={this.state.emailMessage}
                            />
                          </FormGroup>
                        </div>
                      </div>
                    </div>
                  }
                  {(message.content.sms || message.type === 'CUSTOM') &&
                    <div className={cx(styles.box)}>
                      <h3 className={cx(styles.boxTitle)}>SMS</h3>
                      <div className={cx(styles.boxBody)}>
                        <div className={cx(styles.boxBodyInner)}>
                          <FormGroup>
                            <div className={cx(styles.fieldLabelWrapper)}>
                              <strong>Message</strong>
                              <div className={styles.linksWrapper}>
                                {message.type === 'SYSTEM' &&
                                <span>
                                  <a onClick={() => this.revertSMSContent()}>Reset</a>
                                  <label>&nbsp;/&nbsp;</label>
                                </span>
                                }
                                <a onClick={() => this.showSMSPreview()}>Preview Message</a>
                              </div>
                            </div>
                            <FormControl
                              onFocus={(e) => this.updateCursorPosition(e)}
                              placeholder="SMS Content"
                              name="smsMessage"
                              onKeyUp={(e) => this.updateCursorPosition(e)}
                              onChange={(e) => this.handleSmsMessageChange(e)}
                              className={cx(styles.inputControl, styles.textareaField)}
                              componentClass="textarea"
                              value={this.state.smsMessage}
                            />
                          </FormGroup>
                          <p className="text-right">{this.state.smsMessage.length} / 600</p>
                        </div>
                      </div>
                    </div>
                  }
                  {message.content.interface &&
                    <div className={cx(styles.box)}>
                      <div className={cx(styles.boxBody)}>
                        <div className={cx(styles.boxBodyInner)}>
                          <FormGroup>
                            <div className={cx(styles.fieldLabelWrapper)}>
                              <strong className={styles.contentLabel}>Message</strong>
                            </div>
                            <FormControl
                              onFocus={(e) => this.updateCursorPosition(e)}
                              placeholder="Interface Message"
                              name="interfaceMessage"
                              onKeyUp={(e) => this.updateCursorPosition(e)}
                              onChange={(e) => this.handleInterfaceMessageChange(e)}
                              className={cx(styles.inputControl, styles.textareaField)}
                              componentClass="textarea"
                              value={this.state.interfaceMessage}
                            />
                          </FormGroup>
                        </div>
                      </div>
                    </div>
                  }
                </Col>
                <Col md={6}>
                  <div className={cx(styles.box)}>
                    <h3 className={cx(styles.boxTitle)}>Dynamic Fields</h3>
                    <div className={cx(styles.boxBody)}>
                      <div className={cx(styles.boxBodyInner)}>
                        <div className={cx(styles.extraFields)}>
                          <p>Start typing and click on any field to insert at the cursor position.</p>
                          <div className={cx(styles.extraFieldsScroll)}>
                            {this.renderDefaultFields()}
                            {this.props.templates_extraFields && this.props.templates_extraFields.length > 0 &&
                            this.renderExtraFields()}
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                  <div className={cx(styles.btnWrapper)}>
                    <button onClick={this.closeModal} className={cx(styles.btn, styles['btn-light'])}>Close</button>
                    <button onClick={() => this.saveMessage()} className={cx(styles.btn, styles['btn-secondary'])} disabled={this.state.serverActionIsPending}>
                      {this.state.serverActionIsPending ? <SavingSpinner borderStyle="none" title=''/> : <span>Save Message</span> }
                    </button>
                  </div>
                </Col>
              </Row>
              {message && <div className={cx(styles.externalInfo)}>
                {message.id && <div><strong>ID</strong> : {message.id}</div>}
              </div>}
            </Modal.Body>
          </Modal>
        </div>
        <div id="customMessagesEmailPreviewModalContainer">
          <Modal dialogClassName={cx(styles.CMEditModal, styles.emailPreviewModal)} show={this.state.showEmailPreview} keyboard={false} backdrop={'static'} onHide={() => this.hideEmailPreview()}>
            <Modal.Header className={styles.CMEditModalHeader}>
              <h2 className={styles.messageTitle}>Email Message Preview</h2>
              <i className={styles.closeIcon} onClick={this.hideEmailPreview}>{crossIcon}</i>
            </Modal.Header>
            <Modal.Body>
              {this.state.loadingMessagePreview &&
              <div className={styles.previewLoadingContainer}>
                <SavingSpinner title="Loading Preview" borderStyle="none"/>
              </div>
              }
              {!this.state.loadingMessagePreview &&
              <div className={styles.previewMessageContainer}>
                {this.state.previewError && <Alert bsStyle="danger">{errorMessage}</Alert>}
                {this.state.previewContent && !this.state.previewError &&
                <div className={styles.emailMessageContainer}>
                  <iframe srcDoc={this.state.previewContent.email_message}></iframe>
                </div>
                }
              </div>
              }
            </Modal.Body>
            <Modal.Footer className={styles.CMEditModalFooter}>
              <button onClick={() => this.hideEmailPreview()} className={cx(styles.transparentBtn, ['btn-submit'])}>Close</button>
            </Modal.Footer>
          </Modal>
        </div>
        <div id="customMessagesSMSPreviewModalContainer">
          <Modal dialogClassName={styles.CMEditModal} show={this.state.showSMSPreview} keyboard={false} backdrop={'static'} onHide={() => this.hideSMSPreview()}>
            <Modal.Header className={styles.CMEditModalHeader}>
              <h2 className={styles.messageTitle}>SMS Message Preview</h2>
              <i className={styles.closeIcon} onClick={this.hideSMSPreview}>{crossIcon}</i>
            </Modal.Header>
            <Modal.Body className={styles.messagePreviewModalBody}>
              {this.state.loadingMessagePreview &&
              <div className={styles.previewLoadingContainer}>
                <SavingSpinner title="Loading Preview" borderStyle="none"/>
              </div>
              }
              {!this.state.loadingMessagePreview &&
              <div className={styles.previewMessageContainer}>
                {this.state.previewError && <Alert bsStyle="danger">{errorMessage}</Alert>}
                {this.state.previewContent && !this.state.previewError &&
                <div className={styles.smsPreviewContainer}>
                  <img src="/images/mock.png" alt="SMS Preview"/>
                  {this.generateSMSPreviewContent(this.state.previewContent)}
                </div>
                }
              </div>
              }
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
