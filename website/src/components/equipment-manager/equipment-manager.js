import React, {Component} from 'react';
import PropTypes from 'prop-types';

import update from 'immutability-helper';
import Joyride from 'react-joyride';
import {Table, Alert, Grid, Row, Col, Button, Image} from 'react-bootstrap';
import styles from './equipment-manager.module.scss';
import EquipmentForm from '../equipment-form/equipment-form';
import EquipmentFormEdit from '../equipment-form/equipment-form-edit';
import {Link} from 'react-router-dom';
import {getErrorMessage} from '../../helpers/task';
import cx from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faChevronLeft, faChevronRight, faSpinner} from '@fortawesome/fontawesome-free-solid';
import SavingSpinner from '../saving-spinner/saving-spinner';
import {toast, ToastContainer} from 'react-toastify';
import {getExternalIntegrationData} from '../../actions';
import {LocationMapV2} from '../../components';

export default class EquipmentManager extends Component {
    constructor(props) {
        super(props);
        this.removeEquipment = this.removeEquipment.bind(this);
        this.createEquipment = this.createEquipment.bind(this);
        this.equipmentToShowOnMapChanged = this.equipmentToShowOnMapChanged.bind(this);
        this.openEditModal = this.openEditModal.bind(this);
        this.closeEditModal = this.closeEditModal.bind(this);
        this.onChangeField = this.onChangeField.bind(this);
        this.removeImage = this.removeImage.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
        this.handleSubmitForm = this.handleSubmitForm.bind(this);
        this.onChangeExtraField = this.onChangeExtraField.bind(this);
        this.modifyIdsDisplay = this.modifyIdsDisplay.bind(this);
        this.paginationNextClicked = this.paginationNextClicked.bind(this);
        this.paginationPrevClicked = this.paginationPrevClicked.bind(this);
        this.createToastAlert = this.createToastAlert.bind(this);
        this.renderfleetOnMap = this.renderfleetOnMap.bind(this);
        this.state = {
            alerts: props.alerts || [],
            equipments: null,
            locations: null,
            equipmentToShowOnMap: 'All',
            showModal: false,
            editFormError: '',
            editForm: {},
            timer: null,
            sendingEquipment: false,
            updatingEquipment: false,
            equipmentAdded: false,
            joyrideOverlay: true,
            joyrideType: 'single',
            ready: false,
            showIds: false,
            items_per_page: 100,
            page: 1,
            fetchingMoreEquipments: false,
            fleetsensor: [],
            fleetlocation: [],
            steps: [{
                title: 'First Equipment',
                text: 'Once you create an equipment here you will be able to assign it to your tasks.',
                selector: '#equipment-formarea',
                position: 'top',
                style: {
                    mainColor: '#12d217',
                    beacon: {
                        inner: '#12d217',
                        outer: '#12d217'
                    }
                }
            }]
        };
    }

    componentDidMount() {
        this.startAsyncUpdate();
    }

    componentWillUnmount() {
        if (this.state.timer) {
            clearTimeout(this.state.timer);
        }
    }

    paginationPrevClicked() {
        this.setState({
            fetchingMoreEquipments: true
        });
        const localPageNum = this.state.page;
        const newPage = localPageNum - 1;
        if (localPageNum > 1) {
            this.setState({
                    page: newPage,
                },
                () => this.updateEquipments(false));
        } else {
            this.setState({
                    page: 1,
                },
                () => this.updateEquipments(false));
        }
    }

    paginationNextClicked() {
        this.setState({
            fetchingMoreEquipments: true
        });
        const localPageNum = this.state.page;
        const newPage = localPageNum + 1;
        this.setState({
                page: newPage,
            },
            () => this.updateEquipments(false));
    }

    startAsyncUpdate() {
        this.updateEquipments();
        const timer = setTimeout(() => {
            this.startAsyncUpdate();
        }, 6e4);

        this.setState({
            editFormError: '',
            timer
        });
    }

    convertFieldsForEditing(fields) {
        const result = fields ? Object.keys(fields).map((key) => {
            return {
                name: key,
                value: fields[key]
            };
        }) : [];

        return result;
    }

