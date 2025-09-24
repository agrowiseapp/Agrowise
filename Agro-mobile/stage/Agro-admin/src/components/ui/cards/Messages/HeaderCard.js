import PropTypes from "prop-types";

// material-ui
import { useTheme, styled } from "@mui/material/styles";
import {
  Avatar,
  Box,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

// project imports
import MainCard from "../MainCard";
import TotalIncomeCard from "../../skeletons/SmallCard";

// assets
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ArticleIcon from "@mui/icons-material/Article";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import { useEffect, useState } from "react";

// styles
const CardWrapper = styled(MainCard)(({ theme }) => ({
  overflow: "hidden",
  position: "relative",
  "&:after": {
    content: '""',
    position: "absolute",
    width: 210,
    height: 210,
    background: `linear-gradient(210.04deg, ${theme.palette.primary.dark} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
    borderRadius: "50%",
    top: -30,
    right: -180,
  },
  "&:before": {
    content: '""',
    position: "absolute",
    width: 210,
    height: 210,
    background: `linear-gradient(140.9deg, ${theme.palette.primary.dark} -14.02%, rgba(144, 202, 249, 0) 70.50%)`,
    borderRadius: "50%",
    top: -160,
    right: -130,
  },
}));

// ==============================|| DASHBOARD - TOTAL INCOME LIGHT CARD ||============================== //

const HeaderCard = ({
  isLoading,
  secondary,
  setFilteredMessages,
  messages,
}) => {
  // 1) Data
  const theme = useTheme();
  const [firstLoad, setfirstLoad] = useState(false);
  const [text, setText] = useState("");
  const [filter, setfilter] = useState(1);

  // 2) useEffects
  useEffect(() => {
    if (firstLoad) {
      setfirstLoad(false);
    } else {
      // setLoading(true);
      applyFilters(text, filter);
    }

    return;
  }, [text]);

  // 3) Functions
  const handleChangeFilter = (event) => {
    setfilter(event.target.value);

    applyFilters(null, event.target.value);
  };

  const applyFilters = async (txt, filt) => {
    if (messages == null) return;
    let result = null;
    if (txt == null) txt = text;
    try {
      result = messages.filter((msg) =>
        msg.user.toLowerCase().includes(txt.toLowerCase())
      );

      // setLoading(false);
    } catch (error) {
      console.log("Error :", error);
      // setLoading(false);
    }

    if (filt === 2) {
      try {
        result = result.filter((msg) => msg.adminRead == false);

        // setLoading(false);
      } catch (error) {
        console.log("Error :", error);
        // setLoading(false);
      }
    }

    setFilteredMessages(result);
  };

  return (
    <>
      {isLoading ? (
        <TotalIncomeCard />
      ) : (
        <CardWrapper border={false} content={false}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={1}>
              {/* Number of messages */}
              <Grid item xs={12} md={12}>
                <List sx={{ py: 0 }}>
                  <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        sx={{
                          ...theme.typography.commonAvatar,
                          ...theme.typography.largeAvatar,
                          backgroundColor: theme.palette.primary.dark,
                          color: theme.palette.primary.light,
                        }}
                      >
                        <ArticleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      sx={{
                        py: 0,
                        mt: 0.45,
                        mb: 0.45,
                      }}
                      primary={
                        <Typography
                          color={theme.palette.primary.main}
                          variant="h4"
                        >
                          Ενημέρωση
                        </Typography>
                      }
                      secondary={secondary}
                    />
                  </ListItem>
                </List>
              </Grid>

              {/* Search bar */}
              <Grid item xs={6} sm={12} md={6}>
                <TextField
                  style={{ width: "100%" }}
                  placeholder="Αναζήτηση"
                  id="input-with-icon-textfield"
                  size="small"
                  value={text}
                  onChange={(type) => setText(type.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TroubleshootIcon
                          style={{ color: theme.palette.primary.main }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* filters */}
              <Grid item xs={6} sm={12} md={6}>
                <FormControl sx={{ minWidth: "100%" }} size="small">
                  <InputLabel id="demo-select-small-label">
                    Φιλτράρισμα
                  </InputLabel>
                  <Select
                    fullWidth
                    labelId="demo-select-small-label"
                    id="demo-select-small"
                    value={filter}
                    label="Φιλτράρισμα"
                    onChange={handleChangeFilter}
                  >
                    <MenuItem value={1}>Πρόσφατα</MenuItem>
                    <MenuItem value={2}>Αδιάβαστα</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

HeaderCard.propTypes = {
  isLoading: PropTypes.bool,
};

export default HeaderCard;
