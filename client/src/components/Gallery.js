import { Stack, Card, CardContent, CardMedia, Typography } from '@mui/material';
import gympic1 from './assets/gympic1.jpeg';
import gympic2 from './assets/gympic2.jpeg';
import gympic3 from './assets/gympic3.jpg';

export default function Gallery() {
    return (
        <div className="gallery" style={{ backgroundColor: "#D3D3D3", padding: 60}}>
            <Stack direction="row" spacing={10} justifyContent="center">
                <Card sx={{ maxWidth: 360 }}>
                    <CardMedia
                    component="img"
                    height="150"
                    image={gympic1}
                    alt="studio-pic"
                    />
                    <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Studios
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Many studios to choose from with high quality equipment 
                    </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ maxWidth: 360 }}>
                    <CardMedia
                    component="img"
                    height="150"
                    image={gympic2}
                    alt="amenities-pic"
                    />
                    <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Amenities
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Featuring many amenities to suit your needs 
                    </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ maxWidth: 360 }}>
                    <CardMedia
                    component="img"
                    height="150"
                    image={gympic3}
                    alt="classes-pic"
                    />
                    <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Classes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Several group fitness classes available with highly qualified trainers
                    </Typography>
                    </CardContent>
                </Card>
            </Stack>
        </div>
    );
}