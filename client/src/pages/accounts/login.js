import './style.css';
import { useState } from 'react';
import { Navigate } from "react-router-dom"
import { Button, Grid, Typography, TextField, Link, Box, Paper } from "@mui/material";
import loginpic from './assets/loginpic.jpg'

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState(null);
    const [response, setResponse] = useState(null);

    const handleSubmit = async (e) => {
        let formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        e.preventDefault();
        const resp = await fetch(`${window.baseUrl}/accounts/login/`, {
            method: 'POST',
            body: formData
        });
        const respjson = await resp.json();
        if (resp.ok){
          // remove previous access token
            window.sessionStorage.setItem("access-token", respjson.access);
            setResponse(respjson);
            setErrors(null);
        } else if (resp.status === 400) {
            setErrors(respjson);
        } else if (resp.status === 401) {
            setErrors(respjson);
        } else {
            setErrors({"detail": "Could not login. Try again."})
        }
    }
    if (response && !errors){
        return (
            <Navigate to="/"/>
        )
    }
    return (
      <div>
        {/* <h1>Login</h1>
        <form onSubmit={handleSubmit}>
            <label> Username:          </label>
            <input type="text" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
            {errors && errors.username && <p style = {{ color: "red" }}> {errors.username} </p>}
            <br></br>
            <label> Password:          </label>
            <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            {errors && errors.password && <p style = {{ color: "red" }}> {errors.password} </p>}
            <br></br>
            {errors && errors.detail && <p style = {{ color: "red" }}> {errors.detail} </p>}
            <Button type="submit" value="Submit">Submit</Button> 
        </form> */}
        <Grid container component="main" sx={{ height: '100vh' }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={4}
          sx={{
            backgroundImage: `url(${loginpic})`,
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} md={8} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h5">
              Login
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
              {errors && errors.username && <p style = {{ color: "red" }}> {errors.username} </p>}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {errors && errors.password && <p style = {{ color: "red" }}> {errors.password} </p>}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Login
              </Button>
              {errors && errors.detail && <p style = {{ color: "red" }}> {errors.detail} </p>}
              <Grid container>
                <Grid item>
                  <Link href="/signup" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
      </div>
    );
  }
  
export default Login;