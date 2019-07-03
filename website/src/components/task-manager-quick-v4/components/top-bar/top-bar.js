import React, { Component } from 'react';
import styles from './top-bar.module.scss';
import { Grid, Row, Col , DropdownButton , MenuItem} from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faSlidersH, faEye } from '@fortawesome/fontawesome-free-solid';
import DatePicker from 'react-bootstrap-date-picker';
import moment from 'moment';
import SwitchButton from '../../../../helpers/switch_button';
import { ActivityStream, ActivityStreamButtonV2 } from '../../../index';
import cx from 'classnames';
import DropdownFilter from '../../../dropdown-filter/dropdown-filter';
import { searchEntities, searchResources, searchGroups } from '../../../../actions';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import SynchronizeNow from "../../../account-wrapper-v2/components/integrations/components/synchronize-now/synchronize-now";

export default class  TopBar extends Component {
	constructor(props) {
		super(props);

		this.state = {
			view_activity_stream: false,
			showFilters: false,
		};

		this.toggleFilters = this.toggleFilters.bind(this);
		this.renderSelectedFilters = this.renderSelectedFilters.bind(this);
		this.updateFiltersData = this.updateFiltersData.bind(this);


	}

	componentDidMount() {
		let permissions = null;
		let is_company = false;
		let view_activity_stream = false;
		const profile = this.props.profile;
		if (profile) {
			if (profile && profile.permissions) {
				permissions = profile.permissions
			}
			if (permissions && permissions.includes('COMPANY')) {
				is_company = true
			}
			if (is_company || (permissions && (permissions.includes('SHOW_OWN_ACTIVITY_STREAM') || permissions.includes('SHOW_ALL_ACTIVITY_STREAM')))) {
				view_activity_stream = true;
			}
		}
		this.setState({
			view_activity_stream
		});
	}

	toggleFilters() {
		this.setState({
			showFilters: !this.state.showFilters
		})
	}

  updateFiltersData(key, value) {
		let filtersData = this.state.filtersData;
		if (!filtersData) {
      filtersData = {};
		}
		if (!filtersData[key]) {
      filtersData[key] = value;
      this.setState({ filtersData });
			return;
		}
		let singleFilterData = filtersData[key];
		value && value.map((singleData) => {
			if (!singleFilterData.find((el) => { return el.id === singleData.id }) && (!this.props[key] || !this.props[key].find((el) => { return el.id === singleData.id }))) {
        singleFilterData.push(singleData);
			}
		});
    filtersData[key] = singleFilterData;
    this.setState({ filtersData });
	}

	clearAllFilters(e) {
		e.preventDefault();
		const eObj = {
			target: {name: 'deselect-all'},
			stopPropagation: () => {
			},
			preventDefault: () => {
			}
		}
		if (this.equipmentFilterInstance) {
			this.equipmentFilterInstance.handleClick(eObj);
		}
		if (this.entityFilterInstance) {
			this.entityFilterInstance.handleClick(eObj);
		}
		if (this.statusFilterInstance) {
			this.statusFilterInstance.handleClick(eObj);
		}
		if (this.groupsFilter) {
			this.groupsFilter.handleClick(eObj);
		}
		if (this.templateFilterInstance) {
      this.templateFilterInstance.handleClick(eObj);
		}
    setTimeout(() => { this.props.applyFilters(false)}, 100);
	}

