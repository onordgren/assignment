// Clear the search results, for example when the clear icon is pressed
function clearSearch() {
  $('.search-container i.clear-search').hide();
  $('.search-container i.fa-search').show();
  $('ul.search-results').empty();
  $('.search-results-container').hide();
}

// Prepend the selected search result to the search result list
function selectSearchResult(searchResult) {
  var name = $('.name', searchResult).text();
  var date = new Date();
  $('ul.selected-searches').prepend(
    $('<li class="selected-search"><i class="fa fa-check-circle fa-fw"></i><span class="name">' + name + '</span><span class="datetime pull-right break-sm">' + date.toLocaleString() + '</span></li>')
  );
  $('.search-results-container').hide();
}

// Open the search results or navigate if already shown
function openOrNavigateSearchResult(next) {
  if($('.search-results-container').is(':hidden')) {
    $('.search-results-container').show();
    return
  }

  var current = $('li.search-result.selected');

  if($(next).length > 0) {
    $(current).removeClass('selected');
    $(next).addClass('selected');
  }
}

$(document).ready(function() {
  var timer;

  $('input.search-bar').on('input', function() {
    var query = $(this).val();

    clearInterval(timer);

    if(query.length > 0) {
      $('.search-container i.clear-search').show();
      $('.search-container i.fa-search').hide();
      timer = setTimeout(function() {
        var request = $.get('https://api.github.com/search/repositories', { q: query });

        request.done(function(data) {
          if(data.items.length > 0) {
            var result = data.items.map(function(item, i) {
              return $('<li class="search-result"><span class="name">' + item.name + '</span><span class="full-name pull-right hidden-sm">' + item.full_name + '</span></li>')
            });
            $('ul.search-results').html(result);
            $('ul.search-results li.search-result:first').addClass('selected');
          }
          else {
            $('ul.search-results').html(
              $('<li class="search-message no-matches">No matches found, please refine your search</li>')
            );
          }
        });

        request.fail(function(jqXHR, textStatus, errorThrown) {
          switch(jqXHR.status) {
            case 403:
              $('ul.search-results').html(
                $('<li class="search-message">Maximum number of requests per minute reached, please wait and try again in a minute.</li>')
              );
              break;

            case 500:
              $('ul.search-results').html(
                $('<li class="search-message">The remote API is currently down, please try again later.</li>')
              );
              break

            default: return;
          }
        });

        request.always(function() {
          $('.search-results-container').show();
        });
      }, 200)
    }
    else {
      clearSearch();
    }
  });

  // Handle navigation up/down and enter keys
  $('input.search-bar').on('keydown', function(event) {
    switch(event.which) {
      case 13: // Enter key
        var selected_result = $('li.search-result.selected');
        // Only add selected result if the results are visible
        if($(selected_result).is(':visible')) {
          selectSearchResult($(selected_result));
        }
        break;

      case 38: // Up key
        openOrNavigateSearchResult($('li.search-result.selected').prev('li.search-result'));
        break;

      case 40: // Down key
        openOrNavigateSearchResult($('li.search-result.selected').next('li.search-result'));
        break;

      case 27: // Escape key
        $('.search-results-container').hide();
        break;

      default: return;
    }
    event.preventDefault();
  });

  // Show old results when focusing a previously used search bar
  $('input.search-bar').on('click', function() {
    if($(this).val().length > 0) {
      $('.search-results-container').show();
    }
  });

  // Add the search result when clicked
  $(document).on('click', 'li.search-result', function() {
    selectSearchResult(this);
  });

  // Hide search results when clicking outside of the search bar
  $(document).on('click', function(event) {
    if(!$(event.target).hasClass('search-bar')) {
      $('.search-results-container').hide();
    }
  });

  // Clear the search query and search when clear icon is clicked
  $('i.clear-search').on('click', function() {
    $('input.search-bar').val("");
    clearSearch();
  });
})
