'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  slug: string;
  fb_ad_account_id: string;
  status: string;
}

interface ScrapeInterfaceProps {
  clients: Client[];
  onScrapeComplete?: () => void;
}

interface ScrapeProgress {
  step: string;
  progress: number;
  message: string;
}

export default function ScrapeInterface({ clients, onScrapeComplete }: ScrapeInterfaceProps) {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [monthYear, setMonthYear] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progress, setProgress] = useState<ScrapeProgress | null>(null);

  // Generate default month (current month)
  React.useEffect(() => {
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonthYear(defaultMonth);
  }, []);

  const simulateProgress = () => {
    const steps = [
      { step: 'Campaign Data', progress: 14, message: 'Fetching campaign performance...' },
      { step: 'Demographics', progress: 28, message: 'Collecting demographic breakdowns...' },
      { step: 'Regional Data', progress: 42, message: 'Gathering regional performance...' },
      { step: 'Device Data', progress: 56, message: 'Processing device metrics...' },
      { step: 'Platform Data', progress: 70, message: 'Analyzing platform performance...' },
      { step: 'Hourly Data', progress: 84, message: 'Collecting time-based data...' },
      { step: 'Ad-Level Data', progress: 98, message: 'Finalizing ad-level metrics...' },
      { step: 'Complete', progress: 100, message: 'Saving to database...' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return interval;
  };

  const handleScrape = async () => {
    if (!selectedClient || !monthYear) {
      setError('Please select a client and month/year');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setProgress(null);

    // Start progress simulation
    const progressInterval = simulateProgress();

    try {
      const response = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: parseInt(selectedClient),
          monthYear,
        }),
      });

      const data = await response.json();

      // Clear progress simulation
      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(data.error || 'Scraping failed');
      }

      setProgress({ step: 'Complete', progress: 100, message: 'Data collection completed successfully!' });
      
      setTimeout(() => {
        setSuccess(`Data collection completed! ${Object.entries(data.dataCollected || {})
          .map(([key, value]) => `${value} ${key}`)
          .join(', ')}`);
        
        setProgress(null);
        onScrapeComplete?.();
      }, 1000);

    } catch (error) {
      clearInterval(progressInterval);
      setProgress(null);
      setError(error instanceof Error ? error.message : 'Scraping failed');
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const getStatusBadge = (client: Client) => {
    return client.status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        Inactive
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Manual Data Collection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client">Select Client</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{client.name}</span>
                      <div className="ml-2">{getStatusBadge(client)}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedClient && (
              <p className="text-sm text-gray-600">
                Ad Account: {clients.find(c => c.id.toString() === selectedClient)?.fb_ad_account_id}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month/Year</Label>
            <Input
              id="month"
              type="month"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              disabled={loading}
            />
            <p className="text-sm text-gray-600">
              Select the month for data collection
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        {loading && progress && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Processing: {progress.step}</span>
                </div>
                <Progress value={progress.progress} className="w-full" />
                <p className="text-sm text-blue-700">{progress.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        <div className="flex flex-col space-y-2">
          <Button 
            onClick={handleScrape}
            disabled={loading || !selectedClient || !monthYear}
            className="w-full md:w-auto"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Collecting Data...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Start Data Collection
              </>
            )}
          </Button>
          
          {!loading && (
            <p className="text-sm text-gray-600">
              This will collect all 7 data types from Facebook Ads API for the selected month.
            </p>
          )}
        </div>

        {/* Collection Types Preview */}
        {selectedClient && !loading && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Data Types to Collect:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Campaigns
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Demographics
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Regional
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Devices
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Platforms
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Hourly Stats
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Ad-Level
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}