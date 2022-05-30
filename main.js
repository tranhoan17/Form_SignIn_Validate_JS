function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {};
  function validate(inputElement, rule) {
    var errorMess;
    var errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);

    // Lay cac rules cua selector
    var rules = selectorRules[rule.selector];

    for (var i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          errorMess = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errorMess = rules[i](inputElement.value);
      }
      if (errorMess) break;
    }

    if (errorMess) {
      errorElement.innerText = errorMess;
      getParent(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = " ";
      getParent(inputElement, options.formGroupSelector).classList.remove(
        "invalid"
      );
    }

    return !errorMess;
  }

  var formElement = document.querySelector(options.form);

  if (formElement) {
    //Khi an submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;

      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);

        if (!isValid) isFormValid = false;
      });

      if (isFormValid) {
        //Truong hop submit voi js
        if (typeof options.onsubmit === "function") {
          var enableinputs = formElement.querySelectorAll("[name]"); // Lay ra cac node element co atrribute =  name --> node List

          var formValues = Array.from(enableinputs).reduce(function (
            values,
            input
          ) {
            switch (input.type) {
              case "radio":
                values[input.name] = formElement.querySelector(
                  'input[name = "' + input.name + '"]:checked'
                ).value;
                break;
              case "checkbox":
                if(!input.matches(':checked')){
                  values[input.name] = '';
                  return values;
                }
                if(!Array.isArray(values[input.name])){
                  values[input.name] = [];
                }
                values[input.name].push(input.value);
                break;
              case 'file':
                values[input.name] = input.files;
                break
              default:
                values[input.name] = input.value;
            }

            return values;
          },
          {});
          options.onsubmit(formValues);
          console.log(formValues);
        }
      }
      //Truong hop submit mac dinh voi trinh duyet
      //   else {
      //     formElement.submit();
      //   }
    };

    options.rules.forEach(function (rule) {
      //Luu lai cac rules cho moi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach(function (inputElement) {
        //Khi blur ra ngoai
        inputElement.onblur = function () {
          validate(inputElement, rule);

          //Khi nguoi dung nhap vao o input
          inputElement.oninput = function () {
            var errorElement = getParent(
              inputElement,
              options.formGroupSelector
            ).querySelector(options.errorSelector);
            errorElement.innerText = " ";
            getParent(inputElement, options.formGroupSelector).classList.remove(
              "invalid"
            );
          };
        };
      });
    });
  }
}

Validator.isRequired = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : "Vui lòng nhập đúng trường này!";
    },
  };
};

Validator.isEmail = function (selector) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Vui lòng nhập đúng email";
    },
  };
};
Validator.minLength = function (selector, min) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : `Vui lòng nhập tối thiểu ${min} ký tự!`;
    },
  };
};

Validator.isConfirm = function (selector, getValueConfirm) {
  return {
    selector: selector,
    test: function (value) {
      return value === getValueConfirm()
        ? undefined
        : "Giá trị nhập vào không chính xác!";
    },
  };
};
