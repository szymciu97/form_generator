import { EventEmitter } from 'events';
import dispatcher from './Dispatcher'


//check for support
if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
}

const request = indexedDB.open('Formsdb', 1);

request.onupgradeneeded = (e) => {
    let upgradeDb = request.result;
    upgradeDb.createObjectStore('forms', { keyPath: 'id', autoIncrement: true });
    upgradeDb.createObjectStore('questions', { keyPath: 'id', autoIncrement: true });
}

class FormsStore extends EventEmitter {
    constructor() {
        super();

        this.questions = [];
        this.forms = [];

    }

    deleteSubQuestions(IDs, transaction, delteFromForm = false) {

        if (IDs.length <= 0) {
            return;
        }

        IDs.forEach(id => {

            if (delteFromForm) {
                this.selectedForm.allQuestions.splice(this.selectedForm.allQuestions.indexOf(id), 1);
            }

            transaction.objectStore("questions").get(id).onsuccess = (e) => {
                const q = e.target.result
                if (q) {
                    this.deleteSubQuestions(q.subQuestions, transaction);
                }

                transaction.objectStore("questions").delete(id);
            }

        });

    }

    updateQuestions(transaction) {
        transaction.objectStore("questions").getAll().onsuccess = (event) => {
            this.questions = event.target.result;
            this.emit('questionsUpdated');
        }
    }

    ActionsHandler(action) {

        const request = indexedDB.open('Formsdb', 1);
        request.onerror = (e) => {
            console.log('DB not opened, error: ' + e.target.errorCode);
        }

        switch (action.type) {
            case 'UPDATE_QUESTION_TYPE': {

                request.onsuccess = () => {
                    const transaction = request.result.transaction(["questions"], "readwrite");

                    transaction.objectStore("questions").get(action.payload.id).onsuccess = (event) => {
                        const q = event.target.result
                        q.type = action.payload.type;
                        transaction.objectStore("questions").put(q).onsuccess = () => {
                            this.updateQuestions(transaction);
                        }
                    }

                }
                break;
            }
            case 'QUESTION_CHANGED': {
                request.onsuccess = () => {
                    const transaction = request.result.transaction(["questions"], "readwrite");

                    transaction.objectStore("questions").put(action.payload.question)
                }
                break;
            }
            case 'FETCH_FORMS': {
                request.onsuccess = () => {
                    const db = request.result;
                    const transaction = db.transaction(["forms"], "readonly");

                    const forms = transaction.objectStore("forms");
                    const response = forms.getAll()
                    response.onsuccess = () => {
                        this.forms = response.result;
                        this.emit('formsFetched');
                    }
                }

                break;
            }
            case 'ADD_INPUT': {

                request.onsuccess = () => {

                    let newCondition = { type: "eq" };
                    if (action.payload.parentType === 'number') {
                        newCondition.value = 0;
                    } else if (action.payload.parentType === 'boolean') {
                        newCondition.value = 'true';
                    } else {
                        newCondition.value = 'Type smth...';
                    }

                    const question = {
                        type: 'text',
                        condition: newCondition,
                        question: "",
                        subQuestions: []
                    }
                    const transaction = request.result.transaction(["questions", "forms"], "readwrite")
                    transaction.objectStore("questions").add(question).onsuccess = (event) => {

                        const newQuestion = event.target.result;

                        if (!action.payload.parentID) {
                            this.selectedForm.rootQuestions.push(newQuestion);
                        }

                        this.selectedForm.allQuestions.push(newQuestion);

                        transaction.objectStore("forms").put(this.selectedForm).onsuccess = () => {

                            if (action.payload.parentID) {

                                transaction.objectStore("questions").get(action.payload.parentID).onsuccess = (event) => {
                                    const q = event.target.result;

                                    q.subQuestions.push(newQuestion)
                                    transaction.objectStore("questions").put(q).onsuccess = () => {
                                        this.updateQuestions(transaction);
                                    }

                                }
                            } else {
                                this.updateQuestions(transaction);
                            }

                        }
                    }
                }
                break;
            }
            case 'DELETE_QUESTION': {

                request.onsuccess = () => {
                    const transaction = request.result.transaction(["forms", 'questions'], "readwrite")

                    this.selectedForm.allQuestions.splice(this.selectedForm.allQuestions.indexOf(action.payload.id), 1);

                    if (!action.payload.parentID) {
                        this.selectedForm.rootQuestions.splice(this.selectedForm.rootQuestions.indexOf(action.payload.id), 1);
                    }

                    transaction.objectStore('questions').get(action.payload.id).onsuccess = (event) => {
                        const q = event.target.result;
                        this.deleteSubQuestions(q.subQuestions, transaction, true);


                        transaction.objectStore('forms').put(this.selectedForm).onsuccess = () => {
                            transaction.objectStore('questions').delete(action.payload.id).onsuccess = () => {

                                if (action.payload.parentID) {
                                    transaction.objectStore('questions').get(action.payload.parentID).onsuccess = (event) => {
                                        const q = event.target.result;
                                        q.subQuestions.splice(q.subQuestions.indexOf(action.payload.id), 1);

                                        transaction.objectStore('questions').put(q).onsuccess = () => {
                                            this.updateQuestions(transaction);
                                        }

                                    }
                                } else {
                                    this.updateQuestions(transaction);
                                }
                            }
                        }

                    }

                }


                break;
            }
            case 'EDIT_FORM': {

                request.onsuccess = () => {

                    const transaction = request.result.transaction(["forms", 'questions'], "readonly")
                    const response = transaction.objectStore("forms")
                        .get(action.payload.id);

                    response.onsuccess = () => {
                        this.selectedForm = response.result;

                        transaction.objectStore('questions').getAll().onsuccess = (event) => {
                            this.questions = event.target.result;
                            this.emit('changePage', 'FormGenerator');
                        }

                    }
                }

                break;
            }
            case 'CREATE_FORM': {

                request.onsuccess = () => {

                    const response = request.result.transaction(["forms"], "readwrite")
                        .objectStore("forms")
                        .add({ name: action.payload.name, rootQuestions: [], allQuestions: [] });

                    response.onsuccess = () => {
                        this.emit('changePage', 'Forms');
                    }
                }

                break;
            }
            case 'DELETE_FORM': {

                request.onsuccess = () => {
                    const transaction = request.result.transaction(["forms", 'questions'], "readwrite")
                    transaction.objectStore("forms").get(action.payload.id).onsuccess = (event) => {
                        const f = event.target.result;

                        this.deleteSubQuestions(f.rootQuestions, transaction)

                        transaction.objectStore("forms").delete(action.payload.id).onsuccess = () => {
                            dispatcher.dispatch({ type: 'FETCH_FORMS' })
                        }
                    }

                }

                break;
            }
            case 'PREVIEW_FORM': {

                request.onsuccess = () => {

                    const transaction = request.result.transaction(["forms", 'questions'], "readonly")
                    transaction.objectStore("forms").get(action.payload.id).onsuccess = (e) => {
                        this.selectedForm = e.target.result;

                        transaction.objectStore('questions').getAll().onsuccess = (event) => {
                            this.questions = event.target.result;
                            this.emit('changePage', 'FormPreview');
                        }

                    }
                }

                break;
            }
            default: { }
        }





    }

}

const formsStore = new FormsStore();

dispatcher.register(formsStore.ActionsHandler.bind(formsStore))

export default formsStore;

