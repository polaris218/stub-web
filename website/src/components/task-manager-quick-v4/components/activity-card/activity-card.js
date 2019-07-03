import React, { Component } from 'react';
import styles from './activity-card.module.scss';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {
  faUser,
  faCircle,
  faClock,
} from '@fortawesome/fontawesome-free-solid';
import moment from 'moment';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import $ from 'jquery';
import cx from 'classnames';
import { getStatusDetails } from '../../../../helpers/status_dict_lookup';
import {activityTypes} from "../../../../helpers/activity-types-icons";

export default class ActivityCard extends Component {
  constructor(props) {
    super(props);

    this.getActivityEntities = this.getActivityEntities.bind(this);
  }


  getActivityEntities() {
    if (!this.props.activity.entity_ids || this.props.activity.entity_ids.length === 0) {
      return <span className={cx(styles.noInfo, styles.name)}>No Assignees</span>;
    }
    const activityEntities = this.props.activity.entity_ids;
    const allEntities = this.props.entities;
    const entitiesToShow = 2;
    if (activityEntities.length > 0) {
      let selectedEntities = [];
      activityEntities.map((en) => {
        const foundElIndex = allEntities && allEntities.findIndex((el) => {
          return el.id === en;
        });
        // here we cannot use simple foundEIndex as 0 will be valid entity
        if (typeof foundElIndex !== 'undefined' && foundElIndex !== -1) {
          selectedEntities.push(allEntities[foundElIndex]);
        } else {
          selectedEntities.push({
            name: 'Unknown',
            id: en
          });
        }
      });
      const renderedEntities = selectedEntities.map((entity, id) => {
         const tooltip = (<Tooltip>{selectedEntities.map((entity, i)=>(<span>{entity.name + (selectedEntities.length - 1 > i ? ',' : '')}</span>))}</Tooltip>);
       return (
            <OverlayTrigger placement="bottom" overlay={tooltip}>
                <strong><span key={entity.id} className={styles.name}>{entity.name}{id === selectedEntities.length-1 ? '' : ','}</span></strong>
            </OverlayTrigger>
          );
        });
       return renderedEntities;

    }else {
      return (
       <div></div>
      );
    }
  }

  render() {
    let taskCardClass = this.props.taskRoute ? styles.secondary : '';
    let taskStatusColor = '#008bf8';
    const latestStatus = getStatusDetails(this.props.activity.status);
    taskStatusColor = latestStatus.color ? latestStatus.color : '#008bf8';
    const entitiesToShow = 2;
    const entitiesLength = this.props.activity && this.props.activity.entity_ids && this.props.activity.entity_ids.length > entitiesToShow &&
      <div className={styles.entityCount}>+{this.props.activity.entity_ids.length - entitiesToShow}</div>;
    const lowResClass = entitiesLength ? styles.lowResClass : '';
    const tooltip = (
      <Tooltip>{this.props.activity && this.props.activity.title ? this.props.activity.title : 'No title'}</Tooltip>);
    const iconTooltip = (
      <Tooltip>{this.props.activity && this.props.activity.details ? this.props.activity.details.substring(0, 100) + (this.props.activity.details.length > 100 ? '...' : '') : 'Notes not found'}</Tooltip>);
    return (
      <div
        onClick={() => this.props.activityClick(this.props.activity)}
        key={this.props.itemkey}
        className={cx(lowResClass, styles.activityCard, this.props.highlighted_task === this.props.activity.id && styles.highlighted, taskCardClass)}
        onMouseEnter={() => {
          this.props.onTaskMouseOver(this.props.activity.id);
        }}
        onMouseLeave={() => {
          this.props.onTaskMouseOut();
        }}
      >
        {/*<div onClick={() => this.props.taskClick(this.props.task)} key={this.props.itemkey} className={styles.taskCard}>*/}
        <OverlayTrigger placement="top" overlay={iconTooltip}>
          <span className={styles.activityIcon}>{this.props.activity.activity_type ? activityTypes.find((activity)=> activity.type === this.props.activity.activity_type) && activityTypes.find((activity)=> activity.type === this.props.activity.activity_type).icon : activityTypes[0].icon}</span>
        </OverlayTrigger>
        <div className={styles.taskDetails}>
          <div className={styles.taskTitle}>
            <OverlayTrigger placement="top" overlay={tooltip}>
							<span className={styles.taskTitleMask}>
								{this.props.activity.title ? this.props.activity.title :
                                  <span className={styles.noInfo}>No title</span>}
							</span>
            </OverlayTrigger>
          </div>

        </div>
        <div className={styles.taskTimeAndAddress}>
          <div className={styles.taskTime}>
						<span className={styles.icon}>
							<FontAwesomeIcon icon={faClock}/>
						</span>
            {this.props.activity.all_day ? "All Day" : moment.utc(this.props.activity.start_datetime).local().format('hh:mm A')}
          </div>
        </div>
        <div className={styles.taskDetails}>
        <div className={styles.taskCustomerName}>
						<span className={styles.icon}>
							<FontAwesomeIcon icon={faUser}/>
						</span>
            {this.props.activity && ((this.props.activity.customer_first_name && this.props.activity.customer_last_name ? this.props.activity.customer_first_name + ' ' + this.props.activity.customer_last_name : (this.props.activity.customer_first_name  ? this.props.activity.customer_first_name : (this.props.activity.customer_last_name ? this.props.activity.customer_last_name :  <span className={styles.noInfo}>No Customer</span>))))}
          </div>
        </div>
        {this.props.showEntities &&
        <div className={styles.taskEntities}>
          {this.getActivityEntities()}
          {/*{entitiesLength}*/}
        </div>
        }
        {(this.props.activity.status_title || this.props.activity.status) &&
        <div className={cx(styles.taskStatus, !this.props.showEntities && styles.taskStatusFullWidth)}>
						<span className={styles.statusString} style={{ color: taskStatusColor }}>
							<FontAwesomeIcon icon={faCircle}/>
                          {this.props.activity.status_title || this.props.activity.status}
						</span>
        </div>
        }
      </div>
    );
  }

}
