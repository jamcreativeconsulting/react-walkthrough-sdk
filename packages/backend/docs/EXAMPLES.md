# Walkthrough SDK Implementation Examples

## Table of Contents
1. [JavaScript/TypeScript](#javascripttypescript)
2. [Python](#python)
3. [React](#react)
4. [Vue.js](#vuejs)
5. [Node.js](#nodejs)
6. [PHP](#php)

## JavaScript/TypeScript

### Basic API Client
```typescript
class WalkthroughClient {
  constructor(private apiKey: string, private baseUrl: string) {}

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getWalkthroughs() {
    return this.request('/api/walkthroughs');
  }

  async createWalkthrough(walkthrough: any) {
    return this.request('/api/walkthroughs', {
      method: 'POST',
      body: JSON.stringify(walkthrough),
    });
  }

  async updateProgress(userId: string, walkthroughId: string, progress: any) {
    return this.request(`/api/progress/${userId}/${walkthroughId}`, {
      method: 'PUT',
      body: JSON.stringify(progress),
    });
  }
}

// Usage
const client = new WalkthroughClient('your-api-key', 'http://localhost:3000');
const walkthroughs = await client.getWalkthroughs();
```

## Python

### Basic API Client
```python
import requests

class WalkthroughClient:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        })

    def get_walkthroughs(self):
        response = self.session.get(f"{self.base_url}/api/walkthroughs")
        response.raise_for_status()
        return response.json()

    def create_walkthrough(self, walkthrough: dict):
        response = self.session.post(
            f"{self.base_url}/api/walkthroughs",
            json=walkthrough
        )
        response.raise_for_status()
        return response.json()

    def update_progress(self, user_id: str, walkthrough_id: str, progress: dict):
        response = self.session.put(
            f"{self.base_url}/api/progress/{user_id}/{walkthrough_id}",
            json=progress
        )
        response.raise_for_status()
        return response.json()

# Usage
client = WalkthroughClient('your-api-key', 'http://localhost:3000')
walkthroughs = client.get_walkthroughs()
```

## React

### Walkthrough Component
```tsx
import React, { useEffect, useState } from 'react';

interface WalkthroughProps {
  apiKey: string;
  baseUrl: string;
  walkthroughId: string;
  userId: string;
}

const Walkthrough: React.FC<WalkthroughProps> = ({
  apiKey,
  baseUrl,
  walkthroughId,
  userId,
}) => {
  const [walkthrough, setWalkthrough] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchWalkthrough = async () => {
      const response = await fetch(
        `${baseUrl}/api/walkthroughs/${walkthroughId}`,
        {
          headers: {
            'X-API-Key': apiKey,
          },
        }
      );
      const data = await response.json();
      setWalkthrough(data);
    };

    fetchWalkthrough();
  }, [walkthroughId]);

  const updateProgress = async (step: number) => {
    await fetch(
      `${baseUrl}/api/progress/${userId}/${walkthroughId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          currentStep: step,
          completed: step === walkthrough.steps.length - 1,
        }),
      }
    );
  };

  const handleNext = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    updateProgress(nextStep);
  };

  if (!walkthrough) return null;

  const step = walkthrough.steps[currentStep];

  return (
    <div className="walkthrough-popup">
      <h3>{step.title}</h3>
      <p>{step.content}</p>
      <div className="controls">
        {currentStep > 0 && (
          <button onClick={() => setCurrentStep(currentStep - 1)}>
            Previous
          </button>
        )}
        {currentStep < walkthrough.steps.length - 1 && (
          <button onClick={handleNext}>Next</button>
        )}
        {currentStep === walkthrough.steps.length - 1 && (
          <button onClick={() => updateProgress(currentStep)}>
            Finish
          </button>
        )}
      </div>
    </div>
  );
};

