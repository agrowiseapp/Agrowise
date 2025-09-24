import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const SessionTimer = ({ formattedTime, remainingTime }) => {
  const theme = useTheme();
  
  // Determine color based on remaining time
  const getTimerColor = (time) => {
    if (time <= 120000) { // Last 2 minutes
      return 'error';
    } else if (time <= 300000) { // Last 5 minutes
      return 'warning';
    }
    return 'primary';
  };

  const color = getTimerColor(remainingTime);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: theme.spacing(2),
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Chip
        icon={<AccessTimeIcon />}
        label={`Αυτόματη αποσύνδεση: ${formattedTime}`}
        color={color}
        variant="outlined"
        size="small"
        sx={{
          fontSize: '0.75rem',
          fontWeight: 'medium',
          '& .MuiChip-icon': {
            fontSize: '1rem'
          }
        }}
      />
    </Box>
  );
};

export default SessionTimer;