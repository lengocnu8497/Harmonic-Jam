import { Modal } from "@mui/material";


import CompanyTable from "./CompanyTable";
import { ICompany } from "../utils/jam-api";

interface AddSelectionModalProps {
  open: boolean;
  handleClose: () => void;
  selectedCompanyIds: ICompany[];
}

const AddSelectionModal = ({ open, handleClose, selectedCompanyIds }: AddSelectionModalProps) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <div 
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          backgroundColor: "#424242",
          padding: "16px",
          borderRadius: "4px",
          outline: "none"
        }}
      >
        <CompanyTable selectedCompanyIds={selectedCompanyIds} isModalView={true} />
      </div>
    </Modal>
  );
};

export default AddSelectionModal;