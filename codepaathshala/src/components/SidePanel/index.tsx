import Box from "@mui/material/Box";
import * as React from "react";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import Tab from "@mui/material/Tab";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import {useTheme} from "@mui/material/styles";
import EditProfileForm from "components/Form/EditProfile";
import {User} from "../../_utils/interface";
import ChangePasswordForm from "components/Form/ChangePasswordForm";

export default function SidePanel({user, batchList}: {user: Partial<User>, batchList: {label:string, value:string}[]}) {
    const [value, setValue] = React.useState("0");
    const theme = useTheme();
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    return <>
        <Box sx={{
            width: "100%"
        }}>
            <TabContext value={value}>
                <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                    <TabList
                        TabIndicatorProps={{
                            sx: {display: 'none'}
                        }}
                        variant="scrollable"
                        scrollButtons={false}
                        onChange={handleChange} aria-label="Profile Tabs"
                    >
                        <Tab icon={<PermIdentityOutlinedIcon/>} iconPosition="start"
                             label="Student Details"
                             value="0"/>
                        <Tab icon={<LockResetOutlinedIcon/>} iconPosition="start"
                             label="Change Password"
                             value="1"/>
                    </TabList>
                </Box>
                <TabPanel value="0" dir={theme.direction}>
                    <EditProfileForm batchList={batchList} user={user} type={"Edit"}/>
                </TabPanel>
                <TabPanel value="1" dir={theme.direction}>
                    <ChangePasswordForm edit={true} user={user}/>
                </TabPanel>
            </TabContext>
        </Box>
    </>
}