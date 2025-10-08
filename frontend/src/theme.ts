import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'wso2-orange',
  colors: {
    'wso2-orange': [
      '#fff8f3',
      '#ffe8d6',
      '#ffd4b3',
      '#ffc085',
      '#ffa94d',
      '#ff8c00', // Softer WSO2 Orange
      '#e67e00',
      '#cc7000',
      '#b36200',
      '#9a5400',
    ],
    'wso2-black': [
      '#f5f5f5',
      '#e8e8e8',
      '#d1d1d1',
      '#b3b3b3',
      '#8c8c8c',
      '#666666',
      '#4d4d4d',
      '#333333',
      '#2a2a2a',
      '#231F20', // Primary WSO2 Black
    ],
    'wso2-blue': [
      '#f0f9ff',
      '#e0f2fe',
      '#bae6fd',
      '#7dd3fc',
      '#38bdf8',
      '#0ea5e9',
      '#0284c7',
      '#0369a1',
      '#075985',
      '#0c4a6e',
    ],
    'wso2-green': [
      '#f0fdf4',
      '#dcfce7',
      '#bbf7d0',
      '#86efac',
      '#4ade80',
      '#22c55e',
      '#16a34a',
      '#15803d',
      '#166534',
      '#14532d',
    ],
    'wso2-purple': [
      '#faf5ff',
      '#f3e8ff',
      '#e9d5ff',
      '#d8b4fe',
      '#c084fc',
      '#a855f7',
      '#9333ea',
      '#7c3aed',
      '#6b21a8',
      '#581c87',
    ],
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          transition: 'all 0.2s ease',
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
      },
      styles: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          transition: 'all 0.2s ease',
          '&:focus': {
            borderColor: 'var(--mantine-color-wso2-orange-6)',
            boxShadow: '0 0 0 2px rgba(255, 140, 0, 0.1)',
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          transition: 'all 0.2s ease',
          '&:focus': {
            borderColor: 'var(--mantine-color-wso2-orange-6)',
            boxShadow: '0 0 0 2px rgba(255, 140, 0, 0.1)',
          },
        },
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          transition: 'all 0.2s ease',
          '&:focus': {
            borderColor: 'var(--mantine-color-wso2-orange-6)',
            boxShadow: '0 0 0 2px rgba(255, 140, 0, 0.1)',
          },
        },
      },
    },
    Text: {
      defaultProps: {
        size: 'sm',
      },
    },
    Badge: {
      styles: {
        root: {
          transition: 'all 0.2s ease',
        },
      },
    },
  },
});