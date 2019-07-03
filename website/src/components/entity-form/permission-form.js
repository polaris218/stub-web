import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Modal, Button, FormGroup, Col, Radio } from 'react-bootstrap';
import styles from './permission-form.module.scss';
import { getPermissions, updatePermissiosn } from '../../actions/permissions';
import SavingSpinner from '../saving-spinner/saving-spinner';


export default class EntityPermissionsForm extends Component {
  constructor(props) {
    super(props);
    this.getUserPermissions = this.getUserPermissions.bind(this);
    this.updateUserPermissions = this.updateUserPermissions.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);

    this.state = {
      entity: null,
      permissions: [],
      updatingPermissions: false
    };
  }

  componentDidMount() {
    this.getUserPermissions(this.props.entity.id);
  }

  getUserPermissions(entity_id) {
    getPermissions(entity_id).then((permissions) => {
      this.setState({
        permissions: JSON.parse(permissions)
      });
    }).catch((err) => {
      console.log('error : ' + err);
    });
  }

  updateUserPermissions() {
    this.setState({ updatingPermissions: true });
    updatePermissiosn(this.props.entity.id, JSON.stringify(this.state.permissions)).then(() => {
      this.setState({ updatingPermissions: false });
      this.props.showAlert();
      this.props.onHide();
    }).catch((err) => {
      console.log('error : ' + err);
    });
  }

  onChangeHandler (e) {
    const permissions = this.state.permissions;
    for (let i = 0; i < permissions.length; i++) {
      if (e.target.value == permissions[i].id) {
        permissions[i].status = true;
      } else {
        permissions[i].status = false;
      }
    }
    this.setState({ permissions });
  }


  render() {
    const { showModal, onHide } = this.props;
    const permissionsRendered = this.state.permissions.map((permission) => {
      return (
        <Col md={6}>
          <div key={permission.id} className={styles.permission}>
            <Radio onChange={(e) => this.onChangeHandler(e)} checked={permission.status} value={permission.id} name="permission">
              <span className={styles.permissionTitle}>{permission.title}</span>
            </Radio>
            <p className={styles.permissionDescription}>{permission.description}</p>
          </div>
        </Col>
      );
    });
    return (
      <Modal
        show={showModal}
        onHide={onHide}
        dialogClassName={styles['edit-modal']}
        className={styles.editMemberModal}
      >
        <Modal.Header className={styles.entityEditModalHeader} closeButton bsSize="large">
          <h2 className={styles.editEntityHeading}>Edit Permissions for {this.props.entity.name}</h2>
        </Modal.Header>
        <Modal.Body className={styles.noPaddingModal}>
          <div>
            <Row>
              {permissionsRendered}
            </Row>
          </div>
          <div className={styles.modalTempFooter}>
            <FormGroup>
              <Col smOffset={0} sm={12}>
                < Button
                  type="button"
                  className={styles['cancel-button']}
                  onClick={onHide}
                >
                  Cancel
                </Button>

                <Button type="submit" className="btn-submit" onClick={() => this.updateUserPermissions()}>
                  {this.state.updatingPermissions ?
                    <SavingSpinner title="Loading" borderStyle="none" size={8} />
                    :
                    'Save Changes'
                  }
                </Button>
              </Col>
            </FormGroup>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

EntityPermissionsForm.propTypes = {
  onHide: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  entity: PropTypes.object,
  showAlert: PropTypes.func,
};
