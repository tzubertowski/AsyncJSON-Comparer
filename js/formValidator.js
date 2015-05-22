$(document).ready(function(){
  var urlFormField = $('input[name=jsonUrl]');
  var refreshFormField = $('input[name=jsonRefresh]');
  var configForm   = $('#configFormMain');
  var contentWrapper = $('#content-wrapper');
  var comparisonMainWrapper = $("#comparisonWrapperMain");
  var urlText;
  var jsonValidUrl;
  var refreshVal;

  var firstLoopJSON;
  var firstLoopHour;
  var secondLoopJSON;
  var secondLoopHour;

  var asyncLoopObject;

  // Notification options
  var audioNotification;
  var snd;
  var shakeInterval;

  // JSON differences
  var differencesJSON;

  // customize all inputs (will search for checkboxes and radio buttons)
  $('flat-checkbox-1').iCheck();

  $('#toggleAjax').click(function(e){
      urlText = urlFormField.val();
      refreshVal = refreshFormField.val();
      var urlIsValid = /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(urlText);
      if(!urlIsValid) {
          renderAlert(contentWrapper, 'danger', 'Error', 'Bad URL or no URL given. Please fix that.', true);
          return false;
      }

      if(refreshVal == '') {
        refreshFormField.val('60');
        refreshVal = refreshFormField.val();
      }

      if( $('#enabledNotification').prop('checked') ) {
        audioNotification = true;
        snd = new Audio("sounds/Europa.ogg"); // buffers automatically when created
      }

      fetchJsonData(urlText);
      return;
  });

  var renderAlert = function(target, type, header, message, hide) {
      target.prepend('<div class="alert alert-'+type+'" id="app-alert"><button type="button" class="close" data-dismiss="alert">x</button><strong>'+header+'! : </strong>'+message+'</div>');
      if( hide == true) {
        setTimeout(function(){
          $('#app-alert').fadeOut('slow', function(){$(this).remove});
        }, 3500);
      }
  }

  var fetchJsonData = function (jsonUrl) {
      $.getJSON( jsonUrl , function(jsonData) {
        if(jsonData) {
            var dt = new Date();
            var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
            if(!firstLoopJSON) {
                firstLoopJSON = jsonData;
                firstLoopHour = time;
            }
            renderAlert(contentWrapper, 'success', 'Success', 'Found a valid JSON file, processing ...', true);
            renderComparison(comparisonMainWrapper);

            // Loop interval
            asyncLoopObject = setInterval(fetchLoopJsonData,refreshVal*1000);
        } else {
          renderAlert(contentWrapper, 'danger', 'Error', 'No JSON or Invalid JSON file on the given endpoint. Please try again with a valid one.', true);
        }
      })
  }

  var fetchLoopJsonData = function (jsonValidUrl) {
    jsonValidUrl = urlFormField.val();
      $.getJSON( jsonValidUrl , function(jsonData) {
        if(jsonData) {
            var dt = new Date();
            var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
            if(!secondLoopJSON && jsonHaveChanged(jsonData, firstLoopJSON) ) {
                if(audioNotification) {
                  snd.play();
                }
                console.log('JSON changed since last pull.');
                console.log('Generating styled diff.');
                secondLoopJSON = jsonData;
                secondLoopHour = time;

                var diffFile = findJsonDifferences(jsonData, firstLoopJSON);
                diffFile = pretty.parse(diffFile);
                $('#jsonDifferencesWrapper').html(diffFile);

                renderComparison(comparisonMainWrapper);
                shakeInterval = setInterval(shakeInfoBox,1000);

                return true;
            } else if ( secondLoopJSON && jsonHaveChanged(jsonData, secondLoopJSON ) ){
                if(audioNotification) {
                  snd.play();
                }
                console.log('JSON changed since last pull.');
                console.log('Generating styled diff.');
                firstLoopJSON = secondLoopJSON;
                firstLoopHour = secondLoopHour;

                secondLoopJSON = jsonData;
                secondLoopHour = time;

                var diffFile = findJsonDifferences(jsonData, firstLoopJSON);
                diffFile = pretty.parse(diffFile);
                $('#jsonDifferencesWrapper').html(diffFile);


                renderComparison(comparisonMainWrapper);
                shakeInterval = setInterval(shakeInfoBox,1000);
            }

            if((secondLoopJSON && jsonHaveChanged(jsonData, secondLoopJSON )) ) {
              console.log('gentoooo1');
              renderComparison(comparisonMainWrapper);
              shakeInterval = setInterval(shakeInfoBox,1000);
            }
        } else {
          renderAlert(contentWrapper, 'danger', 'Error', 'No JSON or Invalid JSON file on the given endpoint. Please try again with a valid one.', true);
        }
      })
  }

  var renderComparison = function(target) {
    if(target.html() !== '') {
      target.html('');
    }
    if(differencesJSON) {
        var comparisonLink = '<dt class="comparisonChanged"><a id="modalComparison" class="whiteLink" data-toggle="modal" href="#differencesModal">JSON changed!<br/>Click for list of changes.</a></dt>';
    } else {
        var comparisonLink = '<dt>Comparison.<br/> No changes.</dt>';
    }

    var jsonComparisonHtml = '<div id="jsonComparisonWrapper" class="col-md-12">' +
    '<div class="timeline"><dl>'+ comparisonLink;
    var firstJson = '';
    var secondJson = '';
    if(firstLoopJSON) {
      var prettyJson1 = pretty.parse(firstLoopJSON);
      firstJson = '<dd class="pos-left clearfix">'+
        '<div class="circ"></div><div class="events"><div class="events-body">'+
        '<h4 class="events-heading">JSON1 ver. @ '+firstLoopHour+'</h4>'+
        '<p>'+prettyJson1+'</p>'+
        '</div></div></dd></dl></div></div>';
    }

    if(secondLoopJSON) {
      var prettyJson2 = pretty.parse(secondLoopJSON);
      secondJson = '<dd class="pos-right"><div class="circ"></div><div class="events"><div class="events-body">'+
      '<h4 class="events-heading">JSON2 ver. @ +'+secondLoopHour+'</h4>'+
      '<p>'+prettyJson2+'</p></div></div></dd>';
    } else {
      secondJson = '<dd class="pos-right"><div class="circ"></div><div class="events"><div class="events-body">'+
      '<h4 class="events-heading">JSON2 ver. @ No changes</h4>'+
      '<p>JSON did not change yet</p></div></div></dd>';
    }

    target.append(jsonComparisonHtml+secondJson+firstJson);
  }

  var jsonHaveChanged = function(jsonData, oldJson) {
    var newJsonString = JSON.stringify(jsonData);
    var oldJsonString = JSON.stringify(oldJson);
    if(newJsonString == oldJsonString) {
      return false;
    }

    return true;
  }

  var findJsonDifferences = function(objectA, objectB) {
      var propertyChanges = [];
      var objectGraphPath = ["this"];
      (function(a, b) {
        if(a.constructor == Array) {
           // BIG assumptions here: That both arrays are same length, that
           // the members of those arrays are _essentially_ the same, and
           // that those array members are in the same order...
           for(var i = 0; i < a.length; i++) {
              objectGraphPath.push("[" + i.toString() + "]");
              arguments.callee(a[i], b[i]);
              objectGraphPath.pop();
           }
        } else if(a.constructor == Object || (a.constructor != Number &&
                  a.constructor != String && a.constructor != Date &&
                  a.constructor != RegExp && a.constructor != Function &&
                  a.constructor != Boolean)) {
           // we can safely assume that the objects have the
           // same property lists, else why compare them?
           for(var property in a) {
              objectGraphPath.push(("." + property));
              if(a[property].constructor != Function) {
                 arguments.callee(a[property], b[property]);
              }
              objectGraphPath.pop();
           }
        } else if(a.constructor != Function) { // filter out functions
           if(a != b) {
              propertyChanges.push({ "Property": objectGraphPath.join(""), "Old JSON": a, "New JSON": b });
           }
        }
      })(objectA, objectB);

      differencesJSON = propertyChanges;
      return propertyChanges;
  }

  var shakeInfoBox = function () {
    $('#modalComparison').shake();
    $('#modalComparison').click(function(){
        clearInterval(shakeInterval);
    });
  }
});


(function ($) {
    $.fn.shake = function (options) {
        // defaults
        var settings = {
            'shakes': 2,
            'distance': 10,
            'duration': 400
        };
        // merge options
        if (options) {
            $.extend(settings, options);
        }
        // make it so
        var pos;
        return this.each(function () {
            $this = $(this);
            // position if necessary
            pos = $this.css('position');
            if (!pos || pos === 'static') {
                $this.css('position', 'relative');
            }
            // shake it
            for (var x = 1; x <= settings.shakes; x++) {
                $this.animate({ left: settings.distance * -1 }, (settings.duration / settings.shakes) / 4)
                    .animate({ left: settings.distance }, (settings.duration / settings.shakes) / 2)
                    .animate({ left: 0 }, (settings.duration / settings.shakes) / 4);
            }
        });
    };
}(jQuery));
