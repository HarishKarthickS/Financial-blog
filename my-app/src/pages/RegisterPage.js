import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function register(ev) {
    ev.preventDefault();
    const response = await fetch('http://localhost:4000/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 200) {
      toast.success('Registration successful');
    } else {
      toast.error('Registration failed');
    }
  }

  return (
    <div className="register-container">
      <form className="register" onSubmit={register}>
        <h1>Register</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
        />
        <button style={{background:"#3B82F6"}}>Register</button>
      </form>
    </div>
  );
}
