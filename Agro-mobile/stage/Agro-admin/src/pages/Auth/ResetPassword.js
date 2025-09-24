import React, { useState } from "react";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [isUserValid, setIsUserValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [validationCode, setValidationCode] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setIsUserValid(false); // Reset user validity when email changes
  };

  const handleCheckEmail = async () => {
    const apiUrl = ""; // Replace with your actual API endpoint to check email validity

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // Pass the email in the request body
      });

      const responseData = await response.json();

      if (response.ok && responseData.isValidUser) {
        setIsUserValid(true);
        setMessage("Email is valid. Please enter your new password.");
      } else {
        setMessage("Email not found or not valid.");
      }
    } catch (error) {
      setIsUserValid(true);
      setMessage("An error occurred. Please try again.");
    }
  };

  const handleResetForm = () => {
    setEmail("");
    setIsUserValid(false);
    setPassword("");
    setConfirmPassword("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (
      password.length < 6 ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password)
    ) {
      setMessage(
        "Password must have at least 6 characters, one capital letter, and one number."
      );
      return;
    }

    // Add your password update logic here
  };

  // Styles
  const containerStyle = {
    backgroundColor: "white",
    width: "400px",
    margin: "30px auto 0 auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const titleStyle = {
    fontSize: "24px",
    marginBottom: "20px",
  };

  const messageStyle = {
    marginTop: "10px",
    color: "#f44336",
  };
  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
  };

  const buttonStyle = {
    padding: "10px 20px",
    width: "100%",
    marginBottom: 10,
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginRight: "10px",
  };

  const buttonStyleReset = {
    padding: "10px 20px",
    width: "100%",
    marginBottom: 10,
    backgroundColor: "gray",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginRight: "10px",
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Επαναφορά Κωδικού</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <input
            style={inputStyle}
            type="email"
            placeholder="Email χρήστη"
            value={email}
            onChange={handleEmailChange}
            disabled={isUserValid} // Disable email input if user is valid
          />
        </div>

        {!isUserValid && (
          <>
            <button
              type="button"
              onClick={handleCheckEmail}
              style={buttonStyle}
            >
              Επιβεβαίωση
            </button>

            <p>
              Πατώντας "Επιβεβαίωση" θα αποσταλεί στο Email ένας 6-ψήφιος
              κωδικός απαραίτητος για την επαναφορά.
            </p>
          </>
        )}
        {isUserValid && (
          <>
            <div style={{ margin: "20px 0px 10px 0" }}>
              <input
                style={inputStyle}
                type="password"
                placeholder="Νέος κωδικός"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                style={inputStyle}
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div style={{ margin: "0px 0px 20px 0" }}>
              <input
                style={inputStyle}
                type="text"
                placeholder="6-ψήφιος κωδικός από το email"
                value={validationCode}
                disabled={isUserValid} // Disable email input if user is valid
                onChange={(e) => setValidationCode(e.target.value)}
              />
            </div>

            <button type="submit" style={buttonStyle}>
              Επαναφορά Κωδικού
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              style={buttonStyleReset}
            >
              Ακύρωση
            </button>
          </>
        )}
      </form>
      <p>{message}</p>
    </div>
  );
}

export default ResetPassword;
