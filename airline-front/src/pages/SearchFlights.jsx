import { useState } from "react";
import { searchFlights } from "../api/flights";
import { Container, TextField, Button, Typography, Card, CardContent } from "@mui/material";

export default function SearchFlights() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);

  const search = async () => {
    const res = await searchFlights(origin, destination, date);
    setResults(res.data);
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 3 }}>
        Buscar Vuelos
      </Typography>

      <TextField label="Origen" value={origin} onChange={(e) => setOrigin(e.target.value)} sx={{ mr: 2 }} />
      <TextField label="Destino" value={destination} onChange={(e) => setDestination(e.target.value)} sx={{ mr: 2 }} />
      <TextField type="date" value={date} onChange={(e) => setDate(e.target.value)} sx={{ mr: 2 }} />

      <Button variant="contained" onClick={search}>Buscar</Button>

      <div style={{ marginTop: 20 }}>
        {results.map((f) => (
          <Card key={f.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">
                {f.flight_number} — {f.origin} → {f.destination}
              </Typography>
              <Typography>Precio: ${f.price}</Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}