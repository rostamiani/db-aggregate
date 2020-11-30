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

server.get("/services", async (request: any, reply) => {
  const param = request.query.ids;

  const query = `SELECT id, customer_id, default_server, title, description, type, simulcast, user_limit, video_limit,
        time_limit, time_additional, time_usage, time_total, daily_time_limit, daily_time_usage, order_id, status,
        start_time, stop_time, time_limit_notification, create_time, update_time, updated_by
     FROM skyroom_services
     WHERE id IN (${param})`;

  const result = await pool.query(query);

  return result.rows;
});

server.listen(3003, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
