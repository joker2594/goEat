var map;
var service;
var clocation;
var ulocation = null;
var infoWindow;

var places = [];
var topRatedClicked = false;
var locationGiven = false;

function initMap() {
  clocation = new google.maps.LatLng(55.863791, -4.251667);
  map = new google.maps.Map(document.getElementById('map'), {
    center: clocation,
    zoom: 15
  });

  infoWindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);
}
  

  
function indexLoad() {
  var request = {
    bounds: map.getBounds(),
    keyword: 'restaurant',
    types: ['restaurant', 'meal_takeaway'],
  };
  service.radarSearch(request, callback);
}

function sortByRating(list) {
  var sorted = list;
  for (var i=0; i < sorted.length -1 ; i++)
    for (var j=i+1; j < sorted.length; j++)
      if (sorted[i].rating<sorted[j].rating){
        var aux = sorted[i];
        sorted[i]=sorted[j];
        sorted[j]=aux;
      }
  return sorted;
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    if (topRatedClicked) {
      results = sortByRating(results);
      topRatedClicked = false;
    }
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      store(place);
      addResult(place);
      addMarker(place);
    }
  }
}

function callbacknear(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < 9; i++) {
      var place = results[i];
      service.getDetails(place, function(result, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          console.error(status);
          return;
        }
        store(result);
        addResult(result);
      });
      addMarker(place);
    }
  }
}

function store(place) {
  if (!place.rating) place.rating = 0;
  place.distance = (google.maps.geometry.spherical.computeDistanceBetween(clocation, place.geometry.location) / 1000).toFixed(2);
  places.push(place);
}

function addMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: {
      url: 'images/marker.png',
      anchor: new google.maps.Point(10, 10),
      scaledSize: new google.maps.Size(15, 25)
    }
  });

  google.maps.event.addListener(marker, 'click', function() {
  service.getDetails(place, function(result, status) {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      console.error(status);
      return;
    }
    website = "<br/>";
    var address = "";
    if (result.formatted_address) address = result.formatted_address.split(', United Kingdom')[0];
    if (result.website) website = "| <a class='markerlink' href='" + result.website + "'>Visit website</a><br/>"
    infoWindow.setContent(
      "<a href='place.html&id=" + result.place_id + "' style='color:#008080;text-decoration:none;font-size:1.5em;font-weight:bold;'>" + result.name +
      "</a><br/><a class='markerlink' href='place.html?id=" + result.place_id + "'>Visit page</a> " +
      website + address
    );
    infoWindow.open(map, marker);
    });
  });
}

function addResult(place) {
  openNow = null;
  if (place.opening_hours)
    openNow = place.opening_hours.open_now ? '<b style="color:#EE7600;">Open now!</b>' : 'Closed.';
  var result = '<div class="result" data-id=' + place.place_id + '>';
  if (place.photos)
    result += '<img class="restaurant-image" src="' + place.photos[0].getUrl({'maxWidth': 100, 'maxHeight': 100}) + '"/>';
  else
    result += '<img class="restaurant-image" src="images/restaurant.png"/>';
  result += '<span class="title">' + place.name + '</span><div class="rating">'+ getRating(place.rating) +'</div>';
  result += '<div class="details">';
  var address = "";
  if (place.formatted_address) address = place.formatted_address.split(', United Kingdom')[0];
  var type = "";
  if (place.types) type = place.types[0];
  if (type == 'meal_takeaway') type = 'Restaurant and takeaway';
  type = type.charAt(0).toUpperCase() + type.slice(1);
  result += '<b>Type:</b> ' + type;
  result += '<br/><b>Address:</b> ' + address + '<br/>';
  result += '<b>Distance:</b> ' + place.distance + ' km from ';
  if (locationGiven) result += 'your current location<br/>';
  else result += 'City Centre<br/>';
  if (openNow)
    result += openNow;
  else
    result += 'No info about opening hours.' + '</div></div>';
  $('#results').append(result);
}

function getRating(rating) {
  // round rating
  var rate = Math.round(rating);
  var stars = "";
  if (rate == 0) return stars;
  for (var i = 0; i < rate; i++) stars += "★";
  for (var i = rate; i < 5; i++) stars += "☆";
  return stars;
}

