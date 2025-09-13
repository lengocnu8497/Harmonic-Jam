import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import { getCollectionsById, ICompany } from "../utils/jam-api";

interface CompanyTableProps {
  selectedCollectionId?: string;
  isModalView?: boolean;
  selectedCompanies?: ICompany[];
  onSelectionChange?: (companies: ICompany[]) => void;
}

const CompanyTable = ({
  selectedCollectionId,
  selectedCompanies,
  isModalView = false,
  onSelectionChange,
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
        rows={isModalView ? selectedCompanies : response}
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
                onClick={() => {
                  if (onSelectionChange && selectedCompanies) {
                    const updatedCompanies = selectedCompanies.filter(
                      company => company.id !== params.id
                    );
                    onSelectionChange(updatedCompanies);
                  }
                }}
              />
            ]
          }] : [])
        ]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 25 },
          },
        }}
        rowCount={isModalView ? selectedCompanies?.length : total}
        pagination
        checkboxSelection={!isModalView}
        paginationMode={isModalView ? "client" : "server"}
        onPaginationModelChange={isModalView ? undefined : (newMeta) => {
          setPageSize(newMeta.pageSize);
          setOffset(newMeta.page * newMeta.pageSize);
        }}
        onRowSelectionModelChange={(selectionModel) => {
          if (onSelectionChange && !isModalView) {
            const selectedRows = response.filter((company) =>
              selectionModel.includes(company.id)
            );
            onSelectionChange(selectedRows);
          }
        }}
      />
    </div>
  );
};

export default CompanyTable;