    convertFieldsForStorage(fields) {
        const fields_filtered = fields.filter((item) => {
            return item.name !== '' || item.value !== '';
        });
        const extra_fields = {};
        fields_filtered.forEach((field) => {
            extra_fields[field.name] = field.value;
        });

        return extra_fields;
    }

    onChangeExtraField(fields) {
        this.setState({
            editFormError: '',
            editForm: update(this.state.editForm, {
                extra_fields: {$set: fields}
            })
        });
    }

    onChangeField(field, value) {
        this.setState({
            editFormError: '',
            editForm: update(this.state.editForm, {
                [field.name]: {$set: value}
            })
        });
    }

    getSimpleEmptyEquipmentText() {
        return (<div className={styles['no-equipment-simple']}>
            Add your first equipment above
        </div>);
    }

    getEmptyEquipmentText() {

        const style = {
            'background-image': 'url(images/help/template_map_image.jpg)',
            'background-repeat': 'no-repeat',
            'background-attachment': 'fixed',

        };

        let message = this.props.hideEquipmentsList ?
            <h3 className={styles['text-blocks']}>Add your equipment on <Link to='/equipment'
                                                                              style={{color: '#337ab7'}}>Equipment
                page</Link></h3>
            : <h3 className={styles['text-blocks']}>Add your first equipment above</h3>;

        return (<div className={styles['no-equipment']}>
            <div style={style}>
                <Row>
                    <Col sm={8} md={8}>
                        <div className={styles['center-content']}>
                            <div>
                                <h3 className={styles['text-blocks']}>
                                    Install arrivy app on your phone and your team member's phones to see live location
                                    here.
                                </h3>
                                {message}
                                <p className={styles['text-blocks']} style={{fontSize: '16px'}}>
                                    Note: Live location is for business only. Location is only shown to customer when
                                    the team member starts the assigned task by marking it 'on our way'
                                </p>
                            </div>
                        </div>
                    </Col>
                    <Col sm={4} md={4}>
                        <img style={{height: '100%', padding: '20px', maxHeight: '600px'}}
                             src='images/help/activate_location_on_phone.gif'/>
                    </Col>
                </Row>
            </div>
        </div>);
    }

    handleImageChange(e) {
        e.preventDefault();
        e.stopPropagation();
        const image = e.target.files[0];
        if (typeof image !== 'undefined' && (image.type === 'image/jpeg' || image.type === 'image/jpg' || image.type === 'image/svg' || image.type === 'image/png' || image.type === 'image/gif')) {
            const reader = new FileReader();

            reader.readAsDataURL(image);

            reader.onloadend = () => {
                this.setState({
                    editFormError: '',
                    editForm: update(this.state.editForm, {
                        image_path: {$set: reader.result},
                        image: {$set: image}
                    })
                });

                this.props.getEquipmentImageUrl(this.state.editForm.id).then((response) => {
                    const {upload_url, file_id} = JSON.parse(response);
                    const data = new FormData();
                    data.append('file-0', this.state.editForm.image);

                    this.props.updateEquipmentImage(upload_url, data).then((resp) => {
                        const {file_path} = JSON.parse(resp);
                        const equipmentIndex = this.state.equipments.findIndex(el => el.id === this.state.editForm.id);
                        this.setState({
                            editFormError: '',
                            equipments: update(this.state.equipments, {
                                [equipmentIndex]: {
                                    image_id: {$set: file_id},
                                    image_path: {$set: file_path}
                                }
                            }),
                            editForm: update(this.state.editForm, {
                                image_id: {$set: file_id},
                                image_path: {$set: file_path}
                            })
                        });
                    });
                });
            };
        } else {
            const alert = {
                text: 'Please upload a valid image file.',
                options: {
                    type: toast.TYPE.ERROR,
                    position: toast.POSITION.BOTTOM_LEFT,
                    className: styles.toastErrorAlert,
                    autoClose: 8000
                }
            };
            this.createToastAlert(alert);
        }
    }

