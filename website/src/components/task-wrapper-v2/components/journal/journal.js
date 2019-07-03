import React, {Component} from 'react';
import style from '../../base-styling.module.scss';
import styles from './journal.module.scss';
import cx from 'classnames';
import {getStatusDetails} from "../../../../helpers/status_dict_lookup";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {getCustomMessageName} from '../../../../helpers/custom-messages';
import {
  faCircle,
  faComment,
  faEnvelope,
  faGlobe,
  faMapMarker,
  faMobile,
  faPaperclip, faPlus,
  faSync,
} from '@fortawesome/fontawesome-free-solid';
import {faCommentAlt, faEnvelope as faEnvelopeRegular} from '@fortawesome/fontawesome-free-regular';
import {
  Button,
  FormControl,
  FormGroup,
  Glyphicon,
  OverlayTrigger,
  Row,
  Tooltip,
  Col,
  Modal,
  Alert
} from "react-bootstrap";
import moment from "moment";
import StatusMap from "../../../task-status/status-map";
import TaskProducts from "../../../task-products/task-products";
import {STATUS_META_DATA} from "../../../../helpers/status_meta_data";
import Dropzone from "react-dropzone";
import {faTimesCircle} from "@fortawesome/fontawesome-free-regular";
import SavingSpinner from "../../../saving-spinner/saving-spinner";
import {getPreview} from "../../../../actions";
import {getErrorMessage} from "../../../../helpers/task";
import {toast} from "react-toastify";
import SwitchButton from "../../../../helpers/switch_button";

export default class Journal extends Component {
  constructor(props) {
    super(props);

    this.renderFileUploadAreaForLowRes = this.renderFileUploadAreaForLowRes.bind(this);
    this.handleCustomerMessageChange = this.handleCustomerMessageChange.bind(this);
    this.emailModal = this.emailModal.bind(this);
    this.hideEmailPreview = this.hideEmailPreview.bind(this);
    this.hideSMSPreview = this.hideSMSPreview.bind(this);
    this.showEmailPreview = this.showEmailPreview.bind(this);
    this.generateSMSPreviewContent = this.generateSMSPreviewContent.bind(this);
    this.showSMSPreview = this.showSMSPreview.bind(this);
    this.smsModal = this.smsModal.bind(this);
    this.handleShowMessageChange = this.handleShowMessageChange.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);

