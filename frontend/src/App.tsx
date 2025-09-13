import "./App.css";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useState } from "react";
import AddSelectionModal from "./components/AddSelectionModal";
import CompanyTable from "./components/CompanyTable";
import { getCollectionsMetadata, ICompany } from "./utils/jam-api";
import useApi from "./utils/useApi";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const selectedCompanyIds: ICompany[] = [
  {
    id: 1,
    company_name: "Company A",
    liked: true,
  },
  {
    id: 2,
    company_name: "Company B",
    liked: false,
  },
  {
    id: 3,
    company_name: "Company C",
    liked: true,
  },
];

function App() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>();
  const { data: collectionResponse } = useApi(() => getCollectionsMetadata());

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    setSelectedCollectionId(collectionResponse?.[0]?.id);
  }, [collectionResponse]);

  useEffect(() => {
    if (selectedCollectionId) {
      window.history.pushState({}, "", `?collection=${selectedCollectionId}`);
    }
  }, [selectedCollectionId]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="mx-8">
        <div className="font-bold text-xl border-b p-2 mb-4 text-left">
          Harmonic Jam
        </div>
        <div className="flex">
          <div className="w-1/5">
            <p className=" font-bold border-b mb-2 pb-2 text-left">
              Collections
            </p>
            <div className="flex flex-col gap-2 text-left">
              {collectionResponse?.map((collection) => {
                return (
                  <div
                    className={`py-1 pl-4 hover:cursor-pointer hover:bg-orange-300 ${
                      selectedCollectionId === collection.id &&
                      "bg-orange-500 font-bold"
                    }`}
                    onClick={() => {
                      setSelectedCollectionId(collection.id);
                    }}
                  >
                    {collection.collection_name}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-4/5 ml-4">
            {selectedCollectionId && (
              <CompanyTable selectedCollectionId={selectedCollectionId} />
            )}
            <div className="flex justify-center mt-6">
              <div
                onClick={handleOpen}
                className="py-1 px-4 hover:cursor-pointer hover:bg-orange-300 font-bold text-center"
              >
                Add Selection
              </div>
            </div>
            <AddSelectionModal open={open} handleClose={handleClose} selectedCompanyIds={selectedCompanyIds}/>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
