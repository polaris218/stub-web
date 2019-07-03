import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './rating-type.module.scss';
import StarRatingComponent from 'react-star-rating-component';
import cx from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faSmile, faMeh, faFrown } from '@fortawesome/fontawesome-free-regular';
import { faThumbsUp as thumbsUp, faThumbsDown as thumbsDown } from '@fortawesome/fontawesome-free-solid';

export default class RatingType extends Component {
    constructor(props) {
        super(props);

        this.renderFiveStarRating = this.renderFiveStarRating.bind(this);
        this.renderNpsRating = this.renderNpsRating.bind(this);
        this.renderThumbsUpDown = this.renderThumbsUpDown.bind(this);
        this.convertRatings = this.convertRatings.bind(this);
    }

  convertRatings(rating, rating_type) {
    if (this.props.companyRatingType === null || typeof this.props.companyRatingType === 'undefined' || this.props.companyRatingType === 'FiveStar' || this.props.companyRatingType === 'NoRating') {
      if (rating_type === null || typeof rating_type === 'undefined' || rating_type === 'FiveStar' || rating_type === 'NoRating') {
        if (rating <= 5) {
          return rating;
        } else {
          return 5;
        }
      } else if (rating_type === 'NPS') {
        if (rating == 0) {
          return 1;
        } else {
          return Math.ceil(rating / 2);
        }
      } else if (rating_type === 'ThumbsUpDown') {
        if (rating === 0) {
          return 2;
        } else{
          return 4;
        }
      }
    } else if (this.props.companyRatingType === 'NPS') {
      if (rating_type === null || typeof rating_type === 'undefined' || rating_type === 'FiveStar' || rating_type === 'NoRating') {
        if (rating <= 5) {
          return (rating * 2);
        } else {
          return 10;
        }
      } else if (rating_type === 'NPS') {
        return rating;
      } else if (rating_type === 'ThumbsUpDown') {
        if (rating === 0) {
          return 3;
        } else{
          return 9;
        }
      }
    } else if (this.props.companyRatingType === 'ThumbsUpDown') {
      if (rating_type === null || typeof rating_type === 'undefined' || rating_type === 'FiveStar' || rating_type === 'NoRating') {
        if (rating < 4) {
          return 0;
        } else {
          return 1;
        }
      } else if (rating_type === 'NPS') {
        if (rating < 8) {
          return 0;
        } else {
          return 1;
        }
      } else if (rating_type === 'ThumbsUpDown') {
        return rating;
      }
    }
  }

    renderFiveStarRating() {
      const rating = this.props.taskRatingType ? this.convertRatings(this.props.value, this.props.taskRatingType) : this.props.value;
        return (
            <div>
                {this.props.edit &&
                <StarRatingComponent
                    name={'rating'}
                    onStarClick={(nextValue) => this.props.onChange(nextValue)}
                    starColor={this.props.starColor}
                    emptyStarColor={'#9f9f9f'}
                    value={rating}
                />}
                {!this.props.edit &&
                    <StarRatingComponent
                        name={'rating'}
                        starColor={this.props.starColor}
                        emptyStarColor={'#9f9f9f'}
                        editing={false}
                        value={rating}
                    />
                }
            </div>);
    }

    renderNpsRating() {
        const npsRating = [];
        let backgroundColor = null;
        const rating = this.props.taskRatingType ? this.convertRatings(this.props.value, this.props.taskRatingType) : this.props.value;
        for (let i = 0; i <= 10; i++) {
            if (i <= rating && i >= 9 && i <= 10) {
              backgroundColor = '#00DC9A';
            } else if(i <= rating && i >= 7 && i <= 8) {
              backgroundColor = '#f1c235';
            } else if(i <= rating && i >= 0 && i <= 6) {
              backgroundColor = '#ff4e4c';
            } else {
                backgroundColor = '#e1e1e1';
            }
            npsRating.push(<span onClick={() => {this.props.edit ? this.props.onChange(i) : null}} style={{ backgroundColor }} className={cx(styles.singleBlock)}>{i}</span>)
        }
        let ratingColor = null;
        if (rating >= 0 && rating <= 6) {
          ratingColor = '#ff4e4c';
        } else if (rating >= 7 && rating <= 8) {
          ratingColor = '#f1c235';
        } else {
          ratingColor = '#00DC9A';
        }
        return (
            <div>
                {this.props.edit && npsRating.map((slot) => {
                    return slot;
                })}
                {!this.props.edit &&
                  <span style={{ backgroundColor: ratingColor }} className={styles.npsRating}>{rating}</span>
                  }
            </div>
        );
    }

    renderThumbsUpDown() {
      const rating = this.props.taskRatingType ? this.convertRatings(this.props.value, this.props.taskRatingType) : this.props.value;
        let thumbsUpSelected = '';
        let thumbsDownSelected = '';
        if (rating === 0) {
            thumbsDownSelected = styles.thumbsDownSelected;
        } else if (rating === 1) {
            thumbsUpSelected = styles.thumbsSelected;
        }
        let thumbsEditClass = '';
        if (this.props.edit) {
          thumbsEditClass = styles.thumbsContainer;
        }
        return (
            <div style={{ display: 'flex', justifyContent: this.props.centerAlign ? 'center' : '' }}>
              {(this.props.edit || rating === 1) && <div><span className={cx(styles.thumbsBlock, thumbsUpSelected, thumbsEditClass)} onClick={() => {this.props.edit ? this.props.onChange(1) : null}}>
                    <FontAwesomeIcon icon={(rating === 1) ? thumbsUp : faThumbsUp}/>
              </span>
                {this.props.edit && <p className={styles.ratingText}>Yes</p>}
              </div>}
              {(this.props.edit || rating === 0) && <div><span className={cx(styles.thumbsBlock, thumbsDownSelected, thumbsEditClass)} onClick={() => {this.props.edit ? this.props.onChange(0) : null}}>
                    <FontAwesomeIcon icon={(rating === 0) ? thumbsDown : faThumbsDown}/>
              </span>
                {this.props.edit && <p className={styles.ratingText}>No</p>}
              </div>}
            </div>
        );
    }

    render() {
        return(
            <div>
                {(this.props.companyRatingType === null || typeof this.props.companyRatingType === 'undefined' ||
                  this.props.companyRatingType === 'FiveStar' || this.props.companyRatingType === 'NoRating') && this.renderFiveStarRating()}
                {this.props.companyRatingType === 'NPS' && this.renderNpsRating()}
                {this.props.companyRatingType === 'ThumbsUpDown' && this.renderThumbsUpDown()}
            </div>
        );
    }
}

RatingType.propTypes = {
    taskRatingType: PropTypes.string.isRequired,
    value: PropTypes.number,
    onChange: PropTypes.func,
    edit: PropTypes.bool,
    starColor: PropTypes.string,
    companyRatingType: PropTypes.string,
};