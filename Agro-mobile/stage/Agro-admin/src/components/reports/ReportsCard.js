import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import FlagIcon from "@mui/icons-material/Flag";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Grid,
  CardContent,
  Avatar,
  ListItemAvatar,
  List,
  ListItem,
  Typography,
  ListItemText,
  Divider,
  ListItemButton,
  Button,
} from "@mui/material";

// project imports
import MainCard from "../ui/cards/MainCard";
import SkeletonPopularCard from "../ui/skeletons/LinksCard";
import settings from "../../../package.json";
import { BsGlobeAmericas, BsFillBookmarkCheckFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import { getReportComments } from "../../api/CommentsApi";
import GroupIcon from "@mui/icons-material/Group";

function ReportsCard() {
  //1) Data
  const [reports, setreports] = useState([]);
  const theme = useTheme();
  const User = useSelector((state) => state.User.value);
  const [searchQuery, setSearchQuery] = useState("");
  const [Loading, setLoading] = useState(false);

  // 2) UseEffects

  useEffect(() => {
    getReportsFunction();
  }, []);

  // 3) Functions
  const getReportsFunction = async () => {
    try {
      setLoading(true);
      let url = settings["appSettings :"].baseUrl;
      let token = User.Token;

      const response = await getReportComments(url, token);
      const dataResponse = await response.json();

      console.log("DATA array RESPONSE:", dataResponse);

      if (dataResponse?.resultCode === 0) {
        //console.log("Links:", links);
        setreports(dataResponse.data);
      } else {
      }
      setLoading(false);
    } catch (error) {
      console.log("ERROR :", error);
      setLoading(false);
    }
  };

  //   const filteredUsers = users.filter((user) =>
  //     user.firstName.toLowerCase().includes(searchQuery.toLowerCase())
  //   );

  // 4) Styles

  const styles = {
    container: {
      backgroundColor: "#fff",
      maxWidth: "100%",
      padding: 15,
    },
    tableContainer: {
      overflowX: "auto",
    },
    tableWrapper: {
      width: "100%",
      overflowX: "auto",
    },
    listItem: {
      border: "1px solid lightgray",
      borderRadius: 10,
      paddingBottom: 10,
      marginBottom: 10,
      width: "100%",
    },
  };

  return Loading ? (
    <SkeletonPopularCard />
  ) : (
    <MainCard content={false}>
      <CardContent>
        <Grid item xs={12}>
          <List sx={{ py: 0, mx: -1 }}>
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
                  <GroupIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                sx={{
                  py: 0,
                }}
                primary={
                  <Typography color={theme.palette.primary.light} variant="h4">
                    Αναφορές
                  </Typography>
                }
                secondary={
                  <Typography
                    color="gray"
                    variant="p"
                    fontWeight={500}
                    fontSize={12}
                    style={{ cursor: "pointer" }}
                  >
                    Λίστα με όλους τα σχόλια που έχουν αναφερθεί.
                  </Typography>
                }
              />
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12} mt={3}>
          <div style={styles.tableWrapper}>
            {reports.map((item) => {
              return (
                <div style={styles.listItem}>
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          {" "}
                          <FlagIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={"Συντάκτης: " + item.author}
                        secondary={
                          <Grid container>
                            <Grid item xs={12}>
                              <Typography>
                                {"Περιεχόμενο: " + item.content}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography>
                                {"Δημοσιεύτηκε : " + item.publishedAt}
                              </Typography>
                            </Grid>
                          </Grid>
                        }
                      />
                    </ListItem>
                  </List>
                </div>
              );
            })}
          </div>
        </Grid>
      </CardContent>
    </MainCard>
  );
}

export default ReportsCard;
