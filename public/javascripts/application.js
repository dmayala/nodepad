(function() {
  // Easily get an item's database ID based on an id attribute
  $.fn.itemID = function() {
    try {
      var items = $(this).attr('id').split('-');
      return items[items.length - 1];
    } catch (exception) {
      return null;
    }
  };

  $.put = function(url, data, success) {
    data._method = 'PUT';
    $.post(url, data, success, 'json');
  };

  $('#delete-document').click(function(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to delete that document?')) {
      var element = $(this),
          form = $('<form></form>');
      form
        .attr({
          method: 'POST',
          action: '/documents/' + $('#document-list .selected').itemID()
        })
        .hide()
        .append('<input type="hidden" />')
        .find('input')
        .attr({
          'name': '_method',
          'value': 'delete'
        })
        .end()
        .appendTo('body')
        .submit();
    }
  });

  $('#logout').click(function(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to log out?')) {
      var element = $(this),
          form = $('<form></form>');
      form
        .attr({
          method: 'POST',
          action: '/sessions'
        })
        .hide()
        .append('<input type="hidden" />')
        .find('input')
        .attr({
          'name': '_method',
          'value': 'delete'
        })
        .end()
        .appendTo('body')
        .submit();
    }
  });

  // Correct widths and heights based on window size
  function resize() {
    var height = $(window).height() - $('#header').height() - 1,
        width = $('.content').width(),
        ov = $('.outline-view'),
        ed = $('#editor'),
        toolbar = $('.toolbar'),
        divider = $('.content-divider'),
        content = $('.content'),
        controls = $('#controls');

    $('#DocumentTitles').css({ height: height - toolbar.height() + 'px' });
    ov.css({ height: height + 'px' });
    toolbar.css({ width: ov.width() + 'px' });

    content.css({
      height: height - controls.height() + 'px',
      width: $('body').width() - ov.width() - divider.width() - 1 + 'px'
    });

    divider.css({ height: height + 'px' });

    ed.css({
      width: content.width() + 'px',
      height: content.height() - 22 - $('input.title').height() + 'px'
    }).focus();

    $('#controls').css({
      width: content.width() + 'px'
    });
  }

  $('#document-list li a').live('click', function(e) {
    var li = $(this);

    $.get(this.href + '.json', function(data) {
      $('#document-list .selected').removeClass('selected');
      li.addClass('selected');
      $('#editor').val(data.data);
      $('.title').val(data.title);
      $('#editor').focus();
    });

    e.preventDefault();
  });

  if ($('#document-list .selected').length == 0) {
    $('#document-list li a').first().click();
  }

  $('#save-button').click(function() {
    var id = $('#document-list .selected').itemID(),
        params = { d: { data: $('#editor').val(), id: id, title: $('input.title').val() } };
    $.put('/documents/' + id + '.json', params, function(data) {
      // Saved, will return JSON
      $('#document-title-' + id).html(data.title);
    });
  });

  $('#create-document').click(function(e) {
    $.post('/documents.json', { document: { data: '', title: 'Untitled Document' } }, function(new_doc) {
      showDocuments([new_doc]);
      $('#document-title-' + new_doc._id).click();
    });
    e.preventDefault();
  });

  $('#html-button').click(function() {
    var container = $('#html-container');
    if (container.is(':visible')) {
      container.html('').hide();
      $('#html-button').removeClass('active');
    } else {
      $('#save-button').click();
      $('#html-button').addClass('active');
      var id = $('#document-list .selected').itemID();
      $.get('/documents/' + id + '.html', function(data) {
        // Saved, will return JSON
        container.html(data).show();
      });
    }
  });

  function hideFlashMessages() {
    $(this).fadeOut();
  }

  setTimeout(function() {
    $('.flash').each(hideFlashMessages);
  }, 5000);
  $('.flash').click(hideFlashMessages);

  // Search bar
  function showDocuments(results) {
    for (var i = 0; i < results.length; i++) {
      $('#document-list').append('<li><a id="document-title-' + results[i]._id + '" href="/documents/' + results[i]._id + '">' + results[i].title + '</a></li>');
    }
  }

  function search(value) {
    $.post('/search.json', { s: value }, function(results) {
      $('#document-list').html('');
      $('#document-list').append('<li><a id="show-all" href="#">Show All</a></li>');

      if (results.length === 0) {
        alert('No results found');
      } else {
        showDocuments(results);
      }
    }, 'json');
  }

  $('input[name="s"]').focus(function() {
    var element = $(this);
    if (element.val() === 'Search')
      element.val('');
  });

  $('input[name="s"]').blur(function() {
    var element = $(this);
    if (element.val().length === 0)
      element.val('Search');
  });

  $('form.search').submit(function(e) {
    search($('input[name="s"]').val());
    e.preventDefault();
  });

  $('#show-all').live('click', function(e) {
    $.get('/documents/titles.json', function(results) {
      $('#document-list').html('');
      showDocuments(results);
      if (results.length > 0)
        $('#document-title-' + results[0]._id).click();
    });
    e.preventDefault();
  });

  $(window).resize(resize);
  $(window).focus(resize);
  resize();
})();