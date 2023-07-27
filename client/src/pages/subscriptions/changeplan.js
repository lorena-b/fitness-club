import './style.css';
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@mui/material";

function ChangePlan() {
    const [plan, setPlan] = useState("");
    const [htmlPlans, setHtmlPlans] = useState([]);
    const [errors, setErrors] = useState(null);
    const [authValid, setAuthValid] = useState(true);
    const [firstRun, setFirstRun] = useState(true);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (!firstRun) { return; } else {
          fetchData();
          setFirstRun(false);
        }
        async function fetchData() {
            if (!window.sessionStorage.getItem("access-token")) {
                setAuthValid(false);
            }
            var initial = await fetch(`${window.baseUrl}/subscriptions/get_plans/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${window.sessionStorage.getItem("access-token")}`
                }
            });
            if (!initial.ok) {
                setAuthValid(false);
            } else {
                let initialJson = await initial.json();
                console.log(initialJson);
                let plans = [];
                for (var key in initialJson){
                  if (!(plans.includes([initialJson[key]["name"], initialJson[key]["price"]]))){
                    plans.push(
                      [initialJson[key]["name"], initialJson[key]["price"]]
                    )
                  }
                }
                setHtmlPlans(plans.map((key, index) => 
                <button type="Button" className='plan' key={key} value={plans[index][0]} onClick={(e)=>setPlan(e.target.value)}>Plan: {plans[index][0]}<br></br> Price: {plans[index][1]}</button>));
            }
        }
    }, [firstRun, htmlPlans]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const req = JSON.stringify({plan: plan});
      
        const resp = await fetch(`${window.baseUrl}/subscriptions/change_plan/`, {
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
            setSuccess("Successfully changed plan!")
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
            <h1>Change Plan</h1>
            <form onSubmit={handleSubmit}>
                <h3>Select a new plan</h3>
                {htmlPlans && <div>{htmlPlans}</div>}
                {plan && <p>Selected Plan: {plan}</p>}
                <br></br>
                {errors && <p style={{ color: "red" }}> {errors} </p>}
                {success && <p style={{ color: "green" }}> {success} </p>}
                <Button type="submit" value="Submit" className='submit'>Change plan</Button>
            </form>
        </div>
    );
}

export default ChangePlan;