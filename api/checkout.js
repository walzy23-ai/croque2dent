const Stripe = require("stripe");

module.exports = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { panier } = req.body;

    if (!panier || panier.length === 0) {
      return res.status(400).json({ error: "Panier vide" });
    }

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
      success_url: "https://croque2dent-9wvi.vercel.app",
      cancel_url: "https://croque2dent-9wvi.vercel.app",
    });

    res.status(200).json({ id: session.id });

  } catch (err) {
    console.error("ERREUR STRIPE :", err);
    res.status(500).json({ error: err.message });
  }
};
