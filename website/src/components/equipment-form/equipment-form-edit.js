import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Image, Grid, Row, Form, Modal, Button, FormGroup, Col, FormControl, ControlLabel, Alert } from 'react-bootstrap';
import styles from './equipment-form-edit.module.scss';
import SavingSpinner from '../saving-spinner/saving-spinner';
import ExtraFields from '../extra-fields/extra-fields';
import cx from "classnames";

const FieldGroup = ({ id, label, staticField, fieldInfo, ...props }) => (
  <FormGroup controlId={id}>
    <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
      {label}
    </Col>
    <Col sm={10}>
      {staticField ?
        (<FormControl.Static>
          {props.value}
         </FormControl.Static>) :
        (<FormControl {...props} />)
      }
      {fieldInfo}
    </Col>
  </FormGroup>
);

FieldGroup.propTypes = {
  value: PropTypes.string
};

export default class EquipmentFormEdit extends Component {
  constructor(props) {
    super(props);
    this.updateImageClick = this.updateImageClick.bind(this);
    this.renderGroups = this.renderGroups.bind(this);
    this.onChangeField = this.onChangeField.bind(this);
    this.state = {};
  }

  updateImageClick() {
    this.refs.imageUploader.click();
  }

  renderGroups() {
    let disableGroupClass = '';
    const renderedGroups = this.props.groups &&  this.props.groups.map((group) => {
      if (group.is_disabled && group.id === parseInt(this.props.fields['group_id'])) {
        disableGroupClass = styles.disableGroup;
      } else {
        disableGroupClass = '';
      }
      if (group.is_disabled && group.id !== parseInt(this.props.fields['group_id'])) {
        return null;
      }
      return (
        <option disabled={disableGroupClass} value={group.is_implicit ? '' : group.id} selected={this.props.fields['group_id'] ? (group.id === parseInt(this.props.fields['group_id'])) : group.is_implicit } className={disableGroupClass}>{group.name}</option>
      );
    });
    return renderedGroups;
  }

  onChangeField(e, fieldName) {
    e.preventDefault();
    e.stopPropagation();
    const field = {
      name: fieldName
    };
    this.props.onChangeField(field, e.target.value);
  };

