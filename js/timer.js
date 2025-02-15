torpedo.timerInterval = null;

/**
 * countdown function for the temporal deactivation of URLs
 */

function countdown(time, state) {
  if (torpedo.target.classList.contains("torpedoTimerFinished")) time = 0;

  var tooltip = torpedo.tooltip;

  $(tooltip.find("#torpedoTimer")[0]).show();

  /**
   * assert time to tooltip text
   */
  function showTime() {
    try {
      tooltip.find("#torpedoTimer")[0].remove();
      $(
        '<p id="torpedoTimer">' +
          chrome.i18n.getMessage("verbleibendeZeit", "" + time) +
          "</p>"
      ).appendTo(tooltip);
    } catch (e) {}
  }

  // deactivate link (on page and on tooltip)
  const eventTypes = ["click", "contextmenu", "mouseup", "mousedown"];
  $(torpedo.target).addClass("torpedoTimerShowing");
  eventTypes.forEach(function (eventType) {
    $(torpedo.target).unbind(eventType);
  });
  const onWebsite = new URL(window.location.href);
  if (onWebsite.hostname === "owa.kit.edu") {
    $(
      "div._rp_U4.ms-font-weight-regular.ms-font-color-neutralDark.rpHighlightAllClass.rpHighlightBodyClass"
    ).unbind("click");
    // document.removeEventListener('click', getEventListeners(document).click[0].listener)
    /* 
      once script from owa can be used to remove eventlistener properly - insert here
    */
  }
  eventTypes.forEach(function (eventType) {
    $(torpedo.target).on(eventType, function (event) {
      event.preventDefault();
      return false;
    });
  });

  try {
    $(tooltip.find("#torpedoURL")[0]).unbind("click");
    $(tooltip.find("#torpedoURL")[0]).bind("click", function (event) {
      event.preventDefault();
      return false;
    });
  } catch (e) {}

  showTime();
  if (time > 0) time--;

  var timerInterval = setInterval(function timer() {
    showTime();
    if (time == 0) {
      clearInterval(timerInterval);
      if (!isRedirect(torpedo.domain) && state != "T4" && state != "T4a") {
        $(torpedo.target).addClass("torpedoTimerFinished");
      }
      // reactivate link
      eventTypes.forEach(function (eventType) {
        $(torpedo.target).unbind(eventType);
      });

      $(torpedo.target).bind("click", function (event) {
        processClick();
      });

      try {
        $(tooltip.find("#torpedoURL")[0]).unbind("click");
        $(tooltip.find("#torpedoURL")[0]).bind("click", function (event) {
          event.preventDefault();
          chrome.storage.sync.get(null, function (r) {
            if (r.privacyModeActivated) {
              chrome.runtime.sendMessage({
                name: "open",
                url: torpedo.oldUrl,
              });
            } else {
              chrome.runtime.sendMessage({ name: "open", url: torpedo.url });
            }
          });
          processClick();
          return false;
        });
      } catch (e) {}
    } else {
      --time;
    }
  }, 1000);

  torpedo.timerInterval = timerInterval;
}
