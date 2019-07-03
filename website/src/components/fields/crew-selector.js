import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';
import styles from './crew-selector.module.scss';
import { MultiSelect } from 'react-selectize';
import cx from 'classnames';
import moment from 'moment';
import { PulseLoader } from 'react-spinners';
import { DEFAULT_COLORPICKER_COLOR } from '../fields/color-field';

const isInList = (arr, id) => arr.some(e_id => e_id === id);

export default class CrewSelector extends Component {

	static propTypes = {
		entities: PropTypes.array.isRequired,
		allEntities: PropTypes.array.isRequired,
		updateEntities: PropTypes.func.isRequired,
		getSchedule: PropTypes.func.isRequired,
		placeholder: PropTypes.string,
    	disableColors: PropTypes.bool,
    	unscheduled: PropTypes.bool
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


	renderOption = ({ tasks, loading, name, id, image_path, start, end, selectable, ...item }) => {
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

    let image_path_src = this.props.disableColors ? '/images/equipment.png' : '/images/user.png';

    if (image_path) {
      image_path_src = image_path;
    }

		return (
			<div key={id} className={ cx('simple-option', styles.option, { 'not-selectable': !selectable }) }>

				<div className={ styles['option-image']}>
					<img className={ styles['avatar']} src={ image_path_src } alt=""/>
				</div>
				<div className={ styles['option-info']}>
					<div className={ styles['option-name-row']}>
						<div className={ styles['option-name']}>{name}</div>
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

  removeSelectedValue(item){
    let arr = this.props.entities.filter(id => id !== item.value);
    this.props.updateEntities(arr);
  }

	render() {
		const { loading, tasks, requestFailed } = this.state;
		const { allEntities, placeholder, updateEntities, startDate, endDate, disableColors } = this.props;
		const { removeSelectedValue } = this;
		const options = allEntities.map((item) => ({
			value: item.id,
			label: item.name || 'Unknown',
			tasks,
			loading,
			...item
		}));

    const entities = this.props.entities ? this.props.entities : [];

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
                const color = item.color ? item.color : DEFAULT_COLORPICKER_COLOR;
                return <div className='simple-value'>
                    <div className={styles['select-option']}>
                      { disableColors ? null : <div className={styles['crew-color']} style={{background: color}}/>}
                      {item.label}
                    </div>
                    <span onClick = {function(){
                        removeSelectedValue(item);
                    }}>x</span>
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
