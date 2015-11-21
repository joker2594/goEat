var map;
var service;
var clocation;
var infoWindow;

//var markers = [];
var places = [];

function initMap() {
  clocation = new google.maps.LatLng(55.863791, -4.251667);
  map = new google.maps.Map(document.getElementById('map'), {
    center: clocation,
    zoom: 14
  });

  infoWindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);
}

function indexLoad() {
  var request = {
    location: clocation,
    radius: '5000',
    keyword: 'restaurant',
    maxPriceLevel: 2
  };
  service.radarSearch(request, callback);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      places.push(place);
      addMarker(results[i]);
      addResult(place);
    }
  }
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
    infoWindow.setContent(
	 "<a href='place.html&id=" + result.id + "' style='color:#008080;text-decoration:none;font-size:1.5em;font-weight:bold;'>" + result.name +
	"</a><br/><a class='markerlink' href='place.html&id=" + result.id + "'>Visit page</a> | " +
      "<a class='markerlink' href='" + result.website + "'>Visit website</a><br/>" + result.formatted_address
    );
    infoWindow.open(map, marker);
    //markers.push(marker);
    });
  });
}

function addResult(place) {
  openNow = null;
  if (place.opening_hours)
    openNow = place.opening_hours.open_now ? 'Open now' : 'Closed';
  var result = '<div class="result">';
  if (place.photos)
    result += '<img class="restaurant-image" src="' + place.photos[0].getUrl({'maxWidth': 100, 'maxHeight': 100}) + '"/>';
  else
    result += '<img class="restaurant-image" src="images/restaurant.jpg"/>';
  result += '<span class="title">' + place.name + '</span><div class="rating">'+ getRating(place.rating) +'</div>';
  result += '<div class="details">';
  result += 'Chinese - Chinese dining with dumpling specials<br/>' + place.formatted_address + '<br/>';
  if (openNow)
    result += openNow;
  else
    result += 'No info about opening hours';
  result += '</div></div>';

  $('#results').append(result);
}

function getRating(rating) {
  // round rating
  var rate = Math.round(rating);
  var stars = "";
  for (var i = 0; i < rate; i++) stars += "★";
  for (var i = rate; i < 5; i++) stars += "☆";
  return stars;
}

// function clearMarkers() {
//   for (var i = 0; i < markers.length; i++) {
//     markers[i].setMap(null);
//   }
// }

function searchQuery(query) {
  //clearMarkers();
  places = [];
  $('.result').each(function () {
    $(this).remove();
  })
  $('#results-for').text("Results for " + query);

  var request = {
    location: clocation,
    radius: '5000',
    query: query + ' restaurant'
  }
  service.textSearch(request, callback);
}

function addPlace(place){
	searchQuery('restaurant');
	
	 $('#placename').text(place);

	  openNow = null;
	  if (place.opening_hours)
	    openNow = place.opening_hours.open_now ? 'Open now' : 'Closed';

	  var result = '<div class="result">';
	  if (place.photos)
	    result += '<img class="restaurant-image" src="' + place.photos[0].getUrl({'maxWidth': 100, 'maxHeight': 100}) + '"/>';
	  else
	    result += '<img class="restaurant-image" src="images/restaurant.jpg"/>';
	  result += '<span class="title">' + place.name + '</span><div class="rating">'+ getRating(place.rating) +'</div>';
	  result += '<div class="details">';
	  result += 'Chinese - Chinese dining with dumpling specials<br/>' + place.formatted_address + '<br/>';
	  if (openNow)
	    result += openNow;
	  else
	    result += 'No info about opening hours';
	  result += '</div></div>';

	$('#place').append(result);


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
    zoom: 14,
  });
  infoWindow = new google.maps.InfoWindow({map: map});

  // Try HTML5 geolocation.
  console.log("near you");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent("<span style='font-weight:bold;color:#EE7600;font-size:1.5em;'>You are here.</span>");
      map.setCenter(pos);

      var marker = new google.maps.Marker({
        map: map,
        position: pos,
        icon: {
          url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2%7Cef8319',
          anchor: new google.maps.Point(10, 10),
          scaledSize: new google.maps.Size(15, 25)
        }
      });
      google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent("<span style='font-weight:bold;color:#EE7600;font-size:1.5em;'>You are here.</span>");
        infoWindow.open(map, marker);
      });

      $('#results-for').text("Results for restaurant");

      var request = {
        location: pos,
        radius: '500',
        keyword: 'restaurant',
      };
      service.nearbySearch(request, callback);
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

