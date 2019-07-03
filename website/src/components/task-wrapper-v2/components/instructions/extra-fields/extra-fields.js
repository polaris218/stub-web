import React, { Component } from 'react';
import style from "../../../base-styling.module.scss";
import styles from './extra-fields.module.scss';
import cx from 'classnames';
import { Row, Col, FormGroup, FormControl } from "react-bootstrap";
import { FieldGroup } from "../../../../fields";
import { SimpleSelect } from "react-selectize";

export default class ExtraFields extends Component {
  constructor(props) {
    super(props);

    this.addField = this.addField.bind(this);
    this.formSearch = this.formSearch.bind(this);
    this.getDefaultValue = this.getDefaultValue.bind(this);
    this.onBlurHandler = this.onBlurHandler.bind(this);
    this.searchValue = null;

    this.state = {
      fields: props.fields ? props.fields : [],
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      fields: nextProps.fields ? nextProps.fields : [],
    });
  }

  getDefaultValue(value) {
    const options = this.props.options;
    const index = (options.map((option) => {
      return option.name;
    })).indexOf(value);
    if (index > -1) {
      return ({ label: options[index].label });
    }
    return ({ label: value });
  }

  onBlurHandler(id, fieldType) {
    const { fields } = this.state;
    if (this.searchValue) {
      fields[id][fieldType] = this.searchValue;
      this.props.onChange(fields);
      this.searchValue = null;
    }
    if (this['select'+id] && this['select'+id].state) {
      this['select'+id].state.value = this.getDefaultValue(fields[id][fieldType]);
    }
  }

  formSearch(options, search) {
    if (search.length === 0 || (options.map((option) => {
      return (option.label);
    })).indexOf(search) > -1) {
      return null;
    }
    this.searchValue = search;
    options.push({ label: search, name: search });
  }

  addField() {
    const { fields } = this.state;
    if (this.props.restrictOptions) {
      fields.push({ name: 'price', value: '' });
    } else {
      fields.push({ name: '', value: '' });
    }
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
    const onFieldChange = (id, fieldType) => {
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
          const selectInstance = 'select' + idx;
          return (
            <div className={cx(styles.extraFieldWrapper)}>
              <Row className={cx(style.taskFormRow)} key={idx}>
                <Col xs={12} sm={6}>
                  <FormGroup>
                    { this.props.restrictOptions ?
                      <SimpleSelect
                        ref={select => {
                          this[selectInstance] = select;
                        }}
                        hideResetButton="true"
                        className={cx(styles['extra-field'])}
                        options={this.props.options}
                        placeholder="Field Name"
                        onValueChange={onFieldChange(idx, 'name')}
                        defaultValue={field.name ? this.getDefaultValue(field.name) : this.props.options[0]}
                        createFromSearch={(options, search) => { this.formSearch(options, search); }}
                        onBlur={() => { this.onBlurHandler(idx, 'name'); }}
                        disabled={!this.props.can_edit}
                      />
                    :
                      <FormControl id="field-name" type="text" placeholder="Field Name" onChange={onFieldChange(idx, 'name')} value={field.name} />
                    }
                  </FormGroup>
                </Col>
                <Col xs={12} sm={6}>
                  <FieldGroup id="field-value" name="field-value" placeholder="Field Value" onChange={onFieldChange(idx, 'value')} value={field.value}  disabled={!this.props.can_edit} />
                </Col>
              </Row>
              {this.props.can_edit && <span className={cx(styles.remove)} onClick={onFieldRemove(idx)} />}
            </div>
          );
        })}
        {(typeof this.props.canViewTaskFullDetails === 'undefined' || this.props.canViewTaskFullDetails === true) &&
        (typeof this.props.can_edit === 'undefined' || this.props.can_edit === true) &&
        <div className={cx(styles.btnWrapper)}>
          <button className={cx(styles.btn, styles['btn-primary-outline'])} onClick={this.addField}>Add Extra Field</button>
        </div>
        }
      </div>
    );
  }
}
