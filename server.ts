import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

import Stript from "stripe";

const stript = new Stript(process.env.STRIPE_SECRET_KEY as string)


const port = 3500;

const app = express();

app.set(`view engine`, `ejs`);
app.set("views", path.join(__dirname, "view"))

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.render(`index`);
});

app.post("/checkout", async (req: Request, res: Response) => {
    const session = await stript.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Example Product Name here"
                    },
                    unit_amount: 50 * 100 // 50 aita sob somoy sent a count hoy aita ka 100 diya gun korla amra usd pai
                },
                quantity: 1
            }
        ],
        mode: "payment",
        success_url: "http://localhost:3500/success",
        cancel_url: "http://localhost:3500/cancel" // cancel or faild hoila ai route a jaba
    });

    console.log(session);
    res.redirect(session.url as string);
})

app.listen(port, () => {
    console.log(`Server runing on port : ${port}`);
});