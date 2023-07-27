import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Typography, Button, Stack, Divider, Paper, Card, CardMedia } from "@mui/material";
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from "react-router-dom";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

function ImageCard(props) {
    const name = props.img.name;
    const image = props.img.image;
    return (
        <Card sx={{ maxWidth: 345 }}>
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={name}
        />
      </Card>
    );
}   

export default function StudioInfo() {
    const { inputAddress, useCurrentLocation, userLoc } = useLocation().state;
    const { id } = useParams();
    const [studio, setStudio] = useState({});
    const [error, setError] = useState("");
    const { name, address, amenities, images, phone_number, postal_code, direction_link } = studio;

    const navigate = useNavigate();

    useEffect(() => {
        const getStudioInfo = async () => {
            let body = {};
            // if (useCurrentLocation) {
            body = JSON.stringify({coords: userLoc})
            // } else {
            //     body = JSON.stringify({user_location: inputAddress})
            // }
            const res = await fetch(`/studios/${id}/info/`, {
                method: 'POST',
                body: body
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            }
            console.log(error);
            setStudio(data);
        };
        getStudioInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleClassesClick = () => {
        navigate(`/studios/${id}/classes`);
    }

    return (
        <div className="studio-info">
            <div style={{ marginBottom: '30px' }}>
                <Typography variant="h3" mt={3} mb={1}>
                    {name}
                </Typography>
                <Typography variant="subtitle1" mb={4}>
                    {address} {postal_code}  &#x2022; {phone_number}
                </Typography>
                <Grid container spacing={2} mb={3} direction="column" alignItems="center" justifyContent="center">
                    <Stack spacing={2} direction="row">
                        <Button 
                        href={direction_link}
                        sx={{ width: '100px', height: '45px' }} 
                        variant="contained">
                            Directions
                            </Button>
                        <Button 
                        sx={{ width: '100px', height: '45px' }} 
                        variant="outlined"
                        onClick={handleClassesClick}>
                            Classes
                        </Button>
                    </Stack>
                </Grid> 
                <div style={{ margin: 'auto', background: 'rgb(25,118,210)' , height: '5px', width: '6%' }}/>
            </div>
            <Container fixed>
                <Typography variant="h4" p={2}>
                    Studio Showcase
                </Typography>
                <Grid container spacing={5} alignItems="center" justifyContent="center" mb="15px">
                    {images && images.map((image) => (
                        <Grid item xs={12} md={4}>
                            <ImageCard img={image} />
                        </Grid>
                    ))}
                </Grid>
                <Typography variant="h4" p={2}>
                    Amenities
                </Typography>
                <Stack
                    mt={2}
                    mb={5}
                    direction="row"
                    divider={<Divider orientation="vertical" flexItem />}
                    spacing={2}
                    alignItems="center" justifyContent="center"
                >                            
                    {amenities && amenities.map((amenity) => {return <Item> {amenity.type} &#x2022; {amenity.quantity} </Item>})}
                </Stack>
            </Container>
        </div>
    );
}