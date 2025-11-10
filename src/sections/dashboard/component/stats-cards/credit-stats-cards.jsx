import React from 'react';

import { Box } from '@mui/material';

import StatsCards from 'src/components/stats-card/stats-card';

export default function CreditStatsCards({ credit_stats }) {
  return (
    <Box
      width="100%"
      sx={{
        mb: 3,
        gap: 3,
        display: 'grid',
        flexWrap: 'wrap',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
      }}
    >
      <StatsCards
        cardtitle="Email Credits Consumed"
        cardstats={credit_stats?.credits_consumed ?? '...'}
        icon_name="Processed.svg"
        icon_color="#10CBF3"
        bg_gradient="#10CBF3"
        tooltipTittle="Number of emails credits consumed by your account."
      />
      <StatsCards
        cardtitle="Email Credits Remaining"
        cardstats={credit_stats?.credits_remaining ?? '...'}
        icon_name="Complete.svg"
        icon_color="#1D88FA"
        bg_gradient="#1D88FA"
        tooltipTittle="Number of emails credits remaining in your account."
      />
      <StatsCards
        cardtitle="Total Number of Email Lists"
        cardstats={credit_stats?.total_count_of_email_lists ?? '...'}
        icon_name="list.svg"
        icon_color="#28a645"
        bg_gradient="#28a645"
        tooltipTittle="Number of email lists uploaded in your account."
      />
    </Box>
  );
}
