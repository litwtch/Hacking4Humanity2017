function shelterList(){
  this.shelters = [];
}

function shelterApp(){
  this.shelters = [];
  this.needs = [];
  this.facts = [];
}

function shelter(name, wishlist, needs, website){
  this.name = name;
  this.wishlist = wishlist;
  this.needs = needs;
  this.website = website;
}

shelterApp.prototype.addShelter = function(name, wishlist, needs, website){
  var s = new shelter(name, wishlist, needs, website);
  console.log(s);
  this.shelters.push(s);
}

shelterList.prototype.addShelter = function(name, wishlist, needs, website){
  this.shelters.push({
      name: name,
      wishlist: wishlist,
      needs:needs,
      website: website
    });
}

shelterApp.prototype.addNeeds = function(list){
  list.forEach(function(need){
      if (this.needs.indexOf(need) == -1){
        this.needs.push(need);
      }
  }.bind(this));
}

var model = {
  app: {},
  initApp: function(){
    this.app = new shelterApp();

  }
};

var findOne = function (haystack, arr) {
  return arr.some(function (v) {
    return haystack.indexOf(v) >= 0;
    });
};

var controller = {
  initApp: function(){
    model.initApp();
    //this.getNeeds();
    //this.getShelters(["socks", "baby wipes"]);
  },
  getNeeds: function(){
    //Update url to our github repository for this project
    var url = 'http://www.maribelduran.com/twitch_streamers/js/ShelterDictionary.JSON';
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function() {
    if (request.status >= 200 && request.status < 400) { 
      var shelters = JSON.parse(request.response);
      shelters.forEach(function(obj){
      var needs= obj["needs"];
      model.app.addNeeds(needs);
      });
      console.log(model.app.needs);
      //userList.sortUsers();
      //view.displayUsers(userList.users);
    }else{
       // We reached our target server, but it returned an error   
    }
  };
  request.onerror = function() {
      // There was a connection error of some sort
    };
    request.send();
  },
  retrieveShelters: function(needs){
    var list = new shelterList();
     var requests = [];
  requests.push(this.getShelters(needs).then(function(response){
      var shelters = JSON.parse(response);
      shelters.forEach(function(obj){
        //check to see if there is at least one matching need 
        if (findOne(obj.needs, needs)){
          //finds the interescting needs
          var commonNeeds = needs.filter(function(n){
              return obj.needs.indexOf(n) !== -1;
          });
          //model.app.addShelter(obj.shelter, obj.wishList, commonNeeds, obj.website);
          list.addShelter(obj.shelter, obj.wishList, commonNeeds, obj.website);
        }
      });
    },function(error) {
        console.error("Failed!", error);
    }))

  Promise.all(requests).then(function(results) {
    this.postShelters(list.shelters);
  }.bind(this)).catch(function(error) {
  // One or more promises was rejected
  }.bind(this));
  },
  getShelters: function(needs){
    return new Promise(function(resolve,reject){
    //Update url to our github repository for this project
    var url = 'https://cosmonaught.github.io/Hacking4Humanity2017/web/js/ShelterDictionary.JSON';
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function() {
     if (request.status >= 200 && request.status < 400)  { // Success!
        resolve(request.response);
      }else{
        if (request.status == 404){
           resolve(request.response); //resolving an invalid user because we still want to add each username to our list of users
        }
        reject(Error(request.statusText)); // We reached our target server, but it returned an error
       }
      };
      request.onerror = function() {
      reject(Error("Network Error"));  // There was a connection error of some sort
      };
    request.send();
 });
},
postShelters: function(shelter){
  console.log(shelter);
  var shelterList = document.getElementById("shelter-list");
  shelterList.innerHTML = ""; 

  shelter.forEach(function(s){

    var col_md_4 = document.createElement("div");
    col_md_4.className = "col-md-4";
    col_md_4.classList.add('col-sm-6');
    shelterList.appendChild(col_md_4); 

    var shelterCard = document.createElement("div");
    shelterCard.className = "shelter-card";
    col_md_4.appendChild(shelterCard); 

    var cardImg = document.createElement("div");
    cardImg.className = "card-img";
    shelterCard.appendChild(cardImg); 

    var card_img_src = document.createElement("img");
    card_img_src.className = "card-img_src";
    card_img_src.classList.add('center-block');
    /*This will be updated in the future with corresponding shelter images */
    card_img_src.src = "images/shelter.png"
    cardImg.appendChild(card_img_src); 

    var h4 = document.createElement("h4");
    h4.id = "shelterName"
    h4.innerHTML = s.name;
    shelterCard.appendChild(h4); 

    var p = document.createElement("p");
    p.innerHTML = "The shelter needs: " + s.needs;
    shelterCard.appendChild(p); 

    var a = document.createElement("a");
    a.href = s.website;
    a.target  = "_blank";
    a.className = "btn";
    a.classList.add('donateBtn');
    a.innerHTML ="Donate"
    shelterCard.appendChild(a); 
 });
  view.setUpEventListeners();
},
showSelectedNeeds: function(needs){
    document.getElementById("shelterNeedsSelection").innerHTML = needs.join(', ');
  }
};

function getUrlVars(){
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i < hashes.length; i++)
  {
    hash = hashes[i].split('=');
    vars.push(hash[1]);
  }
  return vars;
}

var needs = getUrlVars();
console.log(needs);
controller.showSelectedNeeds(needs);
controller.retrieveShelters(needs);

var view = {
  setUpEventListeners: function(){

    var donateBtns =  document.getElementsByClassName("donateBtn");
    for (var i = 0; i < donateBtns.length; i++) {
      donateBtns[i].addEventListener("click", function(){
           $("#myModal").modal();
      
      });
    }
  }
    /*
    //set up an event listener for a submit button or click button that will give us the needs list
    document.getElementById("submitNeeds").addEventListener("click", function(){
      
    //var url = 'http://www.maribelduran.com/testing/js/ShelterDictionary.JSON';
    //window.location = 
      var needs = ["socks", "baby wipes"];
      controller.retrieveShelters(needs);
     });
     */
};

controller.initApp();
view.setUpEventListeners();