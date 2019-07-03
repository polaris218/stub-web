import React, { Component } from 'react';
import styles from './locationmapv2.module.scss';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow, Polyline, DirectionsRenderer, OverlayView} from 'react-google-maps';
import MarkerWithLabel from "react-google-maps/lib/components/addons/MarkerWithLabel";
import GOOGLE_MAP_STYLES from '../../helpers/google_map_styles';
import UBER_GOOGLE_MAP_STYLES from '../../helpers/uber_google_map_styles';
import { getDefaultPolyLineColor, getCustomPolyLineColor } from '../../helpers/location_map'
import TimeAgo from 'react-timeago';
import moment from 'moment';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import polyline from "@mapbox/polyline/src/polyline";
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/fontawesome-free-regular';
import {faCaretDown} from "@fortawesome/fontawesome-free-solid/index";
import cx from "classnames";
import _ from 'lodash';
import $ from 'jquery';

const GoogleMapsWrapper = withGoogleMap(props => {
  return <GoogleMap {...props}>{props.children}</GoogleMap>
});

export default class LocationMapV2 extends Component {
  constructor(props, context) {
    super(props, context);


    this.state = {
      markers: [],
      onclickMarker: false,
      multipleRoutes: null,
      center: null
    };
  }

  componentWillReceiveProps(nextProps) {
      const data = this.convertEntityStructureToComponentState(nextProps.entities, nextProps.showDirections, nextProps.wayPoints, nextProps.highlightedTaskId);
      let entitiesRoutes = null;
      if (nextProps.entitiesRoutes) {
        entitiesRoutes = this.getDecodedEntitiesRoutes(nextProps.entitiesRoutes);
      }
      this.setState({
        ...data,
        entitiesRoutes
      });
  }

  componentDidMount() {
    const data = this.convertEntityStructureToComponentState(this.props.entities, this.props.showDirections, this.props.wayPoints, this.props.highlightedTaskId);
    let entitiesRoutes = null;
    if (this.props.entitiesRoutes) {
      entitiesRoutes = this.getDecodedEntitiesRoutes(this.props.entitiesRoutes);
    }

    this.setState({
      ...data,
      entitiesRoutes
    });

  }

