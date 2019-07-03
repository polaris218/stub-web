import React, { Component } from 'react';
import style from '../../base-styling.module.scss';
import styles from './instructions.module.scss';
import cx from 'classnames';
import { Row, Col, Glyphicon, Button } from 'react-bootstrap';
import ExtraFields from './extra-fields/extra-fields';
import { FieldGroup } from '../../../fields';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faPlus, faSync, faFileAlt } from '@fortawesome/fontawesome-free-solid';
import Dropzone from 'react-dropzone';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import ExtraFieldWithType from '../../../extra_field_with_type/extra_field_with_type';
import DocumentModal from '../document-modal/document-modal';
import { Cookies } from 'react-cookie';

export default class Instructions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    };

    let cookies = new Cookies();
    this.companyId = cookies && cookies.get('cidx') || '';

    this.renderFileUploadAreaForLowRes = this.renderFileUploadAreaForLowRes.bind(this);
    this.updateDocumentIds = this.updateDocumentIds.bind(this);
    this.renderDocuments = this.renderDocuments.bind(this);
    this.removeDocument = this.removeDocument.bind(this);
    this.removeAttchedDocument = this.removeAttchedDocument.bind(this);
    this.showDocumentModal = this.showDocumentModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  updateDocumentIds(document_ids, attached_documents) {
    const all_document_ids = document_ids;
    attached_documents.map((attached_doc) => {
      all_document_ids.push(attached_doc.document_id);
    });
    this.props.onChangeEventState('document_ids', all_document_ids);
    this.props.setTaskFormState('taskDocuments', attached_documents);
  }

  showDocumentModal() {
    this.setState({
      showModal: true
    });
  }

  hideModal() {
    this.setState({
      showModal: false
    });
  }

  removeDocument(index) {
    const document_ids = this.props.event.document_ids;
    document_ids.splice(index, 1);
    this.props.onChangeEventState('document_ids', document_ids);
  }

  removeAttchedDocument(document_id) {
    const document_ids = this.props.event.document_ids;
    const index = document_ids.indexOf(document_id);
    document_ids.splice(index, 1);
    const taskDocuments = this.props.taskDocuments;
    const index2 = taskDocuments.map(doc => {
      return doc.document_id;
    }).indexOf(document_id);
    taskDocuments.splice(index2, 1);
    this.props.setTaskFormState('taskDocuments', taskDocuments);
    this.props.onChangeEventState('document_ids', document_ids);
  }

  renderDocuments() {
    let documents = this.props.event.document_ids.map((document_id, idx) => {
      const document = this.props.documents && this.props.documents.find((doc) => {
        return doc.id ? doc.id === document_id : doc.default_id === document_id;
      });
      if (document) {
        return (
          <div className={styles.attachmentBox}>
            {document.name}
            {(this.props.can_edit || this.props.can_create || (this.props.profile && this.props.profile.permissions.indexOf('COMPANY') !== -1)) &&
            <span className={cx(styles.remove)} onClick={() => {this.removeDocument(idx)}}/>
            }
          </div>
        )
      }
    });
    return documents;
  }

  renderFileUploadAreaForLowRes() {
    return (
      <div id="uploadFile">
        <div className={styles.fileUploaderMobile}>
          <div className={cx(['form-group'], styles.fileUploaderMobileBtn)}>
            <label>Select Files to Upload</label>
            <input type="file" onChange={(e) => this.props.updateImagesDisplay(e)} multiple className="form-control"/>
          </div>
          <div className={styles.customFilePreview}>
            {this.props.files_to_upload.length === 0 &&
            <p>No files chosen.</p>
            }
            {this.props.files_to_upload.length !== 0 &&
            <ul className={cx(styles.uploadFilesPreviews)}>
              {this.props.files_to_upload.map(file =>
                <li>
                  <span onClick={(e) => this.props.closeImage(file.name, e)} className={styles.remove}/>
                  <div className={styles.uploadCaption}><span>{file.name}</span></div>
                  <img src={this.props.getFilePreview(file)}/>
                  {file.isNew == 'false' &&
                  <button onClick={(e) => this.props.uploadFilesAgain(file, e)} className={styles.retryBtn}>
                    <FontAwesomeIcon icon={faSync}/></button>
                  }
                  {file.isInProcess == 'true' &&
                  <i className={cx('fa fa-spinner fa-spin ' + styles.uploadSpinner)}></i>
                  }
                </li>)
              }
              {this.props.files_to_upload.length > 0 && this.props.files_to_upload.length < this.props.filesAllowed &&
              <li className={styles.addAnotherImgMobile}>
                <div className={cx(['form-group'], styles.extraFileUploaderMobileBtn)}>
                  <FontAwesomeIcon icon={faPlus} className={styles.addAnotherIcon}/>
                  <input type="file" onChange={(e) => this.props.updateImagesDisplay(e)} multiple
                         className="form-control"/>
                </div>
              </li>
              }
            </ul>
            }
          </div>
        </div>
      </div>
    );
  }

  render() {
    let doneFiles = null;
    let attachedDocuments = null;
    let dropZoneOption = null;

    if (!this.props.fileUploader) {
      dropZoneOption = 'Attach a File';
    } else if (this.props.fileUploader) {
      dropZoneOption = 'Close Attaching Files';
    }

    if (this.props.filesFound) {
      doneFiles = this.props.filesFound.map((singleFile) => {
        const fileRemove = () => this.props.removeFile(this.props.event.id, singleFile.file_id, singleFile.filename);
        return (
          <div className={styles.attachmentBox}>
            <a href={singleFile.file_path} target="_blank">{singleFile.filename}</a>
            {(this.props.can_edit || this.props.can_create || (this.props.profile && this.props.profile.permissions.indexOf('COMPANY') !== -1)) &&
            <span onClick={fileRemove} className={cx(styles.remove)}/>
            }
          </div>
        );
      });
    }
    if (this.props.taskDocuments) {
      attachedDocuments = this.props.taskDocuments.map((singleDocument) => {
        return (
          <div className={styles.attachmentBox}>
            <a href={singleDocument.document_path + '?company_id=' + this.companyId} target="_blank">{singleDocument.document_name}</a>
            {(this.props.can_edit || this.props.can_create || (this.props.profile && this.props.profile.permissions.indexOf('COMPANY') !== -1)) &&
            <span className={cx(styles.remove)} onClick={() => {this.removeAttchedDocument(singleDocument.document_id)}}/>
            }
          </div>
        );
      });
    }

    return (
      <div className={cx(style.box)}>
        <h3 className={cx(style.boxTitle)}>Instructions</h3>
        <div className={cx(style.boxBody)}>
          <Row className={cx(style.taskFormRow)}>
            <Col xs={12} sm={12} md={this.props.isActivity === true ? 12 : 6}>
              <div className={cx(style.boxBodyInner)}>
                <FieldGroup
                  componentClass="textarea" name="instructions" placeholder="Comments..."
                  className={cx(styles.commentBox, style['form-control'])}
                  value={this.props.event.details || ''} onChange={(e) => {
                  this.props.onChangeEventState('details', e.target.value);
                }}
                  disabled={!this.props.can_edit}
                />
                <div className={cx('animated fadeIn', styles['filesSection'])}>
                  {(this.props.can_edit || this.props.can_create || (this.props.profile && this.props.profile.permissions.indexOf('COMPANY') !== -1)) &&
                  <button className={cx(styles.btn, styles['btn-primary-outline'])}
                          onClick={this.props.updateImageClick}><Glyphicon glyph="paperclip"/> {dropZoneOption}
                  </button>
                  }
                  {this.props.filesFound && this.props.filesFound.length > 0 &&
                  <div className={cx(styles.attachmentBoxWrapper)}>{doneFiles}</div>}
                </div>
                {this.props.fileUploader &&
                <div id="uploadFile">
                  <div className={cx('animated fadeIn', styles['dropzoneContainer'])}>
                    <div className="dropzone">
                      <Dropzone id="dropzone1" className={styles.actualDropZone} onDrop={this.props.onDrop}>
                        {this.props.files_to_upload.length === 0 &&
                        <div className={styles.dropMsg}>
                          <p><strong>Drop</strong> files here to upload or <strong>Click</strong> here to browse files
                          </p>
                        </div>
                        }
                        {this.props.files_to_upload.length !== 0 &&
                        <ul className={styles.uploadFilesPreviews}>
                          {this.props.files_to_upload.map(file =>
                            <li>
                              <span onClick={(e) => this.props.closeImage(file.name, e)} className={styles.remove}/>
                              <div className={styles.uploadCaption}><span>{file.name}</span></div>
                              <img src={this.props.getPreview(file)}/>
                              {file.isNew == 'false' &&
                              <button onClick={(e) => this.props.uploadFilesAgain(file, e)} className={styles.retryBtn}>
                                <FontAwesomeIcon icon={faSync}/></button>
                              }
                              {file.isInProcess == 'true' &&
                              <i className={cx('fa fa-spinner fa-spin ' + styles.uploadSpinner)}></i>
                              }
                            </li>
                          )}
                          {this.props.files_to_upload.length > 0 && this.props.files_to_upload.length < this.props.filesAllowed &&
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
                  </div>
                </div>
                }
                {this.props.fileUploader && this.renderFileUploadAreaForLowRes()}
              </div>
            </Col>
            {this.props.isActivity === false &&
            <Col xs={12} sm={12} md={6}>
              <div className={cx(style.boxBodyInner)}>
                <ExtraFieldWithType
                  fields={this.props.event && this.props.event.template_extra_fields}
                  onChange={(template_extra_fields) => {
                    this.props.onChangeEventState('template_extra_fields', template_extra_fields);
                  }}
                  getValue
                  can_edit={this.props.can_edit}
                />
                <ExtraFields
                  canViewTaskFullDetails={this.props.canViewTaskFullDetails}
                  can_edit={this.props.can_edit}
                  options={this.props.extraFieldsOptions}
                  fields={this.props.fields}
                  onChange={this.props.setTaskFormState}
                  restrictOptions
                />
              </div>
            </Col>}
          </Row>
          {(this.props.companyProfile && this.props.companyProfile.is_documents_disabled === false && this.props.isActivity === false) && <Row className={styles.documentsContainer}>
            <Col md={6} sm={12}>
              {(this.props.can_edit || this.props.can_create || (this.props.profile && this.props.profile.permissions.indexOf('COMPANY') !== -1)) &&
              <button className={cx(styles.btn, styles['btn-primary-outline'])}
                      onClick={this.showDocumentModal}><FontAwesomeIcon icon={faFileAlt}/> Attach Documents
              </button>
              }
              {this.props.event.document_ids && this.props.event.document_ids.length > 0 &&
              <div className={cx(styles.attachmentBoxWrapper)}>
                {attachedDocuments}
                {this.renderDocuments()}
              </div>
              }
            </Col>
          </Row>
          }
        </div>
        <DocumentModal
          showModal={this.state.showModal}
          document_ids={this.props.event.document_ids || []}
          attached_documents={this.props.taskDocuments || []}
          updateDocumentIds={this.updateDocumentIds}
          documents={this.props.documents}
          hideModal={this.hideModal}
        />
      </div>
    );
  }
}
