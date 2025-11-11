import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Box,
  Link,
  Grid,
  Button,
  Dialog,
  Popover,
  Tooltip,
  Divider,
  MenuList,
  MenuItem,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import axios, { endpoints } from 'src/utils/axios';

import { DashboardContent } from 'src/layouts/app';
import { fetchCreditStats } from 'src/redux/slice/creditSlice';
import { listItems } from 'src/_mock/app-big-card/_dashboardBigCardListItems';
import { uploadCsv, clearFileUpload, fetchEmailLists } from 'src/redux/slice/emailListSlice';

import { Iconify } from 'src/components/iconify';
import BigCard from 'src/components/app-big-card/big-card';
// import StatsCards from 'src/components/stats-card/stats-card';
import PageHeader from 'src/components/page-header/page-header';

import Upload from 'src/sections/dashboard/component/upload/upload-file';
import { FolderSection } from 'src/sections/dashboard/component/folder/dashboardfolder';
import { EmailListsTable } from 'src/sections/dashboard/component/table/email-list-table';
import CreditStatsCards from 'src/sections/dashboard/component/stats-cards/credit-stats-cards';
import VerifySingleEmail from 'src/sections/dashboard/component/verify-single-email/verify-single-email';
import { DashboardTrashTable } from 'src/sections/dashboard/component/dashboard-trash-table/dashboard-trash-table';

const metadata = { title: `Dashboard | Pabbly Email Verification` };
const { items, style } = listItems;

