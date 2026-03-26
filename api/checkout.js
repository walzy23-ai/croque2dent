const Stripe = require("stripe");
const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
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

    // 📧 EMAIL RESTO
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "🧾 Nouvelle commande Croque2Dent",
      text: `
Nouvelle commande !

Nom : ${nom}
Téléphone : ${tel}
Heure retrait : ${heure}

Produits :
${panier.map(p => `- ${p.nom} (${p.prix}€)`).join("\n")}

💰 Total : ${panier.reduce((t,p)=>t+p.prix,0).toFixed(2)}€
      `,
    });

    res.status(200).json({ id: session.id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
