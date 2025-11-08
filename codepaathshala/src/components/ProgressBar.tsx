import LinearProgress from '@mui/material/LinearProgress';
import Box from "@mui/material/Box";

export default function ProgressBar({count, showCount, color, height}: { count: number, showCount: boolean, color?: string, height?: number }) {
    return <div className="flex items-center h-8 g-2">
            <Box sx={{ width: "100%", color: color ?? "#3183FF" }}>
                <LinearProgress sx={{ height: (height ?? "8px"), borderRadius: "8px" }} color="inherit" variant="determinate" value={count} />
            </Box>
            {showCount && <p className='ml-1'> {count}%</p>}
        </div>
}