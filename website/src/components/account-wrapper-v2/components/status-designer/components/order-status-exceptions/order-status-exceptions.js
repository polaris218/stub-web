import React, {Component} from 'react';
import styles from './order-status-exceptions.module.scss';
import { Button, Modal, FormControl, FormGroup} from 'react-bootstrap';
import cx from 'classnames';

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
    const crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756"><g transform="translate(-1270.486 -30.485)"><path d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z" transform="translate(4126.197 -40.804)" fill="#8d959f"/></g></svg>;
		return(
			<Modal show={this.props.showDialogBox} onHide={this.props.onHide} dialogClassName={styles.addTemplateModal}>
				<Modal.Header className={cx(styles.templateModalHeader)}>
					<Modal.Title>
						Exception List
            <i className={styles.closeIcon} onClick={this.props.onHide}>{crossIcon}</i>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className={cx(styles.box)}>
						<div className={cx(styles.boxBody)}>
							<div className={cx(styles.boxBodyInner)}>
                <FormGroup>
									<FormControl componentClass={'textarea'} placeholder={"CODE#MESSAGE TIER 1# MESSAGE TIER 2"} value={this.state.exceptions_list} ref = {(input) => { this.inputArea = input; }} onChange={(e) => this.handleOrderFilterChange(e)}/>
								</FormGroup>
							</div>
						</div>
					</div>
          <div className="text-right">
            <Button onClick={this.props.onHide} className={cx(styles.btn, styles['btn-light'])}>Cancel</Button>
            <Button  type="submit" className={cx(styles.btn, styles['btn-secondary'])} onClick={() => this.handleParseOfOrderFilterChange()}>Confirm</Button>
					</div>
				</Modal.Body>
			</Modal>
		);
	}
}
