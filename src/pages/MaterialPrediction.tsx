import React, { useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalculatorIcon, SaveIcon, TrendingUpIcon, AlertTriangleIcon } from 'lucide-react';

interface MaterialData {
  month: string;
  actual?: number;
  predicted?: number;
  confidence?: {
    lower: number;
    upper: number;
  };
}

// Simulated historical data
const historicalData: MaterialData[] = [{
  month: 'Jan',
  actual: 4200,
  predicted: 4000
}, {
  month: 'Feb',
  actual: 3800,
  predicted: 3900
}, {
  month: 'Mar',
  actual: 4100,
  predicted: 4200
}, {
  month: 'Apr',
  actual: 3900,
  predicted: 3800
}, {
  month: 'May',
  actual: 4300,
  predicted: 4100
}, {
  month: 'Jun',
  actual: 4500,
  predicted: 4400
}];

// Initial future predictions
const initialFuturePredictions: MaterialData[] = [{
  month: 'Jul',
  predicted: 4600
}, {
  month: 'Aug',
  predicted: 4800
}, {
  month: 'Sep',
  predicted: 4700
}, {
  month: 'Oct',
  predicted: 4900
}, {
  month: 'Nov',
  predicted: 5100
}, {
  month: 'Dec',
  predicted: 5300
}];

// Season factors for different materials (simulated)
const seasonalFactors = {
  cement: {
    Q1: 0.9,
    Q2: 1.1,
    Q3: 1.2,
    Q4: 0.8
  },
  steel: {
    Q1: 0.95,
    Q2: 1.05,
    Q3: 1.1,
    Q4: 0.9
  },
  bricks: {
    Q1: 0.85,
    Q2: 1.15,
    Q3: 1.2,
    Q4: 0.8
  },
  sand: {
    Q1: 0.9,
    Q2: 1.1,
    Q3: 1.15,
    Q4: 0.85
  }
};

interface MaterialPredictionProps {
  userRole: string;
}