    removeImage() {
        this.props.removeEquipmentImage(this.state.editForm.id, this.state.editForm.image_id)
            .then(() => {
                const equipmentIndex = this.state.equipments.findIndex(el => el.id === this.state.editForm.id);
                this.setState({
                    editFormError: '',
                    equipments: update(this.state.equipments, {
                        [equipmentIndex]: {
                            image_id: {$set: ''},
                            image_path: {$set: ''}
                        }
                    }),
                    editForm: update(this.state.editForm, {
                        image_path: {$set: ''},
                        image_id: {$set: ''}
                    })
                });
            })
            .catch((err) => {
                const responseText = JSON.parse(err.responseText);
                const alert = {
                    text: getErrorMessage(responseText),
                    options: {
                        type: toast.TYPE.ERROR,
                        position: toast.POSITION.BOTTOM_LEFT,
                        className: styles.toastErrorAlert,
                        autoClose: 8000
                    }
                };
                this.createToastAlert(alert);
            });


    }

    handleSubmitForm(e) {
        e.preventDefault();
        e.stopPropagation();

        this.setState({editFormError: '', updatingEquipment: true});

        const updatedEquipment = jQuery.extend(true, {}, this.state.editForm);

        if (updatedEquipment.name === '' || updatedEquipment.name === null) {
            const editFormError = 'Equipment name is required.';
            const alert = {
                text: editFormError,
                options: {
                    type: toast.TYPE.ERROR,
                    position: toast.POSITION.BOTTOM_LEFT,
                    className: styles.toastErrorAlert,
                    autoClose: 8000
                }
            };
            this.createToastAlert(alert);
            this.setState({
                updatingEquipment: false
            });
            return false;
        }

        updatedEquipment.extra_fields = JSON.stringify(this.convertFieldsForStorage(updatedEquipment.extra_fields));

        this.props.updateEquipment(updatedEquipment).then(() => {
            this.setState({editFormError: '', updatingEquipment: false});
            const equipmentIndex = this.state.equipments.findIndex(el => el.id === this.state.editForm.id);
            this.setState({
                editFormError: '',
                equipments: update(this.state.equipments, {
                    [equipmentIndex]: {
                        name: {$set: this.state.editForm.name},
                        type: {$set: this.state.editForm.type},
                        details: {$set: this.state.editForm.details},
                        extra_fields: {$set: this.state.editForm.extra_fields},
                        group_id: {$set: this.state.editForm.group_id}
                    }
                }),
                showModal: false,
            });
            const alert = {
                text: 'Equipment saved successfully.',
                options: {
                    type: toast.TYPE.SUCCESS,
                    position: toast.POSITION.BOTTOM_LEFT,
                    className: styles.toastSuccessAlert,
                    autoClose: 8000
                }
            };
            this.createToastAlert(alert);
        }).catch((err) => {
            this.setState({updatingEquipment: false});
            const responseText = JSON.parse(err.responseText);
            const alert = {
                text: getErrorMessage(responseText),
                options: {
                    type: toast.TYPE.ERROR,
                    position: toast.POSITION.BOTTOM_LEFT,
                    className: styles.toastErrorAlert,
                    autoClose: 8000
                }
            };
            this.createToastAlert(alert);
        });
    }

    createEquipment({name, type, group_id}) {
        if (group_id === '-1') {
            const groupError = {
                text: 'Equipment Group is required. Please select a group for equipment.',
                options: {
                    type: toast.TYPE.ERROR,
                    position: toast.POSITION.BOTTOM_LEFT,
                    className: styles.toastErrorAlert,
                    autoClose: 8000
                }
            };
            this.createToastAlert(groupError);
            return;
        }
        this.setState({editFormError: '', sendingEquipment: true, equipmentAdded: false});
        this.props.createEquipment({name, type, details: '', group_id})
            .then(() => {
                this.setState({editFormError: '', sendingEquipment: false, equipmentAdded: true});
                setTimeout(() => {
                    this.updateEquipments();
                    const equipmentAdded = {
                        text: 'Equipment [' + name + '] was added!',
                        options: {
                            type: toast.TYPE.SUCCESS,
                            position: toast.POSITION.BOTTOM_LEFT,
                            className: styles.toastSuccessAlert,
                            autoClose: 8000
                        }
                    };
                    this.createToastAlert(equipmentAdded);
                }, 1e2);
            })
            .catch((res) => {
                this.setState({sendingEquipment: false});
                const error = JSON.parse(res.responseText);
                const addEqpError = {
                    text: getErrorMessage(error),
                    options: {
                        type: toast.TYPE.ERROR,
                        position: toast.POSITION.BOTTOM_LEFT,
                        className: styles.toastErrorAlert,
                        autoClose: 8000
                    }
                };
                this.createToastAlert(addEqpError);
            });
    }

