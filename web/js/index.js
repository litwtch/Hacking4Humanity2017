/*********** Model *********/

function shelterList(){
  this.shelters = [];
}

shelterList.prototype.addShelter = function(name, wishlist, needs, website){
  this.shelters.push({
      name: name,
      wishlist: wishlist,
      needs:needs,
      website: website
    });
}

//Sorts shelters from highest to lowest based on number of items needed
shelterList.prototype.sortShelters = function(){
  var filteredShelters = this.shelters.sort(function(s1, s2){
    return s1.needs.length > s2.needs.length;
      //return s1.name.toLowerCase().localeCompare(s2.name.toLowerCase());
  });
  this.shelters.reverse();
  
}

/**** Will move to needs.js to propagate index.js needs list ***/
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


/*********** Global functions *********/
var findOne = function (haystack, arr) {
  return arr.some(function (v) {
    return haystack.indexOf(v) >= 0;
    });
};

var capitalizeNeeds = function(needs){
  var capitalizedWords =  needs.map(function(str){
      return str.replace(/\b\w/g, function(l){ return l.toUpperCase() });
  });
  return capitalizedWords;
}



/*********** Controller *********/
var controller = {
  initApp: function(){
    model.initApp();
    //this.getNeeds();
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
          list.addShelter(obj.shelter, obj.wishList, commonNeeds, obj.website);
        }
      });
    },function(error) {
        console.error("Failed!", error);
    }))

  Promise.all(requests).then(function(results) {
    list.sortShelters(); 
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

/*Creates elements to show shelters in each shelter-card.*/
postShelters: function(shelter){
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

    var wrapper = document.createElement("div");
    wrapper.className = "wrapper";
    shelterCard.appendChild(wrapper); 

    var cardImg = document.createElement("div");
    cardImg.className = "card-img";
    wrapper.appendChild(cardImg); 

    var card_img_src = document.createElement("img");
    card_img_src.className = "card-img_src";
    card_img_src.classList.add('center-block');
    /*This will be updated in the future with corresponding shelter images */
    card_img_src.src = "images/shelter.png"
    cardImg.appendChild(card_img_src); 

    var h4 = document.createElement("h4");
    h4.id = "shelterName"
    h4.className = "name";
    h4.innerHTML = s.name;
    wrapper.appendChild(h4); 

    var p = document.createElement("p");
    var needStr = "";
    var capitalizedNeeds = capitalizeNeeds(s.needs);
    capitalizedNeeds.forEach(function(item){
        needStr += item + ", ";
    });
    p.innerHTML = "Needs: " + needStr.substr(0,needStr.length-2);
    wrapper.appendChild(p); 

    var a = document.createElement("a");
    a.href = s.website;
    a.target  = "_blank";
    a.className = "btn";
    a.classList.add('donateBtn');
    a.innerHTML ="Donate"
    wrapper.appendChild(a); 
 });
  view.setUpEventListeners();
},
showSelectedNeeds: function(needs){
  
	if( needs[0] !== "undefined" && needs[0] !== undefined){
    document.getElementById("shelterNeedsSelection").innerHTML = capitalizeNeeds(needs).join(', ');
  }else{
  	 document.getElementById("description").innerHTML = "You did not select any items.";
  }
 }
};

function getUrlVars(){
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

  for(var i = 0; i < hashes.length; i++){
    hash = hashes[i].split('=');
    var item = decodeURIComponent(hash[1]).replace("+", " ");
    vars.push(item);
  }
  return vars;
}

/*********** View *********/
var view = {
  setUpEventListeners: function(){
    var donateBtns= document.getElementsByClassName("donateBtn");
   
    for (var i = 0; i < donateBtns.length; i++) {
      donateBtns[i].addEventListener("click", function(){
         event.preventDefault();
         	var url = $(this).attr('href'); 
           $("#myModal").modal("show");
              $("#myModal").on('hidden.bs.modal', function () {
            	 window.open(url, '_blank');
        });
		});
   }
   }
};

controller.initApp();
var needs = getUrlVars();
controller.showSelectedNeeds(needs);
controller.retrieveShelters(needs);