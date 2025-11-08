import SEO from "components/SEO";
import Type from "components/Type";
import {
  FaqData,
  FeatureCardInterface,
  TestimonialsData,
} from "../../_utils/interface";
import TuneIcon from "@mui/icons-material/Tune";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import BackupIcon from "@mui/icons-material/Backup";
import CodeIcon from "@mui/icons-material/Code";
import SecurityIcon from "@mui/icons-material/Security";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SchoolIcon from "@mui/icons-material/School";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import VerifiedIcon from "@mui/icons-material/Verified";
import GroupsIcon from "@mui/icons-material/Groups";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TimerIcon from "@mui/icons-material/Timer";
import DevicesIcon from "@mui/icons-material/Devices";
import CloudIcon from "@mui/icons-material/Cloud";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import { Card, CardContent, Button, Box, Container, Typography, Grid, Chip, Avatar, Stack } from "@mui/material";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import { SvgIcon } from "@mui/material";
import CustomizedAccordions from "components/Faq";
import { useAuth } from "hooks/AuthProvider";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Loading from "pages/Loading";
import { Logo } from "_utils/enum";

const heroFeatures = [
  { icon: <CodeIcon />, text: "10+ Programming Languages", color: "from-emerald-400 to-teal-500" },
  { icon: <SecurityIcon />, text: "AI-Powered Proctoring", color: "from-blue-400 to-indigo-500" },
  { icon: <AnalyticsIcon />, text: "Real-time Analytics", color: "from-violet-400 to-purple-500" },
  { icon: <AutoAwesomeIcon />, text: "Auto-grading System", color: "from-orange-400 to-amber-500" }
];

const featureCardData: FeatureCardInterface[] = [
  {
    icon: <CodeIcon className="text-emerald-400 text-5xl" />,
    heading: "Advanced Code Editor",
    description: "Professional IDE with syntax highlighting, auto-completion, intelligent debugging, and real-time compilation for 10+ languages including Python, Java, C++, JavaScript, and more.",
    gradient: "from-emerald-500/20 to-teal-500/20"
  },
  {
    icon: <SecurityIcon className="text-blue-400 text-5xl" />,
    heading: "AI-Powered Proctoring",
    description: "Revolutionary AI surveillance with facial recognition, behavior analysis, keystroke monitoring, and real-time anomaly detection to ensure academic integrity.",
    gradient: "from-blue-500/20 to-indigo-500/20"
  },
  {
    icon: <AnalyticsIcon className="text-violet-400 text-5xl" />,
    heading: "Smart Analytics Dashboard",
    description: "Comprehensive insights with performance metrics, code quality analysis, time tracking, progress visualization, and predictive analytics for optimal learning outcomes.",
    gradient: "from-violet-500/20 to-purple-500/20"
  },
  {
    icon: <VerifiedIcon className="text-amber-400 text-5xl" />,
    heading: "Intelligent Assessment",
    description: "Advanced auto-grading with plagiarism detection, code similarity analysis, test case validation, and detailed feedback generation for fair evaluation.",
    gradient: "from-amber-500/20 to-orange-500/20"
  },
  {
    icon: <FlashOnIcon className="text-rose-400 text-5xl" />,
    heading: "Lightning Fast Execution",
    description: "High-performance cloud infrastructure with sub-second compilation, parallel test execution, and scalable architecture supporting thousands of concurrent users.",
    gradient: "from-rose-500/20 to-pink-500/20"
  },
  {
    icon: <CloudIcon className="text-cyan-400 text-5xl" />,
    heading: "Cloud Integration",
    description: "Seamless cloud deployment with automatic scaling, backup systems, multi-region availability, and enterprise-grade security compliance.",
    gradient: "from-cyan-500/20 to-sky-500/20"
  },
];

const statsData = [
  { number: "50K+", label: "Students Trained", icon: <SchoolIcon className="text-4xl" />, color: "from-emerald-400 to-teal-500", bg: "bg-emerald-500/10" },
  { number: "1000+", label: "Assessments Created", icon: <AnalyticsIcon className="text-4xl" />, color: "from-violet-400 to-purple-500", bg: "bg-violet-500/10" },
  { number: "99.9%", label: "Uptime Guarantee", icon: <VerifiedIcon className="text-4xl" />, color: "from-blue-400 to-indigo-500", bg: "bg-blue-500/10" },
  { number: "24/7", label: "Expert Support", icon: <TimerIcon className="text-4xl" />, color: "from-amber-400 to-orange-500", bg: "bg-amber-500/10" }
];

