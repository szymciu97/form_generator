import React, { Component } from 'react';
import formsStore from '../FormsDB';
import dispatcher from '../Dispatcher'

class Forms extends Component {
  constructor() {
    super();

    this.getForms = this.getForms.bind(this);
    this.state = {
      forms: []
    }

    dispatcher.dispatch({ type: 'FETCH_FORMS' });

  }

  componentWillMount() {
    formsStore.on('formsFetched', this.getForms);
  }
  componentWillUnmount() {
    formsStore.removeListener('formsFetched', this.getForms);
  }

  getForms() {
    this.setState({ forms: formsStore.forms });
  }

  deleteForm(event) {
    dispatcher.dispatch({ type: 'DELETE_FORM', payload: { id: parseInt(event.target.value) } });
  }

  editForm(event) {
    dispatcher.dispatch({ type: 'EDIT_FORM', payload: { id: parseInt(event.target.value) } });
  }

  previewForm(event) {
    dispatcher.dispatch({ type: 'PREVIEW_FORM', payload: { id: parseInt(event.target.value) } });
  }

  render() {

    const childs = this.state.forms.map((child) =>
      <div key={child.id} className="card mb-3">
        <div className="card-header" >{child.name}</div>
        <div className="card-body" >
          <div className="mb-3" >
            Root Questions: {child.rootQuestions.length} Total Questions: {child.allQuestions.length}
          </div>
          <button value={child.id} className="mr-3 btn btn-primary" onClick={this.editForm.bind(this)} >Edit</button>
          <button value={child.id} className="btn btn-danger float-right btn-sm" onClick={this.deleteForm.bind(this)} >Delete</button>
          <button value={child.id} className="btn btn-primary" onClick={this.previewForm.bind(this)} >Form Preview</button>
        </div>
      </div>
    )

    return (
      <div className="container">
        <h1>Forms</h1>
        {childs}
      </div>
    );
  }
}

export default Forms;
