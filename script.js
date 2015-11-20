var map;
var service;
var glasgow;
var infoWindow;

//var markers = [];
var places = [];
var searches = [];

function initMap() {
  glasgow = new google.maps.LatLng(55.863791, -4.251667);
  map = new google.maps.Map(document.getElementById('map'), {
    center: glasgow,
    zoom: 14
  });

  infoWindow = new google.maps.InfoWindow();
  service = new google.maps.places.PlacesService(map);
}

function indexLoad() {
  var request = {
    location: glasgow,
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
      "<a href='restaurant.html&id=" + result.id + "' style='color:#008080;text-decoration:none;font-size:1.5em;font-weight:bold;'>" + result.name +
      "</a><br/><a class='markerlink' href='restaurant.html&id=" + result.id + "'>Visit page</a> | " +
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
  result += '<span class="title">' + place.name + '</span><div class="rating">★★★★★</div>';
  result += '<div class="details">';
  result += 'Chinese - Chinese dining with dumpling specials<br/>' + place.formatted_address + '<br/>';
  if (openNow)
    result += openNow;
  else
    result += 'No info about opening hours';
  result += '</div></div>';

  $('#results').append(result);
}

// function clearMarkers() {
//   for (var i = 0; i < markers.length; i++) {
//     markers[i].setMap(null);
//   }
// }

function searchQuery(query) {
  //clearMarkers();
  initMap();
  places = [];
  $('.result').each(function () {
    $(this).remove();
  })
  $('#results-for').text("Results for " + query);

  var request = {
    location: glasgow,
    radius: '2000',
    query: query,
    types: 'restaurant'
  }
  service.textSearch(request, callback);
}

function updateRecentSearches() {
  var bound = searches.length > 5 ? 5 : searches.length;
  for (i = 0; i < bound; i++) {
    $('#searchhistory').append("<div class=\'filter filter-search\' searchitem>" + searches[i] + "</div> ");
  }
}

$(document).ready(function() {
  var sidebar = false;
  var cuisines = ['Chinese', 'Japanese', 'Italian', 'Greek', 'American', 'Indian', 'African'];
  var searches = ['McDonalds', 'Chinese near West End', 'City centre'];

  var sortTypes = ['Name','Price','Rating','Popularity','Proximity'];

  var filtertoggle = true;
  var cuisinetoggle = false;
  var searchtoggle = false;

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
  $('#search').val(query);
  searchQuery(query);
});

  $(document).on('click', '.filter-search', function () {
    var query = $(this).text();
    $('#search').val(query);
    searchQuery(query);
  });

  $('#search').bind("enterKey",function(e){
    var query = $(this).val();
    searches.unshift(query);
    searchQuery(query);
    $('.filter-search').each(function () {
      $(this).remove();
    });
    updateRecentSearches();
  });

  $('#search').keyup(function(e){
    if(e.keyCode == 13) {
      $(this).trigger("enterKey");
    }
  });
});