    removeEquipment(equipment) {
        const r = confirm("Are you sure that you want to delete '" + equipment.name + "'?");
        if (r) {
            if (this.props.deleteEquipment) {
                this.props.deleteEquipment(equipment.id)
                    .then(() => {
                        setTimeout(() => {
                            const eqpDeleted = {
                                text: 'Equipment ' + equipment.name + ' was removed',
                                options: {
                                    type: toast.TYPE.SUCCESS,
                                    position: toast.POSITION.BOTTOM_LEFT,
                                    className: styles.toastSuccessAlert,
                                    autoClose: 8000
                                }
                            };
                            this.createToastAlert(eqpDeleted);
                            this.updateEquipments();
                        }, 1e2);
                    });
            }
        }
    }

    updateEquipments(checkNewEquipment = true) {
        const items_per_page = this.state.items_per_page;
        const page = this.state.page;
        this.props.updateEquipments(items_per_page, page).then((equipments) => {
            let jsonEquipments = JSON.parse(equipments);
            const Equipments = jsonEquipments;
            Equipments.map((equipment) => {
                  if (equipment.external_integrations.length > 0) {
                    getExternalIntegrationData(equipment.id).then((res) => {
                        const result = JSON.parse(res);
                        const equipments = this.state.equipments;
                        const foundIndex = equipments && equipments.findIndex((single_equipment) => {
                            return single_equipment.id === equipment.id;
                        });

                        if (foundIndex > -1 && result.length > 0) {
                            equipments[foundIndex].external_data = {
                                location: result[0].location,
                                speed: result[0].speedMilesPerHour + 'mph',
                                lat: result[0].latitude,
                                lng: result[0].longitude,
                            };
                        } else if (foundIndex > -1) {
                            equipments[foundIndex].external_data = {
                                location: 'Not found',
                            };
                        }
                        this.setState({
                            equipments
                        });
                    }).catch((e) => {
                        const equipments = this.state.equipments;
                        const foundIndex = equipments && equipments.findIndex((single_equipment) => {
                            return single_equipment.id === equipment.id;
                        });
                        if (foundIndex > -1) {
                            equipments[foundIndex].external_data = {
                                location: 'Not found',
                            };
                        }
                        this.setState({
                            equipments
                        });
                    });
                 }
                else {
                        const equipments = this.state.equipments || jsonEquipments;
                        const foundIndex = equipments.findIndex((single_equipment) => {
                            return single_equipment.id === equipment.id;
                        });
                        if (foundIndex > -1) {
                            equipments[foundIndex].external_data = {
                                location: 'Not found',
                            };
                        }

                }
            });


            // getExternalApiSettings('SAMSARA').then((data) => {
            //     const api_settings = JSON.parse(data);
            //     const {access_token, group_ids} = api_settings.samsara_info
            //     this.setState({
            //         access_token,
            //         group_ids
            //     });
            //     // if (this.state.group_ids) {
            //     //     this.state.group_ids.map((a) => {
            //     //         getSensorsvitals('SAMSARA', 'SENSOR').then((res) => {
            //     //             const samgroupid = [];
            //     //             samgroupid.push(JSON.parse(res))
            //     //             // console.log(samgroupid);
            //     //             this.setState({
            //     //                 fleetsensor: samgroupid[0],
            //     //             })
            //     //         }).catch((error) => {
            //     //             console.log(error);
            //     //         });
            //     //     });
            //     // }
            // }).catch((error) => {
            //     console.log(error);
            // });


            if (this.props.newlyFetchedEquipmentsCallback) {
                this.props.newlyFetchedEquipmentsCallback(jsonEquipments);
            }

            if (jsonEquipments.length === 0 && this.state.page === 1 && this.joyride) {
                this.joyride.start();
            }

            jsonEquipments = jsonEquipments.map((equipment) => {
                if (checkNewEquipment && this.state.equipments) {
                    const findEquipment = this.state.equipments.find((e) => {
                        return e.id === equipment.id;
                    })
                    equipment.new = !(findEquipment);
                    if (findEquipment) {
                        equipment.external_data = {
                            location: findEquipment.external_data.location,
                            speed: findEquipment.external_data.speed,
                            lat: findEquipment.external_data.lat,
                            lng: findEquipment.external_data.lng,
                        };
                    }
                }
                const extra_fields = equipment.extra_fields;
                equipment.extra_fields = this.convertFieldsForEditing(extra_fields);
                return equipment;
            });

            this.setState({
                editFormError: '', equipments: jsonEquipments,
                alerts: this.state.alerts, fetchingMoreEquipments: false
            });
        });
    }

