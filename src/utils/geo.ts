import { Region } from "../types";

export function getRegion(lat: number, lon: number): Region {
	if (lat > 24 && lat < 72 && lon > -170 && lon < -52) {
		if (lat < 37 && lon > -115) return Region.SOUTHWEST;
		if (lat > 44 && lon < -115) return Region.NORTHWEST;
		if (lat > 37 && lat < 44 && lon > -115 && lon < -100) return Region.MOUNTAIN;
		return Region.PLAINS;
	}
	return Region.DEFAULT;
}
