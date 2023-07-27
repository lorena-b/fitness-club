import './style.css';
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { TextField } from "@mui/material";

function ProfileEdit() {
    const [username, setUsername] = useState("");
    const [fName, setFname] = useState("");
    const [lName, setLname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [avatar, setAvatar] = useState("");
    const [avatarPath, setAvatarPath] = useState("");
    const [initialPic, setPic] = useState(null);
    const [errors, setErrors] = useState(null);
    const [authValid, setAuthValid] = useState(true);
    const [firstRun, setFirstRun] = useState(true);
    const [success, setSuccess] = useState(null);

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                setAvatar(fileReader.result);
                setPic(fileReader.result);
                resolve(fileReader.result);
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    useEffect(() => {
        if (!firstRun) { return; }
        setFirstRun(false);
        async function fetchData() {
            if (!window.sessionStorage.getItem("access-token")) {
                setAuthValid(false);
            }
            var initial = await fetch(`${window.baseUrl}/accounts/profile_edit/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${window.sessionStorage.getItem("access-token")}`
                }
            });
            if (!initial.ok) {
                setAuthValid(false);
            } else {
                let initialJson = await initial.json();
                initialJson.first_name !== null ? setFname(initialJson.first_name) : void 0;
                initialJson.last_name !== null ? setLname(initialJson.last_name) : void 0;
                initialJson.email !== null ? setEmail(initialJson.email) : void 0;
                initialJson.phone !== null ? setPhone(initialJson.phone) : void 0;
                initialJson.username !== null ? setUsername(initialJson.username) : void 0;
                initialJson.avatar.length >= 4 && initialJson.avatar.startsWith("data") ? setPic(initialJson.avatar) : void 0;
            }
        }
        fetchData()
    }, [firstRun]);
    const handlePic = (e) => {
        convertToBase64(e.target.files[0]);
        setAvatarPath(e.target.value);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append('username', username);
        fName ? formData.append("first_name", fName) : void 0;
        lName ? formData.append("last_name", lName) : void 0;
        email ? formData.append("email", email) : void 0;
        phone ? formData.append("phone", phone) : void 0;
        avatar ? formData.append("avatar", avatar) : void 0;
        e.preventDefault();
        const resp = await fetch(`${window.baseUrl}/accounts/profile_edit/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${window.sessionStorage.getItem("access-token")}`
            },
            body: formData
        });
        const respjson = await resp.json()
        if (!resp.ok) {
            setSuccess(null);
            if (resp.status === 401) {
                setAuthValid(false);
                setErrors(null);
            } else {
                setErrors(respjson);
            }

        } else {
            setSuccess("Profile edited!");
            setAuthValid(true);
            respjson.avatar !== null ? setPic(respjson.avatar) : void 0;
        }
    }
    if (!authValid) {
        return (
            <div>
                <p>You are not logged in, log in to access profile.</p>
                <Link to={{ pathname: "/login" }} style={{ marginRight: '0.5rem' }}>
                    Go to Login
                </Link>
            </div>
        )
    }
    return (
        <div>
            <h1>Edit Profile</h1>
            <form onSubmit={handleSubmit}>
                <label> Username: {username}</label>
                <br/>
                <br/>
                <TextField id="fname" label="First Name" variant="outlined" value={fName} onChange={(e) => setFname(e.target.value)} />
                <TextField id="lname" label="Last Name" variant="outlined" name="lname" value={lName} onChange={(e) => setLname(e.target.value)} />
                <br/>
                <br/>
                <TextField label="Email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField label="Phone Number" id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <br></br>
                <br></br>
                {initialPic && <div><p>Current Avatar</p><img alt="" src={initialPic} style={{ width: 350, height: 250 }}></img></div>}
                <br/>
                <Button variant="outlined" component="label">
                    Upload new Avatar
                    <input hidden type="file" id="avatar" name="avatar" accept=".jpeg, .png, .jpg" value={avatarPath} onChange={(e) => handlePic(e)}/>
                </Button>
                <br/>
                <br/>
                {errors && <p style={{ color: "red" }}> {errors} </p>}
                {success && <p style={{ color: "green" }}> {success} </p>}
                <Button type="submit" value="Submit">Submit</Button>
            </form>
        </div>
    );
}

export default ProfileEdit;