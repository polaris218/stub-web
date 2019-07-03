import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { Button, FormControl, Row, Col, FormGroup, ControlLabel, Image } from 'react-bootstrap';
import SavingSpinner from '../saving-spinner/saving-spinner';
import styles from './entity-form.module.scss';
import ExtraFields from '../extra-fields/extra-fields';
import { ColorField } from '../fields';
import SwitchButton from '../../helpers/switch_button';
import cx from 'classnames';
const FieldGroup = ({ id, label, staticField, fieldInfo, extra, ...props }) => (
    <FormGroup controlId={id}>
            {extra}
            {staticField ?
                (<FormControl.Static>
                    {props.value}
                </FormControl.Static>) :
                (<FormControl {...props} />)
            }
            {fieldInfo}
    </FormGroup>
);

FieldGroup.propTypes = {
    value: PropTypes.string
};

export default class EntityForm extends Component {
  constructor(props) {
    super(props);
    this.createEntity = this.createEntity.bind(this);
    this.updateImageClick = this.updateImageClick.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
    this.onSwitchChange = this.onSwitchChange.bind(this);
    this.state = { isColorPickerActive: false, colorField: '', can_turnoff_location: true };
  }

  componentWillReceiveProps(nextProps) {
    // Means there was an active entity creation call that completed
    if (this.props.sendingEntity && !nextProps.sendingEntity && nextProps.entityAdded) {
      $(findDOMNode(this.refs.name)).val('');
      $(findDOMNode(this.refs.type)).val('');
      $(findDOMNode(this.refs.email)).val('');
      $(findDOMNode(this.refs.phone)).val('');
      $(findDOMNode(this.refs.details)).val('');
      $(findDOMNode(this.refs.color)).val('');
      $(findDOMNode(this.refs.can_turnoff_location)).val('');
    }
  }

  updateImageClick() {
      this.refs.imageUploader.click();
  }

  onColorChange(hex) {
      this.props.fields['color'] = hex;
      this.setState({isColorPickerActive: false, colorField: hex});
  }

  createEntity(e) {
    e.preventDefault();
    e.stopPropagation();

    const name = findDOMNode(this.refs.name).value.trim();
    const type = findDOMNode(this.refs.type).value.trim();
    const email = findDOMNode(this.refs.email).value.trim();
    const phone = findDOMNode(this.refs.phone).value.trim();
    const details = findDOMNode(this.refs.details).value.trim();
    const color = this.state.colorField;
    const can_turnoff_location = this.state.can_turnoff_location;

    this.props.createEntity({ name, type, email, phone, details, color, can_turnoff_location });
  }

  onSwitchChange() {
    this.setState({ can_turnoff_location: !this.state.can_turnoff_location });
  }

  render() {
      const colorField = (
          <div className={styles['entity-color-wrapper']}>
              <FormControl
                  componentClass={ColorField}
                  value={this.props.fields['color'] || ''}
                  onColorPickerShow={this.onColorPickerShow}
                  onChange={this.onColorChange}
                  ref="color"
              />
          </div>
      );
    return (
      <form className={styles.noMargin} onSubmit={this.createEntity}>
        <Row>
            <Col xs={12} md={4} sm={4}>
                <Row className={styles['account-image'] + ' text-center'}>
                    <Col xs={12} md={12} className="text-center">
                        <Image src={this.props.fields.image_path || '/images/user.png'} thumbnail responsive className={styles.userImage} />
                        <p className="text-center"><i>You will set image once team member is added.</i></p>
                    </Col>
                </Row>
            </Col>
            <Col xs={12} md={8} sm={8} className={styles.formMarginFix}>
                <Row>
                    <Col md={12} sm={12}>
                        <FormGroup className={styles.formGroup}>
                            <FormControl className={cx(styles['form-input-control'], styles['fullNameField'])} id="name" type="text" placeholder="Name" ref="name"/>
                            {colorField}
                        </FormGroup>
                    </Col>
                    <Col md={12} sm={12}>
                        <FormGroup className={styles.formGroup}>
                            <FormControl className={styles['form-input-control']} id="type" type="text" placeholder="Position" ref="type"/>
                        </FormGroup>
                    </Col>
                    <Col md={12} sm={12}>
                        <FormGroup className={styles.formGroup}>
                            <FormControl className={styles['form-input-control']} id="email" type="text" placeholder="Email (optional)" ref="email"/>
                            <p><i>*Arrivy will send an invitation to this email address to join your company and get access to assigned tasks and enable progress reporting.</i></p>
                        </FormGroup>
                    </Col>
                    <Col md={12} sm={12}>
                        <FormGroup className={styles.formGroup}>
                            <FormControl className={styles['form-input-control']} id="phone" type="tel" placeholder="Phone (optional)" ref="phone"/>
                        </FormGroup>
                    </Col>
                    <Col md={12} sm={12}>
                        <FormGroup className={styles.formGroup}>
                            <FormControl componentClass="textarea" className={styles['form-input-control']} id="details" placeholder="Details (optional)" ref="details"/>
                        </FormGroup>
                    </Col>
                    <Col md={12} sm={12}>
                      <FormGroup className={cx(styles.formGroup, styles.switch)}>
                        <SwitchButton onChange={() => this.onSwitchChange()} name="can_turnoff_location" labelRight="Can turn off location service" checked={this.state.can_turnoff_location} />
                      </FormGroup>
                    </Col>
                </Row>
            </Col>
        </Row>
        <Row>
            <Col md={12} sm={12}>
                <div className={styles.modalTempFooter}>
                    <div className="text-center">
                        {this.props.sendingEntity ?
                            <SavingSpinner borderStyle="none" title="Saving" fontSize={14} />
                            :
                            <Button type="submit" className='btn-submit'>
                                Add
                            </Button>
                        }
                    </div>
                </div>
            </Col>
        </Row>
      </form>);
  }
}

EntityForm.propTypes = {
  createEntity: PropTypes.func.isRequired,
  sendingEntity: PropTypes.bool.isRequired,
  entityAdded: PropTypes.bool,
  onChangeExtraField: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
};
