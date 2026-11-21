
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Stripe from "stripe";

import Appointment from "../models/Appointment.js";
import Transaction from "../models/Transaction.js";

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  throw new Error("STRIPE_SECRET_KEY is missing from environment variables.");
}

const stripe = new Stripe(stripeKey);

const currency = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();

// Customer: Create Stripe Checkout Session
export const createCheckoutSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const appointmentId = req.params.id;
    const customerId = res.locals.currentUser.id;

    if (
      typeof appointmentId !== "string" ||
      !mongoose.Types.ObjectId.isValid(appointmentId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
      return;
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      customerId: new mongoose.Types.ObjectId(customerId),
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
      return;
    }

    if (appointment.status !== "confirmed") {
      res.status(400).json({
        success: false,
        message: "Only confirmed appointments can be paid.",
      });
      return;
    }

    if (appointment.paymentStatus !== "unpaid") {
      res.status(400).json({
        success: false,
        message: "This appointment has already been paid.",
      });
      return;
    }

    if (!Number.isFinite(appointment.servicePrice) ||
        appointment.servicePrice <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid appointment payment amount.",
      });
      return;
    }

    const clientUrl = process.env.CLIENT_URL;

    if (!clientUrl) {
      res.status(500).json({
        success: false,
        message: "Client URL configuration is missing.",
      });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: "Salon Appointment",
              description: `Appointment ${appointment._id.toString()}`,
            },
            unit_amount: Math.round(appointment.servicePrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointment._id.toString(),
        customerId: customerId.toString(),
      },
      client_reference_id: appointment._id.toString(),
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment/cancel`,
    });

    if (!session.url) {
      res.status(502).json({
        success: false,
        message: "Unable to create Stripe Checkout URL.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Stripe Checkout session created.",
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create payment session.",
    });
  }
};

// Stripe: Handle verified webhook events
export const handleStripeWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    res.status(500).json({
      success: false,
      message: "Stripe webhook configuration is missing.",
    });
    return;
  }

  const signature = req.headers["stripe-signature"];

  if (!signature || Array.isArray(signature) ||
      !Buffer.isBuffer(req.body)) {
    res.status(400).json({
      success: false,
      message: "Invalid Stripe webhook request.",
    });
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Stripe signature verification failed:", error);

    res.status(400).json({
      success: false,
      message: "Invalid webhook signature.",
    });
    return;
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        res.status(200).json({
          received: true,
          message: "Checkout completed but payment is not yet paid.",
        });
        return;
      }

      const appointmentId = session.metadata?.appointmentId;
      const customerId = session.metadata?.customerId;

      if (
        !appointmentId ||
        !customerId ||
        !mongoose.Types.ObjectId.isValid(appointmentId) ||
        !mongoose.Types.ObjectId.isValid(customerId) ||
        !session.id
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid appointment metadata.",
        });
        return;
      }

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        customerId: new mongoose.Types.ObjectId(customerId),
        status: "confirmed",
      });

      if (!appointment) {
        res.status(400).json({
          success: false,
          message: "Matching confirmed appointment not found.",
        });
        return;
      }

      const expectedAmount = Math.round(
        appointment.servicePrice * 100
      );

      if (
        session.amount_total !== expectedAmount ||
        session.currency !== currency ||
        session.mode !== "payment"
      ) {
        res.status(400).json({
          success: false,
          message: "Stripe payment amount or currency mismatch.",
        });
        return;
      }

      // Update only after Stripe signature and payment are verified.
      await Appointment.updateOne(
        {
          _id: appointment._id,
          paymentStatus: "unpaid",
        },
        {
          $set: { paymentStatus: "paid" },
        }
      );

      // Unique stripeSessionId prevents duplicate transactions.
      await Transaction.updateOne(
        { stripeSessionId: session.id },
        {
          $setOnInsert: {
            appointmentId: appointment._id,
            customerId: appointment.customerId,
            amount: expectedAmount / 100,
            currency,
            stripeSessionId: session.id,
            status: "paid",
          },
        },
        { upsert: true }
      );
    }

    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const appointmentId = session.metadata?.appointmentId;
      const customerId = session.metadata?.customerId;

      if (
        appointmentId &&
        customerId &&
        mongoose.Types.ObjectId.isValid(appointmentId) &&
        mongoose.Types.ObjectId.isValid(customerId)
      ) {
        const appointment = await Appointment.findOne({
          _id: appointmentId,
          customerId: new mongoose.Types.ObjectId(customerId),
          status: "confirmed",
          paymentStatus: "unpaid",
        });

        if (appointment) {
          await Transaction.updateOne(
            { stripeSessionId: session.id },
            {
              $setOnInsert: {
                appointmentId: appointment._id,
                customerId: appointment.customerId,
                amount: appointment.servicePrice,
                currency,
                stripeSessionId: session.id,
                status: "failed",
              },
            },
            { upsert: true }
          );
        }
      }
    }

    res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);

    res.status(500).json({
      success: false,
      message: "Webhook processing failed.",
    });
  }
};

// Customer: Verify payment status from database
export const getPaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sessionId = req.params.sessionId;

    if (!sessionId || typeof sessionId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid payment session ID.",
      });
      return;
    }

    const transaction = await Transaction.findOne({
      stripeSessionId: sessionId,
      customerId: new mongoose.Types.ObjectId(
        res.locals.currentUser.id
      ),
    });

    res.status(200).json({
      success: true,
      paid: transaction?.status === "paid",
      transaction,
    });
  } catch (error) {
    console.error("Payment status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment status.",
    });
  }
};
