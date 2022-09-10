import React, { ChangeEvent, useEffect, useState } from "react";
// import Image from "next/image";
import {
  Grid,
  AppBar,
  Toolbar,
  useTheme,
  Container,
  Typography,
  Avatar,
  Theme,
  useMediaQuery,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Fade,
  Divider,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ArrowDropDown } from "@mui/icons-material";

// import NotificationsIcon from "@material-ui/icons/Notifications";

import { useAuthDispatch, useAuthState } from "../../../../contexts/auth";
import { Link, useNavigate } from "react-router-dom";
// import { useRouter } from "next/router";

// import Search from "widgets/Search";

interface StyleProps {
  anchor: null | HTMLElement;
}

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => ({
  root: {
    maxWidth: "1128px",
    width: "100%",
  },
  logo: {
    height: "auto",
    width: "80px",
  },
  userbtn: {
    border: "1px solid white",
    padding: "8px 16px",
  },
  // notibtn: {
  //   color: ({ anchor }) => `${Boolean(anchor) ? "#532BDC" : "#DEE4ED"}`,
  //   border: ({ anchor }) =>
  //     `${Boolean(anchor) ? "1px solid #532BDC" : "1px solid #DEE4ED"}`,
  //   borderRadius: "8px",
  //   width: 42,
  //   height: 42,
  //   "&:hover": {
  //     color: "#532BDC",
  //     border: "1px solid #532BDC",
  //   },
  //   transition: "0.3s ease-in-out",
  // },
  // dropbtn: {
  //   position: "relative",
  // },
  search: {
    marginRight: 0,
    width: "auto",
  },
  navitem: {
    marginLeft: "16px",
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
    width: "100%",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
  },
  signoutbtn: {
    height: "17px",
    width: "17px",
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  paper: {
    width: 200,
    padding: "10px",
    marginTop: "10px",
  },
  menuitem: {
    "&:hover": {
      borderRadius: "5px",
    },
  },
}));

