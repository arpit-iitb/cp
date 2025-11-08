import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import { AccordionDetails, useTheme, Typography, Box } from "@mui/material";
import { FaqData } from "../_utils/interface";

export default function CustomizedAccordions({ faqData }: { faqData: FaqData[] }) {
    const [expanded, setExpanded] = React.useState<string | false>('panel0');
    const theme = useTheme();
    
    const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    return (
        <Box className="space-y-4">
            {faqData.map((single, index) => (
                <MuiAccordion 
                    key={index}
                    disableGutters 
                    elevation={0} 
                    square={false}
                    expanded={expanded === `panel${index}`} 
                    onChange={handleChange(`panel${index}`)}
                    sx={{
                        backgroundColor: 'rgba(30, 41, 59, 0.6)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(71, 85, 105, 0.3)',
                        borderRadius: '16px !important',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            backgroundColor: 'rgba(30, 41, 59, 0.8)',
                            borderColor: 'rgba(99, 102, 241, 0.5)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                        },
                        '&.Mui-expanded': {
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            borderColor: 'rgba(99, 102, 241, 0.7)',
                            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
                        },
                        '&:before': {
                            display: 'none',
                        },
                        marginBottom: '0 !important',
                    }}
                >
                    <MuiAccordionSummary
                        expandIcon={
                            <Box
                                sx={{
                                    backgroundColor: expanded === `panel${index}` ? 'rgba(99, 102, 241, 0.2)' : 'rgba(71, 85, 105, 0.2)',
                                    borderRadius: '50%',
                                    width: 40,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(99, 102, 241, 0.3)',
                                        transform: 'scale(1.1)',
                                    }
                                }}
                            >
                                {expanded === `panel${index}` ? 
                                    <RemoveIcon sx={{ color: '#a5b4fc', fontSize: 20 }} /> : 
                                    <AddIcon sx={{ color: '#a5b4fc', fontSize: 20 }} />
                                }
                            </Box>
                        }
                        aria-controls={`panel${index}-content`}
                        id={`panel${index}-header`}
                        sx={{
                            padding: '24px 32px',
                            minHeight: '80px !important',
                            '& .MuiAccordionSummary-content': {
                                margin: '0 !important',
                                alignItems: 'center',
                            },
                            '& .MuiAccordionSummary-expandIconWrapper': {
                                marginLeft: '16px',
                            }
                        }}
                    >
                        <Box className="flex items-center gap-6 w-full">
                            <Box
                                sx={{
                                    minWidth: 60,
                                    height: 60,
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                                }}
                            >
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 700,
                                        fontSize: '18px'
                                    }}
                                >
                                    {index < 9 ? `0${index + 1}` : `${index + 1}`}
                                </Typography>
                            </Box>
                            <Box className="flex-1">
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: { xs: '18px', md: '20px' },
                                        lineHeight: 1.4,
                                        transition: 'color 0.3s ease',
                                    }}
                                >
                                    {single.question}
                                </Typography>
                            </Box>
                        </Box>
                    </MuiAccordionSummary>
                    
                    <AccordionDetails
                        sx={{
                            padding: '0 32px 32px 32px',
                            backgroundColor: 'rgba(15, 23, 42, 0.3)',
                            borderTop: '1px solid rgba(71, 85, 105, 0.2)',
                        }}
                    >
                        <Box className="pl-20">
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    color: 'rgba(241, 245, 249, 0.8)',
                                    fontSize: { xs: '15px', md: '16px' },
                                    lineHeight: 1.7,
                                    fontWeight: 400,
                                    '& strong': {
                                        color: '#a5b4fc',
                                        fontWeight: 600,
                                    }
                                }}
                            >
                                {single.answer}
                            </Typography>
                        </Box>
                    </AccordionDetails>
                </MuiAccordion>
            ))}
        </Box>
    );
}
