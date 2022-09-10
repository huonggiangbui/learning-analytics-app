import React, { useEffect, useState } from "react";
import {
  Grid,
  AppBar,
  Toolbar,
  Button,
  useTheme,
  Container,
  Typography,
  useMediaQuery,
  Theme,
  IconButton,
  Menu,
  MenuItem,
  Fade,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Link } from "react-router-dom";

const useStyle = makeStyles((theme) => ({
  navitem: {
    marginLeft: "16px",
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  logo: {
    height: "auto",
    width: "80px",
  },
}));

export default function Navbar() {
  const theme = useTheme();
  // const router = useRouter();
  const classes = useStyle();
  const [showSignIn, setShowSignIn] = useState(true);

  useEffect(() => {
    if (window.location.href === "/") {
      setShowSignIn(false);
      const onScroll = (e: any) => {
        {
          e.target.documentElement.scrollTop >= 350
            ? setShowSignIn(true)
            : setShowSignIn(false);
        }
      };
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, []);

  const isDevicePhone = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("xs")
  );

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (isDevicePhone) {
    return (
      <AppBar
        position="fixed"
        style={{
          zIndex: theme.zIndex.drawer + 1,
          color: "black",
          padding: 0,
          boxShadow: "none",
          background: "#002A60",
        }}
      >
        <Toolbar disableGutters>
          <Container maxWidth="lg">
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Grid container direction="row" alignItems="center">
                  <Grid item>
                    <Link to="/">
                      <img src="https://du11hjcvx0uqb.cloudfront.net/dist/images/canvas_logomark_only@2x-e197434829.png" alt="Logo" className={classes.logo} />
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container spacing={2}>
                  <IconButton
                    edge="end"
                    className={classes.menuButton}
                    color="inherit"
                    aria-label="menu"
                    onClick={handleClick}
                  >
                    <img src="https://du11hjcvx0uqb.cloudfront.net/dist/images/canvas_logomark_only@2x-e197434829.png" alt="Logo" className={classes.logo} />
                    {/* <img src="/MenuIcon.svg" layout="fill" /> */}
                  </IconButton>
                  <Menu
                    id="fade-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={open}
                    onClose={handleClose}
                    TransitionComponent={Fade}
                  >
                    {/* <MenuItem>
                      <Link href="/orgs">
                        <a>
                          <Typography
                            variant="body1"
                            style={{
                              color:
                                router.pathname === "orgs"
                                  ? "#1B2431"
                                  : "#8D9198",
                            }}
                          >
                            Các tổ chức
                          </Typography>
                        </a>
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <Link href="/recruit">
                        <a>
                          <Typography variant="body1" color="textSecondary">
                            Tuyển dụng
                          </Typography>
                        </a>
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <Link href="/about">
                        <a>
                          <Typography variant="body1" color="textSecondary">
                            Về chúng tôi
                          </Typography>
                        </a>
                      </Link>
                    </MenuItem> */}
                  </Menu>
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar
      position="fixed"
      style={{
        zIndex: theme.zIndex.drawer + 1,
        color: "black",
        padding: 0,
        boxShadow: "none",
        background: "#002A60",
      }}
    >
      <Toolbar disableGutters>
        <Container maxWidth="lg">
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Grid container direction="row" alignItems="center">
                <Grid item>
                  <Link to="/">
                    <img src="https://du11hjcvx0uqb.cloudfront.net/dist/images/canvas_logomark_only@2x-e197434829.png" alt="Logo" className={classes.logo} />
                  </Link>
                </Grid>

                <Grid item>
                  {/* <Grid container spacing={2}>
                    <Grid item className={classes.navitem}>
                      <svg
                        width="2"
                        height="16"
                        viewBox="0 0 2 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M1 0V16" stroke="#DEE4ED" />
                      </svg>
                    </Grid> */}
                    {/* <Grid item style={{ marginLeft: 8 }}>
                      <Link href="/orgs">
                        <a>
                          <Typography
                            variant="body1"
                            style={{
                              color:
                                router.pathname === "/orgs/[org_id]" ||
                                router.pathname === "/orgs"
                                  ? "#1B2431"
                                  : "#8D9198",
                            }}
                          >
                            Các tổ chức
                          </Typography>
                        </a>
                      </Link>
                    </Grid> */}
                    {/* <Grid item className={classes.navitem}>
                      <Link href="/recruit">
                        <a>
                          <Typography
                            variant="body1"
                            style={{
                              color:
                                router.pathname === "/recruit/[recruit_id]" ||
                                router.pathname === "/recruit"
                                  ? "#1B2431"
                                  : "#8D9198",
                            }}
                          >
                            Tuyển dụng
                          </Typography>
                        </a>
                      </Link>
                    </Grid> */}
                    {/* <Grid item className={classes.navitem}>
                      <Link href="/about">
                        <a>
                          <Typography
                            variant="body1"
                            style={{
                              color:
                                router.pathname === "/about"
                                  ? "#1B2431"
                                  : "#8D9198",
                            }}
                          >
                            Về chúng tôi
                          </Typography>
                        </a>
                      </Link>
                    </Grid> */}
                  {/* </Grid> */}
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container spacing={2}>
                {showSignIn && (
                  <>
                    {/* <Grid item>
                      <Link to="/signup">
                        <a>
                          <Button variant="outlined" color="primary">
                            Đăng ký
                          </Button>
                        </a>
                      </Link>
                    </Grid> */}
                    <Grid item>
                      <Link to="/login">
                        <Button variant="contained" color="primary">
                          Login
                        </Button>
                      </Link>
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