export default function Navbar() {
  const dispatch = useAuthDispatch();
  const { user } = useAuthState();
  // const [searchinput, setsearchinput] = useState("");
  const [scrollTop, setScrollTop] = useState(0);
  // const router = useRouter();
  const navigate = useNavigate();
  const theme = useTheme();

  const isDevicePhone = useMediaQuery((theme: Theme) =>
    theme.breakpoints.only("xs")
  );

  const isDeviceTablet = useMediaQuery((theme: Theme) =>
    theme.breakpoints.only("sm")
  );

  const isDeviceLaptop = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up("md")
  );
  const handleSignOut = async (e: any) => {
    e.preventDefault();

    try {
      await localStorage.removeItem("access_token");
      window.location.reload();
      // router.push("/").then(() => {
      //   router.reload();
      // });

      dispatch({ type: "UNSET_USER" });
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    const onScroll = (e: any) => {
      setScrollTop(window.scrollY);
    };

    window.addEventListener("scroll", onScroll);
  }, []);
  // useEffect(() => {
  //   if (!loading1) {
  //     if (data1 && data1.signout) {
  //       dispatch({
  //         type: "UNSET_USER",
  //       });

  //       router.push("/").then(() => router.reload());
  //     }
  //   }
  // }, [data1, loading1]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElNoti, setAnchorElNoti] = useState<null | HTMLElement>(null);

  const classes = useStyles({ anchor: anchorElNoti });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    return;
  };

  const handleClose = () => {
    setAnchorEl(null);
    return;
  };

  // const handleClickNoti = (event: React.MouseEvent<HTMLButtonElement>) => {
  //   setAnchorElNoti(event.currentTarget);
  //   return;
  // };

  // const handleCloseNoti = () => {
  //   setAnchorElNoti(null);
  //   return;
  // };

  const notidropdown = (
    <Menu
      anchorEl={anchorElNoti}
      // getContentAnchorEl={null}
      open={Boolean(anchorElNoti)}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      // onClose={handleCloseNoti}
    >
      <MenuItem>Feature coming soon</MenuItem>
    </Menu>
  );

  const [mobileMenu, setMobileMenu] = React.useState(null);
  const open = Boolean(mobileMenu);

  const handleOpenMenu = (event: any) => {
    setMobileMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMobileMenu(null);
  };

  const UserMenu = (
    <div>
      {/* <MenuItem
        onClick={handleClose}
        className={classes.menuitem}
        style={{ display: `${data && data.me.type == "Org" ? "none" : ""}` }}
      >
        <Link href="/profile">
          <a>
            <Typography>Thông tin cá nhân </Typography>
          </a>
        </Link>
      </MenuItem>
      <MenuItem
        onClick={handleClose}
        className={classes.menuitem}
        style={{ display: `${data && data.me.type == "Org" ? "" : "none"}` }}
      >
        <Link href="/myorg">
          <a>
            <Typography>Tổ chức của tôi </Typography>
          </a>
        </Link>
      </MenuItem> */}
      <MenuItem onClick={handleSignOut} className={classes.menuitem}>
        <Typography component={"span"}>Logout</Typography>
      </MenuItem>
    </div>
  );

  const dropdown = (
    <Menu
      id="simple-menu"
      anchorEl={anchorEl}
      // getContentAnchorEl={null}
      open={Boolean(anchorEl)}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      onClose={handleClose}
      classes={{
        paper: classes.paper,
      }}
    >
      {UserMenu}
    </Menu>
  );

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
                    onClick={handleOpenMenu}
                  >
                    <img src="/MenuIcon.svg" />
                    {/* <img src="/MenuIcon.svg" layout="fill" /> */}
                  </IconButton>
                  <Menu
                    id="fade-menu"
                    anchorEl={mobileMenu}
                    keepMounted
                    open={open}
                    onClose={handleCloseMenu}
                    TransitionComponent={Fade}
                  >
                    {/* <MenuItem>
                      <Link href="/orgs">
                        <a>
                          <Typography
                            variant="body1"
                            style={{
                              color:
                                router.pathname ===
                                ("/orgs" || "/orgs/[org_id]")
                                  ? "#1B2431"
                                  : "#8D9198",
                            }}
                          >
                            Các tổ chức
                          </Typography>
                        </a>
                      </Link>
                    </MenuItem> */}
                    {/* <MenuItem>
                      <Link href="/recruit">
                        <a>
                          <Typography variant="body1" color="textSecondary">
                            Tuyển dụng
                          </Typography>
                        </a>
                      </Link>
                    </MenuItem> */}
                    {/* <MenuItem>
                      <Link href="https://vietcode.org/">
                        <a>
                          <Typography variant="body1" color="textSecondary">
                            Về chúng tôi
                          </Typography>
                        </a>
                      </Link>
                    </MenuItem> */}
                    <Divider />
                    {UserMenu}
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
    <>
      <AppBar
        position="fixed"
        style={{
          zIndex: theme.zIndex.drawer + 1,
          color: "black",
          padding: 0,
          boxShadow: "none",
          backgroundColor: "#002A60",
          // display: `${
          //   scrollTop >= 70 && router.pathname === "/" ? "none" : "block"
          // }`,
        }}
      >
        <Toolbar disableGutters>
          <Container maxWidth="lg">
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              direction="row"
            >
              <Grid item>
                <Grid container direction="row" alignItems="center">
                  <Grid item>
                    <Link to="/">
                      <img src="https://du11hjcvx0uqb.cloudfront.net/dist/images/canvas_logomark_only@2x-e197434829.png" alt="Logo" className={classes.logo} />
                    </Link>
                  </Grid>
                  <Grid item>
                    <Grid container spacing={2}>
                      {/* <Grid item className={classes.navitem}>
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
                          <a
                            style={{
                              color:
                                router.pathname === "/orgs/[org_id]" ||
                                router.pathname === "/orgs"
                                  ? "#1B2431"
                                  : "#8D9198",
                              fontSize: "16px",
                            }}
                          >
                            Các tổ chức
                          </a>
                        </Link>
                      </Grid> */}
                      {/* <Grid item className={classes.navitem}>
                        <Link href="/recruit">
                          <a
                            style={{
                              color:
                                router.pathname === "/recruit/[recruit_id]" ||
                                router.pathname === "/recruit"
                                  ? "#1B2431"
                                  : "#8D9198",
                              fontSize: "16px",
                            }}
                          >
                            Tuyển dụng
                          </a>
                        </Link>
                      </Grid> */}
                      {/* <Grid item className={classes.navitem}>
                        <Link href="/about">
                          <a
                            style={{
                              color:
                                router.pathname === "/about"
                                  ? "#1B2431"
                                  : "#8D9198",
                              fontSize: "16px",
                            }}
                          >
                            Về chúng tôi
                          </a>
                        </Link>
                      </Grid> */}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* <Grid item xs={2}>
                {Boolean(router.pathname == "/search") && (
                  <div className={classes.search}>
                    <Search
                      queryevent={EVENT_SEARCH_QUERY}
                      queryorg={ORG_SEARCH_QUERY}
                    />
                  </div>
                )}
              </Grid> */}
              <Grid item>
                <Grid container alignItems="center">
                  {/* <Grid item style={{ paddingRight: 8 }}>
                    <IconButton
                      className={classes.notibtn}
                      onClick={handleClickNoti}
                    >
                      <NotificationsIcon style={{ width: 27, height: 27 }} />
                    </IconButton>
                  </Grid> */}
                  <Grid item>
                    <Button
                      className={classes.userbtn}
                      onClick={handleClick}
                      aria-haspopup="true"
                      variant="text"
                      color="secondary"
                      endIcon={
                        isDeviceLaptop && (
                          <ArrowDropDown className={classes.signoutbtn} />
                        )
                      }
                    >
                      {isDeviceLaptop && (
                        <Grid
                          container
                          alignItems="center"
                          justifyContent="flex-end"
                        >
                          <Grid item style={{ paddingRight: 8 }}>
                            <Avatar
                              src={user!.avatarUrl}
                              style={{ width: 26, height: 26 }}
                            ></Avatar>
                          </Grid>
                          <Grid item>
                            <Typography variant="h5">
                              {user && user.name}
                            </Typography>
                          </Grid>
                        </Grid>
                      )}
                      {/* {isDeviceTablet && (
                        <Image src="/down-arrow.svg" width={14} height={20} />
                      )} */}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Toolbar>
      </AppBar>
      {dropdown}
      {notidropdown}
    </>
  );
}