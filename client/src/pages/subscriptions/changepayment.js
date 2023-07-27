import './style.css';
import { useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import {TextField} from '@mui/material';

function ChangePayment() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState(""); 
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState(null);
  const [authValid, setAuthValid] = useState(true);
  const [success, setSuccess] = useState(null);
  const handleSubmit = async (e) => {
      e.preventDefault();
      const req = JSON.stringify({card_details: {card_number: cardNumber, cvv: cvv, expiry_date: expiryDate}});
    
      const resp = await fetch(`${window.baseUrl}/subscriptions/change_payment/`, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${window.sessionStorage.getItem("access-token")}`,
              'Content-Type': 'application/json'
          },
          body: req
      });
      const respjson = await resp.json()
      if (!resp.ok) {
          if (resp.status === 401) {
              setAuthValid(false);
              setErrors(null);
              setSuccess(null);
          } else {
              setErrors(respjson);
              setSuccess(null);
          }

      } else {
          setErrors(null);
          setAuthValid(true);
          setSuccess("Successfully changed payment!")
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
          <h1>Change Payment</h1>
          <form onSubmit={handleSubmit}>
              <TextField label="Card Number" type="text" id="cardno" name="cardno" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
              <TextField label="Expiry MM/YY" type="text" id="expDate" name="expDate" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
              <br></br>
              <br/>
              <TextField label="CVV" type="text" id="cvv" name="cvv" value={cvv} onChange={(e) => setCvv(e.target.value)} />
              <br></br>
              {errors && <p style={{ color: "red" }}> {errors} </p>}
              {success && <p style={{ color: "green" }}> {success} </p>}
                <br></br>
              <Button type="submit" value="Submit" className='submit'>Change Payment</Button>
          </form>
      </div>
  );
}
    
export default ChangePayment;