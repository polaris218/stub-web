import React, { Component } from 'react';
import styles from './live-status.module.scss';
import { Button, Modal, Alert } from 'react-bootstrap';
import moment from 'moment';
import cx from 'classnames';
import Dropzone from 'react-dropzone';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSync, faTimesCircle, faPlus, faPaperclip, faPencilAlt } from '@fortawesome/fontawesome-free-solid';
import { setNewLiveStatus, getLiveTaskFileAttachmentURL } from '../../../../actions/livetrack';
import { uploadAttachment } from '../../../../actions/tasks';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import {getCustomerName, getErrorMessage} from '../../../../helpers/task';
import config from '../../../../config/config'
const server_url = config(self).serverUrl


export default class LiveStatus extends Component {
  constructor(props) {
    super(props);

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
    this.updateImagesDisplay = this.updateImagesDisplay.bind(this);
    this.renderFileUploadAreaForLowRes = this.renderFileUploadAreaForLowRes.bind(this);
    this.getEmptyHistoryMessage = this.getEmptyHistoryMessage.bind(this);
    this.changeSubscription = this.changeSubscription.bind(this);

    this.state = {
      showCustomerStatusConfirmation: false,
      error: null,
      severActionType: '',
      serverActionPending: false,
      serverActionComplete: false,
      files_to_upload: [],
      fileUploader: true,
      filesAllowed: 3,
      uploadFailedFiles: [],
      completedFiles: [],
      newFilePlaced: false,
      showModal: false,
    };

  }