    this.state = {
      selectMessageType: '',
      messageToDisplay: false,
      showEmailPreview: false,
      previewContent: null,
      content: {},
      showMessage: false,
      task_id: 0,
      message_id: 0,
      message_name:'',
    }
  }

  handleButtonClick(e, id, type, title, status, endDatePassed, visibleToCustomer, color, custom_message_template) {
    e.stopPropagation();
    this.props.sendTaskStatus(type, title, id, null, null, visibleToCustomer, color, custom_message_template, null);
  }

  renderStatusList() {
    const statusList = this.props.statusList;
    const length = statusList.length;
    if (length == 0) {
      return <div className={styles['status-feed-empty']}>No status or notes reported</div>;
    }
    const statusComponents = statusList.map((statusObj, i) => {
      if (typeof statusObj.is_active === 'undefined' || statusObj.is_active === null || statusObj.is_active) {
        let statusColor = statusObj.color;
        if (!statusColor || !statusObj.color) {
          const status_object_local = getStatusDetails(statusObj.type);
          statusColor = status_object_local.color;
        } else {
          statusColor = statusObj.color;
        }
        let lastStyle = {
          width: '15px',
          height: '15px',
          marginTop: '10px',
          backgroundColor: 'white',
          border: "3px solid " + statusColor
        };


        let files = null;
        if (statusObj.extra_fields && statusObj.extra_fields.files && statusObj.extra_fields.files.length > 0) {
          files = statusObj.extra_fields.files.map((file) => {
            if ((!file) || (!file.filename) || (!file.file_path)) {
              return;
            } else {
              const fileExtension = file.filename.split('.').pop();
              let showPreview = false;
              if (fileExtension.includes('jpg') || fileExtension.includes('JPG') || fileExtension.includes('JPEG') || fileExtension.includes('jpeg') || fileExtension.includes('png') || fileExtension.includes('PNG') || fileExtension.includes('gif') || fileExtension.includes('GIF') || fileExtension.includes('bimp') || fileExtension.includes('BIMP') || fileExtension.includes('bmp') || fileExtension.includes('BMP')) {
                showPreview = true;
              }
              return (
                <div className={styles['file-preview-journal']}>
                  <a href={file.file_path} target="_blank">
                    {showPreview &&
                    <img src={file.file_path} className="img-responsive img-rounded full-width"
                         style={{maxHeight: '485px'}}/>}
                    {!showPreview &&
                    <FontAwesomeIcon icon={faPaperclip}/>}
                    {file.filename}
                  </a>
                </div>
              );
            }
          });
        }
        let exception_files = null;
        if (statusObj.exception && statusObj.exception.files && statusObj.exception.files.length > 0) {
          exception_files = statusObj.exception.files.map((file) => {
            if (!file.filename || !file.file_path) {
              return;
            } else {
              const fileExtension = file.filename.split('.').pop();
              let showPreview = false;
              if (fileExtension.includes('jpg') || fileExtension.includes('JPG') || fileExtension.includes('JPEG') || fileExtension.includes('jpeg') || fileExtension.includes('png') || fileExtension.includes('PNG') || fileExtension.includes('gif') || fileExtension.includes('GIF') || fileExtension.includes('bimp') || fileExtension.includes('BIMP') || fileExtension.includes('bmp') || fileExtension.includes('BMP')) {
                showPreview = true;
              }
              return (
                <div className={styles['file-preview-journal']}>
                  <a href={file.file_path} target="_blank">
                    {showPreview &&
                    <img src={file.file_path} className="img-responsive img-rounded full-width"
                         style={{maxHeight: '485px'}}/>}
                    {!showPreview &&
                    <FontAwesomeIcon icon={faPaperclip}/>}
                    {file.filename}
                  </a>
                </div>
              );
            }
          });
        }

        const isCustomStatus = statusObj.type === 'CUSTOM';
        const sourceTooltip = (
          <Tooltip id="tooltip">Posted via {statusObj.source}</Tooltip>
        );

        const locationToolTip = (
          <Tooltip id="tooltip">Click to toggle location map for this status</Tooltip>
        );

        const systemNotificationTooltip = (
          <Tooltip id="notificationTooltip">This is a system notification</Tooltip>
        );

        let taskStatusReporterName = statusObj.reporter_name;
        if (statusObj.from_customer && statusObj.reporter_name === '') {
          taskStatusReporterName = 'Customer';
        }

        let smsAndEmailPresent = '';

        if (statusObj.notifications_info && statusObj.notifications_info.sms_status && statusObj.notifications_info.sms_status === "COMPLETE" && statusObj.notifications_info && statusObj.notifications_info.email_status && statusObj.notifications_info.email_status === "COMPLETE") {
          smsAndEmailPresent = (
            <p>
              <FontAwesomeIcon icon={faEnvelope}/> <FontAwesomeIcon
              icon={faCommentAlt}/> {statusObj.notifications_info.message}
            </p>);
        } else if (statusObj.notifications_info && statusObj.notifications_info.sms_status && statusObj.notifications_info && statusObj.notifications_info.sms_status === "COMPLETE") {
          smsAndEmailPresent = (
            <p>
              <FontAwesomeIcon icon={faCommentAlt}/> {statusObj.notifications_info.message}
            </p>);
        } else if (statusObj.notifications_info && statusObj.notifications_info.email_status && statusObj.notifications_info && statusObj.notifications_info.email_status === "COMPLETE") {
          smsAndEmailPresent = (
            <p>
              <FontAwesomeIcon icon={faEnvelope}/> {statusObj.notifications_info.message}
            </p>);
        }
        const items = statusObj.type === 'ORDER' && statusObj.items && statusObj.items.length > 0 && statusObj.items;
        let message_status = false;
        if (!this.state.showMessage){
          message_status = true
        } else if ((statusObj.notifications_info && statusObj.notifications_info.message)){
          message_status = true;
        }
        if (statusObj.type.toUpperCase() === 'NOTSTARTED' && statusObj.extra_fields.notes && this.state.showMessage && !(statusObj.notifications_info && statusObj.notifications_info.message)){
          message_status = false;
        }
          return (
            <div>
            {message_status &&
            <div>
              {statusObj.reporter_id === 0?
                <article className={cx(styles['timeline-entry'], styles['system-notification'])}>
                  <div className={styles["timeline-entry-inner"]}>
                    <div className={cx(styles["timeline-icon"], styles['notification'])} style={lastStyle}>
                      <OverlayTrigger placement="right" overlay={systemNotificationTooltip}>
                        <span><img src="/images/logo-icon.png" alt="Logo"/></span>
                      </OverlayTrigger>
                    </div>
                    <div className={styles["timeline-label"]}>
                      {!this.state.showMessage &&
                      <h2>{statusObj.reporter_name} {isCustomStatus ? 'wrote' : 'reported'} {!isCustomStatus && (
                        <span className={styles["item-status"]}
                              style={{backgroundColor: statusColor}}>{statusObj.title ? statusObj.title.toUpperCase() : statusObj.type.toUpperCase()}</span>)}</h2>}
                      {smsAndEmailPresent}
                      {statusObj.extra_fields && statusObj.extra_fields.notes && !this.state.showMessage ?
                        <p>
                          {statusObj.extra_fields.notes}
                          {statusObj.extra_fields.auto_start_time && moment.utc(statusObj.extra_fields.auto_start_time).local().format('hh:mm A')}
                          {statusObj.extra_fields.auto_complete_time && moment.utc(statusObj.extra_fields.auto_complete_time).local().format('hh:mm A')}
                        </p>
                        : null}
                      <div className={styles['time-display']}>
                        {moment.utc(statusObj.time).local().format('MMM DD hh:mm a')}
                      </div>
                    </div>
                  </div>
                </article>
                :
                <article key={'task-status-key-' + i} className={styles['timeline-entry']}>
                  <div className={styles["timeline-entry-inner"]}>
                    <div className={styles["timeline-icon"]} style={lastStyle}>
                      <i className="entypo-feather"></i>
                    </div>
                    <div className={styles["timeline-label"]}>
                      {(!this.state.showMessage) &&
                      <h2>{taskStatusReporterName} {isCustomStatus ? 'wrote' : 'reported'} {!isCustomStatus && (
                        <span className={styles["item-status"]}
                              style={{backgroundColor: statusColor}}>{statusObj.title ? statusObj.type.toUpperCase() === 'NOTSTARTED' ? 'TASK CREATED' : statusObj.title.toUpperCase() : statusObj.type.toUpperCase()}</span>)}</h2>}
                      {(statusObj.exception && statusObj.exception.reason_title) ?
                        <div className={styles.exceptionInStatus}>
                          <p>
                            {statusObj.exception.reason_title && <strong>{statusObj.exception.reason_title}</strong>}
                            {statusObj.source &&
                            <OverlayTrigger placement="right" overlay={sourceTooltip}>
                            <span className={styles.sourceBadge}>{statusObj.source.toUpperCase() === 'WEB' &&
                            <FontAwesomeIcon icon={faGlobe}/>}
                              {statusObj.source.toUpperCase() === 'SMS' && <FontAwesomeIcon icon={faComment}/>}
                              {statusObj.source.toUpperCase() === 'EMAIL' && <FontAwesomeIcon icon={faEnvelope}/>}
                              {statusObj.source.toUpperCase() === 'APP' && <FontAwesomeIcon icon={faMobile}/>}
                            </span>
                            </OverlayTrigger>}
                            {statusObj.extra_fields && statusObj.extra_fields.location && statusObj.extra_fields.location.lat && statusObj.extra_fields.location.lng &&
                            !isNaN(statusObj.extra_fields.location.lat) && !isNaN(statusObj.extra_fields.location.lng) && (statusObj.extra_fields.location.lng > -180) &&
                            (statusObj.extra_fields.location.lng < 180) && (statusObj.extra_fields.location.lat > -90) && (statusObj.extra_fields.location.lat < 90) &&
                            statusObj.extra_fields.location.lat && statusObj.extra_fields.location.lng ?
                              <OverlayTrigger placement="right" overlay={locationToolTip}>
                                <span onClick={(e) => this.props.toggleStatusLocationMap(e, i)}
                                      className={styles.locationBadge}>
                                  <FontAwesomeIcon icon={faMapMarker}/>
                                </span>
                              </OverlayTrigger>
                              :
                              null
                            }
                          </p>
                        </div>
                        : null}
                      {statusObj.type.toUpperCase() !== 'NOTSTARTED' && statusObj.extra_fields && statusObj.extra_fields.notes && !this.state.showMessage ?
                        <p>
                          {statusObj.extra_fields.notes}
                          {statusObj.source &&
                          <OverlayTrigger placement="right" overlay={sourceTooltip}>
                          <span className={styles.sourceBadge}>
                            {statusObj.source.toUpperCase() === 'WEB' && <FontAwesomeIcon icon={faGlobe}/>}
                            {statusObj.source.toUpperCase() === 'SMS' && <FontAwesomeIcon icon={faComment}/>}
                            {statusObj.source.toUpperCase() === 'EMAIL' && <FontAwesomeIcon icon={faEnvelope}/>}
                            {statusObj.source.toUpperCase() === 'APP' && <FontAwesomeIcon icon={faMobile}/>}
                          </span>
                          </OverlayTrigger>}
                          {statusObj.extra_fields && statusObj.extra_fields.location && statusObj.extra_fields.location.lat && statusObj.extra_fields.location.lng &&
                          !isNaN(statusObj.extra_fields.location.lat) && !isNaN(statusObj.extra_fields.location.lng) && (statusObj.extra_fields.location.lng > -180) &&
                          (statusObj.extra_fields.location.lng < 180) && (statusObj.extra_fields.location.lat > -90) && (statusObj.extra_fields.location.lat < 90) &&
                          statusObj.extra_fields.location.lat && statusObj.extra_fields.location.lng ?
                            <OverlayTrigger placement="right" overlay={locationToolTip}>
                            <span onClick={(e) => this.props.toggleStatusLocationMap(e, i)}
                                  className={styles.locationBadge}>
                              <FontAwesomeIcon icon={faMapMarker}/>
                            </span>
                            </OverlayTrigger>
                            : null}
                        </p>
                        : null}

                      {statusObj.extra_fields && statusObj.extra_fields.input_prompt ?
                        <p>
                          {statusObj.extra_fields.input_prompt}
                          {statusObj.source &&
                          <OverlayTrigger placement="right" overlay={sourceTooltip}>
                          <span className={styles.sourceBadge}>
                            {statusObj.source.toUpperCase() === 'WEB' && <FontAwesomeIcon icon={faGlobe}/>}
                            {statusObj.source.toUpperCase() === 'SMS' && <FontAwesomeIcon icon={faComment}/>}
                            {statusObj.source.toUpperCase() === 'EMAIL' && <FontAwesomeIcon icon={faEnvelope}/>}
                            {statusObj.source.toUpperCase() === 'APP' && <FontAwesomeIcon icon={faMobile}/>}
                          </span>
                          </OverlayTrigger>}
                          {statusObj.extra_fields && statusObj.extra_fields.location && statusObj.extra_fields.location.lat && statusObj.extra_fields.location.lng &&
                          !isNaN(statusObj.extra_fields.location.lat) && !isNaN(statusObj.extra_fields.location.lng) && (statusObj.extra_fields.location.lng > -180) &&
                          (statusObj.extra_fields.location.lng < 180) && (statusObj.extra_fields.location.lat > -90) && (statusObj.extra_fields.location.lat < 90) &&
                          statusObj.extra_fields.location.lat && statusObj.extra_fields.location.lng ?
                            <OverlayTrigger placement="right" overlay={locationToolTip}>
                            <span onClick={(e) => this.props.toggleStatusLocationMap(e, i)}
                                  className={styles.locationBadge}>
                              <FontAwesomeIcon icon={faMapMarker}/>
                            </span>
                            </OverlayTrigger>
                            : null}
                        </p>
                        : null}{(this.state.showMessage && smsAndEmailPresent) && <br/>}
                      {smsAndEmailPresent}
                      {(statusObj.current_destination && statusObj.current_destination.complete_address && !this.state.showMessage) ?
                        <p>
                          {statusObj.current_destination.complete_address}
                          {statusObj.source &&
                          <OverlayTrigger placement="right" overlay={sourceTooltip}>
                          <span className={styles.sourceBadge}>
                            {statusObj.source.toUpperCase() === 'WEB' && <FontAwesomeIcon icon={faGlobe}/>}
                            {statusObj.source.toUpperCase() === 'SMS' && <FontAwesomeIcon icon={faComment}/>}
                            {statusObj.source.toUpperCase() === 'EMAIL' && <FontAwesomeIcon icon={faEnvelope}/>}
                            {statusObj.source.toUpperCase() === 'APP' && <FontAwesomeIcon icon={faMobile}/>}
                          </span>
                          </OverlayTrigger>}
                          {statusObj.extra_fields && statusObj.extra_fields.location && statusObj.extra_fields.location.lat && statusObj.extra_fields.location.lng &&
                          !isNaN(statusObj.extra_fields.location.lat) && !isNaN(statusObj.extra_fields.location.lng) && (statusObj.extra_fields.location.lng > -180) &&
                          (statusObj.extra_fields.location.lng < 180) && (statusObj.extra_fields.location.lat > -90) && (statusObj.extra_fields.location.lat < 90) &&
                          statusObj.extra_fields.location.lat && statusObj.extra_fields.location.lng ?
                            <OverlayTrigger placement="right" overlay={locationToolTip}>
                            <span onClick={(e) => this.props.toggleStatusLocationMap(e, i)}
                                  className={styles.locationBadge}>
                              <FontAwesomeIcon icon={faMapMarker}/>
                            </span>
                            </OverlayTrigger>
                            : null}
                        </p> : null}

                      {statusObj.extra_fields && statusObj.extra_fields.estimate ?
                        <p>
                          {statusObj.extra_fields.estimate} mins
                          {statusObj.source &&
                          <OverlayTrigger placement="right" overlay={sourceTooltip}>
                          <span className={styles.sourceBadge}>
                            {statusObj.source.toUpperCase() === 'WEB' && <FontAwesomeIcon icon={faGlobe}/>}
                            {statusObj.source.toUpperCase() === 'SMS' && <FontAwesomeIcon icon={faComment}/>}
                            {statusObj.source.toUpperCase() === 'EMAIL' && <FontAwesomeIcon icon={faEnvelope}/>}
                            {statusObj.source.toUpperCase() === 'APP' && <FontAwesomeIcon icon={faMobile}/>}
                          </span>
                          </OverlayTrigger>}
                        </p>
                        : null}

                      {this.props.showMap && this.props.statusLocationIndex === i && statusObj.extra_fields && statusObj.extra_fields.location ?
                        <StatusMap position={statusObj.extra_fields.location}/>
                        : null}
                      {items &&
                      <Row className={styles.productContainer}>
                        <TaskProducts products={items} slidesToScroll={2} slidesToShow={2} showExceptions
                                      showProductsType
                                      showProductStatus page="taskStatus"/>
                      </Row>
                      }
                      {files}
                      {exception_files}
                      <div className={styles['time-display']}>
                        {(typeof STATUS_META_DATA[statusObj.type] === 'undefined' || STATUS_META_DATA[statusObj.type].isDeletePossible) && this.props.can_delete_status &&
                        <button className={styles.deleteButton}
                                onClick={() => this.props.deleteStatus(statusObj.id)}>&#10005;</button>
                        }
                        {statusObj.extra_fields && statusObj.extra_fields.visible_to_customer &&
                        <OverlayTrigger placement="bottom"
                                        overlay={<Tooltip id="visibilityIndicator">Visible to Customer</Tooltip>}><span
                          className={styles.visibleToCustomerIndicator}>&#10003;</span></OverlayTrigger>}
                        {moment.utc(statusObj.time).local().format('MMM DD hh:mm a')}
                      </div>

                    </div>
                  </div>
                </article>
              }
            </div>
            }
            </div>
          );
        }
    });

    return <div className={["timeline-centered", styles['timeline-override']].join(' ')}>{statusComponents}</div>;
  }

  renderFileUploadAreaForLowRes() {
    return (
      <div className={styles.fileUploaderMobile}>
        <div className={cx(['form-group'], styles.fileUploaderMobileBtn)}>
          <label>Select Files to Upload</label>
          <input type="file" onChange={(e) => this.props.updateImagesDisplay(e)} multiple className="form-control"/>
        </div>
        <div className={styles.customFilePreview}>
          {this.props.filesToUpload && this.props.filesToUpload.length === 0 &&
          <p>No files chosen.</p>
          }
          {this.props.filesToUpload && this.props.filesToUpload.length > 0 &&
          <ul className={styles.uploadFilesPreviews}>
            {this.props.filesToUpload.map((file, index) => {
              const filePreviewURL = this.props.getFilePreview(file);
              return (
                <li key={index}>
                  <button onClick={(e) => this.props.closeImage(file.name, e)} className={styles.closeBtn}>
                    <FontAwesomeIcon icon={faTimesCircle}/></button>
                  <div className={styles.uploadCaption}><span>{file.name}</span></div>
                  <img src={filePreviewURL}/>
                  {file.isNew === 'false' &&
                  <button onClick={(e) => this.props.uploadFilesAgain(file, e)} className={styles.retryBtn}>
                    <FontAwesomeIcon icon={faSync}/></button>
                  }
                  {file.isInProcess === 'true' &&
                  <i className={cx('fa fa-spinner fa-spin ' + styles.uploadSpinner)}></i>
                  }
                </li>
              );
            })
            }
          </ul>
          }
        </div>
      </div>
    );
  }

  handleCustomerMessageChange(e) {
    const value = e.target.value;
    this.props.systemAndCustomMessages.map((message)=>{
      if(message.default_id ===  parseInt(value) || message.id === parseInt(value)){
        this.setState({
          message_name: message.name,
          message_type: message.type
        })
      }
    });
    if (value === 'add_customer_note') {
      this.setState({
        messageToDisplay: false
      });
    } else {
      let selectedCustomMessage = this.props.systemAndCustomMessages.find((key)=>{
          return (key.id === parseInt(value)) || (key.default_id === parseInt(value));
      });
      let content = '';
      if (selectedCustomMessage) {
        content = selectedCustomMessage.content;
      }
      this.setState({
        messageToDisplay: true,
        content: content,
        message_id: parseInt(value),
      }, () => {
        this.props.closeFileAttach(false)
      });
    }
  }

  hideEmailPreview() {
    this.setState({
      showEmailPreview: false,
      previewError: false,
      previewContent: null,
      loadingMessagePreview: false
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

  showSMSPreview() {
    this.setState({
      showSMSPreview: true
    });
    this.getMessagePreview();
  }

  getMessagePreview() {
    this.setState({
      loadingMessagePreview: true
    });
    const emailContent = {
      email: this.state.content.email,
      sms: this.state.content.sms,
      task_id: this.props.task.id,
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
        this.props.createToastNotification(alert);
      });
    });
  }

  showEmailPreview() {
    this.setState({
      showEmailPreview: true
    });
    this.getMessagePreview();
  }

  handleShowMessageChange() {
    this.setState({
      showMessage: !this.state.showMessage,
    })
  }

  generateSMSPreviewContent(SMSContent) {
    const SMSMessage = SMSContent.sms_message ? SMSContent.sms_message : '';
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

  emailModal() {
    const errorMessage = (typeof this.state.errorText !== 'undefined' && this.state.errorText !== null) ? this.state.errorText : 'Could not load preview. Please try again.';
    return (<Modal dialogClassName={cx(styles.CMEditModal, styles.emailPreviewModal)} show={this.state.showEmailPreview}
                   onHide={() => this.hideEmailPreview()}>
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
              <SavingSpinner title="Loading Preview" borderStyle="none"/>
            </div>
            }
            {!this.state.loadingMessagePreview &&
            <div className={styles.previewMessageContainer}>
              {this.state.previewError &&
              <Alert bsStyle="danger">{errorMessage}</Alert>
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
        <button onClick={() => this.hideEmailPreview()} className={cx(styles.transparentBtn, ['btn-submit'])}>Close
        </button>
      </Modal.Footer>
    </Modal>);
  }

  smsModal() {
    const errorMessage = (typeof this.state.errorText !== 'undefined' && this.state.errorText !== null) ? this.state.errorText : 'Could not load preview. Please try again.';

    return (
      <Modal dialogClassName={styles.CMEditModal} show={this.state.showSMSPreview} onHide={this.hideSMSPreview}>
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
                <SavingSpinner title="Loading Preview" borderStyle="none"/>
              </div>
              }
              {!this.state.loadingMessagePreview &&
              <div className={styles.previewMessageContainer}>
                {this.state.previewError &&
                <Alert bsStyle="danger">{errorMessage}</Alert>
                }
                {this.state.previewContent && !this.state.previewError &&
                <div className={styles.smsPreviewContainer}>
                  <img src="/images/mock.png" alt="SMS Preview"/>
                  {this.generateSMSPreviewContent(this.state.previewContent)}
                </div>
                }
              </div>
              }
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className={styles.CMEditModalFooter}>
          <button onClick={this.hideSMSPreview} className={cx(styles.transparentBtn, ['btn-submit'])}>Close
          </button>
        </Modal.Footer>
      </Modal>);
  }

  render() {
    const statusList = this.props.statusList,
      filesToUpload = this.props.filesToUpload,
      customerNoteTooltip = (
        <Tooltip id="customernote">Send a note to the customer. If sms and email notifications are enabled for the
          customer, Arrivy will send the note via sms and email. Also, the note will be visible on 'Customer View of the
          Task'</Tooltip>),
      SimpleNoteTooltip = (
        <Tooltip id="simplenote">This is an internal note on the job. Only visible to you and your assigned team
          members.</Tooltip>);

    return (
      <div className={cx(style.box)}>
        <h3 className={cx(style.boxTitle)}>
          <div className={styles.title}>
            <div>Journal <i className={cx(styles.iconReload)} onClick={() => {
              this.props.fetchNewData && this.props.fetchNewData()
            }}/></div>
            <div className={cx(styles.status)}>Latest Status:{this.props.gettingStatus ?
              <SavingSpinner title="Loading Status" borderStyle="none" size={8} className={styles.journalLoader}/> :
              <strong><FontAwesomeIcon icon={faCircle}
                                       style={{color: this.props.latestStatusColor}}/>{this.props.latestStatusTitle}
              </strong>}</div>
          </div>
        </h3>
        {this.emailModal()}
        {this.smsModal()}
        <div className={cx(style.boxBody)}>
          <div className={cx(style.boxBodyInner)}>
            <div className={styles['info-area']}>
              <div className={styles['notes-section']}>
                <div className={cx(styles.boxBodyInner)}>
                  { this.props.can_add_status &&
                  <FormGroup>
                    <div className={cx(styles.customMessagesDropdown, style.selectBox)}>
                      <FormControl onChange={this.handleCustomerMessageChange} componentClass="select"
                                   placeholder="select" className={styles['form-control']}>
                        <option value={"add_customer_note"}
                                selected={this.state.selectMessageType === 'custom_note'}>Note
                        </option>
                        {this.props.systemAndCustomMessages && this.props.systemAndCustomMessages.map((message) => {
                          if(message.name !== 'Task Status Business Message' && message.name !== 'Task Status Customer Exception' && message.name !== 'Task Status Customer Message'
                            && message.name !== 'Task Status Team Message' && message.name !== 'Team Task Status Notification'){
                            return (
                              <option value={(message.id || message.default_id)}
                                      selected={(this.state.message_id === message.id || this.state.message_id === message.default_id)}> {message.name} </option>
                            )
                          }
                        })
                        }
                      </FormControl>
                    </div>
                  </FormGroup>
                  }
                </div>
                {statusList && (
                  <div className={styles['add-notes-container']}>
                    {(this.props.can_add_status && !this.state.messageToDisplay) &&
                    <textarea className={styles['input-text']} placeholder="Type your note here ..."
                              ref={this.props.textInput}/>}
                    {this.props.fileUploader &&
                    <section className={cx("animated fadeIn", styles["dropzoneContainer"])}>
                      <div className="dropzone">
                        <Dropzone id="dropzone1" className={styles.actualDropZone} onDrop={this.props.onDrop}>
                          {filesToUpload && filesToUpload.length === 0 &&
                          <div className={styles.dropMsg}>
                            <p><strong>Drop</strong> files here to upload or <strong>Click</strong> here to browse files
                            </p>
                          </div>
                          }
                          {filesToUpload && filesToUpload.length !== 0 &&
                          <ul className={styles.uploadFilesPreviews}>
                            {filesToUpload.map(file =>
                              <li>
                                <button onClick={(e) => this.props.closeImage(file.name, e)}
                                        className={styles.closeBtn}><FontAwesomeIcon icon={faTimesCircle}/></button>
                                <div className={styles.uploadCaption}><span>{file.name}</span></div>
                                <img src={this.props.getPreview(file)}/>
                                {file.isNew == 'false' &&
                                <button onClick={(e) => this.props.uploadFilesAgain(file, e)}
                                        className={styles.retryBtn}><FontAwesomeIcon icon={faSync}/></button>
                                }
                                {file.isInProcess == 'true' &&
                                <i className={cx('fa fa-spinner fa-spin ' + styles.uploadSpinner)}></i>
                                }
                              </li>)
                            }
                            {filesToUpload && filesToUpload.length > 0 && filesToUpload.length < this.props.filesAllowed &&
                            <li className={styles.addAnotherImg}>
                              <div><FontAwesomeIcon icon={faPlus} className={styles.addAnotherIcon}/></div>
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
                    }
                    {this.props.fileUploader && this.renderFileUploadAreaForLowRes()}
                    {this.props.can_add_status &&
                    <div className="text-right">
                      <div className={cx(styles['status-area'], styles.statusAreaLoader)}>
                        {this.props.serverActionPending &&
                        <SavingSpinner title={'Saving '} borderStyle="none"/>
                        }
                        {this.props.serverActionSendNotificationPending &&
                        <SavingSpinner title={'Sending '} borderStyle="none"/>
                        }
                      </div>
                      {!this.state.messageToDisplay &&
                      <div>
                        <Button bsStyle="link" className={styles['file-upload-link']}
                                onClick={this.props.updateImageClick}>{this.props.dropZoneOption} <Glyphicon
                          glyph="paperclip"/></Button>
                        <OverlayTrigger placement="bottom" overlay={customerNoteTooltip}>
                          <Button className={cx(styles['add-note'], 'btn-submit', styles['visible-to-customer'])}
                                  onClick={() => this.props.addNewCustomerStatus()}>Add Customer Note</Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="bottom" overlay={SimpleNoteTooltip}>
                          <Button className={cx(styles['add-note'], 'btn-submit')}
                                  onClick={() => this.props.addNewInternalStatus()}>Add Note</Button>
                        </OverlayTrigger>
                      </div>
                      }
                      { this.state.messageToDisplay &&
                      <div className={styles.manualMessage}>
                        {(!this.props.task.notifications || this.props.task.notifications.email) &&
                          <Button className={styles['add-message']} onClick={() => this.showEmailPreview()}>
                            {this.state.serverActionSendNotificationPending ?
                            <SavingSpinner fontColor="#000000" fontSize="15px" title="Sending" color="#ffffff" borderStyle="none"/> :
                            <span><FontAwesomeIcon icon={faEnvelopeRegular}/> Preview Email</span>}
                          </Button>
                        }
                        {((!this.props.task.notifications || this.props.task.notifications.sms) && this.state.content.sms) &&
                          <Button className={styles['add-message']}
                                  onClick={() => this.showSMSPreview()}>{this.state.serverActionSendNotificationPending ?
                            <SavingSpinner fontColor="#000000" fontSize="15px" title="Sending" color="#ffffff"
                                           borderStyle="none"/> :
                            <span><FontAwesomeIcon icon={faCommentAlt}/> Preview SMS</span>
                          }</Button>
                        }
                          <Button className={cx(styles['add-note'], 'btn-submit', styles['visible-to-customer'])}
                                     onClick={(e)=>this.handleButtonClick(e, null, 'MANUAL_NOTIFICATION', 'MESSAGE SENT: ' + this.state.message_name, status, null, false, '#0054a6', this.state.message_id)}
                                                    >{this.state.serverActionSendNotificationPending ?
                          <SavingSpinner fontColor="#ffffff" fontSize="15px" title="Sending" color="#ffffff" borderStyle="none"/> :'Send Customer Message'
                          }</Button>
                      </div>
                      }
                    </div>}
                  </div>
                )}
                <div className={styles.switchContainer}>
                  <span>Show All</span>
                  <SwitchButton checked={this.state.showMessage} name={'showHideMessages'} onChange={this.handleShowMessageChange}/>
                  <span>Show Messages</span>
                </div>
                <div className={styles['task-info']}>
                  <div>
                    <div className={styles['status-feed']}
                         style={this.props.can_add_status ? {maxHeight: '485px'} : {maxHeight: '620px'}}>
                      {this.renderStatusList()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
