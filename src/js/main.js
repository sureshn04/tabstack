"use strict";

const key = "local-key";
class Model {
  constructor() {

   this.storage = chrome.storage.local;
   this.key = "local-key";
  }

  debug() {
    chrome.storage.local.get(null, result => {
      console.debug("Debug : ", result);
    });
  }

  /**
   * @param {*} data
   * @pre take the object that containing stateName and array of urls
   * @post store the data in chrome.storage
   * @uses debug() 
   */
  createState(data) {
    let objData = {};
    var state = {
      stateName: data.stateName,
      tabsUrl: data.tabsUrl,
      id: 0
    };

    chrome.storage.local.get(null, results => {
      console.log([results[key]]);
      if (key in results) {
        let currentState = results[key];
        state.id = currentState[currentState.length - 1].id + 1;
        currentState.push(state);
        objData[key] = currentState;
      } else {
        data.id = 1;
        objData[key] = [data];
      }

      chrome.storage.local.set(objData, () => {
        if (chrome.runtime.lastError) {
          console.log("An error occured : " + JSON.stringify(chrome.runtime.lastError));
        }
        this.debug();
      });
      return objData[key];
    });
  }

  /**
   * 
   * @param {*} id id of the state to update
   * @param {*} data data to be updated
   * @pre take the parameter id and data which as to be update
   * @post map through the each state, and replace the data with specified id
   */
  updateState(id, data){
    let obj = {};
    chrome.storage.local.get(null, (result) => {
      let states = result[key];
      let newStates = states.map(state =>
        state.id === id ? {id, stateName: data.stateName ? data.stateName : state.stateName, tabsUrl: data.tabsUrl ? data.tabsUrl : state.tabsUrl} : state
      )
      obj[key] = newStates; 
      chrome.storage.local.set(obj, ()=>{
        if (chrome.runtime.lastError) {
          console.log("An error occured : " + JSON.stringify(chrome.runtime.lastError));
        }
        this.debug();
      })
    })
  }
// 
  /**
   * 
   * @param {*} id 
   * @pre take the id which as to be deleted
   * @post Filter a states out of the array by id
   */
  deleteStates(id){
    let obj ={};
    chrome.storage.local.get(null, (result) => {
      let states = result[key];
      let newStates = states.filter(state => state.id !== id);
      obj[key] = newStates; 
      chrome.storage.local.set(obj, ()=>{
        if (chrome.runtime.lastError) {
          console.log("An error occured : " + JSON.stringify(chrome.runtime.lastError));
        }
        this.debug();
      })
    })
  }
}

class View {
  constructor() {
    this.list = this.getElement("ul");
    this.saveBtn = this.getElement("#saveTabs");
    this.input = this.getElement("#saveState");
    this.displayItems();
  }


  get _stateName() {
    return this.input.value;
  }
  
  get _resetInput(){
    this.input.value = '';
  }
  // get the all the tabs which are opened in the current window
  get _allTabsUrl() {
    let saveTabs = [];
    chrome.tabs.query({}, tabs => {
      tabs.forEach((tab, key) => {
        saveTabs[key] = tab.url;
      });
    });
    return saveTabs;
  }

  // create the element with the optional CSS Class
  createElement(tagName, className) {
    const element = document.createElement(tagName);
    if (className) element.classList.add(className);

    return element;
  }

  // retrive the element from the dom
  getElement(selector){
    return document.querySelector(selector);
  }

  //waiting for event listeners and once it happen, it will return the stateName and all the tabUrls
  bindAddTabs(handlers) {
    this.saveBtn.addEventListener("click", e => {
      e.preventDefault();

      if (this._stateName) {
        handlers({ stateName: this._stateName, tabsUrl: this._allTabsUrl });
        this._resetInput();
      }
    });

    document.addEventListener('keypress', (e) => {
      if(e.keyCode === 13 && e.which===13){
        if(this._stateName){
          handlers({ stateName: this._stateName, tabsUrl: this._allTabsUrl })
          this._resetInput();
        }
      }
    })
  }

  displayItems(){
    // Delete all Item
    while(this.list.firstChild){
      this.list.removeChild(this.list.firstChild);
    }

    chrome.storage.local.get([key], (result) => {
      let states = result[key];

      if(states.length === 0){
        const p = this.getElement('p');
        p.textContent = "Nothing to show!¯\\_(ツ)_/¯";
        this.list.append(p);
      } else {
        states.forEach(state => {
          const li = this.createElement('li');
          li.id = state.id;
          li.classList.add('item')
          const open = this.createElement('i', 'fa')
          open.classList.add('fa-external-link');
          const close = this.createElement('i', 'fa');
          close.classList.add('fa-trash');

          li.textContent = state.stateName;

          li.append(open, close);

          // append all states to ul
          this.list.append(li)

        })
      }
    })
  }

}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.view.bindAddTabs(this.addTabs);
  }

  addTabs = data => {
    // console.log(data);
    this.model.createState(data);
  };
}

const app = new Controller(new Model(), new View());
