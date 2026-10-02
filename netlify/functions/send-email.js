const { Resend } = require("resend");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    let body;
    try { body = JSON.parse(event.body); }
    catch { return { statusCode: 400, body: JSON.stringify({ error: "Invalid request." }) }; }

    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
        return { statusCode: 400, body: JSON.stringify({ error: "Name, email and message are required." }) };
    }

    try {
        await resend.emails.send({
            from: "Portfolio Contact <onboarding@resend.dev>",
            to: "jaykumarshrivastav1@gmail.com",
            reply_to: email,
            subject: subject ? "[Portfolio] " + subject : "[Portfolio] New message from " + name,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f4f4f9;border-radius:10px;">
                    <div style="background:linear-gradient(135deg,#6c63ff,#a855f7);padding:20px 24px;border-radius:8px;margin-bottom:24px;">
                        <h2 style="color:#fff;margin:0;font-size:1.4rem;">&#128235; New Portfolio Message</h2>
                        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:0.9rem;">Someone reached out via your portfolio website</p>
                    </div>
                    <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                        <tr style="background:#f8f8ff;">
                            <td style="padding:14px 18px;font-weight:700;color:#6c63ff;width:90px;border-bottom:1px solid #eee;">Name</td>
                            <td style="padding:14px 18px;color:#333;border-bottom:1px solid #eee;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding:14px 18px;font-weight:700;color:#6c63ff;border-bottom:1px solid #eee;">Email</td>
                            <td style="padding:14px 18px;border-bottom:1px solid #eee;"><a href="mailto:${email}" style="color:#6c63ff;">${email}</a></td>
                        </tr>
                        <tr style="background:#f8f8ff;">
                            <td style="padding:14px 18px;font-weight:700;color:#6c63ff;">Subject</td>
                            <td style="padding:14px 18px;color:#333;">${subject || "No subject"}</td>
                        </tr>
                    </table>
                    <div style="margin-top:20px;padding:20px;background:#fff;border-left:4px solid #6c63ff;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                        <p style="font-weight:700;color:#333;margin:0 0 10px;">Message:</p>
                        <p style="color:#555;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
                    </div>
                    <p style="margin-top:20px;font-size:11px;color:#aaa;text-align:center;">Sent from jaykumar-portfolio.netlify.app</p>
                </div>
            `
        });

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        console.error("Resend error:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Failed to send email. Please try again." })
        };
    }
};
