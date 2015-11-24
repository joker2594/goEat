

var cookieList = function(cookieName) {
//When the cookie is saved the items will be a comma seperated string
//So we will split the cookie by comma to get the original array
var cookie = $.cookie(cookieName,  { path: '/' });
//Load the items or a new array if null.
var items = cookie ? cookie.split(/,/) : new Array();

//Return a object that we can use to access the array.
//while hiding direct access to the declared items array
return {
    "add": function(val) {
        //Add to the items.
        items.push(val);
        //Save the items to a cookie.
        $.cookie(cookieName, items.join(','));
    },
    "remove": function (val) { 
        indx = items.indexOf(val); 
        if(indx!=-1) items.splice(indx, 1); 
        $.cookie(cookieName, items.join(','));        },
    "clear": function() {
        items = null;
        //clear the cookie.
        $.cookie(cookieName, null);
    },
    "items": function() {
        //Get all the items.
        return items;
    }
  }
}  