import fastify from "fastify";
import { Pool } from "pg";
import axios from "axios";
import { uniq } from "lodash";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "skyroom",
  user: "skyroom",
  password: "1571374",
});

const server = fastify();

const relations = [
  {
    table: "skyroom_connections",
    columns: [
      "id",
      "session_id",
      "user_id",
      "nickname",
      "client_id",
      "client_ip",
      "start_time",
      "stop_time",
      "duration",
      "status",
    ],
  },
  {
    table: "skyroom_sessions",
    columns: [
      "id",
      "customer_id",
      "service_id",
      "server_id",
      "channel_id",
      "start_time",
      "stop_time",
      "update_time",
      "duration",
      "participants",
      "time_usage",
    ],
  },
  {
    table: "skyroom_channels",
    columns: [
      "id",
      "customer_id",
      "service_id",
      "server_id",
      "name",
      "title",
      "description",
      "image",
      "password",
      "options",
      "is_public",
      "time_limit",
      "time_usage",
      "time_total",
      "max_users",
      "session_duration",
      "record",
      "status",
      "create_time",
      "update_time",
    ],
  },
  {
    table: "skyroom_services",
    columns: [
      "id",
      "customer_id",
      "default_server",
      "title",
      "description",
      "type",
      "simulcast",
      "user_limit",
      "video_limit",
      "time_limit",
      "time_additional",
      "time_usage",
      "time_total",
      "daily_time_limit",
      "daily_time_usage",
      "order_id",
      "status",
      "start_time",
      "stop_time",
      "time_limit_notification",
      "create_time",
      "update_time",
      "updated_by",
    ],
  },
  {
    table: "skyroom_customers",
    columns: [
      "id",
      "user_id",
      "title",
      "description",
      "domain",
      "poster",
      "max_rooms",
      "max_users",
      "max_upload",
      "disk_quota",
      "domain_expire_time",
      "iframe_expire_time",
      "trademark_expire_time",
    ],
  },
];

function makeSelectColumns(entry: any) {
  return entry.columns.map((col: string) => `${entry.table}.${col} AS ${entry.table}__${col}`);
}

server.get("/connections", async (request: any, reply) => {
  const relationsCount = Number(request.query.relations);

  const selectColumns = [];
  const joins = [];
  selectColumns.push(...makeSelectColumns(relations[0]));

  if (relationsCount >= 1) {
    selectColumns.push(...makeSelectColumns(relations[1]));
    joins.push(
      "LEFT JOIN skyroom_sessions ON skyroom_sessions.id = skyroom_connections.session_id"
    );
  }

  if (relationsCount >= 2) {
    selectColumns.push(...makeSelectColumns(relations[2]));
    joins.push(
      "LEFT JOIN skyroom_channels ON skyroom_channels.id = skyroom_sessions.channel_id"
    );
  }

  if (relationsCount >= 3) {
    selectColumns.push(...makeSelectColumns(relations[3]));
    joins.push(
      "LEFT JOIN skyroom_services ON skyroom_services.id = skyroom_channels.service_id"
    );
  }

  if (relationsCount >= 4) {
    selectColumns.push(...makeSelectColumns(relations[4]));
    joins.push(
      "LEFT JOIN skyroom_customers ON skyroom_customers.id = skyroom_channels.customer_id"
    );
  }

  const query = `SELECT ${selectColumns.join(", ")}
      FROM skyroom_connections ${joins.join("\n")}
      ORDER BY skyroom_connections.id DESC
      LIMIT 320`;

  const result = await pool.query(query);

  return result.rows;
});

server.listen(3010, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
