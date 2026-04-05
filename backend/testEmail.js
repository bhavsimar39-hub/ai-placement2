import nodemailer from "nodemailer";

const testEmail = async () => {
    console.log("1. Starting email test...");

    // 👇 HARDCODED CREDENTIALS (JUST FOR TESTING)
    const emailUser = "bhavsimar39@gmail.com"; 
    const emailPass = "wdruagbbwlgxkqty"; // Your password from the screenshot

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log(`2. Sending email from ${emailUser}...`);
        
        await transporter.sendMail({
            from: `"Test" <${emailUser}>`,
            to: emailUser, 
            subject: "Final Test",
            text: "It works!"
        });

        console.log("✅ SUCCESS: Email sent!");
    } catch (error) {
        console.error("❌ FAILURE:", error.message);
    }
};

testEmail();