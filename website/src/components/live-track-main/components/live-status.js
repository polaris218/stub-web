import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Col, Button, Modal, Alert } from 'react-bootstrap';
import moment from 'moment';
import CrewWidget from './crew-widget';
import CustomerWidget from './customer-widget';
import TaskWidget from './task-widget';
import styles from './live-status.module.scss';
import { LocationMapV2 } from '../../../components/live_index';
import cx from 'classnames';
import Dropzone from 'react-dropzone';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSync, faTimesCircle, faPlus, faPaperclip } from '@fortawesome/fontawesome-free-solid';
import { faPaperPlane } from '@fortawesome/fontawesome-free-regular';
import { setNewLiveStatus, getLiveTaskFileAttachmentURL } from '../../../actions/livetrack';
import { uploadAttachment } from '../../../actions/tasks';
import SavingSpinner from '../../saving-spinner/saving-spinner';
import { getCustomerName, getErrorMessage } from '../../../helpers/task';
import { STATUS_META_DATA } from '../../../helpers/status_meta_data';


const errorMsg = (error) => {
  return getErrorMessage(error);
};

export default class LiveStatus extends Component {
  constructor(props) {
    super(props);

    this.renderEntitiesToShowOnMap = this.renderEntitiesToShowOnMap.bind(this);
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

  getEmptyEntityText() {
    return <div className={styles['no-info']}>Location information not available</div>;
  }


  getHeightForMap() {
    let mapHeight = 700;
    const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    mapHeight = screenHeight * 0.80;
    return mapHeight;
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

  renderEntitiesToShowOnMap() {
    const { task, entities } = this.props;
    let haveEntitiesLocation = false;

    if ((!entities || (entities.length === 0)) && (!task || !task.customer_exact_location)) {
      return this.getEmptyEntityText();
    }

    const filteredData = [];

    if (task.status === 'ENROUTE' || task.status === 'ARRIVING' || task.status === 'STARTED' || task.status === 'AUTO_START') {
      for (let i = 0; i < entities.length; i++) {
        if (entities[i].lastreading) {
          haveEntitiesLocation = true;
          filteredData.push({
            location : entities[i].lastreading,
            name     : entities[i].name,
            id       : entities[i].id,
            time     : entities[i].lastreading.time,
          });
        }
      }
    }

    let haveDestinationLocation = false;
    let location = null;
    let name = null;
    let address = null;
    let currentDestinationMarked = false;
    const taskCurrentDestinationExactLocation = task.current_destination && task.current_destination.exact_location;
    const isCurrentDestinationAvailable = (taskCurrentDestinationExactLocation &&
      taskCurrentDestinationExactLocation.lat && taskCurrentDestinationExactLocation.lng) ? true : false;
    let currentDestination = false;
    if (task.customer_exact_location && task.customer_exact_location.lat) {
      location = task.customer_exact_location;
      name = getCustomerName(task.customer_first_name, task.customer_last_name);
      address = task.customer_address;
      if (!isCurrentDestinationAvailable) {
        currentDestination = true;
        currentDestinationMarked = true;
      }
      else if (location.lat === taskCurrentDestinationExactLocation.lat &&
        location.lng === taskCurrentDestinationExactLocation.lng && address === task.current_destination.complete_address) {
        currentDestination = true;
        currentDestinationMarked = true;
      }
    }
    if (location) {
      haveDestinationLocation = true;
      filteredData.push({
        location : location,
        name     : name,
        address  : address,
        type     : 'customer',
        time     : task.start_datetime,
        destination: currentDestination,
      });
    }

    if (!currentDestinationMarked && isCurrentDestinationAvailable) {
      location = task.current_destination.exact_location;
      name = getCustomerName(task.customer_first_name, task.customer_last_name);
      address = task.current_destination.complete_address;
      if (location) {
        haveDestinationLocation = true;
        filteredData.push({
          location : location,
          name     : name,
          address  : address,
          type     : 'customer',
          time     : task.start_datetime,
          destination: currentDestination,
        });
      }
    }

    let showDirections = false;
    if (STATUS_META_DATA[task.status].showEntityDirectionsOnMap && haveEntitiesLocation && haveDestinationLocation) {
      showDirections = true;
    }

    const customerView = true;
    return (
      <div>
        <LocationMapV2 showLocation={STATUS_META_DATA[task.status].showEntityPinOnMap} estimate={ this.props.estimate } entities={filteredData} showDirections={showDirections} customerView={customerView} height={ this.getHeightForMap() } hideInfoInitially showEstimateOverlay={true} task={this.props.task} />
      </div>
    );
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
        <div className={cx(['form-group'], styles.fileUploaderMobileBtn)}>
          <label>Select Files to Upload</label>
          <input type="file" onChange={(e) => this.updateImagesDisplay(e)} multiple className="form-control" />
        </div>
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
                  <i className={'fa fa-spinner fa-spin ' + styles.uploadSpinner}></i>
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

  render() {
    const { rating, task, entities, loading } = this.props;
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

      if (statusObj.extra_fields && statusObj.extra_fields.visible_to_customer === false || (typeof statusObj.is_active !== 'undefined' && statusObj.is_active === false)) {
        return '';
      }

      let lastStyle = {};
      if (i === 0) {
        lastStyle = {
          backgroundColor: '#008BF8'
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
      } else if (statusObj.reporter_id === 0 && statusObj.object_ids.length === 0) {
        reporterName = this.props.profile.fullname;
      } else if (statusObj.from_customer || statusObj.reporter_name === '') {
        reporterName = 'You';
      }
      

      return (
          <article key={'task-status-key-' + i} className={styles['task-status-item'] + ' timeline-entry'}>
            <div className="timeline-entry-inner">
              <div className="timeline-icon" style={lastStyle}>
                <i className="entypo-feather"></i>
              </div>
              <div className="timeline-label">
                <h2>{ reporterName } <span>reported {statusObj.type !== 'CUSTOM' && reportedStatusTitle}</span></h2>
                  { statusObj.extra_fields && statusObj.extra_fields.notes ? <p>{ statusObj.extra_fields.notes }</p> : null }
                  { statusObj.extra_fields && statusObj.extra_fields.estimate ? <p>{ statusObj.extra_fields.estimate } mins</p> : null }
                  { files }

                  <div className={styles['time-display']}>{ moment.utc(statusObj.time).local().format('MMM DD hh:mm a') }</div>
              </div>
            </div>
          </article>);
    });
    return (
      <div className={styles['live-status-section']} id='statusnmap'>
        <Grid>
          { this.state.showCustomerStatusConfirmation && this.renderStatus(this.textInput.value) }
          <Col className={styles['estimate-col']} md={6} id="statusJournalParent">
             <CrewWidget entities={ entities } />
             { length != 0 ?
               <div className={styles.timelineCenteredParent}>
                 <div className="timeline-centered" id="statusJournal">
                   { statusComponents }
                 </div>
               </div>
               :
               null }
            {!demoInProgress &&
              <Modal className={cx(styles['transparent-color'])} show={this.state.showModal} onHide={this.closeModal}>
                <Modal.Header className={styles.addNoteModalHeader} closeButton>
                    <Modal.Title className="text-center">
                      <h2 className={styles.addNoteModalHeading}>Send Note and Files</h2>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className={cx(styles['add-notes-container'])}>
                    <textarea autoFocus className={cx('form-control', styles['input-text'])} placeholder="Type your note here ..." ref={(input) => { this.textInput = input; }} />
                    {this.state.fileUploader &&
                    <section className={cx("animated fadeIn", styles["dropzoneContainer"])}>
                      <div className="dropzone">
                        <Dropzone id="dropzone1" className={styles.actualDropZone} onDrop={this.onDrop.bind(this)}>
                          {this.state.files_to_upload.length === 0 &&
                          <div className={styles.dropMsg}>
                            <p><strong>Tap</strong> here to attach files or <strong>drop</strong> files here</p>
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
                                <i className={'fa fa-spinner fa-spin ' + styles.uploadSpinner}></i>
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
                    {!this.state.serverActionPending &&
                    <Button className={cx(styles['add-note'], 'btn-submit', styles['visible-to-customer'])}
                            onClick={() => this.addNewStatus()}>
                      Send
                    </Button>
                    }
                    {this.state.serverActionPending &&
                      <SavingSpinner title={'Saving'} borderStyle="none"/>
                    }
                    {!this.state.serverActionPending &&
                    <Button className={cx(styles['cancel-button'], styles['visible-to-customer'])}
                            onClick={() => this.closeModal()}>
                      Cancel
                    </Button>
                    }
                  </div>
                </Modal.Footer>
              </Modal>
            }
            {!demoInProgress &&
              <div className={styles['send-note-section']}>
                <Button title="Send Note" className={cx(styles['add-note2'], 'btn-submit', styles['intercom-style-btn'], styles['visible-to-customer'])} onClick={() => this.openModal()}>
                  <FontAwesomeIcon icon={faPaperPlane} className={styles.sendNoteIcon} />
                  <span>Send Note</span>
                </Button>
              </div>
            }
            <div className="clearfix"></div>
             <TaskWidget task={ task } />
          </Col>
          <Col id="mapWidget" className={styles['estimate-col']} md={6}>
            { this.renderEntitiesToShowOnMap() }
            <CustomerWidget task={ task } />
          </Col>
        </Grid>
      </div>
    );
  }
}

LiveStatus.propTypes = {
  status: PropTypes.object.isRequired,
  entities: PropTypes.array.isRequired,
  rating: PropTypes.array.isRequired,
  task: PropTypes.object.isRequired,
  task_url: PropTypes.string.isRequired,
  refreshStatus: PropTypes.func.isRequired,
  showOnlyDemo: PropTypes.bool,
};
