import React, {Component} from 'react';
import style from './time-filter-in-reports.module.scss';
import {Col, ControlLabel, FormControl, FormGroup, Row} from 'react-bootstrap';
import cx from 'classnames';
import DatePicker from "react-bootstrap-date-picker";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {faCalendar, faChevronCircleRight} from "@fortawesome/fontawesome-free-solid";
import moment from "moment";

export default class TimeFilterInReports extends Component{
	constructor(props){
		super(props);

		this.state= {
			exceptions_list: '',
      hideDialog: false,
			view: '',
			startDate:'',
			endDate:'',
      inputValueStartDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      inputValueEndDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      lowerBound:'',
      upperBound:''
		};
		this.handleChangeStartDate = this.handleChangeStartDate.bind(this);
		this.handleChangeEndDate = this.handleChangeEndDate.bind(this);
		// this.hideDates = this.hideDates.bind(this);
	};

	componentDidMount(){
      let lowerBound = '';
      let upperBound = '';
      if (this.props.view === 'Custom'){
        this.setState({
          hideDialog:true
        });
      }
			if(this.props.view !== 'custom') {
        let start_date = moment().format('YYYY-MM-DD HH:mm:ss');
        let end_date = moment().format('YYYY-MM-DD HH:mm:ss');

        if (this.props.view === 'monthly') {
          start_date = moment().subtract('days', 30).format('YYYY-MM-DD HH:mm:ss');
        } else if (this.props.view === 'weekly') {
          start_date = moment().subtract('days', 7).format(('YYYY-MM-DD HH:mm:ss'));
        } else if (this.props.view === 'daily') {
          start_date = moment().subtract('hours', 24).format(('YYYY-MM-DD HH:mm:ss'));
        } else {
          start_date = moment().subtract('days', 30).format('YYYY-MM-DD HH:mm:ss');
        }


         lowerBound = moment().subtract('months', 3).format('YYYY-MM-DD HH:mm:ss');
         upperBound = moment(end_date).format('YYYY-MM-DD HH:mm:ss');


         this.setState({
          view: this.props.view,
				  startDate:start_date,
					endDate:end_date,
          inputValueStartDate:start_date,
          inputValueEndDate:end_date,
          lowerBound:lowerBound,
          upperBound:upperBound,
        },()=>this.props.getDate(start_date, end_date));
      }
	}

	componentDidUpdate(prevProps){

	  if(!_.isEqual(this.props, prevProps)){


      let lowerBound = '';
      let upperBound = '';

      if (this.props.view === 'custom'){
        this.setState({
          hideDialog:true,
        })
      }
			if(this.props.view !== 'custom' && this.props.view !== prevProps.view) {
        let start_date = moment().format('YYYY-MM-DD HH:mm:ss');
        let end_date = moment().format('YYYY-MM-DD HH:mm:ss');
        if (this.props.view === 'monthly') {
          start_date = moment().subtract('days', 30).format('YYYY-MM-DD HH:mm:ss');
        } else if (this.props.view === 'weekly') {
          start_date = moment().subtract('days', 7).format(('YYYY-MM-DD HH:mm:ss'));
        } else if (this.props.view === 'daily') {
          start_date = moment().subtract('hours', 24).format(('YYYY-MM-DD HH:mm:ss'));
        } else {
          start_date = moment().subtract('days', 30).format('YYYY-MM-DD HH:mm:ss');
        }
         lowerBound = moment().subtract('months', 3).format('YYYY-MM-DD HH:mm:ss');
         upperBound = moment(end_date).format('YYYY-MM-DD HH:mm:ss');


         this.setState({
          view: this.props.view,
				  startDate:start_date,
					endDate:end_date,
          inputValueStartDate:start_date,
          inputValueEndDate:end_date,
          lowerBound:lowerBound,
          upperBound:upperBound,
        },()=>this.props.getDate(start_date, end_date));
      }
	  }
	}

	handleChangeStartDate(value) {
    let currentTime = moment().format('HH:mm:ss');
	  let currentDate = moment(value).format("YYYY-MM-DD");
	  let dateTime = currentDate+' '+currentTime;


	  if (this.state.inputValueStartDate && this.state.inputValueEndDate){
      this.setState({inputValueStartDate: dateTime},
        ()=>{this.props.getDate(dateTime, this.state.inputValueEndDate);
      });
    }
    else {

      this.setState({inputValueStartDate: dateTime},
        ()=>{this.props.getDate(dateTime, this.state.endDate);
      });
    }
  }

  handleChangeEndDate(value) {
    let currentTime = moment().format('HH:mm:ss');
    let currentDate = moment(value).format("YYYY-MM-DD");
    let dateTime = currentDate+' '+currentTime;

	  if (this.state.inputValueStartDate && this.state.inputValueEndDate){
    this.setState({inputValueEndDate: dateTime},()=>{
      this.props.getDate(this.state.inputValueStartDate, this.state.inputValueEndDate);
    });
    }
    else{
      this.setState({inputValueEndDate: dateTime},()=>{
        this.props.getDate(this.state.startDate, this.state.inputValueEndDate);
      });
    }
  }

	render(){
		return(
      <div className={style['field-wrapper']}>
        <Row classNmae={style.container}>
          <Col xs={12} sm={6} md={6}>
            <FormGroup className={cx(style.fieldGroup)}>
              <div className={cx(style.inner, style.datePicker)}>
                <ControlLabel>Start Date</ControlLabel>
                <FormControl
                  componentClass={DatePicker}
                  onChange={(event) => this.handleChangeStartDate(event)}
                  selected={this.state.inputValueStartDate}
                  minDate={this.state.lowerBound}
                  maxDate={this.state.inputValueEndDate}
                  showClearButton={false}
                  name="start-date" ref="start_date"
                  value={this.state.inputValueStartDate}
                  disabled ={this.props.disableFields}
                />
                <FontAwesomeIcon icon={faCalendar} className={style['fa-icon']}/>
              </div>
            </FormGroup>
          </Col>
          <Col xs={12} sm={6} md={6}>
            <FormGroup className={cx(style.fieldGroup)}>
              <div className={cx(style.inner, style.datePicker)}>
                <ControlLabel>End Date</ControlLabel>
                <FormControl
                  componentClass={DatePicker}
                  onChange={(event) => this.handleChangeEndDate(event)}
                  selected={this.state.inputValueEndDate}
                  maxDate={this.state.upperBound}
                  minDate={this.state.inputValueStartDate}
                  showClearButton={false} name="end-date" ref="end_date"
                  value={this.state.inputValueEndDate}
                  disabled ={this.props.disableFields}
                />
                <FontAwesomeIcon icon={faCalendar} className={style['fa-icon']}/>
              </div>
            </FormGroup>
            </Col>
        </Row>
      </div>
		);
	}
}
