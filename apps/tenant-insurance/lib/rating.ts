export type EndorsementKey =
	| "jewelry"
	| "electronics"
	| "identityTheft"
	| "waterBackup";

export type RatingInput = {
	plan: "Essential" | "Standard" | "Plus";
	zip: string;
	state?: string;
	propertyValue: number;
	buildingType: "apartment" | "house" | "condo";
	priorClaims: number;
	deductible: 250 | 500 | 1000;
	endorsements: Partial<Record<EndorsementKey, boolean>>;
};

export type RatingBreakdown = {
	base: number;
	riskZip: number;
	propertyAdj: number;
	buildingAdj: number;
	claimsAdj: number;
	deductibleAdj: number;
	endorsements: Record<EndorsementKey, number>;
	total: number;
};

export function rate(input: RatingInput): RatingBreakdown {
	const {
		plan,
		zip,
		propertyValue,
		buildingType,
		priorClaims,
		deductible,
		endorsements,
	} = input;
	const base = plan === "Plus" ? 24 : plan === "Standard" ? 16 : 10;
	// crude zip risk by first digit
	const riskFactor = /^9/.test(zip) ? 1.15 : /^1/.test(zip) ? 0.93 : 1.0;
	const riskZip = Math.round(base * (riskFactor - 1));

	// property adjustment capped
	const propAdjFactor = Math.min(1 + propertyValue / 100000, 1.6);
	const propertyAdj = Math.round(base * (propAdjFactor - 1));

	// building type differences
	const buildingFactors: Record<RatingInput["buildingType"], number> = {
		apartment: 0.98,
		condo: 1.0,
		house: 1.08,
	};
	const buildingAdj = Math.round(base * (buildingFactors[buildingType] - 1));

	// prior claims surcharge
	const claimsAdj = Math.round(base * 0.08 * Math.min(priorClaims, 3));

	// deductible credit (higher deductible -> lower premium)
	const deductibleMap: Record<RatingInput["deductible"], number> = {
		250: 1.1,
		500: 1.0,
		1000: 0.9,
	};
	const deductibleAdj = Math.round(base * (deductibleMap[deductible] - 1));

	const endorsementRates: Record<EndorsementKey, number> = {
		jewelry: 6,
		electronics: 4,
		identityTheft: 3,
		waterBackup: 5,
	};
	const endorsementsBreakdown = Object.fromEntries(
		(Object.keys(endorsementRates) as EndorsementKey[]).map((k) => [
			k,
			endorsements[k] ? endorsementRates[k] : 0,
		]),
	) as Record<EndorsementKey, number>;

	const subtotal =
		base + riskZip + propertyAdj + buildingAdj + claimsAdj + deductibleAdj;
	const total = Math.max(
		8,
		subtotal + Object.values(endorsementsBreakdown).reduce((a, b) => a + b, 0),
	);

	return {
		base,
		riskZip,
		propertyAdj,
		buildingAdj,
		claimsAdj,
		deductibleAdj,
		endorsements: endorsementsBreakdown,
		total,
	};
}
