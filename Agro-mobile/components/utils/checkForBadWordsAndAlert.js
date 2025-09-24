import { Alert } from "react-native";

const checkForBadWordsAndAlert = (text) => {
  const badWordsList = [
    "Cumbubble",
    "F*ck",
    "F*ck you",
    "Shitbag",
    "Shit",
    "Piss off",
    "Asshole",
    "Dickweed",
    "C*nt",
    "Son of a bitch",
    "F*ck trumpet",
    "Bastard",
    "Bitch",
    "Damn",
    "Bollocks",
    "Bugger",
    "Cocknose",
    "Bloody hell",
    "Knobhead",
    "Choad",
    "Bitchtits",
    "Crikey",
    "Rubbish",
    "Pissflaps",
    "Shag",
    "Wanker",
    "Talking the piss",
    "Twat",
    "Arsebadger",
    "Jizzcock",
    "Cumdumpster",
    "Shitmagnet",
    "Scrote",
    "Twatwaffle",
    "Thundercunt",
    "Dickhead",
    "Shitpouch",
    "Jizzstain",
    "Nonce",
    "Pisskidney",
    "Wazzock",
    "Cumwipe",
    "Fanny",
    "Bellend",
    "Pisswizard",
    "Knobjockey",
    "Cuntpuddle",
    "Dickweasel",
    "Quim",
    "Bawbag",
    "Fuckwit",
    "Tosspot",
    "Cockwomble",
    "Twat face",
    "Cack",
    "Flange",
    "Clunge",
    "Dickfucker",
    "Fannyflaps",
    "Wankface",
    "Shithouse",
    "Gobshite",
    "Jizzbreath",
    "Todger",
    "Nutsack",
    "Μαλάκας",
    "Μαλάκας",
  ];

  console.log("Text i am filtering : ", text);
  const lowercasedText = text.toLowerCase(); // Convert input text to lowercase
  const lowercasedBadWordsList = badWordsList.map((word) => word.toLowerCase());

  const words = lowercasedText.split(" ");
  const hasBadWords = words.some((word) =>
    lowercasedBadWordsList.includes(word)
  );

  if (hasBadWords) {
    return true;
  } else {
    return false;
  }
};

export default checkForBadWordsAndAlert;
