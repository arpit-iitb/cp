import {DataTableInterface} from "../../_utils/interface";
import {
    DataGrid,
    useGridApiRef,
    GridToolbar,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton
} from '@mui/x-data-grid';
import React, {useEffect, useState} from "react";
import {Button} from "@mui/material";
import Divider from "@mui/material/Divider";
import "./style.css";

export default function DataTable(data: DataTableInterface) {
    const apiRef = useGridApiRef();
    const [columns, setColumns] = useState<string[]>([]);

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
            </GridToolbarContainer>
        );
    }

    useEffect(() => {
        let cols: string[] = [];
        data.columnDefs.forEach((col) => {
            cols.push(col.field)
        });
        setColumns(cols);
    }, []);

    useEffect(()=>{
        let button = document.querySelector(".resize") as HTMLButtonElement;
        setTimeout(()=>{
            button.click();
        },1000)

    }, [columns])

    const [includeHeaders] = useState(
        true,
    );
    const [includeOutliers] = useState(
        true,
    );
    const [outliersFactor] = useState(
        String(1.5),
    );
    const [expand] = useState(true);

    const autosizeOptions = {
        includeHeaders,
        includeOutliers,
        outliersFactor: Number.isNaN(parseFloat(outliersFactor))
            ? 1
            : parseFloat(outliersFactor),
        expand,
    };

    return <>
        <div className="flex absolute justify-between items-center mb-3">
            <Button
                sx={{visibility: "hidden"}}
                className="resize"
                variant="outlined"
                onClick={() => apiRef.current.autosizeColumns(autosizeOptions)}
            >
                Autosize columns
            </Button>
        </div>
        <Divider/>
        <div className="mt-3" style={{height: "100%", width: '100%'}}>
            {columns && columns.length > 0 ?
                <DataGrid
                    slots={{toolbar: CustomToolbar}}
                    localeText={{ noRowsLabel: "No Students Data available" }}
                    getRowId={(row)=>row[data.uniqueProperty]}
                    apiRef={apiRef}
                    rows={data.tableData}
                    columns={data.columnDefs}
                    initialState={{
                        pagination: {
                            paginationModel: {page: 0, pageSize: 10},
                        },
                    }}
                    autosizeOptions={autosizeOptions}
                /> : <br/>}

        </div>
    </>
}