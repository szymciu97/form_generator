import React, { Component } from 'react';

import formStore from '../FormsDB';
import dispatcher from '../Dispatcher'

class QuestionGenerator extends Component {
    constructor(params) {
        super(params);

        this.state = {
            question: { ...(formStore.questions.find((el) => { return params.id === el.id })) },
            parentID: params.parentID,
            parentType: params.parentType

        };

        this.parentTypeChanged = this.parentTypeChanged.bind(this);
        this.getQuestion = this.getQuestion.bind(this);
    }
    componentWillMount() {
        formStore.on('questionsUpdated', this.getQuestion)
        formStore.on('typeChanged', this.parentTypeChanged)
    }

    componentWillUnmount() {
        formStore.removeListener('questionsUpdated', this.getQuestion);
        formStore.removeListener('typeChanged', this.parentTypeChanged)
    }

    getQuestion() {
        this.setState({ question: { ...(formStore.questions.find((el) => { return this.state.question.id === el.id })) } })
    }

    parentTypeChanged(payload) {

        let newCondition = { type: "eq" };
        if (payload.type === 'number') {
            newCondition.value = 0;
        } else if (payload.type === 'boolean') {
            newCondition.value = 'true';
        } else {
            newCondition.value = 'Type smth...';
        }

        if (payload.id === this.state.parentID)
            this.setState({ parentType: payload.type, question: { ...this.state.question, condition: newCondition } })
    }

    getCondition() {

        switch (this.state.parentType) {
            case 'number': {
                return (<div className="form-group form-row">
                    <label htmlFor="condition" className="col-12" >Condition</label>
                    <select onChange={this.changeCondType.bind(this)} defaultValue={this.state.question.condition.type | "eq"} name="condition[type]" type="text" className="col-2 form-control" >
                        <option value="eq" >Equals</option>
                        <option value="lt" >Less Than</option>
                        <option value="gt" >Greater Than</option>
                    </select>
                    <input onChange={this.changeCondValue.bind(this)} defaultValue={this.state.question.condition.value} name="condition[value]" type="number" className="col-10 form-control" />
                </div >);
            }
            case 'boolean': {
                return (<div className="form-group form-row">
                    <label htmlFor="condition" className="col-12" >Condition</label>
                    <select onChange={this.changeCondType.bind(this)} defaultValue={this.state.question.condition.type | "eq"} name="condition[type]" type="text" className="col-2 form-control" >
                        <option value="eq" >Equals</option>
                    </select>
                    <select onChange={this.changeCondValue.bind(this)} defaultValue={this.state.question.condition.value} name="condition[value]" type="text" className="col-10 form-control" >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>);
            }
            case 'text': {
                return (
                    <div className="form-group form-row">
                        <label htmlFor="condition" className="col-12" >Condition</label>
                        <select onChange={this.changeCondType.bind(this)} defaultValue={this.state.question.condition.type | "eq"} name="condition[type]" type="text" className="col-2 form-control" >
                            <option value="eq" >Equals</option>
                        </select>
                        <input onChange={this.changeCondValue.bind(this)} defaultValue={this.state.question.condition.value} name="condition[value]" type="text" className="col-10 form-control" />
                    </div>);
            }
            default: return;
        }
    }

    changeCondType(event) {
        this.setState({ question: { ...this.state.question, condition: { ...this.state.question.condition, type: event.target.value } } });
    }

    changeCondValue(event) {
        this.setState({ question: { ...this.state.question, condition: { ...this.state.question.condition, value: event.target.value } } });
    }

    changeType(event) {
        this.setState({ question: { ...this.state.question, type: event.target.value } });
        formStore.emit('typeChanged', { id: this.state.question.id, type: event.target.value })
    }



    deleteQuestion() {
        dispatcher.dispatch({ type: 'DELETE_QUESTION', payload: { id: this.state.question.id, parentID: this.state.parentID } })
    }

    addSubInput() {
        dispatcher.dispatch({ type: 'ADD_INPUT', payload: { parentID: this.state.question.id , parentType: this.state.question.type } })
    }

    handleQuestionChange(event) {
        this.setState({ question: { ...this.state.question, question: event.target.value } })
    }

    componentDidUpdate() {
        dispatcher.dispatch({ type: 'QUESTION_CHANGED', payload: { question: { ...this.state.question } } })
    }

    render() {

        const childs = this.state.question.subQuestions.map((el) => {
            return (
                <div key={el} className="row">
                    <div className="ml-3 col-12" >
                        <QuestionGenerator id={el} parentID={this.state.question.id} parentType={this.state.question.type} ></QuestionGenerator>
                    </div>
                </div>
            );
        });

        return (
            <div>
                <div className="card mb-2">
                    <div className="card-body">
                        {this.getCondition()}

                        <div className="form-group">
                            <label htmlFor="question">Question</label>
                            <input onChange={this.handleQuestionChange.bind(this)} name="question" type="text" defaultValue={this.state.question.question} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="type">Type</label>
                            <select onChange={this.changeType.bind(this)} defaultValue={this.state.question.type} name="type" className="form-control" >
                                <option value="boolean" >Yes/No</option>
                                <option value="text" >Text</option>
                                <option value="number" >Number</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <button onClick={this.deleteQuestion.bind(this)} type="button" className="btn btn-primary float-right" >Delete</button>
                            <button onClick={this.addSubInput.bind(this)} type="button" className="mx-2 btn btn-primary float-right" >Add sub-input</button>
                        </div>
                    </div>
                </div>
                <div className="container">
                    {childs}
                </div>
            </div >
        );
    }
}

export default QuestionGenerator;
