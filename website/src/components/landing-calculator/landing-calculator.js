import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Calculator from '../calculator/calculator';
import styles from './landing-calculator.module.scss';
import { Button, ButtonGroup} from 'react-bootstrap';

class LandingCalculator extends Component {
  constructor(props) {
    super(props);

    this.onChangePrice = this.onChangePrice.bind(this);
    this.changePlanTypeToAPICalls = this.changePlanTypeToAPICalls.bind(this);
    this.changePlanTypeToTrackedEntities = this.changePlanTypeToTrackedEntities.bind(this);

    this.state = {
      current_value: 1,
      'item': this.props.calculator_for_entities_plan.values[0],
      planType : 'TrackedEntities'
    };
  }

  onChangePrice(item, value) {
    this.setState({
      "item": item,
      current_value: value
    });
  }

  changePlanTypeToTrackedEntities() {
    this.setState({
      planType: 'TrackedEntities',
      current_value: 1,
      'item': this.props.calculator_for_entities_plan.values[0]
    });
  }

  changePlanTypeToAPICalls() {
    this.setState({
      planType: 'APICalls',
      current_value: 1,
      'item': this.props.calculator.values[0]
    });
  }

  isNumber(n) { 
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
  }

  render() {
    const { planType } = this.state;

    const TrackedEntitiesPlanSelected = planType === 'TrackedEntities';

    return (
      <div className="container" style={{ padding:'20px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px', paddingBottom: '16px' }}>
            You can pick payment plan based on <strong>Team Size</strong> or <strong>Number of Tasks created</strong>
          </p>
          <ButtonGroup>
            <Button className={TrackedEntitiesPlanSelected ? styles['selected-button'] : '' } onClick={this.changePlanTypeToTrackedEntities}>
              Tracked Employees
            </Button>
            <Button className={!TrackedEntitiesPlanSelected ? styles['selected-button'] : '' } onClick={this.changePlanTypeToAPICalls}>
              Tasks
            </Button>
          </ButtonGroup>
        </div>
        {TrackedEntitiesPlanSelected ?
         <div>
          <div className={styles['price-calculator']}>
            <div className={styles['tasks']}>
              <h1>{this.state.current_value}</h1>
              <p className={styles['calls']}>{this.state.current_value === 1 ? 'Employee' : 'Employees'} per month</p>
            </div>
            <div className={styles['price']}>
              <h1>{this.state.item.currency}{ !this.isNumber(this.state.item.price) ? this.state.item.price : this.state.item.price}</h1>
            </div>
          </div>
          <Calculator 
            onChangePrice={this.onChangePrice}
            values={this.props.calculator_for_entities_plan.values}
            min={this.props.calculator_for_entities_plan.min}
            max={this.props.calculator_for_entities_plan.max}
            useActualValues/>
        </div>
        :
        <div>
          <div className={styles['price-calculator']}>
            <div className={styles['tasks']}>
              <h1>{this.state.item.tasks}</h1>
              <p className={styles['calls']}>Tasks Monthly</p>
            </div>
            <div className={styles['price']}>
              <h1>{this.state.item.currency}{this.state.item.price}</h1>
            </div>
            {/*<div className={styles['help']}>
              <a href="#" onClick={this.props.toggleFormCalculator}>{this.props.calculator.help}</a>
            </div>*/}
          </div>
          <Calculator 
            onChangePrice={this.onChangePrice}
            values={this.props.calculator.values}
            min={this.props.calculator.min}
            max={this.props.calculator.max} />
        </div> }
        <div className={styles['center-button']}>
          <p style={{paddingBottom: '10px'}}>*First 2 weeks are on us</p>
          <a className={styles['price-button']} href='/signup'>
            Start for free
          </a>
        </div>
      </div>);
  }
}


LandingCalculator.propTypes = {
  calculator: PropTypes.object.isRequired,
  calculator_for_entities_plan: PropTypes.object.isRequired,
  toggleFormCalculator: PropTypes.func
};

export default LandingCalculator;
