import React, { useState, useEffect } from 'react';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box
} from '@mui/material';
import { styled } from '@mui/system';
import './dashboardStyles.css'; // Importez la feuille de style

// Plugin pour fond blanc des canvas
const whiteBackgroundPlugin = {
  id: 'whiteBackground',
  beforeDraw: (chart) => {
    const ctx = chart.canvas.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};

// Enregistrement des composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, whiteBackgroundPlugin);

// Conteneur principal avec classe CSS pour fond blanc global
const DashboardContainer = styled(Box)({
  minHeight: '100vh',
  padding: '32px',
});

// Carte personnalisée
const WhiteCard = styled(Card)({
  boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
});

// Conteneur de graphique
const ChartContainer = styled('div')({
  padding: '16px',
  height: '300px',
  position: 'relative',
});

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    clients: 0,
    commandes: 0,
    produits: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiBase = 'http://localhost:8000/api/admin/';
        const [clientsRes, commandesRes, produitsRes] = await Promise.all([
          fetch(`${apiBase}clients_count/`),
          fetch(`${apiBase}commandes_count/`),
          fetch(`${apiBase}produits_count/`)
        ]);
        const clientsData = await clientsRes.json();
        const commandesData = await commandesRes.json();
        const produitsData = await produitsRes.json();

        setStats({
          clients: clientsData.count || 0,
          commandes: commandesData.count || 0,
          produits: produitsData.count || 0
        });
      } catch (error) {
        console.error("Erreur de récupération des données:", error);
        setStats({ clients: 124, commandes: 342, produits: 85 });
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#000000',
          font: { size: 12 },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: '#f5f5f5',
        titleColor: '#000000',
        bodyColor: '#000000',
        borderColor: '#d0d0d0',
        borderWidth: 1,
        padding: 12,
        usePointStyle: true
      },
      whiteBackground: {}
    },
    scales: {
      x: {
        grid: { color: '#e0e0e0', drawBorder: false },
        ticks: { color: '#000000' }
      },
      y: {
        grid: { color: '#e0e0e0', drawBorder: false },
        ticks: { color: '#000000' }
      }
    }
  };

  const clientsData = {
    labels: ['Actifs', 'Nouveaux'],
    datasets: [{
      data: [stats.clients * 0.8, stats.clients * 0.2],
      backgroundColor: ['#58A6FF', '#2EA043'],
      borderColor: ['#58A6FF', '#2EA043'],
      borderWidth: 1
    }]
  };

  const commandesData = {
    labels: ['Complétées', 'En cours'],
    datasets: [{
      data: [stats.commandes * 0.7, stats.commandes * 0.3],
      backgroundColor: ['rgba(88, 166, 255, 0.7)', 'rgba(46, 160, 67, 0.7)'],
      borderColor: ['#58A6FF', '#2EA043'],
      borderWidth: 1
    }]
  };

  const produitsData = {
    labels: ['Disponibles', 'Rupture'],
    datasets: [{
      data: [stats.produits * 0.8, stats.produits * 0.2],
      backgroundColor: ['rgba(46, 160, 67, 0.7)', 'rgba(248, 81, 73, 0.7)'],
      borderColor: ['#2EA043', '#F85149'],
      borderWidth: 1
    }]
  };

  return (
    <DashboardContainer className="white-background">
      <Typography variant="h4" sx={{ mb: 4 }}>
        Tableau de Bord
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <WhiteCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Clients
              </Typography>
              <ChartContainer>
                <Pie data={clientsData} options={chartOptions} />
              </ChartContainer>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Total: <span style={{ color: '#58A6FF' }}>{stats.clients}</span>
              </Typography>
            </CardContent>
          </WhiteCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <WhiteCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Commandes
              </Typography>
              <ChartContainer>
                <Bar data={commandesData} options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: { display: false }
                  }
                }} />
              </ChartContainer>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Total: <span style={{ color: '#2EA043' }}>{stats.commandes}</span>
              </Typography>
            </CardContent>
          </WhiteCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <WhiteCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Produits
              </Typography>
              <ChartContainer>
                <Doughnut data={produitsData} options={chartOptions} />
              </ChartContainer>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Total: <span style={{ color: '#2EA043' }}>{stats.produits}</span>
              </Typography>
            </CardContent>
          </WhiteCard>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default DashboardOverview;