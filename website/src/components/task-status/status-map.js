import { default as React, Component } from 'react';
import PropTypes from 'prop-types';

import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import GOOGLE_MAP_STYLES from '../../helpers/google_map_styles';

const GoogleMapsWrapper = withGoogleMap(props => {
  return <GoogleMap {...props}>{props.children}</GoogleMap>
});

export default class StatusMap extends Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {
    const height = this.props.height ? this.props.height : '300px';
    const width = this.props.width ? this.props.width : '100%';

    let style = {
      height:'inherit'
    };

    if (this.props.style) {
      style = this.props.style;
      style.height = 'inherit';
    }

    return (
      <div style={{ height, width }}>
        <GoogleMapsWrapper
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={style} />}
          mapElement={<div style={{ height: `100%` }} />}
          center={ this.props.position }
          defaultCenter={{ lat: 47.594248, lng: -122.327003 }}
          defaultZoom={14}
          ref={(map) => (this._googleMapComponent = map)}
          defaultOptions={{ styles: GOOGLE_MAP_STYLES, mapTypeControl: false, streetViewControl: false }}>
          <Marker
            position={this.props.position}
            icon="/images/map-icon.png"
          />
        </GoogleMapsWrapper>
      </div>
      
    );
  }
}

StatusMap.propTypes = {
  entities        : PropTypes.array,
  entitiesRoutes  : PropTypes.array,
  height          : PropTypes.string,
  width           : PropTypes.string,
  style           : PropTypes.object,
  hideInfoInitially: PropTypes.bool,
  showDirections: PropTypes.bool,
  customerView: PropTypes.bool
};