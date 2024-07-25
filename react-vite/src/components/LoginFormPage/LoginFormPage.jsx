import { useState, useEffect } from "react";
import { thunkLogin } from "../../redux/session";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import { NavLink } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { FaStickyNote } from "react-icons/fa";
import { FaAsterisk } from "react-icons/fa";
import { FaCloud } from "react-icons/fa";

function LoginFormPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const demoLogIn = async () => {
    await dispatch(
      thunkLogin({
        email: "demo@aa.io",
        password: "password",
      })
    );
    navigate("/users/current")
  }

  useEffect(() => {
    console.log("Current session user:", sessionUser);
  }, [sessionUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with", { email, password });

    const serverResponse = await dispatch(
      thunkLogin({
        email,
        password,
      })
    );

    console.log("Server response", serverResponse);

    if (serverResponse.errors) {
      setErrors(serverResponse.errors);
    } else {
      navigate("/users/current");
    }
  };

  if (sessionUser) return <Navigate to="/users/current" replace={true} />;

  return (
    <div className="login-page-wrapper">
      <div className="login-page">
      <FaAsterisk className="asterisk-icon" />
      <div className="login-form-container">
        <FaStickyNote className="sticky-note-icon" />
        <h1 className="login-label">Log in</h1>
        <p className="sub-login-label">to continue to your Everclone account.</p>
        {/* {Object.values(errors).length > 0 &&
          Object.values(errors).map((message, index) => <p key={index} className="error-message">{message}</p>)} */}
        {errors.server && <p className="error-message">{errors.server}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="text"
              value={email}
              onChange={(e) => {setEmail(e.target.value)}}
              required
            />
          </label>
          {errors.email && <p className="error-message">{errors.email}</p>}
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => {setPassword(e.target.value)}}
              required
            />
          </label>
          {errors.password && <p className="error-message">{errors.password}</p>}
          <button type="submit">Continue</button>
          <div className="signup-from-login">
            <p className="signup-from-login-text">Don&apos;t have an account?</p>
            <NavLink to="/signup" className="signup-link">Sign up</NavLink>
            <p className="signup-from-login-text">or</p>
            <NavLink to='/users/current' className="signup-link" onClick={demoLogIn}>Log in as Demo User</NavLink>
          </div>
        </form>
      </div>
      <FaCloud className="cloud-icon" />
      </div>
    </div>
  );
}

export default LoginFormPage;
