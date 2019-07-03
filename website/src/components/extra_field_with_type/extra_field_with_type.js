import React, { Component } from 'react';
import styles from './extra_field_with_type.module.scss';
import cx from 'classnames';
import { Row, Col, FormGroup, FormControl } from "react-bootstrap";
import { SimpleSelect } from "react-selectize";
import { FieldGroup } from '../fields';
import DatePicker from 'react-bootstrap-date-picker';
import style from '../task-wrapper-v2/base-styling.module.scss';
import moment from 'moment-timezone';

export default class ExtraFieldWithType extends Component {
  constructor(props) {
    super(props);

    this.addField = this.addField.bind(this);

    const fields = props.fields ? props.fields : [];
    fields.map((field) => {
      if (field.type && field.type.toUpperCase() === 'BOOLEAN') {
        field.value = "true";
      }
    });
    this.state = {
      fields
    };
  }

  componentWillReceiveProps(nextProps) {
    const fields = nextProps.fields ? nextProps.fields : [];
    this.setState({
      fields,
    });
  }

  addField() {
    const { fields } = this.state;
    fields.push({ name: '', type: 'NUMBER' });
    this.setState({ fields });
    this.props.onChange(fields);
  }

  removeField(id) {
    const { fields } = this.state;
    fields.splice(id, 1);
    this.setState({ fields });
    this.props.onChange(fields);
  }

  changeField(id, fieldType, value) {
    const selectInstance = 'select' + id;
    if (this[selectInstance]) {
      this[selectInstance].blur();
    }
    const { fields } = this.state;
    fields[id][fieldType] = value;
    this.props.onChange(fields);
  }

  render() {
    const onFieldChange = (id, fieldType, value = null) => {
      if (value) {
        this.changeField(id, fieldType, moment(value).format('YYYY-MM-DD'));
      }
      return (event) => {
        if (event) {
           if (event.target) {
            this.changeField(id, fieldType, event.target.value);
          } else {
            this.changeField(id, fieldType, event.name);
          }
        }
      };
    };
    const onFieldRemove = (id) => {
      return (event) => {
        this.removeField(id);
      };
    };

    return (
      <div>
        {this.state.fields && this.state.fields.map((field, idx) => {
          return (
            <div className={cx(styles.extraFieldWrapper)}>
              <Row className={cx(styles.taskFormRow)} key={idx}>
                <Col xs={12} sm={this.props.getValue ? 4 : 6}>
                  <FieldGroup id="field-name" name="field-name" placeholder="Field Name" onChange={this.props.getValue ? () => {return} : onFieldChange(idx, 'name')} value={field.name}  disabled={this.props.getValue} />
                </Col>
                <Col xs={12} sm={this.props.getValue ? 4 :6}>
                  <FormGroup>
                  <div className={cx(styles.selectBox)}>
                    <FormControl onChange={this.props.getValue ? () => { return; } : onFieldChange(idx, 'type')}
                                 defaultValue={field.type} value={field.type} componentClass="select"
                                 name="field-type" disabled={this.props.getValue}>
                      <option value="NUMBER">Number</option>
                      <option value="BOOLEAN">Boolean</option>
                      {/*<option value="LIST">List</option>*/}
                      <option value="DATE">Date</option>
                      <option value="TEXT">Text</option>
                    </FormControl>
                  </div></FormGroup>
                </Col>
                {this.props.getValue && <Col xs={12} sm={4}>
                  {!field.type || field.type.toUpperCase() === 'TEXT' && <FieldGroup id="field-value-text" name="field-value" placeholder="Field Value" onChange={onFieldChange(idx, 'value')} value={field.value}  disabled={!this.props.can_edit} />}
                  {field.type && field.type.toUpperCase() === 'NUMBER' && <FieldGroup id="field-value-number" name="field-value" placeholder="Field Value" type="number" onChange={onFieldChange(idx, 'value')} value={field.value}  disabled={!this.props.can_edit} />}
                  {field.type && field.type.toUpperCase() === 'BOOLEAN' && <FormGroup><div className={cx(styles.selectBox)}><FormControl id="field-value-boolean" name="field-value" placeholder="Field Value" defaultValue="true" onChange={onFieldChange(idx, 'value')} value={field.value}  disabled={!this.props.can_edit} componentClass="select" >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </FormControl></div></FormGroup>}
                  {field.type && field.type.toUpperCase() === 'DATE' && <FormGroup><div className={cx(style.inner, styles.datePicker)}>
                    <FormControl componentClass={DatePicker} id="field-value-date" name="field-value" onChange={(value) => {onFieldChange(idx, 'value', value)}} value={field.value}  disabled={!this.props.can_edit} showClearButton={false} calendarPlacement="top" />
                  </div></FormGroup>}
                </Col>}
              </Row>
              {!this.props.getValue && <span className={cx(styles.remove)} onClick={onFieldRemove(idx)} />}
            </div>
          );
        })}
        {!this.props.getValue && <div className={cx(styles.btnWrapper)}>
          <button className={cx(styles.btn, styles['btn-primary-outline'])} onClick={this.addField}>Add Extra Field</button>
        </div>}
      </div>
    );
  }
}
