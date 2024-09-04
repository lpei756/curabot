import React, { useEffect } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

const FeedbackCharts = ({ data }) => {
    useEffect(() => {
        console.log('Weekly Data:', data.weekly);
        console.log('Monthly Data:', data.monthly);
        console.log('Quarterly Data:', data.quarterly);
      }, [data]);
      

  if (!data || !data.trends || !Array.isArray(data.trends) || data.trends.length === 0) {
    return (
      <Box sx={{ padding: 2, textAlign: 'center' }}>
        <Typography variant="body1">No feedback data available.</Typography>
      </Box>
    );
  }

  const chartColors = ['#3f51b5', '#f50057', '#00bcd4', '#4caf50', '#ff9800'];

  
  const createPieChartData = (feedbackData) => {
    if (!feedbackData || typeof feedbackData !== 'object') {
      return [];
    }

    const feedbackValues = Object.values(feedbackData);
    const lastFeedback = feedbackValues[feedbackValues.length - 1];
    const totalPositive = lastFeedback.positive || 0;
    const totalNegative = lastFeedback.negative || 0;


    return [
      { id: 'positive', value: totalPositive, label: `Positive: ${totalPositive}`, color: chartColors[0] },
      { id: 'negative', value: totalNegative, label: `Negative: ${totalNegative}`, color: chartColors[1] },
    ];
  };

  const createPieChart = (title, feedbackData) => (
    <Grid item xs={12} md={4} key={title}>
      <Paper elevation={3} sx={{ padding: 2, height: '100%' }}>
        <Typography variant="h6" align="center" gutterBottom sx={{ textTransform: 'capitalize' }}>
          {title}
        </Typography>
        <PieChart
          series={[
            {
              data: createPieChartData(feedbackData),
              highlightScope: { faded: 'global', highlighted: 'item' },
              innerRadius: 30,
              outerRadius: 100,
              paddingAngle: 2,
              cornerRadius: 5,
              startAngle: -90,
              endAngle: 270,
            },
          ]}
          height={300}
          margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
          slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'bottom', horizontal: 'middle' },
              padding: 0,
            },
          }}
        />
      </Paper>
    </Grid>
  );

  const calculateSatisfactionPercentage = (positive, negative) => {
    const total = positive + negative;
    return total === 0 ? 0 : (positive / total) * 100;
  };

  const createTrendData = (feedbackData, label) => {
    return Object.entries(feedbackData)
      .filter(([_, value]) => value.positive !== 0 || value.negative !== 0)
      .map(([key, value]) => ({
        x: `${label} ${parseInt(key) + 1}`,
        y: calculateSatisfactionPercentage(value.positive, value.negative),
      }));
    };

  const weeklyTrend = createTrendData(data.weekly, 'Week');
  const monthlyTrend = createTrendData(data.monthly, 'Month');
  const quarterlyTrend = createTrendData(data.quarterly, 'Quarter');

  const allTrendData = [...weeklyTrend, ...monthlyTrend, ...quarterlyTrend];

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
        User Feedback Overview
      </Typography>
      
      <Grid container spacing={4} justifyContent="center">
        {createPieChart('Weekly Overview', data.weekly)}
        {createPieChart('Monthly Overview', data.monthly)}
        {createPieChart('Quarterly Overview', data.quarterly)}
      </Grid>

      <Paper elevation={3} sx={{ marginTop: 4, padding: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
          Feedback Trends
        </Typography>
        <LineChart
          series={[
            {
              data: weeklyTrend.map(item => item.y),
              label: 'Weekly',
              color: chartColors[0],
            },
            {
              data: monthlyTrend.map(item => item.y),
              label: 'Monthly',
              color: chartColors[2],
            },
            {
              data: quarterlyTrend.map(item => item.y),
              label: 'Quarterly',
              color: chartColors[4],
            },
          ]}
          xAxis={[{ 
            data: allTrendData.map(item => item.x),
            scaleType: 'point',
            tickLabelStyle: {
              angle: 45,
              textAnchor: 'start',
              fontSize: 12,
            },
          }]}
          yAxis={[{
            min: 0,
            max: 100,
          }]}
          height={400}
          margin={{ top: 20, bottom: 30, left: 40, right: 20 }}
          sx={{
            '.MuiLineElement-root': {
              strokeWidth: 2,
            },
            '.MuiMarkElement-root': {
              stroke: '#fff',
              scale: '0.6',
              fill: 'currentColor',
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default FeedbackCharts;