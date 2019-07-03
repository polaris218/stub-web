import React, { Component } from 'react';
import styles from './group-team.module.scss';
import { Grid, Row, Col, Modal, FormControl, FormGroup, Alert } from 'react-bootstrap';
import cx from 'classnames';
import SavingSpinner from '../../../saving-spinner/saving-spinner';

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
        <option value={group.is_implicit ? '' : group.id}
                selected={(entity.group_id !== null && typeof entity.group_id !== 'undefined') ?
                  (group.id === entity.group_id) :
                  (entity.group_id === null) && group.is_implicit}
                disabled={disableGroupClass}
                className={disableGroupClass}>
          {group.name}
        </option>
      );
    });
    return renderedGroups;
  }

  closeModal() {
    this.setState({
      entities: [],
    })
    this.props.closeModal();
  }

  renderEntitiesWithGroups() {
    const renderedEntityGroups = this.props.groupEntities &&  this.props.groupEntities.map((entity) => {
      return (
        <Row>
          <Col sm={6} className={styles.entityName}>
            {entity.name}
          </Col>
          <Col sm={6}>
            <FormGroup controlId="formControlsSelect">
              <FormControl onChange={(e) => this.handleGroupChange(e, entity)}
                           componentClass="select" placeholder="select">
                {this.renderGroups(entity)}
              </FormControl>
            </FormGroup>
          </Col>
        </Row>
      );
    });
    return renderedEntityGroups;
  }

  render() {
    return (
      <div className={styles.groupsFormContainer}>
        <Modal dialogClassName={styles.CMEditModal} show={this.props.showModal} onHide={this.closeModal}>
          <Modal.Header closeButton className={styles.CMEditModalHeader}>
            <h2 className={styles.messageTitle}>
              Update Team Members Group
            </h2>
          </Modal.Header>
          <Modal.Body className={styles.CMEditModalBody}>
            <Grid>
              {this.props.error &&
                <Row>
                  <Col sm={12}>
                    <Alert bsStyle={this.props.error.style}>
                      {this.props.error.message}
                    </Alert>
                  </Col>
                </Row>
                }
              {this.renderEntitiesWithGroups()}
            </Grid>
          </Modal.Body>
          <Modal.Footer className={styles.CMEditModalFooter}>
            <button className={cx(['btn-submit'], styles.saveBtn)} onClick={this.updateEntities}>
              {this.state.serverActionIsPending &&
              <SavingSpinner borderStyle="none" title='' />
              }
              {!this.state.serverActionIsPending &&
              <span>Save Changes</span>
              }
            </button>
            <button onClick={this.closeModal} className={cx(styles.transparentBtn, ['btn-submit'])}>Close</button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
