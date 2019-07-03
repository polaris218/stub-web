import React, { Component } from 'react';
import styles from './assignee-widget.module.scss';
import config from '../../../../config/config'
const server_url = config(self).serverUrl

export default class AssigneeWidget extends Component {
  constructor(props) {
    super(props);

    this.renderEntities = this.renderEntities.bind(this);

  }

  renderEntities() {
    const entitities = this.props.entities;
    const profile = this.props.profile;
    let renderedEntities = null;
    let defaultPic = `${server_url}/images/user.png`;
    let color = '';
    if (profile && profile.show_brand_color && profile.color) {
      color = profile.color;
    }
    if (entitities.length > 0) {
      renderedEntities = entitities.map((entity) => {
        let entityIntro = entity.details ? entity.details : '';
        entityIntro = entityIntro.length > 30 ? entityIntro.substr(0, 30) + '...' : entityIntro;
        let profilePic = defaultPic;
        if (entity.image_path !== null && entity.image_path !== '') {
          profilePic = entity.image_path;
        }
        return (
          <div className={styles.entityBox}>
            <img className={styles.entityProfilePic} src={profilePic} alt=""/>
            <div className={styles.entityInfoBox}>
              <h2 style={{ color }}>{entity.name}</h2>
              <p style={{ color }}>{entity.type}</p>
              <p style={{ color }}>{entityIntro}</p>
            </div>
          </div>
        );
      });
    } else {
      renderedEntities = (
          <div className={styles.entityBox}>
            <img className={styles.entityProfilePic} src={defaultPic} alt=""/>
            <div className={styles.entityInfoBox} >
              <h2 style={{ color }}>Unknown</h2>
            </div>
          </div>
        );
    }
    return renderedEntities;
  }

  render() {
    return (
      <div className={styles.entitiesWidgetContainer}>
        { this.renderEntities() }
      </div>
    );
  }

}
