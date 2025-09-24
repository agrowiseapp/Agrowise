import React from "react";
import moment from "moment";

function ReturnMonth({ dateGiven }) {
  // Parse the date string using Moment.js
  const date = moment(dateGiven);

  // Format the date as "01 June 2023"
  const formattedDate = date.format("DD-MMMM-YYYY");
  const day = formattedDate.split("-")[0];
  const month = formattedDate.split("-")[1];
  const year = formattedDate.split("-")[2];

  //console.log("Formated Month :", year);
  let dateReturned = null;

  switch (month) {
    case "January":
      dateReturned = day + " Ιανουαρίου " + year;
      break;
    case "February":
      dateReturned = day + " Φεβρουαρίου " + year;
      break;
    case "March":
      dateReturned = day + " Μαρτίου " + year;
      break;
    case "April":
      dateReturned = day + " Απριλίου " + year;
      break;
    case "May":
      dateReturned = day + " Μαίου " + year;
      break;
    case "June":
      dateReturned = day + " Ιουνίου " + year;
      break;
    case "July":
      dateReturned = day + " Ιουλίου " + year;
      break;
    case "August":
      dateReturned = day + " Αυγούστου " + year;
      break;
    case "September":
      dateReturned = day + " Σεπτεμβρίου " + year;
      break;
    case "October":
      dateReturned = day + " Οκτωβρίου " + year;
      break;
    case "November":
      dateReturned = day + " Νοεμβρίου " + year;
      break;
    case "December":
      dateReturned = day + " Δεκεμβρίου " + year;
      break;
    default:
      break;
  }

  //console.log("REturned date :", dateReturned);

  return dateReturned;
}

export default ReturnMonth;