  convertEntityStructureToComponentState(entities, showDirections = false, wayPoints, highlightedTask) {
    if (!entities || entities.length === 0) {
      // send seattle longitude and latitude and set markers as null
      const center = this.state.center || {
        lat: 47.602743,
        lng: -122.330626
      };

      return {
        center: center,
        markers: [],
        previousCenter: center
      };
    }

    const markers = [];
    let firstEntityReadings = null;
    let destinationPosition = null;
    let selectedEntityPosition = null;
    let showPathLine = true;

    let position = null;

    for (let i = 0; i < entities.length; i++) {
      if (entities[i].location) {
        if (!firstEntityReadings) {
          firstEntityReadings = {
            lat: entities[i].location.lat,
            lng: entities[i].location.lng
          };
        }

        let showLocation = true;

        if (entities[i].destination) {
          destinationPosition = i;
        } else if (entities[i].type !== 'customer') {
          if (this.isTimeInOnlineRange(entities[i].time)) {
            selectedEntityPosition = i;
          } else if (this.props.customerView) {
            showLocation = false;
            showPathLine = false;
          }
        }
        let markerPrevState = this.state.markers.find((marker) => {
          return marker.data && ((marker.data.id && marker.data.id === entities[i].id) ||
            (marker.data.address && marker.data.address === entities[i].address));
        });
        const showInfoWindow = (markerPrevState && markerPrevState.showInfo) || false;
        if (entities[i].location && typeof entities[i].location === 'object') {
          position = new google.maps.LatLng(entities[i].location.lat, entities[i].location.lng);
          if (showLocation && position) {
            markers.push({
              position: position,
              showInfo: showInfoWindow,
              data: {
                name: entities[i].name,
                address: entities[i].address,
                id: entities[i].id,
                routeId: entities[i].routeId,
                time: entities[i].time,
                color: entities[i].type === 'customer' ? entities[i].color : '#ccc',
                type: entities[i].type,
                image_path: entities[i].image_path,
                scheduled: entities[i].scheduled,
                is_company: entities[i].is_company,
	              scale: highlightedTask === entities[i].id ? 0.7 : 0.5,
                external_name: entities[i].external_name,
                speed: entities[i].speed,
                minuts: entities[i].minuts,
                last_location: entities[i].last_location ,
                vin: entities[i].vin ,
                fuel: entities[i].fuel ,
                odometer: entities[i].odometer ,
              }
            });
            position = null;
          }
        } else if (typeof entities[i].location === 'string') {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address:  entities[i].location}, (results, status) => {
            if (status == 'OK') {
              position = results[0].geometry.location;
              if (showLocation && position) {
                markers.push({
                  position: position,
                  showInfo: showInfoWindow,
                  data: {
                    name: entities[i].name,
                    address: entities[i].address,
                    id: entities[i].id,
                    routeId: entities[i].routeId,
                    time: entities[i].time,
                    color: entities[i].type === 'customer' ? entities[i].color : '#ccc',
                    type: entities[i].type,
                    image_path: entities[i].image_path,
                    scheduled: entities[i].scheduled,
                    is_company: entities[i].is_company,
	                  scale: highlightedTask === entities[i].id ? 0.7 : 0.5
                  }
                });
                position = null;
              }
            }
          });
        }
      }
    }
    //Optimize where we get previous location and don't call direction if it's the same
    if (showDirections && destinationPosition != null && selectedEntityPosition != null && showPathLine && !wayPoints) {
      const DirectionsService = new google.maps.DirectionsService();
      let currentDestination = entities[destinationPosition];
      if (currentDestination && currentDestination.location && currentDestination.location.lat && currentDestination.location.lng) {
        DirectionsService.route({
          origin: new google.maps.LatLng(entities[selectedEntityPosition].location.lat, entities[selectedEntityPosition].location.lng),
          destination: new google.maps.LatLng(currentDestination.location.lat, currentDestination.location.lng),
          travelMode: google.maps.TravelMode.DRIVING,
        }, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            this.setState({
              directions: result
            });
          }
        });
      }
    } else if (showDirections && wayPoints && (!_.isEqual(wayPoints, this.props.wayPoints) || this.props.updateMap)) {
      let multipleRoutes = this.state.multipleRoutes;
      if (multipleRoutes === null) {
        multipleRoutes = {};
      }
      for (let routeID in multipleRoutes){
        if (!wayPoints.hasOwnProperty(routeID)){
          delete multipleRoutes[routeID];
        }
      }
      for (let routeID in wayPoints) {
        let newWayPoints = wayPoints[routeID];
        const DirectionsService = new google.maps.DirectionsService();
        let origin = null;
        let destination = null;
        let wayPointForMap = [];
        let directions = null;
        const waypointLimit = 20;
        let routeColor = getDefaultPolyLineColor();
        if (newWayPoints) {
          routeColor = newWayPoints[0].routeColor;
        }
        let j = 0;
        for (; j < (newWayPoints.length) && Math.floor(newWayPoints.length / (j + waypointLimit)) > 0; j += waypointLimit) {
          wayPointForMap = [];
          if (typeof newWayPoints[j].location === 'object') {
            origin = new google.maps.LatLng(newWayPoints[j].location.lat, newWayPoints[j].location.lng);
          } else if (typeof newWayPoints[j].location === 'string') {
            origin = newWayPoints[j].location;
          }
          if (typeof newWayPoints[j + (waypointLimit - 1)].location === 'object') {
            destination = new google.maps.LatLng(newWayPoints[j + (waypointLimit - 1)].location.lat, newWayPoints[j + (waypointLimit - 1)].location.lng);
          } else if (typeof newWayPoints[j + (waypointLimit - 1)].location === 'string') {
            destination = newWayPoints[j + (waypointLimit - 1)].location;
          }
          for (let i = j + 1; i < (j + (waypointLimit - 1)); i++) {
            wayPointForMap.push({location: newWayPoints[i].location});
          }
          DirectionsService.route({
            origin,
            destination,
            travelMode: google.maps.TravelMode.DRIVING,
            waypoints: wayPointForMap,
          }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              if (directions === null) {
                directions = result;
                if ((j) === newWayPoints.length) {
                  let newResult = {'result': result, 'routeColor': routeColor};
                  multipleRoutes[routeID] = newResult;
                  this.setState({
                    multipleRoutes: multipleRoutes
                  });
                }
              } else {
                directions.routes[0].legs = directions.routes[0].legs.concat(result.routes[0].legs);
                directions.routes[0].overview_path = directions.routes[0].overview_path.concat(result.routes[0].overview_path);
                directions.routes[0].bounds = directions.routes[0].bounds.extend(result.routes[0].bounds.getNorthEast());
                directions.routes[0].bounds = directions.routes[0].bounds.extend(result.routes[0].bounds.getSouthWest());
                if ((j + waypointLimit) === newWayPoints.length) {
                  let newResult = {'result': directions, 'routeColor': routeColor};
                  multipleRoutes[routeID] = newResult;
                  this.setState({
                    multipleRoutes: multipleRoutes
                  });
                }
              }
            }
          });
        }
        if (Math.ceil(newWayPoints.length / (j + waypointLimit)) > 0 && j !== newWayPoints.length && newWayPoints.length > 1) {
          wayPointForMap = [];
          if (typeof newWayPoints[j].location === 'object') {
            origin = new google.maps.LatLng(newWayPoints[j].location.lat, newWayPoints[j].location.lng);
          } else if (typeof newWayPoints[j].location === 'string') {
            origin = newWayPoints[j].location;
          }
          if (typeof newWayPoints[newWayPoints.length - 1].location === 'object') {
            destination = new google.maps.LatLng(newWayPoints[newWayPoints.length - 1].location.lat, newWayPoints[newWayPoints.length - 1].location.lng);
          } else if (typeof newWayPoints[newWayPoints.length - 1].location === 'string') {
            destination = newWayPoints[newWayPoints.length - 1].location;
          }
          for (let i = j + 1; i < (newWayPoints.length - 1); i++) {
            wayPointForMap.push({location: newWayPoints[i].location});
          }
          DirectionsService.route({
            origin,
            destination,
            travelMode: google.maps.TravelMode.DRIVING,
            waypoints: wayPointForMap,
          }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              if (directions !== null) {
                directions.routes[0].legs = directions.routes[0].legs.concat(result.routes[0].legs);
                directions.routes[0].overview_path = directions.routes[0].overview_path.concat(result.routes[0].overview_path);
                directions.routes[0].bounds = directions.routes[0].bounds.extend(result.routes[0].bounds.getNorthEast());
                directions.routes[0].bounds = directions.routes[0].bounds.extend(result.routes[0].bounds.getSouthWest());
                let newResult = {'result': directions, 'routeColor': routeColor};
                multipleRoutes[routeID] = newResult;
                this.setState({
                  multipleRoutes: multipleRoutes
                });
              } else {
                let newResult = {'result': result, 'routeColor': routeColor};
                multipleRoutes[routeID] = newResult;
                this.setState({
                  multipleRoutes: multipleRoutes
                });
              }
            }
          });
        }
      }
    } else if (_.isEqual(wayPoints, this.props.wayPoints)) {

    } else {
      this.setState({
        multipleRoutes: null
      });
    }

    let previousCenter = this.state.previousCenter;
    if (!previousCenter) {
      previousCenter = firstEntityReadings;
    }

    const center = {
      lat: (this._googleMapComponent.state.map && this._googleMapComponent.state.map.center) ? this._googleMapComponent.state.map.center.lat() : ((firstEntityReadings && firstEntityReadings.lat) ? firstEntityReadings.lat : 47.602743),
      lng: (this._googleMapComponent.state.map && this._googleMapComponent.state.map.center) ? this._googleMapComponent.state.map.center.lng() : ((firstEntityReadings && firstEntityReadings.lng) ? firstEntityReadings.lng : -122.330626),
    };

    return {
      center: (firstEntityReadings && previousCenter && firstEntityReadings.lat === previousCenter.lat && firstEntityReadings.lng === previousCenter.lng) ? center : firstEntityReadings,
      previousCenter: firstEntityReadings,
      markers: markers
    };
  }

  getDecodedEntitiesRoutes(entitiesRoutes) {
    const decodedEntitiesRoutes = [];
    var coords, oneEntityDecodedRoute;

    for (let i = 0; i < entitiesRoutes.length; i++) {
      coords = polyline.decode(entitiesRoutes[i], 6);
      oneEntityDecodedRoute = [];
      for (let j = 0; j < coords.length; j++) {
        oneEntityDecodedRoute.push({lat: coords[j][0], lng: coords[j][1]});
      }
      decodedEntitiesRoutes.push(oneEntityDecodedRoute);
    }

    return decodedEntitiesRoutes;
  }

  handleMarkerClick(marker) {
    const markers = [...this.state.markers];
    const indexOfClickedMarker = markers.indexOf(marker);
    markers[indexOfClickedMarker].showInfo = !markers[indexOfClickedMarker].showInfo;
    this.setState({
      ...this.state,
      markers,
      onclickMarker: true
    });
  }

  handleMarkerClose(marker) {
    const markers = [...this.state.markers];
    const indexOfClickedMarker = markers.indexOf(marker);
    markers[indexOfClickedMarker].showInfo = false;
    this.setState({
      ...this.state,
      markers,
      onclickMarker: false
    });
  }

  isTimeInOnlineRange(time) {
    if (time && this.props.showLocation) {
      const momentObject = moment.utc(time);
      const duration = moment.duration(moment().diff(momentObject));
      return duration.asMinutes() < 10;
    }

    return false;
  }

  renderInfoWindow(ref, marker) {

    const momentObject = moment.utc(marker.data.time);
    const localMomentObject = momentObject.local();
    // const dateString = localMomentObject.format('MMM DD hh:mm a');

    let dateString = 'Scheduled at ' + moment.utc(marker.data.time).local().format('MMMM DD hh:mm A');

    if (!marker.data.time) {
      dateString = 'Not yet scheduled';
    }
    
    if (this.props.task && this.props.task.unscheduled) {
      if (this.props.task && this.props.task.start_datetime) {
        dateString = 'Scheduled at ' + moment.utc(marker.data.time).local().format('MMMM DD');
      } else {
        dateString = 'Not yet scheduled';
      }
    }

    if (this.props.task && this.props.task.enable_time_window_display) {
      const window_time = moment.utc(marker.data.time).local().add(this.props.task.time_window_start, 'minutes');
      dateString = 'Scheduled on ' + moment.utc(marker.data.time).local().format('MMMM DD hh:mm A') + '-' + window_time.format('hh:mm A');
    }

    let entityType = '';
    if (!this.props.customerView) {
      entityType = marker.data.type;
    }

    if (marker.data.type !== 'customer') {
      let lightColor = '#d6d6d6';
      if (this.isTimeInOnlineRange(marker.data.time) && momentObject - moment() < 0) {
        lightColor = '#91DC5A';
      }

      let image = "/images/user-default.svg";

      if (marker.data && marker.data.type === 'equipment') {
        image = "/images/equipment.png";
      }
      if (marker.data.image_path) {
        image = marker.data.image_path;
      }

      const light = (
        <svg version="1.1" id="Capa_1" x="0px" y="0px" width="12px" height="12px" viewBox="0 0 438.533 438.533"
             style={{marginLeft: '10px'}}>
          <g>
            <path
              d="M409.133,109.203c-19.608-33.592-46.205-60.189-79.798-79.796C295.736,9.801,259.058,0,219.273,0   c-39.781,0-76.47,9.801-110.063,29.407c-33.595,19.604-60.192,46.201-79.8,79.796C9.801,142.8,0,179.489,0,219.267   c0,39.78,9.804,76.463,29.407,110.062c19.607,33.592,46.204,60.189,79.799,79.798c33.597,19.605,70.283,29.407,110.063,29.407   s76.47-9.802,110.065-29.407c33.593-19.602,60.189-46.206,79.795-79.798c19.603-33.596,29.403-70.284,29.403-110.062   C438.533,179.485,428.732,142.795,409.133,109.203z"
              fill={lightColor}/>
          </g>
        </svg>);

      const tooltip = (
        <Tooltip id="tooltip">{dateString}</Tooltip>
      );

      return (
        <InfoWindow
          key={`${ref}_info_window`}
          ref={`${ref}_info_window_ref`}
          position={marker.position}
          onCloseClick={() => this.handleMarkerClose(marker)}>

        <div className={styles['map-marker']}>
            <div className={styles['member-info-wrapper']}>
              <div className={styles['member-icon']} style={{borderColor: lightColor}}><img src={image} className={styles.memberIMG}/></div>
              <div className={styles['member-info']}>
                <p className={styles['member-name']}>{marker.data.name} {light}</p>
                {marker.data.type !== 'equipment' &&
                  <OverlayTrigger placement="bottom" overlay={tooltip}>
                    <p className={styles['date']}>
                      {momentObject - moment() <= 0 && <TimeAgo date={localMomentObject.toISOString()}/>}
                      {momentObject - moment() > 0 && 'Not Available'}
                    </p>
                  </OverlayTrigger>
                }
                {entityType !== '' && entityType !== 'equipment' && <p>{entityType}</p>}
              </div>
            </div>
            {marker.data.external_name && <p>{'Samsara Name: ' + marker.data.external_name}</p>}
            {marker.data.last_location && <p>{'Last location: ' + marker.data.last_location}</p>}
            {marker.data.speed && <p> {'Speed: ' + marker.data.speed}</p>}
            {/*{*/}
              {/*marker.data.vin &&*/}
              {/*<p> {'VIN: ' + marker.data.vin}</p>*/}
            {/*}*/}
            {/*{*/}
              {/*marker.data.fuel &&*/}
              {/*<p> {'Fuel: ' + marker.data.fuel + ' %'}</p>*/}
            {/*}*/}
            {/*{*/}
              {/*marker.data.odometer &&*/}
              {/*<p> {'Odometer: ' + marker.data.odometer + ' mi'}</p>*/}
            {/*}*/}
            {marker.data.type === 'equipment' && <OverlayTrigger placement="bottom" overlay={tooltip}>
              <p className={styles['date']}>
                <div>Updated: <TimeAgo date={localMomentObject.toISOString()}/></div>
              </p>
            </OverlayTrigger>
            }
          </div>
        </InfoWindow>
      );
    }

    return (
      <InfoWindow
        key={`${ref}_info_window`}
        onCloseClick={() => this.handleMarkerClose(marker)}
      >
        <div className={styles['map-marker']} style={{textAlign: 'center'}}>
          {marker.data.image_path ? <p className={styles['avatar']}><img src={marker.data.image_path}/></p> : null}
          <p className={styles['name']} style={{color: marker.data.color}}>{marker.data.name}</p>
          {marker.data.address ? <p className={styles['address']}>{marker.data.address}</p> : null}
          {marker.data.scheduled === false ?
            <p className={styles['date']}>Not Yet Scheduled</p>
            :
            <p className={styles['date']}>{dateString}</p>}
        </div>
      </InfoWindow>
    );
  }

  getEntityMapIcon(marker) {
    if (this.props.theme && this.props.theme === 'UBER') {
      return "/images/enterprise/car.png";
    } else if (marker.data.image_path) {
      return marker.data.image_path;
    }
    else {
      return "/images/user-default.svg";
    }
  }

  getCustomerMapIcon(marker) {
    var icon = {
      path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
      fillColor: marker.data.color ? marker.data.color : '#FF0000',
      fillOpacity: .7,
      anchor: new google.maps.Point(0, 0),
      strokeWeight: 3,
      strokeColor: '#00000',
      scale: marker.data.scale
    };

    return icon;
  }

  render() {
    const height = this.props.height ? this.props.height : '654px';
    const width = this.props.width ? this.props.width : '100%';

    let style = {
      height: 'inherit'
    };

    if (this.props.style) {
      style = this.props.style;
      style.height = 'inherit';
    }

    let theme = GOOGLE_MAP_STYLES;

    if (this.props.theme && (this.props.theme === 'UBER' || this.props.theme === 'RH')) {
      theme = UBER_GOOGLE_MAP_STYLES;
    }

    const getPixelPositionOffset = (xwidth, xheight) => ({
      x: -(xwidth / 1.9),
      y: -(xheight + 70),
    });

    const getPixelPositionOffsetArrivy = (xwidth, xheight) => ({
      x: -(xwidth / 2),
      y: -(xheight + 70),
    });

    const customerAddressTooltip = (
      <Tooltip
        id="customer_address_tooltip">{typeof this.props.locationOverlay !== 'undefined' && this.props.locationOverlay !== null && this.props.locationOverlay.location}</Tooltip>
    );

    let polyLineColor = getDefaultPolyLineColor();
    if (this.props.theme && this.props.theme === 'UBER') {
      polyLineColor = getCustomPolyLineColor(this.props.theme);
    }

    let entityLocationOnMap = null;
    if (this.state.markers) {
      this.state.markers.map((marker) => {
        if (marker.data.type !== 'customer') {
          entityLocationOnMap = marker.position;
        }
      });
    }

    return (
      <div className={styles.googleMapsWrapper}>
        <GoogleMapsWrapper
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: this.props.height }} />}
          mapElement={<div style={{ height: `100%` }} />}
          center={ this.state.center }
          defaultCenter={{ lat: 47.594248, lng: -122.327003 }}
          defaultZoom={this.state.markers === 1 ? 14 : 11}
          ref={(map) => (this._googleMapComponent = map)}
          defaultOptions={{ styles: theme, mapTypeControl: false, streetViewControl: false }}
        >

          {this.state.markers.map((marker, index) => {
            let markerRouteId = marker.data.routeId;
            let entityId = marker.data.id;
            let markerIcon = this.getEntityMapIcon(marker);
            if (this.props.theme && this.props.theme === 'UBER' && marker.data.type === 'customer') {
              markerIcon = '/images/enterprise/marker.png';
            } else if (marker.data.type === 'customer') {
              markerIcon = this.getCustomerMapIcon(marker);
            } else if (marker.data.type === 'equipment') {
              markerIcon = '/images/truck.png';
            }
            if (marker.data.is_company) {
              markerIcon = '/images/icons/company-image-icon.png';
            }
            //Math.random().toString(36).substr(2, 16)
            const ref = `marker_${index}_${Math.random().toString(36).substr(2, 16)}`;
            let markerLabelColor = marker.data.color;
            if(marker.data.type === 'customer' || marker.data.type === "equipment" || (this.props.theme && this.props.theme === 'UBER')) {
              return (<Marker
                  key={index}
                  ref={ref}
                  position={marker.position}
                  onClick={this.handleMarkerClick.bind(this, marker)}
                  onMouseOver={() => {
                    this.props.onTaskMouseOver && this.props.onTaskMouseOver(marker.data.id)
                  }}
                  onMouseOut={() => {
                    this.props.onTaskMouseOut && this.props.onTaskMouseOut()
                  }}
                  icon={markerIcon}
                  label={this.props.routeView && this.props.showDirections && !marker.data.is_company && this.props.routeView === "routes" ? {
                    text: this.props.routeView && markerRouteId ? markerRouteId.toString() : null,
                    color: (markerLabelColor && (markerLabelColor === '#000000' || markerLabelColor === '#3e2723' || markerLabelColor === '#263238' || markerLabelColor === '#525252' || markerLabelColor === '#5d4037' || markerLabelColor === '#795548' || markerLabelColor === '#455a64') ? 'white' : 'black')
                  } : null}
                >
                  {/*
                  Show info window only if the 'showInfo' key of the marker is true.
                  That is, when the Marker pin has been clicked and 'handleMarkerClick' has been
                  Successfully fired.
                */}
                 {marker.showInfo ? this.renderInfoWindow(ref, marker) : null}
                </Marker>

              );
            }else {
              return(
              <MarkerWithLabel position={marker.position}
                    labelAnchor={new google.maps.Point(20, 50)}
                                onClick={this.handleMarkerClick.bind(this, marker)}>
                <div  className={styles.mapMarker}>
                  <div className={styles.mapMarkerInner}>
                    <img style={this.isTimeInOnlineRange(marker.data.time) && moment.utc(marker.data.time) - moment() < 0 ? {border : "2px solid #89ff4b"} : {border: "none"}} src={markerIcon} alt="Image" />
                    {marker.showInfo ? this.renderInfoWindow(ref, marker) : null}
                  </div>
                </div>
              </MarkerWithLabel>
            );
            }

          })
          }
          {
            this.state.entitiesRoutes ? (
              this.state.entitiesRoutes.map((entityRoute, index) => {
                const ref = `marker_${index}`;
                return (
                  <Polyline
                    key={ref}
                    path={entityRoute} geodesic="true"
                    options={{strokeColor: 'rgb(95, 226, 63)', strokeWeight: '6'}}
                  >
                  </Polyline>
                )
              })
            ) : ''
          }
          {this.props.showDirections && this.state.directions && !this.state.multipleRoutes ? (
            <DirectionsRenderer
              directions={this.state.directions}
              options={{polylineOptions: {strokeColor: polyLineColor, strokeWeight: '6'}, suppressMarkers: 'true'}}
            >
            </DirectionsRenderer>
          ) : ''
          }
          {this.props.showDirections && this.state.multipleRoutes && !this.state.directions ? Object.keys(this.state.multipleRoutes).map((key, index) => {
             return (
                <DirectionsRenderer
                  directions={this.state.multipleRoutes[key].result}
                  options={{polylineOptions: {strokeColor: this.state.multipleRoutes[key].routeColor, strokeWeight: '6'}, suppressMarkers: 'true'}}
                >
                </DirectionsRenderer>
              );
          })
             : ''
          }
          {typeof this.props.locationOverlay !== 'undefined' && this.props.locationOverlay.exact_location !== null && this.props.locationOverlay.location !== '' &&
          <OverlayView
            position={this.props.locationOverlay.exact_location}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={getPixelPositionOffset}
          >
            <div className={styles.milaLocationOverlay}>
              {this.props.showDirections && this.props.locationOverlay.estimate !== 'Not available' &&
              <span className={styles.estimatedDuration}>
                  {this.props.locationOverlay.estimate}
                </span>
              }
              {typeof this.props.locationOverlay.estimate !== 'undefined' &&
              <div className={styles.exactLocation}>
                <OverlayTrigger placement="bottom" overlay={customerAddressTooltip}>
                  <div style={{display: 'inline-block'}}>
                      <span>
                        {this.props.locationOverlay.location}
                      </span>
                  </div>
                </OverlayTrigger>
              </div>
              }
            </div>
          </OverlayView>
          }
          {this.props.showDirections && this.state.directions && entityLocationOnMap !== null &&  typeof this.props.hideOverlay === 'undefined' &&
          <OverlayView
            position={entityLocationOnMap}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={getPixelPositionOffsetArrivy}
          >
            <div className={styles.arrivyLocationOverlay}>
              {this.props.showDirections && this.props.showEstimateOverlay &&
              <span className={styles.estimatedDuration}>
                    <span>{this.props.estimate}</span>
                  </span>
              }
            </div>
          </OverlayView>
          }
        </GoogleMapsWrapper>
      </div>
    );
  }
}
