import React from "react";
import moment from "moment";
import "moment/locale/el";

function DateSinceNow({ date }) {
  // Define custom locale configuration for Greek
  moment.updateLocale("el", {
    relativeTime: {
      future: "σε %s",
      past: "πριν %s",
      s: "δευτερόλεπτα",
      ss: "%d δευτερόλεπτα",
      m: "ένα λεπτό",
      mm: "%d λεπτά",
      h: "μία ώρα",
      hh: "%d ώρες",
      d: "μία μέρα",
      dd: "%d μέρες",
      M: "ένας μήνας",
      MM: "%d μήνες",
      y: "ένας χρόνος",
      yy: "%d χρόνια",
    },
  });
  moment.locale("el"); // Set the locale to Greek
  const newdate = moment(date);

  const timePassed = newdate.fromNow();

  return timePassed;
}

export default DateSinceNow;