function searchQuery(query) {
  //clearMarkers();
  places = [];
  $('.result').each(function () {
    $(this).remove();
  })

  $('#results-for').text("Results for " + query);

  var request = {
    bounds: map.getBounds(),
    query: query,
    types: ['restaurant', 'meal_takeaway'],
  }
  service.textSearch(request, callback);
}

var createCookie = function(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

function nearYou() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: clocation,
    zoom: 16,
  });
  infoWindow = new google.maps.InfoWindow({map: map});

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      clocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      locationGiven = true;
      infoWindow.setPosition(pos);
      infoWindow.setContent("<span style='font-weight:bold;color:#EE7600;font-size:1.5em;'>You are here.</span>");
      map.setCenter(pos);

      var marker = new google.maps.Marker({
        map: map,
        position: pos,
        icon: {
          url: 'images/home.png',
          anchor: new google.maps.Point(10, 10),
          scaledSize: new google.maps.Size(15, 25)
        }
      });
      google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent("<span style='font-weight:bold;color:#EE7600;font-size:1.5em;'>You are here.</span>");
        infoWindow.open(map, marker);
      });

      $('#results-for').text("Near You");

      var request = {
        types: ['restaurant', 'meal_takeaway'],
        location: pos,
        radius: 500,
      };
      service.radarSearch(request, callbacknear);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}

function callbackid(place, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    map = new google.maps.Map(document.getElementById('map'), {
      center: place.geometry.location,
      zoom: 17
    });

    var infoWindow = new google.maps.InfoWindow({
      content:"<a style='color:#008080;text-decoration:none;font-size:2em;font-weight:bold;'>" + place.name + "</a>"
    });

    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
      icon: {
        url: 'images/marker.png',
        anchor: new google.maps.Point(10, 10),
        scaledSize: new google.maps.Size(25, 40)
      }
    });

    marker.addListener('click', function() {
      infoWindow.open(map, marker);
    });
    createPlaceView(place);
  }
}

function createPlaceView(place) {
  $('#placeheader').text(place.name);

	//photo first
	var result = '<div class="place-details">';
    	if (place.photos)
		result += '<img class="restaurant-image-large" src="' + place.photos[0].getUrl({'maxWidth': 500, 'maxHeight': 300}) + '"/>';
	else
		result += '<img class="restaurant-image-large" src="images/restaurant.png"/>';
	//name and rating
	result += '<br> <span class="title-placeP">' + place.name + '<hr> </span><div class="rating-placeP">'+ getRating(place.rating) +'</div>';
	//opening hours
	openNow = null;
	hours = '<br><b>Opening hours: <br></b>';
	if (place.opening_hours){
		openNow = place.opening_hours.open_now ? '<b style="color:#EE7600;">Open now!</b>' : 'Closed now.' + '<br>'; 
		for (i=0; i<7;i++){
			hours+= place.opening_hours.weekday_text[i]+ '<br/>      ';
		}
	}
	if (openNow)
       		result += openNow ;
      	else
        	result += 'No info about opening hours.' + '</div></div>';
	result
	//details
	result += '<div class="details"> '+hours;
	//address
      	var address = place.formatted_address.split(', United Kingdom')[0];
	result+='<br/><b>Address:</b> ' + address + '<br/>';
	//type
      	var type = place.types[0];
      	if (type == 'meal_takeaway') type = 'Restaurant and takeaway';
      	type = type.charAt(0).toUpperCase() + type.slice(1);
      	result += '<b>Type:</b> ' + type;
	//telephone
	var tel=place.formatted_phone_number;
	result+= '<br><b>Phone Number: </b>' + tel ;
	//site
	var site=place.website;
	result+= '<br><b>Website: </b> <a href="'+ site + '">Visit '+place.name+'</a><br/>';
	//price level
	var priceLevel=place.price_level;
	var formattedPriceLevel;

	if (priceLevel==0){
		formattedPriceLevel= 'Free';
	}else if (priceLevel==1){
		formattedPriceLevel= 'Inexpensive';
	}else if (priceLevel==2){
		formattedPriceLevel= 'Moderate';
	}else if (priceLevel==3){
		formattedPriceLevel= 'Expensive';
	}else if (priceLevel==4){
		formattedPriceLevel= 'Very Expensive';
	}else formattedPriceLevel= 'No details about pricing';

	result+= '<br><b>Price level: </b>' + formattedPriceLevel +'<br>' ;
	var i=0;
	if (place.reviews){
		result+='<br> <hr><br><div class="reviews-title"> Reviews: </b> </div>';
		result+='<hr> <br>';
		var reviews= place.reviews;
		$.each(reviews, function(key, value){
			if (i<6){
				result+='<b>'+ value.author_name+ '</b>' +'<br>'+value.text + '<br> Rating: '+value.rating+'<br><br>';
			}
			i++;
		})
	}else{
		result+='<br>No reviews for this place.';
	}
      $('#place').append(result);
}

