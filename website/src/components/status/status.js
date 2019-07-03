import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './status.module.scss';
import { Grid, Row, Button, Col, FormControl, ControlLabel, FormGroup, Checkbox } from 'react-bootstrap';
import { ColorField } from '../fields';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faBars, faCaretDown, faCaretUp } from '@fortawesome/fontawesome-free-solid';
import cx from 'classnames';
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import SavingSpinner from '../saving-spinner/saving-spinner';
import TemplateForm from "../status-template-form/template-form";
import OrderStatusExceptions from './../order-status-exceptions/order-status-exceptions';

const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
    };
  },
};

const cardTarget = {
  canDrop(props, monitor) {
    const item = monitor.getItem();
    return item;
  },
  hover(props, monitor, component) {
    const ownId = props.id;
    const draggedId = monitor.getItem().id;
    if (draggedId === ownId) {
      return;
    }

    const ownIndex = props.index;
    const draggedIndex = monitor.getItem().index;

    // What is my rectangle on screen?
    const boundingRect = findDOMNode(component).getBoundingClientRect();
    // Where is the mouse right now?
    const clientOffset = monitor.getClientOffset();
    // Where is my vertical middle?
    const ownMiddleY = (boundingRect.bottom - boundingRect.top) / 2;
    // How many pixels to the top?
    const offsetY = clientOffset.y - boundingRect.top;

    // We only want to move when the mouse has crossed half of the item's height.
    // If we're dragging down, we want to move only if we're below 50%.
    // If we're dragging up, we want to move only if we're above 50%.

    // Moving down: exit if we're in upper half
    if (draggedIndex < ownIndex && offsetY < ownMiddleY) {
      return;
    }

    // Moving up: exit if we're in lower half
    if (draggedIndex > ownIndex && offsetY > ownMiddleY) {
      return;
    }

    // Time to actually perform the action!
    props.moveCard(draggedIndex, ownIndex);
    monitor.getItem().index = ownIndex;
  }
};


@DropTarget('STATUS', cardTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))
@DragSource('STATUS', cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))
export default class Status extends Component {
  constructor(props){
    super(props);
    this.state = {
      showDialog: false,
      checkbox: false,
      optionsPanel: false,
      inputPrompt: this.props.statusData.input_prompt ||  false,
      status: { ...this.props.statusData },
      enabled: false
    };
    this.toggleOptionsPanel = this.toggleOptionsPanel.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
    this.inputPromptChangeHandler = this.inputPromptChangeHandler.bind(this);
    this.toggleStatusEditing = this.toggleStatusEditing.bind(this);
    this.removeStatus = this.removeStatus.bind(this);
    this.renderCustomMessages = this.renderCustomMessages.bind(this);
    this.renderSystemMessages = this.renderSystemMessages.bind(this);
    this.onHide = this.onHide.bind(this);
    this.exceptionListHandler = this.exceptionListHandler.bind(this);
  }

  toggleStatusEditing() {
    this.setState({
      enabled: !this.state.enabled
    });
  }

  toggleOptionsPanel() {
    this.props.toggle(this.props.statusData.id);
  }

  onColorChange(hex) {
    const statusObj = this.state.status;
    Object.assign(statusObj, { ...this.state.status, color : hex });
    this.setState({
      status: statusObj
    });
    this.props.handleStatusUpdate(statusObj);
  }

  inputPromptChangeHandler(e) {
    const statusObj = this.state.status;
    Object.assign(statusObj, { ...this.state.status, input_prompt : null });
    this.setState({ inputPrompt: e.target.checked, status: statusObj }, () => {
      this.props.handleStatusUpdate(statusObj);
    });

  }

  changeHandler(e) {
    let title = e.target.name;
    let value = '';
    if (e.target.type === 'checkbox') {
      value = e.target.checked;
    } else {
      value = e.target.value;
    }
    if (e.target.name === 'custom_message_template' && e.target.value === 'NULL') {
      title = e.target.name;
      value = 1111;
    }
    const statusObj = this.state.status;
    Object.assign(statusObj, { [title] : value });
    this.setState({
      status: statusObj
    });
    this.props.handleStatusUpdate(statusObj);
  }

  exceptionListHandler(arr){
    let local_status = this.state.status;
    local_status['exceptions_list'] = arr;
    this.setState({
      status: local_status
    });
    this.props.handleStatusUpdate(local_status);
  }


  removeStatus(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.deleteStatus(this.state.status);
  }

