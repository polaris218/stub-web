import React, { Component } from 'react';
import styles from './extra-field-with-options.module.scss';
import cx from 'classnames';
import { Row, Col, FormGroup, FormControl } from "react-bootstrap";
import { FieldGroup } from '../../../../../fields';

export default class ExtraFieldWithOptions extends Component {
  constructor(props) {
    super(props);

    this.addField = this.addField.bind(this);

    const fields = props.fields ? props.fields : [];

    this.state = ({fields});
  }

  componentWillReceiveProps(nextProps) {
    const fields = nextProps.fields ? nextProps.fields : [];
    this.setState({
      fields,
    });
  }

  addField() {
    const defaultTemplateId = this.props.templates && this.props.templates.filter(template => template.is_default);
    const { fields } = this.state;
    fields.push({ name: '', value: `${defaultTemplateId[0].id}`});
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
    fields[id][fieldType] = fieldType === 'name'  && value ? value.toUpperCase() : value;
    this.props.onChange(fields);
  }

  render() {
    const onFieldChange = ((id, fieldType) => {
      return (event) => {
        if (event) {
           if (event.target) {
            this.changeField(id, fieldType, event.target.value);
          }
        }
      };
    });
    const onFieldRemove = (id) => {
      return (event) => {
        this.removeField(id);
      };
    };
    return (
      <div>
        {this.state.fields && this.state.fields.map((field, idx) => {
          return (
            <div className={styles.extraFieldWrapper}>
              <Row className={styles.taskFormRow} key={idx}>
                <Col xs={12} sm={this.props.getValue ? 4 : 6}>
                  <FieldGroup id={"field-name-"+idx} name="field-name" placeholder={this.props.fieldNamePlaceholer || 'Field Name'} onChange={this.props.getValue ? () => {return} : onFieldChange(idx, 'name')} value={field.name}  disabled={this.props.getValue} />
                </Col>
                <Col xs={12} sm={this.props.getValue ? 4 :6}>
                  <FormGroup>
                    <div className={cx(styles.selectBox)}>
                      <FormControl onChange={this.props.getValue ? () => { return; } : onFieldChange(idx, 'value')}
                                   defaultValue={field.name} value={field.value} componentClass="select"
                                   name="field-type" disabled={this.props.getValue}>
                        {this.props.templates && this.props.templates.map((template) => {return <option  value={template.id}>{template.name}</option>})}

                      </FormControl>
                    </div>
                  </FormGroup>
                </Col>
              </Row>
              {!this.props.getValue && <span className={styles.remove} onClick={onFieldRemove(idx)} />}
            </div>
          );
        })}
        {!this.props.getValue && <div className={cx(styles.btnWrapper)}>
          <button className={cx(styles.btn, styles['btn-primary-outline'])} onClick={this.addField}>{this.props.addNewText || 'Add Extra Field'}</button>
        </div>}
      </div>
    );
  }
}
