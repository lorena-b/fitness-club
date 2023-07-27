import { Navigate, Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { Button } from "@mui/material";

function SubCancel() {
  const [cancelled, setCancelled] = useState(0);
  const [errors, setErrors] = useState(null);
  const [authValid, setAuthValid] = useState(true);
  const [firstRun, setFirstRun] = useState(true); 
  useEffect(() => {
    if (!firstRun) { return; } else {
      if (!window.sessionStorage.getItem("access-token")) {
        setAuthValid(false);
      }
      setFirstRun(false);
    }
    }, [firstRun]);

  const sendCancel = async () => {
    const resp = await fetch(`${window.baseUrl}/subscriptions/cancel/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${window.sessionStorage.getItem("access-token")}`
      }
    }); 
    if (resp.ok){
      setCancelled(1);
    } else if (resp.status === 400){
      let js = await resp.json()
      setErrors(js);
    } else if (resp.status === 401){
      setAuthValid(false);
    } else  {
      setErrors("Unable to cancel, try again later.")
    }
  }
  if (cancelled === 1) {
    return (
      <Navigate to='/subscriptions'></Navigate>
    )
  }
  if (!authValid){
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
      <h1>Cancel Subscription</h1>
      <br></br>
      <h3>Are you sure you want to cancel?</h3>
      {errors && <p style={{ color: "red" }}> {errors} </p>}
      <Button value = "" style={{backgroundColor: "#dc143c", color:"white", marginRight: 2}} onClick={sendCancel}> Yes </Button>
      <Button value="" style={{backgroundColor: "#1976d2", color:"white"}} onClick={() => {setCancelled(1)}}> No </Button>
    </div>
  );
}

export default SubCancel;