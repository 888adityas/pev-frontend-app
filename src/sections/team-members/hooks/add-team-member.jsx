import { toast } from 'sonner';
import { useTheme } from '@emotion/react';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Chip,
  Button,
  Dialog,
  Divider,
  TextField,
  Typography,
  DialogTitle,
  Autocomplete,
  useMediaQuery,
  DialogActions,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import axios, { endpoints } from 'src/utils/axios';

import LearnMoreLink from 'src/components/learn-more-link/learn-more-link';

export function TeamMemberDialog({ open, onClose, currentMember, ...other }) {
  const theme = useTheme();
  const isWeb = useMediaQuery(theme.breakpoints.up('sm'));

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [emailListsIds, setEmailListIds] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [autocompleteError, setAutocompleteError] = useState(false);
  const [categoryList, setCategoryList] = useState(null);
  const [categoryError, setCategoryError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const accessType = ['Read Access', 'Write Access'];

  // Fetch email list IDs from API
  async function getEmailListIds() {
    try {
      const response = await axios.get(endpoints.emailList.listIds);
      const { data } = response;
      if (data?.data) {
        setEmailListIds(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch email list IDs:', error);
    }
  }

  useEffect(() => {
    console.log('Fetching email lists once...');
    getEmailListIds();
  }, []);

  // Populate fields if editing a member
  useEffect(() => {
    if (currentMember) {
      setEmail(currentMember.email || '');
      const selectedLists = currentMember.lists_shared
        ? currentMember.lists_shared.map((l) => l._id)
        : [];
      const matchedLists = emailListsIds.filter((item) => selectedLists.includes(item._id));
      setSelectedItems(matchedLists);
      setCategoryList(currentMember.permission || null);
    }
  }, [currentMember, emailListsIds]);

  const handleClose = () => {
    if (!currentMember) {
      setEmail('');
      setSelectedItems([]);
      setCategoryList(null);
    }
    setEmailError(false);
    setAutocompleteError(false);
    setCategoryError(false);
    onClose();
  };

  const ALLOWED_EMAILS = ['hardik@pabbly.com', 'kamal.kumar@pabbly.com', 'anand.nayak@pabbly.com'];

  const isEmailValid = (email1) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email1);

  const handleChangeEmail = (event) => {
    const { value } = event.target;
    setEmail(value);
    setEmailError(!value || !isEmailValid(value));
  };

  const handleChangeCategoryList = (event, newValue) => {
    setCategoryList(newValue);
    setCategoryError(!newValue);
  };

  const handleSelectEmailLists = (event, newValue) => {
    setAutocompleteError(false);
    setSelectedItems(newValue);
  };

  const handleSubmit = async () => {
    try {
      let hasError = false;

      // Validate email (skip if updating)
      if (!email) throw new Error('Please enter an email address.');
      let member = null;
      const response = await axios.post(endpoints.user.getByEmail, { email });

      console.log('response: ', response);
      if (!response?.data?.data) {
        throw new Error('User not found');
      } else {
        member = response?.data?.data;
      }

      if (selectedItems.length === 0) {
        setAutocompleteError(true);
        hasError = true;
      }

      if (!categoryList) {
        setCategoryError(true);
        hasError = true;
      }

      if (hasError) return;

      // ✅ Log form values clearly
      const formValues = {
        memberId: member._id,
        emailListIds: selectedItems?.map((item) => item._id),
        accessType: categoryList,
      };
      console.log('📝 Team Member Form Values:', formValues);
      // return;

      const response2 = await axios.post(endpoints.emailList.share, formValues);
      console.log('response2: ', response2);

      setIsLoading(true);

      setTimeout(() => {
        toast.success(
          currentMember ? 'Team member updated successfully!' : 'Team member added successfully!',
          { style: { marginTop: '15px' } }
        );
        handleClose();
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.log(error);
      toast.error(error.message || 'Something went wrong', { style: { marginTop: '15px' } });
    }
  };

  const commonBoxStyle = { ml: '9px' };
  const commonTypographyStyle = { fontSize: '14px', color: 'grey.800', mt: 1, mb: 1, ml: '5px' };
  const commonUlStyle = { paddingLeft: '20px', color: 'grey.600', fontSize: '12px' };
  const commonLiStyle = {
    marginBottom: '8px',
    fontWeight: '500',
    listStyleType: 'disc',
    listStylePosition: 'outside',
    color: '#637381',
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      {...other}
      PaperProps={isWeb ? { style: { minWidth: '600px' } } : { style: { minWidth: '330px' } }}
    >
      <DialogTitle sx={{ fontWeight: '700', display: 'flex', justifyContent: 'space-between' }}>
        {currentMember ? 'Update Team Member' : 'Add Team Member'}
      </DialogTitle>
      <Divider sx={{ mb: '16px', borderStyle: 'dashed' }} />

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Email Input */}
          <TextField
            fullWidth
            type="email"
            margin="dense"
            variant="outlined"
            label="Pabbly Account Email Address"
            placeholder="sample@example.com"
            value={email}
            onChange={handleChangeEmail}
            error={emailError}
            disabled={Boolean(currentMember)}
            helperText={
              emailError ? (
                email ? (
                  'Please enter a valid email address.'
                ) : (
                  'Email address is required.'
                )
              ) : (
                <span>
                  Ensure that the email address is already registered with Pabbly.{' '}
                  <LearnMoreLink link="https://forum.pabbly.com/threads/how-do-add-team-members-in-pabbly-email-verification-account.26333/" />
                </span>
              )
            }
          />

          {/* Select Email Lists */}
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={emailListsIds}
            getOptionLabel={(option) => option.name || ''}
            renderOption={(props, option) => (
              <li {...props} key={option._id}>
                {option.name} — <Typography variant="caption">{option.status}</Typography>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Email List(s)"
                placeholder="Select"
                error={autocompleteError}
                helperText={
                  autocompleteError ? (
                    'Please select at least one email list.'
                  ) : (
                    <span>
                      Select one or more email lists to share.{' '}
                      <LearnMoreLink link="https://forum.pabbly.com/threads/how-do-add-team-members-in-pabbly-email-verification-account.26333/" />
                    </span>
                  )
                }
              />
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option._id}
                  label={`${option.name} (${option.status})`}
                  size="small"
                  color="primary"
                  variant="soft"
                />
              ))
            }
            value={selectedItems}
            onChange={handleSelectEmailLists}
          />

          {/* Access Type */}
          <Autocomplete
            options={accessType}
            value={categoryList}
            onChange={handleChangeCategoryList}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Access Type"
                error={categoryError}
                helperText={
                  categoryError ? (
                    'Please select a permission level.'
                  ) : (
                    <span>
                      Select the team member access type.{' '}
                      <LearnMoreLink link="https://forum.pabbly.com/threads/how-do-add-team-members-in-pabbly-email-verification-account.26333/" />
                    </span>
                  )
                }
              />
            )}
          />

          {/* Points to Remember */}
          <Box sx={commonBoxStyle}>
            <Typography variant="subtitle1" sx={commonTypographyStyle}>
              Points To Remember
            </Typography>
            <ul style={commonUlStyle}>
              <li style={commonLiStyle}>You can share multiple email lists with team members.</li>
              <li style={commonLiStyle}>
                Team members can be granted either ‘Write’ or ‘Read’ access.
              </li>
              <li style={commonLiStyle}>
                ‘Write’ access allows uploading lists, starting verification, and downloading
                reports but not folder management.
              </li>
              <li style={commonLiStyle}>
                Team members don’t have access to Settings, Billing, or Trash.{' '}
                <LearnMoreLink link="https://forum.pabbly.com/threads/team-members.26323/" />
              </li>
            </ul>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleSubmit} disabled={isLoading} variant="contained" color="primary">
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : currentMember ? (
            'Update'
          ) : (
            'Add'
          )}
        </Button>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
