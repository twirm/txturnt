$(document).ready(function () {
  $(document).foundation();

  /*
   * form validation
   */

  function Validator () {
    var validator = this;
    this.fields = {
      'FSTNAM': validator.defaultTest,
      'LSTNAM': validator.defaultTest,
      'MZIPCD': validator.zipTest,
    },
    this.invalidInputs = {};
    this.validate = this.validate.bind(this);
    this.init();
  }

  Validator.prototype = {
    defaultTest: function (str) {
      return /\S/.test(str);
    },

    zipTest: function (str) {
      return str === '' || /^\d{5}$/.test(str);
    },

    setBtnValidity: function (key, isValid) {
      if (isValid && this.invalidInputs[key]) {
        delete this.invalidInputs[key];
      } else if (!isValid) {
        this.invalidInputs[key] = true;
      }
      $('.search.button')[_.isEmpty(this.invalidInputs) ? 'removeClass' : 'addClass']('disabled');
    },

    validate: function (func, key, el) {
      var isValid = func($(el).val()),
          display = isValid ? 'hide' : 'show';
      $('.form-error#' + key)[display]();
      return isValid;
    },

    init: function () {
      var validator = this;
      _.forEach(this.fields, function (func, key) {
        $('input[name="' + key + '"]').blur(function (e) {
          var isValid = validator.validate(func, key, e.target);
          validator.setBtnValidity(key, isValid);
        }).focus(function () {
          validator.setBtnValidity(key, true);
        });
      });
    },
  };

  /*
   * get voters
   */

  function QueryDB (validator) {
    var queryDB = this;
    this.validator = validator;
    this.get = this.get.bind(this);
    this.formIsValid = this.formIsValid.bind(this);
    $('.button.search').click(function (e) {
      if (queryDB.formIsValid(e.target)) {
        queryDB.get();
      }
    });
  }

  QueryDB.prototype = {
    keys: ['FSTNAM', 'LSTNAM', 'MIDNAM', 'MZIPCD', 'GENDER'],

    stubbedData: {
      voters: [
        {
          'FSTNAM': 'Luke',
          'LSTNAM': 'Whyte',
          'MIDNAM': 'Allan',
          'MZIPCD': '78721',
          'GENDER': 'M',
        },
        {
          'FSTNAM': 'Victoria',
          'LSTNAM': 'O\'Dell',
          'MZIPCD': '78741',
          'GENDER': 'F',
        },
        {
          'FSTNAM': 'Victoria',
          'LSTNAM': 'O\'Dell',
          'MIDNAM': '',
          'MZIPCD': '78741',
          'GENDER': 'F',
        },
        {
          'FSTNAM': 'Luke',
          'LSTNAM': 'Whyte',
          'MIDNAM': 'Allan',
          'MZIPCD': '78721',
          'GENDER': 'M',
        },
      ],
    },

    formIsValid: function (btn) {
      var $btn = $(btn),
          isValid = !$btn.hasClass('disabled'),
          queryDB = this;

      isValid = isValid ? _.reduce(this.keys, function (bool, key) {
        var func = queryDB.validator.fields[key];
        if (func) {
          return queryDB.validator.validate(func, key, $('input[name="' + key + '"]')) && bool;
        } else {
          return bool;
        }
      }, true) : false;

      if (!isValid) {
        $btn.addClass('disabled');
      }
      return isValid;
    },

    get: function () {
      var queryString = JSON.stringify(_.reduce(this.keys, function (query, key) {
        query[key] = $('[name="' + key + '"]').val();
        return query;
      }, {}));

      var queryDB = this;

      setTimeout(function () {
        queryDB.renderResults(queryDB.stubbedData);
      }, 2000);
    },

    renderResults: function (voters) {
      var $table = $('#results');
      $table.parent().addClass('populated');
      $table.children('tbody').html(tmpl('search_results_tmpl', voters));
    },
  };

  var validator = new Validator();
  new QueryDB(validator);
});

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};

  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();
