import { createTheme } from "@mui/material";
// it could be your App.tsx file or theme file that is included in your tsconfig.json
import { Theme } from '@mui/material/styles';

declare module '@mui/styles/defaultTheme' {
  interface DefaultTheme extends Theme { }
}

export const mainTheme = createTheme({
  // props: {
  //   MuiCheckbox: {
  //     disableRipple: true,
  //   },
  //   MuiSwitch: {
  //     disableRipple: true,
  //   },
  //   MuiButtonBase: {
  //     // The properties to apply
  //     disableRipple: true, // No more ripple, on the whole application 💣!
  //   },
  // },
  palette: {
    primary: {
      main: "#002A60",
    },
    secondary: {
      main: "#8D9198",
    },
    background: {
      default: "white",
      paper: "white",
    },
    text: {
      primary: "#1B2431",
      secondary: "#8D9198",
    },
  },
  typography: {
    fontFamily: [
      "CircularStd",
      "Roboto",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    h1: {
      fontSize: "64px",
      fontWeight: 600,
    },
    h2: {
      fontSize: "24px",
      fontWeight: 600,
    },
    h3: {
      fontSize: "19px",
      fontWeight: 400,
    },
    h4: {
      fontSize: "18px",
      fontWeight: 400,
    },
    h5: {
      fontSize: "16px",
      fontWeight: 400,
    },
    h6: {},
    caption: {},
    body1: {
      fontSize: "16px",
    },
    body2: {
      fontSize: "12px",
    },
    button: {
      fontSize: "16px",
      textTransform: "none",
      fontWeight: "normal",
    },
  },
  shape: {
    borderRadius: 8,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 700,
      md: 960,
      lg: 1128,
      xl: 1920,
    },
  },
  // overrides: {
  //   MuiButton: {
  //     root: {
  //       textTransform: "none",
  //     },
  //     textPrimary: {
  //       color: "#EA7F38",

  //       "&:hover": {
  //         color: "#D87533",
  //       },
  //     },
  //     outlinedPrimary: {
  //       borderColor: "#EDE9FB",
  //       transition: "0.3s ease-in-out",

  //       "&:hover": {
  //         borderColor: "#532BDC",
  //         backgroundColor: "white",
  //       },
  //     },
  //     containedPrimary: {
  //       backgroundColor: "#532BDC",
  //       boxShadow: "none",
  //       "&:hover": {
  //         backgroundColor: "#4621C5",
  //         boxShadow: "none",
  //       },
  //       "&:disabled": {
  //         backgroundColor: "#F2F2F2",
  //         color: "#8D9198",
  //       },
  //     },
  //   },
  //   MuiIcon: {
  //     fontSizeSmall: {
  //       fontSize: "14px",
  //     },
  //     fontSizeLarge: {
  //       fontSize: "20px",
  //     },
  //   },
  //   // MuiIconButton: {
  //   //   root: {
  //   //     padding: "8px",
  //   //   },
  //   //   sizeSmall: {
  //   //     height: "24px",
  //   //     width: "24px",
  //   //     padding: "8px",
  //   //   },
  //   // },
  //   MuiCheckbox: {
  //     colorPrimary: {
  //       color: "#FFFFFF",
  //       "&$checked": {
  //         backgroundColor: "#532BDC",
  //         color: "#532BDC",
  //       },
  //     },
  //     root: {
  //       borderRadius: "3px",
  //       border: " 1px solid #532BDC",
  //       width: "16px",
  //       height: "16px",
  //       "&$root$root:hover": {
  //         backgroundColor: "#EDE9FB",
  //         "&$checked": {
  //           backgroundColor: "#532BDC",
  //         },
  //       },
  //     },
  //   },
  //   MuiMenuItem: {
  //     root: {
  //       shadow: "none",
  //       height: 44,
  //     },
  //   },
  //   MuiMenu: {
  //     paper: {
  //       background: "#FFFFFF",
  //       boxShadow: "0px 8px 24px rgba(27, 36, 49, 0.08)",
  //       borderRadius: "6px",
  //       padding: 0,
  //     },
  //     list: {
  //       padding: 0,
  //     },
  //   },
  //   MuiSwitch: {
  //     colorPrimary: {
  //       color: "white",
  //       "&$checked": {
  //         color: "white",
  //       },
  //     },
  //     root: {
  //       width: 37,
  //       height: 20,
  //       padding: 0,
  //     },
  //     switchBase: {
  //       padding: 2,
  //       color: "white",
  //       "&$checked": {
  //         transform: "translateX(16px)",
  //         "& + $track": {
  //           backgroundColor: "#532BDC",
  //           opacity: 1,
  //           borderColor: "none",
  //         },
  //       },
  //     },
  //     thumb: {
  //       width: 16,
  //       height: 16,
  //       boxShadow: "none",
  //     },
  //     track: {
  //       borderRadius: 20 / 2,
  //       backgroundColor: "#EDE9FB",
  //       opacity: 1,
  //       //  transition: theme.transitions.create(["background-color", "border"]),
  //     },
  //   },
  //   MuiSvgIcon: {
  //     fontSizeSmall: {
  //       height: "20px",
  //       width: "20px",
  //     },
  //     fontSizeLarge: {},
  //   },
  //   // MuiLink: {
  //   //   root: {
  //   //     color: "#532BDC",
  //   //   },
  //   // },
  //   MuiOutlinedInput: {
  //     root: {
  //       "& $notchedOutline": {
  //         borderColor: "#DEE4ED",
  //       },
  //       "&:hover:not($disabled):not($focused):not($error) $notchedOutline": {
  //         borderColor: "#532BDC",
  //       },
  //       "&$focused $notchedOutline": {
  //         borderColor: "#532BDC",
  //       },
  //       "&$error $notchedOutline": {
  //         borderColor: "#E4593B",
  //       },
  //     },
  //   },
  // },
});
