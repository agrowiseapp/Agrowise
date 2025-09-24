// utils.js

// Function to generate a readable ID
function generateReadableId() {
  const alphanumeric =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * alphanumeric.length);
    id += alphanumeric.charAt(randomIndex);
  }
  return id;
}

module.exports = {
  generateReadableId,
};
