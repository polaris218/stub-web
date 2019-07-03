import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './crew-widget.module.scss';
import { Grid, Row, Col } from 'react-bootstrap';
import StarRatingComponent from 'react-star-rating-component';
import StarRatings from 'react-star-ratings';

export default class CrewWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assignees: this.props.entities,
      assigneesRating: [],
      showOldRating: true,
    };
    this.renderAssigneesWidget = this.renderAssigneesWidget.bind(this);
    this.fetchAssigneesRatings = this.fetchAssigneesRatings.bind(this);
  }

  componentDidMount() {
    this.fetchAssigneesRatings();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.entities.length === this.props.entities.length) {
      return;
    } else {
      this.setState({
        assignees: nextProps.entities
      }, () => { this.fetchAssigneesRatings(true); });
    }
  }

  fetchAssigneesRatings(assigneesUpdated = false) {
    const assignees = [...this.state.assignees];
    let assigneesRating = [...this.state.assigneesRating];
    if (assigneesUpdated) {
      assigneesRating = [];
    }
    let trackerVersion = 'OLD';
    let showOldRating = true;
    if (this.props.trackerVersion && this.props.trackerVersion.toUpperCase() === 'NEW') {
      trackerVersion = 'NEW';
      showOldRating = false;
    }
    if (assignees.length > 0) {
      assignees.map((entity) => {
        this.props.getAssigneeRating(this.props.task.owner, entity.id, trackerVersion).then((res) => {
          const existingRatingIndex = assigneesRating.findIndex((el) => {
            return el.id === entity.id;
          });
          if (existingRatingIndex !== -1) {
            assigneesRating[existingRatingIndex].rating = JSON.parse(res);
          } else {
            const ratingObj = {
              id: entity.id,
              rating: JSON.parse(res)
            };
            assigneesRating.push(ratingObj);
          }
          this.setState({
            assigneesRating,
          });
        }).catch((err) => {
          // TODO Need to find a way to display error related to NO RATING FOUND.
          // console.log(err);
        });
      });
    }
    this.setState({
      showOldRating
    });
  }

  renderAssigneesWidget() {
    const entityPlaceholderTitles = {
      'EN' : 'Your Service Provider',
      'DE' : 'Ihr Service-Partner',
      'FR' : 'Votre prestataire de service',
      'IT' : 'Il vostro partner di servizio'
    };
    const assignees = this.props.entities;
    let value = 0;
    if (assignees.length > 0) {
      const renderedAssigneesRating = assignees.map((entity, i) => {
        if (this.state.showOldRating && this.state.assigneesRating[i] && this.state.assigneesRating[i].rating && this.state.assigneesRating[i].rating.average_rating) {
          value = this.state.assigneesRating[i].rating.average_rating;
        } else if (!this.state.showOldRating && this.state.assigneesRating[i] && this.state.assigneesRating[i].rating && this.state.assigneesRating[i].rating.rating) {
          value = this.state.assigneesRating[i].rating.rating;
        } else {
          value = 0;
        }
        return (
          <div key={i} className={styles.crewMember}>
            <img src={entity.image_path ? entity.image_path : '/images/user.png'} alt={entity.name} className={styles.crewAvatar} />
            <h3 className={styles.crewName}>{entity.name}</h3>
            {this.state.showOldRating && <span>
              <StarRatingComponent
                className={styles.crewRating}
                starColor={'#ff5752'}
                emptyStarColor={'#9f9f9f'}
                editing={false}
                value={value}
              />
            </span>}
            {!this.state.showOldRating && <span className={styles.crewRating}>
              <StarRatings
                rating={value}
                starRatedColor="#ff5752"
                name="rating"
                starEmptyColor="#9f9f9f"
              />
            </span>}
            {this.state.showOldRating && <span className={styles.totalRatings}>({typeof this.state.assigneesRating[i] !== 'undefined' ? this.state.assigneesRating[i].rating.review_count : 0})</span>}
            {!this.state.showOldRating && <span className={styles.totalRatings}>({value && parseFloat(value.toFixed(2))})</span>}
          </div>
        );
      });
      return renderedAssigneesRating;
    } else {
      return (
        <div className={styles.crewMemberPlaceholder}>
          <span className={styles.crewAvatar}></span>
          <h3 className={styles.crewName}>
            {this.props.lang
              ?
              entityPlaceholderTitles[this.props.lang]
              :
              'Your Technician'
            }
          </h3>
          {this.state.showOldRating && <span>
            <StarRatingComponent
              className={styles.crewRating}
              starColor={'#E5E2E2'}
              emptyStarColor={'#E5E2E2'}
              editing={false}
              value={0}
            />
          </span>}
          {!this.state.showOldRating && <span className={styles.crewRating}>
            <StarRatings
              rating={0}
              starRatedColor="#E5E2E2"
              name="rating"
              starEmptyColor="#E5E2E2"
            />
          </span>}
          {!this.state.showOldRating && <span className={styles.totalRatings}>({value})</span>}
        </div>
      );
    }
  }


  render() {
    return (
      <div id="taskCrew">
        <div className={styles['crew-widget']}>
          <Grid>
            <Row>
              <Col md={12} sm={12} xs={12}>
                {this.renderAssigneesWidget()}
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
}

CrewWidget.propTypes = {
  entities: PropTypes.object,
  lang: PropTypes.string,
  getAssigneeRating: PropTypes.func,
  task: PropTypes.object
};
