import { useState } from "react";
import { FormControl, InputLabel, Select, MenuItem, OutlinedInput, SelectChangeEvent } from "@mui/material";
import { ICollection } from "../utils/jam-api";

interface CollectionDropdownProps {
  collectionResponse: ICollection[] | undefined;
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

const CollectionDropdown = ({ collectionResponse }: CollectionDropdownProps) => {

    const [collectionName, setCollectionName] = useState<string[]>([]);

    const handleChange = (event: SelectChangeEvent<typeof collectionName>) => {
        const {
        target: { value },
        } = event;
        setCollectionName(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    return (
        <FormControl sx={{ m: 1, width: '100%' }}>
            <InputLabel id="demo-multiple-name-label">Collection</InputLabel>
            <Select
            labelId="demo-multiple-name-label"
            id="demo-multiple-name"
            multiple
            value={collectionName}
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