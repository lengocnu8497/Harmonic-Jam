import { FormControl, InputLabel, Select, MenuItem, OutlinedInput, SelectChangeEvent } from "@mui/material";
import { ICollection } from "../utils/jam-api";

interface CollectionDropdownProps {
  collectionResponse: ICollection[] | undefined;
  selectedCollection: ICollection | undefined;
  onSelectionChange: (selection: ICollection | undefined) => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const CollectionDropdown = ({ collectionResponse, selectedCollection, onSelectionChange }: CollectionDropdownProps) => {

    const handleChange = (event: SelectChangeEvent<string>) => {
        const {
        target: { value },
        } = event;
        // Find the ICollection object that matches the selected value
        const selected = collectionResponse?.find(
            (collection) => collection.collection_name === value
        );
        onSelectionChange(selected);
    };

    return (
        <FormControl sx={{ m: 1, width: '100%' }}>
            <InputLabel id="demo-multiple-name-label">Collection</InputLabel>
            <Select
                labelId="name-label"
                id="name"
                value={selectedCollection?.collection_name || ""}
                onChange={handleChange}
                input={<OutlinedInput label="Collection" />}
                MenuProps={MenuProps}
                >
                {collectionResponse?.map((collection) => (
                    <MenuItem
                    key={collection.id}
                    value={collection.collection_name}
                    >
                    {collection.collection_name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default CollectionDropdown;