export default Walkthrough;
```

## Vue.js

### Walkthrough Component
```vue
<template>
  <div v-if="walkthrough" class="walkthrough-popup">
    <h3>{{ currentStep.title }}</h3>
    <p>{{ currentStep.content }}</p>
    <div class="controls">
      <button
        v-if="stepIndex > 0"
        @click="setStep(stepIndex - 1)"
      >
        Previous
      </button>
      <button
        v-if="stepIndex < walkthrough.steps.length - 1"
        @click="handleNext"
      >
        Next
      </button>
      <button
        v-if="stepIndex === walkthrough.steps.length - 1"
        @click="finish"
      >
        Finish
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    apiKey: String,
    baseUrl: String,
    walkthroughId: String,
    userId: String,
  },

  data() {
    return {
      walkthrough: null,
      stepIndex: 0,
    };
  },

  computed: {
    currentStep() {
      return this.walkthrough?.steps[this.stepIndex];
    },
  },

  async created() {
    await this.fetchWalkthrough();
  },

  methods: {
    async fetchWalkthrough() {
      const response = await fetch(
        `${this.baseUrl}/api/walkthroughs/${this.walkthroughId}`,
        {
          headers: {
            'X-API-Key': this.apiKey,
          },
        }
      );
      this.walkthrough = await response.json();
    },

    async updateProgress(step) {
      await fetch(
        `${this.baseUrl}/api/progress/${this.userId}/${this.walkthroughId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
          },
          body: JSON.stringify({
            currentStep: step,
            completed: step === this.walkthrough.steps.length - 1,
          }),
        }
      );
    },

    setStep(index) {
      this.stepIndex = index;
    },

    async handleNext() {
      const nextStep = this.stepIndex + 1;
      this.setStep(nextStep);
      await this.updateProgress(nextStep);
    },

    async finish() {
      await this.updateProgress(this.stepIndex);
      this.$emit('complete');
    },
  },
};
</script>
```

## Node.js

### Express Middleware Example
```typescript
import express from 'express';
import { WalkthroughClient } from './walkthrough-client';

const app = express();
const client = new WalkthroughClient('your-api-key', 'http://localhost:3000');

// Middleware to attach walkthrough data
app.use(async (req, res, next) => {
  try {
    const walkthroughs = await client.getWalkthroughs();
    res.locals.walkthroughs = walkthroughs;
    next();
  } catch (error) {
    next(error);
  }
});

// Route that uses walkthrough data
app.get('/dashboard', (req, res) => {
  const { walkthroughs } = res.locals;
  res.render('dashboard', { walkthroughs });
});

// Progress tracking endpoint
app.post('/track-progress', express.json(), async (req, res) => {
  const { userId, walkthroughId, progress } = req.body;
  try {
    const result = await client.updateProgress(
      userId,
      walkthroughId,
      progress
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## PHP

### Basic API Client
```php
<?php

class WalkthroughClient {
    private $apiKey;
    private $baseUrl;

    public function __construct($apiKey, $baseUrl) {
        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl;
    }

    private function request($endpoint, $method = 'GET', $data = null) {
        $ch = curl_init("{$this->baseUrl}{$endpoint}");

        $headers = [
            'X-API-Key: ' . $this->apiKey,
            'Content-Type: application/json',
        ];

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        if ($method !== 'GET') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }

        $response = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        curl_close($ch);

        if ($statusCode >= 400) {
            throw new Exception("API request failed with status $statusCode");
        }

        return json_decode($response, true);
    }

    public function getWalkthroughs() {
        return $this->request('/api/walkthroughs');
    }

    public function createWalkthrough($walkthrough) {
        return $this->request('/api/walkthroughs', 'POST', $walkthrough);
    }

    public function updateProgress($userId, $walkthroughId, $progress) {
        return $this->request(
            "/api/progress/$userId/$walkthroughId",
            'PUT',
            $progress
        );
    }
}

// Usage
$client = new WalkthroughClient('your-api-key', 'http://localhost:3000');
$walkthroughs = $client->getWalkthroughs();
``` 