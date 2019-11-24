chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action") {
      var firstHref ="this is test";

      console.log(firstHref);
    }
  }
);