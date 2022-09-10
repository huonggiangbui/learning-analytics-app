import { Button, FormHelperText, TextField } from "@mui/material";
import { makeStyles } from "@mui/styles";
import API from '../../services/api';
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthDispatch } from "../../contexts/auth";
import Auth from "../../layouts/Auth";

const useStyles = makeStyles(() => ({
  main: {
    marginTop: "2.5rem",
    "& h1": {
      fontSize: "3rem",
      fontWeight: "500",
      letterSpacing: "-0.025em",
      lineHeight: "1",
      marginBottom: "3rem",
      textAlign: "center"
    },
    "& p": {
      marginTop: "1.5rem",
      textAlign: "center",
      color: "#d32f2f"
    }
  },
  form: {
    width: "50%",
    margin: "auto"
  },
  button: {
    marginTop: "1.5rem !important",
  },
}));

export default function Login() {
  const classes = useStyles();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const dispatch = useAuthDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToken(event.target.value);
  };

  const valid = useMemo(() => {
    const tokenRegex = /^\d{5}~[a-zA-Z0-9]{64}$/
    return tokenRegex.test(token) || token.length === 0;
  }, [token]);

  const signin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await API.post('/login', { accessToken: token })
      .then((res) => {
        if (res.data.errors) {
          setError(res.data.errors[0].message)
          console.log(res.data.errors)
        }
        else {
          localStorage.setItem("access_token", token);
          dispatch({
            type: "SET_USER",
            payload: res.data,
          });
          navigate('/', { replace: true });
        }
      })
      .catch((err) => {
        console.log(err)
        setError("Error occurs when trying to login. Please check the Access Token and try again")
      })
  }

  return (
    <Auth>
      <div className={`container ${classes.main}`}>
        <h1>
          <span> Login as an instructor to see statistics of your course(s) </span>
        </h1>
        <form onSubmit={signin} className={classes.form}>
          <TextField required autoFocus fullWidth id="outlined-basic" label="Canvas Access Token" variant="outlined" placeholder="Enter your Canvas Access Token here" value={token} onChange={handleChange} error={!valid}/>
          <FormHelperText style={{ marginTop: "8px", color: "#d32f2f"}}>
            {!valid && "Must be a valid access token"}
          </FormHelperText>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.button}
            disabled={!valid}
            size="large"
          >
            LOGIN
          </Button>
        </form>
        <p>{error}</p>
      </div>
    </Auth>
  );
}