	renderSelectedFilters(showAll = false) {
		let selectedFilters = [];
		this.props.groupsFilters.map((group) => {
			const filterIndex = this.props.groups.findIndex((el) => {
				return el.id === group;
			});
			if (filterIndex !== -1) {
				selectedFilters.push(this.props.groups[filterIndex].name);
			} else if (this.state.filtersData && this.state.filtersData.groups) {
        const index = this.state.filtersData.groups.findIndex((el) => {
          return el.id === group;
        });
        if (index !== -1) {
          selectedFilters.push(this.state.filtersData.groups[index].name);
        }
			}
		});
		this.props.entitiesFilters.map((entity) => {
			const filterIndex = this.props.entities.findIndex((el) => {
				return el.id === entity;
			});
			if (filterIndex !== -1) {
				selectedFilters.push(this.props.entities[filterIndex].name);
			} else if (this.state.filtersData && this.state.filtersData.entities) {
        const index = this.state.filtersData.entities.findIndex((el) => {
          return el.id === entity;
        });
        if (index !== -1) {
          selectedFilters.push(this.state.filtersData.entities[index].name);
        }
      }
		});
		this.props.equipmentFilters.map((equipment) => {
			const filterIndex = this.props.equipments.findIndex((el) => {
				return el.id === equipment;
			});
			if (filterIndex !== -1) {
				selectedFilters.push(this.props.equipments[filterIndex].name);
			} else if (this.state.filtersData && this.state.filtersData.equipments) {
        const index = this.state.filtersData.equipments.findIndex((el) => {
          return el.id === equipment;
        });
        if (index !== -1) {
          selectedFilters.push(this.state.filtersData.equipments[index].name);
        }
      }
		});
    this.props.templateFilters.map((template) => {
      const filterIndex = this.props.templates.findIndex((el) => {
        return el.id === template;
      });
      if (filterIndex !== -1) {
        selectedFilters.push(this.props.templates[filterIndex].name);
      }
    });
		selectedFilters = selectedFilters.concat(this.props.taskFilters);
		if (showAll) {
			return selectedFilters.map((filter) => {
				return (
					<span className={styles.filtersTag}>
						{filter}
					</span>
				);
			});
		} else {
			return (
				<div>
					<span className={styles.filtersTagSm}>
						{selectedFilters[0]}
					</span>
					{selectedFilters.length > 1 &&
					<span className={styles.filtersTagSm}>
						+ {selectedFilters.length - 1}
					</span>
					}
				</div>
			);
		}
	}

