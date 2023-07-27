import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

function TimeCard(props) {
    const studioid = props.time[1];
    const classid = props.time[2];
    props = props.time[0];
    const navigate = useNavigate();

    const startDateTime = new Date(props.start);
    const endDateTime= new Date(props.end);
    const startHour = (startDateTime.getHours() + 5) % 24;
    const startMinutes = startDateTime.getMinutes();
    const endHour = (endDateTime.getHours() + 5) % 24;
    const endMinutes = endDateTime.getMinutes();

    // if the minutes are less than 10, add a 0 in front of them
    // so that the time is displayed as 10:05 instead of 10:5
    const startMinutesString = startMinutes < 10 ? `0${startMinutes}` : startMinutes;
    const endMinutesString = endMinutes < 10 ? `0${endMinutes}` : endMinutes;

    const dayOfWeek = startDateTime.getDay();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayNum = startDateTime.getDate();
    const month = startDateTime.getMonth();
    const year = startDateTime.getFullYear();

    let bookingStatus = props.booked ? "Unenrol" : "Enrol";
    let spotsLeft = props.slots_left;
    const spotsLeftColor = props.booked ? "red" : "green";

    const handleTimeClick = () => {
        // check if user is logged in
        if (!window.sessionStorage.getItem("access-token")) {
            // navigate to login page
            navigate("/login");
            return;
        }

        // check if the user has booked the time. choose the endpoint accordingly
        if (bookingStatus === "Enrol") {
            fetch(`/studios/${studioid}/classes/${classid}/times/${props.id}/enrol/`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${window.sessionStorage.getItem("access-token")}`
                }
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    if (data === "Enrolment failed: Not subscribed"){
                        alert("You do not have an active subscription. Please subscribe to a plan to enrol in classes.");
                    } else {
                        window.location.reload();
                    }
                });
        } else {
            fetch(`/studios/${studioid}/classes/${classid}/times/${props.id}/unenrol/`,
                {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${window.sessionStorage.getItem("access-token")}`
                    }
                })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    window.location.reload();
                });
        }
    }
    return (
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
            <CardActions>
                <Button size="small" onClick={() => handleTimeClick(props.id)}>{bookingStatus}</Button>
            </CardActions>
            <Typography sx={{ mb: 0 }} color="text.secondary">
                {daysOfWeek[dayOfWeek]} {dayNum} / {month + 1} / {year}
            </Typography>
            <Typography variant="h6" component="div">
                {startHour}:{startMinutesString} - {endHour}:{endMinutesString}
            </Typography>
            <Typography sx={{ mb: 1.5 }} color={spotsLeftColor}>
                Spots Left: {spotsLeft} {props.booked ? "(Booked)" : ""}
            </Typography>
            </CardContent>
        </Card>
    );

        
}


export default function SingleClassInfo() {
    const { id, classid } = useParams();
    const [classInfo, setClassInfo] = useState(null);
    const [classTimes, setClassTimes] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            if (!window.sessionStorage.getItem("access-token")) {
                // fetch(`/studios/${id}/classes/${classid}/times`)
                //     .then((res) => res.json())
                //     .then((data) => {
                //         console.log("class times", data);
                //         if (!data.code){
                //             setClassTimes(data);
                //         }
                //     });
                navigate("/login");
                return;
            } 

            else {
                fetch(`/studios/${id}/classes/${classid}/times`, {
                    headers: {
                        'Authorization': `Bearer ${window.sessionStorage.getItem("access-token")}`
                    }
                })
                    .then((res) => res.json())
                    .then((data) => {
                        setClassTimes(data);
                        console.log("class times", data);
                    }
                );
            }
        }
        if (!classTimes) {
            fetchData();
        }
    }, [id, classid, classTimes, navigate]);

    useEffect(() => {
        fetch(`/studios/${id}/classes/${classid}`)
            .then((res) => res.json())
            .then((data) => {
                setClassInfo(data);
            });
    }, [id, classid]);

    // wait for the class info to be fetched before displaying it
    if (classInfo === null) {
        return <div>Loading...</div>;
    }

    const handleEnrolAll = () => {
        if (!window.sessionStorage.getItem("access-token")) {
            // navigate to login page
            navigate("/login");
        } else {
        
        fetch(`/studios/${id}/classes/${classid}/times/enrol/`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${window.sessionStorage.getItem("access-token")}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                if (data === "Enrolment failed: Not subscribed"){
                    alert("You do not have an active subscription. Please subscribe to a plan to enrol in classes.");
                } else {
                window.location.reload();
                }
            });
        }
    }

    const handleUnenrolAll = () => {
        // make a post upon click to /studios/${id}/classes/${classid}/times/unenrol
        if (!window.sessionStorage.getItem("access-token")) {
            // navigate to login page
            navigate("/login");
        } else {
        fetch(`/studios/${id}/classes/${classid}/times/unenrol/`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${window.sessionStorage.getItem("access-token")}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                window.location.reload();
            });
        }
    }


    // return a list of timecards for each time in the class.
    // the top should contain the class info
    // there should be an enrol all button at the top
    const className = classInfo ? classInfo.name : "Loading...";
    const classDescription = classInfo ? classInfo.description : "Loading...";
    const classCoach = classInfo ? classInfo.coach : "Loading...";
    return (
        <div>
            <h1>{className}</h1>
            <p>{classDescription}</p>
            <p>Coach {classCoach}</p>
            {/* add a button to enrol all and one to unenroll all.
            make the first one blue and second one red */}
            <Button variant="contained" onClick={() => handleEnrolAll()}>Enrol in All</Button>
            <br/>
            <br/>
            <Button variant="contained" color="secondary" onClick={() => handleUnenrolAll()}>Unenrol from All</Button>
            <br/>
            <br/>
            <Grid container spacing={{ xs: 1, md: 2 }} columns={{ xs: 4, sm: 8, md: 12 }} sx={{marginTop: 10}}>
            {classTimes && classTimes.map((time) => (
                <Grid item xs={2} sm={4} md={4}>
                    <TimeCard time={[time, id, classid]} />
                </Grid>
            ))}
        </Grid>
        </div>
    );
}
