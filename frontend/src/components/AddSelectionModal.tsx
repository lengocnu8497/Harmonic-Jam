import { Modal, Button, Box, Stepper, StepLabel, Step, IconButton, CircularProgress, Snackbar, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import CompanyTable from "./CompanyTable";
import { ICollection, ICompany, moveCompanies } from "../utils/jam-api";
import React, { useState } from "react";
import CollectionDropdown from "./CollectionDropdown";

interface AddSelectionModalProps {
  open: boolean;
  handleClose: () => void;
  selectedCompanies: ICompany[];
  collectionResponse: ICollection[] | undefined;
  onSelectionChange: (companies: ICompany[]) => void;
  selectedOriginCollection: string | undefined;
}

const AddSelectionModal = ({ open, handleClose, selectedCompanies, collectionResponse, onSelectionChange, selectedOriginCollection }: AddSelectionModalProps) => {

  const steps = ['Review selected companies', 'Select destination collection', 'Confirm'];

  const [activeStep, setActiveStep] = useState(0);
  const [selectedCollection, setSelectedCollection] = useState<ICollection>();
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleModalClose = () => {
    // Clear selected companies when modal closes
    onSelectionChange([]);
    // Reset modal state
    setActiveStep(0);
    setSelectedCollection(undefined);
    // Close the modal
    handleClose();
  };
  
  const handleSave = async () => {
    if (!selectedOriginCollection || !selectedCollection || selectedCompanies.length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await moveCompanies({
        company_ids: selectedCompanies.map(company => company.id),
        origin_collection_id: selectedOriginCollection,
        destination_collection_id: selectedCollection.id
      });

      let message = response.companies_added == 0 ? 
        "The selected companies are already in the destination collection." 
        : `Successfully moved ${response.companies_added} companies to ${selectedCollection.collection_name}`;

      // Show success message
      setSnackbarMessage(message);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Clear selected companies after successful move
      onSelectionChange([]);

      // Close modal and reset
      handleModalClose();
    } catch (error) {
      console.error('Error moving companies:', error);
      setSnackbarMessage("Failed to move companies. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Modal open={open} onClose={handleModalClose}>
          <div 
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 1200,
              backgroundColor: "#000000",
              padding: "16px",
              borderRadius: "4px",
              outline: "none"
            }}
          >
            <IconButton
              onClick={handleModalClose}
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
            <div className="flex justify-center mb-6 mt-8">
              <Stepper activeStep={activeStep}>
                {steps.map((label) => {
                  const stepProps: { completed?: boolean } = {};
                  const labelProps: {
                    optional?: React.ReactNode;
                  } = {};

                  return (
                    <Step key={label} {...stepProps}>
                      <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </div>
            <React.Fragment>
              <div className="flex justify-center mb-8">
                <div style={{ width: "480px", minWidth: "480px" }}>
                  {activeStep === 0 &&
                    <CompanyTable
                      selectedCompanies={selectedCompanies}
                      isModalView={true}
                      onSelectionChange={onSelectionChange}
                    />
                  }
                  {activeStep === 1 &&
                    <CollectionDropdown
                      collectionResponse={collectionResponse}
                      selectedCollection={selectedCollection}
                      onSelectionChange={setSelectedCollection}
                    />
                  }
                  {activeStep === steps.length - 1 && (
                    <p className="text-center text-gray-300">You confirmed that you have reviewed the selected companies to be added to the destination collection.</p>
                  )}
                </div>
              </div>
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button
                  onClick={activeStep === steps.length - 1 ? handleSave : handleNext}
                  disabled={
                    isLoading ||
                    (activeStep === 0 && selectedCompanies.length === 0) ||
                    (activeStep === 1 && !selectedCollection)
                  }
                  startIcon={isLoading && activeStep === steps.length - 1 ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {activeStep === steps.length - 1 ? (isLoading ? 'Moving...' : 'Save') : 'Next' }
                </Button>
              </Box>
            </React.Fragment>
          </div>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};

export default AddSelectionModal;