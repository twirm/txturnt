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

    validate: function (func, key, el) {
      var display = func($(el).val()) ? 'hide' : 'show';
      $('.form-error#' + key)[display]();
    },

    init: function () {
      var validator = this;
      _.forEach(this.fields, function (func, key) {
        $('input[name="' + key + '"]').blur(function (e) {
          validator.validate(func, key, e.target);
        })
      });
    },
  };

  new Validator();
});
