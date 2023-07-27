import './style_payment.css';
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Typography, Table } from '@mui/material';

function PaymentHistory() {
    const [htmlPlans, setHtmlPlans] = useState([]);
    const [nextHtml, setNextHtml] = useState(null); 
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
                let payments = [];
                for (var key in initialJson){
                    if (key === "Next Payment"){
                      setNextHtml(<tr>
                        <td>{initialJson[key]["datetime"].slice(0, 10)}</td>
                        <td>{initialJson[key]["plan"]}</td>
                        <td>{initialJson[key]["price"]}</td>
                        <td>{initialJson[key]["card_number"]}</td>
                      </tr>)
                    } else {
                      payments.push(
                        <tr>
                        <td>{initialJson[key]["datetime"].slice(0, 10)}</td>
                        <td>{initialJson[key]["plan"]}</td>
                        <td>{initialJson[key]["price"]}</td>
                        <td>{initialJson[key]["card_number"]}</td>
                      </tr>
                      )
                    }
                }
                setHtmlPlans(payments);
            }
        }
    }, [firstRun, htmlPlans]);
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
            <Typography variant="h4" mt={3} mb={1} style={{ padding: 20 }}>
                Payment History:
            </Typography>
            <Typography variant="h6" mt={3} mb={1} style={{ padding: 40 }}>
                Upcoming Payment:
            </Typography>
            <Table style={{ width: "90%", marginLeft: "auto", marginRight: "auto"}}>
              <tr>
                <th>Date of Payment</th>
                <th>Plan</th>
                <th>Price</th>
                <th>Card Number</th>
              </tr>
              {nextHtml}
            </Table> 
            <Typography variant="h6" mt={3} mb={1} style={{ padding: 40 }}>
                Past Payments:
            </Typography>
            <Table style={{ width: "90%", marginLeft: "auto", marginRight: "auto"}}>
              <tr>
                <th>Date of Payment</th>
                <th>Plan</th>
                <th>Price</th>
                <th>Card Number</th>
              </tr>
              {htmlPlans}
            </Table>          
        </div>
    );
}

export default PaymentHistory;