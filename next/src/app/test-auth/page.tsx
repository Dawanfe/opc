'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testRegister = async () => {
    setLoading(true);
    setResult('Testing...');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser' + Date.now(),
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          nickname: 'Test User',
        }),
      });

      const data = await response.json();

      setResult(JSON.stringify({
        status: response.status,
        ok: response.ok,
        data: data,
      }, null, 2));
    } catch (error) {
      const err = error as Error;
      setResult(`Error: ${err.message}\n${err.stack}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');

    try {
      // First register
      const regResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'logintest' + Date.now(),
          email: `logintest${Date.now()}@example.com`,
          password: 'password123',
        }),
      });

      const regData = await regResponse.json();

      if (regResponse.ok) {
        // Then login
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: regData.user.username,
            password: 'password123',
          }),
        });

        const loginData = await loginResponse.json();

        setResult(JSON.stringify({
          register: { status: regResponse.status, data: regData },
          login: { status: loginResponse.status, data: loginData },
        }, null, 2));
      } else {
        setResult(`Register failed: ${JSON.stringify(regData, null, 2)}`);
      }
    } catch (error) {
      const err = error as Error;
      setResult(`Error: ${err.message}\n${err.stack}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Authentication API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testRegister} disabled={loading}>
              Test Register
            </Button>
            <Button onClick={testLogin} disabled={loading}>
              Test Register + Login
            </Button>
          </div>

          <div>
            <Label>API Response:</Label>
            <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto max-h-96">
              {result || 'Click a button to test...'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
