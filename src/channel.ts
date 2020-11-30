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

server.get("/channels", async (request: any, reply) => {
  const param = request.query.ids;

  const query = `SELECT id, customer_id, service_id, server_id, name, title, description, image, password, options,
        is_public, time_limit, time_usage, time_total, max_users, session_duration, record, status, create_time,
        update_time
     FROM skyroom_channels
     WHERE id IN (${param})`;

  const result = await pool.query(query);

  return result.rows;
});

server.listen(3002, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
