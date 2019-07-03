import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SwatchesPicker,  } from 'react-color';
import { EditableInput,  } from 'react-color/lib/components/common';
import styles from './fields.module.scss';
export const DEFAULT_COLORPICKER_COLOR = '#0693E3';

export default class ColorField extends Component {
  constructor(props) {
    super(props);
    this.showColorPicker = this.showColorPicker.bind(this);
    this.handleChangeComplete = this.handleChangeComplete.bind(this);
    this.changeColor = this.changeColor.bind(this);
    this.hideColorPicker = this.hideColorPicker.bind(this);

    this.state = {
      isShowColorPicker: false,
    };
  }

  handleChangeComplete(color) {
    this.setState({
      isShowColorPicker: false,
    });
    if (this.props.onChange) {
      this.props.onChange(color.hex);
    }
  }

  changeColor(color){
    if (this.props.onChange) {
      this.props.onChange(color.hex);
    }
  }

  showColorPicker() {
    if(this.props.onColorPickerShow) {
      this.props.onColorPickerShow();
    }
    this.setState(Object.assign(this.state, { isShowColorPicker: true }));
  }

  hideColorPicker() {
    this.setState({
      isShowColorPicker: false
    });
  }

  render() {
    const value = this.props.value ? this.props.value : DEFAULT_COLORPICKER_COLOR;

    return (
      <div className={styles.colorPickerContainer}>
        <div className={styles['color-picker']} style={{backgroundColor: value}} onClick={(typeof this.props.canChangeColor === 'undefined' || this.props.canChangeColor === true) ? this.showColorPicker : null} />
        <input type="text" value={value} readOnly className="hidden"/>
        <div className={this.state.isShowColorPicker ?  styles.swatchesPicker : 'hidden'} >
          <SwatchesPicker onChangeComplete={ this.handleChangeComplete }/>
          <div className={ styles.cover } onClick={ this.hideColorPicker }/>
          <span className={styles.close} onClick={ this.hideColorPicker } />
          {this.props.showColorField &&
            <div className={styles.colorField}>
              <EditableInput label="hex" value={ value } onChange={ this.changeColor } />
            </div>
          }
        </div>
      </div>
    );
  }
}

ColorField.propTypes = {
  onChange: PropTypes.func,
  onColorPickerShow: PropTypes.func,
  canChangeColor: PropTypes.bool
};
