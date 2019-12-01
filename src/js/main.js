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
  updateStates(id, data){
    let obj = {};
    chrome.storage.local.get(null, (result) => {
      let states = result[key];
      let newStates = states.map(state =>
        state.id === id ? {id, stateName: data.stateName, tabsUrl: data.tabsUrl} : state
      )
      obj[key] = newStates; 
      chrome.state.local.set(objs, ()=>{
        if (chrome.runtime.lastError) {
          console.log("An error occured : " + JSON.stringify(chrome.runtime.lastError));
        }
        this.debug();
      })
    })
  }

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
    this.ul = document.getElementsByTagName("ul");
    this.li = this.createElement("li", "list");
    this.saveBtn = document.getElementById("saveTabs");
    this.input = document.getElementById("saveState");
  }

  get _stateName() {
    return this.input.value;
  }

  get _allTabsUrl() {
    let saveTabs = [];
    chrome.tabs.query({}, tabs => {
      tabs.forEach((tab, key) => {
        saveTabs[key] = tab.url;
      });
    });
    return saveTabs;
  }

  createElement(tagName, className) {
    const element = document.createElement(tagName);
    if (className) element.classList.add(className);

    return element;
  }

  bindAddTabs(handlers) {
    this.saveBtn.addEventListener("click", e => {
      e.preventDefault();

      if (this._stateName) {
        handlers({ stateName: this._stateName, tabsUrl: this._allTabsUrl });
      }
    });

    document.addEventListener('keypress', (e) => {
      if(e.keyCode === 13 && e.which===13){
        if(this._stateName){
          handlers({ stateName: this._stateName, tabsUrl: this._allTabsUrl })
        }
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
