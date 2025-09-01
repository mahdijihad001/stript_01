import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import Stripe from "stripe";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const port: number = Number(process.env.PORT) || 3500;

const app = express();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));


app.get("/", (req: Request, res: Response, next: NextFunction): void => {
  res.render("index");
});


app.post("/checkout", async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Node.js and Express book",
            },
            unit_amount: 50 * 100, 
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "JavaScript T-Shirt",
            },
            unit_amount: 20 * 100,
          },
          quantity: 2,
        },
      ],
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["US", "BR"],
      },
      success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/cancel`,
    });

    res.redirect(session.url!);
  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).send("Something went wrong!");
  }
});


app.get("/complete", async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.query.session_id as string;

    if (!sessionId) {
      res.status(400).send("Session ID is missing");
      return;
    }

    const [session, lineItems] = await Promise.all([
      stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent.payment_method"],
      }),
      stripe.checkout.sessions.listLineItems(sessionId),
    ]);

    console.log(JSON.stringify(session, null, 2));
    console.log(JSON.stringify(lineItems, null, 2));

    res.send("Your payment was successful!");
  } catch (error) {
    console.error("Complete Route Error:", error);
    res.status(500).send("Something went wrong!");
  }
});

app.get("/cancel", (req: Request, res: Response): void => {
  res.redirect("/");
});


app.listen(port, (): void => {
  console.log(`🚀 Server running on port: ${port}`);
});
