const key = "local-key";
class Model{
  constructor(){
    chrome.storage.sync.get({}, (result)=>{
      if(key in result){
        this.storage = result[key];
      } else {
        this.storage = {};
      }
    })
  }

  
}

class View {

}

class Controller {
  constructor(model, view){
    this.model = model;
    this.view = view;
  }


}