import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { panier } = req.body;

    const line_items = panier.map(item => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.nom,
        },
        unit_amount: Math.round(item.prix * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "https://walzy23-ai.vercel.app",
      cancel_url: "https://walzy23-ai.vercel.app",
    });

    res.status(200).json({ id: session.id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur Stripe" });
  }
}