const techStack = [
  { name: "Python", logo: "🐍", color: "hover:bg-emerald-500/20 hover:border-emerald-400" },
  { name: "JavaScript", logo: "⚡", color: "hover:bg-yellow-500/20 hover:border-yellow-400" },
  { name: "Java", logo: "☕", color: "hover:bg-orange-500/20 hover:border-orange-400" },
  { name: "C++", logo: "⚙️", color: "hover:bg-blue-500/20 hover:border-blue-400" },
  { name: "React", logo: "⚛️", color: "hover:bg-cyan-500/20 hover:border-cyan-400" },
  { name: "Node.js", logo: "🟢", color: "hover:bg-green-500/20 hover:border-green-400" },
  { name: "Docker", logo: "🐳", color: "hover:bg-sky-500/20 hover:border-sky-400" },
  { name: "AWS", logo: "☁️", color: "hover:bg-purple-500/20 hover:border-purple-400" }
];

const testimonials: TestimonialsData[] = [
  {
    logo: "https://capabl.in/Capabl%20Logo-01.png",
    name: "Umang Surana",
    socialLink: "https://www.linkedin.com/in/umang-surana-75666828/",
    testimonial: "CodePaathshala has completely transformed our coding assessment methodology. The AI proctoring system and comprehensive analytics have elevated our evaluation standards to enterprise level.",
    designation: "Co-founder & CTO",
    company: "Capabl",
  },
  {
    logo: "https://capabl.in/Capabl%20Logo-01.png",
    name: "Arbaz Shaikh",
    socialLink: "https://www.linkedin.com/in/arbaz-shaikh-273973147/",
    testimonial: "The platform's cutting-edge features and intuitive interface have exceeded our expectations. We've witnessed a remarkable 60% improvement in student engagement and assessment accuracy.",
    designation: "Tech Lead & Architect",
    company: "Capabl",
  },
  {
    logo: "https://capabl.in/Capabl%20Logo-01.png",
    name: "Dr. Sarah Johnson",
    socialLink: "#",
    testimonial: "As an educator, I'm impressed by the platform's ability to provide detailed insights into student performance. The automated reporting saves hours of manual evaluation time.",
    designation: "Professor of Computer Science",
    company: "MIT",
  },
];

const faqs: FaqData[] = [
  {
    question: "How does the AI proctoring system ensure privacy while maintaining security?",
    answer: "Our AI proctoring system uses advanced computer vision and machine learning algorithms with privacy-first design. It processes data locally when possible, encrypts all communications, and complies with GDPR and other privacy regulations. The system only flags unusual behavior patterns without storing personal biometric data permanently.",
  },
  {
    question: "What programming languages and frameworks are supported?",
    answer: "CodePaathshala supports 15+ programming languages including Python, Java, C++, JavaScript, TypeScript, C#, Go, Rust, Kotlin, Swift, and more. We also support popular frameworks like React, Angular, Vue.js, Django, Spring Boot, and provide containerized environments for full-stack development.",
  },
  {
    question: "How does the platform handle high-traffic scenarios and ensure scalability?",
    answer: "Our cloud infrastructure is built on enterprise-grade architecture with auto-scaling capabilities. We use microservices, load balancing, and distributed computing to handle thousands of concurrent users. The platform automatically scales resources based on demand and maintains 99.9% uptime.",
  },
  {
    question: "Can I integrate CodePaathshala with my existing Learning Management System?",
    answer: "Yes! We provide comprehensive APIs and pre-built integrations for popular LMS platforms like Moodle, Canvas, Blackboard, and custom systems. Our integration team provides full support for seamless implementation and data synchronization.",
  },
  {
    question: "What kind of analytics and insights does the platform provide?",
    answer: "Our analytics suite includes real-time performance dashboards, detailed code quality metrics, time analysis, learning progress tracking, comparative analytics, plagiarism detection reports, and predictive insights. All data is visualized through intuitive charts and can be exported for further analysis.",
  },
  {
    question: "How secure is the platform and what compliance standards do you meet?",
    answer: "Security is our top priority. We implement end-to-end encryption, multi-factor authentication, regular security audits, and comply with SOC 2, ISO 27001, GDPR, and FERPA standards. All code and data are stored in secure, redundant data centers with 24/7 monitoring.",
  },
];

