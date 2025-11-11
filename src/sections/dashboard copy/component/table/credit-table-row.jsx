import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Tooltip } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fDateTimeTZ } from 'src/utils/format-time';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

export function CreditTableRow({ row, selected }) {
  const timezone = 'Asia/Kolkata';

  const getStatusTooltip = (status, dateTime) => {
    switch (status) {
      case 'single':
        return `Single email address was checked for verification.`;
      case 'bulk':
        return `Email list was uploaded and checked for verification.`;
      case 'Credit purchased':
        return `Customer has purchased email credits for email verification`;
      default:
        return '';
    }
  };

  return (
    <TableRow hover>
      <TableCell width={300}>
        <Stack spacing={2} direction="row" alignItems="center">
          <Tooltip
            arrow
            placement="top"
            disableInteractive
            title={getStatusTooltip(row?.source, row?.source)}
          >
            <Label
              variant="soft"
              color={row?.result && row?.result !== 'deliverable' ? 'error' : 'success'}
            >
              {row?.source}
            </Label>
          </Tooltip>
        </Stack>
        <Stack spacing={2} direction="row" alignItems="center" mt="4px">
          <Tooltip
            arrow
            placement="top"
            disableInteractive
            title={`Action occurred at: ${fDateTimeTZ(row.dateCreatedOn, timezone)}`}
          >
            <Box
              component="span"
              sx={{
                color: 'text.disabled',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '300px',
                display: 'inline-block',
              }}
            >
              {/* {dayjs(row.dateCreatedOn).format('MMM DD, YYYY HH:mm:ss')} */}
              {fDateTimeTZ(row.dateCreatedOn, timezone)}
            </Box>
          </Tooltip>
        </Stack>
      </TableCell>
      <TableCell width={200}>
        <Stack spacing={1}>
          {' '}
          <Box
            component="span"
            sx={{
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '300px',
              display: 'inline-block',
            }}
          >
            <Tooltip
              arrow
              placement="top"
              disableInteractive
              title={
                row?.source === 'credit purchased'
                  ? 'Email credits alloted to the account.'
                  : `${row?.source === 'single' ? 'Email address' : 'Email list'}: ${row?.summary}`
              }
            >
              <span>{row?.summary}</span>
            </Tooltip>
          </Box>
        </Stack>
        <Stack>
          <Box
            component="span"
            sx={{
              color: 'text.disabled',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '300px',
              display: 'inline-block',
              fontSize: '0.875rem',
            }}
          >
            {/* {row.source === 'single' ? (
              <Tooltip arrow placement="top" disableInteractive title="Email address">
                <span>Email address</span>{' '}
              </Tooltip>
            ) : (
              <Tooltip
                arrow
                placement="top"
                disableInteractive
                title={`Folder Name: ${row.folder}`}
              >
                <span>{row.folder}</span>{' '}
              </Tooltip>
            )} */}
          </Box>
        </Stack>
      </TableCell>
      <TableCell width={140} align="right">
        <Tooltip
          arrow
          placement="top"
          disableInteractive
          title={`${row.credits === 'Alloted' ? `Email credits allotted to the account.` : `Email credits consumed for verifying email.`}`}
        >
          <Box
            component="span"
            sx={{
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '300px',
              display: 'inline-block',
            }}
          >
            {row.noOfCredits}
          </Box>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
