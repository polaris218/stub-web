import React, {Component} from 'react';
import cx from "classnames";
import styles from "./worker-request-details-tabs.module.scss";
import { ControlLabel, Modal, Row, Col, Tabs, Tab } from 'react-bootstrap';
import {FieldGroup} from "../../../../fields";
import {
  createMessage,
  deleteMessage,
  getDefaultFields,
  getPreview,
  updateMessage,
  getUpdatedMessage
} from "../../../../../actions/custom-messages"
import SavingSpinner from "../../../../saving-spinner/saving-spinner";
import {getErrorMessage} from "../../../../../helpers/task";
import {toast} from "react-toastify";
import CustomMessageForm from '../../../../account-wrapper-v2/components/custom-message-form/custom-message-form';
import moment from 'moment';

export default class WorkerRequestMessage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      message_types: [],
      selected_message: null,
      showEmailPreview: false,
      showSMSPreview: false,
      preview: null,
      showEditForm: false,
      default_fields: [],
      tabSelected: 1
    };
    this.renderMessages = this.renderMessages.bind(this);
    this.previewMessageHandler = this.previewMessageHandler.bind(this);
    this.hideEmailPreview = this.hideEmailPreview.bind(this);
    this.hideSMSPreview = this.hideSMSPreview.bind(this);
    this.generateSMSPreviewContent = this.generateSMSPreviewContent.bind(this);
    this.showEmailPreview = this.showEmailPreview.bind(this);
    this.showSMSPreview = this.showSMSPreview.bind(this);
    this.openEditModal = this.openEditModal.bind(this);
    this.hideEditModal = this.hideEditModal.bind(this);
    this.handleSelectedMessageFieldsChange = this.handleSelectedMessageFieldsChange.bind(this);
    this.updateMessageCallback = this.updateMessageCallback.bind(this);
    this.saveMessageCallback = this.saveMessageCallback.bind(this);
    this.createToastAlert = this.createToastAlert.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    // this.updateMessageList = this.updateMessageList.bind(this);
  }

  componentDidMount() {
    if (this.props.worker_request_object) {
      let all_messages = this.props.worker_request_object.request_messages;

      let all_messages_keys = ['Worker Request Invitation Message', 'Worker Request Accepted Message', 'Worker Request Rejected Message'];

      let messages = all_messages_keys.map((message) => {
        let short_name = '';
        if (message === 'Worker Request Invitation Message') {
          short_name = 'Invitation Message'
        }else if (message === 'Worker Request Accepted Message') {
          short_name = 'Accepted Message'
        }else if (message === 'Worker Request Rejected Message') {
          short_name = 'Rejected Message'
        }
        return {details: all_messages[message], short_name: short_name};
      });


      this.setState({
        messages,
      });
    }
    getDefaultFields().then((res) => {
      const default_fields = JSON.parse(res);
      const worker_request_fields = default_fields.filter((field) => {
        if (field.supported_message_types.indexOf('WORKER_REQUEST') >= 0) {
          return field;
        }
      });

      this.setState({
        default_fields: worker_request_fields,
      })

    });

  }

  componentDidUpdate(prevProps, prevState, snapshot) {

    if (!_.isEqual(this.props.worker_request_object, prevProps.worker_request_object)) {
      let all_messages = this.props.worker_request_object.request_messages;

      let all_messages_keys = ['Worker Request Invitation Message', 'Worker Request Accepted Message', 'Worker Request Rejected Message'];

      let messages = all_messages_keys.map((message) => {

        let short_name = '';
        if (message === 'Worker Request Invitation Message') {
          short_name = 'Invitation Message'
        }else if (message === 'Worker Request Accepted Message') {
          short_name = 'Accepted Message'
        }else if (message === 'Worker Request Rejected Message') {
          short_name = 'Rejected Message'
        }
        return {details: all_messages[message], short_name: short_name};
      });

      this.setState({
        messages,
      });
    }
  }

  // updateMessageList() {
  //
  //   getUpdatedMessage(this.state.selected_message.id).then((res) => {
  //     const updated_message = JSON.parse(res);
  //     let messages = this.state.messages;
  //     messages = messages.map((message) => {
  //       if (message.id === updated_message.id) {
  //         message = updated_message;
  //       }
  //       return message;
  //     });
  //     this.setState({
  //       messages,
  //     })
  //   });
  //
  // }

  createToastAlert(alert) {
    toast(alert.text, alert.options);
  }

  handleSelectedMessageFieldsChange(updatedMessage) {
    if (this.state.selected_message !== null) {
      this.setState({
        selected_message: updatedMessage
      });
    } else {
      return;
    }
  }

  openEditModal(message) {
    this.setState({
      showEditForm: true,
      selected_message: $.extend(true, {}, message),
    })
  }

  hideEditModal() {
    this.setState({
      showEditForm: false,
      selected_message: null,
    })
  }

  showEmailPreview(content) {
    this.setState({
      showEmailPreview: true
    });
    this.previewMessageHandler(content);
  }

  showSMSPreview(content) {
    this.setState({
      showSMSPreview: true
    });
    this.previewMessageHandler(content);
  }

  hideEmailPreview() {
    this.setState({
      showEmailPreview: false,
      preview: null
    })
  }

  hideSMSPreview() {
    this.setState({
      showSMSPreview: false,
      preview: null
    })
  }

  previewMessageHandler(content) {
    this.setState({
      loadingMessagePreview: true,
    });

    getPreview(JSON.stringify(content), 'WORKER_REQUEST').then((res) => {
      const preview = JSON.parse(res);
      this.setState({
        preview,
        loadingMessagePreview: false,
      })
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
        this.createToastAlert(alert);
      });
    });

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
      this.createToastAlert(updated);
      if (!_.isEmpty(this.props.updatedData)) {
        this.props.handleUpdateWorkerRequest(this.props.updatedData);
      }
      this.props.getWorkerRequestData(this.props.worker_request_object.id);
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
      this.createToastAlert(updateFailed);
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
      this.createToastAlert(saved);
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
      this.createToastAlert(savingFailed);
    }
  }

  renderMessages() {
    let renderMessage = null;

    if (this.state.message_types) {
      renderMessage = this.state.messages.map((message, index) => {
        return (
          <Tab eventKey={index+1} title={message.short_name} key={index}>
            <div className={styles.requestInfo}>Request {this.props.number_of_workers_required} person(s) from {this.props.start_datetime} - {this.props.end_datetime} on {moment.utc(this.props.request_date).local().format('dddd MMM DD, YYYY')}</div>
            <Row>
              <Col xs={12} sm={6}>
                <div className={cx(styles.box, styles.messageBox)}>
                  <h3 className={styles.boxTitle}>Email</h3>
                  <div className={styles.boxBody}>
                    <div className={styles.boxBodyInner}>
                      <ControlLabel className={styles.boxTitle}>Subject</ControlLabel>
                      <FieldGroup name="worker-request-title" placeholder="Email Subject" ref="title" disabled={true} value={message.details.pre_render_content.email.subject}/>
                      <ControlLabel className={styles.boxTitle}>Message</ControlLabel>
                      <FieldGroup componentClass="textarea" name="descriptions" placeholder="Email Body" disabled={true} value={message.details.pre_render_content.email.message} className={cx(styles["form-control"])}/>
                      <div className="text-right">
                        <button onClick={() => this.openEditModal(message.details)}
                                disabled={this.props.disableStatuses.indexOf(this.props.worker_request_object.request_status) >= 0 ? false : true}
                                className={cx(styles.btn, styles['btn-primary'])}>Edit Email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className={cx(styles.box, styles.messageBox)}>
                  <h3 className={styles.boxTitle}>SMS</h3>
                  <div className={styles.boxBody}>
                    <div className={styles.boxBodyInner}>
                      <ControlLabel className={styles.boxTitle}>Message</ControlLabel>
                      <FieldGroup
                        componentClass="textarea" name="descriptions" placeholder="SMS Body" disabled={true}
                        value={message.details.pre_render_content.sms.message}
                        className={cx(styles.smsField, styles["form-control"])}
                      />
                      <div className="text-right">
                        <button onClick={() => this.openEditModal(message.details)}
                                disabled={this.props.disableStatuses.indexOf(this.props.worker_request_object.request_status) >= 0 ? false : true}
                                className={cx(styles.btn, styles['btn-primary'])}>Edit SMS
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Tab>
        );
      })

    } else {
      renderMessage = (<div className={styles.noWorkerRequestFound}>No Worker Requests found</div>);
    }

    return renderMessage;
  }

  generateSMSPreviewContent(SMSContent) {
    const SMSMessage = SMSContent.sms_message;
    const URL = SMSMessage.match(/\bhttps?:\/\/\S+/gi);
    const messageOnly = SMSMessage.replace(/\bhttps?:\/\/\S+/gi, '');
    return (
      <span className={styles.mask}>
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

  handleSelect(eventKey) {
    this.setState({
      tabSelected: eventKey,
    });
  }

  render() {
    const crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756"
                           viewBox="0 0 11.758 11.756">
      <g transform="translate(-1270.486 -30.485)">
        <path
          d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z"
          transform="translate(4126.197 -40.804)" fill="#8d959f"/>
      </g>
    </svg>;

    return (
      <div>
        <Tabs id="custom_messages" className={styles.custom_messages} activeKey={this.state.tabSelected} onSelect={(tabSelected) => this.handleSelect(tabSelected)}>
          {this.renderMessages()}
        </Tabs>
        {<CustomMessageForm
          showEditForm={this.state.showEditForm}
          hideCreateForm={this.hideEditModal}
          message={this.state.selected_message}
          deleteMessage={deleteMessage}
          deleteMessageCallback={this.deleteMessageCallback}
          updateMessage={updateMessage}
          updateMessageCallback={this.updateMessageCallback}
          createMessage={createMessage}
          createMessageCallback={this.saveMessageCallback}
          defaultFields={this.state.default_fields}
          onFieldsChange={this.handleSelectedMessageFieldsChange}
          profile={this.props.profile}
          createToastAlert={this.createToastAlert}
          sub_type={'WORKER_REQUEST'}
        />}
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
                {this.state.preview &&
                <div className={styles.emailMessageContainer}>
                  <iframe srcDoc={this.state.preview.email_message}></iframe>
                </div>
                }
              </div>
              }
            </Modal.Body>
            <Modal.Footer className={styles.CMEditModalFooter}>
              <button onClick={() => this.hideEmailPreview()} className={['btn-submit']}>Close</button>
            </Modal.Footer>
          </Modal>
        </div>
        <div id="customMessagesSMSPreviewModalContainer">
          <Modal dialogClassName={styles.CMEditModal} show={this.state.showSMSPreview} keyboard={false} backdrop={'static'} onHide={() => this.hideSMSPreview()}>
            <Modal.Header className={styles.CMEditModalHeader}>
              <h2 className={styles.messageTitle}>SMS Message Preview</h2>
              <i className={styles.closeIcon} onClick={() => this.hideSMSPreview()}>{crossIcon}</i>
            </Modal.Header>
            <Modal.Body className={styles.messagePreviewModalBody}>
              {this.state.loadingMessagePreview &&
              <div className={styles.previewLoadingContainer}>
                <SavingSpinner title="Loading Preview" borderStyle="none"/>
              </div>
              }
              {!this.state.loadingMessagePreview &&
              <div className={styles.previewMessageContainer}>
                {this.state.preview &&
                <div className={styles.smsPreviewContainer}>
                  <img src="/images/mock.png" alt="SMS Preview"/>
                  {this.generateSMSPreviewContent(this.state.preview)}
                </div>
                }
              </div>
              }
            </Modal.Body>
            <Modal.Footer className={styles.CMEditModalFooter}>
              <button onClick={() => this.hideSMSPreview()} className={['btn-submit']}>Close</button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    );
  }

}