  render() {
    const { showModal, onHide } = this.props;
    let showGroupDropdown = false;
    if (this.props.groups && (this.props.groups.find((group) => { return group.is_implicit; })) && this.props.groups.length > 1 && this.props.groups.find((group) => { return !group.is_disabled && !group.is_implicit; })) {
      showGroupDropdown = true;
    } else if (this.props.groups && !(this.props.groups.find((group) => { return group.is_implicit; })) && this.props.groups.length > 0 && this.props.groups.find((group) => { return !group.is_disabled; })) {
      showGroupDropdown = true;
    }
    return (
          <Modal
            show={showModal}
            onHide={onHide}
            bsSize="large"
            dialogClassName={styles['edit-modal']}
          >
            <Modal.Header closeButton bsSize="large">
              <h2 className="text-center">Edit Equipment</h2>
            </Modal.Header>
            <Modal.Body>
              <div>
                <Grid>
                  <Col xs={12} sm={4} md={4}>
                    <Row className={styles['account-image'] + ' text-center'}>
                      <Col xs={12} md={12}>
                        <Image src={this.props.fields.image_path || '/images/equipment.png'} thumbnail responsive />
                        {true &&
                          <div
                            onClick={this.updateImageClick}
                            className={styles['image-buttons']}
                          >
                            Change Image
                          </div>
                        }
                        {this.props.fields.image_path &&
                          <div
                            onClick={this.props.removeImage}
                            className={styles['image-buttons']}
                          >
                            Remove
                          </div>
                        }
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={12} sm={6} md={6}>
                    <div className={styles['form-container']}>
                      <Form
                        horizontal
                        onSubmit={this.props.handleSubmitForm}
                      >
                        <input
                          accept="image/png, image/jpg, image/jpeg, image/svg, image/gif"
                          type="file"
                          ref="imageUploader"
                          onChange={this.props.handleImageChange} style={{ display: 'none' }}
                        />
                        <Row>
                          <Col sm={2} className={styles.groupTitle}>
                            <ControlLabel>NAME</ControlLabel>
                          </Col>
                          <Col sm={10}>
                            <FormGroup className={styles.formGroup}>
                              <FormControl key="name" onChange={(e) => this.onChangeField(e, 'name')} className={cx(styles['form-input-control'])} value={this.props.fields['name']} id="name" componentClass="input" name="name"/>
                            </FormGroup>
                          </Col>
                        </Row>
                        {this.props.profile && (this.props.profile.permissions.includes('COMPANY') || this.props.profile.permissions.includes('ASSIGN_GROUPS')) && showGroupDropdown &&
                        <Row>
                          <Col sm={2} className={styles.groupTitle}>
                            <ControlLabel>GROUP</ControlLabel>
                          </Col>
                          <Col sm={10}>
                            <FormGroup className={styles.formGroup}>
                              <FormControl onChange={(e) => this.onChangeField(e, 'group_id')} className={cx(styles['form-input-control'])} id="groups" componentClass="select" name="group_id">
                                {this.renderGroups()}
                              </FormControl>
                            </FormGroup>
                          </Col>
                        </Row>}
                        <Row>
                          <Col sm={2} className={styles.groupTitle}>
                            <ControlLabel>TYPE</ControlLabel>
                          </Col>
                          <Col sm={10}>
                            <FormGroup className={styles.formGroup}>
                              <FormControl key="type" onChange={(e) => this.onChangeField(e, 'type')} className={cx(styles['form-input-control'])} id="type" componentClass="input" name="type" value={this.props.fields['type']}/>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={2} className={styles.groupTitle}>
                            <ControlLabel>Details</ControlLabel>
                          </Col>
                          <Col sm={10}>
                            <FormGroup className={styles.formGroup}>
                              <FormControl key="details" onChange={(e) => this.onChangeField(e, 'details')} className={cx(styles['form-input-control'])} id="details" componentClass="textarea" name="details" value={this.props.fields['details']}/>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Col smOffset={2} sm={10}>
                          <ExtraFields
                            fields={this.props.fields.extra_fields}
                            onChange={this.props.onChangeExtraField}
                            fullWidth
                          />
                        </Col>
                        <FormGroup>
                          <Col smOffset={2} sm={10}>
                            <Button
                              type="button"
                              className={styles['cancel-button']}
                              onClick={onHide}
                              disabled={this.props.updatingEquipment}
                            >
                              Cancel
                            </Button>

                            <Button type="submit" className="btn-submit" disabled={this.props.updatingEquipment}>
                              {this.props.updatingEquipment ?
                                <SavingSpinner title="Saving" borderStyle="none" size={8} />
                              :
                                'Save Changes'
                              }
                            </Button>
                          </Col>
                        </FormGroup>
                        {/*<FormGroup>*/}
                          {/*{this.props.ErrorMsg &&*/}
                            {/*<Alert bsStyle="danger">{this.props.ErrorMsg}</Alert>*/}
                          {/*}*/}
                        {/*</FormGroup>*/}
                      </Form>
                    </div>
                  </Col>
                </Grid>
              </div>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
          </Modal>
    );
  }
}

EquipmentFormEdit.propTypes = {
  onHide: PropTypes.func.isRequired,
  onChangeField: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  updatingEquipment: PropTypes.bool.isRequired,
  fields: PropTypes.array.isRequired,
  removeImage: PropTypes.func.isRequired,
  handleSubmitForm: PropTypes.func.isRequired,
  handleImageChange: PropTypes.func.isRequired,
  onChangeExtraField: PropTypes.func.isRequired,
  ErrorMsg: PropTypes.string.isRequired,
  profile: PropTypes.object,
  groups: PropTypes.object
};
