import React, { Component } from 'react';
import PropTypes from 'prop-types';
/*import { Table } from 'react-bootstrap';
import styles from './calculator.module.scss';
import Rcslider from 'rc-slider';


class Calculator extends Component {
  constructor(props) {
    super(props);
    this.state = { currentItem: props.values[0] };
    this.tipFormatter = this.tipFormatter.bind(this);
    this.onChangeSlider = this.onChangeSlider.bind(this);
  }

  getTableHeader() {
    let headersData = ['', 'Monthly Tasks', 'Price per Task*', ''];
    if (this.props.useActualValues) {
      headersData = ['', 'Tracked Employees', 'Price per Month*', ''];
    }

    const headers = headersData.map((header, idx) => {
      return (<th className={styles['headers']} key={idx}>{header}</th>);
    });
    return (<tr>{headers}</tr>);
  }

  isNumber(n) { 
    return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
  }

  
  getTableBody() {
    return this.props.values.map((item, idx) => {
      let features = item.features.map((feature, fIdx) => {
        return <li key={fIdx}>{feature}</li>;
      });
      return (<tr key={idx} className={item === this.state.currentItem ? styles['highlight'] : ""}>
                <td><i className={styles[item.className]}></i> {item.name}</td>
                <td>{item.tasks}</td>
                <td>{this.isNumber(item.price) ? '$' : ''}{item.price}</td>
                <td className={styles.features}><ul className="list-unstyled">{features}</ul></td>
              </tr>);
    });
  }

  getPriceTable() {
    const className = ["table-curved", styles['fix-height'], styles['even-stipped']].join(' ')
    return (<Table responsive className={className}>
              <thead>
                {this.getTableHeader()}
              </thead>
              <tbody>
                {this.getTableBody()}
              </tbody>
            </Table>);
  }

  getItem(value) {
    if (this.props.useActualValues) {
      const values = Array.prototype.slice.call(this.props.values);
      values.sort();
      return values.find((item) => { return item.count >= value; });
    }

    const values = Array.prototype.slice.call(this.props.values);
    values.reverse();
    return values.find((item) => { return value >= item.count; });
  }

  tipFormatter(rcValue) {
    if (this.props.useActualValues) {
      return rcValue;
    }
    const item = this.getItem(rcValue);
    return item.tasks;
  }


  onChangeSlider(rcValue) {
    const item = this.getItem(rcValue);
    
    this.setState({
      currentItem: item
    });
    
    if (this.props.onChangePrice) {
      this.props.onChangePrice(item, rcValue);
    }
  }

  render() {
    let marks = {}
    this.props.values.forEach((item) => {
      marks[item.count] = '';
    });

    return (
      <div>
        <Rcslider 
          className={styles['mt25']}
          min={this.props.min}
          max={this.props.max}
          tipFormatter={this.tipFormatter}
          onChange={this.onChangeSlider}
          marks={marks}
          />
        {this.getPriceTable()}
      </div>
    );
  }
}

Calculator.propTypes = { 
  values: PropTypes.array.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onChangePrice: PropTypes.func,
  useActualValues: PropTypes.bool
};

export default Calculator;
*/
