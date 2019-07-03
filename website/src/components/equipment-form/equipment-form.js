import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { findDOMNode } from 'react-dom';
import {Button, FormControl, Row, Col, FormGroup} from 'react-bootstrap';
import SavingSpinner from '../saving-spinner/saving-spinner';
import styles from './equipment-form.module.scss';

export default class EquipmentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      group_id: '-1',
    };
    this.createEquipment = this.createEquipment.bind(this);
    this.renderGroups = this.renderGroups.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // Means there was an active entity creation call that completed
    if (this.props.sendingEquipment && !nextProps.sendingEquipment && nextProps.equipmentAdded) {
      $(findDOMNode(this.refs.name)).val('');
      $(findDOMNode(this.refs.type)).val('');
    }
  }

  renderGroups() {
    const renderedGroups = this.props.groups &&  this.props.groups.map((group) => {
      if (group.is_disabled) {
        return null;
      }
      return (
        <option value={group.is_implicit ? '' : group.id} selected={this.state.group_id ? (group.id === this.state.group_id) : group.is_implicit}>{group.name}</option>
      );
    });
    return renderedGroups;
  }

  handleGroupChange(e) {
    const value = e.target.value;

    this.setState({
      group_id: value
    });
  }

  createEquipment(e, hasGroups) {
    e.preventDefault();
    e.stopPropagation();

    const name = findDOMNode(this.refs.name).value.trim();
    const type = findDOMNode(this.refs.type).value.trim();
    let group_id = this.state.group_id;
    if (!this.props.canAddGroup && this.props.profile && this.props.profile.group_id) {
      group_id = this.props.profile.group_id;
    }
    if (group_id === '-1' && !hasGroups) {
      group_id = '';
    }

    this.props.createEquipment({ name, type, group_id });
  }

  render() {
    let showGroupDropdown = false;
    if (this.props.groups && (this.props.groups.find((group) => { return group.is_implicit; })) && this.props.groups.length > 1) {
      showGroupDropdown = true;
    } else if (this.props.groups && !(this.props.groups.find((group) => { return group.is_implicit; })) && this.props.groups.length > 0) {
      showGroupDropdown = true;
    }

    return (
      <form className="form-inline" onSubmit={(e) => this.createEquipment(e, showGroupDropdown)}>
        <Row>
          <Col md={(this.props.canAddGroup && showGroupDropdown) ? 3 : 4} sm={(this.props.canAddGroup && showGroupDropdown) ? 3 : 4}>
            <FormControl className={styles['form-input-control']} id="name" type="text" placeholder="Name" ref="name"/>
          </Col>
          <Col md={(this.props.canAddGroup && showGroupDropdown) ? 3 : 4} sm={(this.props.canAddGroup && showGroupDropdown) ? 3 : 4}>
            <FormControl className={styles['form-input-control']} id="type" type="text" placeholder="Type" ref="type"/>
          </Col>
          {(this.props.canAddGroup && showGroupDropdown) &&
          <Col md={3} sm={3}>
            <FormGroup controlId="formControlsSelect" className={styles.groupsDropdown}>
              <FormControl onChange={(e) => this.handleGroupChange(e)} componentClass="select" placeholder="select" className={styles['form-input-control']}>
                <option value={-1}>Select a Group</option>
                {this.renderGroups()}
              </FormControl>
            </FormGroup>
          </Col>}
          <Col md={2} sm={2} className={styles.btnSubmit}>
            {this.props.sendingEquipment ?
              <SavingSpinner borderStyle="none" title="Saving" fontSize={14} />
            :
              <Button type="submit" className='btn-submit'>
                Add
              </Button>
            }
          </Col>
        </Row>
      </form>);
  }
}

EquipmentForm.propTypes = {
  createEquipment: PropTypes.func.isRequired,
  sendingEquipment: PropTypes.bool.isRequired,
  equipmentAdded: PropTypes.bool
};
