import React from 'react';
import PropTypes from 'prop-types';
import { PulseLoader } from 'react-spinners';
import cx from 'classnames';
import scssStyles from './saving-spinner.module.scss';

const SavingSpinner = (props) => {
  const { size, title, color, borderStyle, fontColor, fontSize, className = '' } = props;
  const styles = {
    borderStyle: borderStyle || 'dashed',
    color: fontColor || '#008BF8',
    fontSize: fontSize || 18,
  };
  return (
    <div className={cx('text-center', scssStyles.savingSpinnerContainerStyles, className)} style={styles} >
      {title}
      <PulseLoader color={color || '#008BF8'} size={size || 8}/>
    </div>
  );
};

SavingSpinner.propTypes = {
  title: PropTypes.string,
  color: PropTypes.string,
  borderStyle: PropTypes.string,
  fontSize: PropTypes.number,
  size: PropTypes.number,
  fontColor: PropTypes.string
};

export default SavingSpinner;
