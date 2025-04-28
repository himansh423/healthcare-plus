import connectToDatabase from "@/library/database/db";
import User from "@/library/modals/User";
import { sendEmail } from "@/library/sendMail/sendEmail";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";



export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const {firstName, lastName, email, password } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });
    }
 
    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

  
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      otp,
      isVerified: false,
    });

    await newUser.save();

    await sendEmail({
      to: email,
      subject: "OTP from Syndicate",
      text: `Your OTP code is ${otp}, use it within 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>OTP Verification</h2>
          <p>Hello ${firstName},</p>
          <p>Your OTP code is <strong>${otp}</strong>. Please use it within the next 15 minutes to verify your account.</p>
          <p>If you did not request this OTP, please ignore this email.</p>
          <br>
          <p>Thanks,</p>
          <p>The Syndicate Team</p>
        </div>
      `,
    });

    
    setTimeout(async () => {
      const user = await User.findOne({ email });
      
      if (user && !user.isVerified) {
        await User.deleteOne({ email });

        
        await sendEmail({
          to: email,
          subject: "Signup Expired",
          text: `Hello ${firstName}, since you did not verify your email within 2 minutes, your signup process was canceled. Please try signing up again.`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>Signup Expired</h2>
              <p>Hello ${firstName},</p>
              <p>Since you did not verify your email within 2 minutes, your signup process was canceled and your data has been deleted.</p>
              <p>Please try signing up again to create your account.</p>
              <br>
              <p>Thanks,</p>
              <p>The Syndicate Team</p>
            </div>
          `,
        });
      }
    }, 5 * 60 * 1000); 

    return NextResponse.json({ success: true, message: "OTP sent to your email" }, { status: 200 });
  } catch (error:unknown) {
    if(error instanceof Error){
      return NextResponse.json({ message: error.message, error:  "An unknown error occurred" }, { status: 500 });
    }
   
  }
}
