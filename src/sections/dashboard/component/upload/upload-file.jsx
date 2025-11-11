import { useState } from 'react';

import { Box, Link, TextField } from '@mui/material';

import FileUpload from 'src/components/upload/upload';

export default function Upload({ setAlertState, listName, setListName, handleVerifyBulk }) {
  const [listNameError, setListNameError] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('Home');

  const folders = [
    'Home (0)',
    'Magnet Brains (2)',
    'Pabbly Hook (5)',
    'Pabbly Connect (10)',
    'Pabbly Subcription Billing (0)',
    'Pabbly Admin (50)',
    'Pabbly Chatflow (2)',
    'Pabbly Form Builder (0)',
    'Pabbly Email Marketing (2)',
    'Pabbly Plus (4)',
  ];

  const handleListNameChange = (event) => {
    const { value } = event.target;
    setListName(value);

    // Remove error state if user starts typing
    if (value.trim() !== '') {
      setListNameError(false);
    } else {
      setListNameError(true);
    }
  };

  const handleFolderChange = (event, newValue) => {
    setSelectedFolder(newValue);
  };

  // Add blur handler to validate when user leaves the field
  const handleListNameBlur = () => {
    if (listName.trim() === '') {
      setListNameError(true);
    }
  };

  return (
    <Box>
      <Box>
        <TextField
          label="Email List Name"
          fullWidth
          value={listName}
          onChange={handleListNameChange}
          onBlur={handleListNameBlur}
          placeholder="Enter the name of the email list here"
          error={listNameError}
          helperText={
            <span>
              {listNameError ? (
                'Email list name is required'
              ) : (
                <>
                  Enter the name of the email list here.{' '}
                  <Link
                    href="https://forum.pabbly.com/threads/verify-email.26310/"
                    underline="always"
                    target="_blank"
                  >
                    Learn more
                  </Link>
                </>
              )}
            </span>
          }
          // required
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            },
            mb: '24px',
          }}
        />

        <FileUpload
          uploadInformation="Upload File OR Drag and Drop file here (Only CSV files allowed). Download Sample File here."
          allowedFileTypes={['text/csv']}
          fileName="sample_csv.csv"
          fileErrorMessage="Upload Error: Please ensure you upload a valid CSV file. You can download a sample file here."
          setAlertState={setAlertState}
          onFileUpload={handleVerifyBulk}
          // se
        />
      </Box>
    </Box>
  );
}
