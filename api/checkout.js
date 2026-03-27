const Stripe = require("stripe");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  console.log("🚀 API appelée");

  let body = req.body;

  if (typeof body === "string") {
    body = JSON.parse(body);
  }

  const { panier, nom, tel, heure } = body || {};

  console.log("📦 Données reçues :", panier, nom, tel, heure);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // 📧 EMAIL VIA RESEND
   console.log("📧 AVANT ENVOI EMAIL");

const result = await resend.emails.send({
  from: "onboarding@resend.dev",
  to: "delivered@resend.dev",
  subject: "TEST",
  html: "<p>TEST OK</p>",
});

console.log("📧 RESULT RESEND :", result);
      subject: "📦 Nouvelle commande Croque2Dent",
     await resend.emails.send({
  from: "Croque2Dent <onboarding@resend.dev>",
  to: "walzy23@hotmail.fr",
  subject: "📦 Nouvelle commande Croque2Dent",
  html: `<h2>📦 Nouvelle commande</h2>
  <p><strong>Nom :</strong> ${nom}</p>
  <p><strong>Téléphone :</strong> ${tel}</p>
  <p><strong>Heure :</strong> ${heure}</p>
  <p><strong>Total :</strong> ${(panier || []).reduce((t,p)=>t+p.prix,0)} €</p>`
});

    console.log("✅ EMAIL ENVOYÉ AVEC RESEND");

    const line_items = (panier || []).map(item => ({
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