export default function Home() {
  const authContext = useAuth();
  let title = "CodePaathshala - Next-Generation Coding Education Platform";
  const [domain, setDomain] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const domain = window.location.hostname;
    setDomain(domain);
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    if (domain === "lms.capabl.in") {
      document.title = "lms.capabl";
      window.location.href = "https://lms.capabl.in/login/capabl";
      authContext.updateClientLogo(Logo["capabl"]);
    }
    if (domain === "lms.eventbeep.com") {
      document.title = "lms.eventbeep";
      window.location.href = "https://lms.eventbeep.com/login/beep";
      authContext.updateClientLogo(Logo["beep"]);
    } else {
      authContext.updateClientLogo("");
    }

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [authContext]);

  return (
    <>
      <SEO title={title} description={"Revolutionary coding education platform with AI-powered assessments, real-time analytics, and intelligent proctoring for the future of learning"} />
      {["lms.capabl.in", "lms.eventbeep.com"].includes(domain) ? (
        <Loading />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">
          {/* Animated Background */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-gradient-to-br from-violet-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>

          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <Container maxWidth="xl" className="relative z-10">
              <div className={`text-center transition-all duration-1500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {/* Hero Badge */}
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-violet-500/20 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">
                      🚀 Next-Generation AI-Powered Platform
                    </span>
                  </div>
                </div>
                
                {/* Main Title */}
                <Typography 
                  variant="h1" 
                  className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent leading-tight tracking-tight"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  CodePaathshala
                </Typography>

                {/* Hero Subtitle & Description */}
                <div className="text-center mb-16">
                  <Typography 
                    variant="h2" 
                    className="text-2xl md:text-4xl lg:text-5xl font-bold text-slate-300 mb-4"
                  >
                    Revolutionizing{' '}
                    <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                      <Type
                        options={{
                          cursorClassName: "hidden",
                          wrapperClassName: "inline",
                          strings: ["Education", "Assessment", "Learning", "Development", "Innovation"],
                          autoStart: true,
                          loop: true,
                          delay: "natural",
                          deleteSpeed: 50,
                        }}
                      />
                    </span>
                  </Typography>
                  <Typography 
                    variant="h5" 
                    className="text-slate-400 font-normal"
                  >
                    Experience the future of coding education with cutting-edge AI proctoring, real-time performance analytics, and intelligent assessment tools designed for the modern digital era.
                  </Typography>
                </div>

                {/* Hero Features Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                  {heroFeatures.map((feature, index) => (
                    <div 
                      key={feature.text}
                      className={`transform transition-all duration-700 delay-${index * 100} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                    >
                      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 group cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <div className={`text-2xl mb-3 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                            {feature.icon}
                          </div>
                          <Typography className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors duration-300">
                            {feature.text}
                          </Typography>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>

                {/* Tech Stack */}
                <div className="mb-16">
                  <Typography variant="h6" className="text-slate-400 mb-6 font-medium">
                    Supporting Industry-Leading Technologies
                  </Typography>
                  <div className="flex flex-wrap justify-center gap-3">
                    {techStack.map((tech, index) => (
                      <Chip
                        key={tech.name}
                        label={`${tech.logo} ${tech.name}`}
                        className={`bg-slate-800/50 text-slate-300 border border-slate-600 ${tech.color} transition-all duration-300 transform hover:scale-105`}
                        size="medium"
                      />
                    ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link to="/register" className="no-underline">
                    <Button
                      variant="contained"
                      size="large"
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-10 py-4 text-lg font-semibold rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
                      startIcon={<RocketLaunchIcon />}
                    >
                      Start Your Journey
                    </Button>
                  </Link>
                  <Button
                    variant="outlined"
                    size="large"
                    className="border-2 border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:border-slate-500 px-10 py-4 text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-300"
                    startIcon={<PlayCircleFilledIcon />}
                  >
                    Watch Demo
                  </Button>
                </div>
              </div>
            </Container>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-slate-600 rounded-full bg-slate-800/30 backdrop-blur-sm">
                <div className="w-1 h-3 bg-gradient-to-b from-emerald-400 to-transparent rounded-full mx-auto mt-2 animate-pulse"></div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 bg-slate-900/50 backdrop-blur-sm">
            <Container maxWidth="lg">
              <div className="text-center mb-16">
                <Typography variant="h2" className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Trusted Worldwide
                </Typography>
                <Typography variant="h6" className="text-slate-400">
                  Platform statistics that speak for themselves
                </Typography>
              </div>
              <Grid container spacing={6}>
                {statsData.map((stat, index) => (
                  <Grid item xs={6} md={3} key={stat.label}>
                    <Card className={`${stat.bg} backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer group`}>
                      <CardContent className="p-8 text-center">
                        <div className={`mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.icon}
                        </div>
                        <Typography variant="h3" className="font-black text-white mb-2 text-3xl">
                          {stat.number}
                        </Typography>
                        <Typography variant="body1" className="text-slate-400 font-medium">
                          {stat.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </section>

          {/* Features Section */}
          <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
            <Container maxWidth="xl">
              <div className="text-center mb-20">
                <Typography variant="h2" className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Powerful Features
                </Typography>
                <Typography variant="h5" className="text-slate-400 font-normal mb-6">
                  Discover cutting-edge tools designed to transform your coding education experience
                </Typography>
              </div>
              
              <Grid container spacing={8}>
                {featureCardData.map((feature, index) => (
                  <Grid item xs={12} md={6} lg={4} key={feature.heading}>
                    <Card className={`bg-gradient-to-br ${feature.gradient} backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 h-full group cursor-pointer rounded-2xl`}>
                      <CardContent className="p-8">
                        <div className="text-center mb-6">
                          <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                          </div>
                          <Typography variant="h5" className="font-bold text-white mb-4 group-hover:text-slate-200 transition-colors duration-300">
                            {feature.heading}
                          </Typography>
                        </div>
                        <Typography variant="body1" className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </section>

          {/* How It Works Section */}
          <section className="py-24 bg-slate-900/70">
            <Container maxWidth="lg">
              <div className="text-center mb-20">
                <Typography variant="h2" className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                  How It Works
                </Typography>
                <Typography variant="h5" className="text-slate-400 font-normal">
                  Simple, powerful, and intelligent workflow
                </Typography>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  { 
                    step: "01", 
                    title: "Create & Customize", 
                    desc: "Design sophisticated coding challenges with our intuitive interface and advanced configuration options",
                    icon: <SettingsOutlinedIcon className="text-3xl" />,
                    color: "from-emerald-400 to-teal-500"
                  },
                  { 
                    step: "02", 
                    title: "AI-Powered Monitoring", 
                    desc: "Advanced AI ensures fair evaluation with real-time proctoring and intelligent anomaly detection",
                    icon: <SecurityIcon className="text-3xl" />,
                    color: "from-blue-400 to-indigo-500"
                  },
                  { 
                    step: "03", 
                    title: "Intelligent Analytics", 
                    desc: "Receive comprehensive insights with detailed analytics and predictive learning recommendations",
                    icon: <AnalyticsIcon className="text-3xl" />,
                    color: "from-violet-400 to-purple-500"
                  }
                ].map((item, index) => (
                  <div key={item.step} className="text-center group">
                    <div className="relative mb-8">
                      <div className={`w-24 h-24 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center text-2xl font-black mb-6 mx-auto group-hover:scale-110 transition-all duration-300 shadow-xl`}>
                        {item.step}
                      </div>
                      <div className={`absolute -top-1 -right-1 bg-gradient-to-r ${item.color} bg-clip-text text-transparent group-hover:scale-110 transition-all duration-300`}>
                        {item.icon}
                      </div>
                    </div>
                    <Typography variant="h4" className="font-bold text-white mb-4 group-hover:text-slate-200 transition-colors duration-300">
                      {item.title}
                    </Typography>
                    <Typography variant="body1" className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                      {item.desc}
                    </Typography>
                  </div>
                ))}
              </div>
            </Container>
          </section>

          {/* Testimonials Section */}
          <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900">
            <Container maxWidth="xl">
              <div className="text-center mb-20">
                <Typography variant="h2" className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  What Leaders Say
                </Typography>
                <Typography variant="h5" className="text-slate-400 font-normal">
                  Trusted by top educators and organizations worldwide
                </Typography>
              </div>
              
              <Grid container spacing={8}>
                {testimonials.map((testimonial, index) => (
                  <Grid item xs={12} lg={4} key={testimonial.name}>
                    <Card className="bg-slate-800/50 backdrop-blur-xl border border-white/10 hover:border-white/20 h-full group hover:scale-105 transition-all duration-300 cursor-pointer rounded-2xl">
                      <CardContent className="p-8">
                        <div className="flex items-center mb-6">
                          <Avatar 
                            className="w-14 h-14 mr-4 ring-2 ring-emerald-400/30 group-hover:ring-emerald-400/50 transition-all duration-300"
                            src={testimonial.logo}
                          />
                          <div>
                            <Typography variant="h6" className="font-bold text-white group-hover:text-emerald-300 transition-colors duration-300">
                              {testimonial.name}
                            </Typography>
                            <Typography variant="body2" className="text-slate-400 font-medium">
                              {testimonial.designation}
                            </Typography>
                            <Typography variant="body2" className="text-emerald-400 font-medium">
                              {testimonial.company}
                            </Typography>
                          </div>
                        </div>
                        <Typography variant="body1" className="text-slate-300 italic leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                          "{testimonial.testimonial}"
                        </Typography>
                        <div className="flex mt-6">
                          {[...Array(5)].map((_, i) => (
                            <EmojiEventsIcon key={i} className="text-amber-400 text-lg" />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </section>

          {/* FAQ Section */}
          <section className="py-24 bg-slate-900/70">
            <Container maxWidth="lg">
              <div className="text-center mb-20">
                <Typography variant="h2" className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Frequently Asked Questions
                </Typography>
                <Typography variant="h5" className="text-slate-400 font-normal">
                  Everything you need to know about CodePaathshala
                </Typography>
              </div>
              <div className="max-w-4xl mx-auto">
                <CustomizedAccordions faqData={faqs} />
              </div>
            </Container>
          </section>

          {/* CTA Section */}
          <section className="py-32 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900"></div>
              <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-48 h-48 bg-violet-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-emerald-400 rounded-full blur-xl animate-pulse delay-2000"></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
            </div>
            
            <Container maxWidth="xl" className="relative z-10">
              <div className="text-center">
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-violet-500/20 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 mb-8">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">
                      🚀 Transform Your Institution Today
                    </span>
                  </div>
                </div>
                
                <Typography 
                  variant="h1" 
                  className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-white via-blue-200 to-violet-200 bg-clip-text text-transparent leading-tight"
                >
                  Ready to Transform Your Coding Education?
                </Typography>
                
                <div className="flex flex-col items-center">
                  <Typography 
                    variant="h4" 
                    className="text-xl md:text-2xl text-slate-300 mb-2 max-w-4xl mx-auto leading-relaxed font-normal"
                  >
                    Join thousands of educators and students experiencing the future of coding assessment. 
                  </Typography>
                  <Typography 
                    variant="h4" 
                    className="text-xl md:text-2xl text-slate-300 mb-16 max-w-4xl mx-auto leading-relaxed font-normal bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent font-semibold"
                  >
                    Start your journey with enterprise-grade tools today.
                  </Typography>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
                  {[
                    { 
                      icon: <SecurityIcon className="text-3xl" />, 
                      title: "Enterprise Security", 
                      desc: "Bank-grade encryption & compliance" 
                    },
                    { 
                      icon: <AnalyticsIcon className="text-3xl" />, 
                      title: "Advanced Analytics", 
                      desc: "Real-time insights & performance tracking" 
                    },
                    { 
                      icon: <RocketLaunchIcon className="text-3xl" />, 
                      title: "Instant Setup", 
                      desc: "Deploy in minutes, not months" 
                    }
                  ].map((feature, index) => (
                    <Card key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 group cursor-pointer rounded-2xl">
                      <CardContent className="p-6 text-center">
                        <div className={`mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent`}>
                          {feature.icon}
                        </div>
                        <Typography variant="h6" className="font-bold text-white mb-2 group-hover:text-slate-200 transition-colors duration-300">
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                          {feature.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link to="/register" className="no-underline">
                    <Button
                      variant="contained"
                      size="large"
                      className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 px-12 py-4 text-lg font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-white/20"
                      startIcon={<RocketLaunchIcon className="text-xl" />}
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                  <Button
                    variant="outlined"
                    size="large"
                    className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-12 py-4 text-lg font-bold rounded-2xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                    startIcon={<DevicesIcon className="text-xl" />}
                  >
                    Schedule Demo
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="mt-16 pt-8 border-t border-white/10">
                  <Typography variant="body2" className="text-slate-400 mb-6 font-medium">
                    Trusted by leading institutions worldwide
                  </Typography>
                  <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                    {["50K+ Students", "1000+ Institutions", "99.9% Uptime", "24/7 Support"].map((stat, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span className="text-slate-300 font-semibold">{stat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Container>
          </section>
        </div>
      )}
    </>
  );
}
