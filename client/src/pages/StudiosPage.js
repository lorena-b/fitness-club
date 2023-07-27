import { useEffect, useState } from "react";
import { TextField, 
  Grid, Button, List, ListItem, 
  ListItemButton, ListItemText, 
  Typography, Dialog, DialogTitle, Snackbar, Alert, CircularProgress, 
  DialogContent, DialogActions, DialogContentText, Pagination, PaginationItem, Tooltip, IconButton, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Stack } from "@mui/system";
import Map from "../components/Map";
import { geocode } from 'nominatim-geocode';


const PAGE_SIZE = 5;

function StudioRow(props) {
  const navigate = useNavigate();
  const { studio, address, useCurrentLocation, userLoc } = props; 

  const handleStudioClick = () => {
    navigate(`/studios/${studio.id}`, {state: {inputAddress: address, useCurrentLocation: useCurrentLocation, userLoc: userLoc}});
  }

  return (
    <ListItem key={studio.id} component="div" disablePadding secondaryAction={
      <ListItemText primary={`${studio.distance?.toFixed(2)} km`}/>
    }>
    <ListItemButton onClick={handleStudioClick}>
      <ListItemText primary={`${studio.name}`} secondary={studio.address} />
    </ListItemButton>
  </ListItem>
  );
}

function FilterDialog(props) {
  const { onClose, open, setStudios, address, setCount, useCurrentLocation, userLoc } = props;
  const [studioName, setStudioName] = useState("");
  const [amenity, setAmenity] = useState("");
  const [className, setClassName] = useState("");
  const [coachName, setCoachName] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);

  const [filterParams, setFilterParams] = useState({});

  const fetchFilteredStudios = async () => {
    const params = new URLSearchParams(filterParams);
    let body = {}
    // if (useCurrentLocation) {
    body = JSON.stringify({coords: userLoc}) 
    // } else {
    //   body = JSON.stringify({user_location: address})
    // }
    const response = await fetch(`studios/all/?page=1&page_size=${PAGE_SIZE}&${params.toString()}`, {
      method: 'POST',
      body: body
    });
    const data = await response.json();
    setCount(data.count)
    return data.results
  }

  useEffect(() => {
    setFilterParams({
      studio_name: studioName,
      amenity_type: amenity,
      class_type: className,
      coach: coachName, 
    });
 
  }, [studioName, amenity, className, coachName]);

  const handleClose = () => {
    onClose();
  };
  
  const handleClear = () => {
    setStudioName("");
    setAmenity("");
    setClassName("");
    setCoachName("");
  }

  const handleAlertClose = () => {
    setAlertOpen(false);
  }

  const handleApplyFilter = async () => {
    const filteredStudios = await fetchFilteredStudios();
    setStudios(filteredStudios);
    onClose();
    
    setAlertOpen(true);
  };

  return (
    <>
    <Dialog onClose={handleClose} open={open}>
    <DialogTitle>Filters</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Enter a value to filter studios by that field (leave blank to ignore)
      </DialogContentText>
        <TextField
            autoFocus
            margin="dense"
            id="studioName"
            label="Studio Name"
            fullWidth
            variant="standard"
            value={studioName}
            onChange={(e) => setStudioName(e.target.value)}
          />
        <TextField
            autoFocus
            margin="dense"
            id="amenity"
            label="Amenity"
            fullWidth
            variant="standard"
            value={amenity}
            onChange={(e) => setAmenity(e.target.value)}
          />
        <TextField
            autoFocus
            margin="dense"
            id="class"
            label="Class Name"
            fullWidth
            variant="standard"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <TextField
            autoFocus
            margin="dense"
            id="coach"
            label="Coach"
            fullWidth
            variant="standard"
            value={coachName}
            onChange={(e) => setCoachName(e.target.value)}
          />
    </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={2}>
            <Button onClick={handleClear}>Clear</Button>
            <Button onClick={handleClose}>Cancel</Button>
            <Button color="secondary" onClick={handleApplyFilter}>Apply</Button>
        </Stack>
      </DialogActions>
    </Dialog>
        <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
      >
        <Alert onClose={handleAlertClose} severity="success" sx={{ width: '100%' }}>
          Filters Applied!
        </Alert>
      </Snackbar>
    </>
  );
}

