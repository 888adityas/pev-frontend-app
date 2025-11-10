import { toast } from 'sonner';
import React, { useState } from 'react';

import {
  Button,
  Tooltip,
  Divider,
  TableRow,
  Checkbox,
  MenuList,
  MenuItem,
  TableCell,
  IconButton,
  CircularProgress,
} from '@mui/material';

import axios, { endpoints } from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { TeamMemberDialog } from '../../hooks/add-team-member';

export function SharedbyYouTeamMemberTableRow({
  row,
  selected,
  onSelectRow,
  serialNumber,
  setReload,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openTeamMemberDialog, setOpenTeamMemberDialog] = useState(false);

  const handleOpenPopover = (event) => setAnchorEl(event.currentTarget);
  const handleClosePopover = () => setAnchorEl(null);
  const handleOpenConfirmDelete = () => {
    setConfirmDelete(true);
    handleClosePopover();
  };
  const handleCloseConfirmDelete = () => setConfirmDelete(false);
  const handleOpenTeamMemberDialog = () => {
    setOpenTeamMemberDialog(true);
    handleClosePopover();
  };
  const handleCloseTeamMemberDialog = () => setOpenTeamMemberDialog(false);

  const updateUserAccessType = async (selectedRow) => {
    console.log('selectedRow: ', selectedRow);
    const payload = {
      memberId: selectedRow?.memberDetails?._id,
      accessType: selectedRow?.accessType === 'write' ? 'read' : 'write',
    };
    const response = await axios.post(endpoints.emailList.updateAccess, payload);
    const { data } = response;

    console.log('data:', data);
    if (data.status === 'success') {
      toast.success(`Access Updated Successfully!`, { style: { marginTop: '15px' } });
    } else {
      toast.error(`${data.message}`, { style: { marginTop: '15px' } });
    }
    setReload((prev) => !prev);
    handleClosePopover();
  };

  const removeMemberAccess = (selectedRow) => {
    console.log('selectedRow: ', selectedRow);
    const payload = {
      memberId: selectedRow?.memberDetails?._id,
    };

    const response = axios.delete(endpoints.emailList.removeMember, { data: payload });

    if (response?.status === 'success') {
      toast.success(response?.message, { style: { marginTop: '15px' } });
    } else {
      toast.error(`${response?.message}`, { style: { marginTop: '15px' } });
    }
    setReload((prev) => !prev);
    handleClosePopover();
    handleCloseConfirmDelete();
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Tooltip title="Select" arrow placement="top">
            <Checkbox checked={selected} onClick={onSelectRow} />
          </Tooltip>
        </TableCell>

        {/* ✅ Shared On */}
        <TableCell width={400} align="left">
          <Tooltip
            title={`Shared On: ${new Date(row.sharedOn).toLocaleString()}`}
            arrow
            placement="top"
          >
            {new Date(row.sharedOn).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Tooltip>
        </TableCell>

        {/* ✅ Team Member Email */}
        <TableCell>
          <Tooltip title={`Email: ${row.memberDetails?.email}`} placement="top" arrow>
            {row.memberDetails?.email || '—'}
          </Tooltip>
        </TableCell>

        {/* ✅ Permission Type */}
        <TableCell align="right">
          <Tooltip
            title={
              row.accessType === 'write'
                ? 'Team member has Write Access.'
                : 'Team member has Read Access.'
            }
            arrow
            placement="top"
          >
            {row.accessType === 'write' ? 'Write Access' : 'Read Access'}
          </Tooltip>
        </TableCell>

        {/* Actions */}
        <TableCell align="right">
          <Tooltip title="Click to see options." arrow placement="top">
            <IconButton onClick={handleOpenPopover}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* Options Popover */}
      <CustomPopover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClosePopover}>
        <MenuList>
          <Tooltip title="Update access." arrow placement="left">
            <MenuItem onClick={() => updateUserAccessType(row)}>
              {/* <MenuItem onClick={handleOpenTeamMemberDialog}> */}
              <Iconify icon="solar:pen-bold" />
              Update Access
            </MenuItem>
          </Tooltip>
          <Divider style={{ borderStyle: 'dashed' }} />
          <Tooltip title="Remove access." arrow placement="left">
            <MenuItem onClick={handleOpenConfirmDelete} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:trash-bin-trash-bold" />
              Remove Access
            </MenuItem>
          </Tooltip>
        </MenuList>
      </CustomPopover>

      <TeamMemberDialog
        open={openTeamMemberDialog}
        onClose={handleCloseTeamMemberDialog}
        currentMember={row}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={handleCloseConfirmDelete}
        disabled={isLoading}
        title="Do you really want to remove access?"
        content="You will no longer have access to the shared folder(s)."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              removeMemberAccess(row);
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Remove Access'}
          </Button>
        }
      />
    </>
  );
}
