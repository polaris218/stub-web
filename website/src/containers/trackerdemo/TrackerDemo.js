import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Button, FormControl } from 'react-bootstrap';
import {findDOMNode} from 'react-dom';

import { Header, LocationMapV2 } from '../../components';
import { getDevices } from '../../actions';
import { DefaultHelmet } from '../../helpers';

export default class TrackerDemo extends Component {
  
  constructor(props, context){
    super(props, context);
    this.deviceToShowChanged = this.deviceToShowChanged.bind(this);

    const currentTime = Date.now();
    this.state = {
      deviceToShow: 'All',
      devices  :  [{
            name: "Ahmed",
            id: "14390_56269",
            lastreading: {
                lat: 21.423487, 
                lng: 39.827501,
                time: currentTime
              }
            },
            {
              name: "Bilal's Tracker",
              id: "14390",
              lastreading: {
                lat: 21.419089, 
                lng: 39.823836,
                time: currentTime - (60345 * 10)
              }
            }
          ]
    };
  }

  deviceToShowChanged(e) {
    this.setState({
      deviceToShow: e.target.value
    });
  }

  render() {
    const { devices, deviceToShow } = this.state;

    let noDeviceFound = false;
    if (!devices || devices.length === 0) {
      noDeviceFound = true;
    }

    const filteredDevices = [];
    if (deviceToShow !== 'All') {
      for (let i = 0; i < devices.length; i++) {
        if (devices[i].id === deviceToShow) {
          filteredDevices.push(devices[i]);
          break;
        }
      }
    }

    return (
        <div>
          <DefaultHelmet/>
          <Header router={this.context.router} hideMenu/>
          <div>
            { noDeviceFound ? 
              <div> No devices were found</div>
              : 
              <div>
                <div style={{textAlign: 'center', margin: '0 auto', maxWidth: '300px', marginBottom: '20px'}}>
                  <h4>My Trackers</h4>
                  <FormControl componentClass="select" placeholder="Trackers" onChange={this.deviceToShowChanged}>
                    <option selected={deviceToShow === 'All'} value="All">All</option>
                    {devices.map((device)=>{
                      return <option selected={deviceToShow === device.id} value={device.id}>{device.name}</option>;
                    })}
                  </FormControl>
                </div>
                <LocationMapV2 devices={deviceToShow === 'All' ? this.state.devices : filteredDevices}/>
              </div>
            }
          </div>
      </div>
    );
  }
}


TrackerDemo.contextTypes = {
  router: PropTypes.object.isRequired
};