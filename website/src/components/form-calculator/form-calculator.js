import React, { Component } from 'react';
import PropTypes from 'prop-types';

//import styles from './landing-calculator.module.scss';
import { Form, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';

function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id} className="col-xs-12 col-md-3">
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}

class FormCalculator extends Component {
  constructor(props, context) {
    super(props, context);

    this.onBusinessTypeChange = this.onBusinessTypeChange.bind(this);
    this.onDriversCountChange = this.onDriversCountChange.bind(this);
    this.onShiftCountChange = this.onShiftCountChange.bind(this);
    this.onUpdatesCountChange = this.onUpdatesCountChange.bind(this);
    this.numberWithCommas = this.numberWithCommas.bind(this);

    this.state = {
      driversCount: 10,
      shiftCount: 6,
      updatesCount: 60,
      businessType: 1
    };
  }

  onBusinessTypeChange(e) {
    this.setState({
      businessType: e.target.value
    });
  }

  onDriversCountChange(e) {
    this.setState({
      driversCount: e.target.value
    });
  }

  onShiftCountChange(e) {
    this.setState({
      shiftCount: e.target.value
    });
  }

  onUpdatesCountChange(e) {
    this.setState({
      updatesCount: e.target.value
    });
  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  render() {
    const { businessType, driversCount, shiftCount, updatesCount } = this.state;
    const options = this.props.options.map((opt, idx) => {
      return <option key={idx} value={opt.val}>{opt.text}</option>;
    });
    const className = 'row ' + this.props.className;
    let totalCalls = Math.ceil(driversCount * 28 * shiftCount * 60 * (60 / updatesCount));
    totalCalls = this.numberWithCommas(totalCalls);

    let driverLabel = 'Drivers';
    let shiftLabel= 'Shift Duration per day in hours';
    let updatesLabel = 'Location Update every x seconds';

    if (businessType == '3') {
      driverLabel = 'Crew Members';
    } else if( businessType == '4') {
      driverLabel = 'Entities, Assets, Tags or Devices';
      shiftLabel = 'Tracking Duration per day in hours'
    }

    return (
      <div>
        <Form className={className}>
          <FormGroup className="col-xs-12 col-md-3" controlId="bussinessType">
            <ControlLabel>Type of Business</ControlLabel>
            <FormControl componentClass="select" value={businessType} onChange={this.onBusinessTypeChange}>
              {options}
            </FormControl>
          </FormGroup>
          <FieldGroup id="drivers" type="number" label={driverLabel} value={this.state.driversCount} onChange={this.onDriversCountChange}/>
          <FieldGroup id="duration" type="number" label={shiftLabel} value={this.state.shiftCount} onChange={this.onShiftCountChange}/>
          <FieldGroup id="duration" type="number" label={updatesLabel} value={this.state.updatesCount} onChange={this.onUpdatesCountChange}/>
        </Form>
        <div className="text-center">
            <h2>{totalCalls} <span className="small">calls / month approximately</span> </h2>
        </div>
      </div>);
  }
}

FormCalculator.propTypes = {
  options: PropTypes.array.isRequired,
  className: PropTypes.string
};

FormCalculator.defaultProps = {
  className: '',
};

export default FormCalculator;
