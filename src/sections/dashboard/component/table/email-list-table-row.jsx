import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import {
  Box,
  Link,
  Drawer,
  Tooltip,
  Checkbox,
  IconButton,
  Typography,
  Backdrop as MuiBackdrop,
} from '@mui/material';

import { startVerification } from 'src/redux/slice/upload-slice';
import { fetchEmailListStatus, startBulkVerification } from 'src/redux/slice/emailListSlice';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';

import { DashboardChart } from '../chart/dashboard-chart';

// Custom backdrop for transparent background
const CustomBackdrop = (props) => (
  <MuiBackdrop {...props} sx={{ backgroundColor: 'transparent' }} />
);

export function EmailListTableRow({
  onSelectRow,
  row,
  selected,
  dashboardTableIndex,
  onOpenPopover,
  onViewReport,
  onStartVerification,
  isProcessing,
  isCompleted,
  setReload,
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [alertState, setAlertState] = useState(null);

  const csvfilesname = [{ name: row.name, numberOfEmails: row.numberOfEmails }];
  const timezone = '(UTC+05:30) Asia/Kolkata';
  const currentFile = csvfilesname[dashboardTableIndex % csvfilesname.length];
  const navigate = useNavigate();
  const popover = usePopover();
  const dispatch = useDispatch();

  const showAlert = (type, title, message) => {
    console.log(`Alert Type: ${type}, Title: ${title}, Message: ${message}`);
  };

  const handleAlertClose = () => {
    console.log('Alert closed');
  };

  const handleStartVerification = () => {
    onStartVerification();
    dispatch(startVerification());
  };

  const handleStartBulkVerification = async () => {
    if (!row.requiresCredits) {
      const res = await dispatch(
        startBulkVerification({ jobId: row.bulk_verify_id, listId: row._id })
      ); // async thunk to start verification
      console.log('res: ', res);
      let error = null;
      if (res.error.message && res.payload === 'Permission denied: Read-only access') {
        error = 'Permission denied: Read-only access';
      } else {
        error = res.error.message;
      }
      if (error) {
        toast.error(error);
      }
      dispatch(startVerification());
      setTimeout(() => {
        setReload((prev) => !prev);
      }, 3000);
    }
  };

  // row actions
  const handleAction = async () => {
    switch (row.status) {
      case 'unverified':
        onStartVerification();
        handleStartBulkVerification();
        break;
      case 'verified':
        setIsDrawerOpen(true);
        break;
      case 'verifying':
        console.log('Checking status...');
        dispatch(fetchEmailListStatus({ jobId: row.bulk_verify_id }));

        setTimeout(() => {
          setReload((prev) => !prev);
        }, 3000);
        break;
      case 'processing':
        if (row.status === 'processing') {
          dispatch(fetchEmailListStatus({ jobId: row.bulk_verify_id }));
        }
        setIsDrawerOpen(true);
        dispatch(startVerification());
        break;
      default:
        break;
    }
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'verifying':
        return 'warning';
      case 'processing':
        return 'info';
      case 'unverified':
        return 'error';
      default:
        return 'default';
    }
  };

  // Button text mapping
  const getButtonText = (status) => {
    switch (status) {
      case 'verified':
        return 'Download Report';
      case 'processing':
        return 'Verification In Progress';
      case 'verifying':
        return 'Check Status';
      case 'unverified':
        return 'Start Verification';
      default:
        return '';
    }
  };

  const renderPrimary = (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Select" arrow placement="top">
            <Checkbox
              checked={selected}
              onClick={onSelectRow}
              inputProps={{ id: `row-checkbox-${row.id}`, 'aria-label': `Row checkbox` }}
            />
          </Tooltip>
        </TableCell>
        <TableCell width={400}>
          <Stack
            spacing={2}
            direction="row"
            alignItems="center"
            sx={{
              typography: 'body2',
              flex: '1 1 auto',
              alignItems: 'flex-start',
            }}
          >
            <Tooltip
              title={
                row.status === 'processing'
                  ? ' Email list is currently under the verification process.'
                  : row.status === 'verifying'
                    ? 'Email list is currently being verified.'
                    : row.status === 'verified'
                      ? 'Verification for the email list is done.'
                      : ' Email list has been uploaded but verification has not yet started.'
              }
              arrow
              placement="top"
              disableInteractive
            >
              <Label variant="soft" color={getStatusColor(row.status)}>
                {row.status}
              </Label>
            </Tooltip>
          </Stack>
          <Stack spacing={2} direction="row" alignItems="center">
            <Tooltip
              title={
                <>
                  Email List Name: {currentFile.name}
                  {/* ({currentFile.numberOfEmails}) */}
                </>
              }
              arrow
              placement="top"
              disableInteractive
            >
              <Typography
                component="span"
                fontSize={14}
                sx={{
                  mt: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '300px',
                }}
              >
                {currentFile.name}
                {/* ({currentFile.numberOfEmails}) */}
              </Typography>
            </Tooltip>
          </Stack>
          <Stack spacing={2} direction="row" alignItems="center">
            <Tooltip
              arrow
              placement="top"
              disableInteractive
              title={`Email List Uploaded: ${row.date}, ${timezone}`}
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
                {dayjs(row.createdAt).toString()}
              </Box>
            </Tooltip>
          </Stack>
        </TableCell>
        <TableCell width={400}>
          <Stack spacing={2} direction="row" alignItems="center">
            <Tooltip
              title="Number of email addresses in the uploaded email list."
              arrow
              placement="top"
              disableInteractive
            >
              <Typography
                component="span"
                fontSize={14}
                sx={{
                  mt: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '300px',
                }}
              >
                Contains {currentFile.numberOfEmails} Emails
              </Typography>
            </Tooltip>
          </Stack>
          <Stack spacing={2} direction="row" alignItems="center">
            {(row.status === 'processing' || row.status === 'verified') && (
              <Tooltip
                arrow
                placement="top"
                disableInteractive
                title="Number of email credits used for verification."
              >
                <Typography
                  component="span"
                  sx={{
                    color: 'success.main',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '300px',
                    display: 'inline-block',
                    fontSize: '14px',
                  }}
                >
                  {`${row.creditconsumed || currentFile.numberOfEmails} Credit Consumed`}
                </Typography>
              </Tooltip>
            )}
          </Stack>
        </TableCell>
        <TableCell width={300} align="right" sx={{ pr: 1 }}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip
              title={
                row.status === 'processing'
                  ? 'Verification in progress. Please wait.'
                  : row.status === 'verified'
                    ? 'Click to download report.'
                    : 'Click to start verification.'
              }
              arrow
              placement="top"
              disableInteractive
            >
              <Button variant="outlined" color="primary" onClick={handleAction}>
                {getButtonText(row.status)}
              </Button>
            </Tooltip>
          </Stack>
        </TableCell>
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip
            title={
              row.status === 'processing' || row.status === 'verifying'
                ? 'Click to refresh status.'
                : 'Click for more options.'
            }
            arrow
            placement="top"
          >
            <span>
              <IconButton
                color={popover.open ? 'inherit' : 'default'}
                onClick={(event) => onOpenPopover(event)}
                disabled={row.status === 'processing' || row.status === 'verfying'}
                sx={{
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  },
                }}
              >
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            </span>
          </Tooltip>
        </TableCell>
      </TableRow>
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: {
              xs: '100%',
              md: '600px',
            },
            p: 3,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6">
              {/* {row.status === 'completed' ? 'Verification Report' : 'Verification Progress'} */}
              Verification Report
            </Typography>
            <Typography variant="h8">
              <span>
                Check the full details of email verification here.{' '}
                <Link
                  href="https://forum.pabbly.com/threads/verification-report.26340/"
                  style={{ color: '#078DEE' }}
                  underline="always"
                  target="_blank"
                >
                  Learn more
                </Link>
              </span>
            </Typography>
          </Box>

          <IconButton onClick={() => setIsDrawerOpen(false)}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>

        <DashboardChart
          showAlert={showAlert}
          handleAlertClose={handleAlertClose}
          title={currentFile.name}
          row={row}
          chart={{
            series: [
              { label: 'Deliverable Emailss', value: row.deliverable },
              { label: 'Undeliverable Emails', value: row.undeliverable },
              { label: 'Accept-all Emails', value: row.accept_all },
              { label: 'Unknown Emails', value: row.unknown },
            ],
            totalEmails: row.total_emails,
          }}
          setIsDrawerOpen={setIsDrawerOpen}
          setReload={setReload}
        />
      </Drawer>
    </>
  );

  return renderPrimary;
}
