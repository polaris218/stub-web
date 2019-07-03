import React, { Component } from 'react';
import styles from './group-team.module.scss';
import { Modal, FormControl, FormGroup, ControlLabel, Alert } from 'react-bootstrap';
import cx from 'classnames';
import SavingSpinner from '../../../../../saving-spinner/saving-spinner';

export default class GroupsTeam extends Component {
  constructor(props) {
    super(props);

    this.state = {
      serverActionIsPending: false,
      entities: []
    };

    this.closeModal = this.closeModal.bind(this);
    this.renderGroups = this.renderGroups.bind(this);
    this.handleGroupChange = this.handleGroupChange.bind(this);
    this.renderEntitiesWithGroups = this.renderEntitiesWithGroups.bind(this);
    this.updateEntities = this.updateEntities.bind(this);

  }

  handleGroupChange(e, entity) {
    const value = e.target.value;
    const newEntity = $.extend(true, {}, entity);
    newEntity.group_id = value;
    const entities = this.state.entities;
    entities.push(newEntity);
    this.setState({
      entities
    });
  }

  updateEntities() {
    this.setState({
      serverActionIsPending: true
    });
    const promises = [];
    this.state.entities.length > 0 && this.state.entities.map((entity) => {
      promises.push(this.props.updateEntityOnServer(entity));
    });
    Promise.all(promises).then(() => {
      this.setState({
        serverActionIsPending: false,
      });
      this.props.closeModal();
    });
  }

  renderGroups(entity) {
    let disableGroupClass = '';
    const renderedGroups = this.props.groups &&  this.props.groups.map((group) => {
      if (group.id === entity.group_id) {
        disableGroupClass = styles.disableGroup;
      } else {
        disableGroupClass = '';
      }
      return (
        <option value={group.is_implicit ? '' : group.id} selected={(entity.group_id !== null && typeof entity.group_id !== 'undefined') ? (group.id === entity.group_id) : (entity.group_id === null) && group.is_implicit} disabled={disableGroupClass} className={disableGroupClass}>
          {group.name}
        </option>
      );
    });
    return renderedGroups;
  }

  closeModal() {
    this.setState({
      entities: [],
    });
    this.props.closeModal();
  }

  renderEntitiesWithGroups() {
    const renderedEntityGroups = this.props.groupEntities &&  this.props.groupEntities.map((entity) => {
      return (
        <FormGroup controlId="formControlsSelect">
          <ControlLabel className={cx(styles.entityName)}>{entity.name}</ControlLabel>
          <div className={cx(styles.selectBox)}>
            <FormControl onChange={(e) => this.handleGroupChange(e, entity)} componentClass="select" placeholder="select">
              {this.renderGroups(entity)}
            </FormControl>
          </div>
        </FormGroup>
      );
    });
    return renderedEntityGroups;
  }

  render() {
    const crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756"><g transform="translate(-1270.486 -30.485)"><path d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z" transform="translate(4126.197 -40.804)" fill="#8d959f"/></g></svg>;
    return (
      <Modal dialogClassName={styles.CMEditModal} show={this.props.showModal} keyboard={false} backdrop={'static'} onHide={this.closeModal}>
        <Modal.Header className={styles.CMEditModalHeader}>
          <h2 className={styles.messageTitle}>Update Team Members Group</h2>
          <i className={styles.closeIcon} onClick={this.closeModal}>{crossIcon}</i>
        </Modal.Header>
        <Modal.Body className={styles.CMEditModalBody}>
          {this.props.error && <Alert bsStyle={this.props.error.style}>{this.props.error.message}</Alert>}
          <div className={cx(styles.box)}>
            <div className={cx(styles.boxBody)}>
              <div className={cx(styles.boxBodyInner)}>
                {this.renderEntitiesWithGroups()}
              </div>
            </div>
          </div>
          <div className={cx(styles.buttonWrapper)}>
            <button onClick={this.closeModal} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
            <button className={cx(styles.btn, styles['btn-secondary'])} onClick={this.updateEntities} disabled={this.state.serverActionIsPending}>{this.state.serverActionIsPending ? <SavingSpinner size={8} borderStyle="none" /> : 'Save Changes'}</button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
