import React, { Component } from 'react';
import style from '../../base-styling.module.scss';
import styles from './map.module.scss';
import cx from 'classnames';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { LocationMapV2 } from "../../../index";
import SavingSpinner from "../../../saving-spinner/saving-spinner";

export default class Map extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={cx(style.box)}>
        <div className={cx(style.boxBody)}>
          <div className={cx(style.boxBodyInner)}>
              {this.props.showEstimate &&
              <div>
                {this.props.gettingEstimate ? <SavingSpinner title="Loading " borderStyle="none" size={8} /> :
                  <div className={cx(styles.mapHeader)}>
                    <div className={cx(styles.estimate)}>Estimate: <span>{this.props.estimate}</span></div>
                    {/*<div className={cx(styles.arrivalTime)}>*/}
                      {/*{this.props.predictedEstimate && this.props.predictedEstimate.estimate !== 'Not Available' &&*/}
                      {/*<OverlayTrigger placement="bottom" overlay={(<Tooltip id="predictedEstimateTooltip">This is an experimental feature, not visible to your customers.</Tooltip>)}>*/}
                        {/*<div>Predicted Arrival Time:<span>{this.props.formatPredictedEstimate && this.props.formatPredictedEstimate()}</span></div>*/}
                      {/*</OverlayTrigger>*/}
                      {/*}*/}
                    {/*</div>*/}
                  </div>
                }
              </div>
              }
            <div className={styles.map}>
              <LocationMapV2 height={450} entitiesRoutes={this.props.entitiesRoutes} entities={this.props.entities} showDirections={false} showLocation />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