    removeAlert(idx) {
        this.setState({
            editFormError: '',
            alerts: this.state.alerts.filter((alert, id) => {
                return id !== idx;
            })
        });
    }

    addAlert(alert) {
        const alerts = this.state.alerts;
        const removeAlert = this.removeAlert.bind(this);
        alert.timeout = (idx) => {
            setTimeout(() => {
                removeAlert(idx);
            }, 1e4);
        };
        alerts.push(alert);
        this.setState({
            alerts,
            editFormError: '',
            equipments: this.state.equipments
        });
    }

    equipmentToShowOnMapChanged(e) {
        this.setState({
            editFormError: '',
            equipmentToShowOnMap: e.target.value
        });
    }

    openEditModal(equipment_id) {
        const equipment = this.state.equipments.find((el) => el.id === equipment_id);

        const equipmentToEdit = Object.assign({}, equipment);
        if (this.props.groups && !this.props.groups.find((group) => {
            return group.id === parseInt(equipmentToEdit['group_id']);
        })) {
            equipmentToEdit['group_id'] = null;
        }
        this.setState({editFormError: '', showModal: true, editForm: equipmentToEdit});
    }

    closeEditModal() {
        this.setState({editFormError: '', showModal: false});
    }

    modifyIdsDisplay() {
        this.setState({editFormError: '', showIds: !this.state.showIds});
    }


