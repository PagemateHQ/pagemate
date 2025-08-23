import { NextResponse } from "next/server";
import { type RatingInput, rate } from "@/lib/rating";

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as Partial<RatingInput>;
		// Basic validation and defaults
		const input: RatingInput = {
			plan: (body.plan as RatingInput["plan"]) ?? "Standard",
			zip: (body.zip as string) ?? "",
			state: (body.state as string) ?? undefined,
			propertyValue: Number(body.propertyValue ?? 25000),
			buildingType:
				(body.buildingType as RatingInput["buildingType"]) ?? "apartment",
			priorClaims: Number(body.priorClaims ?? 0),
			deductible: (body.deductible as RatingInput["deductible"]) ?? 500,
			endorsements: body.endorsements ?? {},
		};
		const breakdown = rate(input);
		return NextResponse.json({ premium: breakdown.total, breakdown });
	} catch (_e) {
		return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
	}
}