const MaterialPrediction: React.FC<MaterialPredictionProps> = ({
  userRole
}) => {
  const [selectedMaterial, setSelectedMaterial] = useState('cement');
  const [timeframe, setTimeframe] = useState('6m');
  const [isCalculating, setIsCalculating] = useState(false);
  const [predictions, setPredictions] = useState<MaterialData[]>(initialFuturePredictions);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [error, setError] = useState<string | null>(null);

  // Calculate trend using linear regression
  const calculateTrend = useCallback((data: MaterialData[]) => {
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    data.forEach((point, index) => {
      if (point.actual) {
        sumX += index;
        sumY += point.actual;
        sumXY += index * point.actual;
        sumXX += index * index;
      }
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return {
      slope,
      intercept
    };
  }, []);

  // Calculate seasonal index
  const getSeasonalFactor = useCallback((month: string, material: string) => {
    const monthToQuarter: {
      [key: string]: keyof typeof seasonalFactors.cement
    } = {
      'Jan': 'Q1',
      'Feb': 'Q1',
      'Mar': 'Q1',
      'Apr': 'Q2',
      'May': 'Q2',
      'Jun': 'Q2',
      'Jul': 'Q3',
      'Aug': 'Q3',
      'Sep': 'Q3',
      'Oct': 'Q4',
      'Nov': 'Q4',
      'Dec': 'Q4'
    };

    const quarter = monthToQuarter[month];
    return seasonalFactors[material as keyof typeof seasonalFactors][quarter];
  }, []);

  // Calculate confidence interval
  const calculateConfidenceInterval = useCallback((predicted: number, stdDev: number) => {
    const zScore = 1.96;
    const margin = zScore * stdDev;
    return {
      lower: Math.max(0, predicted - margin),
      upper: predicted + margin
    };
  }, [confidenceLevel]);

  const handleCalculate = useCallback(async () => {
    try {
      setIsCalculating(true);
      setError(null);

      // Get trend from historical data
      const {
        slope,
        intercept
      } = calculateTrend(historicalData);

      // Calculate standard deviation from historical predictions
      const errors = historicalData.filter(d => d.actual && d.predicted).map(d => Math.pow((d.actual! - d.predicted!), 2));
      const stdDev = Math.sqrt(errors.reduce((a, b) => a + b, 0) / errors.length);

      // Generate new predictions
      const newPredictions = initialFuturePredictions.map((point, index) => {
        const baselinePrediction = intercept + slope * (historicalData.length + index);
        const seasonalFactor = getSeasonalFactor(point.month, selectedMaterial);
        const predicted = baselinePrediction * seasonalFactor;
        const confidence = calculateConfidenceInterval(predicted, stdDev);

        return {
          ...point,
          predicted: Math.round(predicted),
          confidence
        };
      });

      setPredictions(newPredictions);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      setError('Failed to calculate predictions. Please try again.');
      console.error('Prediction calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  }, [selectedMaterial, timeframe, calculateTrend, getSeasonalFactor, calculateConfidenceInterval]);
  return <div className="space-y-4 xs:space-y-6 p-4 xs:p-6">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4">
        <h1 className="text-xl xs:text-2xl font-bold text-gray-800 dark:text-white">
          Material Demand Prediction
        </h1>
        <button onClick={handleCalculate} disabled={isCalculating} className="flex items-center px-3 xs:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base w-full xs:w-auto justify-center">
          <CalculatorIcon size={18} className="mr-2" />
          {isCalculating ? 'Calculating...' : 'Calculate Predictions'}
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="flex items-center p-3 xs:p-4 bg-red-50 dark:bg-red-900 rounded-lg">
          <AlertTriangleIcon size={18} className="text-red-500 dark:text-red-400 mr-2" />
          <p className="text-red-700 dark:text-red-200 text-sm xs:text-base">{error}</p>
        </div>}

      {/* Filters */}
      <div className="flex flex-col xs:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Material</label>
          <select value={selectedMaterial} onChange={e => setSelectedMaterial(e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base">
            <option value="cement">Portland Cement</option>
            <option value="steel">Steel Bars</option>
            <option value="bricks">Bricks</option>
            <option value="sand">Sand</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeframe</label>
          <select value={timeframe} onChange={e => setTimeframe(e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base">
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="1y">1 Year</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 xs:p-6 rounded-lg shadow transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400">Current Monthly Demand</p>
              <p className="text-lg xs:text-2xl font-semibold text-gray-800 dark:text-white">
                {historicalData[historicalData.length - 1].actual?.toLocaleString()} units
              </p>
            </div>
            <TrendingUpIcon size={20} className="text-primary-500" />
          </div>
          <p className="text-xs text-green-600 mt-1">
            +5% from last month
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 ">Predicted Peak Demand</p>
              <p className="text-2xl font-semibold text-gray-800 ">
                {Math.max(...predictions.map(p => p.predicted || 0)).toLocaleString()} units
              </p>
            </div>            <CalculatorIcon size={24} className="text-primary-500" />
          </div>
          <p className="text-xs text-blue-600 mt-1">
            95% Confidence Level
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 ">Seasonal Trend</p>
              <p className="text-2xl font-semibold text-gray-800 ">
                {(seasonalFactors[selectedMaterial as keyof typeof seasonalFactors].Q3 * 100 - 100).toFixed(1)}% peak
              </p>
            </div>            <TrendingUpIcon size={24} className="text-primary-500" />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Highest in Q3 (Summer)
          </p>
        </div>
      </div>

      {/* Historical Data Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 ">Historical Demand vs Predictions</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={historicalData} margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual Demand" strokeWidth={2} dot={{
              r: 4
            }} activeDot={{
              r: 8
            }} />
            <Line type="monotone" dataKey="predicted" stroke="#82ca9d" name="Predicted Demand" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Future Predictions Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 ">Future Demand Predictions</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={predictions} margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return <div className="bg-white p-3 border rounded shadow">
                    <p className="text-sm font-medium text-gray-900 ">{data.month}</p>
                    <p className="text-sm text-gray-700 ">Predicted: {data.predicted?.toLocaleString()} units</p>
                    <p className="text-xs text-gray-500 ">
                      Confidence Interval: {data.confidence?.lower.toLocaleString()} - {data.confidence?.upper.toLocaleString()}
                    </p>
                  </div>;
              }
              return null;
            }} />
            <Legend />
            <Line type="monotone" dataKey="predicted" stroke="#82ca9d" name="Predicted Demand" strokeWidth={2} />
            {/* Confidence Intervals */}
            <Line type="monotone" dataKey="confidence.upper" stroke="#82ca9d" strokeOpacity={0.3} strokeDasharray="3 3" name="Upper Bound (95%)" />
            <Line type="monotone" dataKey="confidence.lower" stroke="#82ca9d" strokeOpacity={0.3} strokeDasharray="3 3" name="Lower Bound (95%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>;
};

export default MaterialPrediction;
