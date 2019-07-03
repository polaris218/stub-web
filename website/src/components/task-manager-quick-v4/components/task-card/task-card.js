import React, { Component } from 'react';
import styles from './task-card.module.scss';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faUser, faClock, faMapMarker, faCircle } from '@fortawesome/fontawesome-free-solid';
import moment from 'moment';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import $ from 'jquery';
import cx from 'classnames';
import { getStatusDetails } from '../../../../helpers/status_dict_lookup';

export default class TaskCard extends Component {
  constructor(props) {
    super(props);

    this.getTaskEntities = this.getTaskEntities.bind(this);
  }


  getTaskEntities() {
    const workerImageURL = 'images/worker-needed.svg';
    const taskEntities = this.props.task.entity_ids;
    const allEntities = this.props.entities;
    const entitiesToShow = this.props.task.additional_addresses && this.props.task.additional_addresses.length > 1 ? this.props.task.additional_addresses.length : 2;
    const renderEntities = [];

    if(this.props.task.hasOwnProperty('number_of_workers_required') && this.props.task.number_of_workers_required && this.props.task.number_of_workers_required > 0) {
      renderEntities.push(
        <OverlayTrigger placement="bottom" overlay={<Tooltip>{this.props.task.number_of_workers_required} worker(s) needed</Tooltip>}>
              <div key={'worker_needed'} className={styles.entityFace}>
                  <span className={styles.entityFacePlaceholder}><img style={{ borderColor: '#666666' }}
                    src={workerImageURL} alt={'Worker Needed'}/></span>
                <span className={styles.name}>{this.props.task.number_of_workers_required} needed</span>
              </div>
            </OverlayTrigger>
          );
    }
    if (taskEntities.length > 0) {
      let selectedEntities = [];
      taskEntities.map((en) => {
        const foundElIndex = allEntities && allEntities.findIndex((el) => {
          return el.id === en;
        });
        // here we cannot use simple foundEIndex as 0 will be valid entity
        if (typeof foundElIndex !== 'undefined' && foundElIndex !== -1) {
          selectedEntities.push(allEntities[foundElIndex]);
        } else {
          selectedEntities.push({
            name: 'Unknown',
            image_path: null,
            id: en
          });
        }
      });
      if (selectedEntities.length <= entitiesToShow) {
        selectedEntities.map((entity) => {
          let borderColor = '#666666';
          let toolTipMessage = 'Pending Response';
          const entityConfirmation = this.props.task.entity_confirmation_statuses;
          if (entityConfirmation && entityConfirmation.hasOwnProperty(entity.id) && entityConfirmation[entity.id].status === 'ACCEPTED') {
            borderColor = '#24ab95';
            toolTipMessage = 'Accepted';
          } else if (entityConfirmation && entityConfirmation.hasOwnProperty(entity.id) && entityConfirmation[entity.id].status === 'REJECTED') {
            borderColor = '#FF4E4C';
            toolTipMessage = 'Rejected';
          }
          const tooltip = (<Tooltip>{entity.name} <br/> {toolTipMessage}</Tooltip>);
          let entityName = entity.name;
          let stringParts = entityName.split(/\s+/);
          stringParts = [stringParts.shift(), stringParts.join(' ')];
          if (stringParts.length > 1 && stringParts[0] !== '' && stringParts[1] !== '') {
            entityName = stringParts[0][0] + stringParts[1][0];
          } else if (stringParts.length === 1 && stringParts[0] !== '') {
            entityName = stringParts[0][0];
          } else {
            entityName = entity.name[0];
          }
          renderEntities.push(
            <OverlayTrigger placement="bottom" overlay={tooltip}>
              <div key={entity.id} className={styles.entityFace}>
                {entity.image_path ?
                  <span style={{ borderColor: borderColor }} className={styles.entityFacePlaceholder}><img
                    src={entity.image_path} alt={entity.name}/></span> : <span style={{ borderColor: borderColor }}
                                                                               className={styles.entityFacePlaceholder}>{entityName}</span>}
                <span className={styles.name}>{entity.name}</span>
              </div>
            </OverlayTrigger>
          );
        });
      } else if (selectedEntities.length > entitiesToShow) {

        let tempSelectedEntitiesNames = $.extend(true, [], selectedEntities);
        tempSelectedEntitiesNames.splice(0, entitiesToShow);

        const tempSelectedEntities = $.extend(true, [], selectedEntities);
        tempSelectedEntities.splice(entitiesToShow);
        tempSelectedEntities.push({
          number: selectedEntities.length - entitiesToShow,
          name: selectedEntities.length - entitiesToShow + ' more',
          image_path: null,
          special_entity: true,
          toolTipName: (tempSelectedEntitiesNames.map((entity, index) => {
            return (<span>{entity.name} {index < (tempSelectedEntitiesNames.length - 1) && <br/>}</span>);
          })),
          id: -1
        });
        tempSelectedEntities.map((entity) => {
          let borderColor = '#666666';
          let toolTipMessage = 'Pending Response';
          const entityConfirmation = this.props.task.entity_confirmation_statuses;
          if (entityConfirmation && entityConfirmation.hasOwnProperty(entity.id) && entityConfirmation[entity.id].status === 'ACCEPTED') {
            borderColor = '#24ab95';
            toolTipMessage = 'Accepted';
          } else if (entityConfirmation && entityConfirmation.hasOwnProperty(entity.id) && entityConfirmation[entity.id].status === 'REJECTED') {
            borderColor = '#FF4E4C';
            toolTipMessage = 'Rejected';
          }
          const tooltip = (
            <Tooltip>{entity.toolTipName || entity.name} <br/> {!entity.special_entity && toolTipMessage}</Tooltip>);
          let entityName = entity.name;
          let stringParts = entityName.split(/\s+/);
          if (stringParts.length > 1 && stringParts[0] !== '' && stringParts[1] !== '') {
            entityName = stringParts[0][0] + stringParts[1][0];
          } else if (stringParts.length === 1 && stringParts[0] !== '') {
            entityName = stringParts[0][0];
          } else {
            entityName = entity.name[0];
          }
          renderEntities.push(
            <OverlayTrigger placement="bottom" overlay={tooltip}>
              <div key={entity.id} className={styles.entityFace}>
                {entity.image_path ?
                  <span style={{ borderColor: borderColor }} className={styles.entityFacePlaceholder}><img
                    src={entity.image_path}/></span> : <span style={{ borderColor: borderColor }}
                                                             className={styles.entityFacePlaceholder}>{entity.special_entity && '+'}{entity.special_entity ? entity.number : entityName}</span>}
                <span className={styles.name}>{entity.name}</span>
              </div>
            </OverlayTrigger>
          );
        });
      }
    } else {
      const tooltip = (<Tooltip>No team member assigned</Tooltip>);
      renderEntities.push(
        <OverlayTrigger placement="bottom" overlay={tooltip}>
          <div className={styles.entityFace}>
            <span className={styles.entityFacePlaceholder}>?</span>
          </div>
        </OverlayTrigger>
      );
    }

    return renderEntities;
  }

