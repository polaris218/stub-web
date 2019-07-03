import React, { Component } from 'react';
import styles from './assignee-widget.module.scss';

export default class AssigneeWidget extends Component {
  constructor(props) {
    super(props);

    this.renderEntities = this.renderEntities.bind(this);

  }

  renderEntities() {
    const entitities = this.props.entities;
    const profile = this.props.profile;
    let renderedEntities = null;
    if (entitities.length > 0) {
      renderedEntities = entitities.map((entity) => {
        let profilePic = '/images/user.png';
        if (entity.image_path !== null && entity.image_path !== '') {
          profilePic = entity.image_path;
        }
        return (
          <div className={styles.entityBox}>
            <img className={styles.entityProfilePic} src={profilePic} alt=""/>
            <div className={styles.entityInfoBox}>
              <h2>{entity.name}</h2>
              <p>{entity.type}</p>
            </div>
          </div>
        );
      });
    } else {
      renderedEntities = (
          <div className={styles.entityBox}>
            <img className={styles.entityProfilePic} src="/images/user.png" alt=""/>
            <div className={styles.entityInfoBox}>
              <h2>Unknown</h2>
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
