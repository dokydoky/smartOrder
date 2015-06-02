$(document).ready(function() {
  $('#example-2').ratings(5).bind('ratingchanged', function(event, data) {
    $('#example-rating-2').text(data.rating);
  });
});