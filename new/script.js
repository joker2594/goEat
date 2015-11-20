$(document).ready(function() {
  var sidebar = false;
  var cuisines = ['Chinese', 'Japanese', 'Italian', 'Greek', 'American', 'Indian', 'African'];
  var searches = ['McDonalds', 'Chinese near West End', 'City centre'];
  var filtertoggle = true;
  var cuisinetoggle = false;
  var searchtoggle = false;

  $(window).load(function() {
    for (i = 0; i < cuisines.length; i++) {
      $('#cats').append("<div class=\'filter\' cuisineitem>" + cuisines[i] + "</div> ");
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
});

/*
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 55.863791, lng: -4.251667},
    zoom: 14
  });
}
*/