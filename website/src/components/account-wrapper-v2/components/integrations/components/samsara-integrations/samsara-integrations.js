import React, { Component } from 'react';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styles from './../../integrations.module.scss';
import SavingSpinner from '../../../../../saving-spinner/saving-spinner';
import 'react-rangeslider/lib/index.css';
import 'rc-time-picker/assets/index.css';
import 'react-bootstrap-timezone-picker/dist/react-bootstrap-timezone-picker.min.css';
import { getErrorMessage } from '../../../../../../helpers/task';
import { toast } from 'react-toastify';
import { getEquipments, getAllGroups,  getSamsaraFleetList,  updateEquipment,  updateExternalApiSettings, getExternalApiSettings } from '../../../../../../actions';
import cx from 'classnames';

export default class SamsaraIntegrations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      group_data: [],
      access_token: null,
      groups: [],
      equipments: [],
      verifying: false,
      saving: false,
      deleting: false,
      selectedEquipments: [],
      group_ids_list: null
    };

    this.changeAccessToken = this.changeAccessToken.bind(this);
    this.addNewGroup = this.addNewGroup.bind(this);
    this.renderGroupsData = this.renderGroupsData.bind(this);
    this.onChangeSamsaraGroupid = this.onChangeSamsaraGroupid.bind(this);
    this.onChangeArrivyGroupid = this.onChangeArrivyGroupid.bind(this);
    this.renderGroups = this.renderGroups.bind(this);
    this.verifySamsaraGroup = this.verifySamsaraGroup.bind(this);
    this.onChangeEquipment = this.onChangeEquipment.bind(this);
    this.saveEquipmentsToServer = this.saveEquipmentsToServer.bind(this);
  }

  componentWillMount() {

    Promise.all([getExternalApiSettings('SAMSARA'), getAllGroups(), getEquipments()]).then(([profile_data, groups_res, equipment_response]) => {
      const profile = JSON.parse(profile_data);
      const groups = JSON.parse(groups_res);
      const equipments = JSON.parse(equipment_response);
      let external_integration_exists = false;
      this.setState({
        access_token: profile.samsara_integration_info.samsara_access_token,
        group_ids_list: profile.samsara_integration_info.samsara_group_ids
      });

      this.setState({ groups });

      const group_data = [];
      const selectedEquipments = this.state.selectedEquipments;
      equipments.map((equipment) => {
        const external_integrations = equipment.external_integrations;
        if (external_integrations && external_integrations.length > 0) {
          external_integration_exists = true;
          external_integrations.map((external_integration) => {
            const single_group_data = group_data.find((group) => {
              return group.samsara_group_id === external_integration.external_group_id && external_integration.integration_type && external_integration.integration_type[0] === 'SAMSARA';
            });
            equipment.external_integration = external_integration;
            equipment.external_integration.external_resource_type = equipment.external_integration.external_resource_type && equipment.external_integration.external_resource_type[0];
            equipment.external_integration.integration_type = equipment.external_integration.integration_type && equipment.external_integration.integration_type[0];
            const equipmentToPut = $.extend(true, {}, equipment);
            selectedEquipments.push(equipment.id);
            if (single_group_data) {
              single_group_data.equipments.push(equipmentToPut);
            } else {
              group_data.push({
                samsara_group_id: external_integration.external_group_id,
                arrivy_group_id: null,
                equipments: [equipmentToPut],
                verified: true,
                saved: true
              });
            }
          });
        }
      });

      this.state.group_ids_list && this.state.group_ids_list.map((groupid) => {
        const foundGroup = group_data.find((group) => {
          return group.samsara_group_id === groupid;
        });
        if (!foundGroup) {
          group_data.push({
            samsara_group_id: groupid,
            arrivy_group_id: null,
            equipments: [],
            verified: true,
            saved: true
          });
        }
      });
      this.setState({ group_data, equipments });

    });
  }

  verifySamsaraGroup(e, index) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ verifying: true });
    const group_data = this.state.group_data;
    const group_settings = {
      'samsara_group_ids': group_data[index].samsara_group_id,
      'samsara_access_token': this.state.access_token,
      'integration_type': 'SAMSARA'
    };
    updateExternalApiSettings(JSON.stringify([group_settings])).then(() => {
      setTimeout(() => {
        getSamsaraFleetList('SAMSARA', 'FLEET', group_data[index].samsara_group_id).then((res) => {
          const result = JSON.parse(res);
          const vehicles = result[0].vehicles;
          const equipments = [];
          vehicles.map((vehicle) => {
            equipments.push({
              id: null,
              name: '',
              type: '',
              external_integration: {
                integration_type: 'SAMSARA',
                external_resource_type: 'FLEET',
                external_resource_id: vehicle.id,
                external_group_id: group_data[index].samsara_group_id,
                external_resource_name: vehicle.name
              }
            });
          });
          group_data[index].equipments = equipments;
          group_data[index].verified = true;
          group_data[index].saved = false;
          this.setState({ group_data, verifying: false });
        }).catch((err) => {
          this.setState({ verifying: false });
          const errorMsg = getErrorMessage(JSON.parse(err.responseText));
          const updated = {
            text: errorMsg,
            options: {
              type: toast.TYPE.ERROR,
              position: toast.POSITION.BOTTOM_LEFT,
              className: styles.toastErrorAlert,
              autoClose: 8000
            }
          };
          this.props.createToastAlert(updated);
        });
      }, 1e3);
    }).catch((err) => {
      this.setState({ verifying: false });
      const errorMsg = getErrorMessage(JSON.parse(err.responseText));
      const updated = {
        text: errorMsg,
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(updated);
    });
  }

  refreshSamsaraGroup(e, index) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ verifying: true });
    const group_data = this.state.group_data;
    getSamsaraFleetList('SAMSARA', 'FLEET', group_data[index].samsara_group_id).then((res) => {
      const vehicles = JSON.parse(res)[0].vehicles;
      const equipments = group_data[index].equipments;
      group_data[index].saved = false;
      vehicles.map((vehicle) => {
        const found = equipments.find((equipment) => {
          return equipment.external_integration && equipment.external_integration.external_resource_id === vehicle.id;
        });
        if (!found) {
          equipments.push({
            id: null,
            name: '',
            type: '',
            external_integration: {
              integration_type: 'SAMSARA',
              external_resource_type: 'FLEET',
              external_resource_id: vehicle.id,
              external_group_id: group_data[index].samsara_group_id,
              external_resource_name: vehicle.name
            }
          });
        } else {
          group_data[index].saved = true;
        }
      });
      group_data[index].verified = true;
      group_data[index].equipments = equipments;
      this.setState({ group_data, verifying: false });
    }).catch((err) => {
      this.setState({ verifying: false });
      const errorMsg = getErrorMessage(JSON.parse(err.responseText));
      const updated = {
        text: errorMsg,
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(updated);
    });
  }

  changeAccessToken(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ access_token: e.target.value, });
  }

  onChangeEquipment(e, group_index, equipment_index) {
    e.preventDefault();
    e.stopPropagation();
    const group_data = this.state.group_data;
    let selectedEquipments = this.state.selectedEquipments;
    let index = selectedEquipments.indexOf(parseInt(group_data[group_index].equipments[equipment_index].id));
    if (index !== -1) selectedEquipments.splice(index, 1);
    const selectedEquipment = this.state.equipments.find((equipment) => {
      return equipment.id === parseInt(e.target.value);
    });
    if (selectedEquipment) {
      selectedEquipments.push(parseInt(e.target.value));
      group_data[group_index].equipments[equipment_index].id = e.target.value;
      group_data[group_index].equipments[equipment_index].name = selectedEquipment.name;
      group_data[group_index].equipments[equipment_index].type = selectedEquipment.type;
      this.setState({ group_data, selectedEquipments });
    }
    else {
      group_data[group_index].equipments[equipment_index].id = null;
      group_data[group_index].equipments[equipment_index].name = '';
      group_data[group_index].equipments[equipment_index].type = '';
      this.setState({ group_data, selectedEquipments });
    }
  }

  addNewGroup(e) {
    e.preventDefault();
    e.stopPropagation();
    const group_data = this.state.group_data;
    group_data.push({
      samsara_group_id: '',
      arrivy_group_id: null,
      equipments: [],
      verified: false,
      saved: false
    });
    this.setState({ group_data });
  }

  saveEquipmentsToServer(e, index, deleteAllData = false) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ saving: !deleteAllData && true, deleting: deleteAllData && true });
    const group_data = this.state.group_data;
    const equipmentToSendOnServer = {};
    group_data[index].equipments.map((equipment) => {
      if (equipmentToSendOnServer[equipment.id]) {
        equipmentToSendOnServer[equipment.id].equipments.push(equipment.external_integration);
      } else {
        equipmentToSendOnServer[equipment.id] = {
          equipments: [equipment.external_integration],
          name: equipment.name,
          type: equipment.type
        };
      }
    });
    const promises = [];
    const selectedEquipments = this.state.selectedEquipments;
    for (let key in equipmentToSendOnServer) {
      if (key !== 'null' && key !== -1) {
        const deleteEquipmentIndex = selectedEquipments.indexOf(parseInt(key));
        if (deleteAllData && deleteEquipmentIndex !== -1) {
          selectedEquipments.splice(index, 1);
        }
        promises.push(updateEquipment({
          name: equipmentToSendOnServer[key].name,
          type: equipmentToSendOnServer[key].type,
          id: key,
          external_integrations: deleteAllData ? null : JSON.stringify(equipmentToSendOnServer[key].equipments),
        }));
      }
    }
    this.state.equipments && this.state.equipments.map((equipment) => {
      if (this.state.selectedEquipments.indexOf(equipment.id) === -1) {
        promises.push(updateEquipment({
          name: equipment.name,
          type: equipment.type,
          id: equipment.id,
          external_integrations: null,
        }));
      }
    });
    Promise.all(promises).then(() => {

      if (deleteAllData) {
        group_data[index].equipments = [];
      }
      this.setState({ saving: false, deleting: false, group_data, selectedEquipments });
      const updated = {
        text: deleteAllData ? 'Successfully deleted' : 'Successfully updated',
        options: {
          type: toast.TYPE.SUCCESS,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastSuccessAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(updated);
    });
  }

  onChangeSamsaraGroupid(e, index) {
    e.preventDefault();
    e.stopPropagation();
    const group_data = this.state.group_data;
    group_data[index].samsara_group_id = e.target.value;
    this.setState({ group_data });
  }

  onChangeArrivyGroupid(e, index) {
    e.preventDefault();
    e.stopPropagation();
    const group_data = this.state.group_data;
    group_data[index].arrivy_group_id = e.target.value === '' ? null : parseInt(e.target.value);
    this.setState({ group_data });
  }

  renderGroups() {
    const renderedGroups = this.state.groups && this.state.groups.map((group) => {
      return (
        <option value={group.is_implicit ? '' : group.id}
                selected={this.state.equipgroup_id ? (this.state.equipgroup_id === group.id) : group.is_implicit}>{group.name}</option>
      );
    });
    return renderedGroups;
  }

  renderGroupsData() {
    const group_data = this.state.group_data;
    return (
      <div>
        {group_data && group_data.map((single_group_data, index) => {
          return (
            <div className={cx(styles.boxBodyInner, styles.group)}>
              <div className={cx(styles.groupHeader)}>
                <Row>
                  <Col xs={12} sm={6}>
                    <FormGroup>
                      <ControlLabel componentClass={ControlLabel}>Group ID</ControlLabel>
                      <FormControl onChange={(e) => {
                        this.onChangeSamsaraGroupid(e, index);
                      }} id="samsara_group_id" type='text' value={single_group_data.samsara_group_id}/>
                    </FormGroup>
                  </Col>
                  <Col xs={12} sm={6}>
                    <FormGroup>
                      <ControlLabel componentClass={ControlLabel}>Group Name</ControlLabel>
                      <div className={cx(styles.selectBox)}>
                        <FormControl onChange={(e) => {
                          this.onChangeArrivyGroupid(e, index);
                        }} id="arrivyGroupId" componentClass="select" name="equipgroup_id">
                          {this.renderGroups()}
                        </FormControl>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
                <div className="text-right">
                  {!single_group_data.verified ?
                    <Button type="button" disabled={this.state.verifying} className={cx(styles.btn, styles['btn-secondary'])} onClick={(e) => { this.verifySamsaraGroup(e, index) }}>
                      {this.state.verifying ? <SavingSpinner size={8} borderStyle="none" /> : 'Verify'}
                    </Button>
                    :
                    <Button type="button" disabled={this.state.verifying} className={cx(styles.btn, styles['btn-secondary'])} onClick={(e) => { this.refreshSamsaraGroup(e, index) }}>
                      {this.state.verifying ? <SavingSpinner size={8} borderStyle="none" /> : 'Refresh'}
                    </Button>
                  }
                </div>
              </div>
              {single_group_data.equipments && single_group_data.equipments.length > 0 &&
                <div className={cx(styles.groupBody)}>
                  <Row className={cx(styles.headings)}>
                    <Col sm={6}><h3 className={cx(styles.boxTitle)}>Samsara Fleet</h3></Col>
                    <Col sm={6}><h3 className={cx(styles.boxTitle)}>Arrivy Equipment</h3></Col>
                  </Row>
                  {single_group_data.equipments.map((equipment, i) => {
                    return (
                      <FormGroup>
                        <Row>
                          <Col xs={12} sm={6}>
                            <ControlLabel componentClass={ControlLabel}>Name: {equipment.external_integration.external_resource_name}</ControlLabel>
                          </Col>
                          <Col xs={12} sm={6}>
                            <div className={cx(styles.selectBox)}>
                              <FormControl onChange={(e) => this.onChangeEquipment(e, index, i)} componentClass="select" name="equipment_id">
                                <option value={-1} selected={equipment.id === null}>Select Equipment</option>
                                {this.state.equipments.map((equip) => {
                                  const index = this.state.selectedEquipments.indexOf(equip.id);
                                  if (single_group_data.arrivy_group_id === equip.group_id && (index === -1 || parseInt(equipment.id) === equip.id)) {
                                    return <option value={equip.id} selected={equipment.id === equip.id}>{equip.name}</option>
                                  }
                                })}
                              </FormControl>
                            </div>
                          </Col>
                        </Row>
                      </FormGroup>
                    );
                  })}
                  <div className="text-right">
                    {single_group_data.saved &&
                      <Button className={cx(styles.btn, styles['btn-light'], styles['btn-lg'], styles['btn-delete'])} disabled={this.state.deleting} onClick={(e) => { this.saveEquipmentsToServer(e, index, true) }}>
                        {this.state.deleting ? <SavingSpinner size={8} borderStyle="none" /> : 'Delete Mapping'}
                      </Button>
                    }
                    <Button className={cx(styles.btn,  styles['btn-lg'], styles['btn-secondary'])} disabled={this.state.saving} onClick={(e) => { this.saveEquipmentsToServer(e, index) }}>
                      {this.state.saving ? <SavingSpinner size={8} borderStyle="none" /> : 'Save Mapping'}
                    </Button>
                  </div>
                </div>
              }
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return (
      <div id="integration_part" className={cx(styles.integrationsWrapper)}>
        <Grid>
          <div className={cx(styles.box)}>
            <h3 className={cx(styles.boxTitle)}><Link to={'/settings/integrations'}>Apps & Integrations</Link><span>Samsara</span></h3>
            <div className={cx(styles.boxBody)}>
              <Row>
                <Col md={12} lg={6}>
                  <div className={cx(styles.boxBodyMask)}>
                    <div className={cx(styles.boxBodyInner)}>
                      <h3 className={cx(styles.boxTitle)}>Samsara</h3>
                      <FormGroup>
                        <ControlLabel componentClass={ControlLabel}>Access Token</ControlLabel>
                        <FormControl type="text" name="access_token" value={this.state.access_token} onChange={this.changeAccessToken}/>
                      </FormGroup>
                    </div>
                    {this.renderGroupsData()}
                    <div className={cx(styles.boxBodyInner, ['text-right'])}>
                      <Button className={cx(styles.btn, styles['btn-secondary'], styles['btn-lg'])} onClick={this.addNewGroup}>+ Samsara Group</Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Grid>
      </div>
    );
  }
}
