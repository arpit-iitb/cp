import { Box, Container, Typography, Grid, Link, IconButton, Divider, Card, CardContent } from "@mui/material";
import { useAuth } from "hooks/AuthProvider";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShieldIcon from "@mui/icons-material/Shield";
import CloudIcon from "@mui/icons-material/Cloud";
import SpeedIcon from "@mui/icons-material/Speed";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Link as RouterLink } from "react-router-dom";

export default function Footer() {
    const userAuth = useAuth();
    
    if (userAuth.clientUid) return null;

    return (
        <Box sx={{ display: `${userAuth.showHeader ? '' : 'none'}` }}>
            <footer className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-emerald-400/5 to-teal-500/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-40 right-20 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-violet-400/3 to-purple-500/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
                </div>

                {/* Main Footer Content */}
                <Container maxWidth="xl" className="py-20 relative z-10">
                    <Grid container spacing={10}>
                        {/* Company Info */}
                        <Grid item xs={12} lg={4}>
                            <div className="space-y-8">
                                <div>
                                    <Typography variant="h3" className="font-black text-4xl mb-6 bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                                        CodePaathshala
                                    </Typography>
                                    <Typography variant="body1" className="text-slate-300 leading-relaxed text-lg mb-6">
                                        The world's most advanced coding education platform. Trusted by leading institutions worldwide for AI-powered assessments, intelligent proctoring, and real-time analytics.
                                    </Typography>
                                    <div className="flex items-center space-x-2 mb-4">
                                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                                        <Typography variant="body2" className="text-emerald-400 font-semibold">
                                            Serving 50K+ Students Globally
                                        </Typography>
                                    </div>
                                </div>
                                
                                {/* Social Media */}
                                <div>
                                    <Typography variant="h6" className="font-bold text-white mb-4">
                                        Connect With Us
                                    </Typography>
                                    <div className="flex space-x-4">
                                        <IconButton 
                                            className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-110 shadow-lg"
                                            href="https://linkedin.com/company/codepaathshala"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <LinkedInIcon className="text-white" />
                                        </IconButton>
                                        <IconButton 
                                            className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-sky-500 hover:to-sky-600 transition-all duration-300 hover:scale-110 shadow-lg"
                                            href="https://twitter.com/codepaathshala"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <TwitterIcon className="text-white" />
                                        </IconButton>
                                        <IconButton 
                                            className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-gray-600 hover:to-gray-700 transition-all duration-300 hover:scale-110 shadow-lg"
                                            href="https://github.com/codepaathshala"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <GitHubIcon className="text-white" />
                                        </IconButton>
                                    </div>
                                </div>

                                {/* Security & Compliance */}
                                <div className="p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-white/10 rounded-2xl">
                                    <Typography variant="h6" className="font-bold text-white mb-4 flex items-center">
                                        <ShieldIcon className="mr-2 text-emerald-400" />
                                        Enterprise Security
                                    </Typography>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center space-x-2 bg-slate-800/70 px-4 py-3 rounded-xl border border-white/5">
                                            <SecurityIcon className="text-emerald-400 text-lg" />
                                            <Typography variant="caption" className="text-white font-bold">
                                                SOC 2 Type II
                                            </Typography>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-slate-800/70 px-4 py-3 rounded-xl border border-white/5">
                                            <VerifiedIcon className="text-blue-400 text-lg" />
                                            <Typography variant="caption" className="text-white font-bold">
                                                ISO 27001
                                            </Typography>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-slate-800/70 px-4 py-3 rounded-xl border border-white/5">
                                            <ShieldIcon className="text-violet-400 text-lg" />
                                            <Typography variant="caption" className="text-white font-bold">
                                                GDPR Ready
                                            </Typography>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-slate-800/70 px-4 py-3 rounded-xl border border-white/5">
                                            <CloudIcon className="text-cyan-400 text-lg" />
                                            <Typography variant="caption" className="text-white font-bold">
                                                Cloud Secure
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Grid>

                        {/* Navigation Links */}
                        <Grid item xs={12} lg={8}>
                            <Grid container spacing={6}>
                                {/* Platform */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="h6" className="font-bold text-white mb-6 text-lg">
                                        Platform
                                    </Typography>
                                    <div className="space-y-4">
                                        {[
                                            { name: "Features", path: "/#features" },
                                            { name: "Pricing", path: "/pricing" },
                                            { name: "Enterprise", path: "/enterprise" },
                                            { name: "API Documentation", path: "/api" },
                                            { name: "Integration", path: "/integration" },
                                            { name: "Security", path: "/security" }
                                        ].map((link) => (
                                            <div key={link.name}>
                                                <Link
                                                    component={RouterLink}
                                                    to={link.path}
                                                    className="text-slate-400 hover:text-emerald-400 transition-all duration-300 no-underline block py-1 hover:translate-x-2 transform"
                                                >
                                                    {link.name}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </Grid>

                                {/* Solutions */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="h6" className="font-bold text-white mb-6 text-lg">
                                        Solutions
                                    </Typography>
                                    <div className="space-y-4">
                                        {[
                                            { name: "For Universities", path: "/solutions/universities" },
                                            { name: "For Bootcamps", path: "/solutions/bootcamps" },
                                            { name: "For Corporations", path: "/solutions/corporate" },
                                            { name: "For K-12 Schools", path: "/solutions/k12" },
                                            { name: "Online Assessments", path: "/solutions/assessments" },
                                            { name: "Remote Proctoring", path: "/solutions/proctoring" }
                                        ].map((link) => (
                                            <div key={link.name}>
                                                <Link
                                                    component={RouterLink}
                                                    to={link.path}
                                                    className="text-slate-400 hover:text-emerald-400 transition-all duration-300 no-underline block py-1 hover:translate-x-2 transform"
                                                >
                                                    {link.name}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </Grid>

                                {/* Resources */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="h6" className="font-bold text-white mb-6 text-lg">
                                        Resources
                                    </Typography>
                                    <div className="space-y-4">
                                        {[
                                            { name: "Documentation", path: "/docs" },
                                            { name: "Video Tutorials", path: "/tutorials" },
                                            { name: "Blog & Insights", path: "/blog" },
                                            { name: "Case Studies", path: "/case-studies" },
                                            { name: "Webinars", path: "/webinars" },
                                            { name: "Help Center", path: "/help" }
                                        ].map((link) => (
                                            <div key={link.name}>
                                                <Link
                                                    component={RouterLink}
                                                    to={link.path}
                                                    className="text-slate-400 hover:text-emerald-400 transition-all duration-300 no-underline block py-1 hover:translate-x-2 transform"
                                                >
                                                    {link.name}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </Grid>

                                {/* Contact & Support */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="h6" className="font-bold text-white mb-6 text-lg">
                                        Support
                                    </Typography>
                                    <div className="space-y-4 mb-8">
                                        {[
                                            { name: "Contact Sales", path: "/contact" },
                                            { name: "Technical Support", path: "/support" },
                                            { name: "Partner Program", path: "/partners" },
                                            { name: "About Us", path: "/about" },
                                            { name: "Careers", path: "/careers" },
                                            { name: "Press Kit", path: "/press" }
                                        ].map((link) => (
                                            <div key={link.name}>
                                                <Link
                                                    component={RouterLink}
                                                    to={link.path}
                                                    className="text-slate-400 hover:text-emerald-400 transition-all duration-300 no-underline block py-1 hover:translate-x-2 transform"
                                                >
                                                    {link.name}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <EmailIcon className="text-emerald-400" />
                                            <Link 
                                                href="mailto:enterprise@codepaathshala.com"
                                                className="text-slate-300 hover:text-emerald-400 transition-colors duration-300 no-underline font-medium"
                                            >
                                                enterprise@codepaathshala.com
                                            </Link>
                                        </div>
                                        
                                        <div className="flex items-center space-x-3">
                                            <PhoneIcon className="text-emerald-400" />
                                            <Link 
                                                href="tel:+1-800-CODEPAL"
                                                className="text-slate-300 hover:text-emerald-400 transition-colors duration-300 no-underline font-medium"
                                            >
                                                +1 (800) CODE-PAL
                                            </Link>
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Container>

                {/* Bottom Bar */}
                <div className="border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-xl relative z-10">
                    <Container maxWidth="xl" className="py-8">
                        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
                            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                                <Typography variant="body1" className="text-slate-300 font-medium">
                                    © 2024 CodePaathshala Inc. All rights reserved.
                                </Typography>
                                <div className="flex flex-wrap justify-center md:justify-start space-x-6">
                                    <Link
                                        component={RouterLink}
                                        to="/privacy"
                                        className="text-slate-400 hover:text-emerald-400 transition-colors duration-300 no-underline text-sm font-medium"
                                    >
                                        Privacy Policy
                                    </Link>
                                    <Link
                                        component={RouterLink}
                                        to="/terms"
                                        className="text-slate-400 hover:text-emerald-400 transition-colors duration-300 no-underline text-sm font-medium"
                                    >
                                        Terms of Service
                                    </Link>
                                    <Link
                                        component={RouterLink}
                                        to="/accessibility"
                                        className="text-slate-400 hover:text-emerald-400 transition-colors duration-300 no-underline text-sm font-medium"
                                    >
                                        Accessibility
                                    </Link>
                                    <Link
                                        component={RouterLink}
                                        to="/cookies"
                                        className="text-slate-400 hover:text-emerald-400 transition-colors duration-300 no-underline text-sm font-medium"
                                    >
                                        Cookie Policy
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <Typography variant="body2" className="text-slate-300 font-medium">
                                        All Systems Operational
                                    </Typography>
                                </div>
                                <div className="h-4 w-px bg-slate-600"></div>
                                <Typography variant="body2" className="text-slate-400">
                                    Made with ❤️ for Educators
                                </Typography>
                            </div>
                        </div>
                    </Container>
                </div>
            </footer>
        </Box>
    );
}