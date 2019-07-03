import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import styles from './fields.module.scss';

export default class FieldGroup extends Component {

    render() {
      const { id, label, groupClassName, staticValue, fieldInfo, ...props } = this.props;
      
      return (
        <FormGroup className={groupClassName} controlId={id}>
          {label && <ControlLabel>{label}</ControlLabel>}
          {!staticValue && <FormControl {...props} />}
          {staticValue && <FormControl.Static {...props} >{staticValue}</FormControl.Static>}
          {fieldInfo ? <div className={styles.fieldInfo}>{fieldInfo}</div> : null}
        </FormGroup>);
    }
}

FieldGroup.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  fieldInfo: PropTypes.string,
  groupClassName: PropTypes.string,
  staticValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.symbol,
    PropTypes.bool
  ])
};
