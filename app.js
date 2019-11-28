// SIMULATOR CONTROLLER
var simulatorController = (function() {
  return {
    calculateTrays: function(input) {
      var operating_line = {
        x: [input.topX, input.bottomX],
        y: [input.topY, input.bottomY],
        type: "scatter",
        name: "Operating Line"
      };
      console.log(operating_line);

      var operating_slope, operating_intercept;
      operating_slope =
        (input.topY - input.bottomY) / (input.topX - input.bottomX);
      operating_intercept = input.topY - operating_slope * input.topX;
      console.log(operating_slope, operating_intercept);

      var higherX, higherY, lowerX, lowerY;

      if (input.topY > input.bottomY) {
        higherX = input.topX;
        higherY = input.topY;
        lowerX = input.bottomX;
        lowerY = input.bottomY;
      } else if (input.bottomY > input.topY) {
        higherX = input.bottomX;
        higherY = input.bottomY;
        lowerX = input.topX;
        lowerY = input.topY;
      }
      console.log(higherX, higherY);

      var equilibrium_line = {
        x: [0, higherX],
        y: [0, input.eq_slope * higherX],
        type: "scatter",
        name: "Equilibrium Line"
      };
      console.log(equilibrium_line);

      var stage_line = {
        x: [higherX],
        y: [higherY],
        type: "scatter",
        name: "Stages"
      };

      if (higherY > input.eq_slope * higherX) {
        var x, y, stages;
        x = higherX;
        y = higherY;
        stages = 0;

        while (y > lowerY && input.eq_slope * x > lowerY) {
          stages++;
          y = input.eq_slope * x;
          stage_line.x.push(x);
          stage_line.y.push(y);
          x = (y - operating_intercept) / operating_slope;
          stage_line.x.push(x);
          stage_line.y.push(y);
        }
        stages++;
        y = input.eq_slope * x;
        if (x > 0 && y > 0) {
          stage_line.x.push(x);
          stage_line.y.push(y);
        }

        x = (y - operating_intercept) / operating_slope;
        if (x > 0 && y > 0) {
          stage_line.x.push(x);
          stage_line.y.push(y);
        }
      } else if (higherY < input.eq_slope * higherX) {
        var x, y, stages;
        x = higherX;
        y = higherY;
        stages = 0;

        while (x > lowerX && y / input.eq_slope > lowerX) {
          stages++;
          x = y / input.eq_slope;
          stage_line.x.push(x);
          stage_line.y.push(y);
          y = operating_slope * x + operating_intercept;
          stage_line.x.push(x);
          stage_line.y.push(y);
        }
        stages++;
        x = y / input.eq_slope;
        if (x > 0 && y > 0) {
          stage_line.x.push(x);
          stage_line.y.push(y);
        }

        y = operating_slope * x + operating_intercept;
        if (x > 0 && y > 0) {
          stage_line.x.push(x);
          stage_line.y.push(y);
        }
      }
      console.log(stage_line);
      console.log(stages);

      return {
        lines: [operating_line, equilibrium_line, stage_line],
        trays: stages
      };
    }
  };
})();

// UI CONTROLLER
var UIController = (function() {
  var DOMstrings = {
    inputType: ".add__mode",
    inputBtn: ".btn__sim",
    slope: "slope",
    topX: "topX",
    topY: "topY",
    bottomX: "bottomX",
    bottomY: "bottomY"
  };

  return {
    getInput: function() {
      return {
        mode: document.querySelector(DOMstrings.inputType).value, // Will be co-current/counter-current/crossflow
        eq_slope: parseFloat(document.getElementById(DOMstrings.slope).value),
        topX: parseFloat(document.getElementById(DOMstrings.topX).value),
        topY: parseFloat(document.getElementById(DOMstrings.topY).value),
        bottomX: parseFloat(document.getElementById(DOMstrings.bottomX).value),
        bottomY: parseFloat(document.getElementById(DOMstrings.bottomY).value)
      };
    },

    getDOMstrings: function() {
      return DOMstrings;
    },

    changedType: function() {
            
      var mode = document.querySelector(DOMstrings.inputType).value;
      if (mode === 'co-current') {
        document.getElementById(DOMstrings.topX).placeholder = 'X:1';
        document.getElementById(DOMstrings.topY).placeholder = 'Y:1';
        document.getElementById(DOMstrings.bottomX).placeholder = 'X:(n + 1)';
        document.getElementById(DOMstrings.bottomY).placeholder = 'Y:(n + 1)';
      } else if (mode === 'counter-current'){
        document.getElementById(DOMstrings.topX).placeholder = 'X:0';
        document.getElementById(DOMstrings.topY).placeholder = 'Y:0';
        document.getElementById(DOMstrings.bottomX).placeholder = 'X:N';
        document.getElementById(DOMstrings.bottomY).placeholder = 'Y:(n + 1)';
      }
      
    },

    displayResult: function(result) {
      var layout = {
        title:
          "Finding number of trays using graphical method : N = " +
          result.trays,
        xaxis: {
          title: "X -->"
        },
        yaxis: {
          title: "Y -->"
        }
      };

      var lines = result.lines;
      Plotly.newPlot("plot", lines, layout);
    }
  };
})();

// GLOBAL APP CONTROLLER
var controller = (function(simCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();

    document
      .querySelector(DOM.inputBtn)
      .addEventListener("click", startPlotting);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        startPlotting();
      }
    });

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  var startPlotting = function() {
    var input, result;

    // 1. Get the field input data
    input = UICtrl.getInput();
    console.log(input);

    // 2. All calculations
    result = simCtrl.calculateTrays(input);

    // 3. Display the result
    UICtrl.displayResult(result);

  };

  return {
    init: function() {
      console.log("Application has started.");
      setupEventListeners();
    }
  };
})(simulatorController, UIController);

controller.init();
