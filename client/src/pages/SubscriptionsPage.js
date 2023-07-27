import { Link, Outlet } from "react-router-dom";
import { Stack, Card, CardActionArea, CardContent, CardMedia, Typography, Container } from '@mui/material';

function SubscriptionsPage() {
    return (
        <div style={{ padding: 40}}>
        <Typography variant="h4" mt={3} mb={1} style={{ padding: 40 }}>
                Select your subscription action:
        </Typography>
        <Container>
        <Stack direction="row" spacing={2} justifyContent="center">
            <Card sx={{ maxWidth: 345 }}>
                <CardActionArea component={Link} to={'subscribe'}>
                    <CardMedia
                    component="img"
                    height="140"
                    image={require("./subscriptions/images/gymmemberhero.png")}
                    alt="subscription"
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Subscribe
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            <Card sx={{ maxWidth: 345 }}>
                <CardActionArea component={Link} to={'changeplan'}>
                    <CardMedia
                    component="img"
                    height="140"
                    image={require("./subscriptions/images/changeplan.png")}
                    alt="change-plan"
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Change Plan
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            <Card sx={{ maxWidth: 345 }}>
                <CardActionArea component={Link} to={'changepayment'}>
                    <CardMedia
                    component="img"
                    height="140"
                    image={require("./subscriptions/images/change_payment.png")}
                    alt="payment"
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Change Payment
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            <Card sx={{ maxWidth: 345 }}>
                <CardActionArea component={Link} to={'paymenthistory'}>
                    <CardMedia
                    component="img"
                    height="140"
                    image={require("./subscriptions/images/paymenthistory.png")}
                    alt="payment-history"
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Payment History
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            <Card sx={{ maxWidth: 345 }}>
                <CardActionArea component={Link} to={'subcancel'}>
                    <CardMedia
                    component="img"
                    height="140"
                    image={require("./subscriptions/images/cancelplan.png")}
                    alt="cancel-plan"
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Cancel Plan
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Stack>
        </Container>
        <Outlet />
        </div>
    );
}

export default SubscriptionsPage;