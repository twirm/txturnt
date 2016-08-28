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

    generateMockedVoters: function (queryString) {
      var fields = JSON.parse(queryString),
          getRandomNum = function randomIntFromInterval (min, max) {
            return Math.floor(Math.random()*(max-min+1)+min);
          },
          zipCodes = ['78741', '78721', '78751', '78748'],
          getRandomMiddleName = function () {
            var names = ['Esquivel', 'Taylor', 'Grant'],
                idx = getRandomNum(0, 5);
            return names[idx] ? names[idx] : '';
          };
      if (fields['MZIPCD']) {
        return [{
          'FSTNAM': fields['FSTNAM'],
          'LSTNAM': fields['LSTNAM'],
          'MIDNAM': fields['MIDNAM'],
          'MZIPCD': fields['MZIPCD'],
          'GENDER': 'F',
        }];
      } else {
        return _.reduce(Array(getRandomNum(2, 4)), function (result, idx) {
          result.push({
            'FSTNAM': fields['FSTNAM'],
            'LSTNAM': fields['LSTNAM'],
            'MIDNAM': fields['MIDNAM'] ? fields['MIDNAM'] : getRandomMiddleName(),
            'MZIPCD': fields['MZIPCD'] ? fields['MZIPCD'] : zipCodes[getRandomNum(0, 3)],
            'GENDER': 'F',
          });
          return result;
        }, []);
      }
    },

    formIsValid: function (btn) {
      var $btn = $(btn),
          isFormValid = true,
          queryDB = this;

      _.forEach(this.validator.fields, function (func, key) {
        var isInputValid = queryDB.validator.validate(func, key, $('input[name="' + key + '"]'));
        queryDB.validator.setBtnValidity(key, isInputValid);
        isFormValid = isFormValid ? isInputValid : isFormValid;
      });

      return isFormValid;
    },

    get: function () {
      var queryString = JSON.stringify(_.reduce(this.keys, function (query, key) {
        query[key] = $('[name="' + key + '"]').val();
        return query;
      }, {}));

      var queryDB = this;

      setTimeout(function () {
        queryDB.renderResults({ 'voters': queryDB.generateMockedVoters(queryString) });
      }, 1000);
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
