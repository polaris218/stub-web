import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, Button, Modal, Alert } from 'react-bootstrap';
import styles from './live-status.module.scss';
import moment from 'moment';
import cx from 'classnames';
import Dropzone from 'react-dropzone';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSync, faTimesCircle, faPlus, faPaperclip } from '@fortawesome/fontawesome-free-solid';
import { setNewLiveStatus, getLiveTaskFileAttachmentURL } from '../../../actions/livetrack';
import { uploadAttachment } from '../../../actions/tasks';
import SavingSpinner from '../../saving-spinner/saving-spinner';
import { JOURNAL_MESSAGES, BILLING_MESSAGES, CUSTOMER_NOT_AVAILABLE_MESSAGES, UI_MESSAGES, ADDNOTE_ERROR_MESSAGES } from '../../../helpers/mila-translations';

export default class LiveStatus extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showCustomerStatusConfirmation: false,
      error: null,
      severActionType: '',
      serverActionPending: false,
      serverActionComplete: false,
      files_to_upload: [],
      fileUploader: true,
      filesAllowed: 1,
      uploadFailedFiles: [],
      completedFiles: [],
      newFilePlaced: false,
      showModal: this.props.showModal,
    };

    this.addNewStatus = this.addNewStatus.bind(this);
    this.cancelStatus = this.cancelStatus.bind(this);
    this.renderStatus = this.renderStatus.bind(this);
    this.renderStatusConfirmation = this.renderStatusConfirmation.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.confirmStatus = this.confirmStatus.bind(this);
    this.closeImage = this.closeImage.bind(this);
    this.getPreview = this.getPreview.bind(this);
    this.uploadFilesOnServer = this.uploadFilesOnServer.bind(this);
    this.uploadFilesAndSendStatus = this.uploadFilesAndSendStatus.bind(this);
    this.uploadSingleFile = this.uploadSingleFile.bind(this);
    this.uploadFilesAgain = this.uploadFilesAgain.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
    this.statusSentSuccessfully = this.statusSentSuccessfully.bind(this);
    this.getCustomerName = this.getCustomerName.bind(this);
    this.updateImagesDisplay = this.updateImagesDisplay.bind(this);
    this.renderFileUploadAreaForLowRes = this.renderFileUploadAreaForLowRes.bind(this);
    this.renderSendNotesModal = this.renderSendNotesModal.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      showModal: nextProps.showModal
    });
  }

  renderSendNotesModal() {
    const langParam = this.props.lang;
    const UIMessages = UI_MESSAGES;

    const modalTitle = UIMessages[langParam].modal_title;
    const messagePlaceholder = UIMessages[langParam].placeholder;
    const fileAttachmentMessage = UIMessages[langParam].file_attachment_placeholder;
    const sendButtonText = UIMessages[langParam].send_button;
    const cancelButtonText = UIMessages[langParam].cancel_button;

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    let relativeModal = '';
    if (iOS) {
      relativeModal = styles.modalRelativeToClick;
    }

    return (
      <Modal className={cx(styles['transparent-color'], relativeModal)} show={this.state.showModal} onHide={this.closeModal}>
        <Modal.Header className={styles.addNoteModalHeader} closeButton>
          <Modal.Title className="text-center">
            <h2 className={styles.addNoteModalHeading}>{modalTitle}</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={cx(styles['add-notes-container'])}>
            <textarea autoFocus className={cx('form-control', styles['input-text'], styles.modalInputType)} placeholder={messagePlaceholder} ref={(input) => { this.textInput = input; }} />
            {this.state.fileUploader &&
            <section className={cx("animated fadeIn", styles["dropzoneContainer"])}>
              <div className="dropzone">
                <Dropzone id="dropzone1" className={styles.actualDropZone} onDrop={this.onDrop.bind(this)}>
                  {this.state.files_to_upload.length === 0 &&
                  <div className={styles.dropMsg}>
                    <p>{fileAttachmentMessage}</p>
                  </div>
                  }
                  {this.state.files_to_upload.length !== 0 &&
                  <ul className={styles.uploadFilesPreviews}>
                    {this.state.files_to_upload.map(file =>
                      <li>
                        <button onClick={(e) => this.closeImage(file.name, e)} className={styles.closeBtn}>
                          <FontAwesomeIcon icon={faTimesCircle} /></button>
                        <div className={styles.uploadCaption}><span>{file.name}</span></div>
                        <img src={this.getPreview(file)}/>
                        {file.isNew == 'false' &&
                        <button onClick={(e) => this.uploadFilesAgain(file, e)} className={styles.retryBtn}>
                          <FontAwesomeIcon icon={faSync} /></button>
                        }
                        {file.isInProcess == 'true' &&
                          <FontAwesomeIcon icon="spinner" spin className={styles.uploadSpinner} />
                        }
                      </li>)
                    }
                    {this.state.files_to_upload.length > 0 && this.state.files_to_upload.length < this.state.filesAllowed &&
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
            {this.renderFileUploadAreaForLowRes()}
          </div>
        </Modal.Body>
        <Modal.Footer className={styles.addNoteModalFooter}>
          {this.state.error !== null && !this.state.serverActionPending &&
          <div className="text-left">
            <Alert className={styles.addNotesModalError} bsStyle="danger">{this.state.error}</Alert>
          </div>
          }
          <div className="text-center">
            {!this.state.serverActionPending &&
            <Button className={cx(styles['add-note'], 'btn-submit', styles['visible-to-customer'])} onClick={() => this.addNewStatus()}>
              {sendButtonText}
            </Button>
            }
            {this.state.serverActionPending &&
            <span className={styles.milaLoadingIndicator}>
              <SavingSpinner color="#ff5752" title="" borderStyle="none"/>
            </span>
            }
            {!this.state.serverActionPending &&
            <Button className={cx(styles['cancel-button'], styles['visible-to-customer'])} onClick={() => this.closeModal()}>
              {cancelButtonText}
            </Button>
            }
          </div>
        </Modal.Footer>
      </Modal>
    );
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
      // only one file - first three will be selected, shown in the preview box and sent to the server
      filesArray.splice(this.state.filesAllowed);
      // if files are selected, sent those files into the state so that our existing functions work as expected
      this.setState({
        files_to_upload: filesArray
      });
    }
  }

  getCustomerName(customer_first_name, customer_last_name) {
    let customer_name = "";

    if (customer_first_name) {
      customer_name = customer_first_name.charAt(0).toUpperCase() + customer_first_name.slice(1);
    }

    if (customer_last_name) {
      customer_name = customer_name + " " + customer_last_name.charAt(0).toUpperCase() + customer_last_name.slice(1);
    }

    if (customer_name.length > 14) {
      customer_name = customer_name.substring(0, 14) + '...';
    }

    return customer_name;
  }

  closeModal() {
    this.setState({
      showModal: false,
      error: null,
      files_to_upload: [],
    });
    this.textInput.value = '';
    this.props.toggleModal(false);
  }

  openModal() {
    this.setState({
      showModal: true
    });
    this.props.toggleModal(true);
  }

  statusSentSuccessfully() {
    if (this.textInput.value === '' && this.state.files_to_upload.length === 0)
    {
      this.closeModal();
    }
  }

  uploadFilesOnServer(file) {
    let files = [];
    let file_id = '';
    const image = file;
    const promise = getLiveTaskFileAttachmentURL(this.props.task.id, this.props.task_url)
      .then((imageUrlResponse) => {
        const data = new FormData();

        data.append('file-0', image);

        const { upload_url }  = JSON.parse(imageUrlResponse);

        return uploadAttachment(upload_url, data);
      })
      .then((updateImageResponse) => {
        file_id = JSON.parse(updateImageResponse);

        files.push(file_id);

        return files;
      });

    return promise;
  }

  uploadFilesAndSendStatus(notes) {
    let allBackup = this.state.files_to_upload;
    for (let i = 0; i < this.state.files_to_upload.length; i++) {
      allBackup[i].isInProcess = 'true';
    }
    this.setState({
      files_to_upload: allBackup
    });

    let filesPromise = Promise.resolve([]);
    allBackup = [];
    const promises = this.state.files_to_upload.map((file, i) => {
      return this.uploadFilesOnServer(file).catch(err => {
        const e = new Error("upload failed");
        e.index = i;
        e.failedFilename = file;
        return e;
      });
    });

    filesPromise = Promise.all(promises).then((results) => {

      return [].concat(...results);
    }).catch((e1) => {
      this.setState({
        error: 'Files Upload Failed.'
      });
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
        if (this.state.completedFiles.length > 0) {
          this.setStatus(this.state.completedFiles, notes);
        }
        this.setState({
          serverActionPending: false,
          serverActionComplete: false,
          files_to_upload: allBackup
        });
      } else {
        this.setStatus(this.state.completedFiles, notes);
      }
    });
  }

  uploadSingleFile(fileToBeUploaded, notes) {
    let filesPromise = Promise.resolve([]);
    let allBackup = this.state.files_to_upload;
    let failedBackup = this.state.uploadFailedFiles;

    const promises = fileToBeUploaded.map((file, i) => {
      return this.uploadFilesOnServer(file).catch(err => {
        const e = new Error("upload failed");
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
          this.setStatus(this.state.completedFiles, notes);
        } else {
          for (let j = 0; j < this.state.files_to_upload.length; j++) {
            if (this.state.files_to_upload[j].name == filesUrl[i].failedFilename.name) {
              allBackup[j].isInProcess = 'false';
            }
          }
        }
      }
      this.setState({
        files_to_upload: allBackup,
        uploadFailedFiles: failedBackup
      });
    });
  }

  uploadFilesAgain(file, uploadEvent) {
    uploadEvent.stopPropagation();
    let userInput = this.textInput.value;
    let sendFile = [];
    sendFile.push(file);

    let changeProgress = this.state.files_to_upload;
    for (let i = 0; i < this.state.files_to_upload.length; i++) {
      if (this.state.files_to_upload[i].name == file.name) {
        changeProgress[i].isInProcess = 'true';
      }
    }
    this.setState({
      files_to_upload: changeProgress
    });

    this.uploadSingleFile(sendFile, userInput)
  }

  cancelStatus() {
    this.setState({
      showCustomerStatusConfirmation: false,
    });
  }

  addNewStatus() {
    this.setState({
      showCustomerStatusConfirmation: true,
    });
  }

  renderStatus(status) {
    if (status !== '' && this.state.files_to_upload.length === 0) {
      this.confirmStatus();
    } else if (this.state.files_to_upload.length > 0 && status === '') {
      this.confirmStatus();
    } else if (this.state.files_to_upload.length > 0 && status !== '') {
      this.confirmStatus();
    } else {
      return this.renderStatusConfirmation(
        <div>
          <h3>{ADDNOTE_ERROR_MESSAGES[this.props.lang].error_modal_title}</h3>
          <p className={styles['confirm-dialog-text']}>{ADDNOTE_ERROR_MESSAGES[this.props.lang].empty_note}</p>
          <div className={cx('pull-right', styles['tasks-confirm-buttons'])}>
            <Button onClick={this.cancelStatus} className={cx('white-btn', styles['series-confirm-cancel'])}>OK</Button>
          </div>
        </div>
      );
    }
  }

  renderStatusConfirmation(contents) {
    return (
      <div>
        <div className={styles['tasks-confirm-overlay']}/>
        <div className={styles['tasks-confirm-dialog-wrapper']}>
          {contents}
        </div>
      </div>
    );
  }

  renderFileUploadAreaForLowRes() {
    const langParam = this.props.lang;
    const UIMessages = UI_MESSAGES;

    const mobileSelectFileToUpload = UIMessages[langParam].mobile_select;
    const mobileNoFilesSelected = UIMessages[langParam].mobile_no_files;
    return (
      <div className={styles.fileUploaderMobile}>
        <div className={cx(['form-group'], styles.fileUploaderMobileBtn)}>
          <label>{mobileSelectFileToUpload}</label>
          <input type="file" onChange={(e) => this.updateImagesDisplay(e)} multiple className="form-control" />
        </div>
        <div className={styles.customFilePreview}>
          {this.state.files_to_upload.length === 0 &&
          <p>{mobileNoFilesSelected}</p>
          }
          {this.state.files_to_upload.length > 0 &&
          <ul className={styles.uploadFilesPreviews}>
            {this.state.files_to_upload.map((file, index) => {
              const filePreviewURL = this.getFilePreview(file);
              return (
                <li key={index}>
                  <button onClick={(e) => this.closeImage(file.name, e)} className={styles.closeBtn}>
                    <FontAwesomeIcon icon={faTimesCircle} /></button>
                  <div className={styles.uploadCaption}><span>{file.name}</span></div>
                  <img src={filePreviewURL}/>
                  {file.isNew === 'false' &&
                  <button onClick={(e) => this.uploadFilesAgain(file, e)} className={styles.retryBtn}>
                    <FontAwesomeIcon icon={faSync} /></button>
                  }
                  {file.isInProcess === 'true' &&
                  <FontAwesomeIcon icon="spinner" spin className={styles.uploadSpinner} />
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

  confirmStatus() {
    this.setState({
      severActionType: 'ADD',
      serverActionPending: true,
      serverActionComplete: false,
      error: ''
    });

    let notes = this.textInput.value;
    if (this.state.showCustomerStatusConfirmation) {
      this.setState({
        showCustomerStatusConfirmation: false
      });
    }
    if (this.state.files_to_upload.length > 0) {
      this.uploadFilesAndSendStatus(notes);
    } else {
      const noURL = [];
      this.setStatus(noURL, notes);
    }
  }

  setStatus(filesURL, notes) {
    const customer_name = this.getCustomerName(this.props.task.customer_first_name, this.props.task.customer_last_name);
    const status = {
      type: 'CUSTOM',
      title: 'CUSTOM',
      time: moment().format(),
      reporter_name: customer_name,
      reporter_id: this.props.task.customer_id,
      color: '#999999'
    };

    let extra_fields = null;
    extra_fields = {
      'notes': notes,
      'visible_to_customer' : 'True',
      'files': filesURL
    };

    status.extra_fields = JSON.stringify(extra_fields);
    status.task_url = this.props.task_url;
    status.source = 'web';

    const task_id = this.props.task.id;

    setNewLiveStatus(task_id, status).then(() => {
      this.textInput.value = '';
      if (this.state.uploadFailedFiles.length > 0) {
        this.setState({
          serverActionPending: false,
          serverActionComplete: true,
          completedFiles: []
        });
      } else {
        let filesBackup = [];
        let changeFlag = false;
        if (this.state.newFilePlaced) {
          filesBackup = this.state.files_to_upload;
        }
        this.setState({
          serverActionPending: false,
          serverActionComplete: true,
          files_to_upload: filesBackup,
          completedFiles: [],
          newFilePlaced: changeFlag,
          error: null,
        }, () => this.statusSentSuccessfully());
      }

      this.props.refreshStatus();
    }).catch((e2) => {
      console.log(e2);

      const error = e2.statusText;
      this.setState({
        serverActionPending: false,
        serverActionComplete: false,
        serverActionType: '',
        error: ADDNOTE_ERROR_MESSAGES[this.props.lang].server_error
      });
    });
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
      this.setState({
        files_to_upload:localArr,
        newFilePlaced: fileCheck
      });
    } else {
      this.setState({
        files_to_upload: temp,
        newFilePlaced: fileCheck
      });
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

  getEmptyEntityText() {
    return <div className={styles['no-info']}>Location information not available</div>;
  }

  renderStatusJournal() {
    const statuses = [...this.props.status.statusList];
    let langParam = 'EN';
    if (this.props.lang && this.props.lang !== '' && (this.props.lang === 'DE' || this.props.lang === 'EN' || this.props.lang === 'FR' || this.props.lang === 'IT')) {
      langParam = this.props.lang;
    }
    let dateFormat = 'MM DD YYYY';
    let timeFormat = 'hh:mm A';
    if (langParam === 'DE' || langParam === 'FR' || langParam === 'IT') {
      dateFormat = 'DD.MM.YYYY';
      timeFormat = 'HH:mm';
    }

    // IMPORT MESSAGE STRINGS
    const statusMessages = JOURNAL_MESSAGES;
    const billingMessages = BILLING_MESSAGES;
    const customerNotAvailable = CUSTOMER_NOT_AVAILABLE_MESSAGES;

    statuses.reverse();
    const activeJournal = statuses.map((status, i) => {
      let message = null;
      statusMessages.map((statusMessage, j) => {
        if (status.type === statusMessage.type || (status.type === 'AUTO_START' && statusMessage.type === 'STARTED') || (status.type === 'AUTO_COMPLETE' && statusMessage.type === 'COMPLETE')) {
          statusMessages[j] = { ...statusMessages[j], 'printed' : true };
          message = statusMessage;
          return;
        }
      });
      if (typeof status.is_active !== 'undefined' && status.is_active === false) {
        return;
      }
      // These statuses are not visible to customer so they are handled up here separately
      if (status.type === 'NOTSTARTED' || status.type === 'CREW_ASSIGNED' || status.type === 'ENROUTE' || status.type === 'COMPLETE' || status.type === 'AUTO_COMPLETE') {
        return (
          <div key={i} className={styles.timeLineEntry}>
            <div className={styles.timeLineEntryCircle}></div>
            <div className={styles.entryDetails}>
              <h4 className={styles.entryTitle}><strong>{message.message[langParam]}</strong></h4>
              { (status.type === 'COMPLETE' || status.type === 'AUTO_COMPLETE') ? <p className={styles.billingNote}>{ billingMessages[langParam] }</p> : null }
              <p className={styles.entryTimelines}>
                {moment.utc(status.time_original_iso_str).local().format(dateFormat)}
                <span className={styles.entryDetailsSeperator}></span>
                {moment.utc(status.time_original_iso_str).local().format(timeFormat)}
              </p>
            </div>
          </div>
        );
      }
      // These statuses show a different type of message than the others, so they are handled up here separately
      if (status.type === 'CANCELLED' || status.type === 'CUSTOMER_EXCEPTION' || (status.type === 'EXCEPTION' && (this.props.trackerVersion && this.props.trackerVersion.toUpperCase() === 'NEW'))) {
        return (
          <div key={i} className={cx(styles.timeLineEntry, styles.timeLineEntryCustom)}>
            <div className={styles.timeLineEntryCircle}></div>
            <div className={styles.entryDetails}>
              <h4 className={styles.entryTitle}>{message.message[langParam]}</h4>
              { status.extra_fields && status.extra_fields.notes ? <p className={styles.entryNotes}>{ status.extra_fields.notes }</p> : null }
              { status.type === 'CANCELLED' && (!this.props.trackerVersion || this.props.trackerVersion.toUpperCase() !== 'NEW') && (typeof status.extra_fields.notes === 'undefined' || status.extra_fields.notes === '') ? <p className={styles.entryNotes}>{ customerNotAvailable[langParam] }</p> : null }
              <p className={styles.entryTimelines}>
                {moment.utc(status.time_original_iso_str).local().format(dateFormat)}
                <span className={styles.entryDetailsSeperator}></span>
                {moment.utc(status.time_original_iso_str).local().format(timeFormat)}
              </p>
            </div>
          </div>
        );
      }

      if (status.type === 'RECOMMENDED') {
        return;
      }

      let reportedStatusTitle = null;
      if (status.type !== 'CUSTOM' && status.title !== '') {
        reportedStatusTitle = status.title;
      } else if (status.type !== 'CUSTOM' && status.title === '') {
        reportedStatusTitle = status.type;
      } else {
        reportedStatusTitle = null;
      }
      if (status.extra_fields && status.extra_fields.visible_to_customer) {
        let files = null;
        if (status.extra_fields && status.extra_fields.files && status.extra_fields.files.length > 0) {
          files = status.extra_fields.files.map((file) => {
            if ((typeof file.filename === 'undefined' || file.filename === null || file.filename === '') || (typeof file.file_path === 'undefined' || file.file_path === null || file.file_path === '')) {
              return;
            } else {
              const fileExtension = file.filename.split('.').pop();
              let showPreview = false;
              if (fileExtension.includes('jpg') || fileExtension.includes('JPG') || fileExtension.includes('JPEG') || fileExtension.includes('jpeg') || fileExtension.includes('png') || fileExtension.includes('PNG') || fileExtension.includes('gif') || fileExtension.includes('GIF') || fileExtension.includes('bimp') || fileExtension.includes('BIMP') || fileExtension.includes('bmp') || fileExtension.includes('BMP')) {
                showPreview = true;
              }
              return (
                <a href={file.file_path} target="_blank">
                  {showPreview &&
                  <img src={file.file_path} id={'status-file-' + i} className={styles['task-file-item'] + " img-responsive img-rounded full-width"} />}
                  {!showPreview &&
                  <FontAwesomeIcon icon={faPaperclip}/>}
                  {file.filename}
                </a>
              );
            }
          });
        }
        let customStatusClass = '';
        if (status.type === 'CUSTOM') {
          customStatusClass = styles.timeLineEntryCustom;
        }
        let connectorString = 'reported';
        if (langParam === 'DE') {
          connectorString = 'Nachricht von ';
        } else if (langParam === 'FR') {
          connectorString = 'Message de ';
        } else if (langParam === 'IT') {
          connectorString = 'Messaggio da ';
        }

        let customStatusReporterName = status.reporter_name;
        if (status.from_customer && (langParam === 'EN')) {
          customStatusReporterName = 'You reported';
        } else if (status.from_customer && langParam && langParam === 'DE') {
          customStatusReporterName = 'Ihre Nachricht';
        } else if (status.from_customer && langParam && langParam === 'FR') {
          customStatusReporterName = 'Votre message';
        } else if (status.from_customer && langParam && langParam === 'IT') {
          customStatusReporterName = 'Il vostro messaggio';
        }

        let reportString = (<h4 className={styles.entryTitle}><strong>{customStatusReporterName}</strong> {!status.from_customer ? connectorString : ''} {reportedStatusTitle !== null ? (' : ' + reportedStatusTitle) : ''}</h4>);
        if (langParam === 'DE' || langParam === 'FR' || langParam === 'IT') {
          reportString = (<h4 className={styles.entryTitle}>{!status.from_customer ? connectorString : ''} <strong>{customStatusReporterName}</strong> {reportedStatusTitle !== null ? (' : ' + reportedStatusTitle) : ''}</h4>);
        }

        return (
          <div key={i} className={cx(styles.timeLineEntry, customStatusClass)}>
            <div className={styles.timeLineEntryCircle}></div>
            <div className={styles.entryDetails}>
              { ((status.type !== 'EXCEPTION' || (this.props.trackerVersion && this.props.trackerVersion.toUpperCase() === 'NEW')) && message !== null)
                ?
                <h4 className={styles.entryTitle}><strong>{message.message[langParam]}</strong></h4>
                :
                reportString
              }
              { status.extra_fields && status.extra_fields.notes ? <p className={styles.entryNotes}>{ status.extra_fields.notes }</p> : null }
              { status.extra_fields && status.extra_fields.estimate ? <p className={styles.entryNotes}>{ status.extra_fields.estimate } mins</p> : null }
              { files }
              <p className={styles.entryTimelines}>
                {moment.utc(status.time_original_iso_str).local().format(dateFormat)}
                <span className={styles.entryDetailsSeperator}></span>
                {moment.utc(status.time_original_iso_str).local().format(timeFormat)}
              </p>
            </div>
          </div>
        );
      }
    });
    let inActiveJournal = '';
    if (this.props.task.status !== 'COMPLETE' && this.props.task.status !== 'AUTO_COMPLETE' && this.props.task.status !== 'EXCEPTION' && this.props.task.status !== 'CANCELLED' && this.props.task.status !== 'RECOMMENDED' && this.props.task.status !== 'CUSTOMER_EXCEPTION') {
      inActiveJournal = statusMessages.map((unMarkedMessage, i) => {
        if (!('printed' in unMarkedMessage) && unMarkedMessage.type !== 'CANCELLED' && unMarkedMessage.type !== 'CUSTOMER_EXCEPTION' && unMarkedMessage.type !== 'AUTO_START' && unMarkedMessage.type !== 'AUTO_COMPLETE' && unMarkedMessage.type !== 'EXCEPTION') {
          return (
            <div key={i} className={cx(styles.timeLineEntryIncomplete)}>
              <div className={styles.timeLineEntryCircle}></div>
              <div className={styles.entryDetails}>
                <h4 className={styles.entryTitle}><strong>{unMarkedMessage.message[langParam]}</strong></h4>
              </div>
            </div>
          );
        }
      });
    }
    const journal = [activeJournal, inActiveJournal];
    return journal;
  }

  render() {

    let demoInProgress = false;
    if (this.props.showOnlyDemo) {
      demoInProgress = this.props.showOnlyDemo;
    }

    let serviceHistoryTitle = 'Service History';

    if (this.props.lang && this.props.lang === 'DE') {
      serviceHistoryTitle = 'Serviceverlauf';
    } else if (this.props.lang && this.props.lang === 'FR') {
      serviceHistoryTitle = 'Historique de service';
    } else if (this.props.lang && this.props.lang === 'IT') {
      serviceHistoryTitle = 'Storia del servizio';
    }

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    let fixedButton = '';
    if (iOS) {
      fixedButton = styles.buttonFixedAboveStatusJournal;
    }

    return (
      <div className={styles.liveStatusContainer}>
        {this.props.showChatWidget &&
          <a id="modalPositionEL" onClick={() => this.openModal()} className={cx(styles.chatButton, fixedButton)}>
            <img src="/images/enterprise/mila_chat.png" />
          </a>
        }
        <div>
          <div className={styles.statusJournal}>
            <h3 className={styles.journalTitle}>
              <img src="/images/enterprise/history.png" className={styles.historyIcon} />
              &nbsp;{serviceHistoryTitle}
              {this.props.task.extra_fields && this.props.task.extra_fields !== null && this.props.task.extra_fields.mila_service_id &&
                <span> #{this.props.task.extra_fields.mila_service_id}</span>
              }
            </h3>
            <div className={styles.timelineContainer}>
              <div className={styles.journalTimeline}>
                {this.renderStatusJournal()}
              </div>
            </div>
          </div>
          { this.state.showCustomerStatusConfirmation && this.renderStatus(this.textInput.value) }
        </div>
        <Row>
          <Col md={12}>
            {!demoInProgress &&
              this.renderSendNotesModal()
            }
          </Col>
        </Row>
      </div>
    );
  }
}

LiveStatus.propTypes = {
  status: PropTypes.object,
  entities: PropTypes.array,
  rating: PropTypes.array,
  task: PropTypes.object,
  task_url: PropTypes.string,
  refreshStatus: PropTypes.func,
  showOnlyDemo: PropTypes.bool,
  lang: PropTypes.string
};
