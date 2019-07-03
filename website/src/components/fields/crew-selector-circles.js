import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';
import styles from './crew-selector-circles.module.scss';
import { MultiSelect } from 'react-selectize';
import cx from 'classnames';
import moment from 'moment';
import { PulseLoader } from 'react-spinners';
import { DEFAULT_COLORPICKER_COLOR } from '../fields/color-field';

const isInList = (arr, id) => arr.some(e_id => e_id === id);

export default class CrewSelectorCircles extends Component {
	static propTypes = {
		entities: PropTypes.array.isRequired,
		allEntities: PropTypes.array.isRequired,
		updateEntities: PropTypes.func.isRequired,
		getSchedule: PropTypes.func.isRequired,
		placeholder: PropTypes.string,
		unscheduled: PropTypes.bool,
		profile: PropTypes.object,
		entity_confirmation_statuses: PropTypes.object
	}

	static defaultProps = {
		idsPath: 'entity_ids'
	}

  constructor(props, context) {
    super(props, context);
    this.removeSelectedValue = this.removeSelectedValue.bind(this);

    this.state = {
      tasks: [],
      loading: true,
      requestFailed: false
    };
  }

	componentDidMount() {
		if (!this.props.unscheduled) {
			this.loadSchedule(this.props.startDate, this.props.endDate);
		}
	}

	componentWillReceiveProps(nextProps) {
		if ((this.props.startDate !== nextProps.startDate || this.props.endDate !== nextProps.endDate) && !this.props.unscheduled) {
			this.loadSchedule(nextProps.startDate, nextProps.endDate);
		}
	}

	loadSchedule(startDate, endDate) {
		this.setState({ loading: true, requestFailed: false });
		//load schedule for the entire day to show previous and next jobs
		this.props.getSchedule({
			startDate: moment(startDate).startOf('day'),
			endDate: moment(endDate).endOf('day')
		}).then(resp => {
			const schedule = JSON.parse(resp);
			this.setState({ tasks: schedule.tasks, loading: false });
		})
			.catch(e => {
				this.setState({
					loading: false,
					requestFailed: true
				})
			});
	}


	renderOption = ({ tasks, loading, name, type, id, image_path, start, end, selectable, ...item }) => {

		let isAvailable = true;
		const { startDate, endDate } = this.props;
		if (tasks.length) {
			tasks = tasks.filter(task => isInList(task.resource_ids, id) || isInList(task.entity_ids, id));

			if (tasks.length) {
				isAvailable = !tasks.some(task => {
					return moment.utc(task.start_datetime).local().isBetween(startDate, endDate, 'minutes', '[]') || moment.utc(task.end_datetime).local().isBetween(startDate, endDate, 'minutes', '[]')
				});
			}
		}

		return (
			<div key={id} className={ cx('simple-option', styles.option, { 'not-selectable': !selectable }) }>

				<div className={ styles['option-image']}>
					<img className={ styles['avatar']} src={ image_path || '/images/user.png' } alt=""/>
				</div>
				<div className={ styles['option-info']}>
					<div className={ styles['option-name-row']}>
						<div className={ styles['option-name']}>
							{name}
							<br />
							<span>{type}</span>
						</div>
						{ loading ? <PulseLoader color='#008BF8' size={8}/> :
							<div className={ cx(styles['option-status'], { [styles.available]: isAvailable })}>
								{ isAvailable ? 'Available' : 'Busy' }
							</div> }
					</div>
					<div className={ styles['option-dates']}>
						{ tasks.map(task => <div>
							<OverlayTrigger
								overlay={ <Tooltip id={task.id}>
									{ task.customer_name } <br/>
									{ task.customer_address }
								</Tooltip> }
								placement="top"
								delayShow={150}
								delayHide={150}
							>
								<span className={styles['option-dates-task']}>{task.title}</span>
							</OverlayTrigger>
							 ({moment.utc(task.start_datetime).local().format('hh:mm A')}
							- {moment.utc(task.end_datetime).local().format('hh:mm A')})
						</div>) }
					</div>
				</div>
			</div>
		);
	}

