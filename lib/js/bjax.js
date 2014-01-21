/* bjax/lib/js/bjax.js (c) Mark Constable (AGPL-3.0) */

$(function() {
  $(document).bjax();
});

;(function ($, window, document, undefined) {

  var pluginName = "bjax",
    defaults = {
      source: 'lib/md/',
      target: '#content',
      firstPage: '1',
      firstPop: true
    };

  function Plugin(element, options) {
    this.$el = $(element);
    this.o = $.extend( {}, defaults, options );
    this.init(this);
  }

  Plugin.prototype = {
    init: function (self) {
      this.setState(this.o.firstPage);

      this.$el.on('click.bjax', 'a:not(.dropdown-toggle)', function (e) {
        e.preventDefault();
        self.setState($(this).attr('href'));
        if (self.state.node == '') window.location = self.state.path;
        self.pull();
        self.pushState();
      });

      this.$el.on('click.bjax', 'form button[type=submit]', function (e) {
        e.preventDefault();
        var $this = $(this),
            form = $this.parents('form'),
            data = form.serializeArray();
        data.push({ name: $this.attr('name'), value: $this.attr('value') });
        $.post(form.attr('action'), $.param(data)).done(function(result) {
          $(self.o.target).html(result);
        });
      });

      $(window).on('popstate.bjax', function() {
        if (self.o.firstPop) {
          self.pull();
          self.pushState();
        } else {
          if (history.state !== null) {
            self.state = history.state;
            self.pull();
          } else {
            location = location.pathname;
          }
        }
        self.o.firstPop = false;
      });
    },

    pull: function() {
      var self = this;
      this.get().done(function(results) {
        self.display(results);
      });
    },

    get: function() {
      return $.ajax({
        url: this.state.ajax,
        dataType: 'html'
      });
    },

    push: function() {
      var self = this;
      this.put().done(function(results) {
        self.display(results);
      });
    },

    put: function() {
      return $.ajax({
        method: 'POST',
        data: {},
        url: this.state.ajax,
        dataType: 'html'
      });
    },

    display: function(md) {
      var a = $('a[href="' + this.state.href + '"]');
      $('.active').removeClass('active');
      (a.parent().is('li') ? a.parent('li') : a).addClass('active');
console.log(this.state.node, $.isNumeric(this.state.node))
      if ($.isNumeric(this.state.node))
        return $(this.o.target).hide().html(marked(md)).fadeIn();
      else
        return $(this.o.target).html(md);
    },

    pushState: function() {
      $('title').html(this.state.node);
      history.pushState(this.state, null, this.state.href);
    },

    setState: function(h) {
      var d = this.o.target,
          p = h.replace(/[^\/]*$/, ''),
          n = h.replace(/.*\//, ''),
          a = ($.isNumeric(n)) ? p + this.o.source + n + '.md' : h;
      this.state = { dest: d, href: h, path: p, node: n, ajax: a };
    }
  };

  $.fn[pluginName] = function (options) {
    return this.each(function() {
      if (!$.data(this, pluginName)) {
        $.data(this, pluginName, new Plugin(this, options));
      }
    });
  };

})( jQuery, window, document );