$(document).ready(function() {
  var sidebar = false;
  var cuisines = ['Chinese', 'Japanese', 'Italian', 'Greek', 'Indian'];
  var searches = [];

  var sortTypes = ['By name','By price range','By rating','By popularity','By proximity'];

  var filtertoggle = true;
  var cuisinetoggle = false;
  var searchtoggle = false;

  $(window).load(function() {
    var query = location.search.split('query=')[1];
    if (searches.length >= 5) {
      searches.splice(0, 1);
    }
    $('#search').val(query);
    if (query == undefined) {
      var filter = location.search.split('filter=')[1];
      if (filter == undefined) {
        initMap();
        searchQuery('restaurant');
      } else {
        if (filter == "near") nearYou();
      }
    } else {
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

  $(window).load(function() {
    for (i = 0; i < searches.length; i++) {
      $('#searchhistory').append("<div class=\'filter\' searchitem>" + searches[i] + "</div> ");
    }
  });

 $(window).load(function(){
  var place = location.search.split("&")[0].replace("?","").split("=")[1]
  searchQuery('restaurant');
  if (place != undefined) addPlace(place);

  });

  $('#sidebaricon').hover(function() {
    $(this).css("background-image", "url('images/sidebarselected.png')");
  },
  function() {
    $(this).css("background-image", "url('images/sidebar.png')");
  });

  $(document).on("mouseenter", ".filter", function() {
    $(this).css("background-color", "#f19132");
    $(this).css("color", "#ffffff");
  });

  $(document).on("mouseout", ".filter", function() {
    $(this).css("background-color", "#ffffff");
    $(this).css("color", "#000000");
  });

  $(document).on("mouseenter", ".result", function() {
    $(this).css("background-color", "#f19132");
  });

  $(document).on("mouseout", ".result", function() {
    $(this).css("background-color", "#ffffff");
  });

  $('#sidebaricon').click(function() {
    if (sidebar) $('#sidebar').css("display", "none");
    else $('#sidebar').css("display", "table");
    sidebar = !sidebar;
  });

  $('#filtertoggle').click(function() {
    if (filtertoggle) $(this).attr("src", "images/expand.png");
    else $(this).attr("src", "images/shrink.png");
    filtertoggle = !filtertoggle;
    $('#filters').toggle();
  });

  $('#cuisinetoggle').click(function() {
    if (cuisinetoggle) $(this).attr("src", "images/expand.png");
    else $(this).attr("src", "images/shrink.png");
    cuisinetoggle = !cuisinetoggle;
    $('#cats').toggle();
  });

  $('#searchtoggle').click(function() {
    if (searchtoggle) $(this).attr("src", "images/expand.png");
    else $(this).attr("src", "images/shrink.png");
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

  function updateRecentSearches() {
    //var json_str = getCookie('mycookie');
    //var searches = JSON.parse(json_str);
    var bound = searches.length > 5 ? 5 : searches.length;
    for (i = 0; i < bound; i++) {
      $('#searchhistory').append("<div class=\'filter filter-search\' searchitem>" + searches[i] + "</div> ");
    }
  }

  $(document).on('click', '.filter-search', function () {
    var query = $(this).text();
    $('#search').val(query);
    initMap();
    searchQuery(query);
  });

  $('#search').bind("enterKey",function(e){
    var query = $(this).val();
    window.location.replace('results.html?query=' + query);
    // if (searches.length >= 5) {
    //   searches.splice(0, 1);
    // }
    //searches.push(query);
    // searchQuery(query);
    // $('.filter-search').each(function () {
    //   $(this).remove();
    // });
    // var json_str = JSON.stringify(searches);
    // createCookie('mycookie', json_str);
    // updateRecentSearches();
  });

  $('#search').keyup(function(e){
    if(e.keyCode == 13) {
      $(this).trigger("enterKey");
    }
  });
});
