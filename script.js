var map;
var service;
var clocation;
var ulocation;
var infoWindow;
var homemarker;

var places = [];
var markers = [];
var topRatedClicked = false;
var locationGiven = false;

function getMapCenter() {
  var page = document.URL.split('goEat/')[1];
  clocation = new google.maps.LatLng(55.863791, -4.251667);
  var lat = unescape($.cookie('clat'));
  var lng = unescape($.cookie('clng'));
  if (lat != 'undefined') clocation = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
  if (page == 'index.html') clocation = new google.maps.LatLng(55.863791, -4.251667);
  return clocation;
}

// function getMapZoom() {
//   var zoom = unescape($.cookie('zoom'));
//   return parseInt(zoom);
// }

function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
    center: getMapCenter(),
    zoom: 14
  });

  infoWindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);
}

function indexLoad() {
  var request = {
    bounds: map.getBounds(),
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
      if (locationGiven) {
        infoWindow = new google.maps.InfoWindow();
        addHomeMarker(infoWindow, ulocation);
      }
      addResult(place);
      var marker = addMarker(place);
      markers.push(marker);
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
  place.distance = (google.maps.geometry.spherical.computeDistanceBetween(ulocation, place.geometry.location) / 1000).toFixed(2);
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
    },
    place: {
      location: place.geometry.location,
      placeId: place.place_id
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
  return marker;
}

function addResult(place) {
  openNow = null;
  if (place.opening_hours) openNow = place.opening_hours.open_now;
  var result = '<div class="result" data-id=' + place.place_id + '>';
  if (place.photos)
    result += '<img class="restaurant-image" src="' + place.photos[0].getUrl({'maxWidth': 100, 'maxHeight': 100}) + '"/>';
  else
    result += '<img class="restaurant-image" src="images/restaurant.png"/>';
  if (openNow)
    result += '<div class="open">OPEN</div>';
  result += '<span class="title">' + place.name + '</span><div style="font-size: 1em" class="rating">'+ getIconRating(place.rating) +'</div>';
  result += '<div class="details">';
  var address = "";
  if (place.formatted_address) address = place.formatted_address.split(', United Kingdom')[0];
  var type = "";
  if (place.types) type = place.types[0];
  if (type == 'meal_takeaway') type = 'Restaurant and takeaway';
  if (type == 'night_club') type = 'Night club';
  type = type.charAt(0).toUpperCase() + type.slice(1);
  result += '<table><tr><td align="center"><i class="fa fa-cutlery"></i></td><td> ' + type;
  result += '</td></tr><tr><td align="center"><i class="fa fa-map-marker"></i></td><td> ' + address + '</td></tr>';
  result += '<tr><td align="center"><i class="fa fa-road"></i></td><td> ' + place.distance + ' km from ';
  if (locationGiven) result += 'your current location</td></tr></table>';
  else result += 'City Centre<br/>';
  result += '</div></div>';
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

function getIconRating(rating) {
  // round rating
  var rate = Math.round(rating);
  var stars = "";
  if (rate == 0) return stars;
  for (var i = 0; i < rate; i++) stars += '<i class="fa fa-star"></i>';
  for (var i = rate; i < 5; i++) stars += '<i class="fa fa-star-o"></i>';
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

function setLocation() {
  infoWindow = new google.maps.InfoWindow({map: map});
  if (locationGiven) infoWindow.close();
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      // put location in cookies
      infoWindow = new google.maps.InfoWindow({map: map});
      locationGiven = true;
      $.cookie('lat', escape(pos.lat), {expires:1234});
      $.cookie('lng', escape(pos.lng), {expires:1234});
      addHomeMarker(infoWindow, pos);
    }, function() {
      //handleLocationError(true, infoWindow, map.getCenter());
    });
  }
}

