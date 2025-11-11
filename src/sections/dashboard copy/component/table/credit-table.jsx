import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { Divider, CardHeader, Typography } from '@mui/material';

import { useSetState } from 'src/hooks/use-set-state';

import { fIsBetween } from 'src/utils/format-time';

import { fetchEmailVerificationLogs } from 'src/redux/slice/logsSlice';

import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  getComparator,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { CreditTableRow } from './credit-table-row';
import { CreditTableToolbar } from './credit-table-toolbar';
import { CreditTableFiltersResult } from './credit-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'statusdate', label: 'Status/Date', tooltip: 'View type and timestamp' },
  { id: 'verificationsummary', label: 'Verification Summary' },
  { id: 'credits', label: 'Credits', align: 'right', tooltip: 'Credit usage details' },
];

// ----------------------------------------------------------------------

export function CreditTable() {
  const filters = useSetState({
    name: '',
    status: 'all',
  });
  const dispatch = useDispatch();
  const [reload, setReload] = useState(false);
  const table = useTable({ defaultOrderBy: 'createdAt' });

  // Redux store
  const {
    status,
    data: emailVerificationLogs = [],
    totalCount,
  } = useSelector((state) => state.logs?.emailVerificationLogs || {});

  const [tableData, setTableData] = useState([]);

  // 🔹 Update table data when API data changes
  useEffect(() => {
    if (emailVerificationLogs && Array.isArray(emailVerificationLogs)) {
      const mapped = emailVerificationLogs?.map((item) => ({
        ...item,
        id: item._id,
        dateCreatedOn: item?.createdAt,
        credits: item?.credits_used ? 'Consumed' : 'Alloted',
        noOfCredits: item.credits,
      }));
      setTableData(mapped);
    } else {
      setTableData([]);
    }
  }, [emailVerificationLogs]);

  //  Fetch Verification Logs
  // useEffect(() => {
  //   const para = {
  //     limit: table.rowsPerPage,
  //     sort_order: 'desc',
  //     skip: table.page * table.rowsPerPage,
  //   };
  //   dispatch(fetchEmailVerificationLogs(para));
  // }, [dispatch, table.page, table.rowsPerPage, reload]);

  // Search Input handler
  useEffect(() => {
    const handler = setTimeout(() => {
      const search = filters?.state?.name;
      if (search) {
        const para = {
          limit: table.rowsPerPage,
          skip: table.page * table.rowsPerPage,
          sort_order: 'desc',
          search,
        };
        dispatch(fetchEmailVerificationLogs(para));
      } else {
        const para = {
          limit: table.rowsPerPage,
          skip: table.page * table.rowsPerPage,
          sort_order: 'desc',
        };
        dispatch(fetchEmailVerificationLogs(para));
      }
    }, 800);

    return () => {
      clearTimeout(handler);
    };
  }, [filters.state.name, dispatch, table.page, table.rowsPerPage, reload]);

  const getFilteredLogs = async (selectedstatus) => {
    let filterStatus = selectedstatus?.toLowerCase();
    if (filterStatus?.includes('single')) filterStatus = 'single';
    if (filterStatus?.includes('bulk')) filterStatus = 'bulk';
    if (filterStatus?.includes('purchased')) filterStatus = 'credit purchased';
    const para = {
      limit: table.rowsPerPage,
      skip: table.page * table.rowsPerPage,
      sort_order: 'desc',
      source: filterStatus,
    };
    dispatch(fetchEmailVerificationLogs(para));
  };

  // const dataFiltered = applyFilter({
  //   inputData: tableData,
  //   comparator: getComparator(table.order, table.orderBy),
  //   filters: filters.state,
  // });
  const dataFiltered =
    filters.state.name.trim() !== ''
      ? tableData // ✅ use server search results directly
      : applyFilter({
          inputData: tableData,
          comparator: getComparator(table.order, table.orderBy),
          filters: filters.state,
        });

  const dataInPage = dataFiltered;
  const canReset =
    !!filters.state.name ||
    filters.state.status !== 'all' ||
    (!!filters.state.startDate && !!filters.state.endDate);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );

  return (
    <Card>
      <CardHeader
        title={<Typography variant="h6">Email Verification Logs</Typography>}
        sx={{ pb: 3 }}
        subheader="View all email verification activities, including type, date, summary, and credit usage."
      />
      <Divider />

      <CreditTableToolbar
        filters={filters}
        onResetPage={table.onResetPage}
        getFilteredLogs={getFilteredLogs}
        setReload={setReload}
      />

      {canReset && (
        <CreditTableFiltersResult
          filters={filters}
          totalResults={dataFiltered.length}
          onResetPage={table.onResetPage}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}

      <Box sx={{ position: 'relative' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
            <TableHeadCustom
              showCheckbox={false}
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

            <TableBody>
              {dataInPage.map((row, index) => (
                <CreditTableRow
                  key={row.id || index}
                  row={row}
                  selected={table.selected.includes(row.id)}
                />
              ))}

              <TableNoData
                title={tableData.length === 0 ? 'No Data Found' : 'No Search Results'}
                description={
                  tableData.length === 0
                    ? 'No data found in the table.'
                    : `No match found for keyword "${filters.state.name}".`
                }
                notFound={notFound}
              />
            </TableBody>
          </Table>
        </Scrollbar>
      </Box>

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
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { status, name, startDate, endDate } = filters;
  let filteredData = inputData;

  // Filter by name
  if (name) {
    filteredData = filteredData.filter(
      (row) =>
        (row.message && row.message.toLowerCase().includes(name.toLowerCase())) ||
        (row.folder && row.folder.toLowerCase().includes(name.toLowerCase()))
    );
  }

  // Filter by status
  if (status !== 'all') {
    filteredData = filteredData.filter((row) => row.credits === status);
  }

  // Filter by date
  if (!dateError && startDate && endDate) {
    filteredData = filteredData.filter((row) =>
      fIsBetween(new Date(row.dateCreatedOn), startDate, endDate)
    );
  }

  return filteredData.sort(comparator);
}
