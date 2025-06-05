const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const User = require('../models/userModel');

// GET CHECKOUT SESSION FROM STRIPE PRODUCTION
exports.stripeWebhookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const tour = session.client_reference_id; // Get the tour ID from the session
    const user = User.findOne({
      email: session.customer_email // Get the user ID from the email
    });
    const price = session.display_items.data[0].price.unit_amount / 100; // Get the price from the session

    // Save the booking in the database
    await Booking.create({
      tour,
      user,
      price
    });
  }

  // Return a response to acknowledge receipt of the event
  res.status(200).json({ received: true });
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  if (!req.params.tourId) return next(new AppError('Tour Id is missing', 400));

  // GET THE CURRENTLY BOOKED TOUR
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) return next(new AppError('Tour not found', 404));

  // const userId = req.user.id;
  // const { tourId } = req.params;

  // HACK TO GET TOUR, USER AND PRICE IN THE SUCCESS URL, FOR BOOKING.
  // success_url: `${req.protocol}://${req.get(
  //     'host'
  //   )}/my-bookings?tour=${tourId}&user=${userId}&price=${tour.price}`

  // CREATE CHECKOUT SESSION
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${req.protocol}://${req.get(
      'host'
    )}/my-bookings?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`
            ]
          }
        },
        quantity: 1
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // THIS ONLY TEMPORARY SOL, OF HANDLING BOOKING WHILE NOT DEPLOYED.
  // VIABLE SOL IS USING STRIPE WEBHOOK, THAT RETURNS THE CHECKOUT SESSION.
  // WHICH IS SECURE

  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({
    tour,
    user,
    price
  });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.tourIsBooked = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const userId = res.locals.user ? res.locals.user._id : null;
  res.locals.isBooked = false;

  // IF THERE IS NO SLUG OR USERID, THEN CONTINUE TO THE NEXT MIDDLEWARE
  if (!slug || !userId) {
    // If no slug or userId, we can't check booking status
    return next();
  }

  // GET THE TOUR ID FROM THE SLUG
  const tour = await Tour.findOne({ slug });
  if (!tour) {
    return next();
  }

  // CHECK IF THE TOUR IS BOOKED BY THE USER
  const booking = await Booking.findOne({
    tour: tour._id,
    user: userId
  });

  // IF THERE IS NO BOOKING, THEN CONTINUE TO THE NEXT MIDDLEWARE
  if (!booking) {
    return next();
  }

  // IF THERE IS A BOOKING, THEN SET THE res.locals.isBooked TO TRUE
  res.locals.isBooked = true;

  // CONTINUE TO THE NEXT MIDDLEWARE
  next();
});

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