  render() {
    let taskColor = '#008bf8';
    if (this.props.task.extra_fields) {
      if (this.props.task.extra_fields.task_color) {
        taskColor = this.props.task.extra_fields.task_color;
      } else {
        taskColor = '#008bf8';
      }
    }
    let taskCardClass = this.props.taskRoute ? styles.secondary : '';
    let taskStatusColor = '#008bf8';
    const latestStatus = getStatusDetails(this.props.task.status);
    taskStatusColor = latestStatus.color ? latestStatus.color : '#008bf8';
    const entitiesToShow = this.props.task.additional_addresses ? this.props.task.additional_addresses.length + 2 : 2;
    const entitiesLength = this.props.task && this.props.task.entity_ids && this.props.task.entity_ids.length > entitiesToShow && <div className={styles.entityCount}>+{this.props.task.entity_ids.length - entitiesToShow}</div>;
    const lowResClass = entitiesLength ? styles.lowResClass : '';
    const tooltip = (<Tooltip>{this.props.task && this.props.task.title ? this.props.task.title : 'No title'}</Tooltip>);
    const duration = this.props.task.duration;
    let hours = parseInt(duration / 60);
    let mins = duration % 60;

    return (
      <div
        onClick={() => this.props.taskClick(this.props.task)}
        key={this.props.itemkey}
        className={cx(lowResClass, styles.taskCard, this.props.highlighted_task === this.props.task.id && styles.highlighted, taskCardClass)}
        onMouseEnter={() => {
          this.props.onTaskMouseOver(this.props.task.id);
        }}
        onMouseLeave={() => {
          this.props.onTaskMouseOut();
        }}
      >
        {/*<div onClick={() => this.props.taskClick(this.props.task)} key={this.props.itemkey} className={styles.taskCard}>*/}
        <span style={{ background: taskColor }} className={styles.taskColorBar} />
        <div className={styles.taskDetails}>
          <div className={styles.taskTitle}>
            {this.props.taskRoute ?
              <span className={styles.count} style={{
                background: taskColor,
                color: (taskColor === '#000000' || taskColor === '#3e2723' || taskColor === '#263238' || taskColor === '#525252' || taskColor === '#5d4037' || taskColor === '#795548' || taskColor === '#455a64') ? 'white' : 'black'
              }}>{this.props.itemkey + 1}</span>
              :
              <span className={styles.icon}>
							<img src="/images/icons/label.png" alt="Task"/>
						</span>
            }
            <OverlayTrigger placement="top" overlay={tooltip}>
							<span className={styles.taskTitleMask}>
								{this.props.task.title ? this.props.task.title :
                                  <span className={styles.noInfo}>No title</span>}
							</span>
            </OverlayTrigger>
          </div>
          <div className={styles.taskCustomerName}>
						<span className={styles.icon}>
							<FontAwesomeIcon icon={faUser}/>
						</span>
            {this.props.task.customer_first_name && this.props.task.customer_last_name ? (this.props.task.customer_first_name + ' ' + this.props.task.customer_last_name) : this.props.task.customer_first_name ? this.props.task.customer_first_name : this.props.task.customer_last_name ? this.props.task.customer_last_name :
              <span className={styles.noInfo}>No Customer</span>}
          </div>
        </div>
        <div className={styles.taskTimeAndAddress}>
          <div className={styles.taskTime}>
						<span className={styles.icon}>
							<FontAwesomeIcon icon={faClock}/>
						</span>
            {this.props.task.enable_time_window_display === true ? moment.utc(this.props.task.start_datetime).local().format('hh:mm A') + (duration && ', ' + ((hours ? (hours + ' hrs ') : '') + (mins ? (mins + ' mins') : ''))) :
              moment.utc(this.props.task.start_datetime).local().format('hh:mm A') +
              (this.props.task.end_datetime ? (' - ' + moment.utc(this.props.task.end_datetime).local().format('hh:mm A')) : '')
            }
          </div>
          {this.props.task.enable_time_window_display &&  <div className={styles.taskTime}>
            <span className={styles.icon}>
							<FontAwesomeIcon icon={faClock}/>
						</span>
            Arrival Window: {moment.utc(this.props.task.start_datetime).local().format('hh:mm A')} - {moment.utc(this.props.task.start_datetime).add(this.props.task.time_window_start, 'minutes').local().format('hh:mm A')}
          </div>}
          <div className={styles.taskAddress}>
						<span className={styles.icon}>
							<FontAwesomeIcon icon={faMapMarker}/>
						</span>
            {this.props.task.customer_address
              ?
              <OverlayTrigger overlay={(<Tooltip>{this.props.task.customer_address}</Tooltip>)} placement="bottom">
                <span>{this.props.task.customer_address}</span>
              </OverlayTrigger>
              :
              <span className={styles.noInfo}>Address not available</span>
            }
          </div>
          {this.props.task.additional_addresses && this.props.task.additional_addresses.map((address, index) => {
            return (<div className={styles.taskAddress}>
						<span className={styles.icon}>
							<FontAwesomeIcon icon={faMapMarker}/>
							<span className={styles.additionalAddressNumber}>{index + 2}</span>
						</span>
              {address.complete_address
                ?
                <OverlayTrigger overlay={(<Tooltip>{address.complete_address}</Tooltip>)} placement="bottom">
                  <span>{address.complete_address}</span>
                </OverlayTrigger>
                :
                <span className={styles.noInfo}>Address not available</span>
              }
            </div>);
          })}
        </div>
        {this.props.showEntities &&
        <div className={styles.taskEntities}>
          {this.getTaskEntities()}
          {/*{entitiesLength}*/}
        </div>
        }
        {(this.props.task.status_title || this.props.task.status) &&
        <div className={cx(styles.taskStatus, !this.props.showEntities && styles.taskStatusFullWidth)}>
						<span className={styles.statusString} style={{ color: taskStatusColor }}>
							<FontAwesomeIcon icon={faCircle}/>
                          {this.props.task.status_title || this.props.task.status}
						</span>
        </div>
        }
      </div>
    );
  }

}
