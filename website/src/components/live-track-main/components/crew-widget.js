import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Col, Image } from 'react-bootstrap';
import styles from './crew-widget.module.scss';

export default class CrewWidget extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    const { entities } = this.props;
    const renderedEntities = entities.map((entity, i) => {
      return <div key={'entity-key-' + i}>
        <div className={styles['account-image']}>
            <Image src={entity.image_path || '/images/user.png'} thumbnail responsive />
        </div>
        <p>{entity.name}</p>
        <p className={styles['crew-widget-details']}><span>{ entity.details }</span></p>
      </div>;
    });

    return (
      <div id="taskCrew">
        <div className={styles['crew-widget']}>
          { entities && entities.length > 0 ? renderedEntities : <h4 className={styles['no-crew-message']}>Not yet assigned</h4>}
        </div>
      </div>
    );
  }
}

CrewWidget.propTypes = {
  entities: PropTypes.array.isRequired
};
