import LoadingButton from '@mui/lab/LoadingButton';
import { makeStyles } from "@mui/styles";
import { UploadFile, ExpandMore, Description } from '@mui/icons-material';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import withLayout from "../../hocs/withLayout";
import API from "../../services/api";
import { CsvToHtmlTable } from "react-csv-to-table";
import { CircularProgress, Typography, Divider, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from '@mui/material';

const useStyles = makeStyles(() => ({
  welcome: {
    margin: "2.5rem 0",
    "& h1": {
      fontSize: "3rem",
      fontWeight: "500",
      letterSpacing: "-0.025em",
      lineHeight: "1"
    }
  },
  error: {
    marginTop: "1.5rem",
    textAlign: "center",
    color: "#d32f2f"
  },
  img: {
    width: "100%",
  },
  button: {
    marginBottom: "1.5rem !important"
  },
  description: {
    margin: "16px !important",
  },
}));

const filename_description_map = {
  "grade_view_LR": "Using Linear Regression (OLS) to find the correlation between students' total views on Quercus and their Final Score (from Quercus Gradebook)",
  "grade_participation_LR": "Using Linear Regression (OLS) to find the correlation between students' total participations on Quercus (quizzes and assignments) and their Final Score (from Quercus Gradebook)",
  "grade_quiz_attempt1st_LR": "Using Linear Regression (OLS) to find the correlation between students' grades on Quercus quizzes (counting first attempts only) and their Final Score (from Quercus Gradebook)",
  "grade_quiz_attemptbest_LR": "Using Linear Regression (OLS) to find the correlation between students' grades on Quercus quizzes (counting best attempts only) and their Final Score (from Quercus Gradebook)",
  "quiz_attempt_summary": "Descriptive statistics of total attempts that students have taken on each Quercus quiz",
  "quiz_starttime_summary": "Descriptive statistics of starttime (calculated by their submitted timestamp on first attempt) that students have taken on each Quercus quiz",
  "starttime_hist": "Distribution of this quiz starttime (unit: hours before deadline)",
  "scores_by_starttime_group_boxplot": "Distribution of students' scores on their first attempts on the quiz, grouped by their quiz starttime (0-25th percentile, 25-50th percentile, 50-75th percentile, 75-100th percentile)",
  "total_attempts_hist": "Distribution of total attempts each student has taken on this quiz",
  "attempt_to_best_hist": "Distribution of attempts needed to get best scores for each student on this quiz",
  "scores_by_attempt_group_boxplot": "Distribution of students' scores on their first attempts on the quiz, grouped by their total attempts on this quiz (0-25th percentile, 25-50th percentile, 50-75th percentile, 75-100th percentile)",
  "score_attempt1st_hist": "Distribution of score in students' first attempt on this quiz",
  "score_attemptbest_hist": "Distribution of score in students' best attempt on this quiz",
  "engagement": "Summary of engagement on this week (starting from the date above)",
  "aggregate_contenttype_view_barplot": "An estimate of central tendency for number of views based on content type on Quercus",
  "aggregate_contenttype_session_barplot": "An estimate of central tendency for time of a session based on content type on Quercus",
  "aggregate_contenttype_view_catplot": "Relationship between total views and content type on Quercus",
  "aggregate_contenttype_session_catplot": "Relationship between total session time and content type on Quercus",
  "view_lineplot": "Relationship between days of week and total views on that day",
  "participation_lineplot": "Relationship between days of week and total participations on that day",
  "session_lineplot": "Relationship between days of week and total session time on that day",
  "total_contenttype_view_barplot": "Total number of views based on content type on Quercus",
  "contenttype_view_barplot": "An estimate of central tendency for number of views based on content type on Quercus under a week (starting from the date above)",
  "contenttype_session_barplot": "An estimate of central tendency for time of a session based on content type on Quercus under a week (starting from the date above)",
  "contenttype_view_catplot": "Relationship between number of views and content type on Quercus under a week (starting from the date above)",
  "contenttype_session_catplot": "Relationship between time of a session and content type on Quercus under a week (starting from the date above)",
  "total_contentname_view_barplot": "Total number of views based on content name on Quercus",
  "contentname_view_barplot": "An estimate of central tendency for number of views based on content name on Quercus under a week (starting from the date above)",
  "contentname_session_barplot": "An estimate of central tendency for time of a session based on content name on Quercus under a week (starting from the date above)",
  "contentname_view_catplot": "Relationship between number of views and content name on Quercus under a week (starting from the date above)",
  "contentname_session_catplot": "Relationship between time of a session and content name on Quercus under a week (starting from the date above)",
};

export function CoursePage() {
  const classes = useStyles();
  const token = localStorage.getItem("access_token");
  const { id } = useParams();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>();

  const [course, setCourse] = useState<any>();
  const [visualizations, setVisualizations] = useState<any>();
  const [tables, setTables] = useState<any>();
  const [files, setFiles] = useState<any>();

  const fetchCourse = async () => {
    await API.get('/courses/:id', { headers: { 'Authorization': 'Bearer ' + token }, params: { id } })
      .then((res) => {
          setCourse(res.data)
          const { visualizations, tables, allFiles } = res.data;
          groupVisualizations(visualizations)
          groupTables(tables)
          setFiles({allFiles})
          setLoading(false)
          console.log(res.data)
      })
      .catch((err) => {
        setLoading(false)
        if (err.response.data) {
          setError(err.response.data);
        }
        else if (err.message) {
          setError(err.message);
        }
        console.log(err)
      })
  }

  useEffect(() => {
    fetchCourse();
  }, [])


  const changeHandler = (event: any) => {
    const { files } = event.target;
    const fnames = Array.from(files).map((f: any) => f.name).join(", ")
    // eslint-disable-next-line no-restricted-globals
    if (files.length > 0 && confirm(`Do you want to upload file(s): ${fnames}`)) {
      setLoading(true);
      handleSubmission(Array.from(files));
    }
  };

  const handleSubmission = async (files: any) => {
    const formData = new FormData();
    files.forEach((file: any) => {
      if (file.size <= 5 * 10e5) {
        formData.append('data[]', file)
      }
      else {
        alert(`File ${file.name} is greater than 5MB. This file will not be uploaded.`)
      }
    });

    await API.post('/courses/:id', formData, {
      params: {
        id
      },
      headers: {
        'Authorization': 'Bearer ' + token,
        "Content-Type": "multipart/form-data"
      }
    })
      .then(res => {
        console.log(res.data);
        const { uploaded, stored, allFiles, visualizations, tables } = res.data;
        setFiles({uploaded, stored, allFiles});
        groupVisualizations(visualizations);
        groupTables(tables);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        if (err.response.data) {
          setError(err.response.data);
        }
        else if (err.message) {
          setError(err.message);
        }
        console.log(err);
      })
  };

  const groupVisualizations = (data: any) => {
    const regex = /\d{6}\/\d{6}\/(?:\[(?<category>.*)\]|)(?<filename>.*).png/
    let v = {'Summary': {}}
    for (const key of data) {
      const { category, filename } = key.match(regex).groups
      if (category) {
        if (!v[category]) {
          v[category] = {}
        }
        v[category][filename] = key
      } else {
        v['Summary'][filename] = key
      }
    }
    setVisualizations(v)
  }

  const groupTables = (data: any) => {
    const data_entries = Object.entries(data)
    const regex = /\d{6}\/visualizations\/(?:\[(?<category>\d{4}-\d{2}-\d{2})\]|)(?<filename>.*).csv/
    let t = {'Summary': {}}
    for (const [fname, f] of data_entries) {
      const results = fname.match(regex)
      if (!results) continue
      const { category, filename } = results.groups as any
      if (category) {
        if (!t[category]) {
          t[category] = {}
        }
        t[category][filename] = f
      } else {
        t['Summary'][filename] = f
      }
    }
    setTables(t);
  }

  if (!course && loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!course && error) {
    return <h1 className={classes.error}> Errors in getting course with id {id}: {error} </h1>;
  }

  return (
    <>
      <div className={classes.welcome}>
        <h1>
          {course.name}
        </h1>
      </div>
      <input accept=".csv" id="icon-button-file"
        type="file" style={{ display: 'none' }} multiple onChange={changeHandler} />
      <label htmlFor="icon-button-file">
        <LoadingButton
          variant="contained"
          startIcon={<UploadFile />}
          className={classes.button}
          component="span"
          loading={loading}
          loadingPosition="start"
        >
          Upload csv data
        </LoadingButton>
      </label>
      {error ? <h1 className={classes.error}>Error in uploading data: {error}</h1> : null}
      {Object.keys(files).map((ftype) => {
        const f_list = files[ftype];
        return (
          <>
            <Typography>{ftype}</Typography>
            <List>
              {f_list.map((fname) => {
                return (
                  <ListItem disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText primary={fname} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </>
        );
      })}
      {Object.keys(visualizations).map((name) => {
        const visualization_data = visualizations[name];
        const table_data = tables[name];
        return (
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel1a-content"
              id="panel1a-header"
              >
              <Typography>{name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {Object.keys(visualization_data).map((v: string) => {
                const url = process.env.REACT_APP_VISUALIZATION_PREFIX + visualization_data[v]
                return (
                  <>
                    <Typography className={classes.description}>
                      {filename_description_map[v]}
                    </Typography>
                    <img src={url} alt={v} className={classes.img} />
                    <Divider />
                  </>
                );
              })}
              {table_data ? Object.keys(table_data).map((key) => {
                return (
                  <>
                    <Typography className={classes.description}>
                      {filename_description_map[key]}
                    </Typography>
                    <CsvToHtmlTable
                      data={table_data[key]}
                      csvDelimiter=","
                      tableClassName="table table-striped table-hover"
                      hasHeader={true}
                    />
                    <Divider />
                  </>
                );
              }) : null}
            </AccordionDetails>
          </Accordion>
        )
      })}
    </>
  );
}

export default withLayout(CoursePage);
