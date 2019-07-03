import React, { Component } from 'react';
import cx from 'classnames';
import { Row, Col, Modal,Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import $ from 'jquery';
import styles from './exception_item_container.module.scss';
import { faTimesCircle} from '@fortawesome/fontawesome-free-regular';
import { faPlus } from '@fortawesome/fontawesome-free-solid';
import Dropzone from 'react-dropzone';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { FieldGroup} from '../fields';
import _ from 'lodash';

export default class ExceptionItemContainer extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.handleMessageTier1Change = this.handleMessageTier1Change.bind(this);
    this.handleMessageTier2Change = this.handleMessageTier2Change.bind(this);
    this.handleNotesChange = this.handleNotesChange.bind(this);
    this.previousExceptionReasons = this.previousExceptionReasons.bind(this);
    this.renderFileUploadAreaForLowRes = this.renderFileUploadAreaForLowRes.bind(this);
    this.toggleDetails = this.toggleDetails.bind(this);
    this.initializeState = this.initializeState.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.closeImage = this.closeImage.bind(this);
    this.updateImagesDisplay = this.updateImagesDisplay.bind(this);
    this.getFilePreview = this.getFilePreview.bind(this);
    this.getPreview = this.getPreview.bind(this);

    this.state = {
      tier1: null,
      tier2: null,
      notes: null,
      previousExceptionReasons: null,
      showDetails: false,
      selectedItem: $.extend(true, {}, props.selectedItem),
      exceptionList: null,
      messageTier1: [],
      messageTier2: [],
      files: []
    };
  }

  componentDidMount() {
    this.initializeState();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.selectedItem, this.props.selectedItem)) {
      this.initializeState(nextProps);
    }
  }

  initializeState(props = this.props) {
    const exceptionList = props.orderStatus && props.orderStatus.exceptions_list;
    const messageTier1 = [];
    exceptionList && exceptionList.map((exception) => {
      if (!messageTier1.find((message) => { return exception.message_tier_1 === message; })) {
        messageTier1.push(exception.message_tier_1);
      }
    });
    let tier1 = null;
    let tier2 = null;
    let notes = null;
    let files = [];
    let messageTier2 = [];
    if (props.selectedItem && props.selectedItem.exception) {
      tier1 = props.selectedItem.exception.message_tier_1;
      tier2 = props.selectedItem.exception.message_tier_2;
      notes = props.selectedItem.exception.notes;
      files = props.selectedItem.exception.files;
      const filteredExceptions = exceptionList && exceptionList.filter((exception) => {
        return exception.message_tier_1 === props.selectedItem.exception.message_tier_1;
      });
      messageTier2 = filteredExceptions && filteredExceptions.map((exception) => {
        return exception.message_tier_2;
      });
    }
    this.setState({
      selectedItem: $.extend(true, {}, props.selectedItem),
      messageTier1,
      exceptionList,
      messageTier2,
      tier1,
      tier2,
      notes,
      files
    });
  }

  getFilePreview(file) {
    if (file.file_path) {
      return file.file_path;
    }
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

  getPreview(dropObj) {
    if (dropObj.file_path) {
      return dropObj.file_path;
    }
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

  updateImagesDisplay(e) {
    // Convert file object to array prototype to match rest of our file upload structure
    const filesArray = Object.keys(e.target.files).map(function (key) {
      return e.target.files[key];
    });
    this.onDrop(filesArray);
  }

  onDrop(files) {
    let selectedFiles = this.state.files;
    selectedFiles.push.apply(selectedFiles, files);
    if (selectedFiles.length > 3) {
      selectedFiles.splice(3, selectedFiles.length - 3);
    }
    this.setState({
      files: selectedFiles
    });
  }

  closeImage(e, index) {
    e.preventDefault();
    e.stopPropagation();
    let files = this.state.files;
    files.splice(index, 1);
    this.setState({
      files
    });
  }

  previousExceptionReasons() {
    const filteredExceptions = this.state.exceptionList && this.state.exceptionList.filter((exception) => {
      return exception.message_tier_1 === this.props.prevException.message_tier_1;
    });
    const messageTier2 = filteredExceptions && filteredExceptions.map((exception) => {
      return exception.message_tier_2;
    });
    this.setState({
      tier1 : this.props.prevException.message_tier_1,
      tier2: this.props.prevException.message_tier_2,
      messageTier2,
      notes: this.props.prevException.notes,
      files: this.props.prevException.files
    })
  }

  toggleDetails(){
    this.setState({
      showDetails: !this.state.showDetails,
    })
  }

  renderFileUploadAreaForLowRes() {
    return (
      <div className={styles.fileUploaderMobileException}>
        <div className={cx(['form-group'], styles.fileUploaderMobileBtn)}>
          <label>Select Files to Upload</label>
          <input type="file" onChange={this.updateImagesDisplay} multiple className="form-control" />
        </div>
        <div className={styles.customFilePreview}>
          {this.state.files && this.state.files.length === 0 &&
            <p>No files chosen.</p>
          }

       { this.state.files && this.state.files.length > 0 &&
            <ul className={styles.uploadFilesPreviews}>
                {this.state.files.map((file, index) => {
                  const filePreviewURL = this.getFilePreview(file);
                  return (
                    <li key={index}>
                      <button onClick={(e) => this.closeImage(e, index)} className={styles.closeBtn}>
                        <FontAwesomeIcon icon={faTimesCircle}/></button>
                      <div className={styles.uploadCaption}><span>{file.filename ? file.filename : file.name}</span></div>
                      <img src={filePreviewURL}/>
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


  handleMessageTier1Change(e) {
    const filteredExceptions = this.state.exceptionList && this.state.exceptionList.filter((exception) => {
      return exception.message_tier_1 === e.target.value;
    });
    const messageTier2 = filteredExceptions && filteredExceptions.map((exception) => {
      return exception.message_tier_2;
    });
    this.setState({
      tier1: e.target.value,
      messageTier2,
      tier2: ""
    });
  }

  handleMessageTier2Change(e){
    this.setState({
      tier2: e.target.value,
    });
  }

  handleNotesChange(e){
    this.setState({
      notes: e.target.value
    });
  }

  saveExceptionReason() {
    const selectedException = this.state.exceptionList && this.state.exceptionList.find((exception) => {
      return exception.message_tier_1 === this.state.tier1 && exception.message_tier_2 === this.state.tier2;
    });
    let exception = {
      message_tier_1: this.state.tier1 || '',
      message_tier_2: this.state.tier2 || '',
      notes: this.state.notes || '',
      code: selectedException && selectedException.code,
      files: this.state.files || []
    };

    this.setState({
      exceptionList: null,
      messageTier1: [],
      messageTier2: [],
      files: [],
      notes: [],
      previousExceptionReasons: null,
    });

    this.props.saveExceptionStatus(this.state.selectedItem, exception);
  }

  closeModal(){
    this.setState({
      exceptionList: null,
      messageTier1: [],
      messageTier2: [],
      files: [],
      notes: [],
      previousExceptionReasons: null,
    });
    this.props.closeExceptionModel();
  }

  render(){
    const product = this.state.selectedItem;
    let imagePath = "/images/empty-image-placeholder.png";
    if (product.image_path) {
      imagePath = product.image_path;
    }
    const crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756">
      <g transform="translate(-1270.486 -30.485)">
        <path
          d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z"
          transform="translate(4126.197 -40.804)" fill="#8d959f"/>
      </g>
    </svg>;

    return(
      <div>
        <Modal dialogClassName={styles.modalPrimary} show={this.props.showModal} keyboard={false} backdrop={false} onHide={this.closeModal}>
          <Modal.Header className={styles.modalHeader}>
            <Modal.Title className={styles.modalTitle}>Order Exception</Modal.Title>
            <i className={styles.closeIcon} onClick={this.closeModal}>{crossIcon}</i>
          </Modal.Header>
          <Modal.Body>
            <div className={styles.box}>
              <div className={styles.boxBody}>
                <div className={cx(styles.boxBodyInner, styles.exceptionFormContainer)}>
                  <div className={styles.productWrapper}>
                    <Row>
                      <Col lg={4} md={4} sm={4}>
                        <a onClick={()=> window.open(imagePath, "_blank")} href={imagePath} target="_blank" className={styles.imageWrapper}><img src={imagePath} alt={product.name}/></a>
                      </Col>
                      <Col lg={8} md={8} sm={8}>
                        <div className={styles.product}>
                          {product.name && <h3>{product.name.length > 45 ? product.name.substr(0, 45) + ' ...' : product.name}</h3>}
                          {product.sku && <p>SKU : <strong>{product.sku}</strong></p>}
                          {product.lpn && <p>LPN : <strong>{product.lpn}</strong></p>}
                          {this.state.showDetails &&
                          <div className={styles.moreDescription}>
                            {product.description && <p>Description : <strong>{product.description}</strong></p>}
                            {product.model && <p>Model : <strong>{product.model}</strong></p>}
                            {product.weight && <p>Weight : <strong>{product.weight}{product.weight_unit}</strong></p>}
                            {product.color && <p>Color : <span style={{backgroundColor:product.color}} className={styles.itemColor}/></p>}
                          </div>
                          }
                          {<a className={styles.more} onClick={(e) => this.toggleDetails(e)}>{this.state.showDetails ? "less" : "more.." }</a>}
                        </div>
                      </Col>
                    </Row>
                  </div>
                  <div className={'clearfix'}>
                    {this.props.prevException && <div className={styles.previousButton}><button style={cx(styles.btn, styles['btn-secondary'])} onClick={(e) => this.previousExceptionReasons(e)}>Same as previous</button></div>}
                    {this.props.prevException && <div><ul className={styles.exceptionReasons}>
                      <li>{this.props.prevException.message_tier_1}</li>
                      <li>{this.props.prevException.message_tier_2}</li>
                    </ul>
                    </div>
                    }
                  </div>
                  <FormGroup className={styles.formGroup}>
                    <ControlLabel className={styles.controlLabel}>Select a reason from the list below <span className={styles.important}>*</span></ControlLabel>
                    <div className={styles.selectBox}>
                      <FormControl onChange={this.handleMessageTier1Change} componentClass="select" placeholder="Select a reason" className={styles.formControl}>
                        <option value="" selected={this.state.tier1 === ""}>Select reason</option>
                        {this.props.orderStatus && this.props.orderStatus.exceptions_list && this.props.orderStatus.exceptions_list.length > 0 && this.state.messageTier1 && this.state.messageTier1.map((reason) => {
                          return (
                            reason && <option value={reason} selected={this.state.tier1 === reason}>{reason}</option>
                          );
                        })
                        }
                        {(!this.props.orderStatus || !this.props.orderStatus.exceptions_list || this.props.orderStatus.exceptions_list.length === 0) &&
                          <option value={'UNKNOWN'} selected={this.state.tier2 === 'UNKNOWN'}>{'UNKNOWN'}</option>
                        }
                      </FormControl>
                    </div>
                  </FormGroup>
                  <FormGroup className={styles.formGroup}>
                    <ControlLabel className={styles.controlLabel}>Select a sub reason from the list below <span className={styles.important}>*</span></ControlLabel>
                    <div className={styles.selectBox}>
                      <FormControl onChange={(e) => { this.handleMessageTier2Change(e) }} componentClass="select" placeholder="Select a reason" className={styles.formControl}>
                        <option value="" selected={this.state.tier2 === ""}>Select reason</option>
                        { this.props.orderStatus && this.props.orderStatus.exceptions_list && this.props.orderStatus.exceptions_list.length > 0 && this.state.messageTier2 && this.state.messageTier2.map((reason) => {
                          return (
                            reason && <option value={reason} selected={this.state.tier2 === reason}>{reason}</option>
                          );
                        })
                        }
                        {
                          (!this.props.orderStatus || !this.props.orderStatus.exceptions_list || this.props.orderStatus.exceptions_list.length === 0) &&
                          <option value={'UNKNOWN'} selected={this.state.tier2 === 'UNKNOWN'}>{'UNKNOWN'}</option>
                        }
                      </FormControl>
                    </div>
                  </FormGroup>
                  <FormGroup className={styles.formGroup}>
                    <ControlLabel className={styles.controlLabel}>Add Note</ControlLabel>
                    <FormControl id="item-notes" name="item-note" value={this.state.notes} placeholder='Note' className={styles.formControl} onChange={this.handleNotesChange} />
                  </FormGroup>
                  <section className={cx("animated fadeIn", styles["dropzoneContainer"])}>
                    <div className="dropzone">
                      <Dropzone id="dropzone1" className={styles.actualDropZoneException} onDrop={(files) => this.onDrop(files)}>
                        {this.state.files && this.state.files.length === 0 &&
                        <div className={styles.dropMsg}>
                          <p><strong>Drop</strong> files here to upload or <strong>Click</strong> here to browse files</p>
                        </div>
                        }
                        { this.state.files && this.state.files.length > 0 &&
                        <ul className={cx(styles.uploadFilesPreviews, ['clearfix'])}>
                          {
                            this.state.files.map((file, index) => {
                              return(
                                <li>
                                  <button onClick={(e) => this.closeImage(e, index)}
                                          className={styles.closeBtn}><FontAwesomeIcon icon={faTimesCircle}/></button>
                                  <div className={styles.uploadCaption}><span>{file.filename ? file.filename : file.name}</span></div>
                                  <img src={this.getPreview(file)}/>
                                </li>
                              )
                            })
                          }
                          {this.state.files.length > 0 && this.state.files.length < 3 &&
                          <li className={styles.addAnotherImg}>
                            <div><FontAwesomeIcon icon={faPlus}/></div>
                          </li>
                          }
                        </ul>
                        }
                      </Dropzone>
                    </div>
                  </section>
                  {this.renderFileUploadAreaForLowRes()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <button type="button" onClick={(e) => {this.saveExceptionReason(e)}} className={cx(styles.btn, styles['btn-secondary'])} disabled={!(this.state.tier1 && this.state.tier2)}>Save</button>
              <button type="button" onClick={this.closeModal} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
