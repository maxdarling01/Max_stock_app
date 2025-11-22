import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Success() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>
          
          <div className="space-y-3">
            <Link to="/" className="block">
              <Button className="w-full">
                Browse Content
              </Button>
            </Link>
            
            <Link to="/pricing" className="block">
              <Button variant="outline" className="w-full">
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}