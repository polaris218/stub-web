import React, {Component} from 'react';
import styles from './order-status-exceptions.module.scss';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import cx from 'classnames';
import SavingSpinner from '../saving-spinner/saving-spinner';

export default class OrderStatusExceptions extends Component{
	constructor(props){
		super(props);
		
		this.state= {
			exceptions_list: '',
			showDialogBox: false
		}
	};
	
	componentWillReceiveProps(nextProps) {
		let exception_list_view = "";
		nextProps.exceptions_list && nextProps.exceptions_list.map((exception) => {
		 
			exception_list_view += exception.code.toString()+'#'+exception.message_tier_1.toString()+'#'+exception.message_tier_2.toString()+'\n';
			
		});
		
		if(exception_list_view.length>0){
			exception_list_view = exception_list_view.substr(0,exception_list_view.length-1);
		}
		
		this.setState({
			exceptions_list: exception_list_view
		});
	}
	
	handleOrderFilterChange(e) {
		e.preventDefault();
		e.stopPropagation();
		const exceptions_list = e.target.value;
		this.setState({
			exceptions_list
		});
	}
	
	handleParseOfOrderFilterChange() {
    let arr = [];
		if (this.state.exceptions_list) {
      let ArrayOfExceptions = this.state.exceptions_list.split('\n');
      let TempArrayOfExceptions = [];
      let len = ArrayOfExceptions.length;
      for (let i = 0; i < len; i++) {
        TempArrayOfExceptions = ArrayOfExceptions[i].split('#');
        arr.push({
          code: !TempArrayOfExceptions[0] ? "" : TempArrayOfExceptions[0],
          message_tier_1: !TempArrayOfExceptions[1] ? "" : TempArrayOfExceptions[1],
          message_tier_2: !TempArrayOfExceptions[2] ? "" : TempArrayOfExceptions[2]
        });
      }
    }
    this.props.getExceptionList(arr);
    this.props.onHide();
	}
	
	
	render(){
		return(
			<Modal
				show={this.props.showDialogBox}
				onHide={this.props.onHide}
				dialogClassName={styles.addTemplateModal}
				className={styles.modalContainer}>
				<Modal.Header closeButton>
					<Modal.Title className="text-center" id="contained-modal-title-lg">
						<h2>
							Exception List
						</h2>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Row>
						<Col md={12}>
							<textarea className={ styles['textarea'] } placeholder={"CODE#MESSAGE TIER 1# MESSAGE TIER 2"} value={this.state.exceptions_list} ref = {(input) => { this.inputArea = input; }} onChange={(e) => this.handleOrderFilterChange(e)}/>
						</Col>
					</Row>
				</Modal.Body>
				<Modal.Footer className={styles.templateModalFooter}>
					<div className="text-center">
						<Button  type="submit" className={cx(['btn-submit'], styles.saveBtn)} onClick={() => this.handleParseOfOrderFilterChange()}>Confirm</Button>
						<Button onClick={this.props.onHide} className={cx('btn-submit', styles.transparentButton)}>Cancel</Button>
					</div>
				</Modal.Footer>
			</Modal>
		);
	}
}