  renderCustomMessages() {
    return this.props.customMessages.map((message) => {
      return (
        <option selected={parseInt(this.state.status.custom_message_template) === parseInt(message.message_id ? message.message_id : message.default_id) && 'selected'} key={message.name} value={message.message_id ? message.message_id : message.default_id}>{message.name}</option> // using message.name as key because this would always be unique
      );
    });
  }

  renderSystemMessages() {
    return this.props.systemMessages.map((message) => {
      return (
        <option selected={parseInt(this.state.status.custom_message_template) === parseInt(message.message_id ? message.message_id : message.default_id) && 'selected'} key={message.name} value={message.message_id ? message.message_id : message.default_id}>{message.name}</option> // using message.name as key because this would always be unique
      );
    });
  }

  onHide(){
      this.setState({
        showDialog:false
      });
  }

  isSetstate(){
      this.setState({showDialog:true});
  }

  render() {
    const { connectDragSource, connectDropTarget } = this.props;
    return (connectDragSource(connectDropTarget(
      <div>
        <div onClick={ () => this.toggleStatusEditing() } className={styles.statusWrapper}>
          <div className={styles.iconContainer}>
            <FontAwesomeIcon icon={faBars} className={styles['dragIcon']} />
          </div>
          <Col md={10} sm={9} xs={9}>
            <div className={styles.colorBar} style={ { background:this.state.status.color } }></div>
            <div className={styles.statusInfoWrapper}>
              <h2 className={styles.statusTitle}>{this.state.status.title}</h2>
              <p className={styles.statusDescription}>{this.state.status.description}</p>
            </div>
          </Col>
          <Col md={2} sm={3} xs={3} className={styles.switchContainer}>
            {this.state.status.type_id !== 1004 && <span><a onClick={(e) => this.removeStatus(e)} className={styles.deleteBtn}>&#10006;</a></span>}
            <span className={styles.toggleIcon}>{this.state.enabled ? <FontAwesomeIcon icon={faCaretUp} /> : <FontAwesomeIcon icon={faCaretDown} />}</span>
          </Col>
        </div>

        {this.state.enabled &&
        <div className={cx(styles.statusOptionsWrapper)}>
          <Grid>
            <FormGroup className={styles.optionsGroup} controlId="formInlineName">
              <Col lg={4} md={6} sm={12} xs={12}>
                <ControlLabel>Status Title</ControlLabel>
              </Col>
              <Col lg={8} md={6} sm={12} xs={12}>
                <FormControl type="text" onChange={this.changeHandler} name="title" value={this.state.status.title} />
              </Col>
            </FormGroup>
            <FormGroup className={styles.optionsGroup} controlId="formInlineName">
              <Col lg={4} md={6} sm={12} xs={12}>
                <ControlLabel>Status Description</ControlLabel>
              </Col>
              <Col lg={8} md={6} sm={12} xs={12}>
                <FormControl type="text" name="description" value={this.state.status.description} onChange={this.changeHandler} />
              </Col>
            </FormGroup>
            <FormGroup className={styles.optionsGroup} controlId="formInlineName">
              <Col lg={4} md={6} sm={12} xs={12}>
                <ControlLabel>Status Type</ControlLabel>
              </Col>
              <Col lg={8} md={6} sm={12} xs={12}>
                <FormControl disabled type="text" value={this.state.status.type} />
              </Col>
            </FormGroup>
            <FormGroup className={styles.optionsGroup} controlId="formInlineName">
              <Col lg={4} md={6} sm={12} xs={12}>
                <ControlLabel>Customer Message</ControlLabel>
              </Col>
              <Col lg={8} md={6} sm={12} xs={12}>
                <FormControl name="custom_message_template" onChange={this.changeHandler} componentClass="select" placeholder="select">
                  <option value="" selected disabled hidden>Select a message</option>
                  <option value="NULL" selected={this.state.status.custom_message_template === 1111 && 'selected'}>NO MESSAGE</option>
                  <optgroup label="Default Messages">
                    {this.renderSystemMessages()}
                  </optgroup>
                  <optgroup label="Custom Messages">
                    {this.renderCustomMessages()}
                  </optgroup>
                </FormControl>
              </Col>
            </FormGroup>
            <FormGroup className={cx(styles.optionsGroup, styles.colorField)}>
              <Col md={12} sm={12} xs={12} className={styles.colorFieldCol}>
                <FormControl
                  componentClass={ColorField}
                  value={this.state.status.color || ''}
                  onChange={this.onColorChange}
                  ref="color"
                  name="color"
                />
              </Col>
            </FormGroup>
            <Row className={styles.checkboxOptions}>
              <Col lg={6} md={12} sm={12} xs={12}>
                <FormGroup className={styles.checkboxOptionGroup} controlId="formInlineSignature">
                  <Checkbox checked={this.state.status.require_signature} name="require_signature" onChange={this.changeHandler}>Require Signature</Checkbox>
                </FormGroup>
              </Col>
              <Col lg={6} md={12} sm={12} xs={12}>
                <FormGroup className={styles.checkboxOptionGroup} controlId="formInlineRequireConfirmation">
                  <Checkbox checked={this.state.status.require_confirmation} name="require_confirmation" onChange={this.changeHandler}>Confirm Status before posting</Checkbox>
                </FormGroup>
              </Col>
            </Row>
            <Col lg={6} md={12} sm={12} xs={12}>
              <FormGroup className={styles.checkboxOptionGroup} controlId="formInlineEstimate">
                <Checkbox className={(this.state.status.type === 'PREPARING' || this.state.status.type === 'EXTRA_TIME') ? styles.disabledClass : ''} disabled={this.state.status.type === 'PREPARING' || this.state.status.type === 'EXTRA_TIME' ? true : false} checked={this.state.status.require_estimate} name="require_estimate" onChange={this.changeHandler}>Require Estimate</Checkbox>
              </FormGroup>
            </Col>
            <Col lg={6} md={12} sm={12} xs={12}>
              <FormGroup className={styles.checkboxOptionGroup} controlId="formInlineVisibleToCustomer">
                <Checkbox checked={this.state.status.visible_to_customer} name="visible_to_customer" onChange={this.changeHandler}>Visible to Customer</Checkbox>
              </FormGroup>
            </Col>
            <Col lg={6} md={12} sm={12} xs={12}>
              <FormGroup className={styles.checkboxOptionGroup} controlId="formInlineRequireNotes">
                <Checkbox checked={this.state.status.require_notes} name="require_notes" onChange={this.changeHandler}>Require Note</Checkbox>
              </FormGroup>
            </Col>
            <Col lg={6} md={12} sm={12} xs={12}>
              <FormGroup className={styles.checkboxOptionGroup} controlId="formInlineRequireReason">
                <Checkbox checked={(this.state.status.type === 'EXCEPTION' || this.state.status.type === 'CANCELLED' || this.state.status.type === 'SKIP') ? this.state.status.require_reason : false}
                          name="require_reason" onChange={this.changeHandler} disabled={!(this.state.status.type === 'EXCEPTION' || this.state.status.type === 'CANCELLED' || this.state.status.type === 'SKIP')}
                          className={!(this.state.status.type === 'EXCEPTION' || this.state.status.type === 'CANCELLED' || this.state.status.type === 'SKIP') ? styles.disabledClass : ''}>Use exception list</Checkbox>
              </FormGroup>
            </Col>
            <Col md={12} sm={12} xs={12}>
              <Row>
                <Col md={12}>
                  <Row>
                    <FormGroup className={styles.checkboxOptionGroup} controlId="formInlinePrompt">
                      <Col lg={4} md={6} sm={12} xs={12}>
                        <Checkbox checked={this.state.inputPrompt} onChange={this.inputPromptChangeHandler}>Prompt Text</Checkbox>
                      </Col>
                      {this.state.inputPrompt &&
                      <Col lg={8} md={6} sm={12} xs={12}>
                        <FormControl type="text" onChange={this.changeHandler} name="input_prompt" value={this.state.status.input_prompt} />
                      </Col>
                      }
                    </FormGroup>
                  </Row>
                </Col>
              </Row>
            </Col>
            {this.state.status.type === 'ORDER' &&
              <Col lg={6} md={12} sm={12} xs={12}>
                <FormGroup className={styles.checkboxOptionGroup} controlId="formInlineRequireReason">
                  <Button className={cx('btn-submit', styles.transparentButton)} onClick={() => this.isSetstate()}>Exception List</Button>
                </FormGroup>
              </Col>
            }
            <OrderStatusExceptions
                showDialogBox = {this.state.showDialog}
                onHide = {this.onHide}
                getExceptionList = {this.exceptionListHandler}
                exceptions_list = {this.state.status.exceptions_list}
            />
          </Grid>
        </div>
        }
      </div>
    )));
  }
}

Status.propTypes = {
  statusData: PropTypes.object.isRequired,
  toggle: PropTypes.func,
  selected: PropTypes.number,
  activeStatuses: PropTypes.array,
  handleStatusUpdate: PropTypes.func,
  deleteStatus: PropTypes.func,
  customMessages: PropTypes.array,
  systemMessages: PropTypes.array
};
