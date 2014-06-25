module.exports = function sniffXSRFToken(response, page) {
  console.log('Sniffing XSRF token...');

  var authHeader = response.headers.filter(function(header) {
    return header.name === 'X-Gerrit-Auth';
  })[0];

  if (authHeader) {
    return authHeader.value;
  }

  return page.evaluate(function() {
    if ('gerrit_hostpagedata' in window) {
      try {
        return window.gerrit_hostpagedata.xGerritAuth;
      }
      catch (e) {
        return undefined;
      }
    }
  });
}