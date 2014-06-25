module.exports = function sniffXSRFToken(response, page) {
  console.log('Sniffing XSRF token...');

  var authHeader = response.headers.filter(function(header) {
    return header.name === 'X-Gerrit-Auth';
  })[0];

  // console.log(JSON.stringify(authHeader || {}));

  if (authHeader) {
    return authHeader.value;
  }

  var output = page.evaluate(function() {
    if ('gerrit_hostpagedata' in window) {
      try {
        return window.gerrit_hostpagedata.xGerritAuth;
      }
      catch (e) {
        return {
          error: e
        };
      }
    }
  });

  if (output && output.error) {
    console.log('\tError:', JSON.stringify(output.error));
    return undefined;
  }
  else if (!!output) {
    console.log('\tFound:', output);
    return output;
  }
  else {
    return output;
  }
}