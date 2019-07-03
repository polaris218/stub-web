import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';
import TimelineStyles from '../../components/task-timeline/task-timeline.scss';
import styles from './task-timeline.module.scss';
import { Button, Col, Row, ControlLabel, ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';

import DatePicker from 'react-bootstrap-date-picker';
import DropdownFilter from '../dropdown-filter/dropdown-filter';
import { FieldGroup } from '../fields';
import { hextToRGBA } from '../../helpers/color';

const thumbWidth = 80, //width of hal hour interval
	firstColumWidth = 160, //width of name column
	taskHeight = 60; //height of tasks


export default class Timeline extends Component {
	constructor(props, context) {
    super(props, context);

    this.changeMode = this.changeMode.bind(this);
		this.clearAllFilters = this.clearAllFilters.bind(this);
    this.emptySlotClickedCallback = this.emptySlotClickedCallback.bind(this);
		this.entityFilterChanged = this.entityFilterChanged.bind(this);
		this.equipmentFilterChanged = this.equipmentFilterChanged.bind(this);
    this.taskClickedCallback = this.taskClickedCallback.bind(this);
		this.typeFilterChanged = this.typeFilterChanged.bind(this);
    this.onDateChange = this.onDateChange.bind(this);

    this.state = {
      modeBusiness: true,
      viewType: 'week',
      people: [{
        tasks: []
      }],
			selectedEquipmentsFilter: [],
			selectedEntitiesFilter: [],
			selectedTypeEntitiesFilter: []
    };
  }

  componentWillReceiveProps(nextProps) {
    this.reverseLookup(
      nextProps.tasks,
      nextProps.equipments,
      nextProps.entities);  
  }

	clearAllFilters(e) {
    e.preventDefault();
    const eObj = { 
      target: { name: 'deselect-all' },
      stopPropagation: () => {},
      preventDefault: () => {}
    }
    this.equipmentFilterInstance.handleClick(eObj);
    this.entityFilterInstance.handleClick(eObj);
		this.typeFilterInstance.handleClick(eObj);
  }

	equipmentFilterChanged(selectedElements) {
		this.setState({ selectedEquipmentsFilter: selectedElements.map(item => item.id) });
	}

	entityFilterChanged(selectedElements) {
		this.setState({ selectedEntitiesFilter: selectedElements.map(item => item.id) });
	}

	typeFilterChanged(selectedElements) {
		this.setState({ selectedTypeEntitiesFilter: selectedElements.map(item => item.id) });
	}

  reverseLookup(tasks, equipments, entities) {
    const people = [];
		const entityTypes = [];
    let unassignedTasks = [];
    tasks.map((el) => {
      if (el.entity_ids.length == 0) {
        unassignedTasks.push(el);
      }
    });
		
    people.push({
      name: "Unassigned",
      id: -1,
      tasks: unassignedTasks,
      image_path: '/images/unassigned.png'
    });
      
    entities.map((entity) => {
      const entityCopy = entity;
      entityCopy['tasks'] = [];
      tasks.map((elTask, id) => {
        if (elTask.entity_ids) {
          elTask.entity_ids.map((elIds) => {
            if (elIds === entity.id) {
              entityCopy['tasks'].push(elTask);
            }
          });
        }
      });
      people.push(entityCopy);
			
			if (!entityTypes.some(el => el.id === entity.type)) {
				entityTypes.push({ id: entity.type, name: entity.type || "Blank" })
			}
    });

    equipments.map((equipment) => {
      const equipmentCopy = equipment;
      equipmentCopy['tasks'] = [];
      equipmentCopy['equipment'] = true;
      tasks.map((elTask, id) => {
        if (elTask.resource_ids) {
          elTask.resource_ids.map((elIds) => {
            if (elIds === equipment.id) {
              equipmentCopy['tasks'].push(elTask);
            }
          });
        }
      });
      people.push(equipmentCopy);
    });

    this.setState({
      people, equipments, entities, entityTypes
    });
  }

	componentDidMount() {
    this.reverseLookup(
      this.props.tasks,
      this.props.equipments,
      this.props.entities
    );
	}

	taskClickedCallback(task, name, id) {
    this.props.onTaskClicked(task);
	}

	nameClickedCallback(name, id) {
		console.info("Name is clicked its name: " + name + " id: "+ id);
	}

	modeChangedCallback(mode) {
		console.info("Mode: " + mode);
	}

	emptySlotClickedCallback(time, index) {
		let meridian, newEventStartDate, newEventEndDate;
		if (this.state.modeBusiness) {
			meridian = index / 12 < 1 ? 'AM' : 'PM';
		} else {
			meridian = (index < 48) && ((index/2) / 12 >= 1) ? 'PM' : 'AM';
		}

    if (time && meridian && typeof time === 'number') {
      newEventStartDate = moment(this.props.date).toDate();
      let hours;
      const timeFloor = Math.floor(time);
      if (meridian === 'PM') {
        hours = timeFloor !== 12 ? timeFloor+12 : timeFloor;
      } else {
        hours = timeFloor === 12 ? 0 : timeFloor;
      }
      newEventStartDate.setHours(
        hours,
        time % 1 !== 0 ? 30 : 0, 
        0);
      
      newEventEndDate = moment(newEventStartDate).add(30, 'minutes').toDate();
    }

    this.props.onAddClicked(newEventStartDate, newEventEndDate);
	}

  onDateChange(date) {
    this.props.onDateChanged(date);
  }

	changeMode () {
		let newBusiness = !this.state.modeBusiness;
		this.setState({modeBusiness: newBusiness});
	}

	render() {
		let filteredPeople = this.state.people;	
		if (this.state.selectedEntitiesFilter.length > 0 ||
				this.state.selectedEquipmentsFilter.length > 0 ||
				this.state.selectedTypeEntitiesFilter.length > 0) {
      filteredPeople = filteredPeople
        .filter(people => 
          this.state.selectedEquipmentsFilter.indexOf(people.id) >= 0 ||
          this.state.selectedEntitiesFilter.length > 0 && 
          this.state.selectedEntitiesFilter.indexOf(people.id) >= 0 ||
					(this.state.selectedTypeEntitiesFilter.length > 0 && 
					this.state.selectedTypeEntitiesFilter.indexOf(people.type) >= 0 && !people.equipment));
		}

		return (
			<div>
				<Row style={{ margin: '0 0 10px 0' }} className={styles['filters-container']}>
            <ControlLabel style={{ marginTop: '8px' }}>
              Filters:
            </ControlLabel>
            <DropdownFilter
              name="equipmentFilter"
              data={this.state.equipments}
							ref={instance => { this.equipmentFilterInstance = instance; }} 
							handleChange={this.equipmentFilterChanged}
              title="Equipment"
							minWidth="120px"
              maxWidth="140px"
            />
            <DropdownFilter
              name="entityFilter"
              data={this.state.entities}
							ref={instance => { this.entityFilterInstance = instance; }}
							handleChange={this.entityFilterChanged}
              title="Team"
							minWidth="120px"
              maxWidth="140px"
							extraItem={{ id: -1, name: 'Unassigned' }}
						/>
            <DropdownFilter
              name="typeFilter"
              data={this.state.entityTypes}
							ref={instance => { this.typeFilterInstance = instance; }}
							handleChange={this.typeFilterChanged}
              title="Position"
							minWidth="120px"
              maxWidth="140px"
						/>
          <div
						className={styles['clear-all']}
					>
            <a onClick={this.clearAllFilters} href="#">Clear All</a>
          </div>
				</Row>
				<div className="tl-header">
					<Date date={this.props.date} onDateChange={this.onDateChange}/>
					<Switch modeChangedCallback={this.modeChangedCallback}/>
				</div>
				<div className="tl-wrapper">
					<TimelineLabels
						modeBusiness={this.state.modeBusiness}
					/>
					{filteredPeople.map((el, index) => {
						return <TimelineSingle 
							key={index} 
							people={el}
							tasks={el.tasks}
							modeBusiness={this.state.modeBusiness}
							taskClickedCallback={this.taskClickedCallback}
							nameClickedCallback={this.nameClickedCallback}
							add={this.emptySlotClickedCallback}
						/>
					})}
				</div>
				<ModeSwitch 
					modeBusiness={this.state.modeBusiness} 
					changeMode={this.changeMode}
				/>
			</div>
			)
	}
}


Timeline.propTypes = {
  tasks: PropTypes.array,
  entities: PropTypes.array,
  equipments: PropTypes.array,
  date: PropTypes.object,
  mode: PropTypes.string,
  onAddClicked: PropTypes.func,
  onTaskClicked: PropTypes.func,
  onDateChanged: PropTypes.func,
};



export class TimelineSingle extends Component {
	generateSlots() {
		let startPoint = 11, parts = 61;
		if (this.props.modeBusiness) {
			startPoint = 5;
			parts = 33;
		}
		let slots = [];
		let hourIndex = startPoint + 0.5;
		for (let i = startPoint; i < parts; i++) {
			hourIndex += 0.5;
			if (hourIndex == 12.5) {
				hourIndex = 0.5;
			}
			slots.push(hourIndex);
		}
		return slots;
	}

	getHours(date) {
    const hours = moment.utc(date).local().get('hour');
    return hours;
	}

	editLongName(name) {
		let nameString = (name != undefined) ? this.props.people.name.substring(0, 10) : "Loading names";
		if ( (name != undefined) && (name.length > 10) ) {
			nameString += "...";
		}
		return nameString;
	}

	getHeight(tasks) {
		let height = (tasks && tasks != undefined) ? (tasks.length)*taskHeight+ 'px': 0;
		if (!tasks || tasks.length == 0) height = taskHeight +'px';
		return {height: height, lineHeight: height, maxHeight: height};
	}

	mouseOver(task){
		console.log('item hover');
	}

	mouseOut(task){
		console.log('item out');
	}

render() {
    const totalHeight = this.props.tasks ? this.props.tasks.length * taskHeight : taskHeight;
    return (
			<div className="tl-single" style={this.getHeight(this.props.tasks)}>
				<div className="tl-slots tl-name" style={this.getHeight(this.props.tasks)} onClick={() => this.props.nameClickedCallback(this.props.people.name, this.props.people.id)}>
          <div className="name">
            <img className='avatar' src={ this.props.people.image_path || (this.props.people.equipment === true ? '/images/equipment.png':'/images/user.png') } alt=""/>
            {this.editLongName(this.props.people.name)}
          </div>
				</div>
        <div className="tl-group">
          {this.generateSlots().map((el, index) => {
            let prefix = ":00";
            if(el % 1 !== 0){
              prefix = ":30";
            }

  					return (
  						<div className="tl-slots tl-timeline-slots" style={this.getHeight(this.props.tasks)} key={index} onClick={() => this.props.add(el, index)}>
                {/*<div className="time-display-in-slot">{Math.floor(el)}{prefix}</div>*/}
                <div className="add">+</div>
  						</div>
  						)
  				})}
  				{(this.props.tasks != undefined) ? this.props.tasks.map((el, index) => {
  					const backgroundColor = el.extra_fields && el.extra_fields.task_color ? el.extra_fields.task_color : '#0693e3';
        			let bg_color_rgb = hextToRGBA(backgroundColor, 1);
        			if (el.status === 'COMPLETE' || el.status === 'AUTO_COMPLETE') {
          				bg_color_rgb = hextToRGBA(backgroundColor, 0.5);
        			}

            let start_momentdate = moment.utc(el.start_datetime).local();
            let end_momentdate = moment.utc(el.end_datetime).local();


  					let start = parseInt(start_momentdate.get('hour')) * 2;
  				  let end = parseInt(end_momentdate.get('hour')) * 2;

            start = start + (start_momentdate.get('minute') / 30);

            end = end + (end_momentdate.get('minute') / 30);
  					return (
  							<div 
  								onClick={() => this.props.taskClickedCallback(el, el.title, el.id)}
									onMouseOver={this.mouseOver()}
									onMouseOut={this.mouseOut()}
  								className="task" 
  								key={index}   
  								style={{
  									left: !this.props.modeBusiness ?
  										(start*thumbWidth + firstColumWidth - 20) + 'px'
  											:
  										((start-12)*thumbWidth + firstColumWidth - 20) + 'px',
  									width: (end - start)*thumbWidth + 'px',
  									minWidth: (end - start)*thumbWidth + 'px',
  									lineHeight: '22px',
  									height: taskHeight + 'px',
  									top: ((-1)*totalHeight) + 'px',
  									zIndex:  this.props.tasks.length - index,
  									background: bg_color_rgb,
  									opacity: ((!this.props.modeBusiness) || ((start-12) > 0)) ? 1:.1,
  								}}
  							>
  								{el.title}
                  <p>{el.customer_first_name} {el.customer_last_name} - {el.customer_address}</p>
    							<p className="content">
                    {start_momentdate.format('hh:mm A')} - {end_momentdate.format('hh:mm A')}
    							</p>
  							</div>
  						)
  				}) : <div>Loading tasks</div>}
        </div>
      </div>
			)
	}
}

export class TimelineLabels extends Component {
	generateLabels() {
		let startPoint = 11, parts = 36, label = 'am';
		if (this.props.modeBusiness) {
			startPoint = 5;
			parts = 19;
		}
		let hour = startPoint;
		let labels = [];
		for (let i = startPoint; i < parts; i++) {
			hour++;
			if (hour == 13) {
				hour = 1;
				label = "pm";
			}
			labels.push({'hour': hour, 'label': label});
		}
		return labels;
	}

	viewSwitcher(){
		return(
			<ButtonGroup className={styles.dropdownOptions}>
				<DropdownButton
					key="dropdown"
					id="bg-nested-dropdown"
					onToggle={e=>null}
					title="&#10247;"
				>
					<MenuItem>
						<div onClick={this.props.googleOAuthFlow} style={{ marginLeft: '20px' }}>
							Bussiness hours
						</div>
					</MenuItem>
					<MenuItem>
						<div onClick={this.openExportModal} style={{ marginLeft: '20px' }}>
							Export Task
						</div>
					</MenuItem>
				</DropdownButton>
			</ButtonGroup>
		)
	}

	render() {
		return (
			<div className={styles["tl-labels"] + ' tl-labels'}>
				<div className="tl-label-name tl-label">
					{this.viewSwitcher()}
					</div>
				{this.generateLabels().map((el, index) => {
					return (
							<div className={styles["tl-label"] + ' tl-label'} key={index}>
								{el.hour}<span>{el.label}</span>
							</div>
						)
				})}
			</div>
			)	
	}
}

export class Date extends Component {
	constructor() {
		super();
	}

	render () {

    const customControl = <Button>
          {
            moment(this.props.date).format('dddd MMMM Do')
          }
        </Button>;
		return (
				<div className="date">
          <Button onClick={()=>{
            var temp = moment(this.props.date);
            temp = temp.subtract(1, "days");
            this.props.onDateChange(temp.toDate());
          }}>back</Button>
          <FieldGroup id="start-date" componentClass={DatePicker}
                      onChange={this.props.onDateChange} name="start-date" value={moment(this.props.date).format()} customControl={customControl} className='hello'
                      />
          <Button onClick={()=>{
            var temp = moment(this.props.date);
            temp = temp.add(1, "days");
            this.props.onDateChange(temp.toDate());
          }}>next</Button>
				</div>
			)
	}
}

export class Switch extends Component {

	timeline (e) {
		this.props.modeChangedCallback(e.target.id)
	}

	render () {
		return (
			<div className="switch">
				<ul>
					<li id="timeline" onClick={this.timeline.bind(this)}>Timeline</li>
					{/*<li id="timeline-week"onClick={this.timeline.bind(this)}>Timeline week</li>*/}
				</ul>
			</div>
		)
	}
}

export class ModeSwitch extends Component {

	render() {
		return (
			<div className="mode-switch" onClick={this.props.changeMode}>
				{this.props.modeBusiness ? "Show full day":"Show business hours"}
			</div>
			)
	}
}