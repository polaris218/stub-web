import { default as React, Component } from 'react';
import PropTypes from 'prop-types';

import { GoogleMapLoader, GoogleMap, Marker, InfoWindow, Polyline, DirectionsRenderer, OverlayView  } from 'react-google-maps';
//import { triggerEvent } from 'react-google-maps/lib/utils';
import GOOGLE_MAP_STYLES from '../../helpers/google_map_styles';
import UBER_GOOGLE_MAP_STYLES from '../../helpers/uber_google_map_styles';
import TimeAgo from 'react-timeago';
import moment from 'moment';
import styles from './locationmap.module.scss';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import polyline from '@mapbox/polyline';

/*
 *
 *  Add <script src="https://maps.googleapis.com/maps/api/js"></script>
 *  to your HTML to provide google.maps reference
 *
 *  @author: @chiwoojo
 */
export default class LocationMap extends Component {

  constructor(props, context) {
    super(props, context);
    //this.handleWindowResize = this.handleWindowResize.bind(this);

    this.state = this.convertEntityStructureToComponentState(props.entities, props.hideInfoInitially, props.showDirections);

  }

  componentWillReceiveProps(nextProps) {
    const data = this.convertEntityStructureToComponentState(nextProps.entities, nextProps.hideInfoInitially, nextProps.showDirections);
    let entitiesRoutes = null;
    if (nextProps.entitiesRoutes) {
      entitiesRoutes = this.getDecodedEntitiesRoutes(nextProps.entitiesRoutes);
    }

    this.setState({
      ...data,
      entitiesRoutes
    });
  }

/*  componentDidMount() {
    window.addEventListener(`resize`, this.handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener(`resize`, this.handleWindowResize);
  }

  handleWindowResize() {
    triggerEvent(this._googleMapComponent, `resize`);
  }
*/
  convertEntityStructureToComponentState(entities, hideInfoInitially, showDirections=false) {
    if (!entities || entities.length === 0) {
      // send seattle longitude and latitude and set markers as null
      const center =  {
        lat: 47.602743,
        lng: -122.330626
      };

      return {
        center: center,
        markers: []
      };
    }

    const markers = [];
    let firstEntityReadings = null;
    let destinationPosition = null;
    let selectedEntityPosition = null;
    let showPathLine = true;


    for (let i = 0; i < entities.length; i++) {
      if (entities[i].location) {
        if (!firstEntityReadings) {
          firstEntityReadings = {
            lat: entities[i].location.lat,
            lng: entities[i].location.lng
          };
        }

        let showLocation = true;

        if (entities[i].type === 'customer') {
          destinationPosition = i;
        } else {
          if (this.isTimeInOnlineRange(entities[i].time)) {
            selectedEntityPosition = i;
          } else if (this.props.customerView) {
            showLocation = false;
            showPathLine = false;
          }
        }

        if (showLocation) {
          markers.push({
            position: new google.maps.LatLng(entities[i].location.lat, entities[i].location.lng),
            showInfo: false,
            data: {
              name: entities[i].name,
              address: entities[i].address,
              id: entities[i].id,
              time: entities[i].time,
              color: entities[i].type === 'customer' ? entities[i].color : '#ccc',
              type: entities[i].type,
              image_path: entities[i].image_path
            }
          });
        }
      }
    }

    //Optimize where we get previous location and don't call direction if it's the same
    if (showDirections && destinationPosition != null && selectedEntityPosition != null && showPathLine) {
      const DirectionsService = new google.maps.DirectionsService();
      DirectionsService.route({
        origin: new google.maps.LatLng(entities[selectedEntityPosition].location.lat, entities[selectedEntityPosition].location.lng),
        destination: new google.maps.LatLng(entities[destinationPosition].location.lat, entities[destinationPosition].location.lng),
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.setState({
            directions: result
          });
        }
      });
    } else {
      this.setState({
        directions: null
      });
    }

