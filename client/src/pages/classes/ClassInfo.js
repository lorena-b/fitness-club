import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Box } from "@mui/system";
import TextField from '@mui/material/TextField';

// function for creating a card of info for each class using Material UI
function ClassCard(props) {
    const navigate = useNavigate();
    const handleClassClick = () => {
        console.log(props.class);
        navigate(`/studios/${props.classObj.studio_id}/classes/${props.classObj.id}/info`);
    }
return (
    <Card sx={{ minWidth: 200 }}>
        <CardContent>
        <CardActions>
            {/* have a button that says "View Times" extend across the top of the card */}
            <Button size="large" onClick={handleClassClick}>View Times</Button>
        </CardActions>
        <Typography variant="h5" component="div">
            {props.classObj.name}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
            Coach {props.classObj.coach}
        </Typography>
        <Typography variant="body3">
            {props.classObj.description}
        </Typography>
        </CardContent>
    </Card>
    );
}

export default function ClassInfo() {
    const { id } = useParams();
    const [classes, setClasses] = useState(null);
    const [studioInfo, setStudioInfo] = useState(null);
    const [filteredClasses, setFilteredClasses] = useState(null);

    useEffect(() => {
        fetch(`/studios/${id}/classes/all`)
            .then((res) => res.json())
            .then((data) => {
                setClasses(data.results);
                setFilteredClasses(data.results);
                console.log(data.results);
                console.log(classes);
            });
    }, [id]);

    // get the studio info
    useEffect(() => {
        fetch(`/studios/${id}/info`)
            .then((res) => res.json())
            .then((data) => {
                setStudioInfo(data);
            });
    }, [id]);

    // give the user an option to filer by: name, coach, timerange, and day
    // const handleFilter = (e) => {
    //     e.preventDefault();
    //     console.log(e.target);
    //     const name = e.target.name.value;
    //     const coach = e.target.coach.value;
    //     const filtered = classes.filter((classObj) => {
    //         return (
    //             classObj.name.toLowerCase().includes(name.toLowerCase())
    //             && classObj.coach.toLowerCase().includes(coach.toLowerCase())
    //         );
    //     });
    //     setFilteredClasses(filtered);
    // };

    // for filtered data, we take the formdata and re-request the data from the backend
    const handleFilter = (e) => {
        e.preventDefault();
        console.log(e.target);
        const name = e.target.name.value;
        const coach = e.target.coach.value;
        const time = e.target.time.value;
        const day = e.target.day.value;
        // only put the params in the url if they are not empty
        let url = `/studios/${id}/classes/all/?`;
        if (name) {
            url += `&class_type=${name}`;
        }
        if (coach) {
            url += `&coach=${coach}`;
        }
        if (time) {
            url += `&time_range=${time}`;
        }
        if (day) {
            url += `&date=${day}`;
        }
        console.log(url);
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                setFilteredClasses(data.results);
                console.log(data.results);
            });
    };


    // in a grid, display each class as a card
    // each card should have a margin of 10px between it and the other cards
    // both on the x and y axis. the cards should be centered in the page.
    // they should have a margin between the top of the page and the first card.
    return (
        <div> 
            <h1>{studioInfo?.name}</h1>
            {/* put the filter forms */}
            <form onSubmit={handleFilter}>
                <TextField id="name" label="Filter Name" variant="outlined" />
                <TextField id="coach" label="Filter Coach" variant="outlined" />   
                <TextField id="time" label="Filter HH:MM,HH:MM" variant="outlined" />
                <TextField id="day" label="Filter YYYY-MM-DD" variant="outlined" />
                <br/>
                <Button type="submit">Filter</Button>
            </form>
            <Box sx={{margin: "15px"}}>
                <Grid container spacing={{ xs: 1, md: 2 }} columns={{ xs: 4, sm: 8, md: 12 }} sx={{marginTop: 10}}>
                    {filteredClasses && filteredClasses.map((classObj) => {
                        return (
                            <Grid item xs={2} sm={4} md={4}>
                                <ClassCard classObj={classObj} />
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </div>

    );
}