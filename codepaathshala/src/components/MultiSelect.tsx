import {Autocomplete} from "@mui/lab";
import {Checkbox, TextField} from "@mui/material";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function MultiSelect({options, placeholder, label, handleChange, multiple, value}: {options: {label: string, value: string}[], placeholder: string, label: string, handleChange:(value:any)=>void, multiple: boolean, value?:{label: string, value: string}[]}) {
    return <>
        <Autocomplete
            className="w-full"
            value={value}
            multiple={multiple}
            options={options}
            onChange={(e,v) => handleChange(v)}
            getOptionLabel={(option) => option.label}
            renderOption={(props, option, { selected }) => (
                <li {...props}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 4 }}
                        checked={selected}
                    />
                    {option.label}
                </li>
            )}
            renderInput={(params) => (
                <TextField onKeyDown={(e) => {e.preventDefault();}} {...params} label={label} placeholder={placeholder} />
            )}
            style={{ width: "100%" }}
            />
    </>
}