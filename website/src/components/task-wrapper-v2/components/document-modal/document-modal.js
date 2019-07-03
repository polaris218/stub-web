import React, { Component } from 'react';
import styles from './document-modal.module.scss';
import cx from 'classnames';
import { Button, Modal } from 'react-bootstrap';
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {faFileAlt} from "@fortawesome/fontawesome-free-solid";

export default class DocumentModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDocumentsModal: false,
      selectedDocuments: [],
      attached_documents: []
    };

    this.closeDocumentModal = this.closeDocumentModal.bind(this);
    this.handleSelectDocument = this.handleSelectDocument.bind(this);
    this.handleDoneClick = this.handleDoneClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.showDocumentsModal && nextProps.showModal) {
      const showDocumentsModal = nextProps.showModal;
      const selectedDocuments = nextProps.document_ids;
      const attached_documents = $.extend(true, [],nextProps.attached_documents);
      this.setState({
        showDocumentsModal,
        selectedDocuments,
        attached_documents
      });
    }
  }

  closeDocumentModal() {
    this.props.hideModal();
    this.setState({
      showDocumentsModal: false,
      selectedDocuments: []
    });
  }

  handleDoneClick() {
    this.props.updateDocumentIds(this.state.selectedDocuments, this.state.attached_documents);
    this.props.hideModal();
    this.setState({
      showDocumentsModal: false,
      selectedDocuments: []
    });
  }

  handleSelectDocument(document_id, default_id = null) {
    const selectedDocuments = this.state.selectedDocuments;
    const attached_documents = this.state.attached_documents;
    if (default_id) {
      const document_from_default_id = attached_documents.find(doc => {
        return doc.document_default_id === default_id;
      });
      const index2 = this.state.attached_documents.indexOf(document_from_default_id);
      attached_documents.splice(index2, 1);
      selectedDocuments.splice(selectedDocuments.indexOf(document_from_default_id.document_id), 1);
      this.setState({attached_documents, selectedDocuments});
      return;
    }

    const document_by_id = this.props.documents && this.props.documents.find(doc => {
      return doc.id === document_id;
    });

    if (document_by_id && document_by_id.default_id) {
      const attached_document = this.props.attached_documents.find(doc => {
        return doc.document_default_id === document_by_id.default_id;
      });
      if (attached_document) {
        selectedDocuments.push(attached_document.document_id);
        attached_documents.push(attached_document);
        this.setState({attached_documents, selectedDocuments});
        return;
      }
    }

    const index = selectedDocuments.indexOf(document_id);
    if (index >= 0) {
      selectedDocuments.splice(index, 1);
    } else if (index === -1) {
      selectedDocuments.push(document_id);
    }
    this.setState({
      selectedDocuments
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
      <Modal
        show={this.state.showDocumentsModal}
        onHide={this.closeDocumentModal}
        dialogClassName={styles.addDocumentModal}
        className={styles.modalContainer}
      >
        <Modal.Header className={styles.documentModalHeader}>
          <Modal.Title className={cx(styles.modalTitle)}>
            Attach Documents
            <i className={styles.closeIcon} onClick={this.closeDocumentModal}>{crossIcon}</i>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={cx(styles.modalBody)}>
          <div className={cx(styles.box)}>
            <div className={cx(styles.boxBody)}>
              <div className={cx(styles.boxBodyInner)}>
                {this.props.documents && this.props.documents.map((document) => {
                  let activeClass = "";
                  let alreadyAttached = false;
                  if (document.id && this.state.selectedDocuments.indexOf(document.id) >= 0) {
                    activeClass = styles.activeDocument;
                  } else if (document.default_id && this.state.selectedDocuments.indexOf(document.default_id) >= 0) {
                    activeClass = styles.activeDocument;
                  } else if (document.default_id && this.state.attached_documents.find((attached_doc) => { return attached_doc.document_default_id === document.default_id; })) {
                    activeClass = styles.activeDocument;
                    alreadyAttached = true;
                  }
                  return (
                    <span className={cx(styles.documentWraper, activeClass)} onClick={() => {this.handleSelectDocument(document.id || document.default_id, alreadyAttached ? document.default_id : null)}}>
                      <FontAwesomeIcon icon={faFileAlt}/>
                      <span className={styles.documentName}>
                        {document.name}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="text-right">
            <Button className={cx(styles.btn, styles['btn-light'])} onClick={() => this.closeDocumentModal()}>Cancel</Button>
            <Button onClick={this.handleDoneClick} className={cx(styles.btn, styles['btn-secondary'])}>
              Done
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
