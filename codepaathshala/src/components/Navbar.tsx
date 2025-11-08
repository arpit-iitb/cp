import React, { memo, useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  useScrollTrigger,
  Fade,
  Slide,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import QuizIcon from "@mui/icons-material/Quiz";
import SchoolIcon from "@mui/icons-material/School";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "hooks/AuthProvider";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { ProfileDataInterface } from "../_utils/interface";
import { BoltIcon } from "@heroicons/react/24/solid";
import IdleTimerComponent from "./idle-timer";
const drawerWidth = 280;

export interface NavItem {
  title: string;
  redirectUrl?: string;
  href?: string;
  icon?: React.ReactNode;
}

const NAVITEMS: NavItem[] = [
  { title: "Dashboard", redirectUrl: "dashboard", icon: <DashboardIcon /> },
  { title: "Live Tests", redirectUrl: "assessment", icon: <QuizIcon /> },
  { title: "Courses", redirectUrl: "courses", icon: <SchoolIcon /> },
];

export default memo(function Navbar() {
  const userAuth = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [uid, setUid] = useState("");
  const [profile, setProfile] = useState<ProfileDataInterface>(userAuth.user);
  const [navItems, setNavItems] = useState<NavItem[]>(NAVITEMS);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let userData = userAuth.getUserInfo();
    if (userData) {
      setProfile(userData);
      if (userData?.user?.is_staff) {
        let temp = [...navItems];
        temp.push({ title: "Manage Batch", redirectUrl: "manage/batch", icon: <AdminPanelSettingsIcon /> });
        setNavItems(temp);
      }
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const uid = userAuth.getClientUid();
      setUid(uid);
      if (uid) {
        let userData = userAuth.getUserInfo();
        if (userData) {
          setProfile(userData);
          if (userData?.user?.is_staff) {
            let temp = [...navItems];
            temp.push({ title: "Manage Batch", redirectUrl: "manage/batch", icon: <AdminPanelSettingsIcon /> });
            setNavItems(temp);
          }
        }
      }
    }, 1000);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigate = useNavigate();
  const handleDrawerToggle = () => {
    setMobileOpen((isOpen) => !isOpen);
  };
  const trigger = useScrollTrigger({
    target: window ? window : undefined,
  });

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [showLogo, setShowLogo] = useState(false);
  useEffect(() => {
    if (location.pathname === "/") {
      setShowLogo(false);
      const timer = setTimeout(() => {
        setShowLogo(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowLogo(true);
    }
  }, [location.pathname]);

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      className="flex justify-center items-center flex-col py-6 bg-gradient-to-b from-gray-50 to-white min-h-full"
    >
      {uid ? (
        <></>
      ) : (
        <>
          {showLogo && (
            <Link to={"/"} className="no-underline">
              <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
                CodePaathshala
              </div>
            </Link>
          )}
        </>
      )}

      <Divider className="w-full mb-4" />
      <List className="w-full px-4">
        {navItems.map((item: NavItem, index) => (
          <ListItem className="w-full mb-2" key={index} disablePadding>
            <Link className="w-full no-underline" to={`/${item.redirectUrl}`}>
              <ListItemButton 
                className="!rounded-xl !transition-all !duration-300 hover:!bg-blue-50 hover:!scale-105"
                sx={{
                  '&:hover': {
                    backgroundColor: '#eff6ff',
                    transform: 'scale(1.02)',
                  }
                }}
              >
                <ListItemIcon className="text-blue-600 min-w-10">
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title} 
                  className="!font-semibold !text-gray-700"
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: 600
                  }}
                />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
      
      <Divider className="w-full my-6" />
      
      <List className="w-full px-4">
        {userAuth.token ? (
          <>
            <ListItem className="w-full mb-2" disablePadding>
              <ListItemButton
                onClick={() => userAuth.logOut()}
                className="w-full !rounded-xl !transition-all !duration-300 hover:!bg-red-50"
                sx={{
                  '&:hover': {
                    backgroundColor: '#fef2f2',
                  }
                }}
              >
                <ListItemIcon className="text-red-500 min-w-10">
                  <LogoutOutlinedIcon />
                </ListItemIcon>
                <ListItemText 
                  className="!text-red-500 !font-semibold"
                  primary="Logout"
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: 600
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem className="w-full mb-2" disablePadding>
              <Link className="w-full no-underline" to="/account/change-password">
                <ListItemButton className="w-full !rounded-xl !transition-all !duration-300 hover:!bg-blue-50">
                  <ListItemIcon className="text-blue-600 min-w-10">
                    <LockResetOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText 
                    className="!text-blue-600 !font-semibold"
                    primary="Change Password"
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: 600
                    }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
            <ListItem className="w-full mb-2" disablePadding>
              <Link className="w-full no-underline" to="/account/profile">
                <ListItemButton className="w-full !rounded-xl !transition-all !duration-300 hover:!bg-blue-50">
                  <ListItemIcon className="text-blue-600 min-w-10">
                    <AccountCircleOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText 
                    className="!text-blue-600 !font-semibold"
                    primary="Edit Profile"
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: 600
                    }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem className="w-full mb-3" disablePadding>
              <Link className="w-full no-underline" to="/login">
                <Button
                  variant="outlined"
                  fullWidth
                  className="!normal-case !border-2 !border-blue-600 !text-blue-600 !font-bold !py-3 !rounded-xl hover:!bg-blue-50 !transition-all !duration-300"
                >
                  Login
                </Button>
              </Link>
            </ListItem>
            <ListItem className="w-full" disablePadding>
              <Link className="w-full no-underline" to="/register">
                <Button
                  variant="contained"
                  fullWidth
                  className="!normal-case !bg-gradient-to-r !from-blue-600 !to-purple-600 !font-bold !py-3 !rounded-xl hover:!from-blue-700 hover:!to-purple-700 !transition-all !duration-300 !shadow-lg"
                >
                  Sign Up
                </Button>
              </Link>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  const isHomePage = location.pathname === "/";

  return (
    <>
      <Box sx={{ display: `${userAuth.showHeader ? "flex" : "none"}` }}>
        <IdleTimerComponent />
        <Slide appear={false} direction="down" in={!trigger || !isHomePage}>
          <AppBar
            variant="elevation"
            elevation={trigger ? 4 : 0}
            className={`transition-all duration-500 ${
              isHomePage 
                ? trigger 
                  ? "!bg-slate-800/95 !backdrop-blur-md !border-b !border-slate-700/50" 
                  : "!bg-slate-900/80"
                : "!bg-slate-800/95 !backdrop-blur-md !border-b !border-slate-700/50"
            }`}
            sx={{
              backdropFilter: trigger || !isHomePage ? 'blur(12px)' : 'none',
              borderBottom: trigger || !isHomePage ? '1px solid rgba(71, 85, 105, 0.5)' : 'none',
            }}
          >
            <Toolbar className={`justify-between w-full transition-all duration-500 py-4 px-4 md:px-8 ${
              isHomePage 
                ? trigger 
                  ? "!text-white" 
                  : "!text-white"
                : "!text-white"
            }`}>
              <div className="flex gap-3 items-center">
                {uid ? (
                  <>
                    {userAuth?.clientLogo?.length > 0 ? (
                      <img
                        className="max-w-[180px] h-10 transition-all duration-300"
                        src={userAuth?.clientLogo}
                        alt="Client Logo"
                      />
                    ) : null}
                  </>
                ) : (
                  <>
                    {showLogo && (
                      <Link to={"/"} className="no-underline">
                        <div className="text-3xl font-black transition-all duration-500 text-white">
                          CodePaathshala
                        </div>
                      </Link>
                    )}
                  </>
                )}
              </div>

              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <div className="flex gap-8 items-center">
                  {navItems.map((item, index) => (
                    <Link
                      to={`/${item.redirectUrl}`}
                      className="no-underline font-semibold text-lg px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-white/90 hover:text-white hover:bg-white/10"
                      key={item.title}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        {item.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </Box>
              
              <Box sx={{ display: { xs: "none", md: "inline-flex" } }}>
                {userAuth.token ? (
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-full transition-all duration-300 hover:scale-105 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                      <BoltIcon className="h-5 w-5" />
                      <span>Streak: {profile?.streak || 0}</span>
                    </div>

                    <Button
                      id="basic-button"
                      aria-controls={open ? "basic-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? "true" : undefined}
                      onClick={handleClick}
                      className="!normal-case !font-semibold !px-4 !py-2 !rounded-xl !transition-all !duration-300 hover:!scale-105 !text-white hover:!bg-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src="/Profile.webp"
                          alt="Profile Picture"
                          className="w-10 h-10 object-cover rounded-full ring-2 ring-blue-400/30"
                        />
                        <span className="font-bold">
                          {profile?.user?.name ?? profile?.user?.username}
                        </span>
                      </div>
                    </Button>
                    
                    <Menu
                      id="basic-menu"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      MenuListProps={{
                        "aria-labelledby": "basic-button",
                      }}
                      PaperProps={{
                        className: "!mt-2 !rounded-xl !shadow-2xl !border !border-slate-600/50 !backdrop-blur-md",
                        sx: {
                          backgroundColor: 'rgba(30, 41, 59, 0.95)',
                          backdropFilter: 'blur(12px)',
                        }
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          navigate("/account/profile");
                          handleClose();
                        }}
                        className="!px-6 !py-3 hover:!bg-slate-700/50 !transition-all !duration-200"
                      >
                        <ListItemIcon>
                          <AccountCircleOutlinedIcon className="text-blue-400" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText className="!font-semibold !text-white">Profile</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          navigate("/account/change-password");
                          handleClose();
                        }}
                        className="!px-6 !py-3 hover:!bg-slate-700/50 !transition-all !duration-200"
                      >
                        <ListItemIcon>
                          <LockResetOutlinedIcon className="text-blue-400" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText className="!font-semibold !text-white">Change Password</ListItemText>
                      </MenuItem>
                      <Divider className="!my-2 !border-slate-600" />
                      <MenuItem
                        onClick={() => {
                          userAuth.logOut();
                          handleClose();
                        }}
                        className="!px-6 !py-3 hover:!bg-red-900/30 !transition-all !duration-200"
                      >
                        <ListItemIcon>
                          <LogoutOutlinedIcon className="text-red-400" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText className="!font-semibold !text-red-400">Logout</ListItemText>
                      </MenuItem>
                    </Menu>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Link to="/login" className="no-underline">
                      <Button
                        variant="outlined"
                        className="!normal-case !font-bold !px-6 !py-3 !rounded-xl !transition-all !duration-300 hover:!scale-105 !border-2 !border-white !text-white hover:!bg-white/10"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" className="no-underline">
                      <Button
                        variant="contained"
                        className="!normal-case !bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !font-bold !px-6 !py-3 !rounded-xl !shadow-lg !transition-all !duration-300 hover:!scale-105"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </Box>

              <IconButton
                className="!p-3 !rounded-xl !transition-all !duration-300 hover:!scale-110"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  display: { md: "none" },
                  color: 'white'
                }}
              >
                <MenuIcon className="text-2xl" />
              </IconButton>
            </Toolbar>
          </AppBar>
        </Slide>
        
        <nav>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        </nav>
        {!isHomePage && (
          <Box>
            <Toolbar />
            <Toolbar />
          </Box>
        )}
      </Box>
    </>
  );
});
