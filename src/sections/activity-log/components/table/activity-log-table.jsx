import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { Divider, CardHeader, Typography } from '@mui/material';

import { useSetState } from 'src/hooks/use-set-state';

import axios, { endpoints } from 'src/utils/axios';

import { fetchActivityLogs } from 'src/redux/slice/logsSlice'; //  make sure this exists
import dayjs from 'dayjs';

import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  getComparator,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { ActivityLogTableRow } from './activity-log-table-row';
import { ActivityLogTableToolbar } from './activity-log-table-toolbar';
import { ActivityLogTableFiltersResult } from './activity-log-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'action_date', label: 'Action/Date', tooltip: 'View action type and timestamp' },
  { id: 'actor', label: 'Actor', tooltip: 'User who performed the action' },
  { id: 'section_source', label: 'Section/Source', tooltip: 'Section where action occurred' },
  { id: 'activity_data', label: 'Activity Data', align: 'right', tooltip: 'Activity data details' },
];

// ----------------------------------------------------------------------

export function ActivityLogTable() {
  const filters = useSetState({
    name: '',
    status: 'all',
  });

  const dispatch = useDispatch();
  const table = useTable({ defaultOrderBy: 'createdAt' });
  const [reload, setReload] = useState(false);
  const [timezone, setTimezone] = useState(null);
  const getTimezone = async () => {
    const response = await axios.get(endpoints.auth.timezone);
    const { data } = response;

    if (data.status === 'success') setTimezone(data?.data);
  };

  //  Redux Store
  const { data: activityLogs = [], totalCount } = useSelector(
    (state) => state.logs?.activityLogs || {}
  );

  const [tableData, setTableData] = useState([]);

  // Map backend data to table rows
  useEffect(() => {
    if (activityLogs && Array?.isArray(activityLogs)) {
      const mapped = activityLogs.map((item) => ({
        ...item,
        id: item._id,
        action: item.action,
        date: item.createdAt,
        actor_name: item.user?.name,
        actor_email: item.user?.email,
        // section: item.section || 'API',
        source: item.event_source || 'USER',
        activity_data: item?.data,
      }));
      setTableData(mapped);
    } else {
      setTableData([]);
    }
  }, [activityLogs]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const search = filters?.state?.name?.trim();

      const params = {
        limit: table.rowsPerPage,
        skip: table.page * table.rowsPerPage,
        sort_order: 'desc',
      };

      if (search) params.search = search;
      if (filters.state.status && filters.state.status !== 'all')
        params.action = filters.state.status;

      dispatch(fetchActivityLogs(params));
    }, 800);

    return () => clearTimeout(handler);
  }, [filters.state.name, filters.state.status, dispatch, table.page, table.rowsPerPage, reload]);

  // get user timezone
  useEffect(() => {
    if (!timezone) {
      getTimezone();
    }
  }, [timezone]);
  // Handle filter by status (tabs/buttons)
  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );

  // Client-side fallback filtering
  const dataFiltered =
    filters.state.name.trim() !== ''
      ? tableData //  backend search results
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

  const getActivityLogsWithFilter = async (filterState, startDate, endDate) => {
    const startIso = startDate ? dayjs(startDate).startOf('day').toISOString() : null;
    const endIso = endDate ? dayjs(endDate).endOf('day').toISOString() : null;

    const email = filterState?.actorEmail?.search || null; // maps to backend 'email'
    const search = filterState?.activityData?.search || null; // maps to backend 'search'
    const source = filterState?.sectionSource?.type || null; // maps to backend 'source'

    const eventStatus = filterState?.eventStatus?.condition || null;

    let action = null;
    if (eventStatus) {
      const actionMap = {
        Created: 'POST',
        Updated: 'PUT',
        Deleted: 'DELETE',
      };
      action = actionMap[eventStatus] || null;
    }

    //  final params (only include non-null)
    const params = {
      limit: table.rowsPerPage,
      skip: table.page * table.rowsPerPage,
      sort_order: 'desc',
      ...(startIso && { startDate: startIso }),
      ...(endIso && { endDate: endIso }),
      ...(email && { email }),
      ...(action && { action }),
      ...(source && { source }),
      ...(search && { search }),
    };

    dispatch(fetchActivityLogs(params));
  };

  return (
    <Card>
      <CardHeader
        title={<Typography variant="h6">Activity Logs</Typography>}
        sx={{ pb: 3 }}
        subheader="Track all activities performed by users and APIs, including created, updated, and deleted events."
      />

      <Divider />

      <ActivityLogTableToolbar
        filters={filters}
        onResetPage={table.onResetPage}
        setReload={setReload}
        handleFilterStatus={handleFilterStatus}
        getActivityLogsWithFilter={getActivityLogsWithFilter}
      />

      {canReset && (
        <ActivityLogTableFiltersResult
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
                <ActivityLogTableRow
                  key={`${row.id}-${index}`}
                  row={row}
                  selected={table.selected.includes(row.id)}
                  timezone={timezone}
                />
              ))}

              <TableNoData
                title={tableData.length === 0 ? 'No Data Found' : 'No Search Results'}
                description={
                  tableData.length === 0
                    ? 'No activity logs found.'
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
        count={totalCount || dataFiltered.length}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onChangeDense={table.onChangeDense}
        onRowsPerPageChange={table.onChangeRowsPerPage}
      />
    </Card>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { status, name } = filters;
  let filteredData = inputData;

  if (name) {
    filteredData = filteredData.filter(
      (item) =>
        (item.actor_name && item.actor_name.toLowerCase().includes(name.toLowerCase())) ||
        (item.actor_email && item.actor_email.toLowerCase().includes(name.toLowerCase())) ||
        (item.section && item.section.toLowerCase().includes(name.toLowerCase()))
    );
  }

  if (status !== 'all') {
    filteredData = filteredData.filter((item) => item.status === status);
  }

  return filteredData.sort(comparator);
}
