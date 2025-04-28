import connectToDatabase from "@/library/database/db";
import { getSchemeRecommendation } from "@/library/Gemini/RecommendAI";
import Scheme from "@/library/modals/SchemeSchema";


import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const schemes = await Scheme.find();

    const recommendation = await getSchemeRecommendation(
      schemes
    );
    console.log(recommendation);

    return NextResponse.json({ recommendation });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
