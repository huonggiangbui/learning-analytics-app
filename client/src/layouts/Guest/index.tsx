import React, { ReactElement } from "react";
// import { makeStyles, Toolbar } from "@material-ui/core";
import { makeStyles } from "@mui/styles";

import Navbar from "./components/Navbar";
import Footer from "../../components/Footer";
// import { useRouter } from "next/router";

interface Props extends React.PropsWithChildren<{}> {}

const useStyles = makeStyles((theme) => ({
  root: { display: "flex" },
  sidebar: { flexShrink: 0 },
  navbarSpacer: theme.mixins.toolbar,
}));

export default function Guest({ children }: Props): ReactElement {
  const classes = useStyles();
  // const router = useRouter();

  return (
    <>
      <Navbar />
      <div className={classes.navbarSpacer} />
      <div className="container">{children}</div>
      {/* <Toolbar
        style={{ display: `${router.pathname == "/about" ? "none" : ""}` }}
      /> */}
      <Footer />
    </>
  );
}