function showResults(places) {
  for (var i = 0; i < places.length; i++) {
    var place = places[i];
    addResult(place);
  }
}

$(document).ready(function() {
  var cookie=unescape($.cookie('history'))
  var history=cookie.split(',')
  console.log(history);
	
  var sidebar = false;
  var sortbar = false;

  var cuisines = ['Chinese', 'Japanese', 'Italian', 'Greek', 'Indian'];
  var searches = [];

  var filtertoggle = true;
  var cuisinetoggle = false;
  var searchtoggle = false;

  $(window).load(function() {
    // check if at index
    var page = document.URL.split('goEat/')[1];
    if (page == 'index.html') return indexLoad();
    var bool = true;
    var query = location.search.split('query=')[1];

    if (searches.length >= 5) {
      searches.splice(0, 1);
    }
    if (query !=undefined)
      $('#search').val(decodeURI(query));
    if (query == undefined) {
      var id = location.search.split('id=')[1];
      if (id != undefined) {
        var request = { placeId: id };
        service = new google.maps.places.PlacesService(map);
        service.getDetails(request, callbackid);
        var bool = false;
      }
      if (bool) {
        var filter = location.search.split('filter=')[1];
        if (filter == undefined) {
          initMap();
          searchQuery("restaurant");
        } else {
          if (filter == "near") nearYou();
          if (filter == "popular") {
            searchQuery("restaurant");
            $('#results-for').text("Most Popular");
          }
          if (filter == "toprated") {
            topRatedClicked = true;
            searchQuery("restaurant");
            $('#results-for').text("Top Rated");
          }
        }
      }
    } else {
      query = decodeURI(query);
      searches.push(query);
      //var json_str = JSON.stringify(searches);
      //createCookie('mycookie', json_str);
      updateRecentSearches();
      initMap();
      searchQuery(query);
    }
  });

  $(window).load(function() {
    for (i = 0; i < cuisines.length; i++) {
      $('#cats').append('<div class="filter filter-cuisine" data-cuisineitem="' + cuisines[i] + '">' + cuisines[i] + '</div>');
    }
  });


  $('#sidebaricon').hover(function() {
    $(this).css("background-image", "url('images/sidebarselected.png')");
  },
  function() {
    $(this).css("background-image", "url('images/sidebar.png')");
  });

  $('.result').hover(function() {
    $(this).css("background-color", "blue");
  },
  function() {
    $(this).css("background-color", "black");
  });

  $(document).on("mouseenter", ".filter", function() {
    $(this).css("background-color", "#f19132");
    $(this).css("color", "#ffffff");
  });

  $(document).on("mouseleave", ".filter", function() {
    $(this).css("background-color", "#ffffff");
    $(this).css("color", "#000000");
  });

  $(document).on("mouseenter", ".result", function() {
    $(this).css("background-color", "#eeeeee");
  });

  $(document).on("mouseleave", ".result", function() {
    $(this).css("background-color", "#fdfdfd");
  });

  $(document).on("click", ".result", function() {
    $(this).css("background-color", "#f39f4c");
    var id = $(this).data('id');
    window.location.replace('place.html?id=' + id);
  });

  $(document).on("mouseenter", ".sortoption", function() {
    $(this).css("background-color", "#f19132");
    $(this).css("color", "#ffffff");
  });

  $(document).on("mouseleave", ".sortoption", function() {
    $(this).css("background-color", "#ffffff");
    $(this).css("color", "#000000");
  });

  $(document).on("click", ".sortoption", function() {
    var option = $(this).data('option');
    // hide results
    $('.result').each(function () {
      $(this).remove();
    });
    var sorted = places.slice();
    switch (option) {
      case "name":
        for (var i = 0; i < sorted.length -1 ; i++)
          for (var j = i+1; j < sorted.length; j++)
            if (sorted[i].name > sorted[j].name) {
              var aux = sorted[i];
              sorted[i] = sorted[j];
              sorted[j] = aux;
            }
        break;
      case "rating":
        sorted = sortByRating(sorted);
        break;
      case "proximity":
        for (var i = 0; i < sorted.length -1 ; i++)
          for (var j = i+1; j < sorted.length; j++)
            if (sorted[i].distance > sorted[j].distance) {
              var aux = sorted[i];
              sorted[i] = sorted[j];
              sorted[j] = aux;
            }
        break;
      default:
        break;
    }
    showResults(sorted);
    $('#sortbar').css("display", "none");
    $('#sortbox > img').attr("src", "images/expand.png");
    sortbar = false;
  });

  $('#sidebaricon').click(function() {
    if (sidebar) $('#sidebar').css("display", "none");
    else $('#sidebar').css("display", "table");
    sidebar = !sidebar;
  });

  $('#filtertoggle').click(function() {
    if (filtertoggle) $('#filtertoggle > img').attr("src", "images/expand.png");
    else $('#filtertoggle > img').attr("src", "images/shrink.png");
    filtertoggle = !filtertoggle;
    $('#filters').toggle();
  });

  $('#cuisinetoggle').click(function() {
    if (cuisinetoggle) $('#cuisinetoggle > img').attr("src", "images/expand.png");
    else $('#cuisinetoggle > img').attr("src", "images/shrink.png");
    cuisinetoggle = !cuisinetoggle;
    $('#cats').toggle();
  });

  $('#searchtoggle').click(function() {
    if (searchtoggle) $('#searchtoggle > img').attr("src", "images/expand.png");
    else $('#searchtoggle > img').attr("src", "images/shrink.png");
    searchtoggle = !searchtoggle;
    $('#searchhistory').toggle();
  });

  $(document).on('click', '.filter-cuisine', function () {
    var query = $(this).data('cuisineitem');
    //$('#search').val(query);
    //searchQuery(query);
    window.location.replace('results.html?query=' + query);
  });

  $(document).on('click', '#nearyou', function () {
    window.location.replace('results.html?filter=near');
  });

  $(document).on('click', '#popular', function () {
    window.location.replace('results.html?filter=popular');
  });
  $(document).on('click', '#toprated', function () {
    window.location.replace('results.html?filter=toprated');
  });


  function updateRecentSearches() {
    //var json_str = getCookie('mycookie');
    //var searches = JSON.parse(json_str);
    /**$(window).load(function() {
	 var bound = history.length > 5 ? 5 : history.length;
    for (i = 0; i < bound; i++) {
	  if (history[i] !== "undefined" ){
		  $('#searchhistory').append('<div class="filter filter-cuisine" data-cuisineitem="' + history[i] + '">' + history[i] + '</div>');
	  }
    }
  });*/
  }

  $(document).on('click', '.filter-search', function () {
    var query = $(this).text();
    $('#search').val(query);
    initMap();
    searchQuery(query);
  });

  $('#search').keydown( function(e) {
	   var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
	   if(key == 13) {
		   var query = $(this).val();
			history.push(query);
			$.cookie('history', escape(history.join(',')), {expires:1234});
			console.log("hi");
			window.location.replace('results.html?query=' + query);
			updateRecentSearches();
	   }
   });

  $('#search').keyup(function(e){
    if(e.keyCode == 13) {
      $(this).trigger("enterKey");
    }
  });
  $(window).load(function() {
	 var bound = history.length > 5 ? 5 : history.length;
    for (i = 0; i < bound; i++) {
		console.log(history[0]);
		console.log(history[1]);
	  if (history[i] !== "undefined" ){
		  $('#searchhistory').append('<div class="filter filter-cuisine" data-cuisineitem="' + history[ history.length-i] + '">' + history[history.length-i] + '</div>');
	  }
    }
  });
  $('#sortbox').click(function() {
    if (sortbar) {
      $('#sortbar').css("display", "none");
      $('#sortbox > img').attr("src", "images/expand.png");
    }
    else {
      $('#sortbar').css("display", "table");
      $('#sortbox > img').attr("src", "images/shrink.png");
    }
    sortbar = !sortbar;
  });
});
