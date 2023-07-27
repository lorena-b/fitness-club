import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Grid } from "@mui/material";

export default function ClassHistory() {
    const [classHistory, setClassHistory] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!window.sessionStorage.getItem("access-token")) {
            // navigate to login page
            navigate("/login");
        } else if (!classHistory) {
            fetch(`/accounts/classes`, {
                headers: {
                    'Authorization': `Bearer ${window.sessionStorage.getItem("access-token")}`
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    setClassHistory(data);
                    
                    console.log(data);
                }
            );

        }
    }, [navigate, classHistory]);

    // wait for data to be fetched
    if (classHistory === null) {
        return <div>Loading...</div>;
    }

    // using material-ui table, have two tables, one for past classes, one for future classes
    // Each cell has class_name, start_time, end_time.
    const rows= []
    if (classHistory.History.length > 0) {
        for (let i = 0; i < classHistory.History.length; i++) {
            rows.push({
                class_name: classHistory.History[i].class_name,
                // make the times look like 2021-10-10 10:00:00
                start_time: classHistory.History[i].start_time.slice(0, 10) + " " + classHistory.History[i].start_time.slice(11, 19),
                end_time: classHistory.History[i].end_time.slice(0, 10) + " " + classHistory.History[i].end_time.slice(11, 19),
            })
        }
    }

    const futureRows = []
    if (classHistory.Upcoming.length > 0) {
        for (let i = 0; i < classHistory.Upcoming.length; i++) {
            futureRows.push({
                class_name: classHistory.Upcoming[i].class_name,
                // make the times look like 2021-10-10 10:00:00
                start_time: classHistory.Upcoming[i].start_time.slice(0, 10) + " " + classHistory.Upcoming[i].start_time.slice(11, 19),
                end_time: classHistory.Upcoming[i].end_time.slice(0, 10) + " " + classHistory.Upcoming[i].end_time.slice(11, 19),
            })
        }
    }
    

    return (
        // we want to display the two tables beside each other
        // so we wrap them in a div
        // and use css to make them side by side
        <div>
            <h1>Class History</h1>
            <Grid container spacing={2}>
                <Grid item sm={6}>
                    <h2>Past Classes</h2>
                    <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Class Name</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Start Time</TableCell>
                                    <TableCell align="right">End Time</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.class_name}>
                                        <TableCell component="th" scope="row">
                                            {row.class_name}
                                        </TableCell>
                                        <TableCell align="right">{row.start_time.slice(0, 10)}</TableCell>
                                        <TableCell align="right">{row.start_time.slice(12,100)}</TableCell>
                                        <TableCell align="right">{row.end_time.slice(12,100)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item sm={6}>
            <h2>Upcoming Classes</h2>
            <TableContainer component={Paper}>
                <Table  aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Class Name</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Start Time</TableCell>
                            <TableCell align="right">End Time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {futureRows.map((row) => (
                            <TableRow key={row.class_name}>
                                <TableCell component="th" scope="row">
                                    {row.class_name}
                                </TableCell>
                                <TableCell align="right">{row.start_time.slice(0, 10)}</TableCell>
                                <TableCell align="right">{row.start_time.slice(11,100)}</TableCell>
                                <TableCell align="right">{row.end_time.slice(11,100)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
            </Grid>
        </div>
    );

}