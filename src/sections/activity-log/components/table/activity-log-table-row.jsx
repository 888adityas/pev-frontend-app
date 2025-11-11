import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Tooltip } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fDateTimeTZ } from 'src/utils/format-time';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

export function ActivityLogTableRow({ row, selected, onOpenDrawer, timezone }) {
  const getActionColor = (action) => {
    switch (action) {
      case 'POST':
        return 'success';
      case 'PATCH':
        return 'warning';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };
  const getActionLabel = (action) => {
    let str = action;
    if (str === 'POST') {
      str = 'Created';
    } else if (str === 'PATCH') {
      str = 'Updated';
    } else if (str === 'DELETE') {
      str = 'Deleted';
    }
    return str;
  };

  // Limit bullet points to a maximum of 20

  const renderPrimary = (
    <TableRow hover selected={selected} sx={{ cursor: 'pointer' }}>
      <TableCell>
        <Stack spacing="5px" direction="column">
          <Box>
            <Tooltip
              arrow
              placement="top"
              disableInteractive
              title={
                row.action === 'DELETE'
                  ? 'Deleted means actions like removing a team member or deleting an email list'
                  : row.action === 'PATCH'
                    ? 'Updated means actions like regenerating the API key or updating team member access permissions'
                    : row.action === 'POST'
                      ? 'Created means actions like starting email verification, uploading an email list, adding a team member, or downloading a verification report'
                      : `${row.action.charAt(0).toUpperCase() + row.action.slice(1)} action has been performed`
              }
            >
              <Label
                variant="soft"
                color={getActionColor(row.action)}
                sx={{ textTransform: 'capitalize' }}
              >
                {getActionLabel(row?.action)}
              </Label>
            </Tooltip>
          </Box>
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
            <Tooltip
              arrow
              placement="top"
              disableInteractive
              title={`Action Performed: ${fDateTimeTZ(row.date, timezone)}.`}
            >
              {/* {row?.date} */}
              {fDateTimeTZ(row.date, timezone)}
            </Tooltip>
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        <Stack direction="column">
          <Box
            component="span"
            sx={{
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '400px',
              display: 'inline-block',
            }}
          >
            <Tooltip
              arrow
              placement="top"
              disableInteractive
              title="Name of the actor who performed the activity."
            >
              <span> {row?.actor_name}</span>
            </Tooltip>
          </Box>

          <Box
            component="span"
            sx={{
              color: 'text.disabled',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '200px',
              display: 'inline-block',
            }}
          >
            <Tooltip
              arrow
              placement="top"
              disableInteractive
              title="Email address of the actor who performed the activity."
            >
              <span>{row?.actor_email}</span>
            </Tooltip>
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        <Stack direction="column">
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
              title="View the section where the action occurred."
            >
              <span>{row.module_name}</span>
            </Tooltip>
          </Box>

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
            {' '}
            <Tooltip
              arrow
              placement="top"
              disableInteractive
              title="View whether the action was performed by a user or an API."
            >
              <span>{row.source}</span>
            </Tooltip>
          </Box>
        </Stack>
      </TableCell>

      <TableCell align="right">
        <Tooltip
          arrow
          placement="top"
          disableInteractive
          title="Click to view the event data recorded during the action performed."
        >
          <Box
            onClick={() => onOpenDrawer(row)}
            component="span"
            sx={{
              color: '#078DEE',
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '300px',
              display: 'inline-block',
            }}
          >
            {row.activity_data}
          </Box>
        </Tooltip>
      </TableCell>
    </TableRow>
  );

  return <>{renderPrimary}</>;
}
