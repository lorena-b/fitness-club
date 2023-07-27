import './style.css';
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@mui/material";

function ManageSubscriptions() {
    const [plan, setPlan] = useState(""); 
    const [upcomingPayment, setUpcomingPayment] = useState(null)
    const [authValid, setAuthValid] = useState(true);
    const [firstRun, setFirstRun] = useState(true);

    useEffect(() => {
      if (!firstRun) { return; } else {
        fetchData();
        setFirstRun(false);
      }
      async function fetchData() {
          if (!window.sessionStorage.getItem("access-token")) {
              setAuthValid(false);
              return;
          }
          var initial = await fetch(`${window.baseUrl}/subscriptions/payment_history/`, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${window.sessionStorage.getItem("access-token")}`
              }
          });
          if (!initial.ok) {
              setAuthValid(false);
          } else {
              let initialJson = await initial.json();
              for (var key in initialJson){
                  if (key === "Next Payment"){
                    setUpcomingPayment(<tr>
                      <th>{initialJson[key]["datetime"].slice(0,10)}</th>
                      <th>{initialJson[key]["plan"]}</th>
                      <th>{initialJson[key]["price"]}</th>
                      <th>{initialJson[key]["card_number"]}</th>
                    </tr>);
                    setPlan(initialJson[key]['plan']);
                    return;
                  }
              }
          }
      }
  }, [firstRun]);
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
            <h1>Manage Subscription</h1>
            
            <div><h3>Current Plan: <medium style={{fontWeight: "normal"}}>{plan}</medium></h3></div>
            <Link to="/subscriptions/changeplan" style={{ marginRight: '0.5rem', textDecoration: 'none'}}>
              <Button type="Button" variant="contained">Change Plan</Button>
            </Link>
            <br></br>
            <br></br>
            <Link to="/subscriptions/changepayment" style={{ marginRight: '0.5rem', textDecoration: 'none'}}>
              <Button variant="contained" type="Button" className='optionButton'>Change Payment Method</Button>
            </Link> 
            <Link to="/subscriptions/paymenthistory" style={{ marginRight: '0.5rem', textDecoration: 'none'}}>
              <Button variant="contained" type="Button" className='optionButton'>View all payment history</Button>
            </Link>
            <Link to="/subscriptions/subcancel" style={{ marginRight: '0.5rem', textDecoration: 'none'}}>
              <Button variant="contained" type="Button" className='optionButton'>Cancel your subscription</Button>
            </Link>
            <br></br>
            <h3>Upcoming Payment Details</h3>
            <table>
                <tr>
                  <th>Date of Payment</th>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Card Number</th>
                </tr>
                {upcomingPayment}
              </table>
            <br></br>
        </div>
    );
}

export default ManageSubscriptions;