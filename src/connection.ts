import fastify from "fastify";
import { Pool } from "pg";
import axios from "axios";
import { uniq } from 'lodash';

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: 'skyroom',
  user: "skyroom",
  password: "1571374",
});

const server = fastify();

server.get("/connections", async (request: any, reply) => {
  const relations = Number(request.query.relations);

  const queryResult = await pool.query(`SELECT id, session_id, user_id, nickname, client_id,
      client_ip, start_time, stop_time, duration, status
    FROM skyroom_connections
    ORDER BY id DESC
    LIMIT 320`);

  const connections = queryResult.rows;

  if (relations >= 1) {
    const sessionIds = uniq(connections.map((c) => c.session_id));
    const { data: sessions } = await axios.get(
        `http://localhost:3001/sessions?ids=${sessionIds.join(",")}`
    );

    connections.forEach((c) => {
      c.session = sessions.find((s: any) => s.id === c.session_id);
    });
  }

  if (relations >= 2) {
    const channelIds = uniq(connections.map((c) => c.session.channel_id));
    const { data: channels } = await axios.get(
        `http://localhost:3002/channels?ids=${channelIds.join(",")}`
    );

    connections.forEach((c) => {
      c.session.channel = channels.find((ch: any) => ch.id === c.session.channel_id);
    });
  }

  if (relations >= 3) {
    const serviceIds = uniq(connections.map((c) => c.session.channel.service_id));
    const { data: services } = await axios.get(
        `http://localhost:3003/services?ids=${serviceIds.join(",")}`
    );

    connections.forEach((c) => {
      c.session.channel.service = services.find((s: any) => s.id === c.session.channel.service_id);
    });
  }

  if (relations >= 4) {
    const customerIds = uniq(connections.map((c) => c.session.channel.customer_id));
    const { data: customers } = await axios.get(
        `http://localhost:3004/customers?ids=${customerIds.join(",")}`
    );

    connections.forEach((c) => {
      c.session.channel.customer = customers.find((cu: any) => cu.id === c.session.channel.customer_id);
    });
  }

  return connections;
});

server.listen(3000, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