export default function Page() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [email, setEmail] = useState('');
  const [activeTable, setActiveTable] = useState('dashboard');
  const [selectedFolder, setSelectedFolder] = useState('Home');
  const [isFromSingleEmail, setIsFromSingleEmail] = useState(false);

  const [reload, setReload] = useState(false);

  const [listName, setListName] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();

  const { status: fileUploadStatus, error: fileUploadError } = useSelector(
    (state) => state.emailList.fileUpload
  );

  // Credit Statistics from redux store
  const { credit_stats } = useSelector((state) => state.creditStats);

  // Load Dashboard Data
  useEffect(() => {
    // fetch Dashboard credits statistics
    dispatch(fetchCreditStats());
  }, [dispatch, reload]);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: 'success',
    title: '',
    message: '',
    status: '',
  });

  const handlePopoverOpen = (event) => setAnchorEl(event.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);

  const handleTrashClick = () => {
    setActiveTable('trash');
  };

  const handleHomeClick = () => {
    setActiveTable('dashboard');
    setSelectedFolder('Home');
  };

  // Handle Verify Email [single]
  const handleVerify = async () => {
    setIsSubmitting(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsFromSingleEmail(true);

    if (emailRegex.test(email)) {
      try {
        const response = await axios.post(endpoints.verifyEmail.singleVerify, { email });
        console.log('response: ', response);

        if (response.data?.status === 'success' && response?.data?.data?.result === 'deliverable') {
          toast.success(`The email "${email}" is valid! `, {
            duration: Infinity,
            style: {
              marginTop: '15px',
            },
          });

          handleDialogClose('singleEmail');
          setReload((prev) => !prev);
        } else if (
          response.data?.status === 'success' &&
          response?.data?.data?.result !== 'deliverable'
        ) {
          throw new Error(`${email} is ${response?.data?.data?.result}`);
        }
      } catch (error) {
        const errorMsg = error.response?.data ?? error.message;
        console.log('Error: ', errorMsg);

        toast.error(`${errorMsg}`, {
          duration: Infinity,
          style: {
            marginTop: '15px',
          },
        });

        handleDialogClose('singleEmail');
      }
    } else {
      toast.error(`The input email is invalid!`, {
        duration: Infinity,
        style: {
          marginTop: '15px',
        },
      });
    }
    setEmail('');
    setIsSubmitting(false);
    dispatch(fetchCreditStats());
  };

  // Bulk verify .csv file upload with name
  const handleVerifyBulk = async (file) => {
    setCsvFile(file); // (if you’re keeping it in state)
  };

  // Upload .csv file
  const uploadCsvHandler = () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('name', listName);
    try {
      dispatch(uploadCsv(formData));
      toast.success(`Uploading file: ${listName} `, {
        duration: 3000,
        style: {
          marginTop: '15px',
        },
      });
      handleDialogClose('bulkEmail');
    } catch (error) {
      toast.error(error.message || `Something went wrong`, {
        duration: 5000,
        style: {
          marginTop: '15px',
        },
      });
      setIsSubmitting(false);
    }
    setIsSubmitting(false);
  };

  // Handle notificaions for file uploading, success or error case
  useMemo(() => {
    if (fileUploadStatus === 'success') {
      toast.success(`File uploaded successfully`, {
        duration: 5000,
        style: {
          marginTop: '15px',
        },
      });
      dispatch(fetchEmailLists({ sort_order: 'desc', limit: 5 })); /// fetchEmailLists
      dispatch(clearFileUpload());
      setIsSubmitting(false);
    } else if (fileUploadStatus === 'failed') {
      toast.error(fileUploadError || `Something went wrong`, {
        duration: Infinity,
        style: {
          marginTop: '15px',
        },
      });
      dispatch(clearFileUpload());
      setIsSubmitting(false);
    }
  }, [fileUploadStatus, fileUploadError, dispatch]);

  const [dialogState, setDialogState] = useState({
    singleEmail: false,
    bulkEmail: false,
  });

  const handleMenuItemClick = (type) => {
    setDialogState((prev) => ({
      ...prev,
      [type]: true,
    }));
    if (type !== 'singleEmail') {
      setIsFromSingleEmail(false);
    }
    handlePopoverClose();
  };

  const handleDialogClose = (type) => {
    setDialogState((prev) => ({
      ...prev,
      [type]: false,
    }));
  };

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DashboardContent maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: { xs: 'flex-start', lg: 'center' },
            justifyContent: 'space-between',
            mb: 0,
          }}
        >
          <PageHeader
            title="Dashboard"
            Subheading="Verify and manage all your email lists in one place with the Pabbly Email Verification Dashboard. "
            link_added="https://forum.pabbly.com/threads/dashboard.26311/"
          />
          <Tooltip
            title="Click to verify single or bulk email addresses."
            arrow
            placement="top"
            disableInteractive
          >
            <Button
              sx={{ mt: { xs: 1, lg: 0 } }}
              startIcon={<Iconify icon="heroicons:plus-circle-16-solid" />}
              endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
              onClick={handlePopoverOpen}
              color="primary"
              variant="contained"
              size="large"
            >
              Verify Email
            </Button>
          </Tooltip>
        </Box>

        {/* Credit statistics */}
        <Box marginTop={5}>
          <CreditStatsCards credit_stats={credit_stats} />
        </Box>

        {/* Verification Guidelines */}
        <Grid container spacing={3}>
          {/* Folder Section */}
          <Grid item xs={12} md={4} lg={3}>
            <FolderSection onHomeClick={handleHomeClick} onTrashClick={handleTrashClick} />
          </Grid>
          <Grid item xs={12} md={8} lg={9}>
            <BigCard
              tooltip="View file upload guidelines for email verification."
              getHelp={false}
              isVideo
              bigcardtitle="Verification Guidelines"
              bigcardsubtitle="Please adhere to the following guidelines when uploading your CSV file:"
              style={style}
              items={items}
              videoLink="https://www.youtube.com/embed/MIcaDmC_ngM?si=EJ1SGtn0tdF96b1y"
              thumbnailName="email-verication-video-thumbnail.jpg"
              keyword="Note:"
              learnMoreLink="https://forum.pabbly.com/threads/dashboard.26311/"
              bigcardNote="All data and reports older than 15 days will be permanently removed automatically. For reference, you can Download Sample File to guide you in formatting your data correctly."
              action={
                <Tooltip
                  title="Click to verify single or bulk email addresses."
                  arrow
                  placement="top"
                  disableInteractive
                >
                  <Button
                    startIcon={<Iconify icon="heroicons:plus-circle-16-solid" />}
                    endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                    onClick={handlePopoverOpen}
                    color="primary"
                    variant="outlined"
                    size="large"
                  >
                    Verify Email
                  </Button>
                </Tooltip>
              }
            />

            {/* Dashboard Table  */}
            <Box sx={{ mt: 3 }}>
              {activeTable === 'trash' ? (
                <DashboardTrashTable />
              ) : (
                <EmailListsTable selectedFolder={selectedFolder} />
              )}
            </Box>
          </Grid>
        </Grid>
      </DashboardContent>

      <Dialog
        open={dialogState.singleEmail}
        onClose={() => handleDialogClose('singleEmail')}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 'sm',
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <VerifySingleEmail
            onVerify={() => {
              handleVerify();
            }}
            email={email}
            setEmail={setEmail}
            onClose={() => handleDialogClose('singleEmail')}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogState.bulkEmail} onClose={() => handleDialogClose('bulkEmail')} fullWidth>
        <DialogTitle display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="h6">Verify Bulk Email List</Typography>
            <Typography mt="4px" fontSize="14px" color="text.secondary">
              Upload email list for bulk verification. Download{' '}
              <Link href="src/assets/sample-files/sample_csv.csv" download underline="always">
                sample file
              </Link>{' '}
              here.
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        {/* Bulk email verify upload csv */}
        <DialogContent sx={{ pt: 3 }}>
          <Upload
            setAlertState={setAlertState}
            listName={listName}
            setListName={setListName}
            handleVerifyBulk={handleVerifyBulk}
          />
        </DialogContent>

        <DialogActions>
          <Box
            sx={{
              mt: 1,
              pt: 0,
              gap: 1,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              disabled={isSubmitting}
              onClick={() => uploadCsvHandler()}
              variant="contained"
              color="primary"
            >
              Upload
            </Button>
            <Button onClick={() => handleDialogClose('bulkEmail')} variant="outlined">
              Cancel
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuList>
          <Tooltip
            title="Click to verify a single email."
            arrow
            placement="left"
            disableInteractive
          >
            <MenuItem onClick={() => handleMenuItemClick('singleEmail')}>
              Verify Single Email
            </MenuItem>
          </Tooltip>
          <Tooltip title="Click to verify bulk emails." arrow placement="left" disableInteractive>
            <MenuItem onClick={() => handleMenuItemClick('bulkEmail')}>Verify Bulk Emails</MenuItem>
          </Tooltip>
        </MenuList>
      </Popover>
    </>
  );
}
