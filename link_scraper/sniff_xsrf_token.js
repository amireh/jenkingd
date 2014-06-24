module.exports = function sniffXSRFToken(response) {
  console.log('Sniffing XSRF token...');

  return page.evaluate(function() {
    try {
      return gerrit_hostpagedata.xGerritAuth;
    }
    catch (e) {
      return undefined;
    }
  });
}