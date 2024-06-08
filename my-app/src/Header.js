import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import bull from "./images/Bull.png";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);

  useEffect(() => {
    fetch('https://financial-blog-ozfu.onrender.com/profile', {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  function logout() {
    fetch('https://financial-blog-ozfu.onrender.com/logout', {
      credentials: 'include',
      method: 'POST',
    });
    setUserInfo(null);
  }

  const username = userInfo?.username;

  return (
    <header style={{ display: 'flex', alignItems: 'center' }}>
      <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
        <img src={bull} alt="Bull" style={{ width: '40px', height: '40px', marginLeft: '10px' }} />
        Financial-<span style={{ color: '#3B82F6' }}>Blogs</span>
      </Link>
      <nav>
        {username ? (
          <>
            <Link to="/create">Create new post</Link>
            <a onClick={logout}>Logout ({username})</a>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
