import React, { Component } from 'react';
import styles from './task-items-container.module.scss';
import cx from 'classnames';
import { Modal, Alert,Button } from 'react-bootstrap';
import SavingSpinner from '../saving-spinner/saving-spinner';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faCaretRight } from '@fortawesome/fontawesome-free-solid';
import _ from 'lodash';
import $ from 'jquery';
import ExceptionItemContainer from "./exception_item_container";
import {
  getAttachmentUploadURL,
  uploadAttachment,
} from '../../actions';

export default class TaskItemsContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: $.extend(true, [], props.items),
      selectedExceptionItem: null,
      showExceptionsModal: false,
      itemsWithStatus: [],
      prevException: null,
      serverActionPending: false
    };

    this.renderItems = this.renderItems.bind(this);
    this.cancelStatusAndCloseModal = this.cancelStatusAndCloseModal.bind(this);
    this.updateProductStatus = this.updateProductStatus.bind(this);
    this.saveItemsStatus = this.saveItemsStatus.bind(this);
    this.closeExceptionModel = this.closeExceptionModel.bind(this);
    this.saveExceptionStatus = this.saveExceptionStatus.bind(this);
    this.toggleDetails = this.toggleDetails.bind(this);
    this.markAllDelivered = this.markAllDelivered.bind(this);
    this.uploadSingleFileOnServer = this.uploadSingleFileOnServer.bind(this);
  }

  componentDidMount() {
    this.setState({
      items: $.extend(true, [], this.props.items)
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.items, this.props.items)) {
      this.setState({
        items: $.extend(true, [], nextProps.items),
      });
    }
  }

  toggleDetails(e, clickedItem){
    e.stopPropagation();
    e.preventDefault();
    const items = this.state.items;
    const index = items.findIndex(item => item.id === clickedItem.id);
    items[index].showDetails = !items[index].showDetails;
    this.setState({
      items: items,
    })
  }

  markAllDelivered() {
    const itemsWithStatus = this.state.itemsWithStatus;
    const items = $.extend(true, [], this.state.items);
    items && items.map((item) => {
      let itemInItemWithStatus = itemsWithStatus.find((itemWithStatus) => { return itemWithStatus.id === item.id; });
      if (item.type.toUpperCase() === 'DELIVERY' && itemInItemWithStatus) {
        itemInItemWithStatus.status = 'DELIVERED';
      } else if (item.type.toUpperCase() === 'DELIVERY' && !itemInItemWithStatus) {
        item.status = 'DELIVERED';
        itemsWithStatus.push(item);
      }
    });
    this.setState({
      itemsWithStatus,
    })
  }

  closeExceptionModel() {
    this.setState({
      showExceptionsModal: false,
    });
  }

  saveExceptionStatus(item, exception){
    let itemsWithStatus = this.state.itemsWithStatus;
    let itemIndex = itemsWithStatus.findIndex((singleItem =>  {return singleItem.id === item.id}));
    if(itemIndex > -1){
      itemsWithStatus[itemIndex].exception = exception;
      itemsWithStatus[itemIndex].status = 'EXCEPTION';
    } else{
      item.exception = exception;
      item.status = 'EXCEPTION';
      itemsWithStatus.push(item);
    }

    this.setState({
      showExceptionsModal: false,
      selectedExceptionItem: null,
      itemsWithStatus: itemsWithStatus,
      prevException: exception,
    });
  }

  cancelStatusAndCloseModal() {
    this.setState({
      items: this.props.items,
      itemsWithStatus: [],
    }, () => {
      this.props.closeModal();
    });
  }

  updateProductStatus(e, status, item) {
    e.preventDefault();
    e.stopPropagation();
    const updatedItem = $.extend(true, {}, item);
    updatedItem.status = status;
    if(status === 'EXCEPTION'){
      this.setState({
        showExceptionsModal:true,
        selectedExceptionItem: updatedItem,
      })
    }
    else {
      const items = this.state.items;
      const itemsWithStatus = this.state.itemsWithStatus;

      const existingItem = itemsWithStatus.find((el) => {
        return el.id === item.id;
      });

      if (typeof existingItem !== 'undefined') {
        const itemIndex = itemsWithStatus.indexOf(existingItem);
        if(existingItem && existingItem.exception && existingItem.status !== 'EXCEPTION'){
          delete existingItem.exception;
        }
        itemsWithStatus[itemIndex].status = status;
        this.setState({
          itemsWithStatus,
        });
      } else {
        if(updatedItem.exception && updatedItem.status !== 'EXCEPTION'){
          delete updatedItem.exception;
        }
        itemsWithStatus.push(updatedItem);
        this.setState({
          itemsWithStatus,
        });
      }
    }
  }

  renderItems() {
    const items = this.state.items;
    const renderedItems = items.map((item) => {
      let itemStatus = 'UNKNOWN';
      let exception = null;
      let foundItem = null;
      let itemGet = null;
      const itemsWithStatus = this.state.itemsWithStatus;
      foundItem = itemsWithStatus.find((el) => {
        return el.id === item.id;
      });
      if (foundItem && foundItem.status) {
        itemStatus = foundItem.status;
      } else if (item.status && item.status !== 'UNKNOWN') {
        itemStatus = item.status;
      }
      if (foundItem && foundItem.exception && foundItem.status === 'EXCEPTION') {
        exception = foundItem.exception;
      } else if(item && item.exception && item.status && item.status === 'EXCEPTION'){
        exception = item.exception;
      }

      if (foundItem) {
        itemGet = foundItem;
      } else {
        itemGet = item;
      }
      return (
        <div className={styles.singleItem} key={'task_order_item' + item.id}>
          <div className={styles.itemImageContainer}>
            <a href={item.image_path || "/images/empty-image-placeholder.png"} target="_blank">
              <img src={item.image_path || "/images/empty-image-placeholder.png"} alt={item.name} />
            </a>
          </div>
          <div className={styles.itemInfoContainer}>
            {item.type && <p className={item.type.toUpperCase() === 'DELIVERY'? styles.singleItemDelivery: styles.singleItemPickUp}><strong>{item.type}</strong></p>}
            {item.name && <h3>{item.name.length > 45 ? item.name.substr(0, 45) + ' ...' : item.name}</h3>}
            {item.sku && <p>SKU : <strong>{item.sku}</strong></p>}
            {item.lpn && <p>LPN : <strong>{item.lpn}</strong></p>}
            {item.showDetails &&
              <div className={styles.moreDescription}>
                {item.description && <p>Description : <strong>{item.description}</strong></p>}
                {item.model && <p>Model : <strong>{item.model}</strong></p>}
                {item.weight && <p>Weight : <strong>{item.weight}{item.weight_unit}</strong></p>}
                {item.subtotal && <p>Sub Total: <strong>{item.subtotal}</strong></p>}
                {item.color && <p>Color : <span style={{backgroundColor: item.color}} className={styles.itemColor}/></p>}
              </div>
            }
            {<a className={styles.more} onClick={(e) => this.toggleDetails(e,item)}>{item.showDetails ? "less" : "more.." }</a>}
            {exception && itemStatus === 'EXCEPTION' &&
            <div ><FontAwesomeIcon icon={faCaretRight} className={styles.rightCaret} />
              {exception && <ul className={styles.exceptionReasons}>
                <li>{exception.message_tier_1}</li>
                <li>{exception.message_tier_2}</li>
              </ul>}
            </div>
            }

            <div className={itemGet.status !== 'EXCEPTION' ? styles.itemStatusActions : styles.itemStatusActionsException}>
              {
                itemGet.type.toUpperCase() === 'DELIVERY'
                ?
                <div className={styles.deliveryButtons}>
                  <button onClick={(e) => { this.updateProductStatus(e, 'DELIVERED', itemGet); }} type="button" className={cx(styles.itemStatusButton, itemStatus.toUpperCase() === 'DELIVERED' && styles.activeBtn)}>Delivered</button>
                  <button onClick={(e) => { this.updateProductStatus(e, 'EXCEPTION', itemGet); }} type="button" className={cx(styles.itemStatusButton, itemStatus.toUpperCase() === 'EXCEPTION' && styles.activeBtn)}>Exception</button>
                </div>
                :
                <div className={styles.pickupButtons}>
                  <button onClick={(e) => { this.updateProductStatus(e, 'PICKED_UP', itemGet); }} type="button" className={cx(styles.itemStatusButton, itemStatus.toUpperCase() === 'PICKED_UP' && styles.activeBtn)}>Picked Up</button>
                  <button onClick={(e) => { this.updateProductStatus(e, 'EXCEPTION', itemGet); }} type="button" className={cx(styles.itemStatusButton, itemStatus.toUpperCase() === 'EXCEPTION' && styles.activeBtn)}>Exception</button>
                </div>
              }
            </div>
          </div>
        </div>
      );
    });
    return renderedItems;
  }

  uploadSingleFileOnServer(file) {
    let files = [];
    let file_id = '';
    const image = file;
    const promise = getAttachmentUploadURL(this.props.taskId)
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

  saveItemsStatus() {
    this.setState({
      serverActionPending: true
    });
    let items = this.state.itemsWithStatus;
    const promises = [];
    items.map((item) => {
      if (item.status.toUpperCase() === 'EXCEPTION') {
        let files = [];
        item.exception.files && item.exception.files.map((file) => {
          if (!file.file_id) {
            promises.push(this.uploadSingleFileOnServer(file).then((res) => {
              files.push({
                file_id: res[0].file_id,
                file_path: res[0].file_path,
                filename: res[0].filename
              });
            }).catch((err) => {
              console.log(err);
            }));
          } else {
            files.push(file);
          }
        });
        item.exception['files'] = files;
      } else if (item.status.toUpperCase() !== 'EXCEPTION' && item.exception) {
        delete item.exception;
      }
    });
    Promise.all(promises).then(() => {
      this.props.saveStatus(items);
      this.setState({
        items: this.props.items,
        itemsWithStatus: [],
        prevException: null,
        serverActionPending: false
      });
    });
  }

  render() {
    let disableSaveButton = false;
    if (this.props.items.length === 0 || this.state.itemsWithStatus.length === 0) {
      disableSaveButton = true;
    }
    const crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756">
      <g transform="translate(-1270.486 -30.485)">
        <path
          d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z"
          transform="translate(4126.197 -40.804)" fill="#8d959f"/>
      </g>
    </svg>;

    return (
      <div className={cx(styles.tasksItemsContainer)}>
        {this.state.showExceptionsModal &&
        <ExceptionItemContainer
          selectedItem = {this.state.selectedExceptionItem}
          showModal = {this.state.showExceptionsModal}
          saveExceptionStatus={this.saveExceptionStatus}
          closeExceptionModel = {this.closeExceptionModel}
          prevException={this.state.prevException}
          orderStatus={this.props.orderStatus}
        />
        }

        <Modal dialogClassName={styles.modalPrimary} show={this.props.show} keyboard={false} backdrop={'static'} onHide={this.cancelStatusAndCloseModal}>
          <Modal.Header className={styles.modalHeader}>
            <Modal.Title className={styles.modalTitle}>Order Items</Modal.Title>
            <i className={styles.closeIcon} onClick={this.cancelStatusAndCloseModal}>{crossIcon}</i>
          </Modal.Header>
          <Modal.Body>
            {this.props.fetchingItems ?
              <div className={styles.itemsLoadingContainer}>
                <SavingSpinner title="Fetching Items" borderStyle="none" size={8}  />
              </div>
              :
              <div className={styles.box}>
                <div className={styles.boxBody}>
                  <div className={cx(styles.boxBodyInner, styles.itemsListContainer)}>
                    {this.props.items.length > 0 ?
                      <div>
                        <div className={styles.markAllDelivered}>
                          <button className={cx(styles.btn, styles['btn-secondary'])} onClick={(e) => this.markAllDelivered(e)}>Mark All Delivered</button>
                        </div>
                        {this.renderItems()}
                      </div> : <Alert bsStyle="danger">No items found.</Alert>
                    }
                  </div>
                </div>
              </div>
            }
            <div className="text-right">
              <button disabled={disableSaveButton} onClick={(e) => { this.saveItemsStatus(e) }} type="button" className={cx(styles.btn, styles['btn-secondary'])}>
                {this.state.serverActionPending ? <SavingSpinner title="" borderStyle="none" size={8}/> : "Save"}
              </button>
              <button type="button" onClick={() => { this.cancelStatusAndCloseModal() }} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }

}

