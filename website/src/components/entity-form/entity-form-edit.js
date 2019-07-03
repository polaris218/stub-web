import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Image, Grid, Row, Form, Modal, Button, FormGroup, Col, FormControl, ControlLabel } from 'react-bootstrap';
import styles from './entity-form-edit.module.scss';
import cx from 'classnames';
import { PulseLoader } from 'react-spinners';
import ExtraFields from '../extra-fields/extra-fields';
import { ColorField } from '../fields';
import SwitchButton from '../../helpers/switch_button';

const FieldGroup = ({ id, label, staticField, fieldInfo, extra, ...props }) => (
  <FormGroup controlId={id}>
    <Col sm={12} xs{12}>
      {extra}
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

export default class EntityFormEdit extends Component {
  constructor(props) {
    super(props);
    this.updateImageClick = this.updateImageClick.bind(this);
    this.onColorPickerShow = this.onColorPickerShow.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
    this.onSwitchChange = this.onSwitchChange.bind(this);
    this.state = {isColorPickerActive: false};
  }

  updateImageClick() {
    this.refs.imageUploader.click();
  }

  onColorPickerShow() {
    this.setState({isColorPickerActive: true})
  }

  onColorChange(hex) {
    this.props.fields['color'] = hex;
    this.setState({isColorPickerActive: false});
  }

  onSwitchChange() {
    this.props.onChangeField({ name:'can_turnoff_location' }, !this.props.fields['can_turnoff_location']);
  }

  render() {
    const { showModal, onHide } = this.props;

    const onChangeField = (field) => {
      return (event) => {
        this.props.onChangeField(field, event.target.value);
      };
    };

    const colorField = (
      <div className={styles['entity-color-wrapper']}>
        <FormControl 
          componentClass={ColorField}
          value={this.props.fields['color'] || ''}
          onColorPickerShow={this.onColorPickerShow}
          onChange={this.onColorChange}
        />
      </div>
    );
    const fields = [
      {
        name: 'name',
        label: 'Name',
        extra: colorField,
        className: cx(styles['entity-name-field'], (this.state.isColorPickerActive ? ' hidden' : ''))
      },
      {
        name: 'type',
        label: 'Position'
      },
      {
        name: 'email',
        label: 'Email'
      },{
        name: 'phone',
        label: 'Phone',
        type: 'tel'
      },
      {
        name: 'details',
        label: 'Details',
        fieldClass: 'textarea'
      }
    ].map((field, idx) => {
      return (
        <FieldGroup
          staticField={field.static || false}
          componentClass={field.fieldClass || 'input'}
          key={idx}
          onChange={onChangeField(field)}
          id={field.name}
          type={ field.type || 'text' }
          placeholder={field.label}
          value={this.props.fields[field.name] || ''}
          fieldInfo={field.fieldInfo || ''}
          extra={field.extra}
          className={field.className}
        />);
    });

    return (
          <Modal
            show={showModal}
            onHide={onHide}
            dialogClassName={styles['edit-modal']}
            className={styles.editMemberModal}
          >
            <Modal.Header className={styles.entityEditModalHeader} closeButton bsSize="large">
              <h2 className={styles.editEntityHeading}>Edit Team Member</h2>
            </Modal.Header>
            <Modal.Body className={styles.noPaddingModal}>
              <div>
                <Form
                  horizontal
                  onSubmit={this.props.handleSubmitForm}
                  className={styles.noMargin}
                >
                <Grid>
                  <Col xs={12} sm={4} md={4}>
                    <Row className={styles['account-image'] + ' text-center'}>
                      <Col xs={12} md={12} className="text-center">
                        <Image src={this.props.fields.image_path || '/images/user.png'} thumbnail responsive className={styles.userImage} />
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
                  <Col xs={12} sm={8} md={8}>
                    <div className={styles['form-container']}>
                        <input
                          accept="image/png, image/jpg, image/jpeg, image/svg, image/gif"
                          type="file"
                          ref="imageUploader"
                          onChange={this.props.handleImageChange} style={{ display: 'none' }}
                        />
                        {fields}
                        {!this.props.fields.is_default &&
                        <Col md={12} sm={12}>
                          <FormGroup className={styles.switch}>
                            <SwitchButton onChange={() => this.onSwitchChange()} name="can_turnoff_location" labelRight="Can turn off location service"
                                          checked={this.props.fields['can_turnoff_location']} />
                          </FormGroup>
                        </Col>
                        }
                        <Col smOffset={0} sm={12}>
                          <ExtraFields
                            fields={this.props.fields.extra_fields}
                            onChange={this.props.onChangeExtraField}
                            fullWidth
                          />
                        </Col>
                    </div>
                  </Col>
                </Grid>
                  <div className={styles.modalTempFooter}>
                    <FormGroup>
                      <Col smOffset={0} sm={12}>
                        < Button
                            type="button"
                            className={styles['cancel-button']}
                            onClick={onHide}
                            disabled={this.props.updatingEntity}
                        >
                          Cancel
                        </Button>

                        <Button type="submit" className="btn-submit" disabled={this.props.updatingEntity}>
                            {this.props.updatingEntity ?
                                <span>
                                  Saving <PulseLoader size={8} color="#ffffff" />
                                </span>
                                :
                                'Save Changes'
                            }
                        </Button>
                      </Col>
                        {this.props.ErrorMsg && (
                            <Col smOffset={2} sm={10} className="text-danger">
                                {this.props.ErrorMsg}
                            </Col>
                        )}
                    </FormGroup>
                  </div>
                </Form>
              </div>
            </Modal.Body>
          </Modal>
    );
  }
}

EntityFormEdit.propTypes = {
  onHide: PropTypes.func.isRequired,
  onChangeField: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  updatingEntity: PropTypes.bool.isRequired,
  fields: PropTypes.array.isRequired,
  removeImage: PropTypes.func.isRequired,
  handleSubmitForm: PropTypes.func.isRequired,
  handleImageChange: PropTypes.func.isRequired,
  onChangeExtraField: PropTypes.func.isRequired,
  ErrorMsg: PropTypes.string.isRequired
};