function StudiosPage() {
  const [error, setError] = useState("");
  const [userLoc, setUserLoc] = useState({ lat: 0, lng: 0 });
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0); // for table
  const [loadingState, setLoadingState] = useState("idle");
  const [page, setPage] = useState(1);
  const [studios, setStudios] = useState([]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);

  const initializeAddress = () => {
    return window.localStorage.getItem('address') ?? "";
  };
  
  const [address, setAddress] = useState(initializeAddress());
  // get user location when the page loads
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLoc({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem('address', address);
  }, [address]);

  useEffect(() => {
    if (address === "" && !useCurrentLocation) {
      return;
    }
    fetchAllStudios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, userLoc]); 

  const handleLoading = () => {
    if (loadingState === "loading") {
      return <div style={{ padding: 20 }}><CircularProgress /></div>;
    }
    return <></>;
  };

  const fetchAllStudios = async () => {
      // get studios from user input 
      try {
        let body = {}
        // if (useCurrentLocation) {
        body = JSON.stringify({coords: userLoc}) 
        // } else {
        //   body = JSON.stringify({user_location: address})
        // }
        setLoadingState("loading");
        const response = await fetch(`/studios/all/?page=${page}&page_size=${PAGE_SIZE}`,
        {
          method: 'POST',
          body: body 
        });
        if (response.status === 400) {
          setError("GeoPy Failed to find address: Please enter a valid address");
          setLoadingState("idle");
          return;
        }
        const studioData = await response.json();
        setCount(studioData.count); 
        setStudios(studioData.results);
        setLoadingState("idle");
      } catch (e) {
        setError("Error fetching studios");
        setLoadingState("idle");
      }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (address === "") {
      setError("Please enter a valid address");
      return;
    }
    setError("");
    setUseCurrentLocation(false);
    geoCodeUser(address);
    setPage(1);
  }

  const handleFilterOpen = () => {
    setOpen(true);
  }

  const handleFilterClose = () => {
    setOpen(false);
  }

  const geoCodeUser = (address) => {
    // try {
    //   const response = await fetch(`studios/geocode/${encodeURIComponent(address)}`);
    //   const { geocode } = await response.json();
    //   setUserLoc({
    //     lat: geocode.latitude,
    //     lng: geocode.longitude,
    //   });
    // } catch (e) {
    //   setError("Geocoding error");
    // }
    setLoadingState("loading");
    geocode({q: address}, (err, results) => {
        try {
          setUserLoc({
            lat: results[0].lat,
            lng: results[0].lon,
          });
        } catch (e) {
          setError("Geocoding error");
        }
      }
    )
    setLoadingState("idle");

  }

  const handleCurrentLocation = async () => {
    setError("");
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLoc({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
    setAddress("");
    setUseCurrentLocation(true); 
    setPage(1);
    setAlertOpen(true);
  }

  const handleAlertClose = () => {
    setAlertOpen(false);
  }

  const handleChangePage = (e, value) => {
    setPage(value);
  }

  return (
    <div className="studios-page">
      <div style={{ marginBottom: '30px' }}>
        <Typography variant="h3" p={3}>
          Find a Studio
        </Typography>
        <div style={{ margin: 'auto', background: 'rgb(25,118,210)' , height: '5px', width: '6%' }}/>
      </div>
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
            <Tooltip title="Use current location">
              <IconButton aria-label="location-button" onClick={handleCurrentLocation}>
                <GpsFixedIcon/>
              </IconButton>
            </Tooltip>
            <Snackbar
              open={alertOpen}
              autoHideDuration={6000}
              onClose={handleAlertClose}
            >
              <Alert onClose={handleAlertClose} severity="success" sx={{ width: '100%' }}>
                Using current location 
              </Alert>
            </Snackbar>
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                  id="outlined-basic"
                  label="Enter your location"
                  variant="outlined"
                  onChange={(e) => setAddress(e.target.value)}
                  fullWidth
                  error={error !== ""}
                  helperText={error}
                  value={address}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">
                      <IconButton type="submit" aria-label="search" onClick={handleSubmit}>
                        <SearchIcon />
                      </IconButton>
                      </InputAdornment>,
                  }}
                />
            </Grid>
            <Grid item>
              <Button 
                fullWidth
                startIcon={<FilterListIcon />}
                variant="outlined" 
                sx={{ height: '55px', fontSize: '16px'}}
                onClick={handleFilterOpen}>
                Filter
              </Button>
              <FilterDialog 
                setCount={setCount} 
                open={open} 
                page={page} 
                onClose={handleFilterClose} 
                setStudios={setStudios} 
                address={address} 
                userLoc={userLoc}
                useCurrentLocation={useCurrentLocation}/>
            </Grid>
          </Grid>
        </form>
        <Grid container spacing={0}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="bold">
              Select a studio for more information
              </Typography>
              <div style={{ marginRight: "10px", marginLeft: "10px"}}>
                <List
                  sx={{ width: '100%', height: 400, bgcolor: 'background.paper' }}
                >
                  {studios.length > 0? studios.map((studio) => {
                    return <StudioRow studio={studio} address={address} useCurrentLocation={useCurrentLocation} userLoc={userLoc} />
                    }): <div>No studios found</div>}
                  {handleLoading()}
                </List>
              </div>
              <Stack alignItems="center">
                <div style={{ padding: "10px" }}>
                <Pagination
                  count={Math.ceil(count / PAGE_SIZE)}
                  page={page}
                  onChange={handleChangePage}
                  renderItem={(item) => (
                    <PaginationItem
                      slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                      {...item}
                    />
                  )}
                />
                </div>
                {count === 1? `${count} Studio found`: `${count} Studios found`}
              </Stack>
          </Grid>
          <Grid item xs={12} md={8}>
              <Map location={userLoc} studios={studios} address={address} useCurrentLocation={useCurrentLocation} userLoc={userLoc} />
          </Grid>
        </Grid>
    </div>
  );
}

export default StudiosPage;