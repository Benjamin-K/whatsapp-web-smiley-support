/**
 * @author : Benjamin Klix
 */
(function(){

  var config = {
    icons: {},
    additionalAttributes: 'draggable="false" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"'
  };

  var helpers = {
    loadConfig: function(config) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          config[config] = JSON.parse(xhr.response);
        }
      };
      xhr.open("GET", chrome.extension.getURL('/config/'+config+'.json'), true);
      xhr.send();
    },
    focusEnd: function(element) {
      element.focus();

      var node = document.createElement('span');

      element.appendChild(node);

      helpers.range = document.createRange();
      helpers.range.selectNode(node);
      helpers.selection.removeAllRanges();
      helpers.selection.addRange(range);

      element.removeChild(node);
    },
    selection: window.getSelection(),
    range: null
  };

  document.addEventListener('keyup', function(e) {
    if (e.target.isContentEditable) {
      var message = e.target.innerHTML;

      for (var string in icons) {
        if (message.length - string.length > -1 &&
            message.lastIndexOf(string) === message.length - string.length) {
          e.target.innerHTML = message.substr(0, message.length - string.length) +
            '<img alt="'+icons[string].alt+'" class="'+icons[string]['class']+'" '+
                  config.additionalAttributes+'>';
          helpers.focusEnd(e.target);
          break;
        }
      }
    }
  });

  helpers.loadConfig('icons');

})();
