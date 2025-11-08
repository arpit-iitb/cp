import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

export default function CJDialog({isOpen, children, title, afterClosed, maxWidth, action}: {isOpen: boolean, children: React.ReactNode, title: string, afterClosed:Function, maxWidth?:'xs'|'sm'|'md'|'lg'|'xl', action?: {actionText: string, actionHandler:()=>void}}) {

    const handleClose = (reason: string) => {
        afterClosed(reason);
    };

    return (
        <React.Fragment>
            <Dialog
                open={isOpen}
                maxWidth={maxWidth??'md'}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                scroll="paper"
            >
                <DialogTitle id="alert-dialog-title">
                    {title}
                </DialogTitle>
                <DialogContent>
                    {children}
                </DialogContent>
                <DialogActions>
                    {action ? <Button variant="contained" disableElevation={true} onClick={action.actionHandler}>{action.actionText}</Button> : null}
                    <Button variant="outlined" color="error" onClick={()=>{handleClose('close')}} autoFocus>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}