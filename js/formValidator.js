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

  $('#toggleAjax').click(function(e){
      urlText = urlFormField.val();
      refreshVal = refreshFormField.val();
      var urlIsValid = /^([a-z]([a-z]|\d|\+|-|\.)*):(\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?((\[(|(v[\da-f]{1,}\.(([a-z]|\d|-|\.|_|~)|[!\$&'\(\)\*\+,;=]|:)+))\])|((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=])*)(:\d*)?)(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*|(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)|((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)){0})(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(urlText);
      if(!urlIsValid) {
          $(this).prop('checked', 'false');
          renderAlert(contentWrapper, 'danger', 'Error', 'Bad URL or no URL given. Please fix that.', true);
          return false;
      }

      if(refreshVal == '') {
        refreshFormField.val('60');
        refreshVal = refreshFormField.val();
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
            } else if(!secondLoopJSON) {
                secondLoopJSON = jsonData;
                secondLoopHour = time;
            } else {
                firstLoopJSON = secondLoopJSON;
                firstLoopHour = secondLoopHour;
                secondLoopJSON = jsonData;
                secondLoopHour = time;
            }
            renderAlert(contentWrapper, 'success', 'Success', 'Found a valid JSON file, processing ...', true);
            renderComparison(comparisonMainWrapper);
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
            if(!firstLoopJSON) {
                firstLoopJSON = jsonData;
                firstLoopHour = time;
            } else if(!secondLoopJSON) {
                secondLoopJSON = jsonData;
                secondLoopHour = time;
            } else {
                firstLoopJSON = secondLoopJSON;
                firstLoopHour = secondLoopHour;
                secondLoopJSON = jsonData;
                secondLoopHour = time;
            }
            renderComparison(comparisonMainWrapper);
        } else {
          renderAlert(contentWrapper, 'danger', 'Error', 'No JSON or Invalid JSON file on the given endpoint. Please try again with a valid one.', true);
        }
      })
  }

  var renderComparison = function(target) {
    if(target.html() !== '') {
      target.html('');
    }
    var jsonComparisonHtml = '<div id="jsonComparisonWrapper" class="col-md-12">' +
    '<div class="timeline">'+
    '<dl><dt>Comparison</dt>';
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
    }

    target.append(jsonComparisonHtml+secondJson+firstJson);
  }


  var pretty = {
		"parse": function (member) {
			return this[(member == undefined) ? 'null' : member.constructor.name.toLowerCase()](member);
		},

		"null": function (value) {
			return this['value']('null', 'null');
		},
		"array": function (value) {
			var results = '';
			for (var x=0; x < value.length; x++) {
				results += '<li>' + this['parse'](value[x]) + '</li>';
			}
			return '[ ' + ((results.length > 0) ? '<ul class="array">' + results + '</ul>' : '') + ' ]';
		},
		"object": function (value) {
			var results = '';
			for (member in value) {
				results += '<li>' + this['value']('object', member) + ': ' + this['parse'](value[member]) + '</li>';
			}
			return '{ ' + ((results.length > 0) ? '<ul class="object">' + results + '</ul>' : '') + ' }';
		},
		"number": function (value) {
			return this['value']('number', value);
		},
		"string": function (value) {
			return this['value']('string', value);
		},
		"boolean": function (value) {
			return this['value']('boolean', value);
		},

		"value": function (type, value) {
			if (/^(http|https):\/\/[^\s]+$/.test(value)) {
				return this['value'](type, '<a href="' + value + '" target="_blank">' + value + '</a>');
			}
			return '<span class="' + type + '">' + value + '</span>';
		}
	};

	var parse = {
		"error": function (error) {
			return '<h1>Unable to parse JSON.</h1><p><h2>Error Message:</h2><textarea>' + error + '</textarea><br /><br /><h2>Response:</h2><textarea>' + document.body.innerText + '</textarea></p>';
		}
	}

});
