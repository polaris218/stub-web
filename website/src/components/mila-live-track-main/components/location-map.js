import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './location-map.module.scss';
import { LocationMapV2 } from '../../../components/live_index';
import moment from 'moment';
import { STATUS_META_DATA } from '../../../helpers/status_meta_data';
import {getCustomerName} from "../../../helpers/task";

export default class LocationMapContainer extends Component {
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
    const filteredData = [];
    let haveEntitiesLocation = false;

    if ((!entities || (entities.length === 0)) && (!task || !task.customer_exact_location)) {
      return this.getEmptyEntityText();
    }

    let customerCompleteAddress = '';
    if (this.props.task.customer_address_line_1 !== null && this.props.task.customer_address_line_1 !== '') {
      customerCompleteAddress += this.props.task.customer_address_line_1;
    }
    if (this.props.task.customer_address_line_2 !== null && this.props.task.customer_address_line_2 !== '') {
      customerCompleteAddress += ' ';
      customerCompleteAddress += this.props.task.customer_address_line_2;
    }
    if (this.props.lang !== 'EN' && ((this.props.task.customer_address_line_1 !== null && this.props.task.customer_address_line_1 !== '') || (this.props.task.customer_address_line_2 !== null && this.props.task.customer_address_line_2 !== '') ) ) {
      customerCompleteAddress += ',';
    }
    if (this.props.task.customer_city !== null && this.props.task.customer_city !== '' && this.props.lang === 'EN') {
      customerCompleteAddress += ' ';
      customerCompleteAddress += this.props.task.customer_city;
    } else if (this.props.task.customer_zipcode !== null && this.props.task.customer_zipcode !== '' && this.props.lang !== 'EN') {
      customerCompleteAddress += ' ';
      customerCompleteAddress += this.props.task.customer_zipcode;
    }
    if (this.props.task.customer_zipcode !== null && this.props.task.customer_zipcode !== '' && this.props.lang === 'EN') {
      customerCompleteAddress += ', ';
      customerCompleteAddress += this.props.task.customer_zipcode;
    } else if (this.props.task.customer_city !== null && this.props.task.customer_city !== '' && this.props.lang !== 'EN') {
      customerCompleteAddress += ', ';
      customerCompleteAddress += this.props.task.customer_city;
    }

    if (this.props.task.status === 'ENROUTE' || task.status === 'ARRIVING' || this.props.task.status === 'STARTED' || this.props.task.status === 'AUTO_START') {
      for (let i = 0; i < entities.length; i++) {
        if (entities[i].lastreading && entities[i].lastreading.task_id && entities[i].lastreading.task_id === this.props.task.id) {
          haveEntitiesLocation = true;
          filteredData.push({
            location : entities[i].lastreading,
            name     : entities[i].name,
            id       : entities[i].id,
            time     : entities[i].lastreading.time,
            image_path    : entities[i].image_path
          });
        }
      }
    }
    let location = null;
    let address = null;
    let name = getCustomerName(task.customer_first_name, task.customer_last_name);;

    const taskCurrentDestinationExactLocation = task.current_destination && task.current_destination.exact_location;
    const isCurrentDestinationAvailable = (taskCurrentDestinationExactLocation &&
      taskCurrentDestinationExactLocation.lat && taskCurrentDestinationExactLocation.lng) ? true : false;
    let currentDestination = false;
    if (isCurrentDestinationAvailable) {
      location = taskCurrentDestinationExactLocation;
      address = task.current_destination.complete_address;
      currentDestination = true;
    } else if (task.customer_exact_location && task.customer_exact_location.lat && task.customer_exact_location.lng)
    if (task.customer_exact_location && task.customer_exact_location.lat) {
      location = task.customer_exact_location;
      address = task.customer_address;
      currentDestination = true;
    }

    const customerLocationWithEstimate = {
      'location': address,
      'estimate': this.props.estimate,
      'exact_location': location
    };

    let haveCustomerLocation = false;
    if (location) {
      haveCustomerLocation = true;
      filteredData.push({
        location : location,
        name     : name,
        address  : address,
        type     : 'customer',
        time     : task.start_datetime,
        destination: currentDestination,
      });
    }

    let showDirections = false;
    if (STATUS_META_DATA[task.status].showEntityDirectionsOnMap && haveEntitiesLocation && haveCustomerLocation) {
      showDirections = true;
    }


    let showEntityLocation = false;
    if (this.isInReportedRange() && STATUS_META_DATA[task.status].showEntityPinOnMap) {
      showEntityLocation = true;
    }

    const customerView = true;
    let mapHeight = 700;
    const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    if (screenWidth < 990) {
      mapHeight = (screenHeight * 0.80) > 700 ? 700 : screenHeight * 0.80;
    } else {
      mapHeight = screenHeight * 0.80;
    }

    return (
      <LocationMapV2 task={this.props.task} showLocation={showEntityLocation} estimate={this.props.estimate} entities={filteredData} showDirections={showDirections} customerView={customerView} height={mapHeight} theme="UBER" locationOverlay={customerLocationWithEstimate} showEstimateOverlay />
    );
  }

  render() {

    return (
      <div className={styles.liveStatusContainer}>
        <div className={styles.googleMapEmbed}>
          {this.renderEntitiesToShowOnMap()}
        </div>
      </div>
    );
  }
}

LocationMapContainer.propTypes = {
  status: PropTypes.object,
  entities: PropTypes.array,
  rating: PropTypes.array,
  task: PropTypes.object,
  task_url: PropTypes.string,
  refreshStatus: PropTypes.func,
  showOnlyDemo: PropTypes.bool,
  lang: PropTypes.string
};
