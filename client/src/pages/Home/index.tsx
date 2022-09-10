import { makeStyles } from "@mui/styles";
import { ReactComponent as ArrowIcon } from "../../assets/arrow.svg";
import { Link } from "react-router-dom";
import { useAuthState } from "../../contexts/auth";
import withLayout from "../../hocs/withLayout";
import { useEffect, useState } from "react";
import API from "../../services/api";

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
      display: "block",
      fontSize: "1.875rem",
      fontWeight: "300",
      lineHeight: "2.25rem",
      marginBottom: "0.5rem"
    }
  },
  middleContent: {
    alignItems: "flex-start",
    display: "grid",
    gap: "4rem",
    gridTemplateColumns: "1fr",
    marginTop: "3.5rem",
    ["@media screen and (min-width: 768px)"]: {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))"
    },
  },
  card: {
    padding: "2.5rem 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: "1rem",
    width: "100%",
    cursor: "pointer",
    transitionProperty: 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '150ms',
    "& span": {
      fontWeight: "500",
      fontSize: "1.25rem",
      letterSpacing: "-0.025em",
      lineHeight: "1.75rem",
      overflow: "hidden",
      // paddingLeft: "1rem",
      // paddingRight: "1rem",
      "& span": {
        color: "rgba(107, 114, 128, 1)",
        display: "block",
        flexGrow: 1,
        fontSize: "0.75rem",
        fontWeight: "400",
        lineHeight: "1rem",
        transitionProperty: 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDuration: '150ms',
      },
    },
    "& svg:first-child": {
      marginRight: "1rem",
      width: "1.5rem",
      height: "1.5rem",
      transitionProperty: 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter',
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDuration: '150ms',
    },
    "& svg:last-child": {
      width: "1rem",
      height: "1rem",
      transitionProperty: 'all',
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDuration: '150ms',
    },
    "&:hover": {
      color: "rgba(255, 255, 255, 1)",
      backgroundColor: "hsla(162, 47%, 50%, 1)",
      "& span>span": {
        color: "rgba(243, 244, 246, 1)"
      },
      "& svg:last-child": {
        transform: "translateX(0.25rem)"
      }
    }
  }
}));

function Home() {
  const classes = useStyles();
  const { user } = useAuthState();
  const token = localStorage.getItem("access_token");
  const [ courses, setCourses ] = useState<any[]>([]);
  
  const fetchCourses = async () => {
    await API.get('/courses', { headers: { 'Authorization': 'Bearer ' + token } })
      .then((res) => {
        if (res.data.errors) {
          console.log(res.data.errors)
        }
        else {
          setCourses(res.data)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }

  useEffect(() => {
    fetchCourses();
  }, [])

  return (
    <>
      <div className={classes.welcome}>
        <h1>
          <span> Hello {user ? user.name : 'there'}, </span>
          Welcome to Learning Analytics! 👋
        </h1>
      </div>
      {user && courses.length > 0 ?
        <div className={classes.middleContent}>
        {courses.map((course) => {
          if (course.access_restricted_by_date) {
            return null;
          }
          return (
            <Link to={`courses/${course.id}`}>
              <div key={course.id} className={`rounded shadow ${classes.card}`}>
                <span>
                  {course.course_code}
                  <span> {course.name} </span>
                </span>
                <ArrowIcon />
              </div>
            </Link>
          )
        })}
        </div>
        : <p>Logged in and become an instructor for at least a course to view analytics.</p>}
    </>
  );
}

export default withLayout(Home);
