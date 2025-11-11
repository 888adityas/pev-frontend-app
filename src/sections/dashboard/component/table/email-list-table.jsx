// components/DashboardTable/index.jsx

import { toast } from 'sonner';
import { useTheme } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, forwardRef, useCallback, useImperativeHandle } from 'react';

import {
  Tab,
  Box,
  Tabs,
  Card,
  Table,
  Button,
  Dialog,
  Divider,
  Tooltip,
  MenuList,
  MenuItem,
  TableBody,
  CardHeader,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import axios, { endpoints } from 'src/utils/axios';

import { varAlpha } from 'src/theme/styles';
import { fetchEmailLists } from 'src/redux/slice/emailListSlice';
// import { DASHBOARD_STATUS_OPTIONS } from 'src/_mock/_table/_apptable/_dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomPopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import {
  useTable,
  TableNoData,
  getComparator,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { MoveToFolderPopover } from 'src/sections/dialog-boxes/move-to-folder-dailog';

import { EmailListTableRow } from './email-list-table-row';
import { EmailListTableToolbar } from './email-list-table-toolbar';
import { DashboardTableFiltersResult } from './dashboard-table-filters-result';

const TABLE_HEAD = [
  {
    id: 'filename',
    label: 'Status/Name/Date',
    width: 400,
    whiteSpace: 'nowrap',
    tooltip: 'View email verification status, email list name and upload date.',
  },
  {
    id: 'consumed',
    label: 'Number of Emails/Credits Consumed',
    width: 400,
    whiteSpace: 'nowrap',
    tooltip:
      'View the number of email addresses in the uploaded email list and the verification credits used.',
  },
  {
    id: 'action',
    label: 'Action',
    width: 300,
    whiteSpace: 'nowrap',
    align: 'right',
    tooltip: 'View option to start email verification and download the verification report.',
  },
  { id: '', width: 10 },
];

// utils/filterUtils.js
function applyFilter({ inputData, comparator, filters }) {
  const { status, name } = filters;

  let filteredData = [...inputData];

  if (name) {
    filteredData = filteredData.filter((item) =>
      item.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (status !== 'all') {
    filteredData = filteredData.filter((item) => item.status === status);
  }

  const stabilizedThis = filteredData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}

// export function EmailListsTable() {
export const EmailListsTable = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const [reload, setReload] = useState(false);
  const [timezone, setTimezone] = useState(null);

  // Expose functions to parent
  useImperativeHandle(ref, () => ({
    reloadTable() {
      setReload((prev) => !prev);
    },
  }));

  // Email Lists Data from redux store
  const {
    data: emailLists,
    totalCount,
    getStatus,
    getError,
    status_summary,
  } = useSelector((state) => state.emailList.email_lists);

  const STATUS_OPTIONS = status_summary?.map((item) => {
    const obj = {
      value: item.value,
      label: item.label,
      count: item.count,
    };
    return obj;
  });
  const theme = useTheme();
  const table = useTable({ defaultOrderBy: 'orderNumber' });

  const [tableData, setTableData] = useState(
    emailLists?.map((item, index) => ({
      ...item,
      id: item._id,
      status: item.status,
      name: item.name,
      numberOfEmails: item.total_emails,
      creditconsumed: item.credit_consumed,
    }))
  );
  useEffect(() => {
    if (emailLists && emailLists.length > 0) {
      setTableData(
        emailLists.map((item) => ({
          ...item,
          id: item._id,
          status: item.status,
          name: item.name,
          numberOfEmails: item.total_emails,
          creditconsumed: item.credit_consumed,
          date: new Date(item.date).toLocaleDateString(),
        }))
      );
    }
  }, [emailLists]);

  const filters = useSetState({
    name: '',
    status: 'all',
  });

  const [processingRowId, setProcessingRowId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const confirmDelete = useBoolean();
  const isStartVerification = useSelector((state) => state.fileUpload.isStartVerification);
  const isVerificationCompleted = useSelector((state) => state.fileUpload.isVerificationCompleted);

  // Effect Hooks
  useEffect(() => {
    if (isVerificationCompleted && processingRowId !== null) {
      setTableData((prevData) =>
        prevData.map((row) => (row.id === processingRowId ? { ...row, status: 'verified' } : row))
      );
      setProcessingRowId(null);
    }
  }, [isVerificationCompleted, processingRowId]);

  const [creditDialogOpen, setCreditDialogOpen] = useState(false);

  const handleDialogClose = () => {
    setCreditDialogOpen(false);
  };

  const handleBuyCredits = () => {
    // Handle buy credits action
    setCreditDialogOpen(false);
    // Optionally navigate to credits purchase page
    // navigate('/credits/purchase');
  };

  const handleStartVerification = (rowId) => {
    const targetRow = tableData.find((item) => item.id === rowId);

    if (targetRow.requiresCredits) {
      setCreditDialogOpen(true);
      return;
    }

    setProcessingRowId(rowId);
    setTableData((prevData) =>
      prevData.map((item) => {
        if (item.id === rowId) {
          return {
            ...item,
            status: 'processing',
            creditconsumed: `${item.numberOfEmails}`,
          };
        }
        return item;
      })
    );
  };

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );

  const handleOpenPopover = (event, row) => {
    if (row.status !== 'processing') {
      setAnchorEl(event.currentTarget);
      setSelectedRow(row);
    }
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleConfirmDelete = () => {
    confirmDelete.onTrue();
    handleClosePopover();
  };

  const handleDelete = async (sRow) => {
    confirmDelete.onFalse();
    handleClosePopover();

    if (!sRow) return;
    if (!sRow.bulk_verify_id && !sRow._id) return;

    try {
      const params = {
        jobId: sRow.bulk_verify_id,
        listId: sRow._id,
      };
      const response = await axios.delete(endpoints.verifyEmail.deleteEmailList, { params });
      if (response.data) {
        toast.success(`Email list deleted successfully.`, {
          style: {
            marginTop: '15px',
          },
        });
      }
    } catch (error) {
      console.log(error.response?.data ?? error.message);

      toast.error(`${error.response?.data ?? error.message}`, {
        style: {
          marginTop: '15px',
        },
      });
    }

    dispatch(
      fetchEmailLists({
        limit: table.rowsPerPage,
        skip: table.page * table.rowsPerPage,
        sort_order: 'desc',
      })
    );
  };

  // Computed values
  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const canReset =
    !!filters.state.name ||
    filters.state.status !== 'all' ||
    (!!filters.state.startDate && !!filters.state.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;
  const [openMoveFolder, setOpenMoveFolder] = useState(false);

  // Add this handler in DashboardTrashTable component
  const handleMoveToFolder = () => {
    setOpenMoveFolder(true);
    handleClosePopover();
  };

  const getTimezone = async () => {
    const response = await axios.get(endpoints.auth.timezone);
    const { data } = response;

    if (data.status === 'success') setTimezone(data?.data);
  };

  // ====== DATA FETCHING ==============
  useEffect(() => {
    // Dispatch email lists from redux store
    dispatch(
      fetchEmailLists({
        limit: table.rowsPerPage,
        skip: table.page * table.rowsPerPage,
        sort_order: 'desc',
      })
    );

    getTimezone();
  }, [dispatch, table.page, table.rowsPerPage, reload]);

  return (
    <Card>
      <CardHeader
        title={
          <Box display="inline-block">
            <Tooltip title="Email Lists Table" arrow placement="top">
              <Typography
                variant="h6"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: { xs: '200px', md: '500px' },
                }}
              >
                Email Lists
              </Typography>
            </Tooltip>
          </Box>
        }
        subheader="Verify and manage all your uploaded email lists here."
        sx={{ pb: 3 }}
      />
      <Divider />
      {/* Filter Tabs */}
      <Tabs
        value={filters.state.status}
        onChange={handleFilterStatus}
        sx={{
          px: 2.5,
          boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
        }}
      >
        {STATUS_OPTIONS?.map((tab) => (
          <Tab
            key={tab.value}
            onClick={() => {
              if (tab.value === 'all') {
                dispatch(
                  fetchEmailLists({
                    limit: table.rowsPerPage,
                    skip: table.page * table.rowsPerPage,
                    sort_order: 'desc',
                  })
                );
              } else {
                dispatch(
                  fetchEmailLists({
                    limit: table.rowsPerPage,
                    skip: table.page * table.rowsPerPage,
                    sort_order: 'desc',
                    status: tab.value,
                  })
                );
              }
            }}
            iconPosition="end"
            value={tab.value}
            label={
              <Tooltip disableInteractive placement="top" arrow title={tab.tooltip}>
                <span>{tab.label}</span>
              </Tooltip>
            }
            icon={
              <Label
                variant={
                  ((tab.value === 'all' || tab.value === filters.state.status) && 'filled') ||
                  'soft'
                }
                color={
                  (tab.value === 'verified' && 'success') ||
                  (tab.value === 'processing' && 'info') ||
                  (tab.value === 'uploading' && 'warning') ||
                  (tab.value === 'unverified' && 'error') ||
                  'default'
                }
              >
                {/* {['verified', 'processing', 'uploading', 'unverified'].includes(tab.value)
                  ? tableData.filter((user) => user.status === tab.value).length
                  : tableData.length} */}
                {tab.count}
              </Label>
            }
          />
        ))}
      </Tabs>

      <EmailListTableToolbar
        filters={filters}
        onResetPage={table.onResetPage}
        numSelected={table.selected.length}
        setReload={setReload}
      />

      {canReset && (
        <DashboardTableFiltersResult
          filters={filters}
          totalResults={dataFiltered.length}
          onResetPage={() => {
            console.log('thisss');
            dispatch(
              fetchEmailLists({
                limit: table.rowsPerPage,
                skip: table.page * table.rowsPerPage,
                sort_order: 'desc',
              })
            );
            table.onResetPage();
          }}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}

      <Box sx={{ position: 'relative' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'}>
            <TableHeadCustom
              showCheckbox
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={dataFiltered.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
            />
            {/* Main Table starts from here */}
            <TableBody>
              {dataFiltered?.map((row, index) => (
                <EmailListTableRow
                  key={row._id}
                  row={row}
                  selected={table.selected.includes(row.id)}
                  onSelectRow={() => table.onSelectRow(row.id)}
                  onOpenPopover={(event) => handleOpenPopover(event, row)}
                  dashboardTableIndex={table.page * table.rowsPerPage + index}
                  onStartVerification={() => handleStartVerification(row.id)}
                  isProcessing={processingRowId === row.id && isStartVerification}
                  isCompleted={processingRowId === row.id && isVerificationCompleted}
                  setReload={setReload}
                  TIMEZONE={timezone}
                />
              ))}

              {tableData.length === 0 ? (
                <TableNoData
                  title="Not Data Found"
                  description="No data found in the table"
                  notFound={notFound}
                />
              ) : (
                <TableNoData
                  title="Not Search Found"
                  description={`No search found with keyword "${filters.state.name}"`}
                  notFound={notFound}
                />
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Box>

      <CustomPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          {selectedRow && selectedRow.status !== 'processing' && (
            <>
              {/* <Tooltip title="Move to folder" arrow placement="left">
                <MenuItem onClick={handleMoveToFolder}>
                  <Iconify icon="fluent:folder-move-16-filled" />
                  Move to folder
                </MenuItem>
              </Tooltip>
              <Divider style={{ borderStyle: 'dashed' }} /> */}
              <Tooltip title="Delete email list." arrow placement="left">
                <MenuItem
                  // onClick={handleConfirmDelete}
                  onClick={() => handleDelete(selectedRow)}
                  sx={{ color: 'error.main' }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" />
                  Delete
                </MenuItem>
              </Tooltip>
            </>
          )}
        </MenuList>
      </CustomPopover>
      <MoveToFolderPopover
        open={openMoveFolder}
        onClose={() => {
          setOpenMoveFolder(false);
          setSelectedRow(null);
        }}
      />
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Do you really want to delete the email list?"
        content="Note that when an email list is deleted it is moved to the trash folder."
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        }
      />

      <Dialog open={creditDialogOpen} onClose={handleDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {/* <Iconify icon="mdi:credit-card-outline" /> */}
          Upgrade
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2">
            You don&apos;t have enough credits to verify the email list. Please purchase more
            credits to start email verification.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ pb: 3, gap: 1 }}>
          <Button
            target="blank"
            href="https://www.pabbly.com/email-list-cleaning/#pricing"
            color="primary"
            variant="contained"
          >
            Upgrade Now
          </Button>
          <Button onClick={handleDialogClose} color="inherit" variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <TablePaginationCustom
        page={table.page}
        count={totalCount}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onChangeDense={table.onChangeDense}
        onRowsPerPageChange={table.onChangeRowsPerPage}
      />
    </Card>
  );
});
