import react from "react";
import { ReactComponent as HeartIcon } from "../../assets/heart.svg"
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  love: {
    color: 'rgba(107, 114, 128, 1)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    margin: '1rem 0',
    opacity: 0.6,
    textAlign: 'center',

    "& svg": {
      color: 'rgba(252, 165, 165, 1)',
      width: '1.25rem',
      height: '1.25rem',
      display: 'inline',
      marginTop: '-0.25rem',
    }
  }
}));

export default function Footer() {
  const classes = useStyles();
  return (
    <p className={classes.love}>
      Carefully crafted with <HeartIcon />. Author: Giang Bui Huong
    </p>
  )
}