import React, { Component } from 'react';
import PropTypes from 'prop-types';

import FormCalculator from '../form-calculator/form-calculator';
import styles from './landing-form-calculator.module.scss';

class LandingFormCalculator extends Component {
  render() {
    const className = styles['calc-form'] + (this.props.show ? '' : ' hidden');
    return (
      <section className={className}>
        <div className="container">
          <FormCalculator options={this.props.data.options} className={styles.ptb35}/>
        </div>
      </section>
    );
  }
}

LandingFormCalculator.propTypes = {
  data: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired
};


export default LandingFormCalculator;
