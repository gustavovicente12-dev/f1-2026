const fs = require('fs');
const path = require('path');

const PAT = process.argv[2];
if (!PAT) {
  console.error('Uso: node db/run-schema.js <PERSONAL_ACCESS_TOKEN>');
  process.exit(1);
}

const PROJECT_REF = 'qgvezkwjwhrmbqdxbzcj';
const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

async function runSchema() {
  console.log('Ejecutando schema en Supabase...\n');

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('HTTP Status:', res.status);
    console.error('Respuesta:', JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log('Schema ejecutado correctamente.');
  console.log(JSON.stringify(data, null, 2));
}

runSchema().catch(err => {
  console.error('Error inesperado:', err.message);
  process.exit(1);
});
