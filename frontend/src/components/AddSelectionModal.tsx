import { Modal, Button, Box, Stepper, StepLabel, Step } from "@mui/material";

import CompanyTable from "./CompanyTable";
import { ICollection, ICompany } from "../utils/jam-api";
import React, { useState } from "react";
import CollectionDropdown from "./CollectionDropdown";

interface AddSelectionModalProps {
  open: boolean;
  handleClose: () => void;
  selectedCompanyIds: ICompany[];
  collectionResponse: ICollection[] | undefined;
}

const AddSelectionModal = ({ open, handleClose, selectedCompanyIds, collectionResponse }: AddSelectionModalProps) => {

  const steps = ['Review selected companies', 'Select destination collection', 'Confirm'];

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleSave = () => {
    handleClose();
    setActiveStep(0);
  };

  return (
    <Modal open={open} onClose={handleClose}>
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
                <CompanyTable selectedCompanyIds={selectedCompanyIds} isModalView={true} />
              }
              {activeStep === 1 && 
                <CollectionDropdown collectionResponse={collectionResponse} />
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
            <Button onClick={activeStep === steps.length - 1 ? handleSave : handleNext }>
              {activeStep === steps.length - 1 ? 'Save' : 'Next' }
            </Button>
          </Box>
        </React.Fragment>
      </div>
    </Modal>
  );
};

export default AddSelectionModal;