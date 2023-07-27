import './style.css';
import { useState } from 'react';
import { Navigate } from "react-router-dom";
import { Button, Typography, Box, Grid, Link, TextField, Container } from "@mui/material";

function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fName, setFname] = useState("");
    const [lName, setLname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [avatar, setAvatar] = useState("");
    const [errors, setErrors] = useState(null);
    const [response, setResponse] = useState(null);
    const [avatarPath, setAvatarPath] = useState("");


    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                setAvatar(fileReader.result);
                resolve(fileReader.result);
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    const handlePic = (e) => {
        convertToBase64(e.target.files[0]);
        setAvatarPath(e.target.value);
    }

    const handleSubmit = async (e) => {
        let formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        fName ? formData.append("first_name", fName): void 0;
        lName ? formData.append("last_name", lName): void 0;
        email ? formData.append("email", email): void 0;
        phone ? formData.append("phone", phone): void 0;
        avatar ? formData.append("avatar", avatar): void 0;
        e.preventDefault();
        const resp = await fetch(`${window.baseUrl}/accounts/signup/`, {
            method: 'POST',
            body: formData
        });
        const respjson = await resp.json()
        if (resp.ok){
            setResponse(respjson);
            setErrors(null);
        } else {
            setErrors(respjson);
        }
        console.log(resp);
    }
    if (response && !errors){
        return (
            <Navigate to="/login"/>
        )
    }
    return (
      <div>
        {/* <form onSubmit={handleSubmit}>
            <label> Username:          </label>
            <input type="text" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
            <br></br>
            <label> Password:          </label>
            <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <br></br>
            <label>First name (Optional):          </label>
            <input type="text" id="fname" name="fname" value={fName} onChange={(e) => setFname(e.target.value)}/>
            <br></br>
            <label> Last Name (Optional):          </label>
            <input type="text" id="lname" name="lname" value={lName} onChange={(e) => setLname(e.target.value)}/>
            <br></br>
            <br></br>
            <label> Email (Optional):          </label>
            <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            <br></br>
            <br></br>
            <label> Phone Number (Optional):          </label>
            <input type="text" id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)}/>
            <br></br>
            <br></br>
            <label> Avatar (Optional):          </label>
            <input type="file" id="avatar" name="avatar" value={avatarPath} onChange={(e) => handlePic(e)}/>
            <br></br>
            <br></br>
            {errors && <p style = {{ color: "red" }}> {errors} </p>}
            <Button type="submit" value="Submit">Submit</Button> 
        </form> */}
        <Container component="main" maxWidth="xs">
            <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
            >
            <Typography component="h1" variant="h5">
                Sign up
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                    name="username"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    value={username}
                    autoFocus
                    onChange={(e) => setUsername(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    value={password}
                    autoComplete="new-password"
                    onChange={(e) => setPassword(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                    autoComplete="given-name"
                    name="fname"
                    fullWidth
                    id="fname"
                    label="First Name"
                    value={fName}
                    onChange={(e) => setFname(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                    fullWidth
                    id="lname"
                    label="Last Name"
                    name="lname"
                    autoComplete="family-name"
                    value={lName}
                    onChange={(e) => setLname(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                    fullWidth
                    id="phone"
                    label="Phone Number"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        Upload an avatar (optional)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                        {avatarPath}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Button variant="outlined" component="label">
                        Upload
                        <input hidden type="file" id="avatar" name="avatar" value={avatarPath} onChange={(e) => handlePic(e)}/>
                    </Button>
                </Grid>
                </Grid>
                <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                >
                Sign Up
                </Button>
                {errors && <p style = {{ color: "red" }}> {errors} </p>}
                <Grid container justifyContent="flex-end">
                <Grid item>
                    <Link href="/login" variant="body2">
                    Already have an account? Sign in
                    </Link>
                </Grid>
                </Grid>
            </Box>
            </Box>
        </Container>
      </div>
    );
  }
  
export default Signup;