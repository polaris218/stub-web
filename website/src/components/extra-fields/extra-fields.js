import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, FormControl, InputGroup, Row, Col, a } from 'react-bootstrap';
import styles from './extra-fields.module.scss';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/fontawesome-free-solid';
import { SimpleSelect } from 'react-selectize';

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
      if (this.searchValue !== null && this.searchValue !== '' ) {
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
        <div className={[this.props.className, styles['add-fields-form']].join(' ')}>
          {(typeof this.props.canViewTaskFullDetails === 'undefined' || this.props.canViewTaskFullDetails === true) &&
          (typeof this.props.canEdit === 'undefined' || this.props.canEdit === true)&& <FormGroup>
                <a className={styles['add-field-btn']} onClick={this.addField}>{ this.props.buttonTitle ? this.props.buttonTitle : 'Add extra fields' }</a>
            </FormGroup>}
            <Row>
                {this.state.fields && this.state.fields.map((field, idx) => {
                  const selectInstance = 'select' + idx;
                  return (
                    <Col md={12} sm={12} key={idx}>
                      <FormGroup id={field.name} className={styles['field-form']}>
                        <InputGroup className={!this.props.fullWidth ? styles['full-width'] : null}>
                          <div>
                            <Col xs={(typeof this.props.canViewTaskFullDetails === 'undefined' || this.props.canViewTaskFullDetails === true) ? 5 : 6} >
                              { this.props.restrictOptions ?
                                <div className={styles['extra-fields-select']}>
                                  <SimpleSelect
                                    ref={select => {
                                      this[selectInstance] = select;
                                    } }
                                    hideResetButton="true"
                                    className={styles['extra-field']}
                                    options={this.props.options}
                                    // restoreOnBackspace={(item) => {
                                    //   return item.label.substr(0, item.label.length - 1)
                                    // }}
                                    placeholder={ 'Field Name' }
                                    onValueChange={onFieldChange(idx, 'name')}
                                    defaultValue={field.name ? this.getDefaultValue(field.name) : this.props.options[0]}
                                    createFromSearch={(options, search) => { this.formSearch(options, search); }}
                                    onBlur={() => { this.onBlurHandler(idx, 'name'); }}
                                    disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}
                                  />
                                </div>
                                :
                                <FormControl id="field-name" type="text" placeholder={this.props.entityTitle ? this.props.entityTitle : 'Field Name'} onChange={onFieldChange(idx, 'name')} value={field.name}/>
                              }
                              <InputGroup.Button className={styles['empty-width']}></InputGroup.Button>
                            </Col>
                            <Col xs={(typeof this.props.canViewTaskFullDetails === 'undefined' || this.props.canViewTaskFullDetails === true) ? 5 : 6}>
                              <FormControl id="field-value" type="text" placeholder={this.props.entityValueTitle ? this.props.entityValueTitle : 'Field Value'} onChange={onFieldChange(idx, 'value')} value={field.value}
                                           disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
                              <InputGroup.Button className={styles['empty-width']}></InputGroup.Button>
                            </Col>
                            {(typeof this.props.canEdit === 'undefined' || this.props.canEdit === true) && <Col xs={2}>
                              <Button className={styles['remove-button']} onClick={onFieldRemove(idx)}><FontAwesomeIcon icon={faTimes} /></Button>
                            </Col>}
                          </div>
                        </InputGroup>
                      </FormGroup>
                    </Col>);
                })}
            </Row>
        </div>);
    }
}

ExtraFields.propTypes = {
  fields: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  restrictOptions: PropTypes.bool,
  options: PropTypes.array,
  className: PropTypes.string,
  fullWidth: PropTypes.bool
};
