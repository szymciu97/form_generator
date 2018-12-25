import React, { Component } from 'react';
import QuestionGenerator from './QuestionGenerator';
import formStore from '../FormsDB';
import Dispatcher from '../Dispatcher';
class FormGenerator extends Component {
  constructor(params) {
    super(params);

    this.state = { form: { ...formStore.selectedForm } };
    this.getForm = this.getForm.bind(this);

  }

  addInput() {
    Dispatcher.dispatch({ type: 'ADD_INPUT', payload: {} })
  }

  componentWillMount() {
    formStore.on('questionsUpdated', this.getForm)
  }

  componentWillUnmount() {
    formStore.removeListener('questionsUpdated', this.getForm);
  }

  getForm() {
    this.setState({ form: { ...formStore.selectedForm } })
  }

  render() {

    const childs = this.state.form.rootQuestions.map((el) => {
      return (<QuestionGenerator key={el} id={el} ></QuestionGenerator>);
    });


    return (
      <div className="container">
        <h1>Form Generator</h1>
        <h3>{this.state.name}</h3>
        <div className="row">
          <div className="col-12" >
            {childs}
          </div>
        </div>
        <button onClick={this.addInput.bind(this)} className="btn btn-primary">Add Input</button>
      </div>
    );
  }
}

export default FormGenerator;
