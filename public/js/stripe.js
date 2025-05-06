/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';
const loadStripe = () => {
  return new Promise((resolve, reject) => {
    // Check if Stripe is already loaded
    if (window.Stripe) {
      return resolve(
        window.Stripe(
          'pk_test_51RJvTZRUE4XmW21W5KsQvJRN9MRbk2ozqg9zjauNgeRUA2bmcdJgVkEjvZwV0oYNd7itgzFDaXA4isHZM58r8m6E00xzXsAiSQ',
        ),
      );
    }

    // If not loaded, create script tag and load it
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
      resolve(
        window.Stripe(
          'pk_test_51RJvTZRUE4XmW21W5KsQvJRN9MRbk2ozqg9zjauNgeRUA2bmcdJgVkEjvZwV0oYNd7itgzFDaXA4isHZM58r8m6E00xzXsAiSQ',
        ),
      );
    };
    script.onerror = () => {
      reject(new Error('Failed to load Stripe.js'));
    };
    document.head.appendChild(script);
  });
};

//************************//
// BELOW THIS IS CORRECT!!!!!!
// const stripe = Stripe(
//   'pk_test_51RJvTZRUE4XmW21W5KsQvJRN9MRbk2ozqg9zjauNgeRUA2bmcdJgVkEjvZwV0oYNd7itgzFDaXA4isHZM58r8m6E00xzXsAiSQ',
// );
//
// NEED TO INCLUDE STRIPE.JS SCRIPT IN BASE PUG ALSO!!!!!!
// <script src="https://js.stripe.com/v3/"></script>

//***********************// */
// if (window.Stripe) {
//   const stripe = Stripe('pk_test_...');
// } else {
//   console.error('Stripe.js failed to load.');
// }

export const bookTour = async (tourID) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourID}`);

    const stripe = await loadStripe();
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
    // 2) Create checkout form + charge card
  } catch (err) {
    console.error(err);
    showAlert('Error: ', err);
  }
};