  removeSelectedValue(e, item) {
	  e.preventDefault();
	  e.stopPropagation();
    // The library by default opens up the dropdown when click anywhere inside the react-selectize MultiSelect.
    // If we call the blur() function from selectize API, it will create a ripple effect (the selectize will open first and then close instantly).
    const arr = this.props.entities.filter(id => id !== item.value);
    this.props.updateEntities(arr);
  }

	render() {
		const { loading, tasks, requestFailed } = this.state;
		const { allEntities, placeholder, updateEntities, startDate, endDate } = this.props;
		const { removeSelectedValue } = this;
		const options = allEntities.map((item) => ({
			value: item.id,
			label: item.name || 'Unknown',
			tasks,
			loading,
			...item
		}));

		const entities = this.props.entities ? this.props.entities : [];
		const profile = this.props.profile;
		const entity_confirmation_statuses = this.props.entity_confirmation_statuses;
		const showTeamConfirmation = this.props.canViewTeamConfirmation;
		return <div className={styles['crew-form']}>
			<MultiSelect
				ref={select => {
					this.select = select
				} }
				options={options}
				onValuesChange={ items => {
					updateEntities(items.map(({ id }) => id))
				} }
				values={options.filter(ent => entities.some(id => id === ent.id))}
				renderOption={this.renderOption}
				uid={ i => i.id }
				filterOptions={ (options, values, search) => {
					return options
						.filter(option => option.label.toLowerCase().indexOf(search.toLowerCase()) > -1)
						.map(function (option) {
							option.selectable = values.map(item => item.id).indexOf(option.value) == -1
							return option;
						})
				}}
        		renderValue = {function(item){
					let color = item.color ? item.color : DEFAULT_COLORPICKER_COLOR;
					let entityConfirmationMessage = 'Pending response';
					if (showTeamConfirmation && profile && profile.enable_team_confirmation) {
						color = '#666666';
						if (showTeamConfirmation && entity_confirmation_statuses) {
							if (entity_confirmation_statuses.hasOwnProperty(item.id) && entity_confirmation_statuses[item.id].status === 'ACCEPTED') {
								color = '#24ab95';
                entityConfirmationMessage = 'Accepted';
							} else if (entity_confirmation_statuses.hasOwnProperty(item.id) && entity_confirmation_statuses[item.id].status === 'REJECTED') {
								color = '#FF4E4C';
                entityConfirmationMessage = 'Rejected';
							}
						}
					}
					const entityConfirmationTooltip = (<Tooltip id={'idx_' + item.id}>{entityConfirmationMessage}</Tooltip>);
					return <div className={styles['simple-value']}>
						<div className={styles['select-option']} style={{borderColor: color}}>
							{showTeamConfirmation && profile && profile.enable_team_confirmation ?
                <OverlayTrigger placement="top" overlay={entityConfirmationTooltip}>
									<img className={styles['image-icon']} src={item.image_path || '/images/user.png' } />
								</OverlayTrigger>
								:
                <img className={styles['image-icon']} src={item.image_path || '/images/user.png' } />
							}
							<span className={styles['item-title']}>{item.label}</span>
							<br />
							{item.type !== '' ? <span className={styles['item-type']}>{item.type}</span> : <span className={styles['item-type']}>&nbsp;</span>}
						</div>
						<span onClick = {function (e) { removeSelectedValue(e, item); }}>x</span>
					</div>
				}}
				placeholder={placeholder}
        disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
			{ requestFailed && <div className={ styles['request-failed'] }>
				Unable to load the schedule. Please <a href="#" onClick={ () => this.loadSchedule(startDate, endDate) }>retry</a>
			</div> }
		</div>;
	}
}
