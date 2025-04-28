import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "../styles/LoginForm.css";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("Please enter both username and password.");
      setLoading(false);
      if (!username) {
        document.getElementById("username").focus()
      } else {
        document.getElementById("password").focus();
      }
      return;
    }

    try {
      const userRef = doc(db, "users", username.toLowerCase());
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError("Username not found.");
        setLoading(false);
        document.getElementById("username").focus();
        return;
      }

      const { email } = userSnap.data();
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please try again.");
      document.getElementById("password").focus();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <div className="input-group">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoFocus
            id="username"
            className={error && !username ? "input-error" : ""}
          />
        </div>

        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            id="password"
            className={error && !password ? "input-error" : ""}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="login-button" disabled={loading || !username || !password}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
