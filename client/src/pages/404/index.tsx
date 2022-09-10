import { makeStyles } from "@mui/styles";
import withLayout from "../../hocs/withLayout";

const useStyles = makeStyles(() => ({
  welcome: {
    marginTop: "2.5rem",
    "& h1": {
      fontSize: "3rem",
      fontWeight: "500",
      letterSpacing: "-0.025em",
      lineHeight: "1"
    },
    "& span": {
      marginTop: "1rem",
      display: "block",
      fontSize: "1.875rem",
      fontWeight: "300",
      lineHeight: "2.25rem",
      marginBottom: "0.5rem"
    }
  },
}));

export function PageNotFound() {
  const classes = useStyles();

  return (
    <div className={classes.welcome}>
      <h1>
        Seems like this page is not found... 😿
        <span> You wanna go back to the homepage.</span>
      </h1>
    </div>
  );
}

export default withLayout(PageNotFound);
