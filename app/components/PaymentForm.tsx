import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface PaymentFormProps {
  clientSecret: string;  // Receive clientSecret as a prop
}

export default function PaymentForm({ clientSecret }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (error) {
      setError(error.message || 'An error occurred');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      alert('Payment successful!');
      // Here you would typically update the post's funding status
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition duration-300 mt-4"
      >
        {processing ? 'Processing...' : 'Pay'}
      </button>
    </form>
  );
}
