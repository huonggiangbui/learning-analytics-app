import React, { ReactElement } from "react";
import { Toolbar } from "@mui/material";
import { makeStyles } from "@mui/styles";

import Navbar from "./components/Navbar";
import Footer from "../../components/Footer";
// import { useRouter } from "next/router";

interface Props extends React.PropsWithChildren<{}> {}

const useStyles = makeStyles((theme) => ({
  root: { display: "flex" },
  content: { flexGrow: 1 },
  sidebar: { flexShrink: 0 },
  navbarSpacer: theme.mixins.toolbar,
}));

export default function User({ children }: Props): ReactElement {
  const classes = useStyles();
  // const router = useRouter();

  return (
    <>
      <Navbar />
      <div className={classes.root}>
        <main className={classes.content}>
          <Toolbar />
          <div className="container">
            {children}
          </div>
          {/* <Toolbar
            style={{ display: `${router.pathname == "/about" ? "none" : ""}` }}
          /> */}
        </main>
      </div>
      <Footer />
    </>
  );
}
