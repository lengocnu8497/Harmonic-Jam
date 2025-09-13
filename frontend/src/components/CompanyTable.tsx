import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import { getCollectionsById, ICompany } from "../utils/jam-api";

interface CompanyTableProps {
  selectedCollectionId?: string;
  isModalView?: boolean;
  selectedCompanyIds?: ICompany[];
}

const CompanyTable = ({ 
  selectedCollectionId,
  selectedCompanyIds,
  isModalView = false,
} : CompanyTableProps) => {
  const [response, setResponse] = useState<ICompany[]>([]);
  const [total, setTotal] = useState<number>();
  const [offset, setOffset] = useState<number>(0);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    if (selectedCollectionId) {
      getCollectionsById(selectedCollectionId, offset, pageSize).then(
        (newResponse) => {
          setResponse(newResponse.companies);
          setTotal(newResponse.total);
        }
      );
    } 
  }, [selectedCollectionId, offset, pageSize]);

  useEffect(() => {
    setOffset(0);
  }, [selectedCollectionId]);

  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={isModalView ? selectedCompanyIds : response}
        rowHeight={30}
        columns={[
          { field: "liked", headerName: "Liked", width: 90 },
          { field: "id", headerName: "ID", width: 90 },
          { field: "company_name", headerName: "Company Name", width: 200 },
          ...(isModalView ? [{
            field: 'actions',
            type: 'actions' as const,
            headerName: 'Actions',
            width: 100, 
            getActions: (params: { id: any; }) => [
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={() => (console.log(`Delete company with ID: ${params.id}`))}
              />
            ]
          }] : [])
        ]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 25 },
          },
        }}
        rowCount={total}
        pagination
        checkboxSelection={!isModalView}
        paginationMode="server"
        onPaginationModelChange={(newMeta) => {
          setPageSize(newMeta.pageSize);
          setOffset(newMeta.page * newMeta.pageSize);
        }}
      />
    </div>
  );
};

export default CompanyTable;