    return {
      center: firstEntityReadings,
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
        oneEntityDecodedRoute.push({ lat: coords[j][0], lng: coords[j][1] });
      }
      decodedEntitiesRoutes.push(oneEntityDecodedRoute);
    }

    return decodedEntitiesRoutes;
  }

  handleMarkerClick(marker) {
    marker.showInfo = true;
    this.setState(this.state);
  }

  handleMarkerClose(marker) {
    marker.showInfo = false;
    this.setState(this.state);
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
    const dateString = localMomentObject.format('MMM DD hh:mm a');
    let entityType = '';
    if (!this.props.customerView) {
      entityType = marker.data.type;
    }

    if (marker.data.type !== 'customer') {
      let lightColor = '#d6d6d6';
      if (this.isTimeInOnlineRange(marker.data.time) && momentObject - moment() < 0) {
        lightColor = '#91DC5A';
      }

      let image = "/images/user.png";
      if ( marker.data.image_path ){
          image  = marker.data.image_path;
      }

      const light = (<svg version="1.1" id="Capa_1" x="0px" y="0px" width="12px" height="12px" viewBox="0 0 438.533 438.533" style={{marginLeft: '10px'}} >
            <g>
              <path d="M409.133,109.203c-19.608-33.592-46.205-60.189-79.798-79.796C295.736,9.801,259.058,0,219.273,0   c-39.781,0-76.47,9.801-110.063,29.407c-33.595,19.604-60.192,46.201-79.8,79.796C9.801,142.8,0,179.489,0,219.267   c0,39.78,9.804,76.463,29.407,110.062c19.607,33.592,46.204,60.189,79.799,79.798c33.597,19.605,70.283,29.407,110.063,29.407   s76.47-9.802,110.065-29.407c33.593-19.602,60.189-46.206,79.795-79.798c19.603-33.596,29.403-70.284,29.403-110.062   C438.533,179.485,428.732,142.795,409.133,109.203z" fill={lightColor}/>
            </g>
            </svg>);

      const tooltip = (
        <Tooltip id="tooltip">{dateString}</Tooltip>
      );

      return (
        <InfoWindow
          key={`${ref}_info_window`}
          onCloseclick={this.handleMarkerClose.bind(this, marker)}
        >
          <div className={styles['map-marker']} style={{ textAlign : 'left'}}>
            <p className={styles['member-icon']} style={{ borderColor: lightColor}}><img src={image} /></p>
            <p className={styles['member-name']}>{ marker.data.name } { light }</p>
            {entityType !== '' &&
              <p>{ entityType }</p>
            }
            <OverlayTrigger placement="bottom" overlay={ tooltip }>
              <p className={styles['date']}>
                {momentObject - moment() <= 0 && <TimeAgo date={ localMomentObject.toISOString() }/>}
                {momentObject - moment() > 0 && 'Not Available'}
              </p>
            </OverlayTrigger>
          </div>
        </InfoWindow>
      );
    }

    return (
      <InfoWindow
        key={`${ref}_info_window`}
        onCloseclick={this.handleMarkerClose.bind(this, marker)}
      >
        <div className={styles['map-marker']} style={{ textAlign : 'center'}}>
          { marker.data.image_path ? <p className={styles['avatar']}><img src={ marker.data.image_path } /></p> : null }
          <p className={styles['name']} style={{ color: marker.data.color }}>{ marker.data.name }</p>
          { marker.data.address ? <p className={styles['address']}>{ marker.data.address }</p> : null }
          <p className={styles['date']}>Scheduled at {dateString}</p>
        </div>
      </InfoWindow>
    );
  }

  getEntityMapIcon(marker) {
    if (this.props.theme && this.props.theme === 'UBER') {
      return "/images/enterprise/car.png";
    } else if (this.isTimeInOnlineRange(marker.data.time) && moment.utc(marker.data.time) - moment() < 0) {
      return "/images/map-icon-online.png";
    } else {
      return "/images/map-icon.png";
    }
  }

  getCustomerMapIcon(marker) {
     var icon = {
        path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
        fillColor: marker.data.color ? marker.data.color: '#FF0000',
        fillOpacity: .7,
        anchor: new google.maps.Point(0,0),
        strokeWeight: 3,
        strokeColor: '#00000',
        scale: 0.5
    }

    return icon;
  }

  render() {
    const height = this.props.height ? this.props.height : '654px';
    const width = this.props.width ? this.props.width : '100%';

    let style = {
      height:'inherit'
    };

    if (this.props.style) {
      style = this.props.style;
      style.height = 'inherit';
    }

    let theme = GOOGLE_MAP_STYLES;

    if (this.props.theme && this.props.theme === 'UBER') {
      theme = UBER_GOOGLE_MAP_STYLES;
    }

    const getPixelPositionOffset = (xwidth, xheight) => ({
      x: -(xwidth / 1.9),
      y: -(xheight + 70),
    });

    const getPixelPositionOffsetArrivy = (xwidth, xheight) => ({
      x: -(xwidth / 2),
      y: -(xheight + 50),
    });

    const customerAddressTooltip = (
      <Tooltip id="customer_address_tooltip">{typeof this.props.locationOverlay !== 'undefined' && this.props.locationOverlay !== null && this.props.locationOverlay.location}</Tooltip>
    );

    let polyLineColor = '#73b9ff';
    if (this.props.theme && this.props.theme === 'UBER') {
      polyLineColor = '#142046';
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
      <div style={{ height, width }}>
      <GoogleMapLoader
        containerElement={
          <div
            style={style}
          >
          </div>
        }

        googleMapElement={
          <GoogleMap
            center={ this.state.center }
            defaultCenter={{ lat: 47.594248, lng: -122.327003 }}
            defaultZoom={this.state.markers === 1 ? 14 : 11}
            ref={(map) => (this._googleMapComponent = map)}
            defaultOptions={{ styles: theme }}
          >
            {this.state.markers.map((marker, index) => {
              let markerIcon = this.getEntityMapIcon(marker);
              if (this.props.theme && this.props.theme === 'UBER' && marker.data.type === 'customer') {
                markerIcon = '/images/enterprise/marker.png';
              } else if (marker.data.type === 'customer') {
                markerIcon = this.getCustomerMapIcon(marker);
              }
              const ref = `marker_${index}_${Math.random().toString(36).substr(2, 16)}`;
              return (<Marker
                key={Math.random().toString(36).substr(2, 16)}
                ref={ref}
                position={marker.position}
                onClick={this.handleMarkerClick.bind(this, marker)}
                icon={markerIcon}
              >
                {/*
                  Show info window only if the 'showInfo' key of the marker is true.
                  That is, when the Marker pin has been clicked and 'handleMarkerClick' has been
                  Successfully fired.
                */}
                {marker.showInfo ? this.renderInfoWindow(ref, marker) : null}
              </Marker>
              );
            })
          }
          {
            this.state.entitiesRoutes ? (
            this.state.entitiesRoutes.map((entityRoute, index) => {
              const ref = `marker_${index}`;
              return (
                <Polyline
                  key={ref}
                  path={ entityRoute } geodesic="true"
                  options={ { strokeColor: 'rgb(95, 226, 63)',  strokeWeight: '6' } }
                  >
                </Polyline>
              )
            })
            ) : ''
          }
          {this.props.showDirections && this.state.directions ? (
              <DirectionsRenderer
                directions={this.state.directions}
                options={ { polylineOptions: { strokeColor: polyLineColor,  strokeWeight: '6' }, suppressMarkers: 'true' } }
                >
              </DirectionsRenderer>
            ) : ''
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
                    <div style={{display : 'inline-block'}}>
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
          {this.props.showDirections && this.state.directions && entityLocationOnMap !== null &&
            <OverlayView
              position={entityLocationOnMap}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelPositionOffset={getPixelPositionOffsetArrivy}
            >
              <div className={styles.arrivyLocationOverlay}>
                {this.props.showDirections && this.props.showEstimateOverlay &&
                  <span className={styles.estimatedDuration}>
                    <span>{ this.props.estimate }</span>
                  </span>
                }
              </div>
            </OverlayView>
          }
          </GoogleMap>
        }
      />
      </div>
    );
  }
}

LocationMap.propTypes = {
  entities        : PropTypes.array,
  entitiesRoutes  : PropTypes.array,
  height          : PropTypes.string,
  width           : PropTypes.string,
  style           : PropTypes.object,
  hideInfoInitially: PropTypes.bool,
  showDirections: PropTypes.bool,
  customerView: PropTypes.bool,
  locationOverlay: PropTypes.object,
  showEstimateOverlay: PropTypes.bool,
  showLocation: PropTypes.bool
};