  componentDidMount() {
    const { profile } = this.props;
    let color = '';
    if (profile && profile.show_brand_color && profile.color) {
      color = profile.color;
    }
    $("<style type='text/css'> .dynamicColor::-webkit-scrollbar-thumb { background-color: " + color + " } </style>").appendTo("head");
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
      // only three files - first three will be selected, shown in the preview box and sent to the server
      filesArray.splice(3);
      // if files are selected, sent those files into the state so that our existing functions work as expected
      this.setState({
        files_to_upload: filesArray
      });
    }
  }

  closeModal() {
    this.setState({
      showModal: false,
      error: null,
      files_to_upload: [],
    });
    this.textInput.value = '';
  }

  openModal() {
    this.setState({
      showModal: true
    });
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
          <h3>Adding a Note</h3>
          <p className={styles['confirm-dialog-text']}>Note can not be empty.</p>
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
    return (
      <div className={styles.fileUploaderMobile}>
        {this.state.files_to_upload.length > 0 &&
          <div className={styles.customFilePreview}>
            {this.state.files_to_upload.length === 0 &&
            <p>No files chosen.</p>
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
        }
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
        return `${server_url}/images/icon-file.png`;
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

  setStatus(filesURL, notes, subscribe = '', subscribe_source = '') {
    const customer_name = getCustomerName(this.props.task.customer_first_name, this.props.task.customer_last_name);
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
      'visible_to_customer' : true
    };
    if (filesURL.length > 0) {
      extra_fields.files = filesURL
    }
    status.extra_fields = JSON.stringify(extra_fields);
    status.task_url = this.props.task_url;
    status.source = 'web';
    status.subscribe = subscribe;
    status.subscribe_source = subscribe_source;

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
        error: 'Something went wrong. Please reach out to us on phone or email.'
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

  changeSubscription(subscribe, subscribe_source) {
    this.props.updateSubscription(this.props.profile.fullname, this.props.task_url, subscribe, subscribe_source).then(() => {
      this.props.refreshStatus();
    }).catch((error) => {
      const resposne_error = JSON.parse(error.responseText);
      const error_text = getErrorMessage(resposne_error);
      console.log(error_text, 'Unabled to change subscription.');
    });
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
        return `${server_url}/images/icon-doc.png`;
        break;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return `${server_url}/images/icon-excel.png`;
        break;
      case 'application/pdf':
        return `${server_url}/images/icon-pdf.png`;
        break;
      case 'text/plain':
        return `${server_url}/images/icon-txt.png`;
        break;
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return `${server_url}/images/icon-ppt.png`;
        break;
      default:
        return `${server_url}/images/icon-file.png`;
    }
  }

  getEmptyHistoryMessage() {
    const statuses = this.props.status;
    let statusCount = 0;
    statuses.statusList.map((status) => {
      if (status.extra_fields && status.extra_fields.visible_to_customer) {
        statusCount++;
      }
    });
    if (statusCount === 0) {
      return (<Alert className={styles.infoAlert} bsStyle="info">No history is available yet.</Alert>);
    } else {
      return;
    }
  }

  render() {

    const { rating, task, entities, loading, profile } = this.props;
    let color = '';
    if (profile && profile.show_brand_color && profile.color) {
      color = profile.color;
    }
    const { status } = this.props;
    const length = status.statusList.length;
    let demoInProgress = false;
    if (this.props.showOnlyDemo) {
      demoInProgress = this.props.showOnlyDemo;
    }

    const statusComponents = status.statusList.map((statusObj, i) => {
      if (statusObj.type === 'NOTSTARTED') {
        return '';
      }

      if (!statusObj.extra_fields || !statusObj.extra_fields.visible_to_customer || (typeof statusObj.is_active !== 'undefined' && statusObj.is_active === false)) {
        return '';
      }

      let lastStyle = {};
      let activeClass = null;
      if (i === 0) {
        lastStyle = {
          backgroundColor: 'transparent',
        };
        activeClass = styles.timelineEntryActive;
      } else {
        lastStyle = {
          backgroundColor: '#cccccc'
        }
      }
      let customerMessageStyles = null;
      if (statusObj.from_customer || statusObj.reporter_name === '') {
        customerMessageStyles = styles.customerMessage;
      }
      let cancelledStyles = {};
      let cancelledClass = null;
      let arrowHeadStyles = {
        borderColor: 'transparent #f5f5f6 transparent transparent'
      };
      if (statusObj.type === 'CANCELLED' || statusObj.type === 'EXCEPTION') {
        cancelledStyles = {
          backgroundColor: statusObj.color
        }
        cancelledClass = statusObj.color && styles.jobTerminated;
        arrowHeadStyles = {
          borderColor: 'transparent ' + statusObj.color + ' transparent transparent'
        };
      }

      let files = null;
      if (statusObj.extra_fields && statusObj.extra_fields.files && statusObj.extra_fields.files.length > 0) {
        files = statusObj.extra_fields.files.map((file) => {
          if ((typeof file.filename === 'undefined' || file.filename === null || file.filename === '') || (typeof file.file_path === 'undefined' || file.file_path === null || file.file_path === '')) {
            return;
          } else {
            const fileExtension = file.filename.split('.').pop();
            let showPreview = false;
            if (fileExtension.includes('jpg') || fileExtension.includes('JPG') || fileExtension.includes('JPEG') || fileExtension.includes('jpeg') || fileExtension.includes('png') || fileExtension.includes('PNG') || fileExtension.includes('gif') || fileExtension.includes('GIF') || fileExtension.includes('bimp') || fileExtension.includes('BIMP') || fileExtension.includes('bmp') || fileExtension.includes('BMP')) {
              showPreview = true;
            }
            return (
              <a href={server_url + file.file_path} target="_blank">
                {showPreview &&
                <img src={server_url + file.file_path} id={'status-file-' + i} className={styles['task-file-item'] + " img-rounded"} />}
                {!showPreview &&
                  <span>
                    <FontAwesomeIcon icon={faPaperclip}/>
                    {file.filename}
                  </span>
                }
              </a>
            );
          }
        });
      }

      let exception_files = null;
      if (statusObj.exception && statusObj.exception.files && statusObj.exception.files.length > 0) {
        exception_files = statusObj.exception.files.map((file) => {
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
                <img src={file.file_path} id={'status-file-' + i} className={styles['task-file-item'] + " img-rounded"} />}
                {!showPreview &&
                <span>
                    <FontAwesomeIcon icon={faPaperclip}/>
                  {file.filename}
                  </span>
                }
              </a>
            );
          }
        });
      }

      let reportedStatusTitle = statusObj.type;
      if (statusObj.type === 'AUTO_START') {
        reportedStatusTitle = 'Start';
      } else if (statusObj.type === 'AUTO_COMPLETE') {
        reportedStatusTitle = 'Complete';
      } else if (typeof statusObj.title !== 'undefined' && statusObj.title && statusObj.title !== '' && statusObj.title !== null) {
        reportedStatusTitle = statusObj.title;
      }

      let reporterName = statusObj.reporter_name;
      if (statusObj.reporter_id === 0 && statusObj.object_ids.length > 0) {
        const entityIndex = this.props.entities.findIndex((entity) => {
          return entity.id === statusObj.object_ids[0];
        });
        if (entityIndex !== -1) {
          reporterName = this.props.entities[entityIndex].name;
        } else {
          reporterName = this.props.profile.fullname;
        }
      } else if (statusObj.reporter_id === 0 && statusObj.object_ids.length === 0 ) {
        reporterName = this.props.profile.fullname;
      } else if (statusObj.from_customer ||statusObj.reporter_name === '') {
        reporterName = 'You';
      }

      return (
        <article key={'task-status-key-' + i} className={styles['task-status-item'] + ' timeline-entry'}>
          <div className={cx('timeline-entry-inner')}>
            <div className={cx('timeline-icon', activeClass)} style={lastStyle}>
              <i className="entypo-feather"></i>
            </div>
            <div className={cx('timeline-label', cancelledClass)} style={cancelledStyles} >
              <h2 className={styles.timelineLabelTitle}>{ reporterName } <span>reported {statusObj.type !== 'CUSTOM' && reportedStatusTitle}</span></h2>
              { statusObj.extra_fields && statusObj.extra_fields.notes && !statusObj.subscribe_source ? <p>{ statusObj.extra_fields.notes }</p> : null }
              { statusObj.extra_fields && statusObj.extra_fields.notes && statusObj.subscribe_source && statusObj.subscribe_source.toUpperCase() !== 'SMS' ? <p>{ statusObj.extra_fields.notes.replace('this link', '') }<a href="javascript:void(0)" onClick={() => this.changeSubscription(statusObj.type.toUpperCase() === 'UNSUBSCRIBED', statusObj.subscribe_source)}>this link</a></p> : null }
              { statusObj.extra_fields && statusObj.extra_fields.notes && statusObj.subscribe_source && statusObj.subscribe_source.toUpperCase() === 'SMS' ? <p>{ statusObj.extra_fields.notes}</p> : null }
              { statusObj.extra_fields && statusObj.extra_fields.estimate ? <p>{ statusObj.extra_fields.estimate } mins</p> : null }
              { files }
              { exception_files }

              <div className={styles['time-display']} style={{ color }}>{ moment.utc(statusObj.time).local().format('MMM DD hh:mm a') }</div>
              <span style={arrowHeadStyles} className={styles.timelineEntryArrowHead}></span>
            </div>
          </div>
        </article>);
    });

    return (
      <div className={styles['live-status-section']} id='statusnmap'>
        { this.state.showCustomerStatusConfirmation && this.renderStatus(this.textInput.value) }
        { length != 0 ?
          <div className={styles.timelineCenteredParent}>
            <div className={cx('timeline-centered', styles.timelineContainer, 'dynamicColor')} id="statusJournal">
              { this.getEmptyHistoryMessage() }
              { statusComponents }
              {!demoInProgress &&
                <div className={styles.additonalAddNotesBtnContainer}>
                  <Button title="Send Note" className={cx(styles.additionalSendNotesBtn, 'btn-submit', styles['visible-to-customer'])} onClick={() => this.openModal()}>
                    <FontAwesomeIcon icon={faPencilAlt} className={styles.sendNoteIcon} /> Send Notes
                  </Button>
                </div>
              }
            </div>
          </div>
          :
          null }
        {!demoInProgress &&
        <Modal className={cx(styles['transparent-color'])} show={this.state.showModal} onHide={this.closeModal}>
          <Modal.Header className={styles.addNoteModalHeader} closeButton>
            <Modal.Title className="text-center">
              <h2 className={styles.addNoteModalHeading}>Send Notes and Files</h2>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className={styles.addNotesModalBody}>
            <div className={cx(styles['add-notes-container'])}>
              <textarea autoFocus className={cx('form-control', styles['input-text'])} placeholder="Type your note here ..." ref={(input) => { this.textInput = input; }} />
              {this.state.fileUploader &&
              <section className={cx("animated fadeIn", styles["dropzoneContainer"])}>
                <div className="dropzone">
                  <Dropzone id="dropzone1" className={styles.actualDropZone} onDrop={this.onDrop.bind(this)}>
                    {this.state.files_to_upload.length === 0 &&
                    <div className={styles.dropMsg}>
                      <p>Tap here to attach files or drop files here</p>
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
              <Alert bsStyle="danger">{this.state.error}</Alert>
            </div>
            }
            <div className="text-center">
              <div className={cx(styles.fileUploaderMobileBtn)}>
                <label><FontAwesomeIcon icon={faPaperclip} /> Attach Files</label>
                <input type="file" onChange={(e) => this.updateImagesDisplay(e)} multiple className="form-control" />
              </div>
              {!this.state.serverActionPending &&
                <Button className={cx(styles['add-note'], 'btn-submit', styles['visible-to-customer'])} onClick={() => this.addNewStatus()}>
                  Send
                </Button>
              }
              {!this.state.serverActionPending &&
                <Button className={cx(styles['cancel-button'], 'btn-submit', styles['visible-to-customer'])} onClick={() => this.closeModal()}>
                  Cancel
                </Button>
              }
              {this.state.serverActionPending &&
                <SavingSpinner title={'Saving'} borderStyle="none"/>
              }
            </div>
          </Modal.Footer>
        </Modal>
        }
        {!demoInProgress &&
          <div className={styles['send-note-section']}>
            <Button title="Send Note" className={cx(styles['add-note2'], 'btn-submit', styles['intercom-style-btn'], styles['visible-to-customer'])} style={{ backgroundColor: color }} onClick={() => this.openModal()}>
              <FontAwesomeIcon icon={faPencilAlt} className={styles.sendNoteIcon} />
            </Button>
          </div>
        }
      </div>
    );
  }

}
