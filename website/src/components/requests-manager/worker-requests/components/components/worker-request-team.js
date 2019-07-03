import React, {Component} from 'react';
import cx from "classnames";
import { Checkbox, OverlayTrigger, Tooltip, FormGroup, FormControl, Row, Col } from 'react-bootstrap';
import styles from "./worker-request-details-tabs.module.scss";
import SavingSpinner from "../../../../saving-spinner/saving-spinner";
import moment from "moment";
import DropdownFilter from '../../../../dropdown-filter/dropdown-filter';

export default class WorkerRequestTeam extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedEntitiesIds: [],
      worker_request_object: {},
      search: null,
      showFilters: false,
      entityRoles: [{id: 1, name: 'Company'}, {id: 2, name: 'Admin'}, {id: 3, name: 'Scheduler'}, {id: 4, name: 'Field Crew'}, {id: 5, name: 'Limited Access'}],
      selectedEntityRoleFilter: [],
      confirmationStatusFilter: null,
      filter_group_ids: [],
      selectedGroupsFilter: []
    };

    this.renderEntities = this.renderEntities.bind(this);
    this.saveWorkerRequest = this.saveWorkerRequest.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.searchFilter = this.searchFilter.bind(this);
    this.toggleFilters = this.toggleFilters.bind(this);
    this.roleFilterChanged = this.roleFilterChanged.bind(this);
    this.clearAllFilters = this.clearAllFilters.bind(this);
    this.groupsFilterChanged = this.groupsFilterChanged.bind(this);
    this.renderSelectedFilters = this.renderSelectedFilters.bind(this);
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!_.isEqual(this.props.worker_request_object, prevProps.worker_request_object)) {
      let worker_request_object = this.props.worker_request_object;
      let selectedEntitiesIds = worker_request_object && worker_request_object.entity_ids;
      this.setState({
        worker_request_object,
        selectedEntitiesIds,
      });
    }
  }

  componentDidMount() {
    if (this.props.worker_request_object) {
      let worker_request_object = this.props.worker_request_object;
      let selectedEntitiesIds = worker_request_object && worker_request_object.entity_ids;
      this.setState({
        worker_request_object,
        selectedEntitiesIds
      });
    }
  }

  handleSelectionChange(e, id) {
    let selectedEntitiesIds = this.state.selectedEntitiesIds;
    if (e.target.checked) {
      if (selectedEntitiesIds && !selectedEntitiesIds.find((entityId) => {
        return entityId === id;
      })) {
        selectedEntitiesIds.push(id);
      } else {
        return false;
      }
    } else {
      const entityIdIndex = selectedEntitiesIds && selectedEntitiesIds.findIndex((entityId) => {
        return id === entityId;
      });
      if (entityIdIndex >= 0) {
        selectedEntitiesIds.splice(entityIdIndex, 1);
      }
    }

    this.setState({
      selectedEntitiesIds,
    })

  }

  saveWorkerRequest(e) {
    e.preventDefault();
    e.stopPropagation();
    let selectedEntitiesIds = this.state.selectedEntitiesIds;
    this.props.handleUpdateWorkerRequest({id: this.props.worker_request_object.id, entity_ids: selectedEntitiesIds});
  }

  searchFilter(e) {
    this.setState({search: e.target.value})
  }

  renderEntities() {
    let entitiesToShow = [];
    if (this.props.entities && this.props.entities.length > 0) {
      let entities = this.props.entities;

      if (this.state.search && this.state.search.trim().length > 0) {
        entities = entities.filter((entity) => {
          let name = entity.name.toLowerCase();
          return name.includes(this.state.search.trim().toLowerCase());
        });
      }

      const isCompanyRoleSelected = this.state.selectedEntityRoleFilter && this.state.selectedEntityRoleFilter.indexOf(1);
       entities.map((entity, key) => {
        let entityFilter = false;
        let role = !entity.is_default && entity.permission_groups.find((permission) => {
          return permission.status === true
        });
        if (!role && !entity.is_default) {
          role = {title: 'Field Crew', id: 4};
        }
        let entity_role_check = !entity.is_default && this.state.selectedEntityRoleFilter && this.state.selectedEntityRoleFilter.filter((entityRole) => {
          if (role) {
            return entityRole === role.id;
          }
        });


        if (this.state.selectedGroupsFilter && this.state.selectedGroupsFilter.length > 0 && this.state.selectedGroupsFilter.indexOf(entity.group_id) >= 0 && this.state.selectedEntityRoleFilter && this.state.selectedEntityRoleFilter.length > 0 && entity_role_check.length > 0) {
          entityFilter = true;

        }else if (this.state.selectedGroupsFilter && this.state.selectedGroupsFilter.length > 0 && this.state.selectedGroupsFilter.indexOf(entity.group_id) >= 0 && isCompanyRoleSelected >= 0 && entity.is_default) {
          entityFilter = true;

        } else if (this.state.selectedGroupsFilter && this.state.selectedGroupsFilter.length > 0 && this.state.selectedEntityRoleFilter && this.state.selectedEntityRoleFilter.length > 0) {
          entityFilter = false;
        } else if (this.state.selectedGroupsFilter && this.state.selectedGroupsFilter.length === 0 && this.state.selectedEntityRoleFilter && this.state.selectedEntityRoleFilter.length === 0) {
          entityFilter = true;
        } else {

          if (this.state.selectedGroupsFilter && this.state.selectedGroupsFilter.length > 0 && this.state.selectedGroupsFilter.indexOf(entity.group_id) >= 0) {

            entityFilter = true;
          } else if (this.state.selectedEntityRoleFilter && this.state.selectedEntityRoleFilter.length > 0 && entity_role_check.length > 0) {

            entityFilter = true;
          } else if (isCompanyRoleSelected >= 0 && entity.is_default) {
            entityFilter = true;
          }
        }

        if (entityFilter) {
          let isChecked = false;
          if (this.state.selectedEntitiesIds && this.state.selectedEntitiesIds.find((entityId) => {
            return entityId === entity.id;
          })) {
            isChecked = true;
          }

          entitiesToShow.push (
            <div key={key} className={cx(styles.flexRow, styles.item)}>
              <div className={cx(styles.flexColumn, styles.checkMark)}>
                <Checkbox
                  className={cx(styles.checkBoxSquare)} checked={isChecked}
                  disabled={this.props.disableStatuses.indexOf(this.props.worker_request_object.request_status) >= 0 ? false : true}
                  onChange={(e) => this.handleSelectionChange(e, entity.id)}>
                  <span></span>
                </Checkbox>
              </div>
              <div className={cx(styles.flexColumn, styles.name)}>
                <div className={styles.entity}>
                  <div className={styles.entityImage}>
                    <img src={entity.image_path ? entity.image_path : '/images/user-default.svg'} alt={entity.name} style={{borderColor: (entity.color ? entity.color : '#348AF7')}}/>
                  </div>
                  <div className={styles.entityName}>
                    <OverlayTrigger placement="bottom" overlay={<Tooltip id={'entity_'+key}>{entity.name}</Tooltip>}>
                      <span>{entity.name}</span>
                    </OverlayTrigger>
                  </div>
                </div>
              </div>
              <div className={cx(styles.flexColumn, styles.title)}>{entity.type}</div>
              <div className={cx(styles.flexColumn, styles.role)}>{entity.is_default ? entity.type : role.title}</div>
            </div>
          );
        }
      });
    }

    if (entitiesToShow && entitiesToShow.length > 0) {
      return entitiesToShow;
    } else {
      return (<div className={styles.noWorkerRequestFound}>No Entities found</div>)
    }
  }

  toggleFilters() {
    this.setState({
      showFilters: !this.state.showFilters
    });
  }

  roleFilterChanged(selectedRoles) {
    this.setState({
      selectedEntityRoleFilter: selectedRoles.map(role => role.id)
    })
  }

  groupsFilterChanged(selectedGroups) {
    this.setState({
      selectedGroupsFilter: selectedGroups.map(group => group.is_implicit ? null : group.id)
    });
  }

  renderSelectedFilters(showAll = false) {
    let selectedFilters = [];
    this.state.selectedGroupsFilter.map((group) => {
      const filterIndex = this.props.groups.findIndex((el) => {
        return group ? el.id === group : el.is_implicit;
      });
      if (filterIndex !== -1) {
        selectedFilters.push(this.props.groups[filterIndex].name);
      }
    });

    this.state.selectedEntityRoleFilter.map((entityType) => {
      const filterIndex = this.state.entityRoles.findIndex((el) => {
        return el.id === entityType;
      });
      if (filterIndex !== -1) {
        selectedFilters.push(this.state.entityRoles[filterIndex].name);
      }
    });
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

  clearAllFilters(e = null, updateEntities = true) {
    e && e.preventDefault();
    const eObj = {
      target: {name: 'deselect-all'},
      stopPropagation: () => {
      },
      preventDefault: () => {
      }
    };
    if (this.groupsFilter) {
      this.groupsFilter.handleClick(eObj, updateEntities);
    }
    if (this.entityRoleInstance) {
      this.entityRoleInstance.handleClick(eObj, updateEntities);
    }
  }

  render() {
    let arrow = <svg xmlns="http://www.w3.org/2000/svg" width="13.657" height="13.657" viewBox="0 0 13.657 13.657"><path d="M-90.024,11.657a.908.908,0,0,1-.675-.3.908.908,0,0,1-.3-.675V2.911A.911.911,0,0,1-90.09,2a.911.911,0,0,1,.911.911V9.836h6.925a.911.911,0,0,1,.911.911.911.911,0,0,1-.911.91Z" transform="translate(-58.932 -49.276) rotate(-135)" fill="currentColor"/></svg>;

    let groups = this.props.groups || [];
    if (this.state.filtersData && this.state.filtersData.groups) {
      groups.push.apply(groups, this.state.filtersData.groups);
    }

    return (
      <div>
        {this.props.loadingEntities ? <SavingSpinner className={styles.whiteLoader} size={8} borderStyle="none"/> :
          <div className={cx(styles.flexTable, styles.teamTable)}>
            <div className={cx(styles.flexRow, styles.header)}>
              <div className={cx(styles.flexColumn, styles.checkMark)}><img src="/images/worker-request/check-box.svg" alt="Icon" /></div>
              <div className={cx(styles.flexColumn, styles.name)}><img src="/images/worker-request/user.svg" className={styles.icon} alt="Icon" />Name</div>
              <div className={cx(styles.flexColumn, styles.title)}><img src="/images/worker-request/title.svg" className={styles.icon} alt="Icon" />Title</div>
              <div className={cx(styles.flexColumn, styles.role)}><img src="/images/worker-request/title.svg" className={styles.icon} alt="Icon" />Role</div>
            </div>
            <Row>
              <Col xs={12} md={6}>
                <p><strong>Select team members to send the request to.</strong></p>
                <p>Use Filters to refine your view. The first team members to accept will be assigned to the Tasks.</p>
              </Col>
              <Col xs={12} md={6}>
                <div className={styles.box}>
                  <div className={styles.boxBody}>
                    <div className={styles.boxBodyInner}>
                      <div className={styles.searchWrapper}>
                        <FormGroup className={styles.searchField}>
                          <FormControl name="search" placeholder="Search" value={this.state.search} onChange={this.searchFilter} />
                        </FormGroup>
                        <div className={styles.filter}>
                          <button onClick={() => this.toggleFilters()}><img src="/images/worker-request/filter.svg" alt="Icon" />Filters</button>
                        </div>
                        <div className={cx(styles.filtersContainer, this.state.showFilters && styles.filtersContainerVisible)}>
                          <div className={styles.filtersDropDownsContainer}>
                            <div className={styles.filterDropDown}>
                              <DropdownFilter
                                name="groupFilter"
                                ref={instance => {
                                  this.groupsFilter = instance;
                                }}
                                data={groups}
                                handleChange={this.groupsFilterChanged}
                                title="Groups"
                                searchable
                                minWidth="100px"
                                className={styles.dropDown}
                              />
                            </div>
                            <div className={styles.filterDropDown}>
                              <DropdownFilter
                                name="roleFilter"
                                data={this.state.entityRoles}
                                ref={instance => {
                                  this.entityRoleInstance = instance;
                                }}
                                handleChange={this.roleFilterChanged}
                                title="Roles"
                                searchable
                                minWidth="100px"
                                className={styles.dropDown}
                              />
                            </div>
                          </div>
                          <div className={styles.selectedFiltersContainer}>
                            <div className={styles.selectedFilters}>
                              {this.renderSelectedFilters(true)}
                            </div>
                          </div>
                          <div className={styles.closeFiltersBtnContainer}>
                            <button className={styles.clearAllFiltersBtn} onClick={(e) => this.clearAllFilters(e)} type="button">Clear all</button>
                            <button className={styles.closeFiltersBtn} onClick={() => this.toggleFilters()}>Close</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div className={styles.requestInfo}>Request {this.props.number_of_workers_required} person(s) from {this.props.start_datetime} - {this.props.end_datetime} on {moment.utc(this.props.request_date).local().format('dddd MMM DD, YYYY')}</div>
              </Col>
              <Col xs={12} md={6}>
                <div className={styles.pagination}>
                  <ul>
                    <li className={styles.count}> {this.props.loadingEntities || this.props.entities.length < 1 ?
                      <span>{this.props.entities.length}</span> :
                      <span>{((this.props.page - 1) * this.props.items_per_page) + 1} - {(this.props.page * this.props.items_per_page) - (this.props.items_per_page - this.props.entities.length)}</span>
                    }</li>
                    <li>
                      <button
                        disabled={this.props.prevDisabled}
                        className={cx(styles.prev, this.props.prevDisabled && 'disabled', this.state.loadingEntities && styles.pendingAction)}
                        onClick={() => this.props.paginationPrevClicked()}>{arrow}</button>
                    </li>
                    <li>
                      <button
                        disabled={this.props.nextDisabled}
                        className={cx(this.props.nextDisabled && 'disabled', this.state.loadingEntities && styles.pendingAction)}
                        onClick={() => this.props.paginationNextClicked()}>{arrow}</button>
                    </li>
                  </ul>
                </div>
              </Col>
            </Row>
            <div className={styles.inner}>
              {this.renderEntities()}
            </div>
          </div>
        }
      </div>
    );
  }
}
