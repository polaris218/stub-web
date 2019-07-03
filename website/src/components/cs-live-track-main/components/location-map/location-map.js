import React, { Component } from 'react';
import styles from './location-map.module.scss';
import { STATUS_META_DATA } from '../../../../helpers/status_meta_data';
import moment from 'moment';
import { LocationMapV2 } from '../../../../components/live_index';
import { getCustomerName } from '../../../../helpers/task';

export default class LocationMap extends Component {
  constructor(props) {
    super(props);

    this.renderEntitiesToShowOnMap = this.renderEntitiesToShowOnMap.bind(this);
    this.isInReportedRange = this.isInReportedRange.bind(this);
  }

  getEmptyEntityText() {
    return <div className={styles['no-info']}>Location information not available</div>;
  }

  isInReportedRange() {
    const statusList = this.props.status.statusList;
    let isInRange = false;
    statusList.forEach((status) => {
      if (this.props.task.status === status.type && (status.type === 'ENROUTE' || status.type === 'STARTED' || status.type === 'ARRIVING' || status.type === 'AUTO_START')) {
        const momentObject = moment.utc(status.time);
        const duration = moment.duration(moment().diff(momentObject));
        isInRange = duration.asHours() < 1;
      }
    });
    return isInRange;
  }

  renderEntitiesToShowOnMap() {
    const { task, entities } = this.props;
    let haveEntitiesLocation = false;

    if (!task || !task.customer_exact_location && !task.additional_addresses) {

      return this.getEmptyEntityText();
    }


    const filteredData = [];

    if (task.status === 'ENROUTE' || task.status === 'ARRIVING' || task.status === 'STARTED' || task.status === 'AUTO_START') {
      for (let i = 0; i < entities.length; i++) {
        if (entities[i].lastreading) {
          haveEntitiesLocation = true;
          filteredData.push({
            location : entities[i].lastreading,
            name     : entities[i].name,
            id       : entities[i].id,
            time     : entities[i].lastreading.time,
            image_path: entities[i].image_path,
          });
        }
      }
    }
    let haveDestinationLocation = false;
    let location = null;
    let name = null;
    let address = null;
    let currentDestinationMarked = false;
    const taskCurrentDestinationExactLocation = task.current_destination && task.current_destination.exact_location;
    const isCurrentDestinationAvailable = (taskCurrentDestinationExactLocation &&
      taskCurrentDestinationExactLocation.lat && taskCurrentDestinationExactLocation.lng) ? true : false;
    let currentDestination = false;
    if (task.customer_exact_location && task.customer_exact_location.lat) {
      location = task.customer_exact_location;
      name = getCustomerName(task.customer_first_name, task.customer_last_name);
      address = task.customer_address;
      if (!isCurrentDestinationAvailable) {
        currentDestination = true;
        currentDestinationMarked = true;
      }
      else if (location.lat === taskCurrentDestinationExactLocation.lat &&
        location.lng === taskCurrentDestinationExactLocation.lng && address === task.current_destination.complete_address) {
        currentDestination = true;
        currentDestinationMarked = true;
      }
    }
    if (location) {
      haveDestinationLocation = true;
      filteredData.push({
        location : location,
        name     : name,
        address  : address,
        type     : 'customer',
        time     : task.start_datetime,
        scheduled: task.unscheduled === true ? false : true,
        color    : task.extra_fields && task.extra_fields.task_color ? task.extra_fields.task_color : '#0693e3',
        destination: currentDestination,
      });
    }

    if (task.additional_addresses && task.additional_addresses.length > 0) {
      task.additional_addresses.map((additionalAddress) => {
        currentDestination = false;

        if (isCurrentDestinationAvailable && !currentDestinationMarked && additionalAddress.exact_location && additionalAddress.exact_location.lat === taskCurrentDestinationExactLocation.lat &&
          additionalAddress.exact_location.lng === taskCurrentDestinationExactLocation.lng && additionalAddress.complete_address === task.current_destination.complete_address) {
          currentDestination = true;
          currentDestinationMarked = true;
        }
        if (additionalAddress.exact_location) {
          filteredData.push({
            location: additionalAddress.exact_location,
            name: additionalAddress.title,
            address: additionalAddress.complete_address,
            type: 'customer',
            time: task.start_datetime,
            color: task.extra_fields && task.extra_fields.task_color ? task.extra_fields.task_color : '#0693e3',
            destination: currentDestination,
          });
        }
      });
    }

     if (filteredData.length <= 0) {
       return this.getEmptyEntityText();
     }

    let showDirections = false;
    if (STATUS_META_DATA[task.status].showEntityDirectionsOnMap && haveEntitiesLocation && haveDestinationLocation) {
      showDirections = true;
    }

    const customerView = true;
    return (
      <LocationMapV2 task={this.props.task} showLocation={STATUS_META_DATA[task.status].showEntityPinOnMap} estimate={ this.props.estimate } entities={filteredData} showDirections={showDirections} customerView={customerView} height= {this.props.mapHeight} hideInfoInitially showEstimateOverlay={true} />
    );
  }

  render() {
    return (
      <div className={!this.props.task.customer_exact_location? styles.noLiveStatusContainer : styles.liveStatusContainer }>
        <div className={styles.googleMapEmbed}>
          {this.renderEntitiesToShowOnMap()}
        </div>
      </div>
    );
  }

}
