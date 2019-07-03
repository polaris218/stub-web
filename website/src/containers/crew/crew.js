import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './crew.module.scss';
import { EntityManager, FooterComponent, FooterConfiguration, UserHeader }  from '../../components';
import {
  getEntities, getProfileInformation,
  createEntity, deleteEntity, updateEntity,
  getEntityImageUrl, updateEntityImage, removeEntityImage
} from '../../actions';
import { DefaultHelmet } from '../../helpers';
import history from '../../configureHistory';

export default class Crew extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentWillMount() {
    getProfileInformation().then((res) => {
      const profile = JSON.parse(res);
      this.setState({ profile });
    });
  }

  render() {
    return (
      <div className={styles['full-height'] + ' activity-stream-right-space'}>
        <DefaultHelmet/>
        <div className={styles['page-wrap']}>
          <UserHeader router={this.context.router}  profile={this.state.profile}/>
          <EntityManager
            createEntity={createEntity}
            updateEntities={getEntities}
            deleteEntity={deleteEntity}
            updateEntity={updateEntity}
            getEntityImageUrl={getEntityImageUrl}
            updateEntityImage={updateEntityImage}
            removeEntityImage={removeEntityImage}
          />
        </div>
        <div className={styles.footer}>
          <FooterComponent links={FooterConfiguration}/>
        </div>
      </div>
    );
  }
}

Crew.contextTypes = {
  router: PropTypes.object.isRequired
};