    renderEquipment(equipment, key) {
        this.can_edit = false;
        this.can_delete = false;
        if (this.props.profile && this.props.profile.permissions) {
            let permissions = this.props.profile.permissions;
            let is_company = false;
            if (permissions.includes('COMPANY')) is_company = true;
            if (is_company || permissions.includes('EDIT_EQUIPMENT')) this.can_edit = true;
            if (is_company || permissions.includes('DELETE_EQUIPMENT')) this.can_delete = true;
        }

        const removeEquipment = () => this.removeEquipment(equipment);
        const openEditModal = () => this.openEditModal(equipment.id);

        return (
            <tr className={equipment.new ? styles['new-equipment'] : ''} key={'equipment_' + key}>
                <td>
                    <div className={styles['equipment-image']}>
                        <Image src={equipment.image_path || '/images/equipment.png'} thumbnail responsive/>
                    </div>
                </td>
                {this.state.showIds ? <td>{equipment.id}</td> : null}
                <td>{equipment.name}</td>
                <td>{equipment.type}</td>
                <td>{!equipment.external_data ? <div className={cx('text-right', styles.loadingSpinner)}>
                    <FontAwesomeIcon icon={faSpinner} spin/>
                </div> : <div>{equipment.external_data.location}<br/>{equipment.external_data.speed}</div>}</td>
                <td>
                    {this.can_edit &&
                    <a href="javascript:void(0)" className={styles.action} onClick={openEditModal}>Edit</a>}
                    {this.can_delete &&
                    <a href="javascript:void(0)" className={styles.action} onClick={removeEquipment}>Remove</a>}
                </td>
            </tr>
        );
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

    callback(data) {
        console.log('%ccallback', 'color: #47AAAC; font-weight: bold; font-size: 13px;'); //eslint-disable-line no-console
        console.log(data); //eslint-disable-line no-console
    }

    createToastAlert(alert) {
        toast(alert.text, alert.options);
    }

    getEmptyEntityText() {

        const style = {
            'background-image': 'url(images/help/template_map_image.jpg)',
            'background-repeat': 'no-repeat',
            'background-attachment': 'fixed',

        };

        let message = this.props.hideEntitiesList ?
            <h3 className={styles['text-blocks']}>Add your team members on <Link to='/crew' style={{color: '#337ab7'}}>Team
                page</Link></h3>
            : <h3 className={styles['text-blocks']}>Add your first team member above</h3>;

        return (
            <div className={styles['no-entity']}>
                <div style={style} className={styles.noEntityContentContainer}>
                    <div className={styles['center-content']}>
                        <div>
                            <h3 className={styles['text-blocks']}>
                                Install arrivy app on your phone and your team member's phones to see live location
                                here.
                            </h3>
                            {message}
                            <p className={styles['text-blocks']} style={{fontSize: '16px'}}>
                                Note: Live location is for business only. Location is only shown to customer when the
                                team member starts
                                the assigned task by marking it 'on our way'
                            </p>
                            <div className={styles['apps-buttons']}>
                                <a href="https://play.google.com/store/apps/details?id=com.insac.can.pinthatpoint&hl=en"
                                   target="_blank"><img src="/images/google_badge.png"/></a>
                                <a href="https://itunes.apple.com/us/app/pinthatpoint-go/id1177367972?ls=1&mt=8"
                                   target="_blank"><img
                                    src="/images/appstore_badge.png"/></a>
                            </div>
                        </div>
                    </div>
                    <img style={{height: '100%', padding: '20px', maxHeight: '600px'}}
                         src='images/help/activate_location_on_phone.gif'/>
                </div>
            </div>
        );
    }

    renderfleetOnMap() {
        let equipments = this.state.equipments;
        if (!equipments || equipments.length === 0) {
            return <div></div>;
        }

        if (equipments.length === 1) {
            return this.getEmptyEntityText();
        }
        // && (!entities[0].lastreading)

        const filteredEquipments = [];
        for (let i = 0; i < equipments.length; i++) {
            if (equipments[i].external_data && equipments[i].external_data.lat && equipments[i].external_data.lng) {
                filteredEquipments.push({
                    location:{lat: equipments[i].external_data.lat, lng: equipments[i].external_data.lng},
                    name: equipments[i].name,
                    id: equipments[i].id,
                    image_path: equipments[i].image_path,
                    type: 'equipment',
                    address: equipments[i].external_data.location,
                });
            }

        }

        return (
            <div className={styles.map_container}>
                <LocationMapV2 height={'calc(100vh - 110px)'} entities={filteredEquipments} showLocation/>
            </div>
        );
    }

    render() {
        this.can_create = false;
        this.can_add_group = false;
        if (this.props.profile && this.props.profile.permissions) {
            let permissions = this.props.profile.permissions;
            let is_company = false;
            if (permissions.includes('COMPANY')) is_company = true;
            if (is_company || permissions.includes('ADD_EQUIPMENT')) this.can_create = true;
            if (is_company || permissions.includes('ASSIGN_GROUPS')) this.can_add_group = true;
        }

        let titles = ['', 'Name', 'Type', 'External Integration', ''];
        if (this.state.showIds) {
            titles = ['', 'Id', 'Name', 'Type', 'External Integration', ''];
        }

        const headers = titles.map((header, idx) => (
            <th key={'headers_' + idx}>{header}</th>
        ));
        // const fleetonmap = null; //this.renderfleetOnMap(this.state.fleetlocation);
        const className = ['table', 'table-curved', styles['odd-stripped']].join(' ');
        // const updateEquipments = this.updateEquipments.bind(this);
        let equipmentsList = null;

        if (!this.state.equipments) {
            equipmentsList = (
                <tr>
                    <td colSpan="5">
                        <SavingSpinner title="" size={8} borderStyle="none"/>
                    </td>
                </tr>
            );
        } else if (this.state.equipments.length === 0 && this.state.page === 1) {
            equipmentsList = (
                <tr>
                    <td colSpan="5">
                        {this.getSimpleEmptyEquipmentText()}
                    </td>
                </tr>
            );
        } else if (this.state.equipments.length === 0 && this.state.page > 1) {
            equipmentsList = (
                <tr>
                    <td colSpan="5">
                        <div className={styles['no-equipment-simple']}>
                            No more equipments.
                        </div>
                    </td>
                </tr>
            );
        } else {
            equipmentsList = (this.state.equipments.map((equipment, key) => (
                this.renderEquipment(equipment, key)
            )));
        }

        let prevDisabled = false;
        let nextDisabled = false;
        if (this.state.page === 1) {
            prevDisabled = true;
        }
        if (this.state.equipments !== null && this.state.equipments.length < this.state.items_per_page) {
            nextDisabled = true;
        }

        return (
            <div className={styles['equipment-manager']}>
                <ToastContainer className={styles.toastContainer} toastClassName={styles.toast} autoClose={1}/>
                <Grid>
                    {this.props.hideEquipmentsList ? null :
                        <div>
                            <Joyride
                                ref={c => (this.joyride = c)}
                                debug={false}
                                steps={this.state.steps}
                                type={this.state.joyrideType}
                                locale={{
                                    back: (<span>Back</span>),
                                    close: (<span>Close</span>),
                                    last: (<span>Last</span>),
                                    next: (<span>Next</span>),
                                    skip: (<span>Skip</span>)
                                }}
                                showOverlay={this.state.joyrideOverlay}
                                callback={this.callback}/>
                            {this.state.fetchingMoreEquipments &&
                            <div className={styles.paginationSpinnerContainer}>
                                <SavingSpinner title="Loading" borderStyle="none"/>
                            </div>
                            }
                            {!this.state.fetchingMoreEquipments && !this.state.updatingEquipment && this.state.equipments !== null && (this.state.equipments.length > 0 || this.state.page > 1) &&
                            <div className={styles.paginationContainer}>
                                {this.state.updatingEquipment || this.state.equipments.length < 1
                                    ?
                                    <p>
                                        {this.state.equipments.length}
                                    </p>
                                    :
                                    <p>
                                        {((this.state.page - 1) * this.state.items_per_page) + 1} - {(this.state.page * this.state.items_per_page) - (this.state.items_per_page - (this.state.equipments !== null ? this.state.equipments.length : 100))}
                                    </p>
                                }
                                <ul>
                                    <li style={{cursor: 'wait'}}>
                                        <button onClick={() => this.paginationPrevClicked()} disabled={prevDisabled}
                                                className={cx(prevDisabled && 'disabled', this.state.updatingEquipment && styles.pendingAction)}>
                                            <FontAwesomeIcon icon={faChevronLeft}/>
                                        </button>
                                    </li>
                                    <li style={{cursor: 'wait'}}>
                                        <button onClick={() => this.paginationNextClicked()} disabled={nextDisabled}
                                                className={cx(nextDisabled && 'disabled', this.state.updatingEquipment && styles.pendingAction)}>
                                            <FontAwesomeIcon icon={faChevronRight}/>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            }
                            {this.can_create &&
                            <h2>Add new equipment</h2>}
                            {this.can_create &&
                            <div id="equipment-formarea" className={styles['equipment-formarea']}>
                                <EquipmentForm
                                    createEquipment={this.createEquipment}
                                    sendingEquipment={this.state.sendingEquipment}
                                    equipmentAdded={this.state.equipmentAdded}
                                    groups={this.props.groups}
                                    canAddGroup={this.can_add_group}
                                    addAlert={this.addAlert}
                                    profile={this.props.profile}
                                />
                            </div>
                            }
                            <EquipmentFormEdit
                                showModal={this.state.showModal}
                                onHide={this.closeEditModal}
                                onChangeField={this.onChangeField}
                                handleImageChange={this.handleImageChange}
                                removeImage={this.removeImage}
                                fields={this.state.editForm}
                                handleSubmitForm={this.handleSubmitForm}
                                onChangeExtraField={this.onChangeExtraField}
                                ErrorMsg={this.state.editFormError}
                                updatingEquipment={this.state.updatingEquipment}
                                profile={this.props.profile}
                                groups={this.props.groups}
                            />
                            {this.state.alerts &&
                            this.state.alerts.map((alert, idx) => {
                                alert.timeout(idx);
                                return (
                                    <Alert key={'alert_' + idx} bsStyle={alert.bsStyle}>
                                        <strong>{alert.content}</strong>
                                    </Alert>
                                );
                            })
                            }

                            <Table className={className} striped responsive>
                                <thead>
                                <tr>{headers}</tr>
                                </thead>
                                <tbody>
                                {equipmentsList}
                                </tbody>
                            </Table>
                            <div style={{textAlign: 'right'}}>
                                <Button bsStyle="link" onClick={this.modifyIdsDisplay}>
                                    {this.state.showIds ? 'Hide ID' : 'Show ID'}
                                </Button>
                            </div>


                        </div>}
                    <hr/>
                    {/*<div className={styles.sensorlist}>Sensors Detail</div>*/}
                    {/*<Table className={className} striped responsive>*/}
                    {/*<thead>*/}
                    {/*<tr>*/}
                    {/*<th>ID</th>*/}
                    {/*<th>Name</th>*/}
                    {/*<th>Mac Address</th>*/}
                    {/*<th>Ambient Temperature</th>*/}
                    {/*<th>Probe Temperature</th>*/}
                    {/*<th>Humidity</th>*/}
                    {/*<th>Cargo Is Empty</th>*/}
                    {/*<th>Door Closed</th>*/}
                    {/*</tr>*/}
                    {/*</thead>*/}
                    {/*<tbody>*/}
                    {/*{*/}
                    {/*this.state.fleetsensor.map((sensors) => {*/}
                    {/*return sensors.sensors_details.map((sensor) => {*/}
                    {/*return (*/}
                    {/*<tr>*/}
                    {/*<td>{sensor.id}</td>*/}
                    {/*<td>{sensor.name}</td>*/}
                    {/*<td>{sensor.macAddress}</td>*/}
                    {/*<td>{sensor.ambientTemperature}</td>*/}
                    {/*<td>{sensor.probeTemperature}</td>*/}
                    {/*<td>{sensor.humidity}</td>*/}
                    {/*<td>{sensor.cargoEmpty}</td>*/}
                    {/*<td>{sensor.doorClosed}</td>*/}
                    {/*</tr>*/}
                    {/*);*/}
                    {/*});*/}
                    {/*})*/}
                    {/*}*/}
                    {/*</tbody>*/}
                    {/*</Table>*/}
                    {/*<Table>*/}
                    {/*<tbody>*/}
                    {/*<tr>*/}
                    {/*<td>*/}
                    <div>
                        {this.renderfleetOnMap()}
                    </div>
                    {/*</td>*/}
                    {/*</tr>*/}
                    {/*</tbody>*/}
                    {/*</Table>*/}
                </Grid>
            </div>
        );
    }
}

EquipmentManager.propTypes = {
    updateEquipments: PropTypes.func.isRequired,
    hideEquipmentsList: PropTypes.bool,
    createEquipment: PropTypes.func,
    removeEquipmentImage: PropTypes.func,
    deleteEquipment: PropTypes.func,
    getEquipmentImageUrl: PropTypes.func,
    updateEquipmentImage: PropTypes.func,
    updateEquipment: PropTypes.func,
    alerts: PropTypes.array,
    newlyFetchedEquipmentsCallback: PropTypes.func,
    profile: PropTypes.object,
    groups: PropTypes.object
};
