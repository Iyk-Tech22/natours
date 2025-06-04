/* eslint-disable */
import axios from 'axios';

// Initialize Stripe with your public key
// This key should be kept secret and not exposed in client-side code
export const stripe = Stripe(
  'pk_test_51RUO6EE2OOoLvZGKiQr1GM88YLdBNe7XWWFln25pPMVbEak6SzGN3FpjJO3eYF4ukkQV2XZmQheZzNgszmB9OBab00YUAnzjKh'
);

// Function to handle the checkout process
export const checkout = async tourId => {
  try {
    // Make a request to the server to create a checkout session
    const session = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourId}`,
      withCredentials: true
    });

    // Redirect to Stripe Checkout
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.error('Error during checkout:', err);
    alert(err.response.data.message);
  }
};
