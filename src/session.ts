import fastify from "fastify";
import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: 'skyroom',
  user: "skyroom",
  password: "1571374",
});

const server = fastify();

server.get("/sessions", async (request: any, reply) => {
  const param = request.query.ids;

  const query = `SELECT id, customer_id, service_id, server_id, channel_id, start_time, stop_time, update_time,
        duration, participants, time_usage
     FROM skyroom_sessions
     WHERE id IN (${param})`;

  const result = await pool.query(query);

  return result.rows;
});

server.listen(3001, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