function addHomeMarker(infoWindow, pos) {
  homemarker.setMap(null);
  infoWindow.setPosition(pos);
  infoWindow.setContent("<span style='font-weight:bold;color:#a6a6a6;font-size:1.5em;'>You are here.</span>");
  homemarker = new google.maps.Marker({
    map: map,
    position: pos,
    icon: {
      url: 'images/home.png',
      anchor: new google.maps.Point(10, 10),
      scaledSize: new google.maps.Size(15, 25)
    }
  });
  google.maps.event.addListener(homemarker, 'click', function() {
    infoWindow.setContent("<span style='font-weight:bold;color:#a6a6a6;font-size:1.5em;'>You are here.</span>");
    infoWindow.open(map, homemarker);
  });
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
      infoWindow.setContent("<span style='font-weight:bold;color:#a6a6a6;font-size:1.5em;'>You are here.</span>");
      map.setCenter(pos);

      homemarker = new google.maps.Marker({
        map: map,
        position: pos,
        icon: {
          url: 'images/home.png',
          anchor: new google.maps.Point(10, 10),
          scaledSize: new google.maps.Size(15, 25)
        }
      });
      google.maps.event.addListener(homemarker, 'click', function() {
        infoWindow.setContent("<span style='font-weight:bold;color:#EE7600;font-size:1.5em;'>You are here.</span>");
        infoWindow.open(map, homemarker);
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
      zoom: 16
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
        scaledSize: new google.maps.Size(15, 25)
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
  $('#placeheader').append('<div id="headerrating">'+ getIconRating(place.rating) +'</div>');

	//photo first
	var result = '<div style="height: 3em;"></div><div class="place-details">';
    	if (place.photos)
		result += '<div id="imagecontainer"><img class="restaurant-image-large" src="' + place.photos[0].getUrl({'maxWidth': 500, 'maxHeight': 300}) + '"/></div>';
	else
		result += '<div id="imagecontainer"><img class="restaurant-image-large" src="images/restaurant.png"/></div>';
    //address
          var address = place.formatted_address.split(', United Kingdom')[0];
           result+='<div class="details"><table align="center"><tr><td align="center"><i class="fa fa-map-marker"></i></td><td> ' + address + '</td></tr>';
    //type
          var type = place.types[0];
          if (type == 'meal_takeaway') type = 'Restaurant and takeaway';
          if (type == 'night_club') type = "Night club";
          type = type.charAt(0).toUpperCase() + type.slice(1);
          result += '<tr><td align="center"><i class="fa fa-cutlery"></i></td><td> ' + type;
    //telephone
    var tel=place.formatted_phone_number;
    result+= '</td></tr><tr><td align="center"><i class="fa fa-phone"></i></td><td> ' + tel ;
    result += '</td></tr>'
    //site
    var site=place.website;
    if (site)	result+= '<tr><td align="center"><i class="fa fa-globe"></i></td><td> <a style="text-decoration:none" href="'+ site + '">' + site + '</a></td></tr>';
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

    result+= '<tr><td><i class="fa fa-gbp"></i></td><td> ' + formattedPriceLevel +'</td></tr></table></div>' ;
	//opening hours
  var hours = "";
	openNow = null;
  result += '<div class="placesection"><i class="fa fa-calendar"></i> Opening hours</div>';
  result += "<div class='details' align='center'>"
	if (place.opening_hours) openNow = place.opening_hours.open_now ? '<b>Open now!</b>' : '<b>Closed.</b>';
  if (openNow) {
    hours += openNow + "<br/>";
    for (i=0; i<7;i++){
      hours+= place.opening_hours.weekday_text[i]+ '<br/>';
    }
  } else {
    hours += 'Opening hours not available.' + '</div></div>';
  }
	result += hours + "</div>";

	var i=0;
	if (place.reviews){
		result+='<div class="placesection"><i class="fa fa-newspaper-o"></i> Reviews</div>';
		var reviews= place.reviews;
    result += '<div class="details">'
		$.each(reviews, function(key, value){
			if (i<6){
				result+='<div class="review"><i class="fa fa-user"></i> <b>'+ value.author_name+ '</b>' +'<br>'+value.text + '<br><b>Rating:</b> '+getRating(value.rating)+'</div>';
			}
			i++;
		})
	} else {
		result+='No reviews for this place.';
	}
  result += '</div>'
      $('#place').append(result);
}

function showResults(places) {
  for (var i = 0; i < places.length; i++) {
    var place = places[i];
    addResult(place);
  }
}

$(document).ready(function() {
  var cookie=unescape($.cookie('history'));
  var history=cookie.split(',');

  var sidebar = false;
  var sortbar = false;

  var cuisines = ['Chinese', 'Japanese', 'Italian', 'Greek', 'Indian'];

  var filtertoggle = true;
  var cuisinetoggle = false;
  var searchtoggle = false;

  var lat;
  var lng;

  $(window).load(function() {
    homemarker = new google.maps.Marker();
    lat = unescape($.cookie('lat'));
    lng = unescape($.cookie('lng'));
    if (lat != 'undefined') {
      ulocation = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
      locationGiven = true;
    } else {
      ulocation = new google.maps.LatLng(55.863791, -4.251667);
      locationGiven = false;
    }

    // check if at index
    var page = document.URL.split('goEat/')[1];
    if (page == 'index.html') return indexLoad();
    var bool = true;
    var query = location.search.split('query=')[1];

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
      initMap()
      query = decodeURI(query);;
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
    $(this).css("background-color", "#f8c899");
  });

  $(document).on("mouseleave", ".result", function() {
    $(this).css("background-color", "#fdfdfd");
  });

  $(document).on("click", ".result", function() {
    $(this).css("background-color", "#f39f4c");
    var id = $(this).data('id');
    window.location.href = 'place.html?id=' + id;
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
    window.location.href = 'results.html?query=' + query;
  });

  $(document).on('click', '#nearyou', function () {
    window.location.href = 'results.html?filter=near';
  });

  $(document).on('click', '#popular', function () {
    window.location.href = 'results.html?filter=popular';
  });
  $(document).on('click', '#toprated', function () {
    window.location.href = 'results.html?filter=toprated';
  });


  $(document).on('click', '.filter-search', function () {
    var query = $(this).text();
    $('#search').val(query);
    initMap();
    searchQuery(query);
  });

  $(document).on({
    mouseenter: function () {
      var placeId = $(this).data('id');
      var marker;
      var icon = {
        url: 'images/selected.png',
        anchor: new google.maps.Point(10, 10),
        scaledSize: new google.maps.Size(15, 25)
      };
      markers.forEach(function (m) {
        if (m.getPlace().placeId == placeId) marker = m;
      });
      marker.setIcon(icon);

    },
    mouseleave: function () {
      var placeId = $(this).data('id');
      var marker;
      var icon = {
        url: 'images/marker.png',
        anchor: new google.maps.Point(10, 10),
        scaledSize: new google.maps.Size(15, 25)
      };
      markers.forEach(function (m) {
        if (m.getPlace().placeId == placeId) marker = m;
      });
      marker.setIcon(icon);
    }
  }, '.result');

  $('#search').keydown( function(e) {
	   var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
	   if(key == 13) {
		   var query = $(this).val();
       console.log(history.indexOf(query));
			if (history.indexOf(query) == -1) {
        if (history.length == 5) history = history.slice(1);
        history.push(query);
      }
			$.cookie('history', escape(history.join(',')), {expires:1234});
      var center = map.getCenter();
      $.cookie('clat', escape(center.lat()), {expires:1234});
      $.cookie('clng', escape(center.lng()), {expires:1234});
      //$.cookie('zoom', escape(map.getZoom()), {expires:1234});
			window.location.href = 'results.html?query=' + query;
	   }
   });

  $('#search').keyup(function(e){
    if(e.keyCode == 13) {
      $(this).trigger("enterKey");
    }
  });
  $(window).load(function() {
    for (i = 0; i < history.length; i++) {
	  if (history[i] !== "undefined" ){
		  $('#searchhistory').append('<div class="filter filter-cuisine" data-cuisineitem="' + history[i] + '">' + history[i] + '</div>');
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

  $('.headericon').hover(function() {
    $(this).css("background-color", "#BE5E00");
  }, function() {
    $(this).css("background-color", "");
  });

  $('#location').click(function() {
    setLocation();
  });
});
