import React, { Component } from 'react';
import styles from './team-equipment-form.module.scss';
import { Grid, Row, Col, Modal, FormControl, FormGroup, Alert } from 'react-bootstrap';
import { FieldGroup } from '../fields';
import cx from 'classnames';
import SavingSpinner from '../saving-spinner/saving-spinner';
import CrewSelectorV2 from "../crew-selector/crew-selector";
import { bulkUpdateTasksEntities } from '../../actions'
import {getErrorMessage} from "../../helpers/task";

export default class TeamEquipmentForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      serverActionIsPending: false,
      entities: [],
      equipments: [],
      resource_ids: [],
      entity_ids: [],
      alerts: [],
    };

    this.closeModal = this.closeModal.bind(this)
    this.updateEntities = this.updateEntities.bind(this);
    this.onEntitiesChange = this.onEntitiesChange.bind(this);
    this.onEquipmentsChange = this.onEquipmentsChange.bind(this);
    this.removeAlert = this.removeAlert.bind(this);
  }

  onEntitiesChange(entity_ids) {
    this.setState({
      entity_ids
    });
  }

  removeAlert() {
    if (!this.state.alerts) {
      return;
    }
    const alerts = this.state.alerts;
    alerts.splice(0, 1);
    this.setState({
      alerts
    });
  }

  onEquipmentsChange(equipment_ids) {
    this.setState({
      equipment_ids
    });
  }

  updateEntities() {
    this.setState({
      serverActionIsPending: true
    });
    const task_ids = this.props.task_ids.toString();
    const entity_ids = (this.state.entity_ids && this.state.entity_ids.toString()) || null;
    const resource_ids = (this.state.resource_ids && this.state.resource_ids.toString()) || null;
    const data = {
      task_ids
    };
    if (entity_ids) {
      data['entity_ids'] = entity_ids;
    }
    if (resource_ids) {
      data['resource_ids'] = resource_ids;
    }

    data['manipulate_route'] = true;

    bulkUpdateTasksEntities(data).then(() => {
      this.closeModal(true);
    }).catch((err) => {
      const error = getErrorMessage(JSON.parse(err.responseText));
      const alert = {
        type: 'danger',
        message: error
      };
      const alerts = this.state.alerts;
      alerts.push(alert);
      this.setState({
        serverActionIsPending: false,
        alerts
      }, () => {
        setTimeout(this.removeAlert, 8e3);
      });
    });
  }

  closeModal(removeTaskIds = false) {
    this.setState({
      resource_ids: [],
      entity_ids: [],
      serverActionIsPending: false,
      alerts: []
    });
    this.props.closeModal(removeTaskIds);
  }

  render() {
    const crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756">
      <g transform="translate(-1270.486 -30.485)">
        <path
          d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z"
          transform="translate(4126.197 -40.804)" fill="#8d959f"/>
      </g>
    </svg>;
    return (
      <div>
        <Modal dialogClassName={styles.modalPrimary} show={this.props.showModal} onHide={this.closeModal} keyboard={false} backdrop={'static'}>
          <Modal.Header className={styles.modalHeader}>
            <Modal.Title className={styles.modalTitle}>Assign Team & Equipment</Modal.Title>
            <i className={styles.closeIcon} onClick={this.closeModal}>{crossIcon}</i>
          </Modal.Header>
          <Modal.Body className={styles.modalBody}>
            {this.state.alerts && this.state.alerts.map((alert) => {
              return <Alert bsStyle={alert.type} className={styles.alert}>{alert.message}</Alert>
            })}
            <div className={styles.box}>
              <h3 className={styles.boxTitle}>{this.props.task_ids && this.props.task_ids.length} Tasks selected</h3>
              <p><strong>Note:</strong> Assignments made will overwrite any existing Team/Equipment selected in these tasks.</p>
              <div className={styles.boxBody}>
                <div className={styles.boxBodyInner}>
                  <FieldGroup
                    label="Assignee(s)"
                    ref="crewSelector"
                    name="crew-selector"
                    updateEntities={this.onEntitiesChange}
                    componentClass={CrewSelectorV2}
                    allEntities={this.props.entities}
                    entities={this.state.entity_ids}
                    placeholder={this.props.showEntitiesWarning ? "Some Team already assigned to some selected tasks" : "Assign team member"}
                    unscheduled={true}
                    elId={Math.random().toString(36).substr(2, 16)}
                    placeholderImage={'/images/user-default.svg'}
                    canEdit
                  />
                </div>
                <div className={styles.boxBodyInner}>
                  <FieldGroup
                    label="Equipment(s)"
                    ref="equipmentSelector"
                    name="equipment-selector"
                    updateEntities={this.onEquipmentsChange}
                    componentClass={CrewSelectorV2}
                    allEntities={this.props.equipments}
                    entities={this.state.resource_ids}
                    placeholder={this.props.showEquipmentsWarning ? "Some Equipments already assigned to some selected tasks" : "Assign equipment"}
                    unscheduled={true}
                    elId={Math.random().toString(36).substr(2, 16)}
                    placeholderImage={'/images/user-default.svg'}
                    canEdit
                  />
                </div>
              </div>
            </div>
            <div className={'text-right'}>
              <button disabled={this.state.serverActionIsPending} className={cx(styles.btn, styles['btn-secondary'], styles['btn-lg'])} onClick={this.updateEntities}>
                {this.state.serverActionIsPending ? <SavingSpinner borderStyle="none" color="#fff" /> : 'Save Changes'}
              </button>
              <button onClick={this.closeModal} className={cx(styles.btn, styles['btn-light'])}>Close</button>
            </div>
            {this.props.routeData && <div className={cx(styles.externalInfo)}>
              {this.props.routeData.id && <div><strong>ID</strong> : {this.props.routeData.id}</div>}
              {this.props.routeData.external_id && <div><strong>External ID</strong> : {this.props.routeData.external_id}</div>}
            </div>}
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
