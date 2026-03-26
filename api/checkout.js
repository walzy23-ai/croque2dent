const Stripe = require("stripe");
const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  console.log("🚀 API appelée");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const { panier, nom, tel, heure } = req.body;

    console.log("📦 Données reçues :", panier, nom, tel, heure);

    // 🔥 TEST EMAIL DIRECT
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "🔥 TEST EMAIL CROQUE2DENT",
      text: "SI TU VOIS CE MESSAGE → EMAIL OK",
    });

    console.log("✅ TEST EMAIL ENVOYÉ");

    const line_items = panier.map(item => ({
      price_data: {
        currency: "eur",
        product_data: { name: item.nom },
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
    console.error("❌ ERREUR :", err);
    res.status(500).json({ error: err.message });
  }
};
