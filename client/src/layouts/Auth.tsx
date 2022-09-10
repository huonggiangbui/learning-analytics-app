import React, { ReactElement } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/router";
import {
  AppBar,
  Container,
  Grid,
  Toolbar,
  Theme,
  useMediaQuery,
  CssBaseline,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "../contexts/auth";

const useStyles = makeStyles((theme) => ({
  root: {
    // padding: "11% 17%",
  },
  logo: {
    height: "auto",
    width: "80px",
  },
  appName: {
    flexGrow: "1",
    cursor: "pointer",
  },
  content: { flexGrow: 1 },
  navbarSpacer: theme.mixins.toolbar,
}));

export default function Auth({
  children,
}: React.PropsWithChildren<{}>): ReactElement {
  const classes = useStyles();
  const { user } = useAuthState();
  let location = useLocation();
  // const router = useRouter();

  if (user) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  return (
    <>
      <Navbar />
      <div className={classes.root}>
        <div className={classes.navbarSpacer} />
        <main className={classes.content}>{children}</main>
      </div>
    </>
  );
}

function Navbar() {
  const classes = useStyles();
  // const isDevicePhone = useMediaQuery((theme: Theme) =>
  //   theme.breakpoints.down("xs")
  // );

  return (
    <AppBar position="static" style={{ backgroundColor: "#002A60" }}>
      <CssBaseline />
      <Toolbar>
        <Link to="/">
          <img src="https://du11hjcvx0uqb.cloudfront.net/dist/images/canvas_logomark_only@2x-e197434829.png" alt="Logo" className={classes.logo} />
          {/* <Typography variant="h4" className={classes.appName}>
            Learning Analytics App
          </Typography> */}
        </Link>
      </Toolbar>
    </AppBar>
    // <AppBar
    //   color="transparent"
    //   position="fixed"
    //   style={{ boxShadow: "none", width: "30%", left: "10%" }}
    // >
    //   <Toolbar disableGutters>
    //     <Container maxWidth="lg">
    //       <Grid container alignItems="center">
    //         <Grid item>
    //           <Grid container alignItems="center">
    //             <Link href="/">
    //               <a>
    //                 <Image
    //                   src={isDevicePhone ? "/Logo.svg" : "/Logo_Light.svg"}
    //                   width={140}
    //                   height={22}
    //                 />
    //               </a>
    //             </Link>
    //           </Grid>
    //         </Grid>
    //       </Grid>
    //     </Container>
    //   </Toolbar>
    // </AppBar>
  );
}
