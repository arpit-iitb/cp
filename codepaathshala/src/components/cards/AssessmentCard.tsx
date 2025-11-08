import {AssessmentCardInterface} from "../../_utils/interface";
import {
    Button,
    Card,
    CardContent,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import TagIcon from '@mui/icons-material/Tag';
import {AssessmentStatus} from "../../_utils/enum";
import CJDialog from "components/CJDialog";
import React, {useState} from "react";
import {Link} from "react-router-dom";

export default function AssessmentCard(props: AssessmentCardInterface) {
    const[dialogOpen, setDialogOpen] = useState(false);
    function handleOpenDialog() {
        setDialogOpen(true);
    }

    function handleAfterClose() {
        setDialogOpen(false);
    }
    return <>
        <Card variant="outlined" className="!rounded-xl !border-0 shadow-lg hover:shadow-2xl">
            <CardContent className="!h-full">
                <div className="flex flex-col w-full h-full justify-between">
                    <div>
                        <div className="flex justify-between items-center w-full mb-4">
                            <div className={`rounded-full flex items-center gap-1 px-1 py-1 
                    ${props.status === AssessmentStatus.PASSED ? 'text-green-500 bg-green-100' :
                                props.status === AssessmentStatus.FAILED ? 'text-red-500 bg-red-100' : 'text-yellow-900 bg-yellow-200'}`}>
                                <CircleIcon color="inherit" fontSize="small"/> <span
                                className="text-xs font-bold">{props.status.toUpperCase()}</span>
                            </div>
                            <div className={`flex items-center gap-1
                    ${props.status === AssessmentStatus.PASSED ? 'text-green-500' :
                                props.status === AssessmentStatus.FAILED ? 'text-red-500' : 'text-yellow-900'}
                    `}>
                                <LocalPoliceIcon color="inherit" fontSize="large"/>
                                <p className="text-2xl font-bold">{props.max_marks_scored}<span
                                    className="text-sm font-bold text-gray-400">/{props.Total_marks}</span></p>
                            </div>
                        </div>
                        <div className="grid grid-cols-5 mb-4">
                            <p className="col-span-3 text-3xl font-bold">
                                {props.title}
                            </p>
                            <p className="col-span-2 font-bold text-gray-400 text-end">Passing Marks
                                - {props.passing_marks}</p>
                        </div>
                        <div className="grid grid-cols-5 mb-4">
                            <p className="col-span-3 text-[#222]">
                                {props.status === AssessmentStatus.NOT_ATTEMPTED ? ("You have not attempted this assessment yet.") :
                                    props.status === AssessmentStatus.FAILED ? "You have failed the assessment. Please try again" :
                                        "You have successfully completed the assessment"
                                }
                            </p>
                            <div className="col-span-2">
                                <div className="flex items-center w-full text-sm gap-1">
                                    <TagIcon className="text-cyan-500"/>
                                    <span className="text-gray-400">Total Attempts</span>
                                    <span className="font-bold text-md text-[#222]">{props.attempts}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex gap-3">
                            <Link to={`./${props?.test_id}`}><Button disableElevation={true} className="w-full !bg-[#FF0043] !normal-case !rounded-lg" variant="contained">Attempt Now</Button></Link>
                            {props.status !== AssessmentStatus.NOT_ATTEMPTED ?
                                <Button onClick={handleOpenDialog} disableElevation={true} className="w-full !text-primary-500 !border-red-500 !normal-case !rounded-lg" variant="outlined">Past Attempts</Button>:null}
                        </div>

                    </div>
                </div>

            </CardContent>
        </Card>
        <CJDialog title={props.title} isOpen={dialogOpen} afterClosed={handleAfterClose}>
            <TableContainer style={{ maxHeight: 250 }} className="border mb-4" elevation={0} component={Paper}>
                <Table stickyHeader size="medium" aria-label="a dense table">
                    <TableHead sx={{backgroundColor: "#f8f9fa", color: "#212529"}}>
                        <TableRow className="font-bold text-xl">
                            <TableCell sx={{color: 'inherit', fontWeight: "inherit", fontSize: "inherit", backgroundColor: "#f8f9fa"}} align="center">Date</TableCell>
                            <TableCell sx={{color: 'inherit', fontWeight: "inherit", fontSize: "inherit", backgroundColor: "#f8f9fa"}} align="center">Score</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.prev_atempts && props.prev_atempts?.map((single) => (
                            <TableRow
                                className="!text-lg"
                                hover={true}
                                key={single.date}
                                sx={{'&:last-child td, &:last-child th': {border: 0},
                                    color: '#333'
                                }}
                            >
                                <TableCell sx={{color: '#333',fontWeight: 'light',fontSize: "inherit"}} align="center">{new Date(single.date).toLocaleString('en-IN', {month: "long", day: "2-digit", year: "numeric"})}</TableCell>
                                <TableCell sx={{color: '#333',fontWeight: 'light',fontSize: "inherit"}} className="!text-green-500" align="center">{single.score}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </CJDialog>
    </>
}