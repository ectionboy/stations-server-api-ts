import express, { Express, Request, Response } from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "node:path";

const app: Express = express();
const host: string = "localhost";
const port: number = 3000;
const stationsPath = path.join(process.cwd(), "stations.json");

// Types
type Station = {
	id: number;
	address: string;
	status: boolean;
};

// Middleware
app.use(express.json());
app.use(cors());

async function readFile() {
	const stations = await fs.readFile(stationsPath);
	const stationsStr = stations.toString();
	const result = JSON.parse(stationsStr);
	return result;
}
// listStations()
//  .then(data => console.log(data))
//  .catch(err => console.log(err.message));

async function writeFile(stations: Station) {
	await fs.writeFile(stationsPath, JSON.stringify(stations, null, 2));
}
async function add() {
	const x = { id: 11, address: "777 Collins Avenue. Worthington", status: true };
	let data = await readFile();

	console.log(data);
	data.push(x);
	console.log(data);
	writeFile(data);
}

// let stations: Station[] = [
// 	{
// 		id: 1,
// 		address: "690 Collins Avenue. Worthington",
// 		status: true,
// 	},
// 	{
// 		id: 2,
// 		address: "1234 Elm Street. Springfield",
// 		status: false,
// 	},
// 	{
// 		id: 3,
// 		address: "777 Pine Avenue. Lakeside",
// 		status: true,
// 	},
// 	{
// 		id: 4,
// 		address: "456 Oak Lane. Riverdale",
// 		status: false,
// 	},
// 	{
// 		id: 5,
// 		address: "1010 Maple Road. Hillcrest",
// 		status: true,
// 	},
// 	{
// 		id: 6,
// 		address: "2345 Cedar Court. Brookside",
// 		status: false,
// 	},
// 	{
// 		id: 7,
// 		address: "891 Birch Street. Lakeview",
// 		status: true,
// 	},
// 	{
// 		id: 8,
// 		address: "333 Pine Avenue. Sunset Hills",
// 		status: false,
// 	},
// 	{
// 		id: 9,
// 		address: "678 Walnut Drive. Green Valley",
// 		status: true,
// 	},
// 	{
// 		id: 10,
// 		address: "444 Ash Street. Riverside",
// 		status: false,
// 	},
// ];

let lastTemperatureValue = 36;
let lastDoseRateValue = 5;
let lastHumidityValue = 75;

// Routes
app.get("/stations", async (req: Request, res: Response) => {
	const stations = await readFile();

	res.send(stations);
});

app.get("/stations/:id", async (req: Request, res: Response) => {
	const stations = await readFile();

	const station: Station | undefined = stations.find(
		(st: Station) => st.id === parseInt(req.params.id)
	);

	if (!station) {
		res.status(404).json({ message: "Not Found" });
	}
	res.send(station);
});

app.post("/stations", async (req: Request, res: Response) => {
	let stations = await readFile();

	const station = req.body;
	const stationId = stations[stations.length - 1] ? stations[stations.length - 1].id + 1 : 1;
	const newStation = { id: stationId, ...station };

	stations.push(newStation);
	writeFile(stations);

	res.send(newStation);
});

app.delete("/stations/:id", async (req: Request, res: Response) => {
    let stations = await readFile();

	stations = stations.filter((st: Station) => st.id === parseInt(req.params.id));
	writeFile(stations);


	res.send("Station " + req.params.id + " has deleted");
});

app.put("/stations/:id", async (req: Request, res: Response) => {
    let stations = await readFile();

	const index = stations.findIndex((st: Station) => st.id === parseInt(req.params.id));
	stations[index] = {
		...stations[index],
		...req.body,
	};

    writeFile(stations);

	res.send(stations[index]);
});

app.get("/stations/:id/metrics", async (req: Request, res: Response) => {
    let stations = await readFile();

	const station: Station | undefined = stations.find(
		(st: Station) => st.id === parseInt(req.params.id)
	);
	if (!station) {
		res.status(404).send("Station not found");
	} else {
		if (!station.status) {
			res.send({
				temperature: 0,
				dose_rate: 0,
				humidity: 0,
			});
		} else {
			lastTemperatureValue = generateRandomNumbers(10, 60, lastTemperatureValue);
			lastDoseRateValue = generateRandomNumbers(0, 12, lastDoseRateValue);
			lastHumidityValue = generateRandomNumbers(30, 90, lastHumidityValue);

			res.send({
				temoerature: lastTemperatureValue,
				dose_rate: lastDoseRateValue,
				humidity: lastHumidityValue,
			});
		}
	}
});

// Start the server
app.listen(port, host, () => {
	console.log(`Server is running on http://${host}:${port}`);
});
app.use((req, res) => {
	res.status(404).json({ message: "Not found" });
});

function generateRandomNumbers(min: number, max: number, lastValue: number): number {
	if (lastValue === null) {
		// Generate a random number across the full range if no last value is provided
		return Math.floor(Math.random() * (max - min + 1)) + min;
	} else {
		// Calculate possible lower and upper bounds considering the last known value
		const low = Math.max(min, lastValue - 1);
		const high = Math.min(max, lastValue + 1);
		return Math.floor(Math.random() * (high - low + 1)) + low;
	}
}
