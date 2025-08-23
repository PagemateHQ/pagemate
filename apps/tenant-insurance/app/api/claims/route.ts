import { NextResponse } from "next/server";

export async function POST(_req: Request) {
	try {
		// In a real app, validate and persist `data` then enqueue notifications
		// In a real app, validate and persist `data` then enqueue notifications
		const id = `ACM-${Math.floor(Math.random() * 900000 + 100000)}`;
		return NextResponse.json({ id, received: true });
	} catch {
		return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
	}
}