	render() {
		let showClearAllButton = false;
		if (this.props.taskFilters.length > 0 || this.props.equipmentFilters.length > 0 || this.props.entitiesFilters.length > 0 || this.props.groupsFilters.length > 0 || this.props.templateFilters.length > 0) {
			showClearAllButton = true;
		}
		let entities = this.props.entities || [];
		if (this.state.filtersData && this.state.filtersData.entities) {
      entities.push.apply(entities, this.state.filtersData.entities);
		}
    let equipments = this.props.equipments || [];
    if (this.state.filtersData && this.state.filtersData.equipments) {
      equipments.push.apply(equipments, this.state.filtersData.equipments);
    }
    let groups = this.props.groups || [];
    if (this.state.filtersData && this.state.filtersData.groups) {
      groups.push.apply(groups, this.state.filtersData.groups);
    }
		return (
			<div className={styles.topBarContainer}>
				<ActivityStream showActivities={this.state.view_activity_stream} onStateChange={activityStreamStateHandler => { this.props.activityStreamStateChangeHandler(activityStreamStateHandler) }}/>
				<Grid>
					<Row>
						<Col lg={7} md={7} sm={12}>
							<Row>
								<Col md={4} sm={5} xs={5}>
									<div className={styles.dateContainer}>
										<button type="button" onClick={(e) => this.props.moveDate(e, 'left')}>
											<FontAwesomeIcon icon={faChevronLeft} />
										</button>
										<span>
											<div className={styles.datePickerLabel}>Tasks - </div><DatePicker id="start_date" value={moment(new Date(this.props.date)).local().format()} onChange={this.props.onChangeDate} showClearButton={false} showTodayButton={true} ref="dateInput"/>
										</span>
										<button type="button" onClick={(e) => this.props.moveDate(e, 'right')}>
											<FontAwesomeIcon icon={faChevronRight} />
										</button>
									</div>
								</Col>
								<Col lg={3} md={4} sm={7} xs={7}>
									<div className={styles.switchContainer}>
										<span>Tasks</span>
										<SwitchButton checked={(this.props.dashboardType === 'tasks' || !this.props.dashboardType) ? false : true} onChange={() => this.props.changeDashboard()} />
										<span>Routes</span>
									</div>
								</Col>
								<Col lg={5} md={4} sm={12} xs={12}>
									<div className={styles.filtersSwitcherContainer}>
										<button onClick={() => this.toggleFilters()} type="button">
											<span className={styles.filtersSwitcherIcon}>
												<FontAwesomeIcon icon={faSlidersH} />
											</span>
												<span className={styles.filtersSwitcherLabel}>
												Filters
											</span>
										</button>
										{showClearAllButton &&
											this.renderSelectedFilters(false)
										}
										{showClearAllButton &&
										<span className={styles.clearAllFiltersBtn}>
											<button onClick={(e) => this.clearAllFilters(e) } type="button">Clear all</button>
										</span>
										}
										<div className={cx(styles.filtersContainer, this.state.showFilters && styles.filtersContainerVisible)}>
											<div className={styles.filtersDropDownsContainer}>
                        <div className={styles.filterDropdown}>
                          <DropdownFilter
                            name="templateFilter"
                            ref={instance => {
                              this.templateFilterInstance = instance;
                            }}
                            data={this.props.templates}
                            handleChange={this.props.templateFilterChanged}
                            title="Template"
                            searchable
                            minWidth="160px"
                          />
                        </div>
												{this.props.can_view_group_filter &&
												<div className={styles.filterDropdown}>
													<DropdownFilter
														name="groupFilter"
														ref={instance => {
															this.groupsFilter = instance;
														}}
														data={groups}
														handleChange={this.props.groupsFilterChanged}
														title="Groups"
														searchable
														minWidth="160px"
                            searchCall={searchGroups}
                            addNewData={(data) => this.updateFiltersData('groups', data)}
													/>
												</div>
												}
												<div className={styles.filterDropdown}>
													<DropdownFilter
														name="statusFilter"
														ref={instance => {
															this.statusFilterInstance = instance;
														}}
														data={this.props.filterStatuses}
														handleChange={this.props.selectedTaskFilterChanged}
														title="Status"
														searchable
														minWidth="160px"/>
												</div>
												{this.props.equipments && this.props.equipments.length > 0 &&
												<div className={styles.filterDropdown}>
													<DropdownFilter
														name="equipmentFilter"
														ref={instance => {
															this.equipmentFilterInstance = instance;
														}}
														data={equipments}
														handleChange={this.props.equipmentFilterChanged}
														title="Equipment"
														searchable
														minWidth="160px"
                            searchCall={searchResources}
                            addNewData={(data) => this.updateFiltersData('equipments', data)}
													/>
												</div>
												}
												<div className={styles.filterDropdown}>
													<DropdownFilter
														name="entityFilter"
														ref={instance => {
															this.entityFilterInstance = instance;
														}}
														data={entities}
														handleChange={this.props.entityFilterChanged}
														title="Team"
														minWidth="160px"
														searchable
														searchCall={searchEntities}
                            addNewData={(data) => this.updateFiltersData('entities', data)}
													/>
												</div>
											</div>
											{showClearAllButton &&
												<div className={styles.selectedFiltersContainer}>
													<div className={styles.selectedFilters}>
														{this.renderSelectedFilters(true)}
													</div>
												</div>
											}
											<div className={styles.closeFiltersBtnContainer}>
												{showClearAllButton &&
													<span className={styles.clearAllFiltersBtn}>
														<button onClick={(e) => this.clearAllFilters(e) } type="button">Clear all</button>
													</span>
												}
												{showClearAllButton &&
													<span className={styles.filterButton}>
														{this.props.showSpinner ? <SavingSpinner color="#fff" title="" borderStyle="none" size={8} /> :
														<button onClick={(e) => this.props.applyFilters(true, e) } type="button">Apply Filters</button>}
													</span>
												}
												<button className={styles.closeFiltersBtn} onClick={() => this.toggleFilters()}>Close</button>
											</div>
										</div>
									</div>
								</Col>
							</Row>
						</Col>
						<Col lg={5} md={5} sm={12} className={styles.topbarRightContainer}>
							<div className={styles.topBarRightContentContainer}>
								{this.props.canTriggerExternalIntegrationDataFetch && this.props.externalIntegrations && this.props.externalIntegrations.length > 0 && <div className={styles.createTaskBtnContainer}>
                  <SynchronizeNow
                    externalIntegrations={this.props.externalIntegrations}
										getExternalIntegrations={this.props.getExternalIntegrations}
                    startDate={this.props.date}
                    endDate={this.props.date}
										maxDaysToSync={7}
										maxDaysErrorMessage={"Synchronize Now will only sync Tasks for a day or a week. Please switch to day or week view to synchronize."}
                  />
								</div>}
								{this.props.canCreate && <div className={styles.createTaskBtnContainer}>
									<DropdownButton title={'Create New Task'}>
									<MenuItem onClick={()=>this.props.createNewTask()}>New Task</MenuItem>
									<MenuItem onClick={()=>this.props.createNewRecurringTask()}>New Repeating Task</MenuItem>
									<MenuItem divider />
									<MenuItem onClick={()=>this.props.createNewTask(null, true)} >New Activity</MenuItem>
									</DropdownButton>
								</div>}
								<div className={styles.toggleMapButtonContainer}>
									<button type="button" onClick={() => { this.props.handleMapVisibility() }}><span className={styles.iconContainer}></span></button>
								</div>
								<div id="activityStreamBtnContainer" className={styles.activityStreamBtnContainer}>
									<ActivityStreamButtonV2 activityStreamStateHandler={this.props.activityStreamStateHandler} />
								</div>
							</div>
						</Col>
					</Row>
				</Grid>
			</div>
		);
	}
}
