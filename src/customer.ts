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

server.get("/customers", async (request: any, reply) => {
  const param = request.query.ids;

  const query = `SELECT id, user_id, title, description, domain, poster, max_rooms, max_users,
        max_upload, disk_quota, domain_expire_time, iframe_expire_time, trademark_expire_time
     FROM skyroom_customers
     WHERE id IN (${param})`;

  const result = await pool.query(query);

  return result.rows;
});

server.listen(3004, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
