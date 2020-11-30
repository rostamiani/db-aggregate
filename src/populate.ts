import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "skyroom",
  user: "skyroom",
  password: "1571374",
});

function randomPassedDate() {
  return Math.floor(
    (Math.floor(Math.random() * 31536000000) + (Date.now() - 41536000000)) /
      1000
  );
}

function randomFutureDate() {
  return Math.floor(
    (Math.floor(Math.random() * 31536000000) + Date.now()) / 1000
  );
}

function random(scale: number) {
  return Math.floor(Math.random() * scale);
}

function collection(size: number) {
  return Array(size).fill(0);
}

(async function run() {
  try {
    await Promise.all(
      collection(10).map((_, idx) => createCustomerAndSub(idx))
    );
    console.log("Done");
  } catch (e) {
    console.log("Error");
  }
})();

const requestRandom = random(9999999);

async function createCustomerAndSub(idx: number) {
  const userResult = await pool.query(
    `
        INSERT INTO users (domain, username)
            VALUES ($1, $2)
            RETURNING id`,
    [0, `user-${idx}-${requestRandom}-${random(9999999)}`]
  );

  const userId = userResult.rows[0].id;

  const result = await pool.query(
    `INSERT INTO skyroom_customers (user_id, title, domain, domain_expire_time,
                    iframe_expire_time, trademark_expire_time)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id`,
    [
      userId,
      `Customer #${idx}`,
      `https://customer-${userId}.com/`,
      randomFutureDate(),
      randomFutureDate(),
      randomFutureDate(),
    ]
  );

  const customerId = result.rows[0].id;
  return await Promise.all(
    collection(2).map((_, idx) => createServiceAndSub(customerId, idx))
  );
}

async function createServiceAndSub(customerId: number, idx: number) {
  const result = await pool.query(
    `INSERT INTO skyroom_services (customer_id, title, user_limit, default_server)
                    VALUES ($1, $2, $3, 0)
                    RETURNING id`,
    [customerId, `Service #${idx}`, 500]
  );

  const serviceId = result.rows[0].id;
  return await Promise.all(
    collection(2).map((_, idx) =>
      createChannelAndSub(serviceId, customerId, idx)
    )
  );
}

async function createChannelAndSub(
  serviceId: number,
  customerId: number,
  idx: number
) {
  const result = await pool.query(
    `INSERT INTO skyroom_channels (customer_id, service_id, name, title)
                        VALUES ($1, $2, $3, $4)
                        RETURNING id`,
    [
      customerId,
      serviceId,
      `channel-#${idx}-of-${serviceId}`,
      `Channel #${idx}`,
    ]
  );

  const channelId = result.rows[0].id;
  return await Promise.all(
    collection(2).map((_, idx) =>
      createSessionAndSub(channelId, serviceId, customerId, idx)
    )
  );
}

async function createSessionAndSub(
  channelId: number,
  serviceId: number,
  customerId: number,
  idx: number
) {
  const result = await pool.query(
    `INSERT INTO skyroom_sessions (customer_id, service_id, channel_id, start_time)
                        VALUES ($1, $2, $3, $4)
                        RETURNING id`,
    [customerId, serviceId, channelId, randomPassedDate()]
  );

  const sessionId = result.rows[0].id;
  return await Promise.all(
    collection(4).map((_, idx) => createConnectionAndSub(sessionId, idx))
  );
}

async function createConnectionAndSub(sessionId: number, idx: number) {
  const result = await pool.query(
    `INSERT INTO skyroom_connections (session_id, nickname, start_time)
                        VALUES ($1, $2, $3)
                        RETURNING id`,
    [sessionId, `Attendee ${idx} of session #${sessionId}`, randomPassedDate()]
  );

  return result.rows[0];
